import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utilities/error.js";
import  jwt  from "jsonwebtoken";

export const signup = async (request, response, next) => {
  const { userName, eMail, passWord } = request.body;
  const hashedPassword = bcryptjs.hashSync(passWord, 7);
  const newUser = new User({ userName, eMail, passWord: hashedPassword });
  try {
    await newUser.save();
    response.status(201).json("User Created Successfully!!!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (request, response, next) => {
  const { eMail, passWord } = request.body;
  try {
    const validUser = await User.findOne({ eMail });
    if (!validUser) {
      return next(errorHandler(404, "Email Not Found!"));
    }

    const validPassword = bcryptjs.compareSync(passWord, validUser.passWord);
    if (!validPassword) {
      return next(errorHandler(401, "Incorrect Password!"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const {passWord:pass, ...restOfData} = validUser._doc;
    response
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(restOfData);
  } catch (error) {
    next(error);
  }
};


export const google = async (request, response, next) => {
  try {
    const validUser = await User.findOne({ eMail: request.body.email });
    if(validUser){
      const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
      const {passWord:pass, ...restOfData} = validUser._doc;
      response
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(restOfData);
    }
    else{
      let _username = request.body.name.split(" ").join("").toLowerCase()+Math.random().toString(36).slice(-4);
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 7);
      const newUser = new User({ userName:_username, eMail:request.body.email, passWord: hashedPassword,avatar:request.body.photo });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const {passWord:pass, ...restOfData} = newUser._doc;
      response
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(restOfData);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (request, response,next) => {
try {
  response.clearCookie('access_token');
  response.status(200).json("User has been signed out");
} catch (error) {
  next(error);
}
};