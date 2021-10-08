"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCompiler = void 0;
const tool_cache_1 = require("@actions/tool-cache");
const core_1 = require("@actions/core");
const semver_1 = require("semver");
const path_1 = require("path");
const scraper_1 = require("./utils/scraper");
let versions;
function installCompiler(range) {
    return __awaiter(this, void 0, void 0, function* () {
        versions = yield (0, scraper_1.getVersions)();
        let version = (0, semver_1.maxSatisfying)(Object.keys(versions), range);
        if (version === null) {
            throw new Error(`Unable to find a version matching ${range}`);
        }
        let cache = (0, tool_cache_1.find)('sourcepawn', version);
        if (!cache) {
            cache = yield downloadCompiler(version);
        }
        (0, core_1.addPath)(cache);
        (0, core_1.exportVariable)('includePath', (0, path_1.join)(cache, 'include'));
        return version;
    });
}
exports.installCompiler = installCompiler;
function downloadCompiler(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const spPath = yield (0, tool_cache_1.downloadTool)(versions[version].toEndpoint());
        let extracted;
        if (process.platform === 'linux') {
            extracted = yield (0, tool_cache_1.extractTar)(spPath);
        }
        else {
            extracted = yield (0, tool_cache_1.extractZip)(spPath);
        }
        let spRoot = (0, path_1.join)(extracted, 'addons', 'sourcemod', 'scripting');
        return yield (0, tool_cache_1.cacheDir)(spRoot, 'sourcepawn', version);
    });
}
