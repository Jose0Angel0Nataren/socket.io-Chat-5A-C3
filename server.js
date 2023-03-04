const application = require('express')();
const server = require('http').createServer(application)
const io = require('socket.io')(server);
const PORT = process.env.PORT || 4000
const connectedUsers = {};//users array

application.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(PORT, () => {
    console.log('Servidor ejecutando en puerto: ' + PORT);
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        delete connectedUsers[socket.username];//like reset
        console.log('Usuario desconectado - Usuario: ' + socket.username);
    });

    socket.on('new message', (msg) => {
        io.emit('send message', {message: msg, user: socket.username});
    });
    
    socket.on('new user', (usr) => {
        if (connectedUsers[usr]) {
            socket.emit("dropusername","This username is already on use");//username validation and msg (like an alert)
        } else {
            connectedUsers[usr] = socket.id;//array's id
            socket.username = usr;
            console.log('Usuario conectado - Usuario: ' + socket.username);
            socket.emit("username success", usr);//user name validation and username to array
        } 
    });

//code*
    socket.on('priv message', (data) => {
        const theuser = connectedUsers[data.gotusrnme];
        //gotusrnme is the username extracted from the input to search it on the array
        if (theuser) {//was find
            io.to(theuser).emit('priv message', { //join the user and the msg
                redir: data.gotusrnme, //cambio variable socket.got
                sms: data.sms 
            });
            socket.emit('new priv message', data.gotusrnme);//redirecting the msg
        } else {
            socket.emit('username error', 'User not found');//alert
        }
    });
    
    socket.on('get allconnected users', () => {
        socket.emit('allconnected u', Object.keys(connectedUsers));
    });//this call the socket to work with utu
    
    socket.on('send image', (imageData) => {
        socket.broadcast.emit('receive image', imageData);
    });//sending img to everyone
        
    socket.on('receive image', (imageData) => {
        const messageList = document.getElementById('msgslist');x
        const chatItem = document.createElement('li');
        const image = document.createElement('img');
        image.src = imageData;
        chatItem.appendChild(image);
        messageList.appendChild(chatItem);
        window.scrollTo(0, document.body.scrollHeight);
    });
});