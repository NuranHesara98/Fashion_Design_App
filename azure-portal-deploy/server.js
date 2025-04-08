// Ultra-minimal server for Azure Portal deployment
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  const responseData = {
    status: 'online',
    message: 'DressMe Fashion Design API is running',
    timestamp: new Date().toISOString(),
    path: req.url
  };
  
  res.end(JSON.stringify(responseData, null, 2));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
