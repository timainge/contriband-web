<script setup lang="ts">
import { ref, watch } from 'vue';
import { GITHUB_COLORS } from '../lib/template';
import { useTemplate } from '../composables/useTemplate';
import { SPRITES, selectedSprite } from '../lib/sprites';
import type { Sprite } from '../lib/sprites';
import type { FontSize } from '../lib/font';
import ExportDialog from './ExportDialog.vue';

const props = defineProps<{
  mode: 'draw' | 'text' | 'sprite';
  intensity: number;
}>();

const emit = defineEmits<{
  'update:mode': [value: 'draw' | 'text' | 'sprite'];
  'update:intensity': [value: number];
}>();

const { clearGrid, importFile, undo, canUndo, loadFromText, applyText, setGhostPreview, clearGhostPreview } = useTemplate();

// Clear confirmation state
const confirmClear = ref(false);
let clearTimer: ReturnType<typeof setTimeout> | null = null;

function handleClear() {
  if (confirmClear.value) {
    clearGrid();
    confirmClear.value = false;
    if (clearTimer) window.clearTimeout(clearTimer);
  } else {
    confirmClear.value = true;
    clearTimer = setTimeout(() => {
      confirmClear.value = false;
    }, 2000);
  }
}

// Import file
function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.toml';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importFile(content, file.name);
    };
    reader.readAsText(file);
  };
  input.click();
}

const showExport = ref(false);

// --- Text mode state (moved from TextDialog) ---
const textInput = ref('');
const spacing = ref(1);
const fontSize = ref<FontSize>('3x5');
const verticalAlign = ref<'top' | 'center' | 'bottom'>('center');

// Ghost preview for text mode
watch([textInput, spacing, fontSize, verticalAlign], () => {
  if (props.mode !== 'text') return;
  if (textInput.value.trim()) {
    const result = loadFromText(textInput.value, spacing.value, fontSize.value, verticalAlign.value);
    if (result) {
      setGhostPreview(result.grid, 0);
    } else {
      clearGhostPreview();
    }
  } else {
    clearGhostPreview();
  }
});

function handleStamp() {
  if (!textInput.value.trim()) return;
  applyText(textInput.value, 0, spacing.value, fontSize.value, verticalAlign.value);
  textInput.value = '';
  clearGhostPreview();
}

// --- Sprite mode ---
function selectSprite(sprite: Sprite) {
  selectedSprite.value = sprite;
}

// --- Mode switch: reset state ---
watch(() => props.mode, (_newMode, oldMode) => {
  if (oldMode === 'text') {
    textInput.value = '';
    clearGhostPreview();
  }
  if (oldMode === 'sprite') {
    clearGhostPreview();
  }
});

const modes = [
  { key: 'draw' as const, label: 'Draw', shortcut: 'D' },
  { key: 'text' as const, label: 'Text', shortcut: 'T' },
  { key: 'sprite' as const, label: 'Sprite', shortcut: 'S' },
];
</script>

<template>
  <div class="toolbar-wrapper">
    <!-- Top row: mode toggle + actions -->
    <div class="toolbar-top">
      <!-- Segmented mode toggle -->
      <div class="mode-toggle">
        <button
          v-for="m in modes"
          :key="m.key"
          class="mode-btn"
          :class="{ active: mode === m.key }"
          :title="`${m.label} mode (${m.shortcut})`"
          @click="emit('update:mode', m.key)"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- Action buttons -->
      <div class="toolbar-actions">
        <button
          class="toolbar-btn"
          :class="{ disabled: !canUndo }"
          title="Undo (Ctrl+Z)"
          @click="undo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
          </svg>
          <span class="toolbar-label">Undo</span>
        </button>

        <button
          class="toolbar-btn"
          :class="{ 'btn-danger': confirmClear }"
          :title="confirmClear ? 'Click again to confirm' : 'Clear grid'"
          @click="handleClear"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="toolbar-label">{{ confirmClear ? 'Sure?' : 'Clear' }}</span>
        </button>

        <button
          class="toolbar-btn"
          title="Import template"
          @click="handleImport"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="toolbar-label">Import</span>
        </button>

        <div class="relative">
          <button
            class="toolbar-btn"
            :class="{ active: showExport }"
            title="Export template"
            @click="showExport = !showExport"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="toolbar-label">Export</span>
          </button>
          <ExportDialog :visible="showExport" @close="showExport = false" />
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="toolbar-divider" />

    <!-- Sub row: mode-specific controls -->
    <div class="toolbar-sub">
      <!-- Draw mode: intensity swatches -->
      <div v-if="mode === 'draw'" class="sub-draw">
        <div class="intensity-picker">
          <button
            v-for="level in [0, 1, 2, 3, 4]"
            :key="level"
            class="intensity-swatch"
            :class="{ active: intensity === level }"
            :style="{ backgroundColor: GITHUB_COLORS[level] }"
            :title="`Level ${level}`"
            @click="emit('update:intensity', level)"
          />
        </div>
        <span class="sub-hint">Press 0-4 to set intensity</span>
      </div>

      <!-- Text mode: inline input + controls -->
      <div v-else-if="mode === 'text'" class="sub-text">
        <input
          v-model="textInput"
          type="text"
          placeholder="Type text..."
          class="text-input"
          @keydown.enter="handleStamp"
        />

        <select v-model="fontSize" class="sub-select" title="Font size">
          <option value="3x5">3x5</option>
          <option value="5x7">5x7</option>
        </select>

        <select v-model.number="spacing" class="sub-select" title="Letter spacing">
          <option :value="0">0</option>
          <option :value="1">1</option>
          <option :value="2">2</option>
        </select>

        <select v-if="fontSize === '3x5'" v-model="verticalAlign" class="sub-select" title="Vertical align">
          <option value="top">Top</option>
          <option value="center">Mid</option>
          <option value="bottom">Bot</option>
        </select>

        <button
          class="stamp-btn"
          :disabled="!textInput.trim()"
          @click="handleStamp"
        >
          Stamp
        </button>
      </div>

      <!-- Sprite mode: horizontal sprite chips -->
      <div v-else-if="mode === 'sprite'" class="sub-sprite">
        <button
          v-for="sprite in SPRITES"
          :key="sprite.name"
          class="sprite-chip"
          :class="{ active: selectedSprite?.name === sprite.name }"
          :title="sprite.name"
          @click="selectSprite(sprite)"
        >
          <div
            class="sprite-preview"
            :style="{
              gridTemplateColumns: `repeat(${sprite.width}, 3px)`,
              gridTemplateRows: `repeat(${sprite.height}, 3px)`,
            }"
          >
            <span
              v-for="(row, r) in sprite.grid"
              :key="r"
              class="sprite-row"
            >
              <span
                v-for="(cell, c) in row"
                :key="c"
                class="sprite-cell"
                :style="{ backgroundColor: GITHUB_COLORS[cell] }"
              />
            </span>
          </div>
          <span class="sprite-label">{{ sprite.name }}</span>
        </button>

        <span class="sub-hint">
          {{ selectedSprite ? `Click grid to stamp "${selectedSprite.name}"` : 'Select a sprite' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-wrapper {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: visible;
}

/* --- Top row --- */
.toolbar-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  flex-wrap: wrap;
}

/* Segmented mode toggle */
.mode-toggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--color-bg);
  border-radius: 8px;
}

.mode-btn {
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mode-btn:hover {
  color: var(--color-text);
}

.mode-btn.active {
  background: var(--color-card);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

/* Action buttons pushed right */
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.toolbar-btn:hover {
  color: var(--color-text);
  background: var(--color-bg);
  border-color: var(--color-border);
}

.toolbar-btn.active {
  color: var(--color-blue);
  background: var(--color-blue-light);
  border-color: var(--color-blue);
}

.toolbar-btn.btn-danger {
  color: var(--color-coral);
  background: var(--color-coral-light);
  border-color: var(--color-coral);
}

.toolbar-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.toolbar-label {
  display: none;
}

@media (min-width: 640px) {
  .toolbar-label {
    display: inline;
  }
}

/* --- Divider --- */
.toolbar-divider {
  height: 1px;
  background: var(--color-border);
}

/* --- Sub row --- */
.toolbar-sub {
  min-height: 40px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
}

/* Draw sub-bar */
.sub-draw {
  display: flex;
  align-items: center;
  gap: 12px;
}

.intensity-picker {
  display: flex;
  gap: 3px;
  padding: 3px;
  background: var(--color-bg);
  border-radius: 6px;
}

.intensity-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.1s ease;
}

.intensity-swatch:hover {
  transform: scale(1.15);
}

.intensity-swatch.active {
  border-color: var(--color-text);
  box-shadow: 0 0 0 2px var(--color-card);
}

.sub-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Text sub-bar */
.sub-text {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}

.text-input {
  flex: 1;
  min-width: 100px;
  max-width: 200px;
  padding: 5px 10px;
  font-size: 13px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  transition: border-color 0.15s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-blue);
}

.text-input::placeholder {
  color: var(--color-text-muted);
}

.sub-select {
  padding: 5px 24px 5px 8px;
  font-size: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237a746b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 14px;
  transition: border-color 0.15s ease;
}

.sub-select:focus {
  outline: none;
  border-color: var(--color-blue);
}

.stamp-btn {
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.stamp-btn:hover:not(:disabled) {
  background: var(--color-blue-dark);
}

.stamp-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* Sprite sub-bar */
.sub-sprite {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sprite-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.sprite-chip:hover {
  border-color: var(--color-blue);
}

.sprite-chip.active {
  border-color: var(--color-blue);
  background: var(--color-blue-light);
}

.sprite-preview {
  display: grid;
  gap: 1px;
}

.sprite-row {
  display: contents;
}

.sprite-cell {
  width: 3px;
  height: 3px;
  border-radius: 0.5px;
  display: inline-block;
}

.sprite-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.sprite-chip.active .sprite-label {
  color: var(--color-blue);
}
</style>
