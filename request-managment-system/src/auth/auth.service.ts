import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from './auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tokens) private tokensRepository: Repository<Tokens>,
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
  
    const existingToken = await this.tokensRepository.findOne({ where: { user: { id: user.id } } });
  
    if (existingToken) {  
      existingToken.refresh_token = this.jwtService.sign({ email: user.email, id: user.id }, { expiresIn: '30d' });
      await this.tokensRepository.save(existingToken);
    } else {
      return this.generateTokens(user);
    }
  }
  
  async logout(token: string) {
    const userId = await this.getUserIdFromToken(token);
    return await this.tokensRepository.delete({ user: { id: userId } });
  }
  
  async issueTokens(refreshToken: string) {
    const tokenEntry = await this.tokensRepository.findOne({
      where: { refresh_token: refreshToken },
      relations: ['user'],
    });
    
    if (!tokenEntry) {
      throw new Error('Token not found');
    }

    const userId = tokenEntry.user.id;
    const user = await this.userService.getUserById(userId);
    await this.tokensRepository.delete({ refresh_token: refreshToken });
    return this.generateTokens(user);
  }

  async registration(userDto: CreateUserDto) {
      const candidate = await this.userService.getUserByEmail(userDto.email);
      if (candidate) {
          throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
      }
      const hashPassword = await bcrypt.hash(userDto.password, 5);
      const user = await this.userService.createUser({...userDto, password: hashPassword});

      return this.generateTokens(user);
  }

  async getUserIdFromToken(token: string): Promise<number> {
      const decodedToken = this.jwtService.decode(token);
      if (decodedToken && typeof decodedToken === 'object' && decodedToken.hasOwnProperty('email')) {
        const userEmail = decodedToken['email'];
        const user = await this.userService.getUserByEmail(userEmail);
        if (user) {
          return user.id;
        } else {
          throw new Error('Пользователь с таким email не найден');
        }
      } else {
        throw new Error('Неверный формат токена или отсутствует email');
      }
  }

  private async generateTokens(user) {
    const paylaod = {email: user.email, id: user.id};
    const refreshToken = this.jwtService.sign(paylaod, { expiresIn: '30d' });
    const accessToken = this.jwtService.sign(paylaod, { expiresIn: '15h' });
    await this.tokensRepository.save({
      refresh_token: refreshToken,
      user,
    });
    return { accessToken, refreshToken };
  }

  private async validateUser(userDto: CreateUserDto) {
      const user = await this.userService.getUserByEmail(userDto.email);
      const passwordEquals = await bcrypt.compare(userDto.password, user.password);
      if (user && passwordEquals) {
          return user; 
      }
      throw new UnauthorizedException({message: 'Неверный email или пароль'});
  }
}