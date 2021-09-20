import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of user service
    const users: User[] = [];
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 9999), email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService
        }
      ]
    }).compile();

    service = module.get(AuthService);
  });

  it("can create an instance of auth service", async () => {


    expect(service).toBeDefined();
  });

  it("creates a new user with salted and hashed password", async () => {
    const user = await service.signUp("test@test,com", "password123");
    expect(user.password).not.toEqual("password123");
    const [salt, hash] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("throws an error if user signs up with email that is in use", async (done) => {
    await service.signUp('asdf@asdf.com', 'pass')
    try {
      await service.signUp('asdf@asdf.com', "test");
    } catch (err) {
      done();
    }
  });

  it("throws if sign in is called with an invalid email", async (done) => {
    try {
      await service.signIn("emial@email.com", "pass");
    } catch (err) {
      done();
    }
  });

  it("throws if an invalid password is provided", async (done) => {
    await service.signUp('test@test.com', 'pass')
    try {
      await service.signIn("test@test.com", "password");
    } catch (err) {
      done();
    }
  });

  it("returns a user if correct password is provided", async () => {
    await service.signUp("test@test.com", "pass");
    const user = await service.signIn("test@test.com", "pass");
    expect(user).toBeDefined();
  });
});
