import helmet from 'helmet';
import config from './config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import requestLogger from './midlleware/requestLogger';
const app = express();  
// Use helmet  for security
app.use(helmet());
//use body parser
app.use(bodyParser.json());
//to support URL-encoded bodies
app.use(bodyParser.urlencoded({extended:true}));
//use cors
app.use(cors());
//config middlware
app.use(requestLogger)

app.listen(config.port, config.host, () => {
  console.log(`Server is running on port ${config.port}`);
});

