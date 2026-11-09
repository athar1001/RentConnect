"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalPagesController = void 0;
const common_1 = require("@nestjs/common");
const legal_pages_service_1 = require("./legal-pages.service");
const legal_page_dto_1 = require("./dto/legal-page.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
let LegalPagesController = class LegalPagesController {
    legalPagesService;
    constructor(legalPagesService) {
        this.legalPagesService = legalPagesService;
    }
    getPublishedStatus() {
        return this.legalPagesService.getPublishedStatus();
    }
    findBySlug(slug) {
        return this.legalPagesService.findBySlug(slug);
    }
    findByType(type) {
        const pageType = type.toUpperCase();
        return this.legalPagesService.findByType(pageType);
    }
    findAllAdmin() {
        return this.legalPagesService.findAllAdmin();
    }
    findOneAdmin(id) {
        return this.legalPagesService.findOneAdmin(id);
    }
    update(id, dto, req, ip) {
        const adminId = req.user.userId;
        return this.legalPagesService.update(id, dto, adminId, ip);
    }
    publish(id, dto, req, ip) {
        const adminId = req.user.userId;
        const adminEmail = req.user.email;
        return this.legalPagesService.publish(id, dto, adminId, adminEmail, ip);
    }
    unpublish(id, req, ip) {
        const adminId = req.user.userId;
        return this.legalPagesService.unpublish(id, adminId, ip);
    }
    getVersions(id) {
        return this.legalPagesService.getVersions(id);
    }
    restore(id, versionId, req, ip) {
        const adminId = req.user.userId;
        return this.legalPagesService.restore(id, versionId, adminId, ip);
    }
};
exports.LegalPagesController = LegalPagesController;
__decorate([
    (0, common_1.Get)('legal-pages/published'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "getPublishedStatus", null);
__decorate([
    (0, common_1.Get)('legal-pages/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)('legal-pages/type/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('control/legal-pages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('control/legal-pages/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "findOneAdmin", null);
__decorate([
    (0, common_1.Patch)('control/legal-pages/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, legal_page_dto_1.UpdateLegalPageDto, Object, String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('control/legal-pages/:id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, legal_page_dto_1.PublishLegalPageDto, Object, String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)('control/legal-pages/:id/unpublish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Get)('control/legal-pages/:id/versions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)('control/legal-pages/:id/restore/:versionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", void 0)
], LegalPagesController.prototype, "restore", null);
exports.LegalPagesController = LegalPagesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [legal_pages_service_1.LegalPagesService])
], LegalPagesController);
//# sourceMappingURL=legal-pages.controller.js.map