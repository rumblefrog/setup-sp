"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
var Platform;
(function (Platform) {
    Platform[Platform["Linux"] = 0] = "Linux";
    Platform[Platform["Windows"] = 1] = "Windows";
    Platform[Platform["Mac"] = 2] = "Mac";
    Platform[Platform["Unknown"] = 3] = "Unknown";
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
