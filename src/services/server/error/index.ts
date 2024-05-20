export class ServerError {
    constructor(
        private readonly error: Error,
        private readonly status: number
    ) { }

    public getStatus() {
        return this.status;
    }

    public getMessage() {
        if (this.error && this.error.message) {
            return this.error.message;
        }
        return 'Unknown Server Error';
    }

    public static from(message: string, status: number) {
        return new ServerError(new Error(message), status)
    }
}