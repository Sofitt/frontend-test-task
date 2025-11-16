<script setup lang="ts">
import { useCleanup } from "@/shared/composables/useCleanup.ts";

// Вертикальная версия
const props = withDefaults(
  defineProps<{
    duration?: number;
  }>(),
  {
    duration: 300,
  },
);

const enter = (el: any) => {
  el.style.height = "auto";

  const height = getComputedStyle(el).height;

  el.style.height = 0;

  requestAnimationFrame(() => {
    el.style.height = height;
  });
};

const afterEnter = (el: any) => {
  el.style.height = "auto";
};

const leave = (el: any) => {
  el.style.height = getComputedStyle(el).height;

  requestAnimationFrame(() => {
    el.style.height = 0;
  });
};

useCleanup(() => {
  const dataAttrName = `data-expand-full-${String(props.duration)}`;
  const el = document.querySelector(`style[${dataAttrName}]`);
  if (el) {
    el.remove();
  }
  const styleEl = document.createElement("style");
  styleEl.setAttribute(dataAttrName, "true");
  styleEl.textContent = `
.expand-full-enter-active,
.expand-full-leave-active {
  transition: width ${props.duration}ms ease, height ${props.duration}ms ease;
}
    `;
  document.head.appendChild(styleEl);
  return () => document.querySelector(`style[${dataAttrName}]`)?.remove();
});
</script>

<template>
  <transition
    name="expand-full"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot></slot>
  </transition>
</template>

<style>
.expand-full-enter-active,
.expand-full-leave-active {
  overflow: hidden;
}
</style>
