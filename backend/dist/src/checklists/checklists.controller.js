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
exports.ChecklistsBaseController = exports.ChecklistsController = void 0;
const common_1 = require("@nestjs/common");
const checklists_service_1 = require("./checklists.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChecklistsController = class ChecklistsController {
    checklistsService;
    constructor(checklistsService) {
        this.checklistsService = checklistsService;
    }
    create(req, apartmentId, data) {
        return this.checklistsService.create(req.user.userId, apartmentId, data);
    }
    findAll(req, apartmentId) {
        return this.checklistsService.findAll(req.user.userId, apartmentId);
    }
};
exports.ChecklistsController = ChecklistsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('apartmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('apartmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChecklistsController.prototype, "findAll", null);
exports.ChecklistsController = ChecklistsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('apartments/:apartmentId/checklist'),
    __metadata("design:paramtypes", [checklists_service_1.ChecklistsService])
], ChecklistsController);
let ChecklistsBaseController = class ChecklistsBaseController {
    checklistsService;
    constructor(checklistsService) {
        this.checklistsService = checklistsService;
    }
    update(req, id, data) {
        return this.checklistsService.update(req.user.userId, id, data);
    }
    remove(req, id) {
        return this.checklistsService.remove(req.user.userId, id);
    }
};
exports.ChecklistsBaseController = ChecklistsBaseController;
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistsBaseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChecklistsBaseController.prototype, "remove", null);
exports.ChecklistsBaseController = ChecklistsBaseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('checklist'),
    __metadata("design:paramtypes", [checklists_service_1.ChecklistsService])
], ChecklistsBaseController);
//# sourceMappingURL=checklists.controller.js.map