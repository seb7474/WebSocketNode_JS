var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
})

var pseudoTab = {};
var scoreTab = {};

var playerList = [];
var roomList = [];



io.on('connection', function(socket) {


    console.log(socket.id + ' is connected');


    // initialisation du score à la connexion

    if (typeof scoreTab[socket.id] === 'undefined') {

        scoreTab[socket.id] = { score: 0 };

    }


    // gestion de la déconnexion

    socket.on('disconnect', function() {
        console.log(socket.id + ' is disconnected');
    })


    // rejoindre une room

    socket.on('joinRoom', function(roomName) {

        socket.join(roomName, () => {


            if (typeof pseudoTab[socket.id] === 'undefined') {

                socket.broadcast.to(roomName).emit('message', socket.id + ' a rejoint la room : ' + roomName);


            } else {

                socket.broadcast.to(roomName).emit('message', pseudoTab[socket.id].name + ' a rejoint la room : ' + roomName);

            }

            io.sockets.to(socket.id).emit('message', "Vous avez rejoint la room : " + roomName);

        });


    })



    // list des room

    socket.on('roomList', function() {

        var listRoomTab = [];

        Object.keys(io.nsps['/'].adapter.rooms).forEach(function(key) {

            console.log(io.nsps['/'].adapter.rooms[key]);
            console.log(io.nsps['/'].adapter.rooms[key].sockets);

            // nom des rooms 
            console.log("room name ", key);

            listRoomTab.push(key);

        })

        io.sockets.to(socket.id).emit(listRoomTab);

    })




    // list des player dans la room

    socket.on('playerListRoom', function() {


        // on récupérer le nom de la room du joueur

        Object.keys(socket.rooms).forEach(function(room, idx) {

            if (idx == 1) {
                roomName = room;
            }

        });


        var tabPlayerInRoom = [];

        Object.keys(io.nsps['/'].adapter.rooms).forEach(function(key) {

            if (key != socket.id && roomName == key) {


                Object.keys(io.nsps['/'].adapter.rooms[key].sockets).forEach(function(key2) {

                    if (typeof pseudoTab[key2] === 'undefined') {

                        tabPlayerInRoom.push(key2);

                    } else {

                        tabPlayerInRoom.push(pseudoTab[key2].name);

                    }

                    // id des player in rooms
                    console.log("id player ", key2);

                })


                io.sockets.to(socket.id).emit(tabPlayerInRoom);


            }


        })



    })




    // quitter une room

    socket.on('leaveRoom', function(roomName) {

        socket.leave(roomName, () => {


            if (typeof pseudoTab[socket.id] === 'undefined') {

                socket.broadcast.to(roomName).emit('message', socket.id + ' a quitté la room : ' + roomName);


            } else {

                socket.broadcast.to(roomName).emit('message', pseudoTab[socket.id].name + ' a quitté la room : ' + roomName);

            }

            io.sockets.to(socket.id).emit('message', "Vous avez quitté la room : " + roomName);

        });


    })


    // définir ou changer de Pseudo

    socket.on('addPseudo', function(pseudoSocket) {

        pseudoTab[socket.id] = { name: pseudoSocket };

        console.log("Nouveau pseudo pour : " + socket.id + " => " + pseudoTab[socket.id].name);

        io.to(socket.id).emit('message', 'Votre nouveau pseudo est : ' + pseudoTab[socket.id].name);
    })



    // Score => addPoint

    socket.on('addPoint', function(points) {


        if (typeof scoreTab[socket.id] === 'undefined') {

            scoreTab[socket.id] = { score: 0 };
            scoreTab[socket.id].score = scoreTab[socket.id].score + points;

        } else {
            scoreTab[socket.id].score = scoreTab[socket.id].score + points;
        }

        if (typeof pseudoTab[socket.id] === 'undefined') {
            console.log(points + " nouveau(x) point(s) pour : " + socket.id);
        } else {
            console.log(points + " nouveau(x) point(s) pour : " + pseudoTab[socket.id].name);
        }

        io.to(socket.id).emit('scoreReturn', scoreTab[socket.id].score);
    })



    // Score => removePoint

    socket.on('removePoint', function(points) {

        if (typeof scoreTab[socket.id] === 'undefined') {

            scoreTab[socket.id] = { score: 0 };
            scoreTab[socket.id].score = scoreTab[socket.id].score - points;

        } else {
            scoreTab[socket.id].score = scoreTab[socket.id].score - points;
        }

        if (typeof pseudoTab[socket.id] === 'undefined') {
            console.log(points + " point(s) perdu pour : " + socket.id);
        } else {
            console.log(points + " point(s) perdu pour : " + pseudoTab[socket.id].name);
        }

        io.to(socket.id).emit('scoreReturn', scoreTab[socket.id].score);
    })


    // Score => getPoint

    socket.on('getPoint', function() {


        if (typeof scoreTab[socket.id] === 'undefined') {

            io.to(socket.id).emit('scoreReturn', 0);


        } else {
            io.to(socket.id).emit('scoreReturn', scoreTab[socket.id].score);
        }


    })



    // Tazer => removePoint 

    socket.on('tazerRemovePoint', function() {

        let tazerPower = 5;

        Object.keys(scoreTab).forEach(function(key) {

            if (!(key == socket.id)) {


                if (typeof scoreTab[key] === 'undefined') {

                    scoreTab[key] = { score: 0 };
                    scoreTab[key].score = scoreTab[key].score - tazerPower;

                } else {
                    scoreTab[key].score = scoreTab[key].score - tazerPower;
                }

                if (typeof pseudoTab[socket.id] === 'undefined') {

                    console.log(tazerPower + " point(s) perdu (Tazer) pour : " + socket.id);
                } else {
                    console.log(tazerPower + " point(s) perdu (Tazer) pour : " + pseudoTab[socket.id].name);

                }

                io.to(socket.id).emit('scoreReturn', scoreTab[key].score);

            }

        });




    })



    // message

    socket.on('message', function(msg) {


        console.log('message recu : ' + msg);
        console.log(socket.rooms);


        if (typeof pseudoTab[socket.id] === 'undefined') {
            s
            Object.keys(socket.rooms).forEach(function(room, idx) {

                if (Object.keys(socket.rooms).length > 1) {
                    if (idx != 0) {
                        socket.broadcast.to(room).emit('message', socket.id + " dit : " + msg);
                    }
                } else {
                    socket.broadcast.to(room).emit('message', socket.id + " dit : " + msg);
                }

            });

        } else {

            Object.keys(socket.rooms).forEach(function(room, idx) {

                if (Object.keys(socket.rooms).length > 1) {
                    if (idx != 0) {
                        socket.broadcast.to(room).emit('message', pseudoTab[socket.id].name + " dit : " + msg);
                    }
                } else {
                    socket.broadcast.to(room).emit('message', pseudoTab[socket.id].name + " dit : " + msg);
                }

            });

        }


        io.to(socket.id).emit('message', 'message envoyer');


    })

})



http.listen(3000, function() {
    console.log("Server running on 3000")
})