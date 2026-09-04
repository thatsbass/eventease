import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { SWAGGER } from "src/constants"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })

  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.setGlobalPrefix("api")
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle(SWAGGER.doc.title)
    .setDescription(SWAGGER.doc.description)
    .setVersion(SWAGGER.doc.version)
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(SWAGGER.doc.route, app, document)

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001)
}

bootstrap()
