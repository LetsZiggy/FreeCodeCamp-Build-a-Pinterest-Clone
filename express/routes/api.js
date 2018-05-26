const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const createID = require('./services/create-id.js');
const handleHashing = require('./services/handle-hashing.js');
const {wsLike, wsUnlike, wsDelete, wsAdd} = require('../ws.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

router.get(`/pins/get`, async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionPins = await db.collection('build-a-pinterest-clone-pins');
  let findPins = await collectionPins.find({}, { projection: { _id: 0 } }).toArray();
  client.close();

  res.json({ get: true, pins: findPins });
});

router.post(`/pins/like`, async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPins = await db.collection('build-a-pinterest-clone-pins');
    let updatePin = await collectionPins.updateOne({ id: req.body.pin.id }, { $push: { likes: req.body.username } });
    client.close();

    wsLike(req.body.wsID, { id: req.body.pin.id, username: req.body.username });
    res.json({ like: true });
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ like: false });
  }
});

router.post(`/pins/unlike`, async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionPins = await db.collection('build-a-pinterest-clone-pins');
    let updatePin = await collectionPins.updateOne({ id: req.body.pin.id }, { $pull: { likes: req.body.username } });
    client.close();

    wsUnlike(req.body.wsID, { id: req.body.pin.id, username: req.body.username });
    res.json({ unlike: true });
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ unlike: false });
  }
});

router.post(`/pins/delete`, async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('build-a-pinterest-clone-ids');
    let removeIDs = await collectionIDs.updateOne({ type: 'pins' }, { $pull: { list: req.body.pin.id } });
    let collectionPins = await db.collection('build-a-pinterest-clone-pins');
    let updatePin = await collectionPins.deleteOne({ id: req.body.pin.id });
    client.close();

    wsDelete(req.body.wsID, { id: req.body.pin.id });
    res.json({ delete: true });
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ delete: false });
  }
});

router.post(`/pins/add`, async (req, res, next) => {
  if(req.cookies.id) {
    let data = {};
    data.image = req.body.pin.image;
    data.title = req.body.pin.title;
    data.poster = req.body.username;
    data.likes = [];

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('build-a-pinterest-clone-ids');
    let findID = await collectionIDs.findOne({ type: 'pins' }, { projection: { _id: 0, type: 0 } });
    let id = createID(findID.list);
    data.id = id;
    let insertID = await collectionIDs.findOneAndUpdate({ type: 'pins' }, { $push: { list: id } });
    let collectionPins = await db.collection('build-a-pinterest-clone-pins');
    let insertPin = await collectionPins.insertOne(data);
    client.close();

    wsAdd(req.body.wsID, data);
    res.json({ add: true, pin: { id: id } });
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ add: false });
  }
});

router.post('/user/checkname', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('build-a-pinterest-clone-ids');
  let findID = await collectionIDs.findOne({ type: 'users' }, { projection: { _id: 0, type: 0 } });
  client.close();

  let takenUsernames = Object.entries(findID).map((v, i, a) => v[1]);
  if(takenUsernames.indexOf(req.body.username) === -1) {
    res.json({ taken: false });
  }
  else {
    res.json({ taken: true });
  }
});

router.post('/user/create', async (req, res, next) => {
  if(!req.cookies.id) {
    let data = {};
    data.username = req.body.username;
    data.email = handleHashing(req.body.email);
    data.password = handleHashing(req.body.password);

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('build-a-pinterest-clone-ids');
    let findID = await collectionIDs.findOne({ type: 'users' }, { projection: { _id: 0, type: 0 } });
    let id = createID(findID.list);
    data.id = id;
    let query = `list.${id}`;
    let insertID = await collectionIDs.findOneAndUpdate({ type: 'users' }, { $set: { [query]: req.body.username } });
    let collectionUsers = await db.collection('build-a-pinterest-clone-users');
    let insertUser = await collectionUsers.insertOne(data);
    client.close();

    let date = new Date();
    date.setDate(date.getDate() + 1);
    // res.cookie('id', id, { expires: date, path: '/', httpOnly: true });
    res.cookie('id', id, { expires: date, path: '/', httpOnly: true, secure: true });

    res.json({ create: true, expire: date.getTime() });
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ create: false });
  }
});

router.post('/user/login', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('build-a-pinterest-clone-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });
    client.close();

    if(!findUser) {
      res.json({ get: false });
    }
    else {
      let password = await handleHashing(req.body.password, findUser.password.salt);

      if(password.hash !== findUser.password.hash) {
        res.json({ get: false }); 
      }
      else {
        let date = new Date();
        date.setDate(date.getDate() + 1);
        // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
        res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
        res.json({ get: true, expire: date.getTime() });
      }
    }
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ get: false });
  }
});

router.post('/user/logout', async (req, res, next) => {
  // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
  res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
  res.json({ logout: true });
});

router.post('/user/edit', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('build-a-pinterest-clone-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });
    let email = await handleHashing(req.body.email, findUser.email.salt);

    if(!findUser || email.hash !== findUser.email.hash) {
      client.close();
      res.json({ update: false });
    }
    else {
      let password = await handleHashing(req.body.password);
      let updateUser = await collectionUsers.updateOne({ username: req.body.username }, { $set: { password: { hash: password.hash, salt: password.salt } } });
      client.close();

      let date = new Date();
      date.setDate(date.getDate() + 1);
      // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
      res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
      res.json({ update: true, expire: date.getTime() });
    }
  }
  else {
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ update: false });
  }
});

module.exports = router;
