import amqp from 'amqplib/callback_api';
import { ExchangeType } from './ExchangeType';
import logExchange from './exchange';
import { LogType } from './LogType';

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertExchange(logExchange, ExchangeType.direct, {
            durable: false,
        });

        channel.assertQueue(
            '',
            {
                exclusive: true,
            },
            function (error2, q) {
                if (error2) {
                    throw error2;
                }
                console.log(
                    ' [*] Waiting for messages in %s. To exit press CTRL+C',
                    q.queue
                );
                // [*] read bellow
                // channel.bindQueue(q.queue, exchange, '');
                channel.bindQueue(q.queue, logExchange, LogType.info);

                channel.consume(
                    q.queue,
                    function (msg) {
                        if (msg!.content) {
                            console.log(
                                ' [x][Sent to ELK stack] %s',
                                msg!.content.toString()
                            );
                        }
                    },
                    {
                        noAck: true,
                    }
                );
            }
        );
    });
});

// better to take a look at the off tutorials
// [*] https://www.rabbitmq.com/tutorials/tutorial-four-javascript.html
