<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import InfoIcon from "@/shared/icons/InfoIcon/InfoIcon.vue";

interface IProps {
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

const props = withDefaults(defineProps<IProps>(), {
  position: "top",
});

const isVisible = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const adjustedPosition = ref<"top" | "bottom" | "left" | "right">(
  props.position,
);

const tooltipClasses = computed(() => {
  const base =
    "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none w-max max-w-sm";
  const positions = {
    top: "-translate-x-1/2 bottom-full left-1/2 mb-2",
    bottom: "-translate-x-1/2 top-full left-1/2 mt-2",
    left: "-translate-y-1/2 right-full top-1/2 mr-2",
    right: "-translate-y-1/2 left-full top-1/2 ml-2",
  };
  return `${base} ${positions[adjustedPosition.value]}`;
});

const showTooltip = () => {
  isVisible.value = true;
  adjustPosition();
};

const hideTooltip = () => {
  isVisible.value = false;
};

const adjustPosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 8;

  let newPosition = props.position;

  if (
    props.position === "top" &&
    triggerRect.top - tooltipRect.height < margin
  ) {
    newPosition = "bottom";
  } else if (
    props.position === "bottom" &&
    triggerRect.bottom + tooltipRect.height > viewportHeight - margin
  ) {
    newPosition = "top";
  } else if (
    props.position === "left" &&
    triggerRect.left - tooltipRect.width < margin
  ) {
    newPosition = "right";
  } else if (
    props.position === "right" &&
    triggerRect.right + tooltipRect.width > viewportWidth - margin
  ) {
    newPosition = "left";
  }

  if (newPosition === "top" || newPosition === "bottom") {
    const centerX = triggerRect.left + triggerRect.width / 2;
    const halfTooltipWidth = tooltipRect.width / 2;

    if (centerX - halfTooltipWidth < margin) {
      newPosition = "right";
    } else if (centerX + halfTooltipWidth > viewportWidth - margin) {
      newPosition = "left";
    }
  }

  adjustedPosition.value = newPosition;
};

onMounted(() => {
  window.addEventListener("scroll", adjustPosition, true);
  window.addEventListener("resize", adjustPosition);
});

onUnmounted(() => {
  window.removeEventListener("scroll", adjustPosition, true);
  window.removeEventListener("resize", adjustPosition);
});
</script>

<template>
  <div class="relative inline-block">
    <div ref="triggerRef" @mouseenter="showTooltip" @mouseleave="hideTooltip">
      <slot>
        <InfoIcon class="size-4" />
      </slot>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isVisible && text" ref="tooltipRef" :class="tooltipClasses">
        {{ text }}
      </div>
    </Transition>
  </div>
</template>
