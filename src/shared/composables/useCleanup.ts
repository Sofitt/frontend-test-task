import { onMounted, onUnmounted } from "vue";

export const useCleanup = <F extends (...args: any[]) => () => any>(
  callback: F,
) => {
  onMounted(() => {
    const clean = callback();
    onUnmounted(clean);
  });
};
