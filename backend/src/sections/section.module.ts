import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './section.entity';
import { User } from 'src/users/users.entity';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Section, User]),
        AuthModule
    ],
    providers: [SectionService],
    controllers: [SectionController],
    exports: [SectionService]
})
export class SectionModule {}
