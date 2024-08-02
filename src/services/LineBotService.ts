
import { Client, middleware, validateSignature, MessageEvent, TextMessage, PostbackEvent, webhook } from '@line/bot-sdk';
import WebSocketService from './WebSocketService'
interface IBotConfig {
  channelAccessToken: string,
  channelSecret: string
}

class LineBotService {
  private wss: WebSocketService;
  public messages: any[] = [];
  private client: Client;
  constructor(private config: IBotConfig) {
    this.client = new Client(config);
    this.wss = WebSocketService.getInstance();
  }
  private handlePostback(event: PostbackEvent): Promise<any> {
    const data = event.postback.data;

    if (data.startsWith('action=send_invitation') && event.replyToken) {
      return this.client.replyMessage(event.replyToken, {
        type: 'image',
        originalContentUrl: 'invitationUrl',
        previewImageUrl: 'invitationUrl'
      });
    }
    return Promise.resolve(null);
  }
  private handleMessage(event: MessageEvent): Promise<any> {
    const userId = event.source.userId;
    const message = event.message as TextMessage
    const text = message.text;
    if (text !== '謝謝誇獎!') return Promise.resolve(null);

    this.messages.push({ userId, message });
    this.wss.broadcastMessage({ userId, message });
    const reply = { type: 'text', text: userId + '收到!' } as any;
    return this.client.replyMessage(event.replyToken, reply);
  }

  public handleEvent(event: webhook.Event): Promise<any> {
    if (event.type === 'message') {
      return this.handleMessage(event as MessageEvent)
    } else if (event.type === 'postback') {
      return this.handlePostback(event as PostbackEvent);
    } else {
      return Promise.resolve(null);
    }
  }


}