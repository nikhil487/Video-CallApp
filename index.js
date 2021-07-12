const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});


app.use('/peerjs', peerServer);
app.use(express.static('public'));


//const io = socket(server);// server into a socket server 
var users = {};
io.on('connection',(socket)=>{
        socket.on('join',(roomname,userId,userName)=>{ // starts when a user get joins
        socket.join(roomname);
        users[userId] = userName;
        console.log("user :" + userName);
        socket.to(roomname).emit("user-connected",userId);// this will connect our newly joined user to all other users
        socket.on('disconnect', () => {// when users closes the window this event will occur.
            //users.delete(userId);
            socket.to(roomname).emit("user-disconnect",userId);
        })
    })
    socket.on("sendingMessage",(roomname,message,userId)=>
    {
        //console.log(message + " "+ users[userId]);
        socket.to(roomname).emit("recieve",{message:message,name :users[userId]});
        
    })
   
})

const port = process.env.PORT || 3000;
server.listen(port,()=>{
    console.log("i am here");
});