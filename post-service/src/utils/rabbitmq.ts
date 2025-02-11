import amqp from 'amqplib';
import { logger } from './logger';
import { _envConfig } from './config';

let connection = null;
let channel: any = null;

const exchange_name = 'pinsta_events';

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(_envConfig.rabbitmq_url!);
        channel = await connection.createChannel();
        await channel.assertExchange(exchange_name, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ');
        return channel
    } catch (error) {
        logger.error("Error Connecting to RabbitMQ", error)
    }
}

export const publishEvent = async (routingKey: string, message: any) => {
    if (!channel) {
        await connectRabbitMQ();

        channel.publish(exchange_name, routingKey, Buffer.from(JSON.stringify(message)));

        logger.info(`Event Published: ${routingKey}`)
    }
}
