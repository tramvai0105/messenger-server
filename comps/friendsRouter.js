const Router = require("express");
const router = new Router();
const controller = require("./friendsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/friendslist", authMiddleware, controller.getFriends)
router.post("/requestfriend", authMiddleware, controller.requestFriend)
router.post("/acceptfriend", authMiddleware, controller.acceptFriend)
router.post("/removefriend", authMiddleware, controller.removeFriend)

module.exports = router;