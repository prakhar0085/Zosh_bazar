const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');
const sellerAuthMiddleware = require('../middlewares/sellerAuthMiddleware');
const { uploadProductImages, handleUploadError } = require('../middlewares/uploadMiddleware');

router.get('/profile',sellerAuthMiddleware, sellerController.getSellerProfile);

router.post('/', sellerController.createSeller);

router.get('/', sellerController.getAllSellers);

router.patch('/',sellerAuthMiddleware, sellerController.updateSeller);

router.get('/:id', sellerController.getSellerById);

router.post('/verify/login-otp', sellerController.verifyLoginOtp);




router.delete('/:id', sellerController.deleteSeller);

router.post('/verify/otp', sellerController.verifyEmail);

// Product routes for sellers
router.get('/products', sellerAuthMiddleware, productController.getProductBySellerId);
router.post('/products', sellerAuthMiddleware, uploadProductImages, handleUploadError, productController.createProduct);
router.delete('/products/:productId', sellerAuthMiddleware, productController.deleteProduct);
router.put('/products/:productId', sellerAuthMiddleware, productController.updateProduct);

module.exports = router;
