import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// creating a register function
export const register = async (req, res, next) => {
  try {
    // encrypting the password
    const hash = bcrypt.hashSync(req.body.password, 5);
    // storing data corresponding to their field
    const newUser = new User({
      ...req.body,
      // storing pwd individually bcoz only pwd is encrypted & host represent encrypted pwd
      password: hash,
    });

    // saving/sending all data in the db
    await newUser.save();
    // success message
    res.status(201).send("User has been created.");
  } catch (error) {
    // error message
    next(error);
  }
};

// creating a login function
export const login = async (req, res, next) => {
  try {
    // finding the user details which match with requested username
    const user = await User.findOne({ username: req.body.username });

    // if not get anything
    if (!user) return next(createError(404, "User not found!"));

    // if get then compare the requested pwd with pwd present in the db
    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    // when pwd is not matched
    if (!isCorrect) return res.status(400).send("Wrong password or username!");

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );

    // destructuring the user details in two forms: pwd and other info
    const { password, ...info } = user._doc;
    // sending only other info
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (error) {
    // error message
    next(error);
  }
};

// creating a logout function
export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("Uses has been logged out");
};
