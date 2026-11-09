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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_lib_1 = require("pdf-lib");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(userId, file, title, type) {
        return this.prisma.document.create({
            data: {
                userId,
                title,
                type,
                fileUrl: file.filename,
                fileSize: file.size,
                mimeType: file.mimetype,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const document = await this.prisma.document.findUnique({
            where: { id },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (document.userId !== userId) {
            throw new common_1.UnauthorizedException('You do not have access to this document');
        }
        return document;
    }
    async remove(userId, id) {
        const document = await this.findOne(userId, id);
        const filePath = path.join(process.cwd(), 'uploads', document.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return this.prisma.document.delete({
            where: { id },
        });
    }
    async mergeDocuments(userId, ids) {
        if (!ids || ids.length < 2) {
            throw new common_1.BadRequestException('Select at least two documents.');
        }
        const docs = await Promise.all(ids.map(async (id) => {
            const doc = await this.findOne(userId, id);
            const mime = doc.mimeType?.toLowerCase() || '';
            const url = doc.fileUrl?.toLowerCase() || '';
            const isPdf = mime === 'application/pdf' || url.endsWith('.pdf');
            const isPng = mime === 'image/png' || url.endsWith('.png');
            const isJpg = mime === 'image/jpeg' || mime === 'image/jpg' || url.endsWith('.jpg') || url.endsWith('.jpeg');
            if (!isPdf && !isPng && !isJpg) {
                throw new common_1.BadRequestException('Only PDF and image files (PNG/JPG) can be merged.');
            }
            return doc;
        }));
        try {
            const mergedPdf = await pdf_lib_1.PDFDocument.create();
            for (const doc of docs) {
                const filePath = path.join(process.cwd(), 'uploads', doc.fileUrl);
                if (!fs.existsSync(filePath)) {
                    throw new common_1.NotFoundException(`File for document "${doc.title}" not found.`);
                }
                const fileBytes = fs.readFileSync(filePath);
                const mime = doc.mimeType?.toLowerCase() || '';
                const url = doc.fileUrl?.toLowerCase() || '';
                const isPdfFile = mime === 'application/pdf' || url.endsWith('.pdf');
                const isPngFile = mime === 'image/png' || url.endsWith('.png');
                if (isPdfFile) {
                    const pdf = await pdf_lib_1.PDFDocument.load(fileBytes);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
                else if (isPngFile) {
                    const image = await mergedPdf.embedPng(fileBytes);
                    const page = mergedPdf.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                }
                else {
                    const image = await mergedPdf.embedJpg(fileBytes);
                    const page = mergedPdf.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });
                }
            }
            const mergedPdfBytes = await mergedPdf.save();
            return Buffer.from(mergedPdfBytes);
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException || err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            console.error('PDF Merge Error:', err);
            throw new common_1.InternalServerErrorException('One or more documents could not be processed.');
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map