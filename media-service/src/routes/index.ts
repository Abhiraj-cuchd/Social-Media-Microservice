import { Request, Response, Router } from "express";
import { upload } from "../middleware/fileHandler";
import { handleUploadMedia } from "../controllers/media.controller";

const router = Router();

router.post('/create-media', upload.array('files', 10), (req: Request, res: Response) => {
    handleUploadMedia(req, res);
});

module.exports = router
