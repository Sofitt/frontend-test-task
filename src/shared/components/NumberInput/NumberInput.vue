<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useKeyHold } from "@/shared/composables/useKeyHold";
import { roundToPrecision } from "@/shared/lib/math";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
  label: {
    type: String,
    default: undefined,
  },
  modelValue: {
    type: Number,
    default: NaN,
  },
  step: {
    type: Array as () => number[],
    default: () => [1, 100],
  },
  positiveOnly: {
    type: Boolean,
    default: true,
  },
  noStyle: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement | null>(null);
const displayValue = ref("");

const keys = ["ArrowUp", "ArrowDown"];

const singleStep = props.step[0] || 1;
const holdStep = props.step.length > 1 ? props.step[1] : props.step[0];

const inputWidth = computed(() => {
  const ln = displayValue.value.length;
  const spacesCount = (displayValue.value.match(/\s/g) || []).length;
  let width: number = ln;
  if (!displayValue.value.includes(".")) {
    width = spacesCount > 0 ? ln : ln + 1;
  } else if (ln > 6) {
    width = ln - 1;
  }
  return `${Math.max(1, width)}ch`;
});

const { startHold, handleKeyUp } = useKeyHold({
  holdDelay: 300,
  repeatInterval: 50,
  keys,
});

const formatNumber = (num: number): string => {
  if (isNaN(num)) return "";
  const [integer, decimal] = num.toString().split(".");
  const formattedInteger = parseInt(integer).toLocaleString("ru-RU");
  return decimal !== undefined
    ? `${formattedInteger}.${decimal}`
    : formattedInteger;
};

const parseFormattedNumber = (str: string): number => {
  const cleaned = str.replace(/\s/g, "").replace(",", ".");
  return cleaned === "" ? NaN : parseFloat(cleaned);
};

watch(
  () => props.modelValue,
  (newValue) => {
    const currentNum = parseFormattedNumber(displayValue.value);
    if (currentNum !== newValue) {
      displayValue.value = formatNumber(newValue);
    }
  },
  { immediate: true },
);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPos = target.selectionStart || 0;
  const oldValue = displayValue.value;
  let newValue = target.value;

  const cleaned = newValue.replace(/\s/g, "").replace(",", ".");
  if (cleaned !== "" && !/^\d*\.?\d*$/.test(cleaned)) {
    target.value = oldValue;
    displayValue.value = oldValue;
    return;
  }

  const num = parseFormattedNumber(newValue);
  const formatted = formatNumber(num);

  displayValue.value = formatted;
  target.value = formatted;

  const spacesBefore = (oldValue.slice(0, cursorPos).match(/\s/g) || []).length;
  const spacesAfter = (formatted.slice(0, cursorPos).match(/\s/g) || []).length;
  const newCursorPos = cursorPos + (spacesAfter - spacesBefore);

  setTimeout(() => {
    target.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);

  emit("update:modelValue", num);
};

const handleKeyDown = (event: KeyboardEvent) => {
  // Убираем сабмит на enter, тк это по ux неудобно ввиду большого количества инпутов
  if (event.key === "Enter") {
    event.preventDefault();
    return;
  }

  // Не работает если длинна числа >16 символов. BigInt решил не делать, чтобы это пофиксить
  if (keys.includes(event.key)) {
    event.preventDefault();

    const currentValue = parseFormattedNumber(displayValue.value) || 0;
    const increment = event.key === "ArrowUp" ? singleStep : -singleStep;
    let newValue = roundToPrecision(currentValue + increment);

    if (props.positiveOnly && newValue < 0) {
      newValue = 0;
    }

    displayValue.value = formatNumber(newValue);
    emit("update:modelValue", newValue);

    startHold(() => {
      const current = parseFormattedNumber(displayValue.value) || 0;
      const step = event.key === "ArrowUp" ? holdStep : -holdStep;
      let updated = roundToPrecision(current + step);

      if (props.positiveOnly && updated < 0) {
        updated = 0;
      }

      displayValue.value = formatNumber(updated);
      emit("update:modelValue", updated);
    });
  } else if (
    event.key.length === 1 &&
    !/[\d.,]/.test(event.key) &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.preventDefault();
  }
};
</script>

<template>
  <div
    :style="$attrs.style as any"
    :class="[
      !noStyle &&
        'group bg-base-100 px-3 pb-1.5 pt-2 focus-within:bg-base-200 hover:bg-base-200',
    ]"
  >
    <label :for="id">
      <span v-if="label" class="mb-0.5 block text-sm font-medium text-base-600">
        {{ label }}
      </span>

      <span class="flex items-center">
        <input
          :id="id"
          ref="inputRef"
          type="text"
          :class="[
            !noStyle
              ? 'block w-full border-0 bg-base-100 p-0 text-base-950 placeholder:text-gray-400 focus:bg-base-200 focus:outline-none group-hover:bg-base-200'
              : 'bg-transparent outline-none',
          ]"
          :style="noStyle ? { width: inputWidth } : undefined"
          v-bind="{ ...$attrs, style: '' }"
          :value="displayValue"
          @input="handleInput($event)"
          @keydown="handleKeyDown($event)"
          @keyup="handleKeyUp($event)"
        />
        <slot name="post-icon" />
      </span>
    </label>
  </div>
</template>
