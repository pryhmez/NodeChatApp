const socket = io();


//elements
const $messageForm = document.querySelector('#messageform');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
var $sidebar = document.querySelector('#sidebar').innerHTML;


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true});

//auto scroll
const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //heigght of mesages container
    const containerHeight = $messages.scrollHeight

    //how far i have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//listen for message
socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

//listen for location
socket.on('locationmessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

//listen for roomdata
socket.on('roomdata', ({ room, users }) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()


    $messageFormButton.setAttribute('disabled', 'disabled')
    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value
//     console.log('clicked')
    socket.emit('sendmessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(err){
            return console.log(err)
        }

        console.log('message delivered');
    });
});

$sendLocationButton.addEventListener('click', () => {
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    function success(pos) {
        $sendLocationButton.removeAttribute('disabled');
        var crd = pos.coords;
      
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        socket.emit('sendlocation', {
            latitude: crd.latitude,
            longitude: crd.longitude
        }, (err) => {
            if(err) {
                return console.log(err)
            }

            console.log('message delivered');
        })
      }
      
      function error(err) {
        $sendLocationButton.removeAttribute('disabled');
        console.warn(`ERROR(${err.code}): ${err.message}`);
        return alert(`ERROR(${err.code}): ${err.message}`)
      }
      
      navigator.geolocation.getCurrentPosition(success, error);
});


//once user joins notify that a user has joined
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})