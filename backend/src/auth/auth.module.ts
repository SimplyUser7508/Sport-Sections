import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tokens } from './auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tokens]),
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: '30d'
      }
    }),
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard
  ]
})
export class AuthModule {}