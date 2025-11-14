import { onUnmounted } from "vue";

interface UseKeyHoldOptions {
  holdDelay?: number;
  repeatInterval?: number;
  keys?: string[];
}

export const useKeyHold = (options: UseKeyHoldOptions = {}) => {
  const { holdDelay = 300, repeatInterval = 50, keys = [] } = options;

  if (!keys.length) throw new Error("Не указаны keys для остановки зажатия");

  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let repeatTimer: ReturnType<typeof setInterval> | null = null;

  const startHold = (callback: () => void) => {
    if (holdTimer) return;

    holdTimer = setTimeout(() => {
      repeatTimer = setInterval(callback, repeatInterval);
    }, holdDelay);
  };

  const stopHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (repeatTimer) {
      clearInterval(repeatTimer);
      repeatTimer = null;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (keys.includes(event.key)) {
      stopHold();
    }
  };

  onUnmounted(() => {
    stopHold();
  });

  return {
    startHold,
    stopHold,
    handleKeyUp,
  };
};
