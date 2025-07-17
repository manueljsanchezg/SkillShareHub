import { Role } from "@prisma/client";

export interface UserI {
    name: string,
    surname: string,
    birthDate: string,
    email: string,
    password: string,
    role: Role
}