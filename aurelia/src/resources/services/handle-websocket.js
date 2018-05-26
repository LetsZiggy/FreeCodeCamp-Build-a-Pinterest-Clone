export function handleWebsocket(message, state) {
  switch(message.type) {
    case 'id':
      handleTypeID(message.data, state);
      break;
    case 'like':
      handleTypeLike(message.data, state);
      break;
    case 'unlike':
      handleTypeUnlike(message.data, state);
      break;
    case 'delete':
      handleTypeDelete(message.data, state);
      break;
    case 'add':
      handleTypeAdd(message.data, state);
      break;
  }
}

function handleTypeID(data, state) {
  state.webSocketID = data;
  if(state.user.username) {
    state.webSocket.send(JSON.stringify({ type: 'login', username: state.user.username }));
  }
}

function handleTypeLike(data, state) {
  let index = state.pins.map((v, i, a) => v.id).indexOf(data.id);

  state.pins[index].likes.push(data.username);
}

function handleTypeUnlike(data, state) {
  let index = state.pins.map((v, i, a) => v.id).indexOf(data.id);
  let userIndex = state.pins[index].likes.indexOf(data.username);

  state.pins[index].likes.splice(userIndex, 1);
}

function handleTypeDelete(data, state) {
  let index = state.pins.map((v, i, a) => v.id).indexOf(data.id);

  state.pins.splice(index, 1);
}

function handleTypeAdd(data, state) {
  state.pins.push(data);
}
