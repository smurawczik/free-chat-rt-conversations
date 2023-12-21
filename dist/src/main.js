"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: 'http://localhost:5173', credentials: true });
    app.use(cookieParser());
    app.use(compression());
    await app.listen(3033, () => console.log('orchestrator is listening on port 3033'));
}
bootstrap();
//# sourceMappingURL=main.js.map