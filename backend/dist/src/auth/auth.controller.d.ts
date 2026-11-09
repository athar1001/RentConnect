import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: "USER";
        };
    }>;
    adminLogin(loginDto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    checkEmail(email: string): Promise<{
        exists: boolean;
    }>;
    logout(res: Response): {
        message: string;
    };
    getProfile(req: Request): Express.User | undefined;
    getExtensionStatus(req: Request): Promise<{
        email: string;
        fullName: string | null;
        preferredLanguage: string;
        extensionConnected: boolean;
    }>;
    connectExtension(req: Request): Promise<{
        success: boolean;
        connected: boolean;
    }>;
    disconnectExtension(req: Request): Promise<{
        success: boolean;
        connected: boolean;
    }>;
    private setCookie;
}
