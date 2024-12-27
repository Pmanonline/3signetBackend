const express = require("express");
const router = express.Router();
const {
  registerJoinCommunity,
  getAllRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
} = require("../controllers/joincommunityController");

// Public routes
router.post("/registerJoinCommunity", registerJoinCommunity);
router.get("/getAllRegistrations", getAllRegistrations);
router.get("/getRegistration/:id", getRegistration);
router.put("/updateRegistration/:id", updateRegistration);
router.delete("/deleteRegistration/:id", deleteRegistration);

router.options("/registerJoinCommunity", (req, res) => {
  res.status(204).send();
});

module.exports = router;
