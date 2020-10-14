"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILD_REGEX = exports.MM_REGEX = exports.ENDPOINT = void 0;
exports.ENDPOINT = 'https://www.sourcemod.net/smdrop';
exports.MM_REGEX = /href="(.*?)"/g;
exports.BUILD_REGEX = /href="sourcemod-[0-9]+.[0-9]+.[0-9]+-git([0-9]+)-(linux|windows|mac).(.*?)"/g;
