import { Project, ScorecardSummary, Scorecard, ScorecardTemplateId } from '../types';
import {
  isoWeekOf,
  periodKey,
  periodLabel,
  comparePeriods,
  getIsoWeeksInYear,
  weeksBetween,
  previousPeriod,
} from './period';

export interface ExpectedPeriod {
  year: number;
  week: number;
  periodKey: string;
  periodLabel: string;
}

export interface SubmissionStateResult {
  state: 'ok' | 'due' | 'overdue';
  lastSubmittedLabel: string;
  weeksSinceLast: number | null;
}

export function parsePeriodKey(key: string): { year: number; week: number } | null {
  const match = key.match(/^(\d{4})-W(\d{1,2})$/i);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  };
}

/**
 * Generates all expected submission periods from startPeriod to currentPeriod
 * stepping by cadence (weekly = 1, bi-weekly = 2).
 */
export function expectedPeriods(
  config:
    | { startPeriod?: string; cadence?: 'weekly' | 'biweekly' }
    | { scorecardConfig?: { startPeriod?: string; cadence?: 'weekly' | 'biweekly' } },
  currentPeriod: { year: number; week: number }
): ExpectedPeriod[] {
  const actualConfig = 'scorecardConfig' in config && config.scorecardConfig
    ? config.scorecardConfig
    : (config as { startPeriod?: string; cadence?: 'weekly' | 'biweekly' });

  const cadence = actualConfig?.cadence === 'biweekly' ? 'biweekly' : 'weekly';
  const step = cadence === 'biweekly' ? 2 : 1;

  let start: { year: number; week: number };
  if (actualConfig?.startPeriod) {
    const parsed = parsePeriodKey(actualConfig.startPeriod);
    start = parsed || previousPeriod(currentPeriod.year, currentPeriod.week, cadence);
  } else {
    // Default to ~12 periods back if startPeriod not specified
    let cur = { ...currentPeriod };
    for (let i = 0; i < 12 * step; i++) {
      cur = previousPeriod(cur.year, cur.week, 'weekly');
    }
    start = cur;
  }

  // If start is in future relative to currentPeriod, return empty or just currentPeriod
  if (comparePeriods(start, currentPeriod) > 0) {
    return [];
  }

  const result: ExpectedPeriod[] = [];
  let curYear = start.year;
  let curWeek = start.week;

  while (comparePeriods({ year: curYear, week: curWeek }, currentPeriod) <= 0) {
    result.push({
      year: curYear,
      week: curWeek,
      periodKey: periodKey(curYear, curWeek),
      periodLabel: periodLabel(curYear, curWeek),
    });

    curWeek += step;
    const maxWeeks = getIsoWeeksInYear(curYear);
    if (curWeek > maxWeeks) {
      curYear += 1;
      curWeek -= maxWeeks;
    }
  }

  return result;
}

/**
 * Calculates submission state for a project and role:
 * - 'ok': submitted within current cadence window (weekly: this or last week; bi-weekly: last 2 weeks)
 * - 'due': current window is open, nothing submitted yet
 * - 'overdue': nothing submitted for longer than cadence + 1 week
 */
export function submissionState(
  project: Project | { id: string; scorecardConfig?: any },
  templateId: ScorecardTemplateId,
  summaries: (ScorecardSummary | Scorecard)[],
  today: Date | string = new Date()
): SubmissionStateResult {
  const currentPeriod = isoWeekOf(today);
  const cadence = project.scorecardConfig?.cadence === 'biweekly' ? 'biweekly' : 'weekly';
  const cadenceWeeks = cadence === 'biweekly' ? 2 : 1;

  const projectSummaries = summaries.filter(
    (s) => s.projectId === project.id && s.templateId === templateId && s.status === 'submitted'
  );

  if (projectSummaries.length === 0) {
    let weeksSinceStart: number | null = null;
    if (project.scorecardConfig?.startPeriod) {
      const startP = parsePeriodKey(project.scorecardConfig.startPeriod);
      if (startP) {
        weeksSinceStart = weeksBetween(startP, currentPeriod);
      }
    }

    const isOverdue = weeksSinceStart !== null && weeksSinceStart > cadenceWeeks + 1;
    return {
      state: isOverdue ? 'overdue' : 'due',
      lastSubmittedLabel: 'Never',
      weeksSinceLast: null,
    };
  }

  // Sort chronologically ascending to find latest
  projectSummaries.sort((a, b) =>
    comparePeriods(
      { year: a.periodYear, week: a.periodWeek },
      { year: b.periodYear, week: b.periodWeek }
    )
  );

  const latest = projectSummaries[projectSummaries.length - 1];
  const weeks = Math.max(
    0,
    weeksBetween({ year: latest.periodYear, week: latest.periodWeek }, currentPeriod)
  );

  const lastSubmittedLabel = latest.periodLabel || periodLabel(latest.periodYear, latest.periodWeek);

  // 'ok': weekly = this week (0) or last week (1); bi-weekly = last 2 weeks (<= 2)
  if (weeks <= cadenceWeeks) {
    return {
      state: 'ok',
      lastSubmittedLabel,
      weeksSinceLast: weeks,
    };
  }

  // 'overdue': nothing submitted for longer than cadence + 1 week
  // For weekly: > 2 weeks (e.g. 3+ weeks).
  // For bi-weekly: > 3 weeks (e.g. 4+ weeks).
  if (weeks > cadenceWeeks + 1) {
    return {
      state: 'overdue',
      lastSubmittedLabel,
      weeksSinceLast: weeks,
    };
  }

  // 'due': current window open, nothing yet (weeks === cadenceWeeks + 1)
  return {
    state: 'due',
    lastSubmittedLabel,
    weeksSinceLast: weeks,
  };
}

/**
 * Calculates compliance rate (%) over the last 12 weeks:
 * submitted expected periods / expected periods (%).
 */
export function complianceRate(
  project: Project | { id: string; scorecardConfig?: any },
  templateId: ScorecardTemplateId,
  summaries: (ScorecardSummary | Scorecard)[],
  today: Date | string = new Date(),
  lookbackWeeks = 12
): number {
  const currentPeriod = isoWeekOf(today);
  const cadence = project.scorecardConfig?.cadence === 'biweekly' ? 'biweekly' : 'weekly';
  const step = cadence === 'biweekly' ? 2 : 1;

  // Build target expected periods in lookback range
  let startCur = { ...currentPeriod };
  for (let i = 0; i < lookbackWeeks; i++) {
    startCur = previousPeriod(startCur.year, startCur.week, 'weekly');
  }

  if (project.scorecardConfig?.startPeriod) {
    const startP = parsePeriodKey(project.scorecardConfig.startPeriod);
    if (startP && comparePeriods(startP, startCur) > 0) {
      startCur = startP;
    }
  }

  const expected = expectedPeriods(
    { startPeriod: periodKey(startCur.year, startCur.week), cadence },
    currentPeriod
  );

  if (expected.length === 0) return 100;

  const submittedKeys = new Set(
    summaries
      .filter((s) => s.projectId === project.id && s.templateId === templateId && s.status === 'submitted')
      .map((s) => periodKey(s.periodYear, s.periodWeek))
  );

  let submittedCount = 0;
  for (const exp of expected) {
    if (submittedKeys.has(exp.periodKey)) {
      submittedCount++;
    }
  }

  return Math.round((submittedCount / expected.length) * 100);
}
