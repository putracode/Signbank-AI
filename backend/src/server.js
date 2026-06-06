import 'dotenv/config';
import http from 'http';
import app from './server/index.js';

const port = process.env.PORT || 3000;

const server = http.createServer({ maxHeaderSize: 32768 }, app);

server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});