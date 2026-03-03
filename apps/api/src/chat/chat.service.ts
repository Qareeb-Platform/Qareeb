import { BadRequestException, Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';

type EntityType = 'imam' | 'halqa' | 'maintenance';

@Injectable()
export class ChatService {
    constructor(private readonly searchService: SearchService) { }

    private parseLocationIntent(text: string): EntityType | null {
        const hasNear = /(\u0623\u0642\u0631\u0628|\u0642\u0631\u064a\u0628|nearest|near)/i.test(text);
        if (hasNear) {
            if (/(\u0645\u0633\u062c\u062f|\u0627\u0644\u0645\u0633\u0627\u062c\u062f|imam|\u0625\u0645\u0627\u0645|\u0627\u0644\u0623\u0626\u0645\u0629)/i.test(text)) return 'imam';
            if (/(\u062d\u0644\u0642\u0629|\u062d\u0644\u0642\u0627\u062a|halqa|halaqa)/i.test(text)) return 'halqa';
            if (/(\u0635\u064a\u0627\u0646\u0629|maintenance|\u0625\u0639\u0645\u0627\u0631)/i.test(text)) return 'maintenance';
        }
        if (/(imam|\u0625\u0645\u0627\u0645|\u0645\u0633\u062c\u062f|\u0627\u0644\u0645\u0633\u0627\u062c\u062f)/i.test(text)) return 'imam';
        if (/(\u062d\u0644\u0642\u0629|\u062d\u0644\u0642\u0627\u062a|halqa|halaqa)/i.test(text)) return 'halqa';
        if (/(\u0635\u064a\u0627\u0646\u0629|maintenance|\u0625\u0639\u0645\u0627\u0631)/i.test(text)) return 'maintenance';
        return null;
    }

    private parseAddIntent(text: string): EntityType | 'all' | null {
        if (!/(add|submit|\u0627\u0636\u064a\u0641|\u0623\u0636\u064a\u0641|\u0627\u0636\u0627\u0641\u0629|\u0625\u0636\u0627\u0641\u0629|\u0636\u064a\u0641|\u064a\u0636\u064a\u0641)/i.test(text)) return null;
        if (/(imam|\u0625\u0645\u0627\u0645|\u0627\u0645\u0627\u0645|\u0645\u0633\u062c\u062f|\u0627\u0644\u0645\u0633\u0627\u062c\u062f)/i.test(text)) return 'imam';
        if (/(halqa|halaqa|\u062d\u0644\u0642\u0629|\u062d\u0644\u0642\u0627\u062a)/i.test(text)) return 'halqa';
        if (/(maintenance|\u0635\u064a\u0627\u0646\u0629|\u0627\u0639\u0645\u0627\u0631|\u0625\u0639\u0645\u0627\u0631)/i.test(text)) return 'maintenance';
        return 'all';
    }

    async findNearest(text: string, userLat?: number, userLng?: number) {
        if (!text || !text.trim()) throw new BadRequestException('text is required');

        const addIntent = this.parseAddIntent(text);
        if (addIntent) {
            const links = addIntent === 'all'
                ? [
                    { type: 'imam', path: '/imams/submit', labelAr: '\u0625\u0636\u0627\u0641\u0629 \u0625\u0645\u0627\u0645/\u0645\u0633\u062c\u062f', labelEn: 'Add Imam/Mosque' },
                    { type: 'halqa', path: '/halaqat/submit', labelAr: '\u0625\u0636\u0627\u0641\u0629 \u062d\u0644\u0642\u0629', labelEn: 'Add Halqa' },
                    { type: 'maintenance', path: '/maintenance/submit', labelAr: '\u0637\u0644\u0628 \u0635\u064a\u0627\u0646\u0629 \u0645\u0633\u062c\u062f', labelEn: 'Request Maintenance' },
                ]
                : [
                    addIntent === 'imam'
                        ? { type: 'imam', path: '/imams/submit', labelAr: '\u0625\u0636\u0627\u0641\u0629 \u0625\u0645\u0627\u0645/\u0645\u0633\u062c\u062f', labelEn: 'Add Imam/Mosque' }
                        : addIntent === 'halqa'
                            ? { type: 'halqa', path: '/halaqat/submit', labelAr: '\u0625\u0636\u0627\u0641\u0629 \u062d\u0644\u0642\u0629', labelEn: 'Add Halqa' }
                            : { type: 'maintenance', path: '/maintenance/submit', labelAr: '\u0637\u0644\u0628 \u0635\u064a\u0627\u0646\u0629 \u0645\u0633\u062c\u062f', labelEn: 'Request Maintenance' },
                ];

            return {
                mode: 'add',
                message: '\u062a\u0645\u0627\u0645 - \u062a\u0642\u062f\u0631 \u062a\u0636\u064a\u0641 \u0645\u0646 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u062f\u064a:',
                links,
                cards: [],
            };
        }

        const intent = this.parseLocationIntent(text);
        if (intent && Number.isFinite(userLat) && Number.isFinite(userLng)) {
            const radiusKm = 5;
            const limit = intent === 'imam' ? 10 : 6;
            const result = await this.searchService.nearest(userLat!, userLng!, intent, { radiusKm, limit });
            const cards = result.data || [];
            if (!cards.length) {
                return {
                    mode: 'location',
                    message: `\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0645\u0639\u062a\u0645\u062f\u0629 \u062f\u0627\u062e\u0644 \u0646\u0637\u0627\u0642 ${radiusKm} \u0643\u0645 \u062d\u0627\u0644\u064a\u0627\u064b. \u062c\u0631\u0651\u0628 \u0645\u0646\u0637\u0642\u0629 \u0623\u062e\u0631\u0649 \u0623\u0648 \u0648\u0633\u0651\u0639 \u0646\u0637\u0627\u0642 \u0627\u0644\u0628\u062d\u062b.`,
                    cards: [],
                };
            }

            const title = intent === 'imam' ? '\u0627\u0644\u0645\u0633\u0627\u062c\u062f \u0627\u0644\u0642\u0631\u064a\u0628\u0629' : intent === 'halqa' ? '\u0627\u0644\u062d\u0644\u0642\u0627\u062a \u0627\u0644\u0642\u0631\u064a\u0628\u0629' : '\u0645\u0633\u0627\u062c\u062f \u062a\u062d\u062a\u0627\u062c \u0635\u064a\u0627\u0646\u0629';
            return {
                mode: 'location',
                message: `${title} \u062f\u0627\u062e\u0644 \u0646\u0637\u0627\u0642 ${radiusKm} \u0643\u0645 (${cards.length} \u0646\u062a\u064a\u062c\u0629):`,
                cards,
            };
        }

        if (intent) {
            return {
                mode: 'need_location',
                intent,
                message: '\u0639\u0634\u0627\u0646 \u0623\u0642\u062f\u0631 \u0623\u062c\u064a\u0628 \u0627\u0644\u0623\u0642\u0631\u0628\u060c \u0627\u062e\u062a\u0627\u0631 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u0623\u0648 \u062d\u062f\u0651\u062f \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0629 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629.',
                cards: [],
            };
        }

        if (/(\u0623\u0642\u0631\u0628|\u0642\u0631\u064a\u0628|nearest|near)/i.test(text)) {
            return {
                mode: 'ask_type',
                message: '\u0639\u0627\u064a\u0632 \u062a\u062f\u0648\u0631 \u0639\u0644\u0649 \u0625\u064a\u0647 \u0628\u0627\u0644\u0636\u0628\u0637\u061f \u0623\u0642\u0631\u0628 \u0645\u0633\u062c\u062f\u060c \u0623\u0642\u0631\u0628 \u062d\u0644\u0642\u0629\u060c \u0648\u0644\u0627 \u0645\u0633\u062c\u062f \u064a\u062d\u062a\u0627\u062c \u0635\u064a\u0627\u0646\u0629\u061f',
                cards: [],
            };
        }

        return {
            mode: 'guided',
            message: '\u0623\u0646\u0627 \u0623\u0642\u062f\u0631 \u0623\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u062d\u0627\u062c\u062a\u064a\u0646: \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0623\u0642\u0631\u0628\u060c \u0623\u0648 \u0625\u0636\u0627\u0641\u0629 \u0625\u0645\u0627\u0645/\u062d\u0644\u0642\u0629/\u0635\u064a\u0627\u0646\u0629. \u0642\u0648\u0644 \u0644\u064a \u0639\u0627\u064a\u0632 \u062a\u0639\u0645\u0644 \u0625\u064a\u0647.',
            cards: [],
        };
    }
}
