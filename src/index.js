const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


// socket.emit -> sends event to a specific client
// io.emit -> sends event to everone
// socket.brodcast.emit -> sends event to everyone expect the client itself

// io.to.emit -> emits an event to every one in a specific room
// socket.brodcast.to().emit -> sending event to everyone in a specific room except the client itself

// io.on is only for connection
io.on('connection', (socket)=>
{
    console.log('New WebSocket connection')
    
    socket.on('join', ({username, room},callback)=>
    {
        const {error,user}= addUser({id:socket.id, username:username, room:room})
        if(error)
        {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback)=>
    {
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message))
        {
            return callback('Bad words are not allowed')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(location,callback)=>
    {
        const user = getUser(socket.id)
        const url = `http://google.com/maps?q=${location.longitude},${location.latitude}`
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,url))
        callback()
    })

    // socket.on('disconnect' is saved for disconnect
    socket.on('disconnect', ()=>
    {
        const user = removeUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    
})



server.listen(port, ()=>
{
    console.log(`Server is up on port ${port}`)
})