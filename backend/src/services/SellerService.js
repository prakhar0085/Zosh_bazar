const Seller = require("../models/Seller"); // Your Seller model
const Address = require("../models/Address"); // Your Address model
const jwtProvider = require("../utils/jwtProvider"); // JWT utility
const bcrypt = require("bcrypt");
const UserRoles = require("../domain/UserRole");
const SellerError = require("../exceptions/SellerError");

class SellerService {
  async getSellerProfile(jwt) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    // console.log("email -----  ",email)
    return this.getSellerByEmail(email);
  }

  async createSeller(sellerData) {
    console.log("🔍 Checking if seller exists with email:", sellerData.email);
    const existingSeller = await Seller.findOne({ email: sellerData.email });
    if (existingSeller) {
      console.log("❌ Seller already exists with email:", sellerData.email);
      throw new SellerError("Seller already exists, use a different email");
    }

    console.log("✅ Email is unique, proceeding with registration");
    let savedAddress = sellerData.pickupAddress;

    if (!sellerData.pickupAddress._id) {
      console.log("📍 Creating new pickup address");
      try {
        savedAddress = await Address.create(sellerData.pickupAddress);
        console.log("✅ Address created successfully:", savedAddress._id);
      } catch (addressError) {
        console.error("❌ Error creating address:", addressError.message);
        throw new SellerError(`Address validation failed: ${addressError.message}`);
      }
    }

    console.log("👤 Creating seller with data:");
    console.log("- Email:", sellerData.email);
    console.log("- Seller Name:", sellerData.sellerName);
    console.log("- Mobile:", sellerData.mobile);
    console.log("- GSTIN:", sellerData.GSTIN);
    console.log("- Business Name:", sellerData.businessDetails?.businessName);

    const newSeller = new Seller({
      email: sellerData.email,
      pickupAddress: savedAddress._id || savedAddress,
      sellerName: sellerData.sellerName,
      GSTIN: sellerData.GSTIN,
      role: UserRoles.SELLER,
      mobile: sellerData.mobile,
      password: await bcrypt.hash(sellerData.password, 10),
      bankDetails: sellerData.bankDetails,
      businessDetails: sellerData.businessDetails,
    });

    try {
      const savedSeller = await newSeller.save();
      console.log("✅ Seller saved successfully:", savedSeller._id);
      return savedSeller;
    } catch (saveError) {
      console.error("❌ Error saving seller:", saveError.message);
      if (saveError.name === 'ValidationError') {
        console.error("❌ Validation details:", saveError.errors);
      }
      throw saveError;
    }
  }

  async getSellerById(id) {
    const seller = await Seller.findById(id);
    if (!seller) {
      throw new SellerError("Seller not found");
    }
    return seller;
  }

  async getSellerByEmail(email) {
    const seller = await Seller.findOne({ email }).populate("pickupAddress");
    // console.log("seller ",seller)
    if (!seller) {
      throw new SellerError("Seller not found");
    }
    return seller;
  }

  async getAllSellers(status) {
    return await Seller.find({ accountStatus: status });
  }

  async updateSeller(existingSeller, sellerData) {
    return await Seller.findByIdAndUpdate(existingSeller._id, sellerData, {
      new: true,
    }).populate("pickupAddress");
  }

  async deleteSeller(id) {
    const exists = await Seller.exists({ _id: id });
    if (!exists) {
      throw new SellerError("Seller not found with id " + id);
    }
    await Seller.deleteOne({ _id: id });
  }

  async verifyEmail(email, otp) {
    const seller = await this.getSellerByEmail(email);
    seller.isEmailVerified = true;
    return await seller.save();
  }

  async updateSellerAccountStatus(sellerId, status) {
    const seller = await this.getSellerById(sellerId);
    seller.accountStatus = status;
    return await seller.save();
  }
}

module.exports = new SellerService();
