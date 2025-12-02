<script setup lang="ts">
import { Table, Toggle, Tooltip, NumberInput } from "@/shared/components";
import { CrossIcon, PlusIcon } from "@/shared/icons";
import Expand from "@/shared/components/Expand/Expand.vue";
import { useTakeProfit } from "@/modules/PlaceOrder/lib/useTakeProfit";

const tooltipText =
  "lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took";

const {
  toggleValue,
  errorMessage,
  tableData,
  targetFrom,
  targetTo,
  handleDeleteFromTable,
  handleProfitBlur,
  handleTargetPriceBlur,
  handleAddTarget,
  validate,
  clearItemError,
  hasError,
  sum,
  // Вынес в хук, потому что код сильно разросся и мешает читать остальной компонент
} = useTakeProfit();

defineExpose({
  validate,
  hasError,
});

const currency = "USDT";
</script>
<template>
  <div class="bg-base-100 p-3">
    <div class="flex items-center gap-2 text-base-600">
      <Tooltip size="18" :text="tooltipText" />
      <span class="text-base font-medium">Take Profit</span>
      <Toggle class="ml-auto" v-model="toggleValue" />
    </div>
    <Expand>
      <div v-if="toggleValue" class="">
        <div class="h-4" />
        <!-- Под переполнение таблицы макет не отрисован, поэтому просто обрезаю вывод. Таблица всё еще юзабельна -->
        <Table
          :headers="tableData.headers"
          :items="tableData.items"
          row-class="pb-[3px] mb-3 border-b border-base-400"
          error-class="pb-1 mb-3 border-b border-red-400"
          gridColumns="grid-cols-[47px,minmax(0,1fr),85px] gap-3"
        >
          <template #cell-percent="{ error, index }">
            <NumberInput
              class="text-sm font-medium"
              style="overflow: hidden"
              no-style
              :modelValue="parseFloat(tableData.items[index].percent)"
              @update:modelValue="
                tableData.items[index].percent = $event.toString();
                clearItemError(index);
              "
              @blur="handleProfitBlur(index)"
              :step="[1, 10]"
            >
              <template #post-icon>
                <span class="pl-2" :class="[!error && 'text-base-600']">
                  %
                </span>
              </template>
            </NumberInput>
          </template>
          <template #cell-price="{ error, index }">
            <NumberInput
              class="text-sm font-medium"
              style="overflow: hidden"
              no-style
              :modelValue="parseFloat(tableData.items[index].price)"
              @update:modelValue="
                tableData.items[index].price = $event.toString();
                clearItemError(index);
              "
              @blur="handleTargetPriceBlur(index)"
              :step="[0.1, 1]"
            >
              <template #post-icon>
                <span :class="[!error && 'text-base-600']">{{ currency }}</span>
              </template>
            </NumberInput>
          </template>
          <template #cell-amount="{ index, error }">
            <div class="flex items-center justify-between">
              <NumberInput
                class="text-sm font-medium"
                style="overflow: hidden"
                no-style
                :modelValue="parseFloat(tableData.items[index].amount)"
                @update:modelValue="
                  tableData.items[index].amount = $event.toString();
                  clearItemError(index);
                "
                :step="[1, 10]"
              >
                <template #post-icon>
                  <span class="pl-2" :class="[!error && 'text-base-600']">
                    %
                  </span>
                </template>
              </NumberInput>
              <button
                @click="handleDeleteFromTable(index)"
                v-if="tableData.items.length > 1"
              >
                <CrossIcon class="size-4" />
              </button>
            </div>
          </template>
        </Table>

        <div
          v-if="errorMessage"
          class="my-3 px-3 py-2 text-xs font-medium text-red-500 outline outline-1 outline-red-500"
        >
          {{ errorMessage }}
        </div>

        <!-- Add -->
        <button
          @click.prevent="handleAddTarget"
          class="flex items-center gap-2"
          v-show="targetFrom < targetTo"
        >
          <PlusIcon class="size-6" />
          <span class="text-xs text-eastern-blue-600">
            Add profit target {{ targetFrom }}/{{ targetTo }}
          </span>
        </button>

        <!-- Total profit -->
        <div class="mt-4 flex items-center text-sm text-base-600">
          <span class="flex-shrink-0"> Projected profit </span>
          <div
            class="mx-2 flex-grow self-end border-b border-dashed border-base-500"
          />
          <div class="flex-shrink-0 text-base-950">
            {{ sum }} <span>{{ currency }}</span>
          </div>
        </div>
      </div>
    </Expand>
  </div>
</template>
