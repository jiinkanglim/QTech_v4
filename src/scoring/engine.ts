import {
  Scorecard,
  ScorecardComputed,
  ScorecardItemEntry,
  ScorecardTemplateId,
  ScoringSettings,
  RagValue,
} from '../types';
import { SCORECARD_TEMPLATES } from './templates';

export const DEFAULT_SCORING_SETTINGS: ScoringSettings = {
  sweAmberFrom: 1.5,
  sweGreenFrom: 2.5,
  defaultCadence: 'weekly',
};

/**
 * Numeric cost per RAG value.
 * G = 3, A = 2, R = 1. NA and null/blank are excluded (return null).
 */
export function ragCost(v: RagValue | null | undefined): number | null {
  if (v === 'G') return 3;
  if (v === 'A') return 2;
  if (v === 'R') return 1;
  return null;
}

/**
 * Maps an average score to G/A/R band using ScoringSettings.
 * avg < sweAmberFrom -> 'R'
 * avg < sweGreenFrom -> 'A'
 * else -> 'G'
 */
export function bandSwe(
  avg: number | null,
  s: ScoringSettings = DEFAULT_SCORING_SETTINGS
): 'G' | 'A' | 'R' | null {
  if (avg === null || isNaN(avg)) return null;
  if (avg < s.sweAmberFrom) return 'R';
  if (avg < s.sweGreenFrom) return 'A';
  return 'G';
}

/**
 * Helper to map ORS average value (1 to 3) to G/A/R status:
 * statusValue = Math.round(Math.max(val, 1) - 0.01) -> 1 R, 2 A, 3 G (ties round down, e.g. 2.5 -> A)
 */
function orsValueToRag(val: number | null): 'G' | 'A' | 'R' | null {
  if (val === null || isNaN(val)) return null;
  const rounded = Math.round(Math.max(val, 1) - 0.01);
  if (rounded >= 3) return 'G';
  if (rounded === 2) return 'A';
  return 'R';
}

/**
 * Compute SWE Model Scoring Sheet metrics and overall RAG.
 */
export function computeSwe(
  entries: ScorecardItemEntry[],
  s: ScoringSettings = DEFAULT_SCORING_SETTINGS
): ScorecardComputed {
  const template = SCORECARD_TEMPLATES.SWE_MODEL;
  const categoriesRecord: Record<string, { value: number | null; rag: 'G' | 'A' | 'R' | null }> = {};

  const reviewCategoryValues: number[] = [];
  const metricsCategoryValues: number[] = [];

  let totalItemsCount = 0;
  let scoredItemsCount = 0;

  for (const cat of template.categories) {
    const catEntries = entries.filter((e) => e.categoryId === cat.id);
    totalItemsCount += Math.max(cat.items.length, catEntries.length);

    const validCosts: number[] = [];
    for (const entry of catEntries) {
      if (entry.value !== null && entry.value !== undefined) {
        scoredItemsCount++;
        const cost = ragCost(entry.value);
        if (cost !== null) {
          validCosts.push(cost);
        }
      }
    }

    if (validCosts.length === 0) {
      categoriesRecord[cat.id] = { value: null, rag: null };
    } else {
      const avg = validCosts.reduce((a, b) => a + b, 0) / validCosts.length;
      categoriesRecord[cat.id] = { value: avg, rag: bandSwe(avg, s) };

      if (cat.part === 'REVIEW') {
        reviewCategoryValues.push(avg);
      } else if (cat.part === 'METRICS') {
        metricsCategoryValues.push(avg);
      }
    }
  }

  const reviewAvg =
    reviewCategoryValues.length > 0
      ? reviewCategoryValues.reduce((a, b) => a + b, 0) / reviewCategoryValues.length
      : null;
  const reviewRag = bandSwe(reviewAvg, s);

  const metricsAvg =
    metricsCategoryValues.length > 0
      ? metricsCategoryValues.reduce((a, b) => a + b, 0) / metricsCategoryValues.length
      : null;
  const metricsRag = bandSwe(metricsAvg, s);

  const nonNullParts = [reviewAvg, metricsAvg].filter((v): v is number => v !== null);
  const overallValue =
    nonNullParts.length > 0
      ? nonNullParts.reduce((a, b) => a + b, 0) / nonNullParts.length
      : null;

  const overallRag = bandSwe(overallValue, s);

  let overallLabel = 'Not scored yet';
  if (overallRag === 'G') overallLabel = 'GOOD';
  else if (overallRag === 'A') overallLabel = 'OK';
  else if (overallRag === 'R') overallLabel = 'BAD';

  const normalizedPct =
    overallValue !== null
      ? Math.round(((overallValue - 1) / 2) * 100 * 10) / 10
      : null;

  return {
    overallRag,
    overallValue,
    overallLabel,
    normalizedPct,
    parts: {
      review: reviewAvg,
      reviewRag,
      metrics: metricsAvg,
      metricsRag,
    },
    categories: categoriesRecord,
    scoredItems: scoredItemsCount,
    totalItems: totalItemsCount,
  };
}

/**
 * Compute ORS Optimizer RAG Sheet metrics, points, and status.
 */
export function computeOrs(entries: ScorecardItemEntry[]): ScorecardComputed {
  const entryMap = new Map<string, ScorecardItemEntry>();
  for (const e of entries) {
    entryMap.set(e.itemId, e);
  }

  const cost = (id: string) => ragCost(entryMap.get(id)?.value);

  // 1. Process items: ors_team, ors_timeline, ors_efficiency, ors_reporting
  const processCosts = ['ors_team', 'ors_timeline', 'ors_efficiency', 'ors_reporting']
    .map(cost)
    .filter((c): c is number => c !== null);
  const processValue =
    processCosts.length > 0
      ? processCosts.reduce((a, b) => a + b, 0) / processCosts.length
      : null;

  // 2. Content items: ors_puzzle, ors_design, ors_quality, ors_speed
  const contentCosts = ['ors_puzzle', 'ors_design', 'ors_quality', 'ors_speed']
    .map(cost)
    .filter((c): c is number => c !== null);
  const contentValue =
    contentCosts.length > 0
      ? contentCosts.reduce((a, b) => a + b, 0) / contentCosts.length
      : null;

  // 3. Data Quality item: ors_data
  const dataQualityValue = cost('ors_data');

  // 4. Interaction item: ors_interaction
  const interactionValue = cost('ors_interaction');

  const categoriesRecord: Record<string, { value: number | null; rag: 'G' | 'A' | 'R' | null }> = {
    process: { value: processValue, rag: orsValueToRag(processValue) },
    content: { value: contentValue, rag: orsValueToRag(contentValue) },
    data_quality: { value: dataQualityValue, rag: orsValueToRag(dataQualityValue) },
    interaction: { value: interactionValue, rag: orsValueToRag(interactionValue) },
  };

  const nonNullCategoryValues = [
    processValue,
    contentValue,
    dataQualityValue,
    interactionValue,
  ].filter((v): v is number => v !== null);

  let orsPoints = 0;
  let orsApplicable = 0;
  let scoredItemsCount = 0;

  for (const e of entries) {
    if (e.value !== null && e.value !== undefined) {
      scoredItemsCount++;
      if (e.value === 'G') {
        orsPoints += 1;
        orsApplicable++;
      } else if (e.value === 'A') {
        orsPoints += 0.5;
        orsApplicable++;
      } else if (e.value === 'R') {
        orsPoints += 0;
        orsApplicable++;
      }
      // 'NA' is excluded from orsPoints and orsApplicable
    }
  }

  if (nonNullCategoryValues.length === 0) {
    return {
      overallRag: null,
      overallValue: null,
      overallLabel: 'Not scored yet',
      normalizedPct: null,
      categories: categoriesRecord,
      orsPoints: null,
      orsApplicable: 0,
      scoredItems: scoredItemsCount,
      totalItems: 10,
    };
  }

  const minCategoryValue = Math.min(...nonNullCategoryValues);
  const statusValue = Math.round(Math.max(minCategoryValue, 1) - 0.01);
  const overallRag: 'G' | 'A' | 'R' = statusValue >= 3 ? 'G' : statusValue === 2 ? 'A' : 'R';

  let overallValue: number | null = null;
  let overallLabel = `Status ${overallRag}`;
  let normalizedPct: number | null = null;

  if (orsApplicable > 0) {
    overallValue = Math.round(((orsPoints / orsApplicable) * 10) * 10) / 10;
    normalizedPct = Math.round(overallValue * 10 * 10) / 10;
    overallLabel = `Status ${overallRag} – ${orsPoints}/${orsApplicable}`;
  }

  return {
    overallRag,
    overallValue,
    overallLabel,
    normalizedPct,
    categories: categoriesRecord,
    orsPoints,
    orsApplicable,
    scoredItems: scoredItemsCount,
    totalItems: 10,
  };
}

/**
 * Dispatcher to compute scorecard based on templateId.
 */
export function computeScorecard(
  templateId: ScorecardTemplateId,
  entries: ScorecardItemEntry[],
  settings: ScoringSettings = DEFAULT_SCORING_SETTINGS
): ScorecardComputed {
  if (templateId === 'SWE_MODEL') {
    return computeSwe(entries, settings);
  }
  return computeOrs(entries);
}

/**
 * Validates a scorecard before submission. Returns an array of error messages.
 */
export function validateForSubmit(sc: Scorecard): string[] {
  const errors: string[] = [];

  if (!sc.assessor || sc.assessor.trim() === '') {
    errors.push('Assessor name is required.');
  }

  if (!sc.assessmentDate || sc.assessmentDate.trim() === '') {
    errors.push('Assessment date is required.');
  }

  if (sc.templateId === 'SWE_MODEL') {
    const template = SCORECARD_TEMPLATES.SWE_MODEL;
    for (const cat of template.categories) {
      if (!cat.optional) {
        const catEntries = sc.items.filter(
          (e) => e.categoryId === cat.id && e.value !== null && e.value !== undefined
        );
        if (catEntries.length === 0) {
          errors.push(`Category "${cat.name}" requires at least one scored item.`);
        }
      }
    }

    for (const item of sc.items) {
      if (item.value !== null && item.value !== undefined) {
        if (item.isCustom || item.customLabel !== undefined) {
          if (!item.customLabel || item.customLabel.trim() === '') {
            errors.push('Custom and key transaction items require a label when scored.');
          }
        }
      }
    }
  } else if (sc.templateId === 'ORS_RAG') {
    const template = SCORECARD_TEMPLATES.ORS_RAG;
    const requiredItemIds = template.categories.flatMap((c) => c.items.map((i) => i.id));
    const scoredIds = new Set(
      sc.items
        .filter((i) => i.value !== null && i.value !== undefined)
        .map((i) => i.itemId)
    );

    const missingIds = requiredItemIds.filter((id) => !scoredIds.has(id));
    if (missingIds.length > 0) {
      errors.push('All 10 items must be scored (select G, A, R, or N/A).');
    }

    const missingRemarks = sc.items.filter(
      (e) =>
        (e.value === 'R' || e.value === 'A') &&
        (!e.remarks || e.remarks.trim() === '')
    );
    if (missingRemarks.length > 0) {
      errors.push('For Red and Amber, add improvement actions in Remarks.');
    }
  }

  return errors;
}

/**
 * Suggests an Interaction RAG value based on daily updates received last week.
 * 0-2 -> 'R', 3 -> 'A', 4-5 -> 'G'
 */
export function suggestInteraction(dailyUpdates: number): 'G' | 'A' | 'R' {
  if (dailyUpdates <= 2) return 'R';
  if (dailyUpdates === 3) return 'A';
  return 'G';
}

/**
 * Builds initial empty entries for a scorecard template.
 */
export function buildEmptyEntries(templateId: ScorecardTemplateId): ScorecardItemEntry[] {
  const template = SCORECARD_TEMPLATES[templateId];
  const entries: ScorecardItemEntry[] = [];
  for (const cat of template.categories) {
    for (const item of cat.items) {
      entries.push({
        itemId: item.id,
        categoryId: cat.id,
        value: null,
        remarks: '',
      });
    }
  }
  return entries;
}

/**
 * Copies entries from a previous scorecard (values, remarks, and custom rows).
 */
export function copyEntriesFrom(previous: Scorecard): ScorecardItemEntry[] {
  return previous.items.map((entry) => ({ ...entry }));
}
