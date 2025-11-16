<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import { Table, Toggle, Tooltip, NumberInput } from "@/shared/components";
import { ITableHeader } from "@/shared/components/Table/Table.types.ts";
import { CrossIcon, PlusIcon } from "@/shared/icons";
import { store } from "@/modules/PlaceOrder/PlaceOrder.store.ts";
import { roundToPrecision } from "@/shared/lib/math";
import Expand from "@/shared/components/Expand/Expand.vue";

type TTakeProfitTableItem = Record<"price" | "percent" | "amount", string>;

const tooltipText =
  "lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took";
const DISPLAY_PRECISION = 2;

const toggleValue = ref(false);
const errorMessage = ref("");

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
  items: [],
});

watch(
  () => store.activeOrderSide,
  (value) => {
    tableData.headers.find((header) => header.field === "amount")!.title =
      `Amount to ${value}`;
  },
  { immediate: true },
);

// Сбрасываем список при переключении Toggle (по тз при включении)
watch(
  toggleValue,
  (isEnabled) => {
    if (!isEnabled) return;

    const initialProfit = 2;
    const initialPrice = roundToPrecision(
      store.price * (1 + initialProfit / 100),
      DISPLAY_PRECISION,
    );
    tableData.items = [
      {
        percent: initialProfit.toString(),
        price: initialPrice.toString(),
        amount: "100",
        error: false,
      },
    ];
  },
  { immediate: true },
);

watch(
  () => [store.price, store.activeOrderSide],
  () => {
    tableData.items.forEach((item) => {
      const profit = parseFloat(item.percent);
      if (!isNaN(profit) && store.price > 0) {
        const targetPrice = calculateTargetPrice(profit);
        item.price = targetPrice.toString();
      }
    });
  },
);

const targetFrom = computed(() => {
  return tableData.items.length;
});
const targetTo = 5;

const handleDeleteFromTable = (index: number) => {
  const deletedAmount = parseFloat(tableData.items[index].amount);
  tableData.items.splice(index, 1);

  if (tableData.items.length === 0) return;

  const firstItem = tableData.items[0];
  const newFirstAmount = parseFloat(firstItem.amount) + deletedAmount;
  firstItem.amount = roundToPrecision(
    newFirstAmount,
    DISPLAY_PRECISION,
  ).toString();
};

const calculateTargetPrice = (profit: number): number => {
  const price = store.price;
  let result;
  if (store.activeOrderSide === "buy") {
    result = price * (1 + profit / 100);
  } else {
    result = price * (1 - profit / 100);
  }
  return roundToPrecision(result, DISPLAY_PRECISION);
};

const calculateProfitFromPrice = (targetPrice: number): number => {
  const price = store.price;
  if (price === 0) return 0;

  let result;
  if (store.activeOrderSide === "buy") {
    result = ((targetPrice - price) / price) * 100;
  } else {
    result = ((price - targetPrice) / price) * 100;
  }
  return roundToPrecision(result, DISPLAY_PRECISION);
};

const handleProfitBlur = (index: number) => {
  const profit = parseFloat(tableData.items[index].percent);
  if (isNaN(profit)) return;

  const roundedProfit = roundToPrecision(profit, DISPLAY_PRECISION);
  tableData.items[index].percent = roundedProfit.toString();
  const targetPrice = calculateTargetPrice(roundedProfit);
  tableData.items[index].price = targetPrice.toString();
};

const handleTargetPriceBlur = (index: number) => {
  const targetPrice = parseFloat(tableData.items[index].price);
  if (isNaN(targetPrice)) return;

  const roundedPrice = roundToPrecision(targetPrice, DISPLAY_PRECISION);
  tableData.items[index].price = roundedPrice.toString();
  const profit = calculateProfitFromPrice(roundedPrice);
  tableData.items[index].percent = profit.toString();
};

const handleAddTarget = () => {
  const lastProfit =
    tableData.items.length > 0
      ? parseFloat(tableData.items[tableData.items.length - 1].percent)
      : 0;
  const newProfit = roundToPrecision(lastProfit + 2, DISPLAY_PRECISION);
  const targetPrice = calculateTargetPrice(newProfit);
  const newAmount = 20;

  tableData.items.push({
    percent: newProfit.toString(),
    price: targetPrice.toString(),
    amount: newAmount.toString(),
    error: false,
  });

  const totalAmount = tableData.items.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );

  if (totalAmount > 100) {
    let maxIndex = 0;
    let maxAmount = 0;
    tableData.items.forEach((item, index) => {
      const amount = parseFloat(item.amount);
      if (amount > maxAmount) {
        maxAmount = amount;
        maxIndex = index;
      }
    });

    const excess = totalAmount - 100;
    const newMaxAmount = maxAmount - excess;
    tableData.items[maxIndex].amount = newMaxAmount.toString();
  }
};

const validate = (): boolean => {
  if (!toggleValue.value) {
    return true;
  }

  errorMessage.value = "";
  tableData.items.forEach((item) => (item.error = false));

  // Сумма Profit <= 500%
  const totalProfit = tableData.items.reduce(
    (sum, item) => sum + parseFloat(item.percent || "0"),
    0,
  );
  if (totalProfit > 500) {
    errorMessage.value = "Maximum profit sum is 500%";
    tableData.items.forEach((item) => (item.error = true));
    return false;
  }

  for (let i = 0; i < tableData.items.length; i++) {
    const item = tableData.items[i];
    const profit = parseFloat(item.percent || "0");
    const targetPrice = parseFloat(item.price || "0");

    if (profit < 0.01) {
      errorMessage.value = "Minimum value is 0.01%";
      item.error = true;
      return false;
    }

    // Каждый Profit > предыдущего
    if (i > 0) {
      const prevProfit = parseFloat(tableData.items[i - 1].percent || "0");
      if (profit <= prevProfit) {
        errorMessage.value =
          "Each target's profit should be greater than the previous one";
        item.error = true;
        return false;
      }
    }

    if (targetPrice <= 0) {
      errorMessage.value = "Price must be greater than 0";
      item.error = true;
      return false;
    }
  }

  const totalAmount = tableData.items.reduce(
    (sum, item) => sum + parseFloat(item.amount || "0"),
    0,
  );

  if (totalAmount > 100) {
    const excess = totalAmount - 100;
    errorMessage.value = `${totalAmount} out of 100% selected. Please decrease by ${excess.toFixed(DISPLAY_PRECISION)}`;
    tableData.items.forEach((item) => (item.error = true));
    return false;
  }

  if (totalAmount < 100) {
    const deficit = 100 - totalAmount;
    errorMessage.value = `${totalAmount} out of 100% selected. Please increase by ${deficit.toFixed(DISPLAY_PRECISION)}`;
    tableData.items.forEach((item) => (item.error = true));
    return false;
  }

  return true;
};

defineExpose({
  validate,
});

const sum = computed(() => {
  const total = tableData.items.reduce((total, item) => {
    const targetPrice = parseFloat(item.price);
    const amountPercent = parseFloat(item.amount);
    const formPrice = store.price;

    if (isNaN(targetPrice) || isNaN(amountPercent) || isNaN(formPrice)) {
      return total;
    }

    // target amount в базовой валюте = общий amount * процент / 100
    const targetAmount = store.amount * (amountPercent / 100);

    let projectedProfit: number;
    if (store.activeOrderSide === "buy") {
      projectedProfit = targetAmount * (targetPrice - formPrice);
    } else {
      projectedProfit = targetAmount * (formPrice - targetPrice);
    }

    return total + projectedProfit;
  }, 0);

  return roundToPrecision(total, 8);
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
          error-class="pb-1 mb-3 border-b border-red-600"
          gridColumns="grid-cols-[47px,minmax(0,1fr),85px] gap-3"
        >
          <template #cell-percent="{ error, index }">
            <NumberInput
              class="text-sm font-medium"
              style="overflow: hidden"
              no-style
              :modelValue="parseFloat(tableData.items[index].percent)"
              @update:modelValue="
                tableData.items[index].percent = $event.toString()
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
                tableData.items[index].price = $event.toString()
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
                  tableData.items[index].amount = $event.toString()
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
          class="my-3 border border-red-500 px-3 py-2 text-xs font-medium text-red-500"
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
