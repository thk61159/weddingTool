const fs = require('fs')
const path = require('path')
const express = require('express')
const { WebSocketServer } = require('ws');
const { Client, middleware, validateSignature } = require('@line/bot-sdk');
const { randomize } = require('./helper')
const invitationUrl = "https://lh3.googleusercontent.com/fife/ALs6j_FblIDgAPP_zA033ZYGKCYsRD9MQM-MrjD9pX059fDxoAglJt-VcRSAvHhbsFC-MhTpY7xrF7JQ9b6x9M7tJmT1wEjHhhzh11D_6TliG4HMhKKTRax6YQPTxHFOgLc0RypUv4qlQJgKPoOPMif-Sxq1Sl8yNpk4Ezwi3mdLK-7p1KPIzmKbqDdj035PuwUGiLqsYCP4wv60oV_0gP_6-emlipQhe4WUdNeilO-wmoVYVhfGUGnWPFjt1rjj4x1eVuXq8tshiniNlsUpA8woOzZgPZLXo3t4I7V_2rKzBXAyqZqn3PuH21Cjvjh3sugkMfMTe7OCGM-r5iSej9aDmQ6UeU2InJxFdEnNelyVWOxs0qb4i_-gVFLQgBxeQDmVxIp6IhZ3l6l9jcELNWVTqrvPn-W8Ji9Hh-KUftPFIfgXqeXvJH0qGiMfnwo_YHzqiMTb2_B4fFCzZ3KwdqaC0m9XsBpHiYm1OHGB30y0-fb5a4GDqYN7jOQFYo4gpGEE7Fbr2rnRpT4K2QrnIW_nOI37XahcB-G5W-CUb4nNjxOqBvdugGDnbB1GJSEjqmzyONnfwreRhHhb3HT-aVmmOV6455Z2UHcpZwk0UOxdGgxyJ4Q0rEaGcyRnIYW9liTLv2RdoiZ33DJumCB8JPl7Z5v-zwe6S763heHKvNGAb4BnMxwE-zUL-IAs9ATNWv5NXjDBHczioBOyXmQH3WMhc1yl9fbTzwCTPk2IdSCOf9p897_Pad7g3tRseUWvnbaFZGzYaWN5zHtjgMJBZYKH8imrAebve3Jq1XcNtgKuqc6dG03nBaDuc1uMtt0J1yVHWaDKcRvy45e36UIGfi8VrdYterPtSrjPm9Te7bR6c_Ih-IUiagB9vnYagdq_RksGZtjyEekCBzpDDTXhb-OsOM47BFoR1gJwBG5j5j0CgOuB0bWLv3TtG653S-2g321eJLLabaZzUcR9qqU2z9yqKsbFxofhJhoqnztJTSLQtqrSP6_p-5p0oI9BRf_A9RRkxP4mUJ3XQuRMQHpqcPtaI3wqvmIwS3rYvIqneKRKVSlCM4nDz5LOyiHfZWLOX_3rDpiF9CVHxccuiMAwtFWb0SbHNK2sDaYXUNuSVXl7M4cl7nVY1iO54dXqfqoi1tYonmhnA9ypNaROZshlsjSsWM5Dx1HLv8QnTVE33qLw9BIUZPcqKb0iawEAit7RC3QPbIBBrNPU3Jt_NU-hG109SuXZSHkO2a8YgiejIYIqccjmYMoDMTsfcGDbdvgYUZWd6xTVTf5Ys5cwGuBgjtEiLrflBDCMKfllKqoXk0mCUtHpDbyP5ZnCgDawWsW6OUdyvVnrEj6sqzU2fCSDfPQbxpX6SJs920nF8rGiqUQMo1NJ_0bfXu8qAJxy4LApVALnhF1qT1Q5eqIgd07J_3cg5A5uo0meeVqBtLfA8V5siAZZESmVZpcpNba0tFz91x1EmfS7GnLxJbwlfXU6EK6YyMBNwkkjthhczhdBLJjXWr817YKWrALrdJzByEG7Yd3x0q_pv5DxGg8SbBIqcSVS5OzGvtDbwkRymJbWbkWmHhNPBWeMKuKyTjLJuZFIl_Dm3k5REp94l04LZaC8zZKWMA"


const config = {
  channelAccessToken: '7mCyNNfwYQDQPjKxLM00o7mq4rzBQQzBIT1olD81lnlYmE3TAxEJuL276xRULHteXL2hhFxHiXge8UTqv3D4qlIPXc5ul2ALHTHBqKlfzB+nbXEm+NSb8SPEy9o330S6BEpM1OtkqpN+3iQGY9mNQwdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'caf273520816589d0875baf05e36f92e'
};
const client = new Client(config);
const app = express()
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static('public'));
let messages = [];


app.post('/webhook', middleware(config), validateLineSignature, (req, res) => {
  const str = JSON.stringify(req.body)
  Promise
    .all(req.body.events.map(handleEvent))
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
  let files = fs.readdirSync('./public/img')
  for (let e of randomize(files)) {
    data.slides.push({ src: `/img/${e}`, effect: `${e.includes('W') ? 'widthImg' : 'hightImg'}` })
  }
  res.render('index', data);
});
let files = fs.readdirSync(path.join(__dirname, 'public','img' ))
console.log(files)

app.get('/api/photos', (req, res) => {
  console.log(req.protocol)
  const photos =[]
  let files = fs.readdirSync(path.join(__dirname, 'public','img' ))
  files.forEach((e,i)=>{
    photos.push({ id: i, url: `https://${req.hostname}/img/${e}` })
  })
  res.json(photos);
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
  if (!signature || !validateSignature(str, config.channelSecret, signature)) {
    console.error('Signature validation failed');
    return res.status(403).send('Forbidden');
  }
  next()
}
function handleEvent(event) {

  if (event.type === 'message') {
    handleMessage(event)
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
      originalContentUrl: invitationUrl,
      previewImageUrl: invitationUrl
    });
  }
  return Promise.resolve(null);
}
function handleMessage(event) {
  if (event.message.text == '謝謝誇獎!') return
  const userId = event.source.userId;
  const message = event.message.text;
  messages.push({ userId, message });
  broadcastMessage({ userId, message });
  const reply = { type: 'text', text: userId + '收到!' };
  return client.replyMessage(event.replyToken, reply);
}
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}