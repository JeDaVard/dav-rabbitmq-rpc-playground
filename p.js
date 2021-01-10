const amqp = require('amqplib/callback_api');

const queue = 'some_queue';
const msg = Buffer.from(
    generateUuid() + ' | ' + (process.argv.slice(2).join('') || 'Hello!')
);
const options = {};

amqp.connect('amqp://localhost', function (error0, connection) {
    connection.createChannel(function (error1, channel) {
        // channel.assertQueue(queue, options, () => {
        //     //
        // });
        channel.assertExchange('some_exchange', 'topic', options);
        channel.publish('some_exchange', 'route_key', Buffer.from(msg));
        console.log('[v] | %s', msg);
    });

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 200);

    const gracefulSh = () => {
        connection.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
});

function generateUuid() {
    return `${Math.round(Math.random() * 1000)}`;
}
