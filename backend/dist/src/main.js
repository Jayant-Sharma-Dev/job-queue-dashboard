import { NestFactory } from '@nestjs/core';
import { AppModule } from "./app.module.js";
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    });
    await app.listen(3000);
    console.log(` Server running at http://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map