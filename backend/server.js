const express = require('express');
const cors = require('cors');
const server = express();
const dotenv = require('dotenv');
const host = process.env.HOST
const port = process.env.PORT
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const expressSession = require('express-session')
const connectdb = require('./db/DbConnection')
const router = require("./Router/Router")
server.use(express.json())
server.use(cors())
dotenv.config();

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            connectdb.query('SELECT * FROM users WHERE username = =', [username], async (err, result) => {
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
    const { name, surname, username, password, email } = req.body
    try {
        connectdb.query('SELECT * FORM users WHERE username = ?', [username], (err, result) => {
            if (err) throw err
            if (result.length > 0) return res.status(400).json({ message: 'Username già esistente' })
        })

        const hashedPassword = await bcrypt.hash(password, 10)

        connectdb.query('INSERT INTO users (name, surname, username, password, email) VALUES (?,?,?,?,?)', [name, surname, username, password, email], (err, result) => {
            if (err) {
                throw err

            } else {
                res.json({ message: 'User successifully inserted' })
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