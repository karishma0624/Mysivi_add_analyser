import type { AdLeaderboardRow } from './types';

export interface ScoreBreakdown {
  /** Normalized 0-1 value of creative quality */
  creative01: number;
  /** Normalized 0-1 value of longevity */
  longevity01: number;
  /** Normalized 0-1 value of iteration */
  iteration01: number;

  /** Creative contribution points out of 100 (0.40 * creative * 100, max 40) */
  creativePts: number;
  /** Longevity contribution points out of 100 (0.35 * longevity * 100, max 35) */
  longevityPts: number;
  /** Iteration contribution points out of 100 (0.25 * iteration * 100, max 25) */
  iterationPts: number;

  /** Overall composite score on a 0-100 scale (exact sum of the 3 contributions) */
  composite100: number;
}

/**
 * Normalizes a score value to a 0-1 scale.
 * Handles both 0-1 scale (standard) and legacy 0-10 scale (val > 1 ? val / 10 : val).
 */
export function normalize0to1(val: number | null | undefined): number {
  if (val == null || !Number.isFinite(Number(val))) return 0;
  const num = Number(val);
  if (num <= 0) return 0;
  if (num > 1) {
    return Math.min(num / 10, 1);
  }
  return Math.min(num, 1);
}

/**
 * Calculates the 0-100 composite score and the three weighted contributions out of 100.
 * Guarantees that creativePts + longevityPts + iterationPts strictly equals composite100.
 */
export function calculateScoreBreakdown(
  ad: Partial<AdLeaderboardRow> | null | undefined
): ScoreBreakdown {
  if (!ad) {
    return {
      creative01: 0,
      longevity01: 0,
      iteration01: 0,
      creativePts: 0,
      longevityPts: 0,
      iterationPts: 0,
      composite100: 0,
    };
  }

  // 1. Creative Quality 0-1
  let creative01 = normalize0to1(ad.creative_quality_score);
  if (
    creative01 === 0 &&
    (ad.hook_score != null ||
      ad.clarity_score != null ||
      ad.cta_strength_score != null ||
      ad.visual_appeal_score != null ||
      ad.offer_strength_score != null)
  ) {
    const subSum =
      (ad.hook_score || 0) +
      (ad.clarity_score || 0) +
      (ad.cta_strength_score || 0) +
      (ad.visual_appeal_score || 0) +
      (ad.offer_strength_score || 0);
    creative01 = normalize0to1(subSum / 5);
  }

  // 2. Longevity 0-1
  let longevity01 = normalize0to1(ad.longevity_score);
  if (longevity01 === 0 && ad.longevity_days && ad.longevity_days > 0) {
    longevity01 = Math.min(ad.longevity_days / 90, 1);
  }

  // 3. Iteration 0-1
  let iteration01 = 0;
  if (ad.iteration_score != null) {
    iteration01 = normalize0to1(ad.iteration_score);
  } else if (ad.has_multiple_versions != null) {
    iteration01 = ad.has_multiple_versions ? 1 : 0;
  }

  // 4. Weighted point contributions out of 100, rounded to 1 decimal place
  const creativePts = Math.round(0.40 * creative01 * 100 * 10) / 10;
  const longevityPts = Math.round(0.35 * longevity01 * 100 * 10) / 10;
  const iterationPts = Math.round(0.25 * iteration01 * 100 * 10) / 10;

  // Composite is the exact sum of the 3 points to strictly preserve mathematical equality
  const composite100 = Math.round((creativePts + longevityPts + iterationPts) * 10) / 10;

  return {
    creative01,
    longevity01,
    iteration01,
    creativePts,
    longevityPts,
    iterationPts,
    composite100,
  };
}

/**
 * Formats a subscore (0-10) as "x/10".
 */
export function formatSubscore(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(Number(score))) return '0.0/10';
  const num = Number(score);
  return `${num.toFixed(1)}/10`;
}
