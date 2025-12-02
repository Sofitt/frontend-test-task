import { ref, computed, reactive, watch } from "vue";
import { ITableHeader } from "@/shared/components/Table/Table.types.ts";
import { store } from "@/modules/PlaceOrder/PlaceOrder.store.ts";
import { roundToPrecision } from "@/shared/lib/math";

type TTakeProfitTableItem = Record<"price" | "percent" | "amount", string>;

const DISPLAY_PRECISION = 2;

export const useTakeProfit = () => {
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

  const clearItemError = (index: number) => {
    if (tableData.items[index].error) {
      tableData.items[index].error = false;

      const hasOtherErrors = tableData.items.some(
        (item, i) => i !== index && item.error,
      );
      if (!hasOtherErrors) {
        errorMessage.value = "";
      }
    }
  };

  const hasError = computed(() => {
    return tableData.items.some((item) => item.error) || !!errorMessage.value;
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

  return {
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
  };
};
