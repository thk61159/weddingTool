document.addEventListener('DOMContentLoaded', () => {
  const danmakuContainer = document.getElementById('danmaku-container');
  const ws = new WebSocket('ws://localhost:3000');
  // const ws = new WebSocket('wss://eab2-60-251-200-67.ngrok-free.app');
  ws.addEventListener('open', () => {
   console.log('ws conn')
  })
  ws.onmessage = (event) => {
    const {userId, message} = JSON.parse(event.data);
    console.log(event.data)
    createDanmaku({userId, message})

  };

  function createDanmaku({ userId, message }) {
    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku';
    danmaku.style.top = `${Math.random() * 100}%`;
    danmaku.style.right = `100%`;
    danmaku.textContent = `${userId}: ${message}`;
    console.log(danmaku)
    danmakuContainer.appendChild(danmaku);

    // Remove danmaku after animation
    danmaku.addEventListener('animationend', () => {
      danmakuContainer.removeChild(danmaku);
    });
  }
});
