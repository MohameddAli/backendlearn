import User from '../models/user';
import Course from '../models/course';
// import stripe from 'stripe';
import queryString from 'query-string';
const stripe = require('stripe')(process.env.STRIPE_SECRET)

export const makeInstructor = async (req, res) => {
    try {
      // 1. find user from database
      const user = await User.findById(req.auth._id).exec();
      // 2. if user is not found, return an error response
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // 3. if user dont have stripe_account_id yet, then create new one
      if (!user.stripe_account_id) {
        const account = await stripe.accounts.create({ type: "express" });
        console.log('ACCOUNT => ', account.id);
        user.stripe_account_id = account.id;
        await user.save();
      }
      // 4. create account link based on account id (for frontend to complete onboarding)
      let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: 'account_onboarding'
      });
      console.log("accountLink: ", accountLink);
      // 5. pre-fill any info such as email (optional), then send url response to frontend
      accountLink = Object.assign(accountLink, {
        "stripe_user[email]": user.email
      })
      // 6. then send the account link as json as response to frontend
      res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
    } catch (err) {
      console.log('MAKE INSTRUCTOR ERR: ',err);
      res.status(500).json({ error: err.message });
    }
  };

  export const getAccountStatus = async (req, res) => {
    try {
      const user = await User.findById(req.auth._id).exec();
      const account = await stripe.accounts.retrieve(user.stripe_account_id);
      console.log('ACCOUNT => ', account);
      if (!account.charges_enabled) {
        return res.status(401).send('Unauthorized');
      } else {
        const statusUpdated = await User.findByIdAndUpdate(user._id, {
          stripe_seller: account,
          $addToSet: { role: 'Instructor' }
        }, { new: true }
        ).select('-password').exec();
        // statusUpdated.password = undefined;
        // console.log();
        res.json(statusUpdated);
      };
    } catch (err) {
      console.log(err);
    }
  };
  
  export const currentInstructor = async (req, res) => {
    try {
      let user = await User.findById(req.auth._id).select('-password').exec();
      if (!user.role.includes('Instructor')) {
        return res.sendStatus(403);
      } else {
        res.json({ ok: true });
      }
    } catch (err) {
      console.log(err);
    }
  };

  export const instructorCourses = async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.auth._id })
      .sort({ createdAt: -1 })
      .exec();
      res.json(courses);
    } catch (err) {
      console.log("instructorCourses: ", err);
    }
  };