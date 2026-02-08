<script setup lang="ts">
const columns = [3, 4, 2, 4, 1, 3];
const rows = 5;
const greenLight = '#8aba84';
const greenDark = '#3a6e38';
</script>

<template>
  <div class="flex items-end gap-3">
    <span class="inline-grid gap-[2px]" :style="{ gridTemplateColumns: `repeat(${columns.length}, 6px)`, gridTemplateRows: `repeat(${rows}, 6px)` }">
      <template v-for="row in rows" :key="row">
        <span
          v-for="(split, col) in columns"
          :key="`${row}-${col}`"
          class="rounded-[1.5px]"
          :style="{ backgroundColor: row <= split ? greenLight : greenDark }"
        ></span>
      </template>
    </span>
    <span class="text-[2rem] font-bold tracking-tight text-[var(--color-text)] leading-none">ContriBand</span>
  </div>
</template>
