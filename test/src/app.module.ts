import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import { UserModule } from './user/user.module';
import {ConfigModule} from "@nestjs/config";
import {User} from "./user/user.model";
import { FilesModule } from './files/files.module';
import {AuthModule} from "./auth/auth.module";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";




@Module({
  controllers:[],
  providers:[],
  imports: [ConfigModule.forRoot({
    envFilePath:`.${process.env.NODE_ENV}.env`
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port:  Number(process.env.POSTGRES_PORT),
      username:  process.env.POSTGRES_USER,
      password:  process.env.POSTGRES_PASSWORD,
      database:  process.env.POSTGRES_DB,
      entities: [User],
      synchronize:true,
      autoLoadEntities:true
    }),UserModule, FilesModule,AuthModule]
})
export class AppModule{}