import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class GeoController {
    @Get('geo')
    getGeo(@Req() req: any) {
        const headerCountry = req.headers['x-vercel-ip-country']
            || req.headers['cf-ipcountry']
            || req.headers['cloudfront-viewer-country'];
        const country = (headerCountry || 'OM').toString().toUpperCase();
        return { country };
    }
}
