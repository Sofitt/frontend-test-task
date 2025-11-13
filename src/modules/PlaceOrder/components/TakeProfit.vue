<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { Table, Toggle, Tooltip } from "@/shared/components";
import { ITableHeader } from "@/shared/components/Table/Table.types.ts";
import { CrossIcon, PlusIcon } from "@/shared/icons";

type TTakeProfitTableItem = Record<"price" | "percent" | "amount", string>;

const tooltipText =
  "lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took";

const toggleValue = ref(false);

const tableData = reactive<{
  headers: ITableHeader<TTakeProfitTableItem>[];
  items: (TTakeProfitTableItem & {
    error: boolean;
  })[];
}>({
  headers: [
    {
      title: "Profit",
      field: "percent",
      className: "",
      classCol: "text-sm font-medium",
    },
    {
      title: "Target price",
      field: "price",
      className: "",
      classCol: "text-sm font-medium",
    },
    {
      title: "Amount to sell",
      field: "amount",
      className: "text-right",
      classCol: "text-sm font-medium",
    },
  ],
  items: [
    {
      percent: "2",
      price: "10000.9",
      amount: "40",
      error: false,
    },
    {
      percent: "4",
      price: "10000.9",
      amount: "40",
      error: true,
    },
  ],
});
const anyError = computed(() => {
  return tableData.items.some((i) => i.error);
});

const targetFrom = computed(() => {
  return tableData.items.length;
});
const targetTo = ref(5); // todo Убедится, что статичное число

const onDeleteFromTable = (index: number) => {
  tableData.items.splice(index);
};
const onAddTarget = () => {
  // todo
};

const sum = computed(() => {
  return 0.59; // todo
});
const currency = "USDT"; // todo проверить
</script>
<template>
  <div>
    <div class="flex items-center gap-2 text-base-600">
      <Tooltip :text="tooltipText" />
      <span class="text-sm font-medium">Take Profit</span>
      <Toggle class="ml-auto" v-model="toggleValue" />
    </div>
    <div v-if="toggleValue" class="mt-4">
      <Table
        :headers="tableData.headers"
        :items="tableData.items"
        row-class="pb-1 mb-3 border-b border-base-400"
        error-class="pb-1 mb-3 border-b border-red-600"
        gridColumns="grid-cols-[50px,1fr,83px]"
        class="gap-3"
      >
        <template #cell-percent="{ value, error }">
          <div class="flex items-center gap-2.5">
            <span>{{ value }}</span>
            <span :class="[!error && 'text-base-600']">%</span>
          </div>
        </template>
        <template #cell-price="{ value, error }">
          <div class="flex items-center gap-2.5">
            <span>{{ value }}</span>
            <!-- TODO -->
            <span :class="[!error && 'text-base-600']">{{ currency }}</span>
          </div>
        </template>
        <template #cell-amount="{ value, index, error }">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span>{{ value }}</span>
              <span :class="[!error && 'text-base-600']">%</span>
            </div>
            <button @click="onDeleteFromTable(index)">
              <CrossIcon class="size-4" />
            </button>
          </div>
        </template>
      </Table>

      <div
        v-if="anyError"
        class="my-3 border border-red-500 px-3 py-2 text-xs font-medium text-red-500"
      >
        Error text description error text error text
      </div>

      <!-- Add -->
      <button
        class="gap- flex items-center gap-2"
        @click="onAddTarget"
        v-if="targetFrom < targetTo"
      >
        <PlusIcon class="size-5" />
        <span class="text-xs text-eastern-blue-600">
          Add profit target {{ targetFrom }}/{{ targetTo }}
        </span>
      </button>

      <!-- Total profit -->
      <div class="mt-4 flex items-center text-sm text-base-600">
        <span class="flex-shrink-0"> Projected profit </span>
        <div class="mx-2 flex-grow border-b border-dashed border-base-500" />
        <div class="flex-shrink-0 text-base-950">
          {{ sum }} <span>{{ currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
