// routes/joinCommunityRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerJoinCommunity,
  getAllRegistrations,
  getRegistration,
  deleteRegistration,
  getBannerStatus,
  updateBannerStatus,
} = require("../controllers/joincommunityController");

// Public routes
router.post("/registerJoinCommunity", registerJoinCommunity);

router.get("/getAllRegistrations", getAllRegistrations);

router.get("/getRegistration/:id", getRegistration);

router.delete("/deleteRegistration/:id", deleteRegistration);

router.get("/getBannerStatus", getBannerStatus);

router.post("/updateBannerStatus", updateBannerStatus);
router.options("/registerJoinCommunity", (req, res) => {
  res.status(204).send();
});

module.exports = router;
