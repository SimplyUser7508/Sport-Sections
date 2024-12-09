import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './section.entity';
import { Repository } from 'typeorm/repository/Repository';
import { CreateSectionDto } from './dto/create-section.dto';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class SectionService {
    constructor(
        @InjectRepository(Section) private sectionRepository: Repository<Section>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private authService: AuthService
    ) {}

    async createSection(dto: CreateSectionDto, token: string): Promise<Section> {
        // Получаем ID пользователя из токена
        const userId = await this.authService.getUserIdFromToken(token);
        
        // Загружаем объект пользователя из базы данных
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Создаем запись секции и привязываем пользователя
        const section = this.sectionRepository.create({
            ...dto,
            user, // Привязываем объект User
        });
        
        return this.sectionRepository.save(section);
    }
    
    async getSections(token: string): Promise<Section[]> {
        const userId = await this.authService.getUserIdFromToken(token);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return await this.sectionRepository.find({
            where: {
                user: user
            },
            relations: ['user']
        });
    }

    async updateSection(dto: CreateSectionDto, id: string): Promise<string> {
        await this.sectionRepository.update(id, { ...dto });
        return 'Section updated';
    }

    async deleteSection(id: number) {
        await this.sectionRepository.delete(id);
        return 'Section deleted';
    }
}
