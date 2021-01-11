const amqp = require('amqplib');

(async function () {
    const queue = 'some_queue';
    const options = {} || {
        durable: false,
    };

    const connection = await amqp.connect('amqp://localhost');

    const channel = await connection.createChannel();

    await channel.assertExchange('some_exchange', 'topic', options);
    await channel.prefetch(1);

    const q = await channel.assertQueue(queue, {
        durable: false,
    });

    await channel.bindQueue(q.queue, 'some_exchange', `*`, undefined);

    await channel.consume(
        q.queue,
        (msg) => {
            const time = msg.content.toString().split('.').length - 1;
            if (time > 0) console.log('[ ] %s | wait %ds', queue, time);
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

    const gracefulSh = () => {
        connection.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
})();
