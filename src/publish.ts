import amqp from 'amqplib/callback_api';

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = 'task_queue';
        const msg =
            `[${new Date().toLocaleTimeString()}] ` +
            (process.argv.slice(2).join(' ') || 'Hello World!');

        channel.assertQueue(queue, {
            durable: true,
        });
        channel.publish('logs', Buffer.from(msg), {
            persistent: true,
        });
        console.log(" [x] Sent '%s'", msg);
    });

    const gracefulSh = () => {
        connection.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
});
