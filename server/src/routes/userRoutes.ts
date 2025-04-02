import express from 'express' 
import multer from 'multer';
import { protect } from '../middleware/userMiddleware';
import { loginUser, getUser, registerUser, updateUser, googleAuth, logoutUser } from '../controller/authController';


const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({ storage, limits:{
    fileSize: 1024 * 1024 * 5,
    
} });

router.post("/", registerUser);
router.post("/google-auth", googleAuth);
router.post("/login", loginUser);
router.patch("/update", protect, upload.single('image'), updateUser);
router.get("/get-user", protect, getUser);
router.post("/logout", protect, logoutUser)


export default router;