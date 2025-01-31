const express = require('express');
const cors = require('cors');
const server = express();
const dotenv = require('dotenv');
server.use(express.json())
server.use(cors())
dotenv.config();
const host = process.env.HOST
const port = process.env.PORT


server.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`)
})