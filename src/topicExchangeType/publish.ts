import amqp from 'amqplib/callback_api';
import { ExchangeType } from './ExchangeType';
import { LogType, LogSourceType } from './LogType';
import logExchange from './exchange';

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        const argv = process.argv.slice(2).join(' ');
        const msg =
            `[correlationId:${Math.round(Math.random() * 100)}] ` +
            (argv || 'Hello World!');
        const logType = argv.includes('err') ? LogType.critical : LogType.info;
        const logSourceType = argv.includes('order')
            ? LogSourceType.orderService
            : LogSourceType.userService;
        const routeKey = `${logSourceType}.${logType}`;

        channel.assertExchange(logExchange, ExchangeType.topic, {
            durable: false,
        });

        channel.publish(logExchange, routeKey, Buffer.from(msg));

        // channel.publish(exchange, '', Buffer.from(msg), {
        //     persistent: true,
        // });
        console.log(" [x] Sent '%s'", msg);
    });

    const gracefulSh = () => {
        connection.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
});
