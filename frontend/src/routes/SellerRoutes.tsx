import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from '../seller/pages/SellerDashboard/HomePage'
import Products from '../seller/pages/Products/Products'
import ProductForm from '../seller/pages/Products/AddProductForm'
import Orders from '../seller/pages/Orders/Orders'
import Profile from '../seller/pages/Account/Profile'
import Payment from '../seller/pages/Payment/Payment'
import TransactionTable from '../seller/pages/Payment/TransactionTable'
import Invetory from '../seller/pages/Invetory/Invetory'
import CouponsPage from '../seller/pages/Coupons/CouponsPage'

const SellerRoutes = () => {
  return (
         <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<Products />} />
        <Route path='/add-product' element={<ProductForm />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/invetory' element={<Invetory />} />
        <Route path='/account' element={<Profile />} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/transaction' element={<TransactionTable/>} />
        <Route path='/coupons' element={<CouponsPage/>} />
       </Routes>
  )
}

export default SellerRoutes