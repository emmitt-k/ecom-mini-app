import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
