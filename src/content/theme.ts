export const THEME_INK = '#30284A';
export const THEME_ON_ACCENT = '#FFFFFF';

export interface CompanionThemeTokens {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  pageTint: string;
  glowPrimary: string;
  glowSecondary: string;
}

export const DEFAULT_COMPANION_THEME: CompanionThemeTokens = {
  accent: '#5C3DF5',
  accentStrong: '#3F25CC',
  accentSoft: '#EEEAFF',
  pageTint: '#FFF8EE',
  glowPrimary: '#EEE7FF',
  glowSecondary: '#FFE6C7',
};

export function companionThemeCssVariables(
  theme: CompanionThemeTokens,
): Record<`--theme-${string}`, string> {
  return {
    '--theme-accent': theme.accent,
    '--theme-accent-strong': theme.accentStrong,
    '--theme-accent-soft': theme.accentSoft,
    '--theme-page': theme.pageTint,
    '--theme-glow-primary': theme.glowPrimary,
    '--theme-glow-secondary': theme.glowSecondary,
  };
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function themeContrastIssues(theme: CompanionThemeTokens): string[] {
  const issues: string[] = [];
  const checks = [
    ['accent with white text', theme.accent, THEME_ON_ACCENT, 4.5],
    ['strong accent with white text', theme.accentStrong, THEME_ON_ACCENT, 4.5],
    ['soft accent with interface text', theme.accentSoft, THEME_INK, 4.5],
    ['page tint with interface text', theme.pageTint, THEME_INK, 4.5],
    ['accent focus ring against the page tint', theme.accent, theme.pageTint, 3],
  ] as const;

  for (const [label, foreground, background, minimum] of checks) {
    const ratio = contrastRatio(foreground, background);
    if (ratio < minimum)
      issues.push(`${label} has ${ratio.toFixed(2)}:1 contrast; needs ${minimum}:1`);
  }

  return issues;
}
