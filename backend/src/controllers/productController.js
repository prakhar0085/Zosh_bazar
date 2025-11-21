const Product = require("../models/Product");
const Seller = require("../models/Seller");
const ProductService = require("../services/ProductService");
const { createProductSchema } = require("../validators/productValidators");
const Yup = require("yup");

class SellerProductController {
  async getProductBySellerId(req, res) {
    try {
      const seller = await req.seller;

      const products = await ProductService.getProductBySellerId(seller._id);
      res.status(200).json( products );
    } catch (error) {
      // console.log("------ ");
      res.status(400).json({ error: error.message });
    }
  }

  // Create a product
  async createProduct(req, res) {
    try {
      console.log("🛍️ Creating product with data:");
      console.log("- Title:", req.body.title);
      console.log("- Description:", req.body.description);
      console.log("- Uploaded files:", req.files?.length || 0);
      console.log("- Files info:", req.files?.map(f => ({ name: f.filename, size: f.size })));
      console.log("- Full body:", JSON.stringify(req.body, null, 2));
      
      // Preprocess the data before validation
      const processedData = { ...req.body };
      
      // Handle uploaded images - convert file paths to URLs
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        processedData.images = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
        console.log("📸 Generated image URLs:", processedData.images);
      } else if (!processedData.images || processedData.images.length === 0) {
        // If no files uploaded and no images in body, use a placeholder
        processedData.images = [];
      }
      
      // Handle empty quantity
      if (processedData.quantity === "" || processedData.quantity === null) {
        processedData.quantity = 0;
      }
      
      // Handle empty sizes
      if (processedData.sizes === "") {
        processedData.sizes = "One Size";
      }
      
      // Convert quantity to number if it's a string
      if (typeof processedData.quantity === 'string') {
        processedData.quantity = parseInt(processedData.quantity) || 0;
      }
      
      console.log("🔄 Processed data:", JSON.stringify(processedData, null, 2));
      
      // Check if at least one image is provided
      if (!processedData.images || processedData.images.length === 0) {
        return res.status(400).json({
          error: "Validation error",
          errors: ["At least one image is required"],
          count: 1,
        });
      }
      
      await createProductSchema.validate(processedData, { abortEarly: false });

      const seller = await req.seller;
      console.log("👤 Seller:", seller._id);

      const product = await ProductService.createProduct(processedData, seller);
      console.log("✅ Product created successfully:", product._id);
      
      return res.status(201).json(product);
    } catch (error) {
      console.error("❌ Error creating product:", error.message);
      console.error("❌ Error type:", error.constructor.name);
     
      if (error instanceof Yup.ValidationError) {
        console.error("❌ Validation errors:", error.errors);
        return res.status(400).json({
          error: "Validation error",
          errors: error.errors,
          count: error.errors.length,
        });
      }
      
      console.error("❌ Full error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete a product
  async deleteProduct(req, res) {
    try {
      await ProductService.deleteProduct(req.params.productId);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update a product
  async updateProduct(req, res) {
    try {
      const product = await ProductService.updateProduct(
        req.params.productId,
        req.body
      );

      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const product = await ProductService.findProductById(
        req.params.productId
      );
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Search for products by query
  async searchProduct(req, res) {
    try {
      const query = req.query.q;
      const products = await ProductService.searchProduct(query);
      return res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts(req.query);
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new SellerProductController();
