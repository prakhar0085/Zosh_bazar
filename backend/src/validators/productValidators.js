// validators/productValidator.js
const Yup = require('yup');

const createProductSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().max(2000, 'Description is too long'),
  mrpPrice: Yup.number().required('MRP Price is required').positive('MRP Price must be a positive number'),
  sellingPrice: Yup.number().required('Selling Price is required').positive('Selling Price must be a positive number'),
  color: Yup.string().required('Color is required'),
  // Allow images to be either URLs or file objects/base64 strings
  images: Yup.array().min(1, 'At least one image is required').max(10, 'Too many images'),
  category: Yup.string().required('Category is required'),
  category2: Yup.string().required('Category2 is required'),
  category3: Yup.string().required('Category3 is required'),
  // Make sizes optional since it can be empty for some products
  sizes: Yup.string(),
  // Add quantity validation but make it optional
  quantity: Yup.number().min(0, 'Quantity must be non-negative'),
});

module.exports = {
  createProductSchema,
};
