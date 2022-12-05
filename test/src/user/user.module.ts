import {forwardRef, Module} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.model";
import {FilesModule} from "../files/files.module";
import {UserRepository} from "./user.repository";
import {AuthModule} from "../auth/auth.module";


@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports:[TypeOrmModule.forFeature([User]),
  FilesModule,forwardRef(()=>AuthModule)],
  exports:[UserService]
})
export class UserModule {}
