const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  const target = "https://www.tiktok.com";

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: "", // Critical: allows cookies to work on your Vercel URL
    
    onProxyReq: (proxyReq, req, res) => {
      // 1. Mimic a real modern browser
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
      proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
      proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
      proxyReq.setHeader('Sec-Fetch-Dest', 'document');
      proxyReq.setHeader('Sec-Fetch-Mode', 'navigate');
      proxyReq.setHeader('Sec-Fetch-Site', 'none');
      proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    },

    onProxyRes: (proxyRes) => {
      // 2. Strip security headers that block the site from loading in your proxy
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['permissions-policy'];
      
      // 3. Fix the "Set-Cookie" headers so TikTok doesn't reject your browser
      if (proxyRes.headers['set-cookie']) {
        proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
          cookie.replace(/Domain=[^;]+;?/, '')
        );
      }
    }
  });

  return proxy(req, res);
};
