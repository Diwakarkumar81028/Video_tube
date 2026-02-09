import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {refreshAccessToken} from "../controllers/user.controller.js"
const router=Router()

//1.register route
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)//registerUser method call hoga

//2.login
router.route("/login").post(loginUser) 

//3. loggout
router.route("/logout").post(verifyJWT,logoutUser)

//4.generate new accessn and refresh token
router.route("/refresh-token").post(refreshAccessToken)
export default router;