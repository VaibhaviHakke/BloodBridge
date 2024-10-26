const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// const registerController = async (req, res) => {
//   try {
//     const existingUser = await userModel.findOne({ email: req.body.email });

//     // Validation
//     if (existingUser) {
//       return res.status(200).send({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);
//     req.body.password = hashedPassword;

//     // Handle Image
//     let image1 = { public_id: null, URL: null };
//     console.log(req.body);
//     if (req.body.image) {
//       image1 = {
//         public_id: req.body.image.public_id, // From middleware
//         URL: req.body.image.secure_url, // From middleware
//       };
//       console.log(image1);
//     }
//     // console.log("Image",image);
//     // Create new user
//     const user = new userModel({
//       ...req.body,
//       image1,
//     });
//     console.log("User from cloudinary",user);
//     await user.save();

//     return res.status(201).send({
//       success: true,
//       message: "User registered successfully",
//       user,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in register API",
//       error,
//     });
//   }
// };
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    // Validation
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Handle Image
    let image = { public_id: null, URL: null };
    if (req.file) {
      image = {
        public_id: req.file.public_id, // From Cloudinary
        URL: req.file.secure_url, // From Cloudinary
      };
    }
    // Create new user
    const user = new userModel({
      ...req.body,
      image,
    });
    console.log("User from cloudinary", user);
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in register API",
      error,
    });
  }
};


// Login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check role
    if (user.role !== req.body.role) {
      return res.status(500).send({
        success: false,
        message: "Role doesn't match",
      });
    }

    // Compare password
    const comparePassword = await bcrypt.compare(req.body.password, user.password);
    if (!comparePassword) {
      return res.status(500).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login API",
      error,
    });
  }
};

// Get current user
const currentUserController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to get current user",
      error,
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
