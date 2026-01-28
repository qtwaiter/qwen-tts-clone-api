const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const PORT = process.env.PORT || 3001;

console.log('[Proxy] Starting WebSocket Proxy Server...');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Qwen TTS WebSocket Proxy Server\n');
});

const wss = new WebSocket.Server({ server, path: '/proxy' });

wss.on('connection', (ws, req) => {
  console.log('[Proxy] New connection from', req.socket.remoteAddress);

  const query = url.parse(req.url, true).query;
  const targetUrl = query.url;
  const model = query.model || 'qwen3-tts-vc-realtime-2026-01-15';
  const apiKey = query.api_key;

  console.log('[Proxy] Query params:', { 
    hasUrl: !!targetUrl, 
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    model 
  });

  if (!targetUrl) {
    console.error('[Proxy] Missing target URL');
    ws.send(JSON.stringify({
      type: 'error',
      error: { message: 'Missing url parameter' }
    }));
    ws.close();
    return;
  }

  if (!apiKey) {
    console.error('[Proxy] Missing API Key');
    ws.send(JSON.stringify({
      type: 'error',
      error: { message: 'Missing api_key parameter' }
    }));
    ws.close();
    return;
  }

  const fullTargetUrl = `${targetUrl}?model=${model}`;
  console.log('[Proxy] Connecting to target:', fullTargetUrl);

  // 创建目标 WebSocket 连接
  const targetWs = new WebSocket(fullTargetUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'QwenTTSProxy/1.0'
    }
  });

  let targetConnected = false;
  let messageBuffer = [];

  targetWs.on('open', () => {
    console.log('[Proxy] Target WebSocket connected');
    targetConnected = true;
    
    // 发送缓冲的消息
    if (messageBuffer.length > 0) {
      console.log(`[Proxy] Sending ${messageBuffer.length} buffered messages`);
      messageBuffer.forEach(msg => {
        console.log('[Proxy] Buffered -> Target:', msg.type || 'raw');
        targetWs.send(msg);
      });
      messageBuffer = [];
    }
  });

  // 转发客户端消息到目标服务器
  ws.on('message', (message) => {
    let messageStr = message.toString();
    
    try {
      const data = JSON.parse(messageStr);
      console.log('[Proxy] Client -> Target:', data.type || 'raw');
      console.log('[Proxy] Message preview:', JSON.stringify(data).substring(0, 200));
    } catch (e) {
      console.log('[Proxy] Client -> Target: raw message');
    }

    if (!targetConnected) {
      console.log('[Proxy] Target not ready, buffering message');
      messageBuffer.push(messageStr);
      return;
    }

    try {
      targetWs.send(messageStr);
    } catch (e) {
      console.error('[Proxy] Failed to send to target:', e.message);
    }
  });

  // 转发目标服务器消息到客户端
  targetWs.on('message', (message) => {
    let messageStr = message.toString();
    
    try {
      const data = JSON.parse(messageStr);
      console.log('[Proxy] Target -> Client:', data.type || 'raw');
      if (data.type !== 'response.audio.delta') {
        console.log('[Proxy] Message:', JSON.stringify(data).substring(0, 300));
      } else {
        console.log('[Proxy] Audio delta, size:', data.delta ? data.delta.length : 0);
      }
    } catch (e) {
      console.log('[Proxy] Target -> Client: raw message, length:', messageStr.length);
    }
    
    ws.send(messageStr);
  });

  targetWs.on('error', (error) => {
    console.error('[Proxy] Target WebSocket error:', error.message);
    console.error('[Proxy] Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
      stack: error.stack
    });
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        error: { 
          message: `Target connection error: ${error.message}`,
          code: error.code
        }
      }));
    }
    
    // 延迟关闭，确保错误消息发送
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, 100);
  });

  targetWs.on('close', (code, reason) => {
    console.log('[Proxy] Target WebSocket closed:', { 
      code, 
      reason: reason.toString() 
    });
    ws.close(code, reason);
  });

  ws.on('close', (code, reason) => {
    console.log('[Proxy] Client WebSocket closed:', { 
      code, 
      reason: reason.toString() 
    });
    if (targetWs.readyState === WebSocket.OPEN) {
      targetWs.close();
    }
  });

  ws.on('error', (error) => {
    console.error('[Proxy] Client WebSocket error:', error.message);
    if (targetWs.readyState === WebSocket.OPEN) {
      targetWs.close();
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Proxy] Server running on http://127.0.0.1:${PORT}`);
  console.log(`[Proxy] WebSocket endpoint: ws://127.0.0.1:${PORT}/proxy`);
  console.log(`[Proxy] Usage: ws://127.0.0.1:${PORT}/proxy?url=<target_url>&api_key=<api_key>&model=<model>`);
  console.log('[Proxy] Ready for connections...');
});
