const User = require("../models/User")
const bcrypt = require('bcryptjs');
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const {secret} = require("../config");
const Friends = require("../models/Friends");
const path = require("path")
var fs = require('fs');

class fileController{
    async changeAvatar(req, res){
        if(!req.files || !req.files.avatar){
            return res.status(400).send({message:"Файлы не предоставлены"})
        }
        var avatar = req.files.avatar;
        avatar.name = Date.now().toString()
        let avatarPath = path.join(__dirname, "../", "images", `${avatar.name}.png`)
        avatar.mv(avatarPath)
        let user = await User.findById(req.user.id);
        if(user.avatar != `http://${process.env.SERVER_IP}/images/elvis.jpg`){
            let avatarPath = user.avatar.split("http://localhost:5000")[1]
            fs.unlink(`.${avatarPath}`, (e)=>{
                if(e){console.log(e)}else{}
            })
        }
        user.avatar = `http://${process.env.SERVER_IP}/` + "images/" + `${avatar.name}.png`
        await user.save();
        return res.status(200).send({message: "Аватар успешно обновлен"})
    }

    async getUserAvatar(req, res){
        const user = await User.findById(req.user.id);
        let avatar = user.avatar
        let avatarPath = user.avatar.split("http://localhost:5000")[1]
        if(!fs.existsSync(`.${avatarPath}`)){
            avatar = `http://${process.env.SERVER_IP}/images/elvis.jpg`
            user.avatar = avatar;
            await user.save()
        }
        return res.json({avatar: avatar});
    }

    async getUsersAvatarsByNames(req, res){
        let {users} = req.body;
        let avatars = [];
        for(let i = 0; i < users.length; i++){
            let pair = []
            const user = await User.findOne({username: users[i]});
            let avatar = user.avatar
            let avatarPath = user.avatar.split(`http://${process.env.SERVER_IP}`)[1]
            if(!fs.existsSync(`.${avatarPath}`)){
                user.avatar = `http://${process.env.SERVER_IP}/images/elvis.jpg`;
            }
            pair = [users[i], avatar];
            avatars.push(pair);
        }
        return res.json({avatars: avatars});
    }
}

module.exports = new fileController();