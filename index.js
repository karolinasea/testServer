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
            console.log(userName +" : is online "  );
            socket.broadcast.emit('userjoinedthechat',userName +" is online ");
                  
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

                //affiche list des users sur la console
                console.log("Online users after log out/user exits:"); 
                for (var i=0; i<userList.length; i++) 
                {
                  console.log(userList[i]["userName"] + " " + userList[i]["isConnected"]);
                }
}); 


//add user info (username password) to database in JSON format 
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
/*
	socket.on('sendRequest', (senderNickname, receiverNickname) => {
		console.log(senderNickname + " wants connection with "+ receiverNickname);
		var newObject = {}; 		
		newObject['senderNickname'] = senderNickname;
		newObject['receiverNickname'] = receiverNickname;
		//var json = JSON.stringify(newObject);		
		
		io.emit('connectionRequest', newObject); 
	}); 
	
	socket.on('accept', (senderNickname, receiverNickname) => {
		console.log(senderNickname + " accepted connection with "+ receiverNickname);
		var newObject = {}; 		
		newObject['senderNickname'] = senderNickname;
		newObject['receiverNickname'] = receiverNickname;
		//var json = JSON.stringify(newObject);		
		
		io.emit('connectionAccepted', newObject); 
	});	
	*/
	//function that sends a session description protocol and with which we can receive the sdp as well 
	//it also prints the sdp in the server terminal
	//CORRESPONDS TO THE OFFER
	socket.on('sendSDP', (senderNickname, receiverNickname, type, sdp ) =>
	{
		console.log('SENDING SDP from ' + senderNickname + ' to ' + receiverNickname + ' type: ' + type + ' ' + sdp);
		
		var newObject = {}; 		
		newObject['senderNickname'] = senderNickname;
		newObject['receiverNickname'] = receiverNickname;
		newObject['type'] = type;
		newObject['SDP'] = sdp; 
		// console.log('********************************************* sendNickname from new object ' + newObject['senderNickname']  + ' receiverNickname from new object ' + newObject['receiverNickname'] + ' type from new object ' + newObject['type'] + ' sdp from new object ' + newObject['SDP']);
		console.log('in the sendsdp function ' + JSON.stringify(sdp));
		//socket.broadcast.emit("sentSDP", sdp);
		io.emit("sentSDP", newObject);
	});
	// socket.on('sendSDP', (senderNickname, receiverNickname, sdp ) =>
	// {
	// 	console.log('SENDING SDP from ' + senderNickname + ' to ' + receiverNickname + ' sdp ' + sdp);
		
	// 	var newObject = {}; 		
	// 	newObject['senderNickname'] = senderNickname;
	// 	newObject['receiverNickname'] = receiverNickname;
	// 	newObject['SDP'] = sdp; 
	// 	// console.log('********************************************* sendNickname from new object ' + newObject['senderNickname']  + ' receiverNickname from new object ' + newObject['receiverNickname'] + ' type from new object ' + newObject['type'] + ' sdp from new object ' + newObject['SDP']);
	// 	//console.log('in the sendsdp function ' + sdp);
	// 	//socket.broadcast.emit("sentSDP", sdp);
	// 	io.emit("sentSDP", newObject);
	// });
	//IP address where the correspondant can be found
	socket.on('sendICECandidates', (senderNickname, receiverNickname, ice ) =>
	{
		console.log('SENDING ICE from ' + senderNickname + ' to ' + receiverNickname + ' ' + ice);
		
		var newObject = {}; 		
		newObject['senderNickname'] = senderNickname;
		newObject['receiverNickname'] = receiverNickname;
		newObject['ICE'] = ice; 
		//console.log('in the sendICECandidates function ' + ice);
		//socket.broadcast.emit("sentICE", ice);
		io.emit("icecandidate", newObject);
	});
	//offer refused
	socket.on('refuse', (senderNickname, receiverNickname) => {
		console.log(senderNickname + " refused connection with "+ receiverNickname);

		var newObject = {}; 		
		newObject['senderNickname'] = senderNickname;
		newObject['receiverNickname'] = receiverNickname;
		//var json = JSON.stringify(newObject);		
		
		io.emit('connectionRefused', newObject); 
	}); 	

	// socket.on('sendSDPtoContact', (sdp, userName, dest) =>
//          {
//          	console.log('SEND SDP to ' + dest + ' from: ' + userName)
//          	// console.log('in the sendsdp function ' + sdp)
//          	socket.broadcast.emit("sdp", sdp)
//          	io.emit("sentSDPtoClient", { data: sdp, from: userName, to: dest })
//          })

	
socket.on('chatMessageDetection', (senderNickname, receiverNickname, messageContent) => 
{
	
//log the message in console 
	console.log(senderNickname+" to " + receiverNickname + " : " +messageContent);
	  var newObject = {}; 		
	  newObject['senderNickname'] = receiverNickname;
	  newObject['receiverNickname'] = receiverNickname;
	  newObject['messageContent'] = messageContent;

     io.emit('chatMessage' , newObject);
	  console.log("Sending message to "+ receiverNickname );

})
})


server.listen(3000,()=>
{
  console.log('Node app is running on port 3000')
})

function sendTo(connection, message) 
{ 
   connection.send(JSON.stringify(message)); 
}


// var users = [];

// app.get("/", function(req, res){
//     	res.send('Hello from 5000');	
// });
	
// io.sockets.on('connection' , function(client){

// 	client.on('join' , function(data){
// 		if(users.includes(data.id)){
// 			io.sockets.in(data.id).emit('join_faied');
// 			console.log('User ' + data.id + ' existed');
// 		} else {
// 			users.push(data.id);
// 			client.join(data.id);
// 			io.sockets.in(data.id).emit('join_success');
// 			console.log('User ' + data.id + ' has connected');

// 			client.broadcast.emit('new_user_join' , users);
// 		}
// 	});

// 	client.on('leave', function(data){
// 		console.log('User ' + data.id + ' has left');
// 		client.leave(data.id);
// 		users.pop(data.id);
// 		client.broadcast.emit('user_has_left' , users);
// 	});

// 	client.on('get_users', function(data){
// 		console.log('Get list user from ' + data.id);
// 		io.sockets.in(data.id).emit('users_from_server', users);
// 	});
	

// 	client.on('send', function(data){
// 		console.log('Make connect to ' + data.id);
// 		io.sockets.in(data.id).emit('wantconnect' , data);
// 	});
	
// 	client.on('acceptconnect' , function(data){
// 		console.log('createoffer ' + data.id);
// 		client.broadcast.emit('createoffer' , {});	
		
// 	});
	
// 	client.on('unacceptconnect' , function(data){
// 		client.broadcast.emit('unacceptconnect' , {});	
// 	});

// 	client.on('offer', function (details) {
// 		client.broadcast.emit('offer', details);
// 		console.log('offer: ' + JSON.stringify(details));
// 	});

// 	client.on('answer', function (details) {
// 		client.broadcast.emit('answer', details);
// 		console.log('answer: ' + JSON.stringify(details));
// 	});
		
// 	client.on('candidate', function (details) {
// 		client.broadcast.emit('candidate', details);
// 		console.log('candidate: ' + JSON.stringify(details));
// 	});
// });
