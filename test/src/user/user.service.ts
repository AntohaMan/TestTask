import {ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.model";
import {Repository} from "typeorm";
import {CreateUserDto} from "./dto/create-user.dto";
import {FilesService} from "../files/files.service";
import * as pdfkit from "pdfkit";
import * as fs from "fs";
import * as path from 'path';
import {uuid} from "uuidv4";
import {Buffer} from "buffer";
import {AuthTokenDto} from "../auth/dto/auth-token.dto";
import {UserRepository} from "./user.repository";
import {IUserRepository} from "./types/user-repository.interface";
import {JwtService} from "@nestjs/jwt";



@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepository:Repository<User>,
                private fileService:FilesService,
                @Inject(JwtService) private jwtService:JwtService,
                @Inject(UserRepository)
                private userNewRepository: IUserRepository,
    ){}

    async createUser(userDto:CreateUserDto): Promise<User>{

        return this.userNewRepository.createAndSave(userDto);
    }

    async addImage(userId: number,image:any){
        const fileName=await this.fileService.createFile(image);
        await this.userNewRepository.addImage(userId,fileName);
        return {message:"image added"};
    }



    async createPdf(email:string){

        const user =await this.userRepository.findOneBy({email:email});
        if(!user){throw new UnauthorizedException({message:"Incorrect data"})}
        // отсюда
        if(!user.image){return JSON.stringify(false);}
        const filePath = path.resolve(__dirname, `../static/${user.image}`)
        let pdf=new pdfkit();

        let pdfFile;
        let chunks:any=[];
        pdf.on("data",(chunk)=>{
            chunks.push(chunk)

        });
        pdf.on('end',async ()=>{
            pdfFile=Buffer.concat(chunks);
            user.pdf=pdfFile;
            await this.userNewRepository.updateById({ pdf: pdfFile }, user.id)

        })
            pdf.pipe(fs.createWriteStream(path.resolve(__dirname, `../static/` + uuid()+".pdf")));
            pdf.text(`${user.firstName} ${user.lastName}`,{align:"left",}).fontSize(14);
            pdf.image(filePath, {fit: [400, 150]});
            pdf.end();
            // до сюда вынести в отдельный сервис или модуль
        return JSON.stringify(true);
    }


    async getAllUsers(): Promise<User[]>{
        return this.userRepository.find();

    }

    async getUser(id:number): Promise<User>{
        const user=await this.userRepository.findOneBy({id:id})
        if(!user){throw new UnauthorizedException({message:"Incorrect data"});}
        return user;
    }

    async updateUser(body:any,userId: number): Promise<void>{
        return this.userNewRepository.updateById(body,userId);
    }


    async deleteUserById(id:number): Promise<MessageResponse>{
        const delUser=await this.userRepository.findOneBy({id:id});
        if(!delUser){throw new UnauthorizedException({message:"Incorrect data"});}
        await this.userRepository.remove(delUser);
        return { message: 'User was deleted'}


    }
    async getUserByEmail(email:string): Promise<User>
    {
        return this.userNewRepository.getByEmail(email);
    }

}

export class MessageResponse {
    message: string;
}

