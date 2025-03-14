const express = require("express")


const router = express.Router()

const userController = require("../Contreollers/userController.js")
const messageController = require("../Contreollers/messageController.js")
const fileUpload = require("../Contreollers/uploadFile.js")


router.get("/users", userController.getUser)
router.get("/chatlist", userController.getChatList)
router.get("/createchat", userController.createChat)
// router.post("/post-file", fileUpload.getFile)

router.delete("/deletemessage", messageController.deleteMessage)




module.exports = router
