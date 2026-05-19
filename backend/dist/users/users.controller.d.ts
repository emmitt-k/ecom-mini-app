import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    getMe(userId: string): Promise<UserResponseDto>;
    updateMe(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
}
