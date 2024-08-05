const invitationUrl = process.env?.invitationUrl
const donateUrl = process.env?.donateUrl
const lineConfig = {
  channelAccessToken: process.env?.channelAccessToken,
  channelSecret: process.env?.channelSecret
};
module.exports={
  invitationUrl, lineConfig, donateUrl
}