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
exports.PublicProfileController = exports.HousingIdentityController = void 0;
const common_1 = require("@nestjs/common");
const housing_identity_service_1 = require("./housing-identity.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const update_housing_identity_dto_1 = require("./dto/update-housing-identity.dto");
let HousingIdentityController = class HousingIdentityController {
    housingIdentityService;
    constructor(housingIdentityService) {
        this.housingIdentityService = housingIdentityService;
    }
    async getProfile(req) {
        return this.housingIdentityService.getOrCreateIdentity(req.user.id);
    }
    async updatePersonal(req, dto) {
        return this.housingIdentityService.updatePersonalInfo(req.user.id, dto);
    }
    async updateHousehold(req, dto) {
        return this.housingIdentityService.updateHouseholdInfo(req.user.id, dto);
    }
    async updateEmployment(req, dto) {
        return this.housingIdentityService.updateEmploymentInfo(req.user.id, dto);
    }
    async updatePreferences(req, dto) {
        return this.housingIdentityService.updatePreferences(req.user.id, dto);
    }
    async updateRentalHistory(req, dto) {
        return this.housingIdentityService.updateRentalHistory(req.user.id, dto);
    }
    async updateGuarantor(req, dto) {
        return this.housingIdentityService.updateGuarantorInfo(req.user.id, dto);
    }
    async updateBio(req, dto) {
        return this.housingIdentityService.updateBio(req.user.id, dto);
    }
    async createShareLink(req, dto) {
        return this.housingIdentityService.createShareLink(req.user.id, dto);
    }
    async getShareLinks(req) {
        return this.housingIdentityService.getUserShareLinks(req.user.id);
    }
    async revokeShareLink(req, id) {
        return this.housingIdentityService.revokeShareLink(req.user.id, id);
    }
};
exports.HousingIdentityController = HousingIdentityController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('personal'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdatePersonalInfoDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updatePersonal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('household'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdateHouseholdInfoDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updateHousehold", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('employment'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdateEmploymentInfoDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updateEmployment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('preferences'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdatePreferencesDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('rental-history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdateRentalHistoryDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updateRentalHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('guarantor'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdateGuarantorInfoDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updateGuarantor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('bio'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.UpdateBioDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "updateBio", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('share'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_housing_identity_dto_1.CreateShareLinkDto]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "createShareLink", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('share'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "getShareLinks", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('share/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HousingIdentityController.prototype, "revokeShareLink", null);
exports.HousingIdentityController = HousingIdentityController = __decorate([
    (0, common_1.Controller)('housing-identity'),
    __metadata("design:paramtypes", [housing_identity_service_1.HousingIdentityService])
], HousingIdentityController);
let PublicProfileController = class PublicProfileController {
    housingIdentityService;
    constructor(housingIdentityService) {
        this.housingIdentityService = housingIdentityService;
    }
    async getPublicProfile(token, password) {
        return this.housingIdentityService.getPublicProfile(token, password);
    }
    async accessPublicProfileWithPassword(token, password) {
        return this.housingIdentityService.getPublicProfile(token, password);
    }
};
exports.PublicProfileController = PublicProfileController;
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicProfileController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Post)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicProfileController.prototype, "accessPublicProfileWithPassword", null);
exports.PublicProfileController = PublicProfileController = __decorate([
    (0, common_1.Controller)('public/profile'),
    __metadata("design:paramtypes", [housing_identity_service_1.HousingIdentityService])
], PublicProfileController);
//# sourceMappingURL=housing-identity.controller.js.map