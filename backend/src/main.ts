import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.static(join(__dirname, '..', '..', 'frontend', 'build')));
  app.use((req, res) => {
    res.sendFile(join(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
  });
  app.enableCors();
  // const reflector = app.get( Reflector );
  // const jwtService = app.get( JwtService )
  // app.useGlobalGuards( new JwtAuthGuard( jwtService, reflector ) );
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT_WEB, () => console.log(`Server started on port: ${process.env.PORT_WEB}`));
}
bootstrap();
