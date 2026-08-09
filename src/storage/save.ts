import { z } from 'zod';
import { DEFAULT_SETTINGS, DIFFICULTY_IDS, OPERATION_IDS, type GameSettings } from '../domain/math';
import { DAILY_COIN_CAP } from '../domain/rewards';
import type { AnswerRecord, SessionSummary } from '../domain/session';

const settingsSchema = z.object({
  operations: z
    .array(z.enum(OPERATION_IDS))
    .min(1)
    .max(OPERATION_IDS.length)
    .refine((operations) => new Set(operations).size === operations.length, {
      message: 'Selected operations must be unique.',
    }),
  difficulty: z.enum(DIFFICULTY_IDS),
  questionCount: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(50)]),
});

const legacyAnswerSchema = z.object({
  problemId: z.string(),
  skillKey: z.string(),
  selectedAnswer: z.number(),
  correctAnswer: z.number(),
  correct: z.boolean(),
  responseMs: z.number().nonnegative(),
});

const answerSchema = legacyAnswerSchema.extend({
  operation: z.enum(OPERATION_IDS),
  left: z.number().int(),
  right: z.number().int(),
  choices: z.array(z.number().int()).max(4),
  correctChoiceIndex: z.number().int().min(-1).max(3),
});

const legacySessionFields = {
  id: z.string(),
  completedAt: z.string(),
  settings: settingsSchema,
  seed: z.number().int(),
  correctCount: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1),
  elapsedMs: z.number().nonnegative(),
  score: z.number().nonnegative(),
  coinsEarned: z.number().int().nonnegative(),
};

const legacySessionSchema = z.object({
  ...legacySessionFields,
  answers: z.array(legacyAnswerSchema).min(1),
});

const sessionSchema = z.object({
  ...legacySessionFields,
  rulesetVersion: z.number().int().positive(),
  coinsPotential: z.number().int().nonnegative(),
  answers: z.array(answerSchema).min(1),
});

const economyEventSchema = z.object({
  id: z.string(),
  occurredAt: z.string(),
  type: z.literal('capsule_opened'),
  coinsSpent: z.number().int().positive(),
  collectibleId: z.string(),
});

function commonSaveFields<T extends z.ZodType>(sessions: T) {
  return {
    player: z.object({
      name: z.string().min(1).max(30),
    }),
    settings: settingsSchema,
    coins: z.number().int().nonnegative(),
    ownedCollectibleIds: z.array(z.string()),
    equippedCollectibleId: z.string(),
    sessions: z.array(sessions).max(100),
  };
}

const legacySaveV1Schema = z.object({
  schemaVersion: z.literal(1),
  ...commonSaveFields(legacySessionSchema),
});

const legacySaveV2Schema = z.object({
  schemaVersion: z.literal(2),
  ...commonSaveFields(legacySessionSchema),
  dailyCoins: z.object({
    date: z.string(),
    earned: z.number().int().min(0).max(DAILY_COIN_CAP),
  }),
});

export const saveSchema = z.object({
  schemaVersion: z.literal(3),
  ...commonSaveFields(sessionSchema),
  dailyCoins: z.object({
    date: z.string(),
    earned: z.number().int().min(0).max(DAILY_COIN_CAP),
  }),
  economyEvents: z.array(economyEventSchema).max(500),
});

export type SaveData = z.infer<typeof saveSchema>;

function enrichLegacyAnswer(answer: z.infer<typeof legacyAnswerSchema>): AnswerRecord {
  const structured = answer.problemId.match(
    /^q\d+:(addition|subtraction|multiplication|division):(-?\d+):(-?\d+)$/,
  );
  const legacyAddition = answer.problemId.match(/^q\d+:(-?\d+)\+(-?\d+)$/);
  const operationCandidate = structured?.[1] ?? answer.skillKey.split(':')[0];
  const operation = OPERATION_IDS.find((value) => value === operationCandidate) ?? 'addition';
  const left = Number(structured?.[2] ?? legacyAddition?.[1] ?? 0);
  const right = Number(structured?.[3] ?? legacyAddition?.[2] ?? 0);
  return {
    ...answer,
    operation,
    left,
    right,
    choices: [],
    correctChoiceIndex: -1,
  };
}

function enrichLegacySession(session: z.infer<typeof legacySessionSchema>): SessionSummary {
  return {
    ...session,
    rulesetVersion: 1,
    coinsPotential: session.coinsEarned,
    answers: session.answers.map(enrichLegacyAnswer),
  };
}

export function createInitialSave(name: string, starterId: string): SaveData {
  return {
    schemaVersion: 3,
    player: { name: name.trim() },
    settings: DEFAULT_SETTINGS,
    coins: 0,
    dailyCoins: { date: '', earned: 0 },
    economyEvents: [],
    ownedCollectibleIds: [starterId],
    equippedCollectibleId: starterId,
    sessions: [],
  };
}

export function dailyCoinsRemaining(save: SaveData, date: string): number {
  const earned = save.dailyCoins.date === date ? save.dailyCoins.earned : 0;
  return Math.max(0, DAILY_COIN_CAP - earned);
}

export function applyCompletedSession(
  save: SaveData,
  summary: SessionSummary,
  date: string,
): SaveData {
  if (save.sessions.some((session) => session.id === summary.id)) return save;
  const earnedBeforeSession = save.dailyCoins.date === date ? save.dailyCoins.earned : 0;
  const coinsEarned = Math.min(summary.coinsPotential, DAILY_COIN_CAP - earnedBeforeSession);
  const storedSummary = { ...summary, coinsEarned };
  return {
    ...save,
    coins: save.coins + coinsEarned,
    dailyCoins: { date, earned: earnedBeforeSession + coinsEarned },
    sessions: [...save.sessions, storedSummary].slice(-100),
  };
}

export function updateSettings(save: SaveData, settings: GameSettings): SaveData {
  return { ...save, settings };
}

export interface SaveRepository {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
  export(data: SaveData): string;
  parseImport(serialized: string): SaveData;
}

export class LocalStorageSaveRepository implements SaveRepository {
  static readonly key = 'first-math-game:save';

  load(): Promise<SaveData | null> {
    const serialized = localStorage.getItem(LocalStorageSaveRepository.key);
    if (!serialized) return Promise.resolve(null);
    return Promise.resolve(this.parseImport(serialized));
  }

  save(data: SaveData): Promise<void> {
    localStorage.setItem(LocalStorageSaveRepository.key, this.export(data));
    return Promise.resolve();
  }

  export(data: SaveData): string {
    return JSON.stringify(saveSchema.parse(data), null, 2);
  }

  parseImport(serialized: string): SaveData {
    const input = JSON.parse(serialized) as unknown;
    const current = saveSchema.safeParse(input);
    if (current.success) return current.data;

    const legacyV2 = legacySaveV2Schema.safeParse(input);
    if (legacyV2.success) {
      return {
        ...legacyV2.data,
        schemaVersion: 3,
        economyEvents: [],
        sessions: legacyV2.data.sessions.map(enrichLegacySession),
      };
    }

    const legacyV1 = legacySaveV1Schema.parse(input);
    return {
      ...legacyV1,
      schemaVersion: 3,
      dailyCoins: { date: '', earned: 0 },
      economyEvents: [],
      sessions: legacyV1.sessions.map(enrichLegacySession),
    };
  }
}
