const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const aWss = WSServer.getWss();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require('mongoose');
const authRouter = require("./comps/authRouter");
const friendsRouter = require("./comps/friendsRouter");
const fileRouter = require("./comps/fileRouter");
const jwt = require("jsonwebtoken");
const {secret} = require("./config");
const User = require("./models/User");
const Message = require("./models/Message");
const wsutils = require("./utils/wsutils");
const authMiddleware = require("./middleware/authMiddleware");
const fileUpload = require("express-fileupload");
const WSHandlerClass = require("./wshandlers")
const WSHandler = new WSHandlerClass(wsutils, aWss, Message, User);
require('dotenv').config();

app.use(cors());
app.use(fileUpload({}))
app.use(express.json());
app.use('/auth', authRouter);
app.use('/friends', friendsRouter);
app.use('/file', fileRouter);
app.use('/images', express.static('images'));


async function mongoConnection() {
  try{
    await db.connect('mongodb://127.0.0.1:27017/soc');
  } catch(err){
    console.log(err);
  }
}

function wsAuthMiddleware(msg){
  try {
    const decodedData = jwt.verify(msg.token, secret);
    return decodedData.id;
  }
  catch(err){
    console.log(err);
    return false;
  }
}

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    msg.userId = wsAuthMiddleware(msg)
    if(!msg.userId){
      return;
    }
    switch (msg.method) {
      case "connection":
        WSHandler.connectionHandler(ws, msg);
        break;
      case "message":
        WSHandler.messageHandler(ws, msg);
        break;
      case "delete":
        WSHandler.deleteHandler(ws, msg);
        break;
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/", (req, res) => {});

app.post("/users", async (req, res)=>{
  var users = await User.find({});
  if(!users){
    res.status(400).json({message: "Ошибка получения пользователей"})
  }
  res.json(users);
})

function start(){
  try{
    mongoConnection();
    app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));
  } catch(e){
    console.log(e);
  }
  
}

start();

