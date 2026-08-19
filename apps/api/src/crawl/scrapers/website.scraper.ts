import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';
import { URL } from 'url';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const MAX_CHARS = 4000;
const MAX_SUBPAGES = 4;

const EVENT_KEYWORDS = [
  'event',
  'promotion',
  'promo',
  'notice',
  'news',
  'campaign',
  '이벤트',
  '프로모션',
  '공지',
  '할인',
  '혜택',
];

@Injectable()
export class WebsiteScraper {
  private readonly logger = new Logger(WebsiteScraper.name);

  private async fetchText(
    url: string,
  ): Promise<{ html: string; text: string }> {
    const response = await axios.get<string>(url, {
      timeout: 15000,
      httpsAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      responseType: 'text',
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, iframe, noscript').remove();

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
    if (!text) text = $('body').text().replace(/\s+/g, ' ').trim();

    return { html: response.data as string, text };
  }

  private extractEventLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const origin = new URL(baseUrl).origin;
    const base = new URL(baseUrl);
    const seen = new Set<string>();
    const links: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      let absolute: string;
      try {
        absolute = new URL(href, base).href;
      } catch {
        return;
      }

      if (!absolute.startsWith(origin)) return;
      if (seen.has(absolute) || absolute === baseUrl) return;

      const lowerHref = href.toLowerCase();
      const linkText = $(el).text().toLowerCase();
      const isEventLink = EVENT_KEYWORDS.some(
        (kw) => lowerHref.includes(kw) || linkText.includes(kw),
      );
      if (!isEventLink) return;

      seen.add(absolute);
      links.push(absolute);
    });

    return links.slice(0, MAX_SUBPAGES);
  }

  async scrape(url: string): Promise<string> {
    const { html, text: listText } = await this.fetchText(url);

    const subLinks = this.extractEventLinks(html, url);
    this.logger.debug(`Found ${subLinks.length} event subpages for ${url}`);

    const subTexts: string[] = [];
    for (const link of subLinks) {
      try {
        const { text } = await this.fetchText(link);
        if (text.length >= 100) {
          subTexts.push(`[${link}]\n${text.slice(0, 800)}`);
        }
      } catch (e) {
        this.logger.warn(`Failed to fetch subpage ${link}: ${String(e)}`);
      }
    }

    const combined = [listText.slice(0, 1200), ...subTexts].join('\n\n---\n\n');

    return combined.length > MAX_CHARS
      ? combined.slice(0, MAX_CHARS)
      : combined;
  }
}
