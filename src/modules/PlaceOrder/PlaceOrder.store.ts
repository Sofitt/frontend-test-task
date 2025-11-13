import { reactive } from "vue";
import { OrderSide } from "@/modules/PlaceOrder/types/model.ts";

interface IStore {
  activeOrderSide: OrderSide;
  price: number;
  amount: number;
  total(): number;
  setOrderSide(side: OrderSide): void;
  setPrice(price: number): void;
  setAmount(amount: number): void;
  setTotal(total: number): void;
}

export const store = reactive<IStore>({
  activeOrderSide: "buy",
  price: 2,
  amount: 0,
  total(): number {
    return this.price * this.amount;
  },
  setOrderSide(side: OrderSide): void {
    this.activeOrderSide = side;
  },
  setPrice(price: number): void {
    this.price = price;
  },
  setAmount(amount: number): void {
    this.amount = amount;
  },
  setTotal(total: number): void {
    this.amount = this.price > 0 ? total / this.price : 0;
  },
});
