const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);

app.get('/', (req, res) => {

res.send('Chat Server is running on port 3000')
});

var userList = [];

io.on('connection', (socket) => {

console.log('user connected')


socket.on('join', function(userNickname) {

        console.log(userNickname +" : has joined the chat "  );
        socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
        
        var userInfo = {};
      	var foundUser = false;
      	for (var i=0; i<userList.length; i++) {
        if (userList[i]["nickname"] == userNickname) {
          userList[i]["isConnected"] = true
          // userList[i]["id"] = clientSocket.id;
          userInfo = userList[i];
          foundUser = true;
          break;
        }
      }

      if (!foundUser) {
//         userInfo["id"] = clientSocket.id;
        userInfo["nickname"] = userNickname;
        userInfo["isConnected"] = true
        userList.push(userInfo);
      }

      io.emit("userList", userList);
      io.emit("connectedUsersList", userList);
      io.emit("userConnectUpdate", userInfo)
      
      //afficher list des user sur la console
      for (var i=0; i<userList.length; i++) {
      console.log(userList[i]["nickname"] + " " + userList[i]["isConnected"]);
      }
      
    })


socket.on('messagedetection', (senderNickname,messageContent) => {

       //log the message in console 

       console.log(senderNickname+" : " +messageContent)

      //create a message object 

      let  message = {"message":messageContent, "senderNickname":senderNickname}

       // send the message to all users including the sender  using io.emit() 

      io.emit('message', message )

      })

socket.on('disconnect', function() {

        // console.log(userNickname +' has left ')
        console.log('one user has left ')

        socket.broadcast.emit( "userdisconnect" ,' user has left')

    })
sendTo(socket, userList);
})



server.listen(3000,()=>{

console.log('Node app is running on port 3000')

})

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}
