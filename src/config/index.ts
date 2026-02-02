import dotnev from "dotenv";
import path from "path";
dotnev.config({path:path.join(__dirname,'../ ../.env')});
export default {
NODE_ENV: process.env.NODE_ENV || 'development', // Checks if the environment type (e.g., 'production' or 'development') is set; if not, it uses 'development' as default.
logDir: 'logs', // Specifies the folder where log files will be saved.
port: process.env.PORT ? parseInt(process.env.PORT) : 4000, // Sets the port number for the application to listen on. It checks if a PORT environment variable is set; if not, it defaults to 3000.
host: process.env.HOST || 'localhost', // Sets the host address for the application. It checks if a HOST environment variable is set; if not, it defaults to 'localhost'.
Storage:{
      postgres:'postgresql://neondb_owner:npg_Q0eGUgSc9bYx@ep-still-violet-a4smcvre-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

},
  
};