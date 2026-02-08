<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTemplate } from '../composables/useTemplate';

const { name, exportTxt, exportToml } = useTemplate();

const copySuccess = ref(false);

// Slugify name for filename
const slugifiedName = computed(() => {
  return name.value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'template';
});

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTxt() {
  const content = exportTxt();
  download(content, `${slugifiedName.value}.txt`, 'text/plain');
}

function downloadToml() {
  const content = exportToml();
  download(content, `${slugifiedName.value}.toml`, 'text/plain');
}

async function copyToClipboard() {
  const content = exportTxt();
  try {
    await navigator.clipboard.writeText(content);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
}
</script>

<template>
  <div class="export-panel">
    <!-- Template name input -->
    <div class="mb-4">
      <label class="label">Template name</label>
      <input v-model="name" type="text" class="input" placeholder="my-design" />
      <p class="text-xs text-[var(--color-text-muted)] mt-1.5">
        {{ slugifiedName }}.txt
      </p>
    </div>

    <!-- Export buttons - inline on desktop, stacked on mobile -->
    <div class="flex flex-col sm:flex-row gap-2">
      <button @click="downloadTxt" class="btn btn-secondary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>.txt</span>
      </button>
      <button @click="downloadToml" class="btn btn-secondary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>.toml</span>
      </button>
      <button
        @click="copyToClipboard"
        class="btn"
        :class="copySuccess ? 'btn-primary' : 'btn-secondary'"
      >
        <svg v-if="!copySuccess" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ copySuccess ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
  </div>
</template>
