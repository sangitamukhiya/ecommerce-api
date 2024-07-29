import mongoose from "mongoose";

// set rule
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "grocery",
        "electronics",
        "furniture",
        "electrical",
        "kitchen",
        "kids",
        "sports",
        "auto",
        "clothes",
        "shoes",
        "pharmaceuticals",
        "stationery",
        "cosmetics",
      ],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    sellerId: {
      type: mongoose.ObjectId,
      required: true,
      ref: "users",
    },
    availableQuantity: {
      type: Number,
      min: 1,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000,
      minlength: 200,
    },
    image: {
      type: String,
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
// TODO: convert paisa to rs
productSchema.methods.toJSON = function () {
  var obj = this.toObject(); //or var obj = this;
  obj.price = obj.price / 100;
  return obj;
};

// create collection
const Product = mongoose.model("Product", productSchema);

export default Product;
