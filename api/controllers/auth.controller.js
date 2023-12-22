import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

export const signup = async (request, response) => {
    const {userName,eMail,passWord} = request.body;
    const hashedPassword = bcryptjs.hashSync(passWord,7);
    const newUser = new User({ userName, eMail, passWord: hashedPassword });
    try {
         await newUser.save();
         response.status(201).json("User Created Successfully!!!");
    } catch (error) {
        response.status(500).json(error.message);
    }
   
};
