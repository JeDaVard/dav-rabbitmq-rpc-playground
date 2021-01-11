const amqp = require('amqplib');

const queue = 'some_queue';
const msg =
    generateUuid() + ' | ' + (process.argv.slice(2).join('') || 'Hello!');
const options = {};

class Client {
    constructor(url) {
        this.url = url;
    }
    then(res) {
        this._client = amqp.connect(this.url);
        res(this._client);
    }
}
const cl = new Client();

class Publisher {
    constructor(client) {
        this.client = client;
    }
    async createChannel() {
        this._channel = await this.client.createChannel();
        return this;
    }
    get channel() {
        if (!this._channel)
            throw new Error('No channel created for this action');
        return this._channel;
    }
    async assertQueue() {
        await this.channel.assertQueue();
        return this;
    }
    async assertExchange(ex, type, options) {
        await this.channel.assertExchange(ex, type, options);
        return this;
    }
    async publish(ex, rK, msg) {
        console.log('[v] Publishing "' + msg + '"');
        return await this.channel.publish(ex, rK, Buffer.from(msg));
    }
}

(async function () {
    const cl = new Client('amqp://localhost');
    let client;
    try {
        client = await cl;
        console.log(typeof client);
    } catch (e) {
        console.log(e, 'ERROR');
    }

    const publisher = new Publisher(client);
    await publisher.createChannel();
    await publisher.assertExchange('some_exchange', 'topic');
    await publisher.publish('some_exchange', 'lyu', msg);

    setTimeout(() => {
        client.close();
        process.exit(0);
    }, 200);

    const gracefulSh = () => {
        client.close();
        process.exit(0);
    };
    process.on('SIGINT', gracefulSh);
    process.on('SIGTERM', gracefulSh);
})();

function generateUuid() {
    return `${Math.round(Math.random() * 1000)}`;
}
