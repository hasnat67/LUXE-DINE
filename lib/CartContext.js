"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);
const CartDispatchContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + (action.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, quantity: action.quantity || 1 },
        ],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "SET_TABLE":
      return { ...state, tableNumber: action.tableNumber };
    case "SET_INSTRUCTIONS":
      return { ...state, specialInstructions: action.instructions };
    case "CLEAR_CART":
      return { items: [], tableNumber: state.tableNumber, specialInstructions: "" };
    case "LOAD_CART":
      return action.cart;
    default:
      return state;
  }
}

const initialState = {
  items: [],
  tableNumber: "",
  specialInstructions: "",
};

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("luxe-dine-cart");
      if (saved) {
        dispatch({ type: "LOAD_CART", cart: JSON.parse(saved) });
      }
      // Check for table number in URL
      const params = new URLSearchParams(window.location.search);
      const table = params.get("table");
      if (table) {
        dispatch({ type: "SET_TABLE", tableNumber: table });
      }
    } catch (e) {
      console.log("Could not load cart", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("luxe-dine-cart", JSON.stringify(cart));
    } catch (e) {
      console.log("Could not save cart", e);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export function useCartDispatch() {
  return useContext(CartDispatchContext);
}

export function getCartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
