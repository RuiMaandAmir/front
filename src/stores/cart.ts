import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    items.value.push(item);
  };

  const removeItem = (itemId: number) => {
    items.value = items.value.filter(item => item.id !== itemId);
  };

  const clearCart = () => {
    items.value = [];
  };

  return {
    items,
    addItem,
    removeItem,
    clearCart
  };
}); 