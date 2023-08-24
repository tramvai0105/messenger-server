const Friends = require("../models/Friends");
const User = require("../models/User");

class friendsController{
    async getFriends(req, res){
        const {id} = req.user;
        var {friends, requests} = await Friends.findOne({userId: id});
        let Friendsarr = []
        for(let i = 0; i < friends.length; i++){
            let user = await User.findById(friends[i]);
            Friendsarr.push({_id:friends[i], username: user.username})
        }
        friends = Friendsarr;
        let Requestsarr = []
        for(let i = 0; i < requests.length; i++){
            let user = await User.findById(requests[i]);
            Requestsarr.push({_id:requests[i], username: user.username})
        }
        requests = Requestsarr;
        return res.json({friends: friends, requests: requests})
    }

    async requestFriend(req, res){
        const {friendId} = req.body;
        const {id} = req.user;
        let friends = await Friends.findOne({userId: friendId})
        if(friends.friends.includes(id.toString())){
            return res.status(400).json({message: "Уже друг"})
        }
        if(friends.requests.includes(id.toString())){
            return res.status(400).json({message: "Заявка уже отправлена"})
        }
        friends.requests.push(id)
        await friends.save()
        return res.status(200).json({message:"Заявка в друзья отправлена."})
    }

    async acceptFriend(req, res){
        const {friendId} = req.body;
        const {id} = req.user;
        let friends = await Friends.findOne({userId: id});
        let friendsOfFriend = await Friends.findOne({userId: friendId});
        if(!friends.requests.includes(friendId.toString())){
            return res.status(400).json({message: "Нет такой заявки"})
        }
        if(friends.friends.includes(friendId.toString())){
            return res.status(400).json({message: "Уже друг"})
        }
        friends.requests = friends.requests.filter(item => item !== friendId.toString());
        friendsOfFriend.friends.push(id);
        friends.friends.push(friendId);
        await friends.save()
        await friendsOfFriend.save()
        return res.json({message: "Друг добавлен!"})
    }

    async removeFriend(req, res){
        const {friendId} = req.body;
        const {id} = req.user;
        let friends = await Friends.findOne({userId: id})
        let friendsOfFriend = await Friends.findOne({userId: friendId});
        if(friends.friends.includes(friendId.toString())){
            friends.friends = friends.friends.filter(item => item !== friendId.toString());
        }
        if(friendsOfFriend.friends.includes(id.toString())){
            friendsOfFriend.friends = friendsOfFriend.friends.filter(item => item !== id.toString());
        }
        await friends.save()
        await friendsOfFriend.save()
        return res.json({message: "Друг удален!"})
    }
}

module.exports = new friendsController();