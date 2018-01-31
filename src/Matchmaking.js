const net = require('net');

var Client = new net.Socket();

class Matchmaking {
    constructor(address, port) {
        this.address = address;
        this.port = port;

        this.start();
    }

    start() {
        this.server = net.createServer(function(socket) {
            socket.pipe(socket);
        });

        this.server.listen(this.port, "127.0.0.1");

        console.log('Matchmaking server started at ' + this.port);
    }

    handleConnection(clientSocket) {
        Client.connect(this.port, this.address, function() {
            console.log('Connected!')
        });
    }
}