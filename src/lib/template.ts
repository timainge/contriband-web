// Template model and export utilities

export interface Template {
  name: string;
  grid: number[][]; // 7 rows x N columns, values 0-4
  width: number;
  height: number; // Always 7
}

export const GITHUB_COLORS: Record<number, string> = {
  0: '#e8e4df', // Subtle warm gray
  1: '#9ec5ab', // Soft sage
  2: '#6bb77b', // Fresh green
  3: '#3da55a', // GitHub green
  4: '#238b45', // Deep forest
};

export const DEFAULT_LEGEND: Record<string, number> = {
  '.': 0,
  ' ': 0,
  '-': 1,
  ':': 2,
  '=': 3,
  '#': 4,
};

export const LEVEL_TO_CHAR: Record<number, string> = {
  0: '.',
  1: '-',
  2: ':',
  3: '=',
  4: '#',
};

export function createEmptyTemplate(width: number = 10, name: string = 'untitled'): Template {
  const grid: number[][] = [];
  for (let row = 0; row < 7; row++) {
    grid.push(new Array(width).fill(0));
  }
  return { name, grid, width, height: 7 };
}

export function templateToTxt(template: Template): string {
  return template.grid
    .map(row => row.map(level => LEVEL_TO_CHAR[level] || '.').join(''))
    .join('\n');
}

export function templateToToml(template: Template, anchorDate?: string): string {
  const gridData = templateToTxt(template);
  const metaSection = anchorDate
    ? `[meta]
anchor_date = "${anchorDate}"
columns = ${template.width}
rows = ${template.height}

`
    : '';
  return `${metaSection}[template]
name = "${template.name}"

[legend]
chars = ".:-=#"

[grid]
data = """
${gridData}
"""
`;
}

export function parseTxtTemplate(content: string, name: string = 'imported'): Template {
  const lines = content.trim().split('\n').filter(line => line.length > 0);

  if (lines.length !== 7) {
    throw new Error(`Template must have exactly 7 rows, got ${lines.length}`);
  }

  const width = Math.max(...lines.map(line => line.length));
  const grid: number[][] = [];

  for (const line of lines) {
    const row: number[] = [];
    for (let i = 0; i < width; i++) {
      const char = line[i] || '.';
      row.push(DEFAULT_LEGEND[char] ?? 0);
    }
    grid.push(row);
  }

  return { name, grid, width, height: 7 };
}

export function parseTomlTemplate(content: string): Template {
  // Simple TOML parser for our format
  const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
  const gridMatch = content.match(/data\s*=\s*"""([\s\S]*?)"""/);

  const name = nameMatch?.[1] || 'imported';
  const gridData = gridMatch?.[1]?.trim() || '';

  return parseTxtTemplate(gridData, name);
}
