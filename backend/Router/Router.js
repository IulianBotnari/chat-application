const express = require("express")

const router = express.Router()

const userController = require("../Contreollers/userController.js")


router.get("/users", userController.getUser)
router.get("/chatlist", userController.getChatList)



module.exports = router
