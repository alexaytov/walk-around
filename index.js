const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 8080;

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);
  
  // Initialize user position
  users[socket.id] = { x: Math.random() * 800, y: Math.random() * 600 };

  socket.on('targetHit', (data) => {
    io.emit('targetHit', { id: socket.id, score: data.score });
  });

  socket.emit('init', users);
  socket.broadcast.emit('newUser', { id: socket.id, position: users[socket.id] });

  socket.on('move', (data) => {
    users[socket.id] = data;
    io.emit('move', { id: socket.id, position: data });
  });

  socket.on('message', (data) => {
    io.emit('message', { id: socket.id, message: data });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    delete users[socket.id];
    io.emit('removeUser', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});