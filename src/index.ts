import { mqClient } from './lib/mq-client';
import { SomePublisher } from './pub';

(async function () {
    await mqClient.connect('amqp://localhost');
    const publisher = await (
        await new SomePublisher(mqClient.connection).createChannel()
    ).assertExchange();

    try {
        setInterval(() => {
            publisher.publish('Some text');
        }, 1000);
    } catch (e) {
        console.log(e);
    }
})();
