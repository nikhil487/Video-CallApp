let socket = io.connect("/");
const mypeer = new Peer(undefined)
const myPeer = new Peer(undefined, {
    host: '/',
    port: '443',  // port defined for peerjs.
    path: '/peerjs'
  })
var roomname = prompt("Enter Room Name You want to join");

var myVideo;
var output = document.getElementById("output");
var vd = document.getElementById("user");
vd.muted = true;
var userId;
var pr = document.getElementById("peer");
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
var peers = {};
if(roomname == "")
{
    alert("Room name not entered");
}
else 
{
var userName = prompt("Enter your name");
if (userName == "") {
    alert("Name not entered");
}
else {
    // when a new peer comes we provide him/her a new userId using peerjs library
    mypeer.on('open', id => {
        userId = id;
        socket.emit('join', roomname, id, userName);// this event will let us join the room
        // and tell the other user that we have joined the room 
    })
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(Stream => {
        myVideo = Stream;
        admyvideo(vd, myVideo);
        // we are responding to the call that our peer does to us 
        mypeer.on('call', call => {
            call.answer(myVideo);// we answer it 

            call.on('stream', userVideo => {// we answer it above but we need to recieve his video stream;
                admyvideo(pr, userVideo);
            })
        })
        socket.on("user-connected", userId => {
            connectNewUser(userId, myVideo); //we are sending our video stream to newly connected user
        })
        socket.on("user-disconnect", Id => {
            console.log("disconnected :" + userName);
            if (peers[Id]) peers[Id].close();
            else {
                pr.remove();
            }
        })
    })

    function connectNewUser(userId, stream) {
        // (basically calling our peer and providing our video stream)we are calling the userid one with our media stream;
        var call = mypeer.call(userId, stream);// as we call our peer we send our video streams to;

        call.on('stream', function (streams)//here  in this call bck function  we recieve the stream of our peer and we will display it;  
        {
            admyvideo(pr, streams);
        })
        call.on('close', () => {
            pr.remove();
        })
        peers[userId] = call;
    }
    // function for adding video streams
    function admyvideo(video, stream) {
        video.srcObject = stream;
        video.play();
    }
    // video-button turn on/off our video; 
    document.getElementById("video-button").addEventListener('click', () => {
        const videoEndabled = myVideo.getVideoTracks()[0].enabled;
        console.log("hello i am doing");
        if (videoEndabled) {
            myVideo.getVideoTracks()[0].enabled = false;
            document.getElementById("video-button").style.color = "red";
        }
        else {
            myVideo.getVideoTracks()[0].enabled = true;
            document.getElementById("video-button").style.color = "white";
        }
    })
    //Audio button on/off our audio.
    document.getElementById("audio-button").addEventListener('click', () => {
        const videoEndabled = myVideo.getAudioTracks()[0].enabled;
        console.log("hello i am doing");
        if (videoEndabled) {
            myVideo.getAudioTracks()[0].enabled = false;
            document.getElementById("audio-button").style.color = "red";
        }
        else {
            document.getElementById("audio-button").style.color = "white";
            myVideo.getAudioTracks()[0].enabled = true;
        }
    })
    // form when the form submits the messsage displays 
    // as you : your message 
    // and using socket it will appear to our user end.
    form.addEventListener('submit', (e) => {
        e.preventDefault();// prevents the reloading of the page after we submit the form;
        const message = messageInput.value;
        output.innerHTML += "<li><strong>" + "You" + "</strong>" + ": " + `${message}` + "</li>";
        socket.emit('sendingMessage', roomname, message, userId);
        messageInput.value = ''
    })
    // recieves the message from our usser //
    socket.on("recieve", (data) => {
        var k = data.message;
        var t = data.name;
        output.innerHTML += "<p><strong>" + `${t}` + "</strong>" + ":" + `${k}` + "</p>";
    });

    //leave meeting button 
    // whenever it gets clicked user is redirected to about:blank;
    document.getElementById("leave").addEventListener('click', () => {
        open('/', '_self').close();
        window.location.href = "about:blank";
        window.close();
    })
}
}
