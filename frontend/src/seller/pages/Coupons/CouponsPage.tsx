import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, Paper, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { createSellerCoupon, deleteSellerCoupon, fetchSellerCoupons } from '../../../Redux Toolkit/Seller/sellerCouponSlice';
import dayjs from 'dayjs';

const CouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { coupons, loading, error } = useAppSelector((s) => s.sellerCoupon);
  const { jwt } = useAppSelector((s) => s.sellerAuth);
  const token = jwt || localStorage.getItem('jwt') || '';

  const [form, setForm] = useState({
    code: '',
    discountPercentage: 10,
    minimumOrderValue: 0,
    validityStartDate: dayjs().toISOString(),
    validityEndDate: dayjs().add(30, 'day').toISOString(),
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchSellerCoupons(token));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'discountPercentage' || name === 'minimumOrderValue' ? Number(value) : value }));
  };

  const handleCreate = () => {
    if (!token) {
      alert('Please login as seller to create coupons');
      return;
    }
    dispatch(createSellerCoupon({ coupon: form, jwt: token }));
  };

  const handleDelete = (id: string) => {
    if (!token) return;
    dispatch(deleteSellerCoupon({ id, jwt: token }));
  };

  return (
    <div className="p-5">
      <Typography variant="h6" gutterBottom>Seller Coupons</Typography>

      <Paper className="p-4 mb-6">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField label="Code" name="code" value={form.code} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Discount %" name="discountPercentage" type="number" value={form.discountPercentage} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Min Order Value" name="minimumOrderValue" type="number" value={form.minimumOrderValue} onChange={handleChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button onClick={handleCreate} variant="contained" fullWidth disabled={loading || !form.code}>Create</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="p-4">
        <Typography variant="subtitle1" gutterBottom>My Coupons</Typography>
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c._id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{c.code} - {c.discountPercentage}%</div>
                <div className="text-sm text-gray-600">Min ₹{c.minimumOrderValue} | {dayjs(c.validityStartDate).format('YYYY-MM-DD')} to {dayjs(c.validityEndDate).format('YYYY-MM-DD')}</div>
              </div>
              <Button color="error" variant="outlined" size="small" onClick={() => handleDelete(c._id!)}>Delete</Button>
            </div>
          ))}
          {!coupons.length && <div className="text-sm text-gray-500">No coupons yet</div>}
        </div>
      </Paper>
    </div>
  );
};

export default CouponsPage;