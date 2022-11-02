const bodyParser = require('body-parser');
require('dotenv').config();
const urlencodedParser = bodyParser.json();
const PORT = process.env.PORT || 5001 //指定 port
let clientObj = {};
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.post('/send', urlencodedParser, function(req,res){
  console.log(req.body);
  if(clientObj[req.body.client]) {
    clientObj[req.body.client].send(req.body.content);
    res.json({
      status:true
    })
  } else {
    res.json({
      status:false
    })
  }
})

const sio = require("socket.io")(server, {
    handlePreflightRequest: (req, res) => {
      
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

sio.on('connection',( ws )=> {
    if(ws['handshake'].query) {
      let id = ws['handshake'].query.id
      console.log(id,'Client connected');
      clientObj[id] = ws;
      // console.log(clientObj)
    }
    
  // 當收到client消息時
  ws.on('message', data => {
    // 收回來是 Buffer 格式、需轉成字串
    data = data.toString()  
    console.log(data) // 可在 terminal 看收到的訊息
    /// 發送消息給client 
    ws.send(data)

    /// 發送給所有client： 
    let clients = wss.clients  //取得所有連接中的 client
    clients.forEach(client => {
        client.send(data)  // 發送至每個 client
    })
  })
  // 當連線關閉
  ws.on('close', () => {
    console.log('Close connected')
  })
})



server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})