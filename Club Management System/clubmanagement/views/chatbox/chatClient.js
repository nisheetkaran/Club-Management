//const name =  require('C:/Users/ASUS/Downloads/prac4/prac4/index');
const socket = io('http://localhost:8000');

// const CoOrdinator= require('./models/coordinator');
// const Member = require('./models/member');
// const Admin = require('./models/admin');
// const Member = require('E:/prac/models/member.js')
// const CoOrdinator = require('E:/prac/models/coordinator.js')
// const Admin = require('E:/prac/models/admin.js')
// const Member = require('C:/Users/ASUS/Downloads/prac4/prac4/models/member')
// const CoOrdinator = require('C:/Users/ASUS/Downloads/prac4/prac4/models/coordinator')
// const Admin = require('C:/Users/ASUS/Downloads/prac4/prac4/models/admin')
// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const namefront = document.getElementById('userName');
name= namefront.value

const messageContainer = document.querySelector(".container");
console.log(namefront.value)

// Audio that will play on receiving messages
var audio = new Audio('chatbox/ting.mp3');

// Function which will append event info to the contaner
const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position == 'left') {
    audio.play();
  }
}


// Ask new user for his/her name and let the server know
// const name = prompt("Enter your name to join");
//const name =  require('C:/Users/ASUS/Downloads/prac4/prac4/index');
//const name = "ashish";
//name=globalname
//import name from 'C:/Users/ASUS/Downloads/prac4/prac4/index'
socket.emit('new-user-joined', name);

// If a new user joins, receive his/her name from the server
// socket.on('user-joined', name => {
//   append(`${name} joined the chat`, 'middle');
// })

// If server sends a message, receive it
socket.on('receive', data => {
  append(`${data.name}: ${data.message}`, 'left');
})

socket.on('output-messages', data => {
  console.log(data)
  if(data.length){
     data.forEach(data=>{
    //   append
       if(data.name===name){
        append(`You: ${data.msg}`, 'right');
       }
       else{
        append(`${data.name}: ${data.msg}`, 'left');
       }
     })
    //append(`${data.name}: ${data.msg}`, 'left');
  }
  //append(`${data.name}: ${data.message}`, 'left');
})

// If a user leaves the chat, append the info to the container
// socket.on('left', name => {
//   append(`${name} left the chat`, 'middle');
// })

// If the form gets submitted, send server the message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  append(`You: ${message}`, 'right');
  socket.emit('send', message);
  messageInput.value = ''
})