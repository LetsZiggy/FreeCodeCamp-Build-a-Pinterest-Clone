const crypto = require('crypto');

function createSalt(length) {
  return(crypto.randomBytes(Math.ceil(length / 2))
               .toString('hex')
               .slice(0, length));
}

function sha512(data, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(data);
  hash = hash.digest('hex');
  return({ salt: salt, hash: hash });
}

function handleHashing(data, salt=null) {
  if(salt === null) { salt = createSalt(16); }
  return(sha512(data, salt));
}

module.exports = handleHashing;