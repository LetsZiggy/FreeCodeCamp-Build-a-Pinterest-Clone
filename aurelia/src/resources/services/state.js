export const state = {
  login: {
    chance: 2,
    delay: 0,
    timer: 0,
    interval: null
  },
  user: {
    // username: 'testUser',
    username: null,
    expire: null,
    interval: null,
    toLike: null,
    toAdd: false
  },
  webSocketID: null,
  webSocket: null,
  pins: []
};