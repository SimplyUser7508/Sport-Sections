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
        const userId = await this.authService.getUserIdFromToken(token);
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }
        
        const section = this.sectionRepository.create({
            ...dto,
            user
        });
        
        return this.sectionRepository.save(section);
    }
    
    async getSections(
        token: string,
        page: number,
        limit: number
    ): Promise<{ section: Section[], total: number, page: number, limit: number, totalPages: number }> {
        const userId = await this.authService.getUserIdFromToken(token);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const skip = (page - 1) * limit;

        const [sections, total] = await this.sectionRepository.findAndCount({
            where: { user },
            relations: ['user'],
            skip,
            take: limit,
            order: {
                datetime: 'ASC',
            },
        });
    
        const currentTime = new Date();
    
        for (const section of sections) {
            const sectionTime = new Date(section.datetime);
            if (sectionTime < currentTime && section.status !== 'DONE') {
                section.status = 'DONE';
                await this.sectionRepository.save(section); 
            }
        }
    
        return {
            section: sections, 
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    
    
    

    async updateSection(dto: CreateSectionDto, id: string): Promise<string> {
        await this.sectionRepository.update(id, { ...dto });
        return 'Section updated';
    }

    async deleteSection(id: string) {
        await this.sectionRepository.delete(id);
        return 'Section deleted';
    }
}
