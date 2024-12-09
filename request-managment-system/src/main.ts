import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // dotenv.config({ path: '../.env' }); 
  // console.log('Loaded Environment Variables:', process.env);
  const PORT = 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // const reflector = app.get( Reflector );
  // const jwtService = app.get( JwtService )
  // app.useGlobalGuards( new JwtAuthGuard( jwtService, reflector ) );
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();
