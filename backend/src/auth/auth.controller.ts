import { 
    Body, 
    Controller, 
    Get,
    Post, 
    UsePipes,
    Headers
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from './auth.set-metadata';
import { ValidationPipe } from 'src/pipes/validation.pipe';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body() userDto: CreateUserDto) {
        return this.authService.login(userDto);
    }

    @Post('/logout')
    logout(@Headers('Authorization') authHeader: string) {
        return this.authService.logout(authHeader);
    }

    @Post('/registration')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto);
    }

    @Post('/issueTokens')
    issueTokens(@Body('refreshToken') refreshToken: string) {
        return this.authService.issueTokens(refreshToken);
    }

    @Public()
    @Get('/profile')
    async getProfile(@Headers('Authorization') authHeader: string) {
        return this.authService.getUserIdFromToken(authHeader);
    }
}
