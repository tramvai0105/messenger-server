const User = require("../models/User");

async function getUserById(id){
    let user = await User.findById(id);
    return user;
}
  
async function setNamesInMsgs(msgs){
    let names = new Map();
    for(let i = 0; i < msgs.length; i++){
      let from = msgs[i].from;
      let to = msgs[i].to;
      if(names.has(from)){
        msgs[i].from = names.get(from);
      } else{
        msgs[i].from = (await getUserById(from)).username;
        names.set(from, msgs[i].from)
      }
      if(names.has(to)){
        msgs[i].to = names.get(to);
      } else{
        msgs[i].to = (await getUserById(to)).username;
        names.set(to, msgs[i].to)
      }
    }
    return msgs;
}

const wsutils = {
  getUserById: getUserById,
  setNamesInMsgs: setNamesInMsgs,
}

module.exports = wsutils