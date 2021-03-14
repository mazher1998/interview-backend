const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const Profile = require("../../models/Profile");

router.get("/all", async (req, res) => {
  try {
    const Users = await User.find();
    console.log("aaa");
    if (!Users) {
      res.status(400).json({ msg: "There is no profiles" });
    }
    res.json(Users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "servescscr error", error: error });
  }
});

//  @route  POST api/users
//  @desc   Register users
//  @access Public

router.post(
  "/signup",
  [
    check("firstname", "firstname is required")
      .not()
      .isEmpty(),
      check("lastname", "lastname is required")
      .not()
      .isEmpty(),
      check("number", "Enter a number ").isLength({
        min: 11,
        max: 11
      }),
    check("email", "please included a valid email").not()
    .isEmpty(),
    check("password", "Enter a password with 6 or more characters").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      res.status(400).json({ error: error.array() });
    }
    const { firstname,lastname,number, email, password } = req.body;//getting name, email and password from the sign up inputbar
    try {
      let user = await User.findOne({ email });//checking if user from this email already exist
      if (user) {// if exist then sending User already exists msg
    return  res.status(500).json({ error: [{ msg: "User already exists" }] });
      }
    

      // creating user
      user = new User({
        firstname,
        lastname,
        number,
        email,
        password
      });

      // encryping password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      // saving user
      await user.save();



      const payload = {
        user: user.id
      };
      const token= jwt.sign(
        payload,
        config.get("jwtSecret"),
        
      );
      res.json({ token });


    //   res.send("Register User");
    } catch (error) {
      console.log(error.message);
      res.status(500).sent("Server error");
    }

  }
);


router.post( "/signin",
  [
    check("email", "please included a valid email").isEmail(),
    check("password", "password should exists").exists()
  ],
  async (req, res) => {
    const error = validationResult(req);
    // console.log(req.body)
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;//getting email and password from the sign in inputbar
    try {
      let user = await User.findOne({ email });//finding user from database by comparing email
      if (!user) {//if no user is found from the given email sending Invalid Credientials msg
        return res
          .status(400)
          .json({ error: [{ msg: "Invalid Credientials" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);//bcrypting th password then comparing it
      if (!isMatch) {//if password not mathches then sending the Invalid Credientials msg
        return res
          .status(400)
          .json({ error: [{ msg: "Invalid Credientials" }] });
      }
      // encryping password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      // saving user
      await user.save();

      const payload = {
        user: user.id
      };
      const token = jwt.sign(
        payload,
        config.get("jwtSecret"),
        
      );
      return res.json({ token });

      //   res.send("Register User");
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Server error" });
    }
  }
);












router.put(
  "/addresult",
  
  async (req, res) => {
    try {
      let token = req.header("token");
      const decoded = jwt.verify(token, config.get("jwtSecret"));
    // console.log(decoded);
    req.user=decoded.user;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }

      const {
        eventname,
        eventdescription,
        venue,
        location,
        startdate,
        enddate,
        starttime,
        endtime,
        ticket
      } = req.body;

      const newExp = {
        eventname,
        eventdescription,
        venue,
        location,
        startdate,
        enddate,
        starttime,
        endtime,
        ticket
      };
      console.log(eventname);
      
      //   res.json(profile);
       let profile = await Profile.findOne({ user: req.user });
      if (!profile) {
        const profileFields = {};
      profileFields.user = req.user;
      profile = new Profile(profileFields);//adding new profile
      profile.result.unshift(newExp);
      await profile.save();
      return res.json(profile.result);
      }
      profile.result.unshift(newExp);//adding new result in beginning of the array 
      await profile.save();
      return res.json(profile.result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "server error", error: error });
    }
  }
);

router.get("/getresults", async (req, res) => {
  try {
    let token = req.header("token");
      const decoded = jwt.verify(token, config.get("jwtSecret"));
    // console.log(decoded);
    req.user=decoded.user;
    const profile = await Profile.findOne({ user: req.user });
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for this user" });
    }
    if(profile.result == null){
      res.json(null);
    }
    res.json(profile.result);
    console.log(profile.result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "server error", error: error });
  }
});










router.delete("/reslut/:res_id", async (req, res) => {
  try {
    let token = req.header("token");
      const decoded = jwt.verify(token, config.get("jwtSecret"));
    // console.log(decoded);
    req.user=decoded.user;
    const profile = await Profile.findOne({ user: req.user });
    const index = profile.result
      .map(item => item.id)
      .indexOf(req.params.res_id);//comparing all experiance ids with given id
    console.log(index);
    profile.result.splice(index, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error);
      res.status(500).json({ msg: "server error" });
  }
});

//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa




router.put(
  "/updateresult:res_id",
  
  async (req, res) => {
    try {
      let token = req.header("token");
      const decoded = jwt.verify(token, config.get("jwtSecret"));
    // console.log(decoded);
    req.user=decoded.user;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }

      const {
        eventname,
        eventdescription,
        venue,
        location,
        startdate,
        enddate,
        starttime,
        endtime,
        ticket
      } = req.body;

      const newExp = {
        eventname,
        eventdescription,
        venue,
        location,
        startdate,
        enddate,
        starttime,
        endtime,
        ticket
      };
      console.log(eventname);
      
      //   res.json(profile);
       let profile = await Profile.findOne({ user: req.user });
       const index = profile.result
      .map(item => item.id)
      .indexOf(req.params.res_id);//comparing all experiance ids with given id
    console.log(index);
    profile.result.splice(index, 1);
      if (!profile) {
        const profileFields = {};
      profileFields.user = req.user;
      profile = new Profile(profileFields);//adding new profile
      profile.result.unshift(newExp);
      await profile.save();
      return res.json(profile.result);
      }
      profile.result.unshift(newExp);//adding new result in beginning of the array 
      await profile.save();
      return res.json(profile.result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "server error", error: error });
    }
  }
);
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa



module.exports = router;
