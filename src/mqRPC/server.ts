import amqp from 'amqplib/callback_api';

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = '';

        channel.assertQueue(queue, {
            durable: false,
        });
        channel.prefetch(1);

        console.log(' [.] Awaiting RPC requests');
        channel.consume(queue, function reply(msg) {
            const n = parseInt(msg!.content.toString());
            const correlationId = msg!.properties.correlationId;

            console.log(
                ' [.] computing fib(%d) - correlationId: %d...',
                n,
                correlationId
            );

            const r = fib(n);
            console.log(
                ' [.] fib result == (%d), ready to send - correlationId: %d...',
                r,
                correlationId
            );

            channel.sendToQueue(
                msg!.properties.replyTo,
                Buffer.from(r.toString()),
                {
                    correlationId,
                }
            );

            console.log(
                ' [v] Done with RPC request - correlationId: %d',
                correlationId
            );
            channel.ack(msg!);
        });
    });
});

function fib(n: number): number {
    return n < 2 ? n : fib(n - 2) + fib(n - 1);
}

/*
Our code is still pretty simplistic and doesn't try to solve more complex (but important) problems, like:

How should the client react if there are no servers running?
Should a client have some kind of timeout for the RPC?
If the server malfunctions and raises an exception, should it be forwarded to the client?
Protecting against invalid incoming messages (eg checking bounds, type) before processing.
*/
