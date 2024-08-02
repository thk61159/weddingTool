document.addEventListener('DOMContentLoaded', () => {
  const danmakuContainer = document.getElementById('danmaku-container');
  const ws = new WebSocket(`wss:${document.URL.split(':')[1]}`);
  ws.addEventListener('open', () => {
   console.log('ws conn')
  })
  ws.onmessage = (event) => {
    const {displayName, message} = JSON.parse(event.data);
    console.log(event.data)
    createDanmaku({displayName, message})

  };

  function createDanmaku({ userId, message }) {
    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku';
    danmaku.style.top = `${Math.random() * 100}%`;
    danmaku.style.right = `100%`;
    danmaku.textContent = `${displayName}: ${message}`;
    console.log(danmaku)
    danmakuContainer.appendChild(danmaku);

    // Remove danmaku after animation
    danmaku.addEventListener('animationend', () => {
      danmakuContainer.removeChild(danmaku);
    });
  }
});
