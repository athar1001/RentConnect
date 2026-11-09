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
exports.LandlordsController = void 0;
const common_1 = require("@nestjs/common");
const landlords_service_1 = require("./landlords.service");
const landlords_dto_1 = require("./dto/landlords.dto");
let LandlordsController = class LandlordsController {
    landlordsService;
    constructor(landlordsService) {
        this.landlordsService = landlordsService;
    }
    async getLandlordId() {
        const landlord = await this.landlordsService.getOrCreateDefaultLandlord();
        return landlord.id;
    }
    async getProperties() {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getProperties(landlordId);
    }
    async createProperty(dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.createProperty(landlordId, dto);
    }
    async getPropertyById(id) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getPropertyById(landlordId, id);
    }
    async updateProperty(id, dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.updateProperty(landlordId, id, dto);
    }
    async deleteProperty(id) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.deleteProperty(landlordId, id);
    }
    async getApplications(propertyId, status, search) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getApplications(landlordId, { propertyId, status, search });
    }
    async getApplicationById(id) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getApplicationById(landlordId, id);
    }
    async compareApplicants(dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.compareApplicants(landlordId, dto.applicationIds);
    }
    async scheduleViewing(dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.scheduleViewing(landlordId, dto);
    }
    async getICSViewing(id) {
        return this.landlordsService.getICSViewing(id);
    }
    async addNote(dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.addNote(landlordId, dto, 'Property Manager');
    }
    async sendMessage(dto) {
        return this.landlordsService.sendMessage(dto, 'Landlord Team');
    }
    async requestDocument(applicationId, requestedType, description) {
        return this.landlordsService.requestDocument(applicationId, requestedType, description);
    }
    async sendOffer(applicationId, dto) {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.sendOffer(landlordId, applicationId, dto);
    }
    async getAnalytics() {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getAnalytics(landlordId);
    }
    async getAuditLogs() {
        const landlordId = await this.getLandlordId();
        return this.landlordsService.getAuditLogs(landlordId);
    }
};
exports.LandlordsController = LandlordsController;
__decorate([
    (0, common_1.Get)('properties'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getProperties", null);
__decorate([
    (0, common_1.Post)('properties'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landlords_dto_1.CreatePropertyDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "createProperty", null);
__decorate([
    (0, common_1.Get)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getPropertyById", null);
__decorate([
    (0, common_1.Patch)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, landlords_dto_1.UpdatePropertyDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "updateProperty", null);
__decorate([
    (0, common_1.Delete)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "deleteProperty", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getApplicationById", null);
__decorate([
    (0, common_1.Post)('applications/compare'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landlords_dto_1.CompareApplicantsDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "compareApplicants", null);
__decorate([
    (0, common_1.Post)('viewings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landlords_dto_1.CreateViewingDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "scheduleViewing", null);
__decorate([
    (0, common_1.Get)('viewings/:id/ics'),
    (0, common_1.Header)('Content-Type', 'text/calendar'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=viewing-invitation.ics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getICSViewing", null);
__decorate([
    (0, common_1.Post)('notes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landlords_dto_1.CreateLandlordNoteDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "addNote", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landlords_dto_1.CreateLandlordMessageDto]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('applications/:id/document-request'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('requestedType')),
    __param(2, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "requestDocument", null);
__decorate([
    (0, common_1.Post)('applications/:id/offer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "sendOffer", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandlordsController.prototype, "getAuditLogs", null);
exports.LandlordsController = LandlordsController = __decorate([
    (0, common_1.Controller)('landlords'),
    __metadata("design:paramtypes", [landlords_service_1.LandlordsService])
], LandlordsController);
//# sourceMappingURL=landlords.controller.js.map