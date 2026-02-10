import { Router } from "express";
import { loginUser, logoutUser, registerUser,changeUserPassword,getCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {refreshAccessToken,updateAccountDetails,updateUserAvatar,updateUserCoverImage} from "../controllers/user.controller.js"
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

//5.change user password
router.route("/change-user-password").post(verifyJWT,changeUserPassword)

//6.ge tcurrent user
router.route("/get-current-user").get(verifyJWT,getCurrentUser);

//7. update account details
router.route("/update-user-account").post(verifyJWT,updateAccountDetails)

//8.update user avater
router.route("/update-user-avatar").post(upload.fields([{name:"avatar",maxCount:1}]),verifyJWT,updateUserAvatar)

//9.coverImage avatar
router.route("/update-user-coverImage").post(upload.fields([{name:"coverImage",maxCount:1}]),verifyJWT,updateUserCoverImage)
//
export default router;