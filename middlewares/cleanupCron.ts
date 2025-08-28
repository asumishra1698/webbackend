import cron from "node-cron";
import Product from "../models/products/productModel";
import ProductTag from "../models/products/productTagModel";
import BlogPost from "../models/blog/BlogPost";
import BlogCategory from "../models/blog/BlogCategory";

// Product
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await Product.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// Product Tag
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await ProductTag.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// Blog Post
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await BlogPost.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// Blog Category
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await BlogCategory.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});
