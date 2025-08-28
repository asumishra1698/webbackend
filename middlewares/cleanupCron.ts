import cron from "node-cron";

import BlogPost from "../models/blog/BlogPost";
import BlogCategory from "../models/blog/BlogCategory";
import BlogTag from "../models/blog/BlogTag";
import contactFormModal from "../models/contact/contactFormModal";
import User from "../models/auth/authModal";
import Product from "../models/products/productModel";
import ProductTag from "../models/products/productTagModel";
import ProductBrand from "../models/products/productBrandModal";
import productCategoryModel from "../models/products/productCategoryModel";

// User
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await User.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// Product
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await Product.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// Product Category
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await productCategoryModel.deleteMany({
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

// Product Brand
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await ProductBrand.deleteMany({
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

// Blog Tag
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await BlogTag.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});

// contact Form
cron.schedule("0 2 * * *", async () => {
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await contactFormModal.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: twoMonthsAgo },
  });
});
