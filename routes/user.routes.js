const express = require("express")
const { registerUser, getUserProfile, registerOperator, verifyUser, getUserByOperator, loginUser, loginOperator, updateUser, resolveAccount } = require("../controllers/user.controller")
const { verify } = require("jsonwebtoken")

const router = express.Router()


router.post("/register", registerUser)

router.post("/login", loginUser)

router.post("/operator/login", loginOperator)

router.get("/profile", verifyUser, getUserProfile)

router.post("/registerOperator", registerOperator)

router.get("/users/:userId", verifyUser, getUserByOperator)
router.patch("/user/:id", verifyUser, updateUser)
router.get("/user/:accountNumber", verifyUser, resolveAccount)

module.exports=router