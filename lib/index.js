"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const installer_1 = require("./installer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const parser_1 = require("./utils/parser");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const range = core.getInput('version', { required: true });
            let version = yield (0, installer_1.installCompiler)(range);
            core.setOutput('version', version);
            const versionFile = core.getInput('version-file', { required: false });
            const defineName = core.getInput('define-name', { required: false });
            if (versionFile !== "") {
                const versionFilePath = path.join(__dirname, versionFile);
                if (!fs.existsSync(versionFilePath)) {
                    core.error("The path of the file containing the version is incorrect.");
                    return;
                }
                let parsedVersion = (0, parser_1.parseFile)(versionFilePath, defineName);
                core.setOutput('plugin-version', parsedVersion);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
