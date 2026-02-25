import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('nearest')
    findNearest(@Body('text') text: string) {
        return this.chatService.findNearest(text);
    }
}
