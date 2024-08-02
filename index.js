require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const { WebSocketServer } = require('ws');
const { Client, middleware, validateSignature } = require('@line/bot-sdk');
const constants = require('./constant')
const { randomize } = require('./helper')

const app = express()
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static('public'));

let messages = [];

app.post('/webhook', middleware(constants.lineConfig), validateLineSignature, (req, res) => {
  const client = new Client(constants.lineConfig);
  Promise
    .all(req.body.events.map(handleEvent, client, wss))
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
  let photos = fs.readFileSync(path.join(__dirname, 'public', 'photos.json'))
  res.json(JSON.parse(photos));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});


wss.on('connection', (ws) => {
  console.log('Client connected \n',);

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
function handleEvent(event,client, wss) {
  if (event.type === 'message') {
    handleMessage(event,client, wss)
  } else if (event.type === 'postback') {
    return handlePostback(event,client);
  } else {
    return Promise.resolve(null);
  }
}

function handlePostback(event,client) {
  const data = event.postback.data;

  if (data.startsWith('action=send_invitation')) {
    return client.replyMessage(event.replyToken, {
      type: 'image',
      originalContentUrl: constants.invitationUrl,
      previewImageUrl: constants.invitationUrl
    });
  }
  return Promise.resolve(null);
}
function handleMessage(event,client, wss=undefined) {
  if (event.message.text == '謝謝誇獎!') return
  const userId = event.source.userId;
  const message = event.message.text;
  messages.push({ userId, message });
  const reply = { type: 'text', text: userId + '收到!' };
  wss && broadcastMessage({ userId, message });
  return client.replyMessage(event.replyToken, reply);
}
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}