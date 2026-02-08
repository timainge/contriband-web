<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppLogo from './components/AppLogo.vue';
import GitHubLink from './components/GitHubLink.vue';
import HeroSection from './components/HeroSection.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import GridEditor from './components/GridEditor.vue';
import ContentCards from './components/ContentCards.vue';
import { useTemplate } from './composables/useTemplate';

// Editor mode state
export type EditorMode = 'draw' | 'text' | 'sprite';
const activeMode = ref<EditorMode>('draw');
const drawIntensity = ref(4);

const { undo } = useTemplate();

// Global keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo();
    return;
  }

  if (e.key >= '0' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
    drawIntensity.value = parseInt(e.key);
    activeMode.value = 'draw';
    return;
  }

  if (e.key === 'd' || e.key === 'D') { activeMode.value = 'draw'; return; }
  if (e.key === 't' || e.key === 'T') { activeMode.value = 'text'; return; }
  if (e.key === 's' || e.key === 'S') { activeMode.value = 'sprite'; return; }

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
    <nav class="h-20">
      <div class="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 h-full flex items-end pb-2 gap-3">
        <AppLogo />
        <GitHubLink href="https://github.com/timainge/contriband-web" label="GitHub" class="ml-auto" />
      </div>
    </nav>

    <HeroSection class="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6 w-full" />

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

    <ContentCards class="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-6" />
  </div>
</template>
