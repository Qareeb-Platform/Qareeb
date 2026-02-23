import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_PUBLIC_KEY || process.env.JWT_PRIVATE_KEY || 'dev-secret-key',
            algorithms: [process.env.JWT_PUBLIC_KEY ? 'RS256' : 'HS256'],
        });
    }

    async validate(payload: { sub: string; email: string; role: string }) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
