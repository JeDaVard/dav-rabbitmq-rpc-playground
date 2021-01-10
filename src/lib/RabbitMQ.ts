import { Channel, Connection, Options } from 'amqplib/callback_api';
import { ExchangeType } from './ExchangeType';

interface Event {
    exchange: string;
    data: any;
}

export abstract class RabbitMQ<T extends Event> {
    abstract exchange: T['exchange'] = '';
    protected queueName = '';

    protected constructor(
        protected connection: Connection,
        protected exchangeType?: ExchangeType
    ) {}

    protected channel: Channel | undefined;

    createChannel(): Promise<this> {
        return new Promise((resolve, reject) => {
            this.connection.createChannel((error, channel) => {
                if (error) reject(error);
                this.channel = channel;
                resolve(this);
            });
        });
    }

    assertExchange(
        exchangeOptions?: Options.AssertExchange,
        callback?: () => void
    ): Promise<this> {
        return new Promise((resolve, reject) => {
            if (!this.channel) {
                reject(
                    '[ERROR] There is no channel, please create before this action.'
                );
                return;
            }
            this.channel.assertExchange(
                this.exchange,
                this.exchangeType || 'fanout',
                exchangeOptions,
                (err, assertExchange) => {
                    if (err) return reject(err);
                    this.exchange = assertExchange.exchange;
                    if (callback) callback();
                    resolve(this);
                }
            );
        });
    }
    assertQueue(
        queueName = '',
        queueOptions?: Options.AssertQueue
    ): Promise<this> {
        return new Promise<this>((resolve, reject) => {
            if (!this.channel) {
                reject(
                    "[ERROR] Listener doesn't have a channel. You must create it first using createChannel async method."
                );
                return;
            }
            this.channel.assertQueue(
                queueName,
                queueOptions,
                (err, assertQueue) => {
                    if (err) reject();
                    this.queueName = assertQueue.queue;
                    resolve(this);
                }
            );
        });
    }
}
