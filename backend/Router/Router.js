const express = require("express")

const router = express.Router()


const userController = require("../Contreollers/userController.js")
const messageController = require("../Contreollers/messageController.js")


router.get("/users", userController.getUser)
router.get("/chatlist", userController.getChatList)
router.get("/createchat", userController.createChat)

router.delete("/deletemessage", messageController.deleteMessage)




module.exports = router
