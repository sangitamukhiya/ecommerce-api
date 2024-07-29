import express from "express";
import connectDB from "./db.connect.js";
import userRoutes from "./src/user/user.router.js";
import productRoutes from "./src/product/product.router.js";
import cartRoutes from "./src/cart/cart.router.js";

import cors from "cors";
const app = express();

//to make app understand json

app.use(express.json());

//enable cors
//cross origin Resources sharing

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

//connect database
connectDB();

//register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);

//network port and server
const PORT = 8001;
app.listen(PORT, (req, res) => {
  console.log(`App is listening on port ${PORT}`);
});
