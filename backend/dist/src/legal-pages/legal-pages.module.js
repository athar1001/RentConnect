"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalPagesModule = void 0;
const common_1 = require("@nestjs/common");
const legal_pages_service_1 = require("./legal-pages.service");
const legal_pages_controller_1 = require("./legal-pages.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let LegalPagesModule = class LegalPagesModule {
};
exports.LegalPagesModule = LegalPagesModule;
exports.LegalPagesModule = LegalPagesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [legal_pages_controller_1.LegalPagesController],
        providers: [legal_pages_service_1.LegalPagesService],
        exports: [legal_pages_service_1.LegalPagesService],
    })
], LegalPagesModule);
//# sourceMappingURL=legal-pages.module.js.map