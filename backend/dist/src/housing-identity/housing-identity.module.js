"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingIdentityModule = void 0;
const common_1 = require("@nestjs/common");
const housing_identity_service_1 = require("./housing-identity.service");
const housing_identity_controller_1 = require("./housing-identity.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let HousingIdentityModule = class HousingIdentityModule {
};
exports.HousingIdentityModule = HousingIdentityModule;
exports.HousingIdentityModule = HousingIdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [housing_identity_controller_1.HousingIdentityController, housing_identity_controller_1.PublicProfileController],
        providers: [housing_identity_service_1.HousingIdentityService],
        exports: [housing_identity_service_1.HousingIdentityService],
    })
], HousingIdentityModule);
//# sourceMappingURL=housing-identity.module.js.map