# 婚禮互動應用程式 (後端) / Wedding Interaction Application (Backend)

## 簡介 / Introduction

這是一個婚禮互動的應用程式後端。使用此應用程式，您可以透過 Line Bot 傳送祝福的訊息。

This is the backend of a wedding interaction application. With this application, you can send congratulatory messages through Line Bot.

## 功能 / Features

- 使用 Line Bot 傳送祝福語言。
- 支援 HTTPS 和 IP 來接收 Line Bot 的 Webhook 訊息。
- 部署於 Render.com。
- 使用 websocket 交換訊息。
- 支援 localhost 接收和控制 Line Bot 的回傳訊息。

- Send congratulatory messages via Line Bot.
- Support for HTTPS and IP to receive webhook messages from Line Bot.
- Deployed on Render.com.
- Use websocket for message passing.
- Support for localhost to receive and control Line Bot responses via publish/subscribe.

## 系統需求 / System Requirements

- Node.js
- Line Developer Account
- Render.com Account


## 安裝 / Installation

1. 克隆此專案 / Clone this repository:

    ```bash
    git clone https://github.com/yourusername/wedding-interaction-backend.git
    cd wedding-interaction-backend
    ```

2. 安裝相依套件 / Install dependencies:

    ```bash
    npm install
    ```

3. 設定環境變數 / Set up environment variables:

    創建一個 `.env` 文件，並新增以下內容：
    
    Create a `.env` file and add the following content:

    ```
    LINE_CHANNEL_SECRET=your_line_channel_secret
    LINE_ACCESS_TOKEN=your_line_access_token
    MQTT_BROKER_URL=your_mqtt_broker_url
    ```

4. 啟動應用程式 / Start the application:

    ```bash
    npm start
    ```

## 部署 / Deployment

此後端應用程式將部署於 Render.com。以下是部署步驟：

1. 在 Render.com 上創建一個新的 Web Service。

2. 連接你的 GitHub 儲存庫。

3. 設定環境變數，如上所述。

4. 部署應用程式。

This backend application will be deployed on Render.com. Follow these steps for deployment:

1. Create a new Web Service on Render.com.

2. Connect your GitHub repository.

3. Set the environment variables as described above.

4. Deploy the application.

## 使用方式 / Usage

1. 設定 Line Bot 並啟用 Webhook。

2. 在 Line Developer Console 中設定 Webhook URL 為 `https://yourappname.onrender.com/webhook`。

3. 開始透過 Line Bot 傳送和接收訊息。

1. Set up the Line Bot and enable the webhook.

2. Configure the Webhook URL in the Line Developer Console to `https://yourappname.onrender.com/webhook`.

3. Start sending and receiving messages via the Line Bot.
