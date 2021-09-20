import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email)
      if(users.length) {
        throw new BadRequestException('The given email is already in use!')
      }
    // Hash user password
    // Generate a salts
    const salt = randomBytes(8).toString('hex')
    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer
    // Joined the hashed result and salt together
   const result = salt + '.' + hash.toString('hex')
    // Create a new user and return it
    return await this.usersService.create(email, result)
  }

  async signIn(email: string, password: string) {
    const  [user] = await this.usersService.find(email)
    if(!user) {
      throw new BadRequestException('Incorrect email or password')
    }
    const [salt, storedHash] = user.password.split('.')

    const hash = (await scrypt(password, salt, 32)) as Buffer
    if(storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Incorrect email or password')
    }
    return user
  }
}