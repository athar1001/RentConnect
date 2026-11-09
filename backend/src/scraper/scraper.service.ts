import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private prisma: PrismaService) {}

  private getExtractorScripts(): string[] {
    const possibleManifestPaths = [
      path.join(process.cwd(), 'extension', 'manifest.json'),
      path.join(process.cwd(), '..', 'extension', 'manifest.json'),
      path.join(__dirname, '..', '..', '..', 'extension', 'manifest.json'),
      path.join(__dirname, '..', '..', 'extension', 'manifest.json'),
    ];
    let manifestPath = '';
    for (const p of possibleManifestPaths) {
      if (fs.existsSync(p)) {
        manifestPath = p;
        break;
      }
    }
    if (!manifestPath) {
      throw new Error('Could not find extension/manifest.json');
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const contentScripts = manifest.content_scripts || [];
      const jsFiles = contentScripts[0]?.js || [];
      
      const extensionDir = path.dirname(manifestPath);
      return jsFiles
        .filter((file: string) => file.startsWith('extractors/'))
        .map((file: string) => path.join(extensionDir, file));
    } catch (e: any) {
      this.logger.error(`Error reading manifest or extractor files: ${e.message}`, e.stack);
      throw e;
    }
  }

  private parseSafeDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }

    const cleanStr = String(dateStr).trim();
    if (!cleanStr) return null;

    // Handle German format: DD.MM.YYYY
    const germanMatch = cleanStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (germanMatch) {
      const day = parseInt(germanMatch[1], 10);
      const month = parseInt(germanMatch[2], 10) - 1; // 0-indexed months
      const year = parseInt(germanMatch[3], 10);
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    const date = new Date(cleanStr);
    return isNaN(date.getTime()) ? null : date;
  }

  private extractDataFromHtml(html: string, url: string): any {
    const dom = new JSDOM(html, {
      url: url,
      runScripts: 'dangerously',
    });

    const scripts = this.getExtractorScripts();
    const scriptsContent = scripts.map(filePath => fs.readFileSync(filePath, 'utf8')).join('\n');

    // Inject consolidated scripts into JSDOM context
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = scriptsContent;
    dom.window.document.body.appendChild(scriptEl);

    // Run extractApartmentFromPage inside the JSDOM window context
    if (typeof (dom.window as any).extractApartmentFromPage === 'function') {
      return (dom.window as any).extractApartmentFromPage();
    }
    throw new Error('extractApartmentFromPage is not defined in JSDOM context');
  }

  private async scrapeWithFirecrawl(url: string): Promise<string> {
    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer fc-4c93bc10f67542328a922a636e2dcd0a',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        onlyMainContent: false,
        formats: ['html']
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} - ${errText}`);
    }

    const resBody = await response.json();
    if (!resBody.success || !resBody.data || !resBody.data.html) {
      throw new Error(`Firecrawl scrape unsuccessful or HTML missing: ${JSON.stringify(resBody)}`);
    }

    return resBody.data.html;
  }

  private async scrapeWithJina(url: string): Promise<string> {
    const apiKey = 'jina_e8578a57cf1348339a7eff8b30d4005cY_MTYTeuRn3laSj2Goua4TzZSmrv';
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Return-Format': 'html'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Jina.ai Reader error: ${response.status} ${response.statusText} - ${errText}`);
    }

    return await response.text();
  }

  private async scrapeWithPuppeteerInternal(url: string): Promise<any> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new' as any,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
      ];
      await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);

      let response;
      try {
        response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e: any) {
        this.logger.warn(`networkidle2 navigation failed, trying domcontentloaded: ${e.message}`);
        response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      }

      if (!response || response.status() !== 200) {
        const status = response ? response.status() : 'unknown';
        throw new Error(`Puppeteer failed with status code: ${status}`);
      }

      const pageTitle = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText);

      // Check for CAPTCHA
      if (
        pageTitle.includes('Ich bin kein Roboter') || 
        pageTitle.includes('Captcha') || 
        bodyText.includes('Ich bin kein Roboter') || 
        bodyText.includes('captcha')
      ) {
        throw new Error('CAPTCHA/Roboter check page detected in Puppeteer.');
      }

      // Load, concatenate, and inject the extractor scripts
      const scripts = this.getExtractorScripts();
      const scriptsContent = scripts.map(filePath => fs.readFileSync(filePath, 'utf8')).join('\n');
      await page.addScriptTag({ content: scriptsContent });

      // Wait a brief moment to ensure page scripts run and DOM is fully populated
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Evaluate extraction logic via extractApartmentFromPage
      const extractedData = await page.evaluate(() => {
        if (typeof (window as any).extractApartmentFromPage === 'function') {
          return (window as any).extractApartmentFromPage();
        }
        return null;
      });

      if (!extractedData) {
        throw new Error('extractApartmentFromPage returned null or is undefined in browser page');
      }

      return extractedData;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrapeAndImport(userId: string, url: string) {
    let platform = 'OTHER';
    if (url.includes('immobilienscout24.de')) platform = 'ImmoScout24';
    if (url.includes('wg-gesucht.de')) platform = 'WG-Gesucht';
    if (url.includes('wunderflats.com')) platform = 'Wunderflats';

    let extractedData: any = null;
    let scrapeMethodUsed = '';
    let lastError: Error | null = null;

    // --- STEP 1: PUPPETEER ---
    this.logger.log(`Attempt 1/3: Scraping URL with Puppeteer: ${url}`);
    try {
      extractedData = await this.scrapeWithPuppeteerInternal(url);
      scrapeMethodUsed = 'Puppeteer';
      this.logger.log(`Successfully scraped URL with Puppeteer: ${url}`);
    } catch (err: any) {
      this.logger.warn(`Attempt 1/3 (Puppeteer) failed for URL ${url}: ${err.message}`);
      lastError = err;
    }

    // --- STEP 2: FIRECRAWL ---
    if (!extractedData) {
      this.logger.log(`Attempt 2/3: Fallback to Firecrawl for URL: ${url}`);
      try {
        const html = await this.scrapeWithFirecrawl(url);
        extractedData = this.extractDataFromHtml(html, url);
        scrapeMethodUsed = 'Firecrawl';
        this.logger.log(`Successfully scraped URL with Firecrawl: ${url}`);
      } catch (err: any) {
        this.logger.warn(`Attempt 2/3 (Firecrawl) failed for URL ${url}: ${err.message}`);
        lastError = err;
      }
    }

    // --- STEP 3: JINA.AI ---
    if (!extractedData) {
      this.logger.log(`Attempt 3/3: Fallback to Jina.ai for URL: ${url}`);
      try {
        const html = await this.scrapeWithJina(url);
        extractedData = this.extractDataFromHtml(html, url);
        scrapeMethodUsed = 'Jina.ai';
        this.logger.log(`Successfully scraped URL with Jina.ai: ${url}`);
      } catch (err: any) {
        this.logger.warn(`Attempt 3/3 (Jina.ai) failed for URL ${url}: ${err.message}`);
        lastError = err;
      }
    }

    if (!extractedData) {
      const errMsg = lastError ? lastError.message : 'All 3 scraping attempts failed.';
      this.logger.error(`Failed to scrape URL after all 3 attempts: ${url}`);
      await this.prisma.importLog.create({
        data: { url, status: 'FAILED', error: errMsg, platform },
      });
      throw new Error(`Failed to import apartment after 3 attempts: ${errMsg}`);
    }

    try {
      const data = extractedData || {};

      // Parse numeric fields safely
      const rentPrice = data.rentPrice !== undefined && data.rentPrice !== null ? Number(data.rentPrice) : null;
      const warmRent = data.warmRent !== undefined && data.warmRent !== null ? Number(data.warmRent) : null;
      const coldRent = data.coldRent !== undefined && data.coldRent !== null ? Number(data.coldRent) : null;
      const deposit = data.deposit !== undefined && data.deposit !== null ? Number(data.deposit) : null;
      const rooms = data.rooms !== undefined && data.rooms !== null ? Number(data.rooms) : null;
      const squareMeters = data.squareMeters !== undefined && data.squareMeters !== null ? Number(data.squareMeters) : null;
      const utilityCosts = data.utilityCosts !== undefined && data.utilityCosts !== null ? Number(data.utilityCosts) : null;
      const heatingCosts = data.heatingCosts !== undefined && data.heatingCosts !== null ? Number(data.heatingCosts) : null;
      const constructionYear = data.constructionYear !== undefined && data.constructionYear !== null ? Number(data.constructionYear) : null;

      // Parse boolean fields safely
      const furnished = data.furnished !== undefined && data.furnished !== null ? Boolean(data.furnished) : false;
      const petsAllowed = data.petsAllowed !== undefined && data.petsAllowed !== null ? Boolean(data.petsAllowed) : false;
      const heatingCostsIncluded = data.heatingCostsIncluded !== undefined && data.heatingCostsIncluded !== null ? Boolean(data.heatingCostsIncluded) : false;

      // Extract listing ID from URL if not returned by extractor
      const listingIdMatch = url.match(/\/([0-9]+)\b/);
      const urlListingId = listingIdMatch ? listingIdMatch[1] : null;
      const finalListingId = data.listingId || urlListingId || null;

      const finalPlatform = data.sourcePlatform || platform || 'Unknown';

      // Parse move-in/availability date safely
      const moveInDate = this.parseSafeDate(data.moveInDate || data.availability);

      // Clean images and limit count
      const imageUrls = Array.isArray(data.images)
        ? Array.from(new Set(data.images)).map((u: any) => String(u).trim()).filter(Boolean).slice(0, 25)
        : [];

      let coverImage = data.coverImage || null;
      if (!coverImage && imageUrls.length > 0) {
        coverImage = imageUrls[0];
      }

      const apartmentData = {
        title: data.title || 'Imported Apartment',
        rentPrice,
        warmRent,
        coldRent,
        deposit,
        address: data.address || null,
        city: data.city || null,
        zipCode: data.zipCode || null,
        rooms,
        squareMeters,
        furnished,
        petsAllowed,
        moveInDate,
        sourcePlatform: finalPlatform,
        coverImage,
        listingId: finalListingId,
        status: 'SAVED' as any,
        energyClass: data.energyClass || null,
        utilityCosts,
        heatingCostsIncluded,
        heatingCosts,
        constructionYear,
        heatingType: data.heatingType || null,
        energySource: data.energySource || null,
        certificateType: data.certificateType || null,
        description: data.description || null,
        availability: data.availability || null,
        floor: data.floor || null,
      };

      const apartment = await this.prisma.apartment.upsert({
        where: {
          userId_originalListingUrl: {
            userId,
            originalListingUrl: url,
          },
        },
        update: {
          ...apartmentData,
          images: imageUrls.length > 0 ? {
            deleteMany: {},
            create: imageUrls.map((imgUrl: string) => ({ url: imgUrl }))
          } : undefined,
        },
        create: {
          ...apartmentData,
          userId,
          originalListingUrl: url,
          images: imageUrls.length > 0 ? {
            create: imageUrls.map((imgUrl: string) => ({ url: imgUrl }))
          } : undefined,
        },
      });

      await this.prisma.importLog.create({
        data: { url, status: 'SUCCESS', platform: finalPlatform },
      });

      return apartment;
    } catch (error: any) {
      this.logger.error(`Failed to upsert apartment from data: ${url}`, error.stack);
      await this.prisma.importLog.create({
        data: { url, status: 'FAILED', error: error.message, platform },
      });
      throw new Error(`Failed to import apartment: ${error.message}`);
    }
  }
}
