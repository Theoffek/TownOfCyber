//function that queries room names from server on load 
function onLoad() {
    console.log('Bollocks')
    const socket = io()
    socket.on('roomNames', roomNames => {
        console.log('Knobhead')
        let comboBox = document.getElementById('room')
        roomNames.forEach(roomName => {
            let option = document.createElement('option')
            option.innerText = roomName
            comboBox.appendChild(option)
        });
    })
    socket.emit('queryRoomNames')
}
