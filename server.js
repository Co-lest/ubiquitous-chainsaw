import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { WebSocketServer } from "ws";

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
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
            res.end("File not found!");
            console.error(`Error getting the html file`, err)
        }
    }
});

const wss = new WebSocketServer( { server } )
// let backendUsername;

const clients = new Set()

wss.on("connection", (ws) => {
    clients.add(ws);
    
    //console.log(`A new client connected with username: ${receivedData.personUsing}`);
    // TODO when a client connects send a message

    ws.on("message", (data) => {
        let receivedData = JSON.parse(data);
        console.log(receivedData); // {typeObj:"join", personUsing:"Mark", messagePassed:""}

        clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                    typeObj: receivedData.typeObj,
                    username: receivedData.personUsing,
                    messagePassed: receivedData.messagePassed
            }));
            }
        });
    });

    // ws.on("close", (data) => {
    //     let receivedData = JSON.parse(data);
    //     console.log(data);
    //     console.log(`A client with username: ${receivedData.personUsing} disconnected!`);
    //     //todo send a message that one is disconnected
    // });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
