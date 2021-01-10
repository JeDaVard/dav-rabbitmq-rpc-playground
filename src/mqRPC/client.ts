import amqp from 'amqplib/callback_api';

const args = process.argv.slice(2);

if (args.length == 0) {
    console.log('Usage: client.js num');
    process.exit(1);
}

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        channel.assertQueue(
            '',
            {
                exclusive: true,
            },
            function (error2, q) {
                if (error2) {
                    throw error2;
                }
                const correlationId = generateUuid();
                const num = parseInt(args[0]);

                console.log(
                    ' [x] Requesting fib(%d)  - correlationId: %d',
                    num,
                    correlationId
                );

                channel.consume(
                    q.queue,
                    function (msg) {
                        if (msg!.properties.correlationId == correlationId) {
                            console.log(
                                ' [.] Got %s  - correlationId: %d',
                                msg!.content.toString(),
                                correlationId
                            );
                            setTimeout(function () {
                                connection.close();
                                process.exit(0);
                            }, 500);
                        }
                    },
                    {
                        noAck: true,
                    }
                );

                channel.sendToQueue('', Buffer.from(num.toString()), {
                    correlationId: correlationId,
                    replyTo: q.queue,
                });
            }
        );
    });
});

function generateUuid(): string {
    return `${Math.round(Math.random() * 1000)}`;
}
