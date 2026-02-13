import dotnev from "dotenv";
import path from "path";
import {StringValue} from "ms"
dotnev.config({path:path.join(__dirname,'../ ../.env')});
export default {
NODE_ENV: process.env.NODE_ENV || 'development',
is_Production: process.env.NODE_ENV === 'production',
logDir: 'logs', // Specifies the folder where log files will be saved.
port: process.env.PORT ? parseInt(process.env.PORT) : 4000, // Sets the port number for the application to listen on. It checks if a PORT environment variable is set; if not, it defaults to 3000.
host: process.env.HOST || 'localhost', // Sets the host address for the application. It checks if a HOST environment variable is set; if not, it defaults to 'localhost'.
Storage:{
      postgres:'postgresql://neondb_owner:npg_Q0eGUgSc9bYx@ep-still-violet-a4smcvre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

},
auth:{
    jwtSecret: process.env.JWT_SECRET || 'secret_90909090', // Sets the secret key used for signing JSON Web Tokens (JWTs). It checks if a JWT_SECRET environment variable is set; if not, it defaults to
    expiration:(process.env.JWT_EXPIRATION || '15m') as StringValue,
      refreshExpiration:(process.env.JWT_REFRESH_EXPIRATION || '7d') as StringValue, // Sets the expiration time for JWTs. It checks if a JWT_EXPIRATION environment variable is set; if not, it defaults to '1h' (1 hour).
}
  
};