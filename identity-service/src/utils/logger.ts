import winston from "winston";
import { _envConfig } from "./config";
import dotenv from 'dotenv'

dotenv.config();

console.log("enc Data", _envConfig)

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'Identity Service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'error.log', level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]
});
