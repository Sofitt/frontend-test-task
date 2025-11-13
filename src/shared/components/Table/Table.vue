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
    <div class="grid" :class="gridColumns || ''" :style="gridStyle">
      <div
        v-for="header of headers"
        :key="String(header.field)"
        :class="header.className"
        class="text-xs font-medium text-base-600"
      >
        {{ header.title }}
      </div>
    </div>
    <div class="grid" :class="gridColumns || ''" :style="gridStyle">
      <template v-for="(item, index) in items" :key="index">
        <!-- TODO Исправить применение стилей к строке. Сейчас применяется к каждому вложенному элементу -->
        <div
          v-for="header of headers"
          :key="`${index}-${String(header.field)}`"
          :class="[
            header.classCol,
            item.error ? 'text-red-600' : 'text-base-950',
            item.error ? errorClass : rowClass,
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
      </template>
    </div>
  </div>
</template>
