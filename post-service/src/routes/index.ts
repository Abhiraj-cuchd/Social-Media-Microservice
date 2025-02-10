import { Request, RequestHandler, Response, Router } from "express";
import { authenticateRequest } from "../middleware/auth.middleware";
import { createPost, deletePost, getAllPosts, getPost } from "../controllers/post.controller";

const router = Router();
router.use(authenticateRequest as RequestHandler)

router.post('/create-post', (req: Request, res: Response) => {
    createPost(req, res);
});

router.get('/', (req: Request, res: Response) => {
    getAllPosts(req, res);
});

router.get('/single-post/:id', (req: Request, res: Response) => {
    getPost(req, res);
});

router.delete('/single-post/:postId', (req: Request, res: Response) => {
    deletePost(req, res);
});

module.exports = router
