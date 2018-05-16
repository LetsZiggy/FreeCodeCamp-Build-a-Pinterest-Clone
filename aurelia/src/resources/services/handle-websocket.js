export function handleWebsocket(message, state) {
  switch(message.type) {
    case 'id':
      handleTypeID(message.data, state);
      break;
  }
}

function handleTypeID(data, state) {
  state.webSocketID = data;
  if(state.user.username) {
    state.webSocket.send(JSON.stringify({ type: 'login', username: state.user.username }));
  }
}