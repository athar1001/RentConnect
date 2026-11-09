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
exports.PublicApplicationController = exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const applications_dto_1 = require("./dto/applications.dto");
let ApplicationsController = class ApplicationsController {
    applicationsService;
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async getApplications(req, status, search, sort) {
        return this.applicationsService.getUserApplications(req.user.id, { status, search, sort });
    }
    async getAnalytics(req) {
        return this.applicationsService.getAnalytics(req.user.id);
    }
    async getApplication(req, id) {
        return this.applicationsService.getApplicationById(req.user.id, id);
    }
    async create(req, dto) {
        return this.applicationsService.createApplication(req.user.id, dto);
    }
    async update(req, id, dto) {
        return this.applicationsService.updateApplication(req.user.id, id, dto);
    }
    async addNote(req, id, dto) {
        return this.applicationsService.addNote(req.user.id, id, dto);
    }
    async addReminder(req, id, dto) {
        return this.applicationsService.addReminder(req.user.id, id, dto);
    }
    async createSharing(req, id, dto) {
        return this.applicationsService.createSharing(req.user.id, id, dto);
    }
    async revokeSharing(req, id) {
        return this.applicationsService.revokeSharing(req.user.id, id);
    }
    async fulfillDocumentRequest(req, id, requestId, dto) {
        return this.applicationsService.fulfillDocumentRequest(req.user.id, id, requestId, dto);
    }
    async withdraw(req, id) {
        return this.applicationsService.withdrawApplication(req.user.id, id);
    }
    async requestDocument(req, id, requestedType, description) {
        return this.applicationsService.createDocumentRequest(req.user.id, id, requestedType, description);
    }
    async getTimelineFeed(id) {
        return this.applicationsService.getTimelineFeed(id);
    }
    async addTimelineComment(timelineId, senderType, senderName, content) {
        return this.applicationsService.addTimelineComment(timelineId, senderType, senderName, content);
    }
    async respondToViewing(id, viewingId, action, notes) {
        return this.applicationsService.respondToViewing(id, viewingId, action, notes);
    }
    async respondToOffer(id, offerId, action) {
        return this.applicationsService.respondToOffer(id, offerId, action);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplication", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, applications_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, applications_dto_1.UpdateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, applications_dto_1.CreateApplicationNoteDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "addNote", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/reminders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, applications_dto_1.CreateApplicationReminderDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "addReminder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/sharing'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, applications_dto_1.CreateApplicationShareDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "createSharing", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id/sharing'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "revokeSharing", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/document-requests/:requestId/fulfill'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('requestId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, applications_dto_1.FulfillRequestDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "fulfillDocumentRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/withdraw'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/document-request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('requestedType')),
    __param(3, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "requestDocument", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getTimelineFeed", null);
__decorate([
    (0, common_1.Post)('timeline/:timelineId/comments'),
    __param(0, (0, common_1.Param)('timelineId')),
    __param(1, (0, common_1.Body)('senderType')),
    __param(2, (0, common_1.Body)('senderName')),
    __param(3, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "addTimelineComment", null);
__decorate([
    (0, common_1.Post)(':id/viewings/:viewingId/rsvp'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('viewingId')),
    __param(2, (0, common_1.Body)('action')),
    __param(3, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "respondToViewing", null);
__decorate([
    (0, common_1.Post)(':id/offers/:offerId/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('offerId')),
    __param(2, (0, common_1.Body)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "respondToOffer", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
let PublicApplicationController = class PublicApplicationController {
    applicationsService;
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async getPublicApplication(token, password) {
        return this.applicationsService.getPublicApplication(token, password);
    }
    async accessPublicApplicationWithPassword(token, password) {
        return this.applicationsService.getPublicApplication(token, password);
    }
};
exports.PublicApplicationController = PublicApplicationController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicApplicationController.prototype, "getPublicApplication", null);
__decorate([
    (0, common_1.Post)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicApplicationController.prototype, "accessPublicApplicationWithPassword", null);
exports.PublicApplicationController = PublicApplicationController = __decorate([
    (0, common_1.Controller)('public/application'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], PublicApplicationController);
//# sourceMappingURL=applications.controller.js.map