const socket = io()
const form = document.querySelector("#message-form")
const forminput = form.querySelector("input")
const formbutton = form.querySelector("button")
const locationbutton= document.querySelector("#send-location")
const display = document.querySelector("#messages")

const template = document.querySelector("#template").innerHTML
const locationtemplate = document.querySelector("#locationtemplate").innerHTML
const sidebar = document.querySelector("#sidebar-template").innerHTML
const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = ()=>{
       const newmessage = form.lastElementChild
       const styles = getComputedStyle(newmessage)
       const margin = parseInt(styles.marginBottom)
       const height = newmessage.offsetHeight+margin
       const visible = form.offsetHeight
       const container = form.scrollHeight
       const scroll = form.scrollTop+visible
       if(container-height<=scroll){
            form.scrollTop = form.scrollHeight
       }
}

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render(template,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    display.insertAdjacentHTML("beforeend",html)
    autoscroll()   
})

   socket.on("locationmessage",(message)=>{
       console.log(message)
       const html = Mustache.render(locationtemplate,{
        username:message.username,   
        url:message.url,
           createdAt:moment(message.createdAt).format("h:mm a")
       })
       display.insertAdjacentHTML("beforeend",html)
       autoscroll()
    })
socket.on("roomdata",({room,users})=>{
    const html = Mustache.render(sidebar,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})

form.addEventListener("submit",(e)=>{
           e.preventDefault()
           formbutton.setAttribute("disabled","disabled")
const message =e.target.elements.message.value
       socket.emit("sendMessage",message,(error)=>{
           formbutton.removeAttribute("disabled")
           forminput.value=""
           forminput.focus()
          if(error){
              return console.log(error)
          }
          console.log("message delivered")
       })
})
locationbutton.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("geolocation is not supported in your browser")
    }
    locationbutton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((location)=>{
          socket.emit("sendlocation",{
              latitude:location.coords.latitude,
              longitude:location.coords.longitude
          },()=>{
              locationbutton.removeAttribute("disabled")
              console.log("location shared")
          })
    })
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})