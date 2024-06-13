import express from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/userController.js"
import { upload } from "../middlewares/multerMiddleware.js"
import { verfiyJWT } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.route('/register').post(upload.fields([
    { name:'avatar', maxCount:1 },
    { name: "coverImage",maxCount:1}
]),registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verfiyJWT,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
export default router