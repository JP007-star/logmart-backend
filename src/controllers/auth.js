const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const path = require('path');
const User = require("../models/User");


exports.signup = async (req, res, next) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email }).exec();
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const { firstName, lastName, email, password, profilePicture } = req.body;
    const hash_password = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      hash_password,
      profilePicture, // Use the URL directly from the request
      username: shortid.generate(),
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return res.status(201).json({
      user: savedUser,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (
      !user ||
      !user.authenticate(req.body.password) 
    ) {
      return res.status(400).json({
        message: "Invalid credentials || Something went wrong",
      });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const { _id, firstName, lastName, email, role, fullName, profilePicture } =
      user;

    return res.status(200).json({
      token,
      user: {
        _id,
        firstName,
        lastName,
        email,
        role,
        fullName,
        profilePicture,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "SignOut Successfully ....!",
  });
};
