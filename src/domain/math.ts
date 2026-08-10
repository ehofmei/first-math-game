import type { RandomSource } from './random';
import {
  composeMultiplicationDivisionFacts,
  type ComposedFact,
  type ComposedOperation,
} from './composition';

export const OPERATION_IDS = ['addition', 'subtraction', 'multiplication', 'division'] as const;
export type OperationId = (typeof OPERATION_IDS)[number];

export const DIFFICULTY_IDS = ['easy', 'medium', 'hard', 'advanced'] as const;
export type DifficultyId = (typeof DIFFICULTY_IDS)[number];

export const QUESTION_COUNTS = [10, 20, 30, 50] as const;
export type QuestionCount = (typeof QUESTION_COUNTS)[number];

export const OPERATION_SYMBOLS: Record<OperationId, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export const OPERATION_LABELS: Record<OperationId, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
};

export const DIFFICULTY_LABELS: Record<DifficultyId, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  advanced: 'Advanced',
};

export interface GameSettings {
  operations: OperationId[];
  difficulty: DifficultyId;
  questionCount: QuestionCount;
}

export interface Problem {
  id: string;
  operation: OperationId;
  left: number;
  right: number;
  correctAnswer: number;
  choices: number[];
  correctChoiceIndex: number;
  skillKey: string;
}

interface DifficultyRules {
  additionOperandMax: number;
  additionSumMax: number;
  subtractionOperandMax: number;
  allowNegativeSubtraction: boolean;
  multiplicationTables: readonly number[];
  multiplicationFactorMax: number;
  divisionTables: readonly number[];
  divisionQuotientMax: number;
}

export const DIFFICULTY_RULES: Record<DifficultyId, DifficultyRules> = {
  easy: {
    additionOperandMax: 10,
    additionSumMax: 20,
    subtractionOperandMax: 20,
    allowNegativeSubtraction: false,
    multiplicationTables: [0, 1, 2, 5, 10],
    multiplicationFactorMax: 10,
    divisionTables: [1, 2, 5, 10],
    divisionQuotientMax: 10,
  },
  medium: {
    additionOperandMax: 50,
    additionSumMax: 100,
    subtractionOperandMax: 100,
    allowNegativeSubtraction: false,
    multiplicationTables: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    multiplicationFactorMax: 10,
    divisionTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    divisionQuotientMax: 10,
  },
  hard: {
    additionOperandMax: 500,
    additionSumMax: 1_000,
    subtractionOperandMax: 1_000,
    allowNegativeSubtraction: false,
    multiplicationTables: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    multiplicationFactorMax: 12,
    divisionTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    divisionQuotientMax: 12,
  },
  advanced: {
    additionOperandMax: 5_000,
    additionSumMax: 10_000,
    subtractionOperandMax: 1_000,
    allowNegativeSubtraction: true,
    multiplicationTables: Array.from({ length: 21 }, (_, index) => index),
    multiplicationFactorMax: 20,
    divisionTables: Array.from({ length: 20 }, (_, index) => index + 1),
    divisionQuotientMax: 20,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  operations: ['addition', 'subtraction'],
  difficulty: 'medium',
  questionCount: 10,
};

export function additionSkillKey(left: number, right: number): string {
  return `addition:${Math.min(left, right)}+${Math.max(left, right)}`;
}

export function multiplicationSkillKey(left: number, right: number): string {
  return `multiplication:${Math.min(left, right)}×${Math.max(left, right)}`;
}

export function formatProblem(problem: Pick<Problem, 'left' | 'right' | 'operation'>): string {
  return `${problem.left} ${OPERATION_SYMBOLS[problem.operation]} ${problem.right}`;
}

function buildChoices(
  correctAnswer: number,
  plausible: readonly number[],
  minimum: number,
  maximum: number,
  random: RandomSource,
): number[] {
  const candidates = new Set<number>();
  const add = (candidate: number) => {
    if (
      Number.isInteger(candidate) &&
      candidate >= minimum &&
      candidate <= maximum &&
      candidate !== correctAnswer
    ) {
      candidates.add(candidate);
    }
  };

  for (const candidate of random.shuffle([...plausible])) add(candidate);
  for (const offset of random.shuffle([-100, -10, -5, -2, -1, 1, 2, 5, 10, 100])) {
    add(correctAnswer + offset);
    if (candidates.size >= 3) break;
  }
  for (let distance = 1; candidates.size < 3; distance += 1) {
    add(correctAnswer - distance);
    add(correctAnswer + distance);
  }

  return random.shuffle([correctAnswer, ...random.shuffle([...candidates]).slice(0, 3)]);
}

function createProblem(
  operation: OperationId,
  left: number,
  right: number,
  correctAnswer: number,
  skillKey: string,
  plausible: readonly number[],
  minimum: number,
  maximum: number,
  random: RandomSource,
): Problem {
  const choices = buildChoices(correctAnswer, plausible, minimum, maximum, random);
  return {
    id: `${operation}:${left}:${right}`,
    operation,
    left,
    right,
    correctAnswer,
    choices,
    correctChoiceIndex: choices.indexOf(correctAnswer),
    skillKey,
  };
}

export function generateAdditionProblem(
  random: RandomSource,
  difficulty: DifficultyId = 'easy',
): Problem {
  const rules = DIFFICULTY_RULES[difficulty];
  const left = random.integer(0, rules.additionOperandMax);
  const right = random.integer(0, Math.min(rules.additionOperandMax, rules.additionSumMax - left));
  const correctAnswer = left + right;
  return createProblem(
    'addition',
    left,
    right,
    correctAnswer,
    additionSkillKey(left, right),
    [correctAnswer - 1, correctAnswer + 1, left - right, left + right + 10],
    0,
    rules.additionSumMax + 100,
    random,
  );
}

export function generateSubtractionProblem(
  random: RandomSource,
  difficulty: DifficultyId,
): Problem {
  const rules = DIFFICULTY_RULES[difficulty];
  let left = random.integer(0, rules.subtractionOperandMax);
  let right = random.integer(0, rules.subtractionOperandMax);
  if (!rules.allowNegativeSubtraction && right > left) [left, right] = [right, left];
  const correctAnswer = left - right;
  const minimum = rules.allowNegativeSubtraction ? -rules.subtractionOperandMax : 0;
  return createProblem(
    'subtraction',
    left,
    right,
    correctAnswer,
    `subtraction:${left}−${right}`,
    [correctAnswer - 1, correctAnswer + 1, right - left, left + right],
    minimum,
    rules.subtractionOperandMax * 2,
    random,
  );
}

export function generateMultiplicationProblem(
  random: RandomSource,
  difficulty: DifficultyId,
): Problem {
  const rules = DIFFICULTY_RULES[difficulty];
  const left = random.pick(rules.multiplicationTables);
  const right = random.integer(0, rules.multiplicationFactorMax);
  const correctAnswer = left * right;
  const maximum = Math.max(
    30,
    Math.max(...rules.multiplicationTables) * rules.multiplicationFactorMax + 20,
  );
  return createProblem(
    'multiplication',
    left,
    right,
    correctAnswer,
    multiplicationSkillKey(left, right),
    [left * (right - 1), left * (right + 1), left + right, correctAnswer + right],
    0,
    maximum,
    random,
  );
}

export function generateDivisionProblem(random: RandomSource, difficulty: DifficultyId): Problem {
  const rules = DIFFICULTY_RULES[difficulty];
  const right = random.pick(rules.divisionTables);
  const quotient = random.integer(0, rules.divisionQuotientMax);
  const left = right * quotient;
  return createProblem(
    'division',
    left,
    right,
    quotient,
    `division:${left}÷${right}`,
    [quotient - 1, quotient + 1, quotient + right, right, left - right],
    0,
    Math.max(30, rules.divisionQuotientMax + Math.max(...rules.divisionTables) + 10),
    random,
  );
}

function createComposedProblem(
  fact: ComposedFact,
  difficulty: DifficultyId,
  random: RandomSource,
): Problem {
  const rules = DIFFICULTY_RULES[difficulty];
  if (fact.operation === 'multiplication') {
    let left = fact.firstFactor;
    let right = fact.secondFactor;
    if (left !== right && random.integer(0, 1) === 1) [left, right] = [right, left];
    const correctAnswer = left * right;
    const maximum = Math.max(
      30,
      Math.max(...rules.multiplicationTables) * rules.multiplicationFactorMax + 20,
    );
    return createProblem(
      'multiplication',
      left,
      right,
      correctAnswer,
      fact.skillKey,
      [left * (right - 1), left * (right + 1), left + right, correctAnswer + right],
      0,
      maximum,
      random,
    );
  }

  const divisor = fact.firstFactor;
  const quotient = fact.secondFactor;
  const dividend = divisor * quotient;
  return createProblem(
    'division',
    dividend,
    divisor,
    quotient,
    fact.skillKey,
    [quotient - 1, quotient + 1, quotient + divisor, divisor, dividend - divisor],
    0,
    Math.max(30, rules.divisionQuotientMax + Math.max(...rules.divisionTables) + 10),
    random,
  );
}

export function generateProblem(
  operation: OperationId,
  difficulty: DifficultyId,
  random: RandomSource,
): Problem {
  switch (operation) {
    case 'addition':
      return generateAdditionProblem(random, difficulty);
    case 'subtraction':
      return generateSubtractionProblem(random, difficulty);
    case 'multiplication':
      return generateMultiplicationProblem(random, difficulty);
    case 'division':
      return generateDivisionProblem(random, difficulty);
  }
}

export function generateSession(settings: GameSettings, random: RandomSource): Problem[] {
  const operations = [...new Set(settings.operations)];
  if (operations.length === 0) throw new Error('At least one operation is required.');

  const operationSchedule = random.shuffle(
    Array.from(
      { length: settings.questionCount },
      (_, index) => operations[index % operations.length]!,
    ),
  );
  const composedOperations = operationSchedule.filter(
    (operation): operation is ComposedOperation =>
      operation === 'multiplication' || operation === 'division',
  );
  const composedFacts = composeMultiplicationDivisionFacts(
    composedOperations,
    settings.difficulty,
    DIFFICULTY_RULES[settings.difficulty],
    random,
  );
  let composedIndex = 0;
  const problems: Problem[] = [];
  const used = new Set<string>();

  for (const operation of operationSchedule) {
    if (operation === 'multiplication' || operation === 'division') {
      const fact = composedFacts[composedIndex++];
      if (!fact) throw new Error('The composed fact schedule was incomplete.');
      const problem = createComposedProblem(fact, settings.difficulty, random);
      used.add(problem.skillKey);
      problems.push({ ...problem, id: `q${problems.length + 1}:${problem.id}` });
      continue;
    }
    let problem = generateProblem(operation, settings.difficulty, random);
    let attempts = 0;
    while (used.has(problem.skillKey) && attempts < 200) {
      problem = generateProblem(operation, settings.difficulty, random);
      attempts += 1;
    }
    used.add(problem.skillKey);
    problems.push({ ...problem, id: `q${problems.length + 1}:${problem.id}` });
  }

  return problems;
}
