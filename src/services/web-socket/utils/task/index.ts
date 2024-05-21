import ws from 'ws';

export class Task {
    constructor(
        private readonly uuid: string,
        private execute: (client: ws) => {},
        private readonly data?: { [key: string]: any },
    ) { }

    public run = async (client: ws) => {
        return this.execute(client);
    }

    public getUuid = () => this.uuid;
    public getData = () => this.data;
}