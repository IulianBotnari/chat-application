const express = require('express');
// const { createServer } = require('node:http')
const Server = require('socket.io')
const cors = require('cors');
const server = express();
const io = new Server(server)
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
const router = require("./Router/Router")
const secret_key = process.env.SECRET_KEY


server.use(express.json())
server.use(cors())

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            connectdb.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
                if (err) throw err

                const user = result[0]
                if (!user) return done(null, false, { message: 'User not found' })


                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) return done(null, false, { message: 'Wrong password' })

                return done(null, user)

            })
        } catch (err) {
            return done(err)
        }
    }
))


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

server.post('/register', async (req, res) => {
    const { name, surname, username, password, email, profile_pic } = req.body
    try {
        connectdb.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
            if (err) throw err
            if (result.length > 0) return res.status(400).json({ message: 'Username già esistente' })
        })

        const hashedPassword = await bcrypt.hash(password, 10)

        connectdb.query('INSERT INTO users (name, surname, username, password, email, profile_pic) VALUES (?,?,?,?,?,?)', [name, surname, username, hashedPassword, email, profile_pic], (err, result) => {
            if (err) {
                throw err

            } else {

                console.log(res.json({ message: 'User successifully inserted' }))
            }

        })

    } catch (err) {
        res.status(500).json({ message: 'Registration failed' })
    }
})


server.post('/login', passport.authenticate('local', { session: false }), (req, res) => {

    const token = jwt.sign({ userId: req.user.id }, secret_key, { expiresIn: '3h' })
    res.json({ token })
})

server.use("/", router)


server.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`)
})