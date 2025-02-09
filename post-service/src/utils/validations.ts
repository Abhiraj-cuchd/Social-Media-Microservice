import Joi from "joi";
import { IPost } from "../types/ModelInterface";

export const validateCreatePost = (data: IPost) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(5000).required(),
    });
    return schema.validate(data);
}
