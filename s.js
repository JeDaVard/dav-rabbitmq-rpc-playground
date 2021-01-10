const amqp = require('amqplib/callback_api');

const queue = 'some_queue';
const options = {} || {
    durable: false,
};

amqp.connect('amqp://localhost', function (error0, connection) {
    connection.createChannel(function (error1, channel) {
        channel.assertExchange('some_exchange', 'topic', options);
        channel.prefetch(1);
        channel.assertQueue(
            queue,
            {
                durable: false,
            },
            (err, q) => {
                channel.bindQueue(
                    q.queue,
                    'some_exchange',
                    `*`,
                    undefined,
                    (err, ok) => {}
                );
                console.log('connection ...');
                channel.consume(
                    q.queue,
                    (msg) => {
                        const time =
                            msg.content.toString().split('.').length - 1;
                        if (time > 0)
                            console.log('[ ] %s | wait %ds', queue, time);
                        setTimeout(() => {
                            console.log(
                                '[v] %s | %s (dur: %ds)',
                                queue,
                                msg.content.toString(),
                                time
                            );
                            channel.ack(msg);
                        }, time * 1000);
                    },
                    {
                        noAck: false,
                    }
                );
            }
        );
    });

    const gracefulSh = () => {
        connection.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
});
