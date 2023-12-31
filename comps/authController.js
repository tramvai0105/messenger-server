const User = require("../models/User")
const bcrypt = require('bcryptjs');
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const {secret} = require("../config");
const Friends = require("../models/Friends");

function generateAccessToken(id){
    const payload = {
        id
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"})
}

class authController{
    async registration(req, res){
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message:"Ошибка при регистрации", errors})
        }
        const {username, password} = req.body;
        const candidate = await User.findOne({username})
        if(candidate){
            return res.status(400).json({message: "Пользователь с таким именем уже существует"})
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        const user = new User({username, password:hashPassword})
        const friends = new Friends({userId: user._id})
        await user.save();
        await friends.save();
        console.log(`${username} is registered`);
        return res.json({message: "Пользователь успешно зарегистрирован"})
    }

    async login(req, res){
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message:`Пользователь ${username} не найден`});
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if(!validPassword){
            return res.status(400).json({message:`Неправильный пароль`});
        }
        const token = generateAccessToken(user._id);
        console.log(`${username} is logged in!`);
        return res.json({token, avatar: user.avatar})
    }

    async changeLogin(req, res){
        let {id} = req.user;
        let {username} = req.body;
        if(!username || username.length > 20 || 4 > username.length || username.includes(" ")){
            return res.status(400).json({message:"Некоректное имя пользователя"})
        } 
        const candidate = await User.findOne({username})
        if(candidate){
            return res.status(400).json({message: "Пользователь с таким именем уже существует"})
        }
        const user = await User.findOne({_id: id})
        user.username = username;
        await user.save()
        return res.status(200).json({message: "Имя пользователя успешно изменено"})
    }

    async check(req, res){
        try{
            if(!req.headers.authorization){
                return res.status(400).json({message:"Заголовок токена не предоставлен"})
            }
            const token = req.headers.authorization.split(" ")[1];
            if(!token){
                return res.status(400).json({message:"Пользователь не авторизован"})
            }
            const decodedData = jwt.verify(token, secret);
            return res.status(200).json({message:"Пользователь не авторизован"})
        }catch(e){
            return res.status(400).json({message:"Токен истек"})
        }
    }
}

module.exports = new authController();