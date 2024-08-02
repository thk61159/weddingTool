const invitationUrl = process.env?.invitationUrl
const lineConfig = {
  channelAccessToken: process.env?.channelAccessToken,
  channelSecret: process.env?.channelSecret
};

module.exports={
  invitationUrl, lineConfig
}