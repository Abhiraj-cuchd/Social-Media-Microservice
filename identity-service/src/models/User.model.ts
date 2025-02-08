import mongoose from 'mongoose';
import argon2 from 'argon2';
import { IUser } from '../types/ModelInterface';

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true });

userSchema.pre('save', async function (next): Promise<boolean | any> {
    if (this.isModified('password')) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (error) {
            return next(error as any)
        }
    }
});


userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw error;
    }
};

userSchema.index({ username: 'text' });

export const UserModel = mongoose.model<IUser>('User', userSchema);


