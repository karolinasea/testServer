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
      console.log('user connected')

      socket.on('join', function(userName) 
      {
            console.log(userName +" : has joined the chat "  );
            socket.broadcast.emit('userjoinedthechat',userName +" : has joined the chat ");
                  
            // var userInfo = {};
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
            // io.emit("connectedUsersList", userList);
            // io.emit("userConnectUpdate", userInfo)
                
            //afficher list des user sur la console
            console.log("Online users after join:"); 
            for (var i=0; i<userList.length; i++) 
            {
              console.log(userList[i]["userName"] + " " + userList[i]["isConnected"]);
            }
               
                
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

socket.on('messagedetection', (senderNickname,messageContent) => 
{
       //log the message in console 
       console.log(senderNickname+" : " +messageContent)

      //create a message object 
      let  message = {"message":messageContent, "senderNickname":senderNickname}

       // send the message to all users including the sender  using io.emit() 
      io.emit('message', message )

})
      
socket.on('newUser', (newUserName, newPassword) => 
{
    // var newObject = {};     
    userInfo['userName'] = newUserName;
    userInfo['passWord'] = newPassword;
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
          
          usersDataBase.users.push(newObject);
          
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




