import { expressjwt } from "express-jwt";
import User from "../models/user";

//9. Verify token and get current user
export const requireSignin = expressjwt({
    getToken: (req, res) => {
        const token = req.cookies.token;
        console.log('Token:', token);
        return token;
    },
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});

// Debugging example: check if secret key is being read correctly
console.log('JWT Secret:', process.env.JWT_SECRET);

export const isInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id).exec();
        if (!user.role.includes("Instructor")) {
            return res.sendStatus(403);
        } else {
            next();
        }
    } catch (err) {
        console.log("isInstructor middleware: ", err);
    }
};