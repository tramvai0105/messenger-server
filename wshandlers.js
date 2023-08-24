const path = require("path");
const fs = require("fs");
const base64Img = require('node-base64-img');

class WSHandlers{

    constructor(wsutils, aWss, Message, User){
        this.wsutils = wsutils;
        this.aWss = aWss;
        this.Message = Message
        this.User = User
    }

    async connectionHandler(ws, msg){
        const id = msg.userId;
        const messages_to = await this.Message.find({to:id});
        const messages_from = await this.Message.find({from:id});
        let messages = [...messages_from, ...messages_to];
        messages = await this.wsutils.setNamesInMsgs(messages);
        ws.id = id;
        msg.msgsData = messages;
        ws.send(JSON.stringify(msg));
    };
    
    async messageHandler(ws, msg){
        const senderId = msg.userId;
        const receiverId = ((await this.User.findOne({username:msg.to}))._id).toString();
        if(msg.type == "img"){
            let name = Date.now().toString()
            console.log(path.join(__dirname, "images"));
            try{
                const res = await base64Img(msg.body, path.join(__dirname, "images"), name, {type: 'png'})
            } catch (error) {
                console.log(error);
                return;
            }
            const message = new this.Message({
            from: senderId,
            to: receiverId,
            body: JSON.stringify("http://localhost:5000/" + "images/" + `${name}.png`),
            type: "img"
            })
            console.log(message)
            let savedMsg = await message.save();
            msg._id = savedMsg._id.toString();
            msg.time = savedMsg.time;
            msg.body = savedMsg.body;
            this.sendToUser(ws, msg, senderId);
            this.sendToUser(ws, msg, receiverId);
        } 
        if(msg.type == "text"){
            const message = new this.Message({
            from: senderId,
            to: receiverId,
            body: msg.body,
            type: "text"
            })
            let savedMsg = await message.save();
            msg._id = savedMsg._id.toString();
            msg.time = savedMsg.time;
            this.sendToUser(ws, msg, senderId);
            this.sendToUser(ws, msg, receiverId);
        }
    }

    async deleteHandler(ws, msg){
        const from = ((await this.User.findOne({username:msg.from}))._id).toString();
        const to = ((await this.User.findOne({username:msg.to}))._id).toString();
        let message = await this.Message.findOne({_id: msg._id})
        if(message.type == "img"){
            let imgPath = JSON.parse(message.body).split("http://localhost:5000")[1]
            fs.unlink(path.join(__dirname, imgPath), (e)=>{
                if(e){console.log(e)}else{}
            })
        }
        await this.Message.deleteOne({_id: msg._id})
        this.sendToUser(ws, msg, from);
        this.sendToUser(ws, msg, to);
    }

    sendToUser(ws, msg, userId){
        this.aWss.clients.forEach((client) => {
          if (client.id === userId) {
            client.send(JSON.stringify(msg));
          }
        });
      }

    broadcastConnection(ws, msg){
    aWss.clients.forEach((client) => {
        if (client.id === msg.id) {
        client.send(JSON.stringify(msg));
        }
    });
    };
}

module.exports = WSHandlers;