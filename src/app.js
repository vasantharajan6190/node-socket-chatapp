const express = require("express")
const app = express()
const path = require("path")
const port = process.env.PORT || 3000
const socketio = require("socket.io")
const filter = require("bad-words")
const http = require("http")
const {generatemessage,generatelocation} =require("./utils/messages")
const Filter = require("bad-words")
const htmldir = path.join(__dirname,"../public")
const server = http.createServer(app)
const io = socketio(server)
const {adduser,removeuser,getuser,getuserinroom} = require("./utils/users")
app.use(express.static(htmldir))

io.on("connection",(socket)=>{
    console.log("new socket connection")
    
    socket.on("join",(options,callback)=>{
        const {error,user} = adduser({id:socket.id, ...options}) 
        if(error){
            return callback(error)
        }
        socket.join(user.room)
         socket.emit("message",generatemessage("Admin","welcome"))
         socket.broadcast.to(user.room).emit("message",generatemessage("Admin",`${user.username} has joined!`))
         io.to(user.room).emit("roomdata",{
             room:user.room,
             users:getuserinroom(user.room)
         })

         callback()
        })
    
    socket.on("sendMessage",(message,callback)=>{
        const user = getuser(socket.id)    
        const filter = new Filter()
            if (filter.isProfane(message)){
                return callback("Profanity not allowed")
            }
            io.to(user.room).emit("message",generatemessage(user.username,message))
            callback()
    })
    socket.on("disconnect",()=>{
        const user= removeuser(socket.id)
        if(user){
            io.to(user.room).emit("message",generatemessage("Admin",`${user.username} has left`))
            io.to(user.room).emit("roomdata",{
                room:user.room,
                users:getuserinroom(user.room)
            })
        }
        
    })
    socket.on("sendlocation",(location,callback)=>{
        const user = getuser(socket.id)
        io.to(user.room).emit("locationmessage",generatelocation(user.username,`https://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port,()=>{
    console.log(`server running at ${port}`)
})