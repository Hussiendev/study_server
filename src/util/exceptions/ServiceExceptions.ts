export class ServiceException extends Error {
    constructor(message: string, error?: Error) {
        super(message);
        this.name = "ServiceException";
        if (error) {
            this.stack = error.stack;
            this.message = `${message}: ${error.message}`;
        }
    }   
}