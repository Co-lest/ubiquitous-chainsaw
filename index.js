import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { WebSocketServer } from "ws";

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
    if (req.method === "GET") {
        let filePath;
        if (req.url === '/') {
            filePath = '/index.html';
        } else {
            filePath = req.url;
        }
        const fullPath = path.join(__dirname, 'public', filePath);

        try {
            const content = await fs.readFile(fullPath);
            const ext = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'text/javascript'
            }[ext] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }catch (err) {
            res.statusCode = 404;
            console.error(`Error getting the html file`, err)
            return;
        }
    }
});

const wss = new WebSocketServer( { server } )
// let backendUsername;

const client = new Set()

wss.on("connection", (ws) => {
    client.add(ws);

    ws.on("message", (data) => {
        let receivedData = JSON.parse(data);
        console.log(`${receivedData}`);
        console.log(`A new client connected with username: ${receivedData.username}`);
    });

    ws.on("close", (data) => {
        let receivedData = JSON.parse(data)
        console.log(receivedData);
        console.log(`A client with username: ${receivedData.username} disconnected!`);
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
