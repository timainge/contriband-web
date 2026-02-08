<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GITHUB_COLORS } from '../lib/template';
import { useTemplate } from '../composables/useTemplate';
import { selectedSprite } from '../lib/sprites';
import {
  displayColToDate,
  isDateActive,
  formatDateForTooltip,
  computeMonthLabels,
} from '../lib/grid';

const props = defineProps<{
  mode: 'draw' | 'text' | 'sprite';
  drawIntensity: number;
}>();

const { grid, setCell, calendarGrid, endStroke, stampGrid, importFile, ghostCells, setGhostPreview, clearGhostPreview } = useTemplate();

// Drag-and-drop import
const dragOver = ref(false);

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  dragOver.value = true;
}

function handleDragLeave() {
  dragOver.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  dragOver.value = false;
  const file = e.dataTransfer?.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const content = ev.target?.result as string;
    importFile(content, file.name);
  };
  reader.readAsText(file);
}
const { graphStartDate, totalColumns, today } = calendarGrid;

// Day labels: Mon, Wed, Fri at rows 1, 3, 5 (matching GitHub)
const DAY_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

// Month labels keyed by display column index
const monthLabels = computed(() =>
  computeMonthLabels(totalColumns, graphStartDate)
);

// Dynamic cell sizing based on container width
const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(800);
const GAP = 2;
const LABEL_COL_WIDTH = 28;

function updateContainerWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth;
  }
}

onMounted(() => {
  updateContainerWidth();
  window.addEventListener('resize', updateContainerWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth);
});

const cellSize = computed(() => {
  const available = containerWidth.value - LABEL_COL_WIDTH - (totalColumns - 1) * GAP - 32; // 32px padding
  const raw = Math.floor(available / totalColumns);
  return Math.max(8, Math.min(28, raw));
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `${LABEL_COL_WIDTH}px repeat(${totalColumns}, ${cellSize.value}px)`,
  gridTemplateRows: `20px repeat(7, ${cellSize.value}px)`,
  gap: `${GAP}px`,
}));

function isMargin(displayCol: number): boolean {
  return displayCol === 0 || displayCol === totalColumns - 1;
}

function cellDate(row: number, displayCol: number): Date {
  return displayColToDate(displayCol, row, graphStartDate);
}

function cellDisabled(row: number, displayCol: number): boolean {
  if (isMargin(displayCol)) return true;
  return !isDateActive(cellDate(row, displayCol), today);
}

function cellIsToday(row: number, displayCol: number): boolean {
  const d = cellDate(row, displayCol);
  return d.getTime() === today.getTime();
}

function cellLevel(row: number, displayCol: number): number {
  if (isMargin(displayCol)) return 0;
  const templateCol = displayCol - 1;
  return grid.value[row]?.[templateCol] ?? 0;
}

function cellColor(row: number, displayCol: number): string {
  return GITHUB_COLORS[cellLevel(row, displayCol)] ?? GITHUB_COLORS[0] ?? '#e8e4df';
}

function cellTooltip(row: number, displayCol: number): string {
  const date = cellDate(row, displayCol);
  const dateStr = formatDateForTooltip(date);
  const level = cellLevel(row, displayCol);

  if (isMargin(displayCol)) return `${dateStr} (margin)`;
  if (!isDateActive(date, today)) return `${dateStr} (future)`;
  return `${dateStr} — Level ${level}`;
}

// Ghost overlay: returns ghost level for a cell if it exists
function ghostLevel(row: number, displayCol: number): number | null {
  if (isMargin(displayCol)) return null;
  const templateCol = displayCol - 1;
  const key = `${row},${templateCol}`;
  const val = ghostCells.value.get(key);
  return val !== undefined ? val : null;
}

// Sprite hover preview
const hoverCol = ref<number | null>(null);

function handleCellHover(row: number, displayCol: number) {
  if (props.mode !== 'sprite' || !selectedSprite.value) return;
  if (cellDisabled(row, displayCol)) return;
  const templateCol = displayCol - 1;
  if (hoverCol.value !== templateCol) {
    hoverCol.value = templateCol;
    setGhostPreview(selectedSprite.value.grid, templateCol);
  }
}

function handleGridLeave() {
  if (hoverCol.value !== null) {
    hoverCol.value = null;
    clearGhostPreview();
  }
}

// Drawing state
const isDrawing = ref(false);

function handlePointerDown(row: number, displayCol: number, event: PointerEvent) {
  if (cellDisabled(row, displayCol)) return;
  event.preventDefault();

  const templateCol = displayCol - 1;

  if (props.mode === 'sprite' && selectedSprite.value) {
    stampGrid(selectedSprite.value.grid, 0, templateCol);
    return;
  }

  if (props.mode !== 'draw') return;

  const level = event.button === 2 ? 0 : props.drawIntensity;
  setCell(row, templateCol, level);
  isDrawing.value = true;
}

function handlePointerEnter(row: number, displayCol: number) {
  if (!isDrawing.value) return;
  if (props.mode !== 'draw') return;
  if (cellDisabled(row, displayCol)) return;
  setCell(row, displayCol - 1, props.drawIntensity);
}

function handlePointerUp() {
  isDrawing.value = false;
  endStroke();
}

function handleContextMenu(event: Event) {
  event.preventDefault();
}

onMounted(() => {
  window.addEventListener('pointerup', handlePointerUp);
});

onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerUp);
});
</script>

<template>
  <div
    ref="containerRef"
    class="grid-editor"
    :class="{ 'drag-over': dragOver }"
    @contextmenu="handleContextMenu"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @pointerleave="handleGridLeave"
  >
    <div class="grid-scroll">
      <div class="contribution-grid" :style="gridStyle">
        <!-- Row 0: month labels -->
        <div class="day-label"></div>
        <template v-for="(_, col) in totalColumns" :key="`m-${col}`">
          <div class="month-label">{{ monthLabels[col] || '' }}</div>
        </template>

        <!-- Rows 1-7: day label + cells -->
        <template v-for="(_, row) in 7" :key="`r-${row}`">
          <div class="day-label">{{ DAY_LABELS[row] || '' }}</div>
          <div
            v-for="(__, col) in totalColumns"
            :key="`c-${row}-${col}`"
            class="grid-cell"
            :class="{
              'cell-margin': isMargin(col),
              'cell-disabled': cellDisabled(row, col) && !isMargin(col),
              'cell-today': cellIsToday(row, col),
              'cell-active': !cellDisabled(row, col),
            }"
            :style="{
              backgroundColor: cellColor(row, col),
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }"
            :title="cellTooltip(row, col)"
            @pointerdown="handlePointerDown(row, col, $event)"
            @pointerenter="handlePointerEnter(row, col)"
            @pointermove="handleCellHover(row, col)"
          >
            <div
              v-if="ghostLevel(row, col) !== null"
              class="ghost-overlay"
              :style="{ backgroundColor: GITHUB_COLORS[ghostLevel(row, col)!] }"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <span class="legend-text">Less</span>
      <div class="legend-cells">
        <div
          v-for="level in [0, 1, 2, 3, 4]"
          :key="level"
          class="legend-cell"
          :style="{ backgroundColor: GITHUB_COLORS[level] }"
          :title="`Level ${level}`"
        />
      </div>
      <span class="legend-text">More</span>
    </div>
  </div>
</template>

<style scoped>
.grid-editor {
  user-select: none;
  touch-action: none;
  transition: outline 0.15s ease;
}

.grid-editor.drag-over {
  outline: 2px dashed var(--color-blue);
  outline-offset: 4px;
  border-radius: 16px;
}

.grid-scroll {
  overflow-x: auto;
  padding: 16px;
  background: var(--color-bg);
  border-radius: 12px;
}

.contribution-grid {
  display: grid;
  width: fit-content;
}

/* --- Labels --- */
.day-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-muted);
  user-select: none;
}

.month-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: visible;
  user-select: none;
  line-height: 20px;
}

/* --- Cells --- */
.grid-cell {
  border-radius: 2px;
  transition: transform 0.1s, box-shadow 0.1s;
  position: relative;
}

/* Ghost overlay for text/sprite preview */
.ghost-overlay {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  opacity: 0.45;
  animation: ghost-pulse 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ghost-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.55; }
}

.cell-active {
  cursor: pointer;
}

.cell-active:hover {
  transform: scale(1.15);
  box-shadow: 0 0 0 2px var(--color-blue);
  z-index: 1;
  position: relative;
}

/* Margin columns: subtle crosshatch to indicate non-editable */
.cell-margin {
  opacity: 0.35;
  cursor: default;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.06) 2px,
    rgba(0, 0, 0, 0.06) 3px
  ) !important;
}

/* Future / out-of-range cells */
.cell-disabled {
  opacity: 0.3;
  cursor: default;
}

/* Today indicator */
.cell-today {
  box-shadow: inset 0 0 0 2px var(--color-blue);
}

/* --- Legend --- */
.legend {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-text {
  font-size: 11px;
  color: var(--color-text-muted);
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  transition: transform 0.1s;
}

.legend-cell:hover {
  transform: scale(1.15);
}
</style>
