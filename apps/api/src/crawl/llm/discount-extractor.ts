import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedDiscount {
  title: string;
  description: string;
  discountType: 'percent' | 'amount' | 'free_item' | 'coupon' | 'other';
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
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const prompt = `당신은 한국 커피 체인의 이벤트/프로모션 페이지에서 고객에게 혜택을 주는 정보를 추출하는 AI입니다.

오늘 날짜: ${today}

추출 규칙:
- 오늘(${today}) 기준으로 현재 진행 중인 이벤트만 추출
- 종료일이 오늘보다 이전이면 반드시 제외
- 시작일이 오늘보다 이후인 예정 이벤트도 제외
- 기간이 명시되지 않은 이벤트는 현재 진행 중으로 간주하여 추출

추출 대상:
- 할인 (% 할인, 정액 할인)
- 쿠폰 (앱 쿠폰, 다운로드 쿠폰, 증정 쿠폰)
- 이벤트 혜택 (구매 시 증정, 스탬프 적립, 경품)
- 신메뉴 출시 이벤트 (혜택 포함 시)
- 멤버십/포인트 혜택

추출 제외: 단순 신메뉴 소개(혜택 없음), 브랜드 홍보, 종료된 이벤트

브랜드: ${brandName}
URL: ${sourceUrl}
내용:
${rawContent}

여러 혜택이 있으면 오늘 기준 가장 임박한(종료일이 가까운) 1건만 선택하세요.
JSON으로만 응답 (배열 금지, 단일 객체). 현재 유효한 혜택이 없으면 null.
{
  "title": "이벤트/혜택명 (최대 100자)",
  "description": "혜택 상세 설명 (조건, 대상 메뉴, 적용 방법 포함)",
  "discountType": "percent | amount | free_item | coupon | other",
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

    let parsed: ExtractedDiscount | null;
    try {
      parsed = JSON.parse(raw) as ExtractedDiscount | null;
    } catch {
      this.logger.warn(
        `Failed to parse JSON for ${brandName}: ${raw.slice(0, 100)}`,
      );
      return null;
    }
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.title || parsed.title === 'null') return null;
    if (!parsed.discountType || !parsed.discountValue) return null;

    // 날짜 이중 검증 — LLM이 만료된 이벤트를 잘못 추출한 경우 방어
    const now = new Date();
    if (parsed.validUntil && new Date(parsed.validUntil) < now) {
      this.logger.warn(
        `Skipping expired discount for ${brandName}: "${parsed.title}" (until ${parsed.validUntil})`,
      );
      return null;
    }
    if (parsed.validFrom && new Date(parsed.validFrom) > now) {
      this.logger.warn(
        `Skipping future discount for ${brandName}: "${parsed.title}" (from ${parsed.validFrom})`,
      );
      return null;
    }

    this.logger.log(
      `Extracted discount for ${brandName}: "${parsed.title}" (${parsed.discountType})`,
    );
    return parsed;
  }
}
