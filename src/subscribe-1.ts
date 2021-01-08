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

        // This makes sure the queue is declared before attempting to consume from it
        channel.assertQueue(queue, {
            durable: true,
        });

        channel.prefetch(1);

        channel.consume(
            queue,
            function (msg) {
                // @ts-ignore
                const secs = msg.content.toString().split('.').length - 1;

                // @ts-ignore
                console.log(' [x] Received %s', msg.content.toString());
                setTimeout(function () {
                    console.log(' [x] Done');
                    channel.ack(msg!);
                }, secs * 1000);
            },
            {
                // automatic acknowledgment mode,
                // see https://www.rabbitmq.com/confirms.html for details
                noAck: false,
            }
        );
    });
});
