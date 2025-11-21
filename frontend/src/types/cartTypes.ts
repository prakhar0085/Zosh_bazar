import { Product } from "./productTypes";
import { User } from "./userTypes";

export interface CartItem {
    _id: number;
    cart?: Cart;
    product: Product;
    size: string;
    quantity: number;
    mrpPrice: number;
    sellingPrice: number;
    user_id: number;
}


export interface Cart {
    _id: number;
    user: User;
    cartItems: CartItem[];
    totalSellingPrice: number;
    totalItem: number;
    totalMrpPrice: number;
    discount: number;
    couponCode: string | null;
  }
