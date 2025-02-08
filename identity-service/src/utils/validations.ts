import Joi from "joi";
import { IUser } from "../types/ModelInterface";

export const validateRegistration = (data: IUser) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
}

export const validateLogin = (data: IUser) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
}
