import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedDiscount {
  title: string;
  description: string;
  discountType: 'percent' | 'amount' | 'free_item' | 'coupon' | 'other';
  discountValue: string;
  validFrom?: string;
  validUntil?: string;
  eventUrl?: string;
}

@Injectable()
export class DiscountExtractor {
  private readonly logger = new Logger(DiscountExtractor.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      configService.get('GEMINI_API_KEY') ?? '',
    );
  }

  async extract(
    brandName: string,
    sourceUrl: string,
    rawContent: string,
  ): Promise<ExtractedDiscount[]> {
    const today = new Date().toISOString().slice(0, 10);

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

현재 진행 중인 모든 혜택을 JSON 배열로 반환하세요. 유효한 혜택이 없으면 빈 배열 [].
내용에 [https://...] 형태의 URL 마커가 있으면, 해당 이벤트가 수집된 서브페이지 URL을 eventUrl로 추출하세요.
JSON 배열로만 응답. 각 혜택은 아래 형식의 객체:
[
  {
    "title": "이벤트/혜택명 (최대 100자)",
    "description": "혜택 상세 설명 (조건, 대상 메뉴, 적용 방법 포함)",
    "discountType": "percent | amount | free_item | coupon | other",
    "discountValue": "예: 30% 또는 1000원 또는 아이스아메리카노 1잔",
    "validFrom": "YYYY-MM-DD 또는 null",
    "validUntil": "YYYY-MM-DD 또는 null",
    "eventUrl": "이벤트 원본 페이지 URL 또는 null"
  }
]`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text || text === '[]') return [];

    // JSON 배열 블록 추출 (마크다운 코드펜스 대응)
    const jsonMatch =
      text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\])/);
    const raw = jsonMatch?.[1] ?? text;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.warn(
        `Failed to parse JSON for ${brandName}: ${raw.slice(0, 100)}`,
      );
      return [];
    }

    if (!Array.isArray(parsed)) return [];

    const now = new Date();
    const valid: ExtractedDiscount[] = [];

    for (const item of parsed as ExtractedDiscount[]) {
      if (!item || typeof item !== 'object') continue;
      if (!item.title || item.title === 'null') continue;
      if (!item.discountType || !item.discountValue) continue;

      if (item.validUntil && new Date(item.validUntil) < now) {
        this.logger.warn(
          `Skipping expired discount for ${brandName}: "${item.title}" (until ${item.validUntil})`,
        );
        continue;
      }
      if (item.validFrom && new Date(item.validFrom) > now) {
        this.logger.warn(
          `Skipping future discount for ${brandName}: "${item.title}" (from ${item.validFrom})`,
        );
        continue;
      }

      valid.push(item);
    }

    this.logger.log(`Extracted ${valid.length} discount(s) for ${brandName}`);
    return valid;
  }
}
