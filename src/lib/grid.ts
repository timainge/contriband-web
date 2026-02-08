// Calendar grid calculation for GitHub contribution graph layout

export interface CalendarGrid {
  graphStartDate: Date;   // Date of cell [row 0, col 0] of full graph (including margins)
  anchorDate: Date;       // Date of cell [row 0, col 0] of usable grid (excluding left margin)
  totalColumns: number;   // Full graph columns including margin columns
  usableColumns: number;  // Columns in usable canvas (totalColumns - 2)
  today: Date;            // Today's date (midnight-normalized)
}

/**
 * Calculate the GitHub contribution graph layout for a given date.
 *
 * The graph shows the trailing ~1 year of activity, starting on a Sunday.
 * We add 1-column safety margins on each side for timezone/rollover protection.
 */
export function calculateCalendarGrid(today: Date = new Date()): CalendarGrid {
  // Normalize to midnight
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 1 year ago
  const oneYearAgo = new Date(todayNorm);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Round backward to nearest Sunday (day 0)
  const dayOfWeek = oneYearAgo.getDay();
  const graphStartDate = new Date(oneYearAgo);
  graphStartDate.setDate(graphStartDate.getDate() - dayOfWeek);

  // Total columns: number of complete or partial weeks from graphStartDate to today
  const diffMs = todayNorm.getTime() - graphStartDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalColumns = Math.floor(diffDays / 7) + 1;

  // Anchor date: skip left margin column
  const anchorDate = new Date(graphStartDate);
  anchorDate.setDate(anchorDate.getDate() + 7);

  const usableColumns = totalColumns - 2;

  return { graphStartDate, anchorDate, totalColumns, usableColumns, today: todayNorm };
}

/**
 * Get the date for a cell in the full display grid (including margins).
 * displayCol 0 = left margin, displayCol totalColumns-1 = right margin.
 */
export function displayColToDate(displayCol: number, row: number, graphStartDate: Date): Date {
  const date = new Date(graphStartDate);
  date.setDate(date.getDate() + displayCol * 7 + row);
  return date;
}

/**
 * Check if a date falls within the active range [graphStartDate, today].
 */
export function isDateActive(date: Date, today: Date): boolean {
  return date <= today;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a date for hover tooltip display.
 * Example: "Mon 14 Apr 2025"
 */
export function formatDateForTooltip(date: Date): string {
  const day = DAYS[date.getDay()];
  const d = date.getDate();
  const month = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${day} ${d} ${month} ${y}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Compute month labels for display columns.
 * Returns a sparse map: displayCol -> month abbreviation.
 * A label appears at the first column whose Sunday falls in a new month.
 */
export function computeMonthLabels(
  totalColumns: number,
  graphStartDate: Date
): Record<number, string> {
  const labels: Record<number, string> = {};
  let prevMonth = -1;

  for (let col = 0; col < totalColumns; col++) {
    const sunday = displayColToDate(col, 0, graphStartDate);
    const month = sunday.getMonth();

    if (month !== prevMonth) {
      labels[col] = MONTHS[month]!;
      prevMonth = month;
    }
  }

  return labels;
}

/**
 * Format an anchor date as YYYY-MM-DD for TOML export.
 */
export function formatAnchorDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
