const mongoose = require('mongoose')
function randomize(arr) {
  for (let i = 0; i < arr.length; i++) {
    let randomNum = Math.floor(Math.random() * arr.length)
    let temp = arr[i]
    arr[i] = arr[randomNum]
    arr[randomNum] = temp
  }
  return arr
}

function mongoDBConn() {
  mongoose.connect(process.env.mongoURI)
  const db = mongoose.connection
  db.on('error', () => {
    console.log('mongodb error!')
  })
  db.once('open', () => {
    console.log('mongodb connected!')
  })
  return db
}

class MsgModel {
  static collection = null;

  constructor() {
    if (!MsgModel.collection) {
      this.initializeSchema();
      MsgModel.collection = mongoose.model('Message', this.messageSchema);
    }
  }

  initializeSchema() {
    this.messageSchema = new mongoose.Schema({
      displayName: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timeStamp: {
        type: Date,
        default: Date.now,
        required: true,
      }
    });
  }

  static getCollection() {
    if (!MsgModel.collection) {
      new MsgModel();
    }
    return MsgModel.collection;
  }
}

function waitForAsync(sec) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      return res(`wait for ${res} res`)
    }, sec * 1000)
  })
}

class inmemoryDB {
  message = []
  constructor() {

  }
  fetchData = async () => {
    this.message = await msgModel().find().sort({ timeStamp: -1 }).lean()
  }
}


module.exports = { randomize, mongoDBConn, MsgModel, waitForAsync }