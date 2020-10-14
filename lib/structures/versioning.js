"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = exports.parsePlatform = exports.Platform = void 0;
const constants_1 = require("../utils/constants");
var Platform;
(function (Platform) {
    Platform["Linux"] = "linux";
    Platform["Windows"] = "windows";
    Platform["Mac"] = "mac";
    Platform["Unknown"] = "unknown";
})(Platform = exports.Platform || (exports.Platform = {}));
function parsePlatform(plat) {
    switch (plat) {
        case 'linux':
            return Platform.Linux;
        case 'windows':
            return Platform.Windows;
        case 'mac':
            return Platform.Mac;
        default:
            return Platform.Unknown;
    }
}
exports.parsePlatform = parsePlatform;
class Version {
    constructor(major, minor, build, platform, archiveExt) {
        this.major = major;
        this.minor = minor;
        this.build = build;
        this.platform = platform;
        this.archiveExt = archiveExt;
    }
    toString() {
        return `${this.major}.${this.minor}.${this.build}`;
    }
    toEndpoint() {
        return `${constants_1.ENDPOINT}/${this.major}.${this.minor}/sourcemod-${this.major}.${this.minor}.0-git${this.build}-${this.platform}.${this.archiveExt}`;
    }
}
exports.Version = Version;
