import { Request, RequestHandler, Response, Router } from "express";
import { authenticateRequest } from "../middleware/auth.middleware";
import { createPost, getAllPosts } from "../controllers/post.controller";

const router = Router();
router.use(authenticateRequest as RequestHandler)

router.post('/create-post', (req: Request, res: Response) => {
    createPost(req, res);
});

router.get('/', (req: Request, res: Response) => {
    getAllPosts(req, res);
});

module.exports = router
