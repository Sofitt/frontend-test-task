<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import { ITableHeader } from "@/shared/components/Table/Table.types.ts";

interface IProps {
  headers: ITableHeader<T>[];
  items: T[];
  rowClass?: string;
  errorClass?: string;
  gridColumns?: string;
}

const props = defineProps<IProps>();

const gridStyle = computed(() =>
  props.gridColumns
    ? {}
    : {
        gridTemplateColumns: `repeat(${props.headers.length}, minmax(0, 1fr))`,
      },
);
</script>

<template>
  <div>
    <div class="mb-3 grid" :class="gridColumns || ''" :style="gridStyle">
      <div
        v-for="header of headers"
        :key="String(header.field)"
        :class="header.className"
        class="text-xs font-medium text-base-600"
      >
        {{ header.title }}
      </div>
    </div>
    <TransitionGroup name="list" tag="div">
      <div
        v-for="(item, index) of items"
        :key="index"
        :class="[gridColumns || '', item.error ? errorClass : rowClass]"
        class="grid"
        :style="gridStyle"
      >
        <div
          v-for="header of headers"
          :key="`${index}-${String(header.field)}`"
          :class="[
            header.classCol,
            item.error ? 'text-red-600' : 'text-base-950',
          ]"
        >
          <!-- В макете указан text-base-1000, но в конфиге tailwind для такого цвета используется 950. Не буду менять конфиг -->
          <slot
            :name="`cell-${String(header.field)}`"
            :item="item"
            :error="item.error"
            :value="item[header.field]"
            :index="index"
          >
            {{ item[header.field] }}
          </slot>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition:
    opacity 0.3s ease,
    max-height 0.3s ease,
    margin 0.3s ease,
    padding 0.3s ease,
    border-width 0.3s ease;
  overflow: hidden;
}

.list-enter-active {
  max-height: 500px;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-width: 0;
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
