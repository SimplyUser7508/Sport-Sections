import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async createUser(dto: CreateUserDto): Promise<User> { 
        const user = await this.usersRepository.save({ ...dto})
        return user;
    }
    
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async getUserByEmail(email: string) {
        const user = await this.usersRepository.findOne({where: {email}});
        return user;
    }

    async getUserIdByEmail(dto: CreateUserDto): Promise<number> {
        const email = dto.email;
        const user = await this.usersRepository.findOne({where: {email}});
        if (user) {
            return user.id;
        } else {
            throw new Error('Пользователь с таким email не найден');
        }
    }
}
