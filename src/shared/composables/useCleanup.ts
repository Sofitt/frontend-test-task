import { onMounted, onUnmounted } from "vue";

// Эта композиция нужна в большинстве проектов, где нужно вешать события на страницу. Так как регистрация события будет сниматься сразу после unmount компонента
export const useCleanup = <F extends (...args: any[]) => () => any>(
  callback: F,
) => {
  onMounted(() => {
    const clean = callback();
    onUnmounted(clean);
  });
};
