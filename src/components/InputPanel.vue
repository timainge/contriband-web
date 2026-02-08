<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTemplate } from '../composables/useTemplate';
import type { FontSize } from '../lib/font';

const { loadFromText, importFile, clearGrid } = useTemplate();

const activeTab = ref<'text' | 'import'>('text');

// Text input state
const text = ref('');
const spacing = ref(1);
const fontSize = ref<FontSize>('3x5');
const verticalAlign = ref<'top' | 'center' | 'bottom'>('center');

// Auto-render when any input changes
watch([text, spacing, fontSize, verticalAlign], () => {
  if (text.value.trim()) {
    loadFromText(text.value, spacing.value, fontSize.value, verticalAlign.value);
  } else {
    clearGrid();
  }
}, { immediate: false });

// Import state
const dragOver = ref(false);

function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) processFile(file);
  input.value = '';
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragOver.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) processFile(file);
}

function processFile(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    try {
      importFile(content, file.name);
    } catch (err) {
      alert('Failed to import file. Make sure it has exactly 7 rows.');
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="input-panel">
    <!-- Tab switcher and controls row -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <!-- Tabs -->
      <div class="flex items-center gap-1 p-1 bg-[var(--color-bg)] rounded-lg">
      <button
        @click="activeTab = 'text'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'text'
          ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
      >
        Text Input
      </button>
      <button
        @click="activeTab = 'import'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'import'
          ? 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
      >
        Import File
      </button>
      </div>

    </div>

    <!-- Text input tab -->
    <div v-if="activeTab === 'text'" class="animate-in">
      <div class="mb-3">
        <input
          v-model="text"
          type="text"
          placeholder="Enter text (A-Z, 0-9)"
          class="input w-full"
        />
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <label class="label">Font</label>
          <select v-model="fontSize" class="select">
            <option value="3x5">3x5 Compact</option>
            <option value="5x7">5x7 Large</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="label">Spacing</label>
          <select v-model="spacing" class="select">
            <option :value="0">None</option>
            <option :value="1">1px</option>
            <option :value="2">2px</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="label">Align</label>
          <select
            v-model="verticalAlign"
            class="select"
            :disabled="fontSize === '5x7'"
            :class="{ 'opacity-50': fontSize === '5x7' }"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Import tab -->
    <div v-else class="animate-in">
      <label
        class="block cursor-pointer"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop="handleDrop"
      >
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-all"
          :class="dragOver
            ? 'border-[var(--color-blue)] bg-blue-50'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'"
        >
          <svg class="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm text-[var(--color-text)] mb-1">
            Drop a file here or <span class="text-[var(--color-blue)] font-medium">browse</span>
          </p>
          <p class="text-xs text-[var(--color-text-muted)]">
            .txt or .toml template files
          </p>
        </div>
        <input
          type="file"
          accept=".txt,.toml"
          @change="handleFileImport"
          class="hidden"
        />
      </label>
    </div>
  </div>
</template>
