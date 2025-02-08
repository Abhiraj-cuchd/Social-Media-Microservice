import { NextFunction, Request, Response, Router } from "express";
import { loginUser, logoutUser, refreshTokenController, registerUser } from "../controllers/identity.controller";

const router = Router();

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
    registerUser(req, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    loginUser(req, res, next);
});

router.post('/refreshToken', (req: Request, res: Response, next: NextFunction) => {
    refreshTokenController(req, res, next);
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    logoutUser(req, res, next);
});

module.exports = router
