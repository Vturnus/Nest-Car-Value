import {
  Controller,
  Body,
  Param,
  Query,
  Session,
  Post,
  Get,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Serialize } from "../interceptors/serialize.interceptor";
import { UserDto } from "./dtos/user.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUsersDto } from "./dtos/update-users.dto";
import { UsersService } from "./users.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./user.entity";
import { AuthGuard } from "../guards/auth.guard";


@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  // @Get('/colors/:color')
  // setColor(@Param('color') color: string, @Session() session: any) {
  //   session.color = color
  // }
  //
  // @Get('/colors')
  // getColor(@Session() session: any) {
  //   return session.color
  // }

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   const user = this.userService.findOne(session.userId)
  //   if (!user) {
  //     throw new NotFoundException('User not found!')
  //   }
  // }
@UseGuards(AuthGuard)
@Get('/whoAmI')
whoAmI(@CurrentUser() user: User) {
    return user
}

  @Post("/signup")
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signUp(body.email, body.password)
    session.userId = user.id
    return user
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signIn(body.email, body.password)
    session.userId = user.id
    return user
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null
  }
  @Get("/:id")
  async findUser(@Param("id") id: string) {
    const user = await this.userService.findOne(parseInt(id));
    if (!user) {
      throw  new NotFoundException("No user found!");
    }
    return user;
  }

  @Get()
  findAllUsers(@Query("email") email: string) {
    return this.userService.find(email);
  }

  @Delete("/:id")
  removeUser(@Param("id") id: string) {
    return this.userService.remove(parseInt(id));
  }

  @Patch("/:id")
  updateUser(@Param("id") id: string, @Body() body: UpdateUsersDto) {
    return this.userService.update(parseInt(id), body);
  }

}
