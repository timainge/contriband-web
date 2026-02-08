<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import EditorToolbar from './components/EditorToolbar.vue';
import GridEditor from './components/GridEditor.vue';
import { useTemplate } from './composables/useTemplate';

// Logo grid: 5 rows (trimmed top/bottom), 6 columns
// Split point per column = how many filled pills from top (rest transparent)
const logoColumns = [3, 4, 2, 4, 1, 3];
const logoRows = 5;
// Two-tone green: light above split, dark below
const logoGreenLight = '#8aba84';
const logoGreenDark = '#3a6e38';

// Heart sprite for hero decoration (6 visible rows of the 7-row sprite)
const heartGrid = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,1,1,1,0],
  [0,0,1,0,0],
];
const heartGreens = ['#a8bfa5', '#7da67a', '#7da67a', '#548c51', '#548c51', '#3a6e38'];

// Editor mode state
export type EditorMode = 'draw' | 'text' | 'sprite';
const activeMode = ref<EditorMode>('draw');
const drawIntensity = ref(4);

const { undo } = useTemplate();

// Global keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // Don't intercept when typing in an input/textarea
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  // Ctrl+Z / Cmd+Z = undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo();
    return;
  }

  // Intensity shortcuts 0-4
  if (e.key >= '0' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
    drawIntensity.value = parseInt(e.key);
    activeMode.value = 'draw';
    return;
  }

  // Mode shortcuts
  if (e.key === 'd' || e.key === 'D') { activeMode.value = 'draw'; return; }
  if (e.key === 't' || e.key === 'T') { activeMode.value = 'text'; return; }
  if (e.key === 's' || e.key === 'S') { activeMode.value = 'sprite'; return; }

  // Escape
  if (e.key === 'Escape') {
    activeMode.value = 'draw';
    return;
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header bar -->
    <nav class="h-20">
      <div class="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 h-full flex items-end pb-2 gap-3">
        <!-- Logo mark -->
        <span class="inline-grid gap-[2px]" :style="{ gridTemplateColumns: `repeat(${logoColumns.length}, 6px)`, gridTemplateRows: `repeat(${logoRows}, 6px)` }">
          <template v-for="row in logoRows" :key="row">
            <span
              v-for="(split, col) in logoColumns"
              :key="`${row}-${col}`"
              class="rounded-[1.5px]"
              :style="{ backgroundColor: row <= split ? logoGreenLight : logoGreenDark }"
            ></span>
          </template>
        </span>

        <!-- Wordmark -->
        <span class="text-[2rem] font-bold tracking-tight text-[var(--color-text)] leading-none">ContriBand</span>

        <!-- GitHub link (pushed right) -->
        <a
          href="https://github.com"
          target="_blank"
          class="ml-auto flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span class="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </nav>

    <!-- Hero -->
    <header class="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 w-full relative overflow-hidden py-32">
      <!-- Heart sprite decoration -->
      <div class="heart-deco hidden md:block">
        <div class="heart-grid">
          <template v-for="(row, r) in heartGrid" :key="r">
            <span
              v-for="(cell, c) in row"
              :key="`h-${r}-${c}`"
              class="heart-cell"
              :style="cell ? { backgroundColor: heartGreens[r], opacity: 0.2 } : {}"
            />
          </template>
        </div>
      </div>

      <h1 class="text-8xl font-black tracking-tight text-[var(--color-text)] leading-none">
        Express your <br/> contributions.
      </h1>
    </header>

    <!-- Main content: toolbar + grid -->
    <main class="flex-1 max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 pb-16 w-full">
      <EditorToolbar
        v-model:mode="activeMode"
        v-model:intensity="drawIntensity"
      />
      <GridEditor
        :mode="activeMode"
        :draw-intensity="drawIntensity"
      />
    </main>
  </div>
</template>

<style scoped>
.heart-deco {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
}

.heart-grid {
  display: grid;
  grid-template-columns: repeat(5, 36px);
  grid-template-rows: repeat(6, 36px);
  gap: 5px;
}

.heart-cell {
  border-radius: 5px;
}
</style>
