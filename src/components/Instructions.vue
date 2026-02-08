<script setup lang="ts">
import { ref } from 'vue';

const showInstructions = ref(false);
</script>

<template>
  <div class="instructions">
    <button
      @click="showInstructions = !showInstructions"
      class="w-full flex items-center justify-between text-left group"
    >
      <div class="flex items-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-teal)] text-white text-xs font-bold">4</span>
        <span class="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">CLI Usage</span>
      </div>
      <svg
        class="w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200"
        :class="{ 'rotate-180': showInstructions }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-show="showInstructions"
      class="mt-4 animate-in"
    >
      <ol class="space-y-3">
        <li class="flex gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-medium text-[var(--color-text-muted)]">1</span>
          <div>
            <p class="text-sm text-[var(--color-text)]">Install the CLI</p>
            <code class="inline-block mt-1 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded text-xs font-mono">
              pip install contriband
            </code>
          </div>
        </li>

        <li class="flex gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-medium text-[var(--color-text-muted)]">2</span>
          <div>
            <p class="text-sm text-[var(--color-text)]">Export your template (.txt or .toml)</p>
          </div>
        </li>

        <li class="flex gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-medium text-[var(--color-text-muted)]">3</span>
          <div>
            <p class="text-sm text-[var(--color-text)]">Preview your design</p>
            <code class="inline-block mt-1 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded text-xs font-mono">
              contriband preview my-design.txt
            </code>
          </div>
        </li>

        <li class="flex gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-medium text-[var(--color-text-muted)]">4</span>
          <div>
            <p class="text-sm text-[var(--color-text)]">Generate a commit plan</p>
            <code class="inline-block mt-1 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded text-xs font-mono">
              contriband plan my-design.txt --start-date 2024-01-01
            </code>
          </div>
        </li>

        <li class="flex gap-3">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-medium text-[var(--color-text-muted)]">5</span>
          <div>
            <p class="text-sm text-[var(--color-text)]">Apply to your repository</p>
            <code class="inline-block mt-1 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded text-xs font-mono">
              contriband apply plan.json --repo /path/to/repo
            </code>
          </div>
        </li>
      </ol>

      <a
        href="https://github.com/anthropics/contriband"
        target="_blank"
        class="inline-flex items-center gap-1 mt-4 text-sm text-[var(--color-blue)] hover:underline"
      >
        View documentation
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</template>
