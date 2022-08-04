import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDosenDto, EditDosenDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable({})
export class DosenService{
    constructor(private prisma: PrismaService){}

    verifyAdmin(status){
        if(status !== 'admin'){
            throw new ForbiddenException(
                'Anda tidak memiliki akses untuk request ini!'
            )
        }
    }

    async getDosen(userStatus: string){
        this.verifyAdmin(userStatus)
        const dosen = await this.prisma.dosen.findMany({
            include: {
                user: {
                    select : {
                        password: false,
                        username: true
                    },
                }
            }
        })

        return {
            status: 'success',
            message: 'Data Dosen Berhasil Ditampilkan',
            data: dosen
        }
    }

    async getDosenById(userStatus: string, dosenId: number){
        this.verifyAdmin(userStatus)
        const dosen = await this.prisma.dosen.findFirst({
            where: {
                id: dosenId
            },
            include: {
                user: {
                    select : {
                        password: false,
                        username: true
                    }
                }
            }
        })

        return {
            status: 'success',
            message: `Data Dosen dengan ID : ${dosenId} Berhasil Ditampilkan`,
            data: dosen
        }
    }

    async createDosen(userStatus: string, dto: CreateDosenDto){

        this.verifyAdmin(userStatus)

        const checkNipDosen = await this.prisma.dosen.findFirst({
            where: {
                nip: dto.nip
            }
        })
        
        if(checkNipDosen){
            throw new BadRequestException(
                `Dosen dengan NIP : ${dto.nip} Sudah ada`
            )
        }
        
        const checkUsernameUser = await this.prisma.user.findFirst({
            where: {
                username: dto.username
            }
        })
        
        if(checkUsernameUser){
            throw new BadRequestException(
                `User dengan username : ${dto.username} Sudah ada`
            )
        }

        // generate the password hash
        const password = await argon.hash(dto.password);

        // save the new user in the db
        const user = await this.prisma.user.create({
            data:{
                username: dto.username,
                password: password,
                status: 'dosen'
            }
        });

        const dosen = await this.prisma.dosen.create({
            data:{
                user_id: user.id,
                nip: dto.nip,
                name: dto.name
            }
        });

        return {
            status: 'success',
            message: 'Dosen Berhasil Ditambahkan',
            data: {
                id: dosen.id,
                username: user.username,
                nip: dosen.nip,
                name: dosen.name
            }
        }
  
    }

    async editDosenById(userStatus: string, dosenId: number, dto: EditDosenDto){
        this.verifyAdmin(userStatus)

        // get the dosen and user by id
        const dosen = await this.prisma.dosen.findUnique({
            where: {
                id: dosenId
            }
        })

        const user = await this.prisma.user.findFirst({
            where: {
                id: dosen.user_id
            }
        })

        if(!dosen){
            throw new NotFoundException(
                'Data Dosen Tidak Ditemukan'
            )
        }

        const checkNipDosen = await this.prisma.dosen.findFirst({
            where: {
                nip: dto.nip
            },
            select: {
                id: true
            }
        })
        

        if(checkNipDosen){
            if(checkNipDosen.id !== dosenId){
                throw new BadRequestException(
                    `Dosen dengan NIP : ${dto.nip} Sudah ada`
                )
            }
        } 
        
        const checkUsernameUser = await this.prisma.user.findFirst({
            where: {
                username: dto.username
            }
        })

        if(checkUsernameUser){
            if(checkUsernameUser.username !== user.username){ 
                throw new BadRequestException(
                    `User dengan username : ${dto.username} Sudah ada`
                )
            }
        }

        const editDosen = await this.prisma.dosen.update({
            where: {
                id: dosenId
            },
            data: {
                nip: dto.nip,
                name: dto.name
            }
        })


        let password

        if(dto.password){
            // generate the password hash
            password = await argon.hash(dto.password);
        }

        const editUser = await this.prisma.user.update({
            where: {
                id: dosen.user_id
            },
            data: {
                username: dto.username,
                password: password
            }
        })
        

        return {
            status: 'success',
            message: 'Data Dosen Berhasil Diedit',
            data: {
                id: editDosen.id,
                username: editUser.username,
                nip: editDosen.nip,
                name: editDosen.name
            }
        }
    }

    async deleteDosenById(userStatus: string, dosenId: number){
        this.verifyAdmin(userStatus)

        const dosen = await this.prisma.dosen.findUnique({
            where: {
                id: dosenId
            }
        })

        if(!dosen){
            throw new NotFoundException(
                'Data Dosen Tidak Ditemukan'
            )
        }
        
        await this.prisma.dosen.delete({
            where: {
                id: dosenId
            }
        })
        
        await this.prisma.user.delete({
            where: {
                id: dosen.user_id
            }
        })

        return {
            status: 'success',
            message: 'Data Dosen Berhasil Dihapus',
        }
    }
}