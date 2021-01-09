import amqp from 'amqplib/callback_api';
import { ExchangeType } from './ExchangeType';
import { LogType } from './LogType';
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
        const msg = `[${new Date().toString()}] ` + (argv || 'Hello World!');
        channel.assertExchange(logExchange, ExchangeType.direct, {
            durable: false,
        });

        const routeKey = argv.includes('err') ? LogType.critical : LogType.info;
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
