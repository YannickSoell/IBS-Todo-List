const fcgi = require('node-fastcgi');
const express = require('express');
const app = express();



app.get('/node.js', (req, res) => {
    res.send('Hello World'); 
});



// create Server
const port = 9998;
fcgi.createServer(app).listen(port, () => console.log(`listening on Port ${port}...`)); 