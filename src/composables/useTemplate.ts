import { ref, computed } from 'vue';
import type { Template } from '../lib/template';
import { createEmptyTemplate, templateToTxt, templateToToml, parseTxtTemplate, parseTomlTemplate } from '../lib/template';
import { renderText, type FontSize } from '../lib/font';
import { calculateCalendarGrid, formatAnchorDate } from '../lib/grid';

const calendar = calculateCalendarGrid();
const template = ref<Template>(createEmptyTemplate(calendar.usableColumns, 'my-design'));

// Ghost preview: semi-transparent overlay cells shown before stamping text/sprites
// Keyed by "row,templateCol" → intensity level
const ghostCells = ref<Map<string, number>>(new Map());

function setGhostPreview(grid: number[][], startCol: number) {
  const map = new Map<string, number>();
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (val !== undefined && val > 0) {
        const tc = startCol + c;
        if (tc >= 0 && tc < template.value.width) {
          map.set(`${r},${tc}`, val);
        }
      }
    }
  }
  ghostCells.value = map;
}

function clearGhostPreview() {
  ghostCells.value = new Map();
}

// Undo stack: snapshots of grid state (max 50)
const UNDO_MAX = 50;
const undoStack: number[][][] = [];

function pushUndo() {
  undoStack.push(template.value.grid.map(r => [...r]));
  if (undoStack.length > UNDO_MAX) {
    undoStack.shift();
  }
}

/**
 * Fit a template into the calendar-width grid.
 * Pads narrow templates with zeros, truncates wide ones.
 */
function fitToCalendar(t: Template): Template {
  const targetWidth = calendar.usableColumns;
  const newGrid = t.grid.map(row => {
    const fitted = row.slice(0, targetWidth);
    while (fitted.length < targetWidth) {
      fitted.push(0);
    }
    return fitted;
  });
  return { ...t, grid: newGrid, width: targetWidth, height: 7 };
}

// Track if we're in a paint stroke (don't push undo for every cell during drag)
let inStroke = false;

export function useTemplate() {
  const grid = computed(() => template.value.grid);
  const width = computed(() => template.value.width);
  const anchorDate = computed(() => formatAnchorDate(calendar.anchorDate));
  const calendarGrid = calendar;
  const canUndo = computed(() => undoStack.length > 0);

  const name = computed({
    get: () => template.value.name,
    set: (value: string) => {
      template.value = { ...template.value, name: value };
    },
  });

  function beginStroke() {
    if (!inStroke) {
      pushUndo();
      inStroke = true;
    }
  }

  function endStroke() {
    inStroke = false;
  }

  function setCell(row: number, col: number, level: number) {
    if (row >= 0 && row < 7 && col >= 0 && col < template.value.width) {
      beginStroke();
      const newGrid = template.value.grid.map(r => [...r]);
      const targetRow = newGrid[row];
      if (targetRow) {
        targetRow[col] = Math.max(0, Math.min(4, level));
      }
      template.value = { ...template.value, grid: newGrid };
    }
  }

  function cycleCell(row: number, col: number) {
    const currentLevel = template.value.grid[row]?.[col] ?? 0;
    const newLevel = (currentLevel + 1) % 5;
    setCell(row, col, newLevel);
  }

  function clearGrid() {
    pushUndo();
    const newGrid = template.value.grid.map(row => row.map(() => 0));
    template.value = { ...template.value, grid: newGrid };
  }

  function fillGrid(level: number = 4) {
    pushUndo();
    const newGrid = template.value.grid.map(row => row.map(() => level));
    template.value = { ...template.value, grid: newGrid };
  }

  function undo() {
    const prev = undoStack.pop();
    if (prev) {
      template.value = { ...template.value, grid: prev, width: prev[0]?.length ?? template.value.width };
    }
  }

  function stampGrid(data: number[][], startRow: number, startCol: number) {
    pushUndo();
    const newGrid = template.value.grid.map(r => [...r]);
    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const tr = startRow + r;
        const tc = startCol + c;
        if (tr >= 0 && tr < 7 && tc >= 0 && tc < template.value.width) {
          const targetRow = newGrid[tr];
          const val = row[c];
          if (targetRow && val !== undefined) {
            targetRow[tc] = Math.max(0, Math.min(4, val));
          }
        }
      }
    }
    template.value = { ...template.value, grid: newGrid };
  }

  function loadFromText(
    text: string,
    spacing: number = 1,
    fontSize: FontSize = '3x5',
    verticalAlign: 'top' | 'center' | 'bottom' = 'center'
  ) {
    try {
      const rendered = renderText(text, spacing, fontSize, verticalAlign);
      return fitToCalendar(rendered);
    } catch (e) {
      console.error('Failed to render text:', e);
      return null;
    }
  }

  function applyText(
    text: string,
    startCol: number,
    spacing: number = 1,
    fontSize: FontSize = '3x5',
    verticalAlign: 'top' | 'center' | 'bottom' = 'center'
  ) {
    try {
      const rendered = renderText(text, spacing, fontSize, verticalAlign);
      stampGrid(rendered.grid, 0, startCol);
    } catch (e) {
      console.error('Failed to apply text:', e);
    }
  }

  function loadFullText(
    text: string,
    spacing: number = 1,
    fontSize: FontSize = '3x5',
    verticalAlign: 'top' | 'center' | 'bottom' = 'center'
  ) {
    try {
      pushUndo();
      const rendered = renderText(text, spacing, fontSize, verticalAlign);
      template.value = fitToCalendar(rendered);
    } catch (e) {
      console.error('Failed to render text:', e);
    }
  }

  function exportTxt(): string {
    return templateToTxt(template.value);
  }

  function exportToml(): string {
    return templateToToml(template.value, anchorDate.value);
  }

  function importTxt(content: string) {
    try {
      pushUndo();
      const parsed = parseTxtTemplate(content, 'imported');
      template.value = fitToCalendar(parsed);
    } catch (e) {
      console.error('Failed to import TXT:', e);
      throw e;
    }
  }

  function importToml(content: string) {
    try {
      pushUndo();
      const parsed = parseTomlTemplate(content);
      template.value = fitToCalendar(parsed);
    } catch (e) {
      console.error('Failed to import TOML:', e);
      throw e;
    }
  }

  function importFile(content: string, filename: string) {
    if (filename.endsWith('.toml')) {
      importToml(content);
    } else {
      importTxt(content);
    }
  }

  return {
    template,
    grid,
    width,
    name,
    anchorDate,
    calendarGrid,
    canUndo,
    ghostCells,
    setCell,
    cycleCell,
    clearGrid,
    fillGrid,
    undo,
    beginStroke,
    endStroke,
    stampGrid,
    loadFromText,
    applyText,
    loadFullText,
    exportTxt,
    exportToml,
    importTxt,
    importToml,
    importFile,
    setGhostPreview,
    clearGhostPreview,
  };
}
