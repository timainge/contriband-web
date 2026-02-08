<script setup lang="ts">
const heartGrid = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,1,1,1,0],
  [0,0,1,0,0],
];
const heartGreens = ['#a8bfa5', '#7da67a', '#7da67a', '#548c51', '#548c51', '#3a6e38'];
</script>

<template>
  <header class="relative overflow-hidden py-32">
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
