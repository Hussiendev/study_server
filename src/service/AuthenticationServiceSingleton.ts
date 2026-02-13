import { AuthenticationService } from './Authentication.service';

export class AuthenticationServiceSingleton {
    private static instance: AuthenticationService;

    private constructor() {}

    public static getInstance(): AuthenticationService {
        if (!AuthenticationServiceSingleton.instance) {
            AuthenticationServiceSingleton.instance = new AuthenticationService();
        }
        return AuthenticationServiceSingleton.instance;
    }
}
