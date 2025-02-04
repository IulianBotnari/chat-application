const express = require('express');
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors');
const app = express();
const httpServer = createServer(app)

const dotenv = require('dotenv');
dotenv.config();
const host = process.env.HOST
const port = process.env.PORT
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const expressSession = require('express-session')
const connectdb = require('./db/DbConnection')
const router = require("./Router/Router");
const secret_key = process.env.SECRET_KEY


app.use(express.json())
app.use(cors())

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const [rows] = await connectdb.query('SELECT * FROM users WHERE username = ?', [username])


            const user = rows[0]
            if (!user) return done(null, false, { message: 'User not found' })


            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return done(null, false, { message: 'Wrong password' })

            return done(null, user)

        } catch (err) {
            return done(err)
        }
    }))




passport.serializeUser((user, done) => done(null, user.id))


passport.deserializeUser((id, done) => {
    connectdb.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) throw err

        done(null, result[0])
    })
})

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) return res.status(403).json({ message: 'Access denied, no token provided' })

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })

        req.user = decoded
        next()
    })
}

app.post('/register', async (req, res) => {
    const { name, surname, username, password, email, profile_pic } = req.body;
    try {
        const [existingUsers] = await connectdb.query('SELECT * FROM users WHERE username = ?', [username]) || [[]];
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username già esistente' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await connectdb.query(
            'INSERT INTO users (name, surname, username, password, email, profile_pic) VALUES (?,?,?,?,?,?)',
            [name, surname, username, hashedPassword, email, profile_pic]
        );

        res.json({ message: 'User successfully inserted' });
    } catch (err) {
        console.error("Errore di registrazione:", err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});


app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {

    const token = jwt.sign({ userId: req.user.id }, secret_key, { expiresIn: '3h' })
    res.json({ token })
})

app.use("/", router)

app.get('/messages', async (req, res) => {
    try {
        console.log("📡 Richiesta ricevuta: GET /messages"); // Log della richiesta
        const [messages] = await connectdb.query("SELECT * FROM messages ORDER BY timestamp ASC");
        console.log("Messaggi recuperati con successo:", messages); // Log dei messaggi
        res.json(messages);
        console.log(messages);

    } catch (err) {
        console.error("Errore durante il recupero dei messaggi:", err); // Log dell'errore
        res.status(500).json({ error: err.message });
    }
});


// Socket.IO per la comunicazione in tempo reale
io.on('connection', (socket) => {
    console.log('Un utente si è connesso');

    socket.on('chat message', async (data) => {
        const { username, message } = data;

        try {
            await connectdb.query("INSERT INTO messages (username, message) VALUES (?, ?)", [username, message]);
            io.emit('chat message', { username, message, timestamp: new Date() });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utente si è disconnesso');
    });
});

httpServer.listen(port, () => {
    console.log(`Server running at ${host}:${port}`)
})