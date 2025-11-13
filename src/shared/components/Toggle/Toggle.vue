<!--
  Примечание: В этом компоненте используется <button> вместо <input type="checkbox">.
  Причина: у чекбокса есть проблемы с перехватом нажатия, когда визуально чекбокс
  становится прочеканым, а в модели DOM дерева значение стоит false.
-->
<script setup lang="ts">
interface IProps {
  defaultValue?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  circleColor?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  defaultValue: false,
  activeColor: "bg-eastern-blue-600",
  inactiveColor: "bg-base-500",
  circleColor: "bg-white",
});

const modelValue = defineModel<boolean>({ default: false });

const toggle = () => {
  modelValue.value = !modelValue.value;
};
</script>

<template>
  <button
    type="button"
    class="relative h-6 w-[42px] cursor-pointer rounded-full border-none p-0 transition-colors duration-300"
    :class="modelValue ? props.activeColor : props.inactiveColor"
    @click="toggle"
  >
    <span
      class="shadow-1 absolute left-[3px] top-[3px] size-[18px] rounded-full transition-transform duration-300"
      :class="[props.circleColor, { 'translate-x-full': modelValue }]"
    />
  </button>
</template>
