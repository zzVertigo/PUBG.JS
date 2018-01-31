const path = require('path');
const AssetServer = require('./src/AssetServer');
const GameServer = require('./src/GameServer');
const SSLBypass = require('./src/SSLBypass');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on('unhandledRejection', err => {
    console.error(`Unhandled promise rejection:`, err);
    process.exit(-1);
});

console.log('Starting PUBG.JS Private Server v1.0\n')

const GS = new GameServer();
const AS = new AssetServer(GS, path.join(__dirname, 'storage', 'cache'));
const SSLB = new SSLBypass(path.join(__dirname, 'storage', 'https', 'mockserver.crt'), path.join(__dirname, 'storage', 'https', 'mockserver.key'), AS);