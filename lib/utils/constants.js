"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILD_REGEX = exports.MM_REGEX = exports.ENDPOINT = void 0;
exports.ENDPOINT = 'https://www.amxmodx.org/amxxdrop';
exports.MM_REGEX = /href="(.*?)"/g;
exports.BUILD_REGEX = /href="amxmodx-[0-9]+.[0-9]+.[0-9]+-git([0-9]+)-base-(linux|windows|mac).(.*?)"/g;
