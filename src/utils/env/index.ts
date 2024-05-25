import dotenv from 'dotenv';

export class Environment {
    static init() {
        if (process.argv.includes('--dev')) {
            console.log('Using dev.env file');
            return dotenv.config({ path: 'dev.env' });
        }
        return dotenv.config();
    }

    static getApiPort() {
        return parseInt(process.env.API_PORT) ?? 3000;
    }

    static getWsPort() {
        return parseInt(process.env.WS_PORT) ?? 3001;
    }

    static getBcryptPassword() {
        return process.env.BCRYPT_PASSWORD;
    }

    static getJWTPassword() {
        return process.env.JWT_PASSWORD as string;
    }

    static getLLAMAApiUrl() {
        return process.env.LLAMA_API_URL as string;
    }
}