import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';

const app = express();
dotenv.config();

