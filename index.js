require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const { WebSocketServer } = require('ws');
const { Client, middleware, validateSignature } = require('@line/bot-sdk');
const constants = require('./constant')
const { randomize, mongoDBConn, MsgModel, waitForAsync } = require('./helper')

const client = new Client(constants.lineConfig);
const app = express()
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });
const dbConn = mongoDBConn()

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static('public'));

let init = false

let messages = []


app.post('/webhook', middleware(constants.lineConfig), validateLineSignature, (req, res) => {
  Promise
    .all(req.body.events.map(async (e) => {
      handleEvent(e)
    }))
    .then((result) =>
      res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/', (req, res) => {
  const data = {
    title: 'My Awesome Carousel',
    slides: []
  };
  let photos = fs.readFileSync(path.join(__dirname, 'public', 'photos.json'))
  for (let e of randomize(JSON.parse(photos))) {
    data.slides.push({ src: e.url, effect: e.type })
  }
  res.render('index', data);
});

app.get('/api/photos', (req, res) => {
  const photos = fs.readFileSync(path.join(__dirname, 'public', 'photos.json'))
  res.json(JSON.parse(photos));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});


wss.on('connection', async (ws) => {
  console.log('Client connected \n',);
  const dbMsg = init ? [] : await MsgModel.getCollection().find().lean().finally(() => { init = true })
  messages = [...dbMsg,...messages]
  messages.reverse().forEach(e => {
    ws.send(JSON.stringify(e))
  })
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function validateLineSignature(req, res, next) {
  const str = JSON.stringify(req.body)
  const signature = req.get('X-Line-Signature');
  if (!signature || !validateSignature(str, constants.lineConfig.channelSecret, signature)) {
    console.error('Signature validation failed');
    return res.status(403).send('Forbidden');
  }
  next()
}
async function handleEvent(event) {
  if (event.type === 'message') {
    await handleMessage(event)
  } else if (event.type === 'postback') {
    return handlePostback(event);
  } else {
    return Promise.resolve(null);
  }
}

function handlePostback(event) {
  const data = event.postback.data;
  if (data.startsWith('action=send_invitation')) {
    return client.replyMessage(event.replyToken, {
      type: 'image',
      originalContentUrl: constants.invitationUrl,
      previewImageUrl: constants.invitationUrl
    });
  }
  if (data.startsWith('action=random_photo')) {
    const photos = fs.readFileSync(path.join(__dirname, 'public', 'photos.json'))
    const photos_obj = JSON.parse(photos)
    return client.replyMessage(event.replyToken, {
      type: 'image',
      originalContentUrl: photos_obj[Math.floor(Math.random() * photos_obj.length)]['url'],
      previewImageUrl: constants.donateUrl
    });
  }
  return Promise.resolve(null);
}

async function handleMessage(event) {

  const userId = event.source.userId;
  const profile = await client.getProfile(userId);
  const displayName = profile.displayName;
  const message = event.message.text;
  const msgCollection = MsgModel.getCollection()
  if (message === '請求聯絡資訊') {
    const msg = '開發者:\n前端: 許凱閔\n後端: 郭亭函\nEmail: a31735@gmail.com'
    return client.replyMessage(event.replyToken, { type: 'text', text: msg });
  }
  const { timeStamp } = await msgCollection.create({ displayName, message })

  messages.push({ displayName, message, timeStamp });
  broadcastMessage({ displayName, message, timeStamp });
  const reply = { type: 'text', text: displayName + '收到您的祝福!' };
  return client.replyMessage(event.replyToken, reply);
}
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}