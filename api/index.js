const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  // Replace the URL below with the site you want to unblock
  const target = "https://www.slither.io"; 

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }, // Cleans the URL path
    onProxyRes: (proxyRes) => {
      // Deletes security headers that prevent "framing" or "mirroring"
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];
    }
  });

  return proxy(req, res);
};
