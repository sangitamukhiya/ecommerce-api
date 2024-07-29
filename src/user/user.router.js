import { Router } from "express";
import { registerUserValidationSchema } from "./user.validation.js";
import User from "./user.model.js";
import { loginUserValidationSchema } from "./user.validation.js";

import bcrypt from "bcrypt";
import validateReqBody from "../middleware/validation.midleware.js";
import jwt from "jsonwebtoken";

const router = Router();

//register user
//its just creating  new user
//forget not: to hash password before saving user in to db

router.post(
  "/user/register",
  validateReqBody(registerUserValidationSchema),

  async (req, res) => {
    // extract new user from req.body
    const newUser = req.body;

    //? check if user with provided already exist in our system
    //find user by email
    const user = await User.findOne({ email: newUser.email });
    // console.log(newUser);
    //if user ,throw error
    if (user) {
      return res.status(409).send({ message: "Email already exist." });
    }

    //just before saving user ,we need to create hash password
    const plainPassword = newUser.password;
    const saltRound = 10; //to add randomness
    const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

    //update new user password with hash password
    newUser.password = hashedPassword;

    //ssave user
    await User.create(newUser);

    //send response
    return res.status(201).send({ message: "User is register successfully." });
  }
);

//Login user
router.post(
  "/user/login",
  async (req, res, next) => {
    // extract new values from req.body
    const newData = req.body;
    // console.log(newData);
    try {
      const validatedData = await loginUserValidationSchema.validate(newData);
      req.body = validatedData;
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }

    // call next function
    next();
  },
  async (req, res) => {
    // extract login credentials from req.body
    const loginCredentials = req.body;

    // find user by using email from login credentials
    const user = await User.findOne({ email: loginCredentials.email });
    // console.log(user);
    // if user not found, throw new error
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials." });
    }

    // check for password match
    const plainPassword = loginCredentials.password;
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);
    // console.log(isPasswordMatch);
    //if not password match, throw error
    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Invalid credentials." });
    }

    // generate access token
    const payload = { email: user.email };

    const token = jwt.sign(payload, "3ea1fceaff25bdcca1");

    // to hide password
    user.password = undefined;

    // send response
    return res
      .status(200)
      .send({ message: "success", userDetails: user, accessToken: token });
  }
);

export default router;
