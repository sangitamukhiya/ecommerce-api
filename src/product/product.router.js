import express from "express";
import {
  isBuyer,
  isSeller,
  isUser,
} from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validation.midleware.js";
import {
  addProductValidationSchema,
  listProductByBuyerValidationschema,
  paginationValidationSchema,
} from "./product.validation.js";
import Product from "./product.model.js";
import validateIdFromReqParams from "../middleware/validation.id.middleware.js";
const router = express.Router();

// add product
// steps:
// 1.logged in user must be seller
// 2.validate req body
// 3.create product
router.post(
  "/product/add",
  isSeller,
  validateReqBody(addProductValidationSchema),

  async (req, res) => {
    // extract new porduct ffrom req.body
    // console.log(req.body)
    const newProduct = req.body;

    //extract loggedInUserId
    const loggedInUserId = req.loggedInUserId;
    newProduct.sellerId = loggedInUserId;

    //change price to lowest unit i.e paisa ,cent
    // newProduct.price = newProduct.price * 100;

    //create product
    await Product.create(newProduct);
    return res.status(200).send({ message: "Product is added sucefully." });
  }
);

//get product details
router.post(
  "/product/details/:id",
  isUser,
  validateIdFromReqParams,

  async (req, res) => {
    //extract productId from req.params

    const productId = req.params.id;

    //find product
    const product = await Product.findOne({ _id: productId });

    //if not product,throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }
    //send res
    return res
      .status(200)
      .send({ message: "success", productDetails: product });
  }
);

//delete a product
router.delete(
  "/product/delete/:id",
  isSeller,
  validateIdFromReqParams,
  async (req, res) => {
    //extract product id from req.params
    const productId = req.params.id;

    //find product
    const product = await Product.findOne({ _id: productId });

    //if not find, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }
    // console.log(product);

    //check product ownership
    //to be product owner:product selledId  must be equal to loged in user id
    const sellerId = product.sellerId;
    const loggedInUserId = req.loggedInUserId;
    // console.log(selledId, loggedInUserId);

    //const isProductOwner = String(selledId) === String(loggedInUserId);
    // alternative code
    const isProductOwner = sellerId.equals(loggedInUserId);

    // if not product owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }

    // delete product
    await Product.deleteOne({ _id: productId });

    // send response
    return res
      .status(200)
      .send({ message: "Product is removed successfully." });
    //if not product owner, throw error
  }
);

// edit a product
router.put(
  "/product/edit/:id",
  isSeller,
  validateIdFromReqParams,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find product by id
    const product = await Product.findById(productId);

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    // check for product ownership
    // product's sellerId must be same with loggedInUserId
    const productOwnerId = product.sellerId;
    const loggedInUserId = req.loggedInUserId;

    const isProductOwner = productOwnerId.equals(loggedInUserId);

    // if not owner of product, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }

    // extract newValues from req.body
    const newValues = req.body;

    //change price to lowest unit i.e paisa ,cent
    // newValues.price = newValues.price * 100;

    // edit product
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          ...newValues,
        },
      }
    );

    // send response
    return res
      .status(200)
      .send({ message: "Product is updated successfully." });
  }
);

// list product by buyer
router.post(
  "/product/list/buyer",
  isBuyer,
  validateReqBody(listProductByBuyerValidationschema),
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit, searchText, category, minPrice, maxPrice } = req.body;
    // console.log({ page, limit, searchText, category, minPrice, maxPrice });

    const skip = (page - 1) * limit;
    let match = {};

    if (searchText) {
      match = { name: { $regex: searchText, $options: "i" } };
    }
    if (category) {
      match = { ...match, category: category };
    }
    if (maxPrice < minPrice) {
      return res
        .status(409)
        .send({ message: "Min price cannot be greater than max price" });
    }

    if (minPrice && maxPrice) {
      match = { ...match, price: { $gte: minPrice, $lte: maxPrice } };
    }

    const products = await Product.aggregate([
      {
        $match: match,
      },
      {
        $skip: skip,
      },
      { $limit: limit },
      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          category: 1,
          freeShipping: 1,
          availableQuanity: 1,
          description: { $substr: ["$description", 0, 200] },
          image: 1,
        },
      },
    ]);

    //calculate page
    const totalProducts = await Product.find(match).countDocuments();
    //total pages
    const totalPage = Math.ceil(totalProducts / limit);

    return res
      .status(200)
      .send({ message: "success", productList: products, totalPage });
  }
);

// list product by seller
router.post(
  "/product/list/seller",
  isSeller,
  validateReqBody(paginationValidationSchema),
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    const products = await Product.aggregate([
      {
        $match: {
          sellerId: req.loggedInUserId,
        },
      },

      { $skip: skip },

      { $limit: limit },

      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          category: 1,
          freeShipping: 1,
          availableQuanity: 1,
          description: { $substr: ["$description", 0, 200] },
          image: 1,
        },
      },
    ]);
    //calculate page
    const totalProducts = await Product.find({
      sellerId: req.loggedInUserId,
    }).countDocuments();
    //total pages
    const totalPage = Math.ceil(totalProducts / limit);

    return res
      .status(200)
      .send({ message: "success", productList: products, totalPage });
  }
);

export default router;
