import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utilities/error.js";

export const test = (request, response) => {
  response.send("Hello World");
};

export const updateUser = async (request, response, next) => {
  if (request.user.id !== request.params.id) {
    return next(errorHandler(401, "Unauthorized"));
  }
  try {
    if (request.body.passWord) {
      request.body.passWord = bcryptjs.hashSync(request.body.passWord, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      {
        $set: {
          userName: request.body.userName,
          eMail: request.body.eMail,
          passWord: request.body.passWord,
          avatar: request.body.avatar,
        },
      },
      { new: true }
    );
    const { passWord, ...restOfData } = updatedUser._doc;
    response.status(200).json(restOfData);
  } catch (error) {
    next(error);
  }
};
