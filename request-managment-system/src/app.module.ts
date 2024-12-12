import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.entity";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from '@nestjs/core';
import { Section } from "./sections/section.entity";
import { SectionModule } from "./sections/section.module";
import { Tokens } from "./auth/auth.entity";

@Module({
    providers: [
      { provide: APP_GUARD,
      useClass: JwtAuthGuard }
    ],
    imports: [
      ConfigModule.forRoot(),
      // ServeStaticModule.forRoot({
      //   rootPath: join(__dirname, '..', 'client'),
      // }),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY,
        signOptions: {
          expiresIn: '30d'
        }
      }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST,
          port: Number(process.env.PORT),
          username: process.env.USER,
          password: process.env.PASSWORD,
          database: process.env.DB,
          entities: [User, Section, Tokens],
          autoLoadEntities: true,
          synchronize: true,
          // ssl: {
          //   ca: fs.readFileSync(process.env.CA)
          // },
        }),
        UsersModule,
        AuthModule,
        SectionModule
      ],
})
export class AppModule{}