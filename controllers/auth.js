import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid'

export const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, email, username, password } = req.body;
    // validation
    if (!name) return res.status(400).send('Name is required');
    if (!username) return res.status(400).send('Name is required');
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send('Password is required and should be min 6 characters long');
    }
    // let userExist = await User.findOne({email: email}).exec();
    // if (userExist) return res.status(400).send('Email is taken');

    let userExist = await User.findOne({ $or: [{ email: email }, { username: username }] }).exec();
    if (userExist) {
    if (userExist.email === email) {
    return res.status(400).send('Email is taken');
  } else {
    return res.status(400).send('Username is taken');
  }
  }
  // let userExist = await User.findOne({ email: email }).exec();
  // if (userExist) {
  //   return res.status(400).send("Email is taken");
  // }
  // userExist = await User.findOne({ username: username }).exec();
  // if (userExist) {
  //   return res.status(400).send("Username is taken");
  // }

  // hash password
  const hashedPassword = await hashPassword(password);
  // register
  const user = await new User({
    name, email, username, password: hashedPassword
  }).save();
  // await user.save();
  console.log('REGISTER USER', user);
  return res.json({ ok: true});
  } catch (err) {
    console.log(err)
    return res.status(400).send('Error. Try again.');
  }
};
  // const { name, email, password } = req.body;
  // console.log('Name:', name);
  // console.log('Email:', email);
  // console.log('Password:', password);
  // res.json('Register User response from controller');

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    // check if our database has user with that email or username
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send('No user found');
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).send('Wrong password');
    // create signed jwt
    const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});
    // return user and token to client, exclude hashed password
    user.password = undefined;
    // send token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      // secure: true // only works on https
    })
    // send user as json response
    console.log("JWT_SECRET", process.env.JWT_SECRET);
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Error. Try again.');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({ message: 'Signout success' });
  } catch (err) {
    console.log(err);
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).select('-password').exec();
    // const user = req.user && (await User.findById(req.user._id).select('-password').exec());
    console.log('CURRENT USER', user);
    // old_1 return res.json(user);
    return res.json({ ok: true });
  } catch (err) {
    console.log("Error:", err);
  }
};
// export const currentUser = async (req, res) => {
//   try {
//     let userId;
//     if (req.user) {
//       userId = req.user._id;
//     } else {
//       console.log('No user found')
//       // handle the case where req.user is undefined or null
//       // e.g. redirect to a login page or return an error response
//     }
//     const user = await User.findById(userId).select('-password').exec();
//     console.log('CURRENT USER', user);
//     return res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// };
// export const currentUser = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
//     const user = await User.findById(req.user._id).select('-password').exec();
//     console.log('CURRENT USER', user);
//     return res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const sendEmail = async (req, res) => {
//   // console.log('Send Email:', req.body);
//   // res.json({ ok: true });
//   const params = {
//     Source: process.env.EMAIL_FROM,
//     Destination: {
//       ToAdresses: ['enoemo77@gmail.com']
//     },
//     ReplyToAddresses: [process.env.EMAIL_FROM],
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: `
//           <html>
//             <h1>Reset Password Link</h1>
//             <p>Please use the following link to reset your password</p>
//           </html>
//           `
//         }
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: 'Password Reset Link',
//       }
//     }
//   };
//   const emailSent = await SES.sendEmail(params).promise();

//   emailSent.then((data) => {
//     console.log("Send MSG", data);
//     res.json({ ok: true });
//   }).catch((err) => {
//     console.log("Send MSG", err);
//   })
// };

export const sendEmail = async (req, res) => {
  try {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
  });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'enoemo77@gmail.com',
      replyTo: process.env.EMAIL_FROM,
      subject: 'Password Reset Link',
      html: `
        <html>
          <h1>Reset Password Link</h1>
          <p>Please use the following link to reset your password</p>
        </html>
      `,
    };

    const emailSent = await transporter.sendMail(mailOptions);
    console.log('Send MSG', emailSent);
    res.json({ ok: true });
  } catch (error) {
    console.log('Send MSG', error);
  }
};

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     // console.log("Email:", email);
//     const shortCode = nanoid(6).toUpperCase();
//     const user = await User.findOneAndUpdate({ email }, { passwordResetCode: shortCode });
//     if (!user) return res.status(400).send('User not found');
//     // prepare for email
//     const emailData = {
//       from: process.env.EMAIL_FROM,
//       to: email,
//       subject: 'Reset Password',
//       html: `
//         <html>
//           <h1>Reset Password Link</h1>
//           <p>Please use the following link to reset your password</p>
//           <h2 style="color: red;" >${shortCode}</h2>
//           <i>edemy.com</i>
//         </html>
//       `
//     };

//   } catch (err) {
//     console.log(err);
//   }
// };

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate({ email }, { passwordResetCode: shortCode });
    if (!user) return res.status(400).send('User not found');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Password',
      html: `
        <html>
          <h1>Reset Password Link</h1>
          <p>Please use the following code to reset your password:</p>
          <h2 style="color: red;" >${shortCode}</h2>
          <i>edemy.com</i>
        </html>
      `
    };

    const emailSent = await transporter.sendMail(emailData);
    console.log('Send MSG', emailSent);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate({
      email, 
      passwordResetCode: code
    },
    {
      password: hashedPassword,
      passwordResetCode: ''
    }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send('Error. Try again.');
  }
};