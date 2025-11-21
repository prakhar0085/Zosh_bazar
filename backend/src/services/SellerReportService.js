const OrderStatus = require("../domain/OrderStatus");
const SellerReport = require("../models/SellerReport");
const OrderService = require("./OrderService");

class SellerReportService {
  async getSellerReport(seller) {
    try {
      console.log("Getting report for seller:", seller._id);
      
      // Get all orders for this seller
      const orders = await OrderService.getShopsOrders(seller._id);
      console.log("Total orders found:", orders.length);

      // Calculate metrics
      const totalEarning = orders.reduce(
        (total, order) => total + (order.totalSellingPrice || 0),
        0
      );

      const canceledOrders = orders.filter(
        (order) => order.orderStatus === OrderStatus.CANCELLED
      );
      console.log("Canceled orders found:", canceledOrders.length);
      
      const totalRefunds = canceledOrders.reduce(
        (total, order) => total + (order.totalSellingPrice || 0),
        0
      );

      const deliveredOrders = orders.filter(
        (order) => order.orderStatus === OrderStatus.DELIVERED
      );

      const totalSales = deliveredOrders.length;
      const netEarnings = totalEarning - totalRefunds;

      // Find existing report or create new one
      let sellerReport = await SellerReport.findOne({ seller: seller._id });
      
      if (sellerReport) {
        // Update existing report
        sellerReport.totalOrders = orders.length;
        sellerReport.totalEarnings = totalEarning;
        sellerReport.totalSales = totalSales;
        sellerReport.canceledOrders = canceledOrders.length;
        sellerReport.totalRefunds = totalRefunds;
        sellerReport.netEarnings = netEarnings;
        sellerReport.totalTransactions = orders.length;
        
        sellerReport = await sellerReport.save();
        console.log("Updated existing seller report");
      } else {
        // Create new report
        sellerReport = new SellerReport({
          seller: seller._id,
          totalOrders: orders.length,
          totalEarnings: totalEarning,
          totalSales: totalSales,
          canceledOrders: canceledOrders.length,
          totalRefunds: totalRefunds,
          netEarnings: netEarnings,
          totalTransactions: orders.length
        });

        sellerReport = await sellerReport.save();
        console.log("Created new seller report");
      }

      console.log("Final seller report:", sellerReport);
      return sellerReport;
    } catch (err) {
      console.error("Error in getSellerReport:", err);
      throw new Error(`Error fetching seller report: ${err.message}`);
    }
  }

  async updateSellerReport(sellerReport) {
    try {
      // Update and save the seller report
      return await SellerReport.findByIdAndUpdate(
        sellerReport._id,
        sellerReport,
        { new: true }
      );
    } catch (err) {
      throw new Error(`Error updating seller report: ${err.message}`);
    }
  }
}

module.exports = new SellerReportService();
