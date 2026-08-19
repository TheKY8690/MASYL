import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

const MAX_CHARS = 4000;

@Injectable()
export class WebsiteScraper {
  private readonly logger = new Logger(WebsiteScraper.name);

  async scrape(url: string): Promise<string> {
    const response = await axios.get<string>(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MasylBot/1.0; +https://masyl.co.kr)',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      responseType: 'text',
    });

    const $ = cheerio.load(response.data);

    // 노이즈 제거
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // 이벤트/프로모션 섹션 우선 탐색
    const candidates = [
      'main',
      'article',
      '[class*="event"]',
      '[class*="promotion"]',
      '[class*="notice"]',
      '[id*="event"]',
      '[id*="content"]',
      '#content',
      '.content',
      'body',
    ];

    let text = '';
    for (const selector of candidates) {
      const el = $(selector).first();
      if (el.length) {
        text = el.text().replace(/\s+/g, ' ').trim();
        if (text.length >= 200) break;
      }
    }

    if (!text) {
      text = $('body').text().replace(/\s+/g, ' ').trim();
    }

    if (text.length > MAX_CHARS) {
      this.logger.debug(
        `Truncating scraped text from ${text.length} to ${MAX_CHARS} chars`,
      );
      text = text.slice(0, MAX_CHARS);
    }

    return text;
  }
}
