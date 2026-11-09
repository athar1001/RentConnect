import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: "USER";
        };
    }>;
    adminLogin(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    checkEmailExists(email: string): Promise<boolean>;
    getExtensionStatus(userId: string): Promise<{
        email: string;
        fullName: string | null;
        preferredLanguage: string;
        extensionConnected: boolean;
    }>;
    setExtensionConnection(userId: string, connected: boolean): Promise<{
        success: boolean;
        connected: boolean;
    }>;
}
