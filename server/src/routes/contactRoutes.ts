import express from "express"
import { protect } from "../middleware/userMiddleware"
import { searchContact } from "../controller/contactController";



const router = express.Router();


router.get('/search-contacts', protect, searchContact)


export default router;