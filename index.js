const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);

app.get('/', (req, res) => {

res.send('Chat Server is running on port 3000')
});

var userList = [];

var usersDataBase = {
		users: []
	}; 
	

io.on('connection', (socket) => {

console.log('user connected')


socket.on('join', function(userNickname) 
{

        console.log(userNickname +" : has joined the chat "  );
        socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
        
        var userInfo = {};
      	var foundUser = false;
      	for (var i=0; i<userList.length; i++) 
      	{
        	if (userList[i]["nickname"] == userNickname) 
       	    {
          		userList[i]["isConnected"] = true
          		userInfo = userList[i];
          		foundUser = true;
          		break;
        	}
        }	

       if (!foundUser) 
       {
        	userInfo["nickname"] = userNickname;
        	userInfo["isConnected"] = true
        	userList.push(userInfo);
        }

      io.emit("userList", userList);
      io.emit("connectedUsersList", userList);
      io.emit("userConnectUpdate", userInfo)
      
      //afficher list des user sur la console
      for (var i=0; i<userList.length; i++) 
      {
      	console.log(userList[i]["nickname"] + " " + userList[i]["isConnected"]);
      }
      
      socket.on('disconnect', function() 
      {
      	 console.log(userNickname +' has left ')
        for (var i=0; i<userList.length; i++) 
        {
        	if (userList[i]["nickname"] == userNickname) 
        	{
          		userList[i]["isConnected"] = false
          		break;
          	}
        }
		io.emit("userList", userList);
        socket.broadcast.emit( "userdisconnect" ,' user has left')
    })
      
    })


socket.on('messagedetection', (senderNickname,messageContent) => {

       //log the message in console 

       console.log(senderNickname+" : " +messageContent)

      //create a message object 

      let  message = {"message":messageContent, "senderNickname":senderNickname}

       // send the message to all users including the sender  using io.emit() 

      io.emit('message', message )

      })
      
socket.on('newUser', (newUserName, newPassword) => 
{
		var newObject = {}; 		
		newObject['userName'] = newUserName;
		newObject['passWord'] = newPassword;
		console.log("new user : " + newUserName+ ", password : " + newPassword); 
		var json = JSON.stringify(newObject); 
		var fs = require('fs');
		fs.readFile('usersDataBase.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} 
		else {
			usersDataBase = JSON.parse(data);
			
			usersDataBase.table.push({id: 2, square:3});
			
			json = JSON.stringify(usersDataBase); 
			
			fs.writeFile('usersDataBase.json', json, 'utf8', callback); // write it back 
		}});
		
sendTo(socket, userList);
})

}
)


server.listen(3000,()=>{

console.log('Node app is running on port 3000')

})

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}
