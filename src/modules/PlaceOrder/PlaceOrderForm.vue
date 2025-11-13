<script setup lang="ts">
import { computed } from "vue";
import NumberInput from "@/shared/components/NumberInput/NumberInput.vue";
import TakeProfit from "@/modules/PlaceOrder/components/TakeProfit.vue";
import Button from "@/shared/components/Button/Button.vue";
import {
  BASE_CURRENCY,
  QUOTE_CURRENCY,
} from "@/modules/PlaceOrder/lib/constants.ts";
import { store } from "@/modules/PlaceOrder/PlaceOrder.store";
import PlaceOrderTypeSwitch from "@/modules/PlaceOrder/components/PlaceOrderTypeSwitch.vue";
import { Tooltip } from "@/shared/components";

const submitButtonText = computed(() => {
  return store.activeOrderSide === "buy"
    ? `Buy ${BASE_CURRENCY}`
    : `Sell ${QUOTE_CURRENCY}`;
});

const submit = () => {
  console.log("submit");
};
</script>

<template>
  <form method="post" @submit="submit" class="grid gap-4">
    <div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-600">Market direction</span>
        <Tooltip text="" />
      </div>

      <PlaceOrderTypeSwitch
        class="mt-2"
        :modelValue="store.activeOrderSide"
        @update:modelValue="store.setOrderSide($event)"
      />
    </div>
    <div>
      <NumberInput
        id="price"
        :label="`Price, ${QUOTE_CURRENCY}`"
        :modelValue="store.price"
        @update:modelValue="store.setPrice($event)"
        autofocus
      />
    </div>
    <div>
      <NumberInput
        id="amount"
        :label="`Amount, ${BASE_CURRENCY}`"
        :modelValue="store.amount"
        @update:modelValue="store.setAmount($event)"
      />
    </div>
    <div>
      <NumberInput
        id="total"
        :label="`Total, ${QUOTE_CURRENCY}`"
        :modelValue="store.total()"
        @update:modelValue="store.setTotal($event)"
      />
    </div>

    <TakeProfit />

    <div>
      <Button type="submit" variant="accent" :full-width="true">
        {{ submitButtonText }}
      </Button>
    </div>
  </form>
</template>
