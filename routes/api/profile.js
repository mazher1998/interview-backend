const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");


router.get("/me", auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user });
      if (!profile) {
        res.status(400).json({ msg: "There is no profile for this user" });
      }
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "server error", error: error });
    }
  });



  router.delete("/deleteuser", auth, async (req, res) => {
    try {
      await Profile.findOneAndRemove({ user: req.user });
      await User.findOneAndRemove({ _id: req.user });
     
  
      res.json({ msg: "User Deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "server error" });
    }
  });



router.put(
    "/addresult",
    [
      auth
    ],
    async (req, res) => {
      try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
          return res.status(400).json({ error: error.array() });
        }
  
        const {
          title
        } = req.body;
  
        const newExp = {
          title
        };
        console.log("aaa");
        //   res.json(profile);
        let profile = await Profile.findOne({ user: req.user });
        if (!profile) {
          res.status(400).json({ msg: "Profile not Found", error: error });
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
  
 
  
  router.delete("/reslut/:res_id", auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user });
      const index = profile.reslut
        .map(item => item.id)
        .indexOf(req.params.res_id);//comparing all experiance ids with given id
      console.log(index);
      profile.reslut.splice(index, 1);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "server error" });
    }
  });
  