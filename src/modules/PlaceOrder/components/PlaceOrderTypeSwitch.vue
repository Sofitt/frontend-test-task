<script setup lang="ts">
import { OrderSide } from "@/modules/PlaceOrder/types/model.ts";
import { Button } from "@/shared/components";

const activeOrderSide = defineModel<OrderSide>({ default: "buy" });

const handleToggle = (orderType: OrderSide) => {
  activeOrderSide.value = orderType;
};
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      fullWidth
      :outline="activeOrderSide !== 'buy'"
      @click="handleToggle('buy')"
    >
      Buy
    </Button>
    <Button
      fullWidth
      :outline="activeOrderSide === 'buy'"
      @click="handleToggle('sell')"
    >
      Sell
    </Button>
  </div>
</template>
