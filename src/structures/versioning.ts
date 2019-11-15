import { ENDPOINT } from '../constants';

export enum Platform {
    Linux = "linux",
    Windows = "windows",
    Mac = "mac",
    Unknown = "unknown",
}

export function parsePlatform(plat: string): Platform {
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

export type Versions = {
    [key: string]: Version;
}

export class Version {
    protected major: number;
    protected minor: number;
    protected build: number;
    protected platform: Platform;
    protected archiveExt: string;

    constructor(major: number, minor: number, build: number, platform: Platform, archiveExt: string) {
        this.major = major;
        this.minor = minor;
        this.build = build;
        this.platform = platform;
        this.archiveExt = archiveExt;
    }

    public toString(): string {
        return `${this.major}.${this.minor}.${this.build}`;
    }

    public toEndpoint(): string {
        return `${ENDPOINT}/${this.major}.${this.minor}/sourcemod-${this.major}.${this.minor}.0-git${this.build}-${this.platform}.${this.archiveExt}`;
    }
}