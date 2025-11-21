const express = require("express");
const productController = require("../controllers/productController");
const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware");
const { uploadProductImages, handleUploadError } = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.get(
  "/",
  sellerAuthMiddleware,
  productController.getProductBySellerId
);

router.post(
  "/",
  sellerAuthMiddleware,
  uploadProductImages,
  handleUploadError,
  productController.createProduct
);

router.delete(
  "/:productId",
  sellerAuthMiddleware,
  productController.deleteProduct
);

// Update a product
router.put(
  "/:productId",
  sellerAuthMiddleware,
  productController.updateProduct
);

module.exports = router;
