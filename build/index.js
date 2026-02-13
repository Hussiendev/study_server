"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./util/logger"));
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const requestLogger_1 = __importDefault(require("./midlleware/requestLogger"));
const index_1 = __importDefault(require("./routes/index"));
const HttpException_1 = require("./util/exceptions/http/HttpException");
const app = (0, express_1.default)();
//for security headers
app.use((0, helmet_1.default)());
//use body parser
app.use(body_parser_1.default.json());
//to support URL-encoded bodies
app.use(body_parser_1.default.urlencoded({ extended: true }));
//use corse
app.use((0, cors_1.default)({
    origin: '*' //in production, specify allowed origins
}));
/*async function runAnalyticsTest() {
    const analyticsService = new OrderManagement();
    const result = await analyticsService.groupOrdersByCategory();
    logger.info("Grouped orders by category:");
   logger.info(JSON.stringify(result, null, 2));

}
*/
/*runAnalyticsTest().catch(err => logger.error(err))*/
//adding request handler mdidleware
app.use(requestLogger_1.default);
app.listen(config_1.default.port, config_1.default.host, () => {
    logger_1.default.info(`Server is running at http://${config_1.default.host}:${config_1.default.port}`);
});
app.use('/', index_1.default);
//404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
//make and error hadnler
// After: Enhanced Global Error Handler
app.use((err, req, res) => {
    if (err instanceof HttpException_1.HttpException) {
        const httpException = err;
        // Log includes name, status, message, and details
        logger_1.default.error(" %s [%d] \"%s\" %o", httpException.name, httpException.status, httpException.message, httpException.details || {});
        // Response includes message and details
        res.status(httpException.status).json({
            message: httpException.message,
            details: httpException.details || undefined
        });
    }
    else {
        logger_1.default.error("Unhandled Error: %s", err.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
//# sourceMappingURL=index.js.map