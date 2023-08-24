const Router = require("express");
const router = new Router();
const controller = require("./fileController")
const {check} = require("express-validator")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/changeavatar", authMiddleware , controller.changeAvatar)
router.get("/getavatar", authMiddleware, controller.getUserAvatar)
router.post("/getavatars", authMiddleware, controller.getUsersAvatarsByNames)

module.exports = router;