import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Coupon, CouponState } from "../../types/couponTypes";
import { api } from "../../Config/Api";

const API_URL = "/api/coupons";

export const createSellerCoupon = createAsyncThunk<
  Coupon,
  { coupon: any; jwt: string },
  { rejectValue: string }
>("sellerCoupon/create", async ({ coupon, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.post(`${API_URL}/seller/create`, coupon, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to create coupon");
  }
});

export const deleteSellerCoupon = createAsyncThunk<
  string,
  { id: string; jwt: string },
  { rejectValue: string }
>("sellerCoupon/delete", async ({ id, jwt }, { rejectWithValue }) => {
  try {
    const response = await api.delete(`${API_URL}/seller/delete/${id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to delete coupon");
  }
});

export const fetchSellerCoupons = createAsyncThunk<
  Coupon[],
  string,
  { rejectValue: string }
>("sellerCoupon/fetchAll", async (jwt, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/seller/all`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Failed to fetch coupons");
  }
});

const initialState: CouponState = {
  coupons: [],
  cart: null,
  loading: false,
  error: null,
  couponCreated: false,
  couponApplied: false,
};

const sellerCouponSlice = createSlice({
  name: "sellerCoupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.couponCreated = false;
      })
      .addCase(
        createSellerCoupon.fulfilled,
        (state, action: PayloadAction<Coupon>) => {
          state.loading = false;
          state.coupons.push(action.payload);
          state.couponCreated = true;
        }
      )
      .addCase(createSellerCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create coupon";
      })
      .addCase(fetchSellerCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSellerCoupons.fulfilled,
        (state, action: PayloadAction<Coupon[]>) => {
          state.loading = false;
          state.coupons = action.payload;
        }
      )
      .addCase(fetchSellerCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch coupons";
      })
      .addCase(deleteSellerCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSellerCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter((c) => c._id !== (action.meta.arg as any).id);
      })
      .addCase(deleteSellerCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete coupon";
      });
  },
});

export default sellerCouponSlice.reducer;