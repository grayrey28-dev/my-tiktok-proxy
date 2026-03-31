const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  // The target site
  const target = "https://www.tiktok.com";

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: true, // Required for TikTok's SSL
    
    // This helps manage cookies so you don't get logged out or blocked
    cookieDomainRewrite: "", 
    
    onProxyReq: (proxyReq, req, res) => {
      // 1. Pretend to be a real Chrome browser on Windows
      proxyReq.setHeader(
        'User-Agent', 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      );
      
      // 2. Clear Referer to prevent TikTok from seeing the Vercel URL
      proxyReq.setHeader('Referer', 'https://www.tiktok.com/');
    },

    onProxyRes: (proxyRes) => {
      // 3. Strip security headers that block "mirroring" or "iframing"
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['permissions-policy'];
      
      // 4. Ensure cookies are handled correctly for the proxy domain
      if (proxyRes.headers['set-cookie']) {
        proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
          cookie.replace(/Domain=[^;]+;?/, '')
        );
      }
    }
  });

  return proxy(req, res);
};
