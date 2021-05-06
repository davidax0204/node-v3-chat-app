const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// looks for the part of the url that contains username, room values and saves them
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix: true})
const autoScroll = () =>
{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessgeStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessgeStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container 
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled ?
    const scrollOffSet = $messages.scrollTop + visibleHeight

    // if(containerHeight - newMessageHeight <= scrollOffSet)
    // {
    //     $messages.scrollTop = $messages.scrollHeight
    // }
    if(Math.round(containerHeight - newMessageHeight - 1) <= Math.round(scrollOffSet)){
        messages.scrollTop = messages.scrollHeight;
    }
}



socket.on('message',(message)=>
{
    console.log(message)
    // Mustache lib
    const html = Mustache.render(messageTemplate,
        {
            // The Mustache variables that will be used in the html file
            username :message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message)=>
{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,
        {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData',({room,users})=>
{
    const html = Mustache.render(sideBarTemplate,
        {
            room,
            users
        })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e)=>
{
    e.preventDefault()
    
    // disable the form button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>
    {
        // enable the form button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error)
        {
            return console.log(error)
        }
        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click', ()=>
{
    
    if(!navigator.geolocation)
    {
        return alert('Geolocation not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((postion)=>
    {
        socket.emit('sendLocation',{
            longitude:postion.coords.longitude,
            latitude: postion.coords.latitude
        },()=>
        {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join',{username,room}, (error)=>
{
    if(error)
    { 
        // sending the users back to the sign up page
        location.href = '/'
        alert(error)
    }
})