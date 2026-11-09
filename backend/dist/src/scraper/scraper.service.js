"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jsdom_1 = require("jsdom");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let ScraperService = ScraperService_1 = class ScraperService {
    prisma;
    logger = new common_1.Logger(ScraperService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    getExtractorScripts() {
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
                .filter((file) => file.startsWith('extractors/'))
                .map((file) => path.join(extensionDir, file));
        }
        catch (e) {
            this.logger.error(`Error reading manifest or extractor files: ${e.message}`, e.stack);
            throw e;
        }
    }
    parseSafeDate(dateStr) {
        if (!dateStr)
            return null;
        if (dateStr instanceof Date) {
            return isNaN(dateStr.getTime()) ? null : dateStr;
        }
        const cleanStr = String(dateStr).trim();
        if (!cleanStr)
            return null;
        const germanMatch = cleanStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (germanMatch) {
            const day = parseInt(germanMatch[1], 10);
            const month = parseInt(germanMatch[2], 10) - 1;
            const year = parseInt(germanMatch[3], 10);
            const parsedDate = new Date(year, month, day);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }
        const date = new Date(cleanStr);
        return isNaN(date.getTime()) ? null : date;
    }
    extractDataFromHtml(html, url) {
        const dom = new jsdom_1.JSDOM(html, {
            url: url,
            runScripts: 'dangerously',
        });
        const scripts = this.getExtractorScripts();
        const scriptsContent = scripts.map(filePath => fs.readFileSync(filePath, 'utf8')).join('\n');
        const scriptEl = dom.window.document.createElement('script');
        scriptEl.textContent = scriptsContent;
        dom.window.document.body.appendChild(scriptEl);
        if (typeof dom.window.extractApartmentFromPage === 'function') {
            return dom.window.extractApartmentFromPage();
        }
        throw new Error('extractApartmentFromPage is not defined in JSDOM context');
    }
    async scrapeWithFirecrawl(url) {
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
    async scrapeWithJina(url) {
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
    async scrapeWithPuppeteerInternal(url) {
        let browser;
        try {
            browser = await puppeteer_extra_1.default.launch({
                headless: 'new',
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
            }
            catch (e) {
                this.logger.warn(`networkidle2 navigation failed, trying domcontentloaded: ${e.message}`);
                response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            }
            if (!response || response.status() !== 200) {
                const status = response ? response.status() : 'unknown';
                throw new Error(`Puppeteer failed with status code: ${status}`);
            }
            const pageTitle = await page.title();
            const bodyText = await page.evaluate(() => document.body.innerText);
            if (pageTitle.includes('Ich bin kein Roboter') ||
                pageTitle.includes('Captcha') ||
                bodyText.includes('Ich bin kein Roboter') ||
                bodyText.includes('captcha')) {
                throw new Error('CAPTCHA/Roboter check page detected in Puppeteer.');
            }
            const scripts = this.getExtractorScripts();
            const scriptsContent = scripts.map(filePath => fs.readFileSync(filePath, 'utf8')).join('\n');
            await page.addScriptTag({ content: scriptsContent });
            await new Promise(resolve => setTimeout(resolve, 2000));
            const extractedData = await page.evaluate(() => {
                if (typeof window.extractApartmentFromPage === 'function') {
                    return window.extractApartmentFromPage();
                }
                return null;
            });
            if (!extractedData) {
                throw new Error('extractApartmentFromPage returned null or is undefined in browser page');
            }
            return extractedData;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async scrapeAndImport(userId, url) {
        let platform = 'OTHER';
        if (url.includes('immobilienscout24.de'))
            platform = 'ImmoScout24';
        if (url.includes('wg-gesucht.de'))
            platform = 'WG-Gesucht';
        if (url.includes('wunderflats.com'))
            platform = 'Wunderflats';
        let extractedData = null;
        let scrapeMethodUsed = '';
        let lastError = null;
        this.logger.log(`Attempt 1/3: Scraping URL with Puppeteer: ${url}`);
        try {
            extractedData = await this.scrapeWithPuppeteerInternal(url);
            scrapeMethodUsed = 'Puppeteer';
            this.logger.log(`Successfully scraped URL with Puppeteer: ${url}`);
        }
        catch (err) {
            this.logger.warn(`Attempt 1/3 (Puppeteer) failed for URL ${url}: ${err.message}`);
            lastError = err;
        }
        if (!extractedData) {
            this.logger.log(`Attempt 2/3: Fallback to Firecrawl for URL: ${url}`);
            try {
                const html = await this.scrapeWithFirecrawl(url);
                extractedData = this.extractDataFromHtml(html, url);
                scrapeMethodUsed = 'Firecrawl';
                this.logger.log(`Successfully scraped URL with Firecrawl: ${url}`);
            }
            catch (err) {
                this.logger.warn(`Attempt 2/3 (Firecrawl) failed for URL ${url}: ${err.message}`);
                lastError = err;
            }
        }
        if (!extractedData) {
            this.logger.log(`Attempt 3/3: Fallback to Jina.ai for URL: ${url}`);
            try {
                const html = await this.scrapeWithJina(url);
                extractedData = this.extractDataFromHtml(html, url);
                scrapeMethodUsed = 'Jina.ai';
                this.logger.log(`Successfully scraped URL with Jina.ai: ${url}`);
            }
            catch (err) {
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
            const rentPrice = data.rentPrice !== undefined && data.rentPrice !== null ? Number(data.rentPrice) : null;
            const warmRent = data.warmRent !== undefined && data.warmRent !== null ? Number(data.warmRent) : null;
            const coldRent = data.coldRent !== undefined && data.coldRent !== null ? Number(data.coldRent) : null;
            const deposit = data.deposit !== undefined && data.deposit !== null ? Number(data.deposit) : null;
            const rooms = data.rooms !== undefined && data.rooms !== null ? Number(data.rooms) : null;
            const squareMeters = data.squareMeters !== undefined && data.squareMeters !== null ? Number(data.squareMeters) : null;
            const utilityCosts = data.utilityCosts !== undefined && data.utilityCosts !== null ? Number(data.utilityCosts) : null;
            const heatingCosts = data.heatingCosts !== undefined && data.heatingCosts !== null ? Number(data.heatingCosts) : null;
            const constructionYear = data.constructionYear !== undefined && data.constructionYear !== null ? Number(data.constructionYear) : null;
            const furnished = data.furnished !== undefined && data.furnished !== null ? Boolean(data.furnished) : false;
            const petsAllowed = data.petsAllowed !== undefined && data.petsAllowed !== null ? Boolean(data.petsAllowed) : false;
            const heatingCostsIncluded = data.heatingCostsIncluded !== undefined && data.heatingCostsIncluded !== null ? Boolean(data.heatingCostsIncluded) : false;
            const listingIdMatch = url.match(/\/([0-9]+)\b/);
            const urlListingId = listingIdMatch ? listingIdMatch[1] : null;
            const finalListingId = data.listingId || urlListingId || null;
            const finalPlatform = data.sourcePlatform || platform || 'Unknown';
            const moveInDate = this.parseSafeDate(data.moveInDate || data.availability);
            const imageUrls = Array.isArray(data.images)
                ? Array.from(new Set(data.images)).map((u) => String(u).trim()).filter(Boolean).slice(0, 25)
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
                status: 'SAVED',
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
                        create: imageUrls.map((imgUrl) => ({ url: imgUrl }))
                    } : undefined,
                },
                create: {
                    ...apartmentData,
                    userId,
                    originalListingUrl: url,
                    images: imageUrls.length > 0 ? {
                        create: imageUrls.map((imgUrl) => ({ url: imgUrl }))
                    } : undefined,
                },
            });
            await this.prisma.importLog.create({
                data: { url, status: 'SUCCESS', platform: finalPlatform },
            });
            return apartment;
        }
        catch (error) {
            this.logger.error(`Failed to upsert apartment from data: ${url}`, error.stack);
            await this.prisma.importLog.create({
                data: { url, status: 'FAILED', error: error.message, platform },
            });
            throw new Error(`Failed to import apartment: ${error.message}`);
        }
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = ScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map