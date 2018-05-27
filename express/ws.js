const WebSocket = require('ws');
const createID = require('./routes/services/create-id.js');
let wss = null;
let wssClients = {};

function webSocketInitialise(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    let id = createID(wssClients);
    wssClients[id] = ws;

    ws.isAlive = true;
    ws.id = id;
    ws.username = null;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
      message = JSON.parse(message);

      switch(message.type) {
        case '':
          break;
      }
    });

    ws.send(JSON.stringify({ type: 'id', data: id }));
  });

  let connectionCheck = setInterval(() => {
    wss.clients.forEach((client) => {
      if(!client.isAlive) { return(client.terminate()); }
      client.isAlive = false;
      client.ping(null, false, true);
    });
  }, 30000);
}

function wsLike(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'like',
        data: data
      }));
    }
  });
}

function wsUnlike(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'unlike',
        data: data
      }));
    }
  });
}

function wsDelete(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'delete',
        data: data
      }));
    }
  });
}

function wsAdd(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'add',
        data: data
      }));
    }
  });
}

module.exports = {
  webSocketInitialise: webSocketInitialise,
  wsLike: wsLike,
  wsUnlike: wsUnlike,
  wsDelete: wsDelete,
  wsAdd: wsAdd
}
