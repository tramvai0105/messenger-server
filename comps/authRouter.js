const Router = require("express");
const router = new Router();
const controller = require("./authController")
const {check} = require("express-validator")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/registration", 
    [check("username", "Имя пользователя не корректно").notEmpty().custom(value => !/\s/.test(value)),
    check("password", "Пароль должен быть от 4 до 20 символов").isLength({min:4, max:20})
    ]
    ,controller.registration)
router.post("/login", controller.login)
router.post("/check", controller.check)
router.post("/changelogin", authMiddleware, controller.changeLogin)


module.exports = router;