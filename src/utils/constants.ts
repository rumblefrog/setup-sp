export const ENDPOINT: string = 'https://www.sourcemod.net/smdrop/';
export const MM_REGEX: RegExp = /href="(.*?)"/g;
export const BUILD_REGEX: RegExp = /href="sourcemod-[0-9]+.[0-9]+.[0-9]+-git([0-9]+)-(linux|windows|mac).(.*?)"/g;
export const GITHUB_RELEASES_ENDPOINT: string = 'https://api.github.com/repos/alliedmodders/sourcemod/releases';
export const GITHUB_ASSET_REGEX: RegExp = /^sourcemod-\d+\.\d+\.\d+-git(\d+)-(linux|windows|mac)\.(tar\.gz|zip)$/;
