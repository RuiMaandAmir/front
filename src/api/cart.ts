import request from './request';

// 获取购物车列表
export const getCartItems = () => {
  return request.get('/orders/cart/');
};

// 获取购物车商品数量
export const getCartCount = () => {
  return request.get('/orders/cart/count/');
};

// 添加商品到购物车
export const addToCart = (data: {
  product_id: number;
  quantity: number;
}) => {
  return request.post('/orders/cart/', data);
};

// 更新购物车商品数量
export const updateCartItem = (id: number, data: {
  quantity: number;
}) => {
  return request.put(`/orders/cart/${id}/`, data);
};

// 删除购物车商品
export const removeFromCart = (id: number) => {
  return request.delete(`/orders/cart/${id}/`);
};

// 清空购物车
export const clearCart = () => {
  return request.delete('/orders/cart/clear/');
}; 