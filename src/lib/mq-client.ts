import { connect, Connection, Options } from 'amqplib/callback_api';

class MqClient {
    private _connection?: Connection;

    get connection() {
        if (!this._connection) {
            throw new Error(
                '[ERROR] There is no connection. You need to connect first.'
            );
        }
        return this._connection;
    }

    connect(url: string | Options.Connect, callback?: () => void) {
        if (this._connection) this._connection.close();

        return new Promise((resolve, reject) => {
            connect(url, (err, connection) => {
                if (err) reject(err);

                this._connection = connection;

                if (callback) callback();

                resolve(this._connection);
            });
        });
    }
}

const mqClient = new MqClient();
export { mqClient };
