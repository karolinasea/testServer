const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);

app.get('/', (req, res) => 
{
  res.send('Chat Server is running on port 3000')
});

var userList = [];

var userInfo = {};

var usersDataBase = 
{
  //    users = [];
}; 
  

io.on('connection', (socket) => 
{
      socket.on('connectionAttempt', function(data)
        {
        io.emit("connected", data)      
            console.log("user connected : id = " + data)
      })

      console.log('user connected')

      var fs = require('fs');
      io.emit('testList', { text : fs.readFileSync("usersDataBase.json", "utf8") });

      socket.on('join', function(userName) 
      {
            console.log(userName +" : has joined the chat "  );
            socket.broadcast.emit('userjoinedthechat',userName +" : has joined the chat ");
                  
            var userInfo = {};
            var foundUser = false;
            for (var i=0; i<userList.length; i++) 
            {
              if (userList[i]["userName"] == userName) 
              {
                userList[i]["isConnected"] = true
                userInfo = userList[i];
                foundUser = true;
                break;
              }
            } 

            if (!foundUser) 
            {
              userInfo["userName"] = userName;
              userInfo["isConnected"] = true
              userList.push(userInfo);
            }

            io.emit("userList", userList);
            io.emit("connectedUsersList", userList);
            io.emit("userConnectUpdate", userInfo)
                
            //afficher list des user sur la console
            console.log("Online users after join:"); 
            for (var i=0; i<userList.length; i++) 
            {
              console.log(userList[i]["userName"] + " " + userList[i]["isConnected"]);
            }
               

            //function that sends a session description protocol and with which we can receive the sdp as well 
            //it also prints the sdp in the server terminal
            socket.on('sendSDP', function(sdp)
            {
            	console.log('SEND SDP');
            	console.log('in the sendsdp function ' + sdp);
            	socket.broadcast.emit("sentSDP", sdp);
            	io.emit("sentSDP", sdp);
            });

            socket.on('sendICECandidates', function(ice)
            {
            	console.log('SEND ICE');
            	console.log('in the sendICECandidates function ' + ICE);
            	socket.broadcast.emit("sentICE", ice);
            	io.emit("sentICE", ice);
            });

			// socket.on('sendSDPtoContact', (sdp, userName, dest) =>
   //          {
   //          	console.log('SEND SDP to ' + dest + ' from: ' + userName)
   //          	// console.log('in the sendsdp function ' + sdp)
   //          	socket.broadcast.emit("sdp", sdp)
   //          	io.emit("sentSDPtoClient", { data: sdp, from: userName, to: dest })
   //          })

           socket.on('messagedetection', (senderNickname, receiverNickname, messageContent) => 
			{
		       //log the message in console 
		       console.log(senderNickname+" : " +messageContent)

		      //create a message object 
		      let  message = {"message":messageContent, "senderNickname":senderNickname}

		       // send the message to all users including the sender  using io.emit() 
				var newObject = {}
				newObject['senderNickname'] = receiverNickname; 
				newObject['messageContent'] = messageContent; 
				var json = JSON.stringify(newObject); 
		      io.in(receiverNickname).emit("chatMessage", json );

})
            socket.on('disconnect', function() 
            {
              console.log(userName +' has left ')
              for (var i=0; i<userList.length; i++) 
              {
                if (userList[i]["userName"] == userName) 
                {
                  userList[i]["isConnected"] = false
                  break;
                }
              }

                //afficher list des user sur la console
              console.log("Online users after disconnect:"); 
              for (var i=0; i<userList.length; i++) 
              {
                console.log(userList[i]["userName"] + " " + userList[i]["isConnected"]);
              }
                
                io.emit("userList", userList);
              socket.broadcast.emit( "userdisconnect" ,' user has left')
            });
})

socket.on("exitUser", function(userName) // when user logs out of account in the app we remove them from the list
              {
                for (var i=0; i<userList.length; i++) 
                {
                  if (userList[i]["userName"] == userName)
                  {
                    userList.splice(i, 1); //removes user from userList
                    break;
                  }
                }
                io.emit("userList", userList);

                //afficher list des user sur la console
                console.log("Online users after log out/user exits:"); 
                for (var i=0; i<userList.length; i++) 
                {
                  console.log(userList[i]["userName"] + " " + userList[i]["isConnected"]);
                }
}); 


      
socket.on('newUser', (newUserName, newPassword) => 
{
    var userInfo = {};     
    userInfo['userName'] = newUserName;
    userInfo['passWord'] = newPassword;
    userInfo["isConnected"] = false
    console.log("new user : " + newUserName+ ", password : " + newPassword); 
    var json = JSON.stringify(userInfo); 
    var fs = require('fs');
//    fs.writeFile('myjsonfile.json', json, 'utf8', callback);
    fs.readFile('usersDataBase.json', 'utf8', function readFileCallback(err, data)
    {
        if (err)
        {
          console.log(err);
        } 
        else 
        {
          usersDataBase = JSON.parse(data);
          
          usersDataBase.users.push(userInfo);
          
          json = JSON.stringify(usersDataBase); 
          
          fs.writeFile('usersDataBase.json', json, 'utf8',function (err) 
          {
              if (err) 
              {
                return console.log(err);
              }
              else 
              {
                console.log("The file was saved!"); // write it back 
              }
          })
        }
      })
    userList.push(userInfo); //put the new user in the list 
  })


  sendTo(socket, userList);
})


server.listen(3000,()=>
{
  console.log('Node app is running on port 3000')
})

function sendTo(connection, message) 
{ 
   connection.send(JSON.stringify(message)); 
}




