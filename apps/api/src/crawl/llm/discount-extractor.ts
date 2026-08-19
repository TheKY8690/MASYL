import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedDiscount {
  title: string;
  description: string;
  discountType: 'percent' | 'amount' | 'free_item' | 'other';
  discountValue: string;
  validFrom?: string;
  validUntil?: string;
}

@Injectable()
export class DiscountExtractor {
  private readonly logger = new Logger(DiscountExtractor.name);
  private readonly client: Anthropic;

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.get('ANTHROPIC_API_KEY') ?? 'placeholder',
    });
  }

  async extract(
    brandName: string,
    sourceUrl: string,
    rawContent: string,
  ): Promise<ExtractedDiscount | null> {
    const prompt = `당신은 한국 커피 체인의 이벤트 페이지에서 할인 정보를 추출하는 AI입니다.

브랜드: ${brandName}
URL: ${sourceUrl}
내용:
${rawContent}

다음 JSON 형식으로만 응답하세요. 할인 정보가 없으면 null을 반환하세요.
{
  "title": "이벤트명 (최대 100자)",
  "description": "상세 설명",
  "discountType": "percent | amount | free_item | other",
  "discountValue": "예: 30% 또는 1000원 또는 아이스아메리카노 1잔",
  "validFrom": "YYYY-MM-DD 또는 null",
  "validUntil": "YYYY-MM-DD 또는 null"
}`;

    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const firstContent = message.content[0];
    const text = firstContent?.type === 'text' ? firstContent.text.trim() : '';

    if (!text || text === 'null') return null;

    // JSON 블록 추출 (마크다운 코드펜스 대응)
    const jsonMatch =
      text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
    const raw = jsonMatch?.[1] ?? text;

    const parsed = JSON.parse(raw) as ExtractedDiscount | null;
    if (!parsed || typeof parsed !== 'object') return null;

    this.logger.log(
      `Extracted discount for ${brandName}: "${parsed.title}" (${parsed.discountType})`,
    );
    return parsed;
  }
}
