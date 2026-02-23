import { Controller, Post, Body, Res, Req, HttpCode } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

@Controller('admin/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(200)
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(body.email, body.password);

        // Set refresh token as HttpOnly cookie
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/v1/admin/auth/refresh',
        });

        return {
            access_token: result.access_token,
            admin: result.admin,
        };
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Req() req: Request) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            return { error: 'No refresh token provided' };
        }
        return this.authService.refreshToken(refreshToken);
    }
}
