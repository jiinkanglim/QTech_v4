/**
 * Period utilities for ISO week date management.
 */

/**
 * Returns the number of ISO weeks in a given year (52 or 53).
 */
export function getIsoWeeksInYear(year: number): number {
  const p = (y: number) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
  return p(year) === 4 || p(year - 1) === 3 ? 53 : 52;
}

/**
 * Calculates the ISO year and ISO week for a given Date or ISO date string (YYYY-MM-DD).
 */
export function isoWeekOf(d: Date | string): { year: number; week: number } {
  const date = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
  // In case of invalid date, default to current date
  if (isNaN(date.getTime())) {
    return isoWeekOf(new Date());
  }

  // ISO day: 1 (Monday) to 7 (Sunday)
  const day = (date.getUTCDay() + 6) % 7 + 1;
  // Move to nearest Thursday in the current week
  date.setUTCDate(date.getUTCDate() - day + 4);
  const year = date.getUTCFullYear();

  // First day of the target year
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7);

  return { year, week };
}

/**
 * Formats a period as a readable string, e.g. "Week 39 2026".
 */
export function periodLabel(year: number, week: number): string {
  return `Week ${week} ${year}`;
}

/**
 * Formats a period as a unique key, e.g. "2026-W39".
 */
export function periodKey(year: number, week: number): string {
  const padWeek = week.toString().padStart(2, '0');
  return `${year}-W${padWeek}`;
}

/**
 * Compares two periods. Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function comparePeriods(
  a: { year: number; week: number },
  b: { year: number; week: number }
): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return a.week - b.week;
}

/**
 * Returns the previous period given a cadence (1 week back for 'weekly', 2 for 'biweekly').
 */
export function previousPeriod(
  year: number,
  week: number,
  cadence: 'weekly' | 'biweekly' = 'weekly'
): { year: number; week: number } {
  const decrement = cadence === 'biweekly' ? 2 : 1;
  if (week - decrement > 0) {
    return { year, week: week - decrement };
  }

  const prevYear = year - 1;
  const weeksInPrevYear = getIsoWeeksInYear(prevYear);
  return {
    year: prevYear,
    week: weeksInPrevYear + (week - decrement),
  };
}

/**
 * Calculates the number of weeks between two periods (positive if 'to' is after 'from').
 */
export function weeksBetween(
  from: { year: number; week: number },
  to: { year: number; week: number }
): number {
  if (from.year === to.year) {
    return to.week - from.week;
  }
  if (from.year < to.year) {
    let count = getIsoWeeksInYear(from.year) - from.week;
    for (let y = from.year + 1; y < to.year; y++) {
      count += getIsoWeeksInYear(y);
    }
    count += to.week;
    return count;
  }
  return -weeksBetween(to, from);
}
