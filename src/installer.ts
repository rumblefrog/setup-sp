import { find as findCache, downloadTool, extractTar, extractZip, cacheDir } from '@actions/tool-cache';
import { addPath, debug } from '@actions/core';
import { maxSatisfying } from 'semver';
import { join as pathJoin } from 'path';
import { getVersions } from './scraper';

let versions;

export async function installCompiler(range: string): Promise<string> {
    versions = await getVersions();

    let version = maxSatisfying(Object.keys(versions), range);

    if (version === null) {
        throw new Error(`Unable to find a version matching ${range}`);
    }

    let cache = findCache('sourcepawn', version);

    if (!cache) {
        cache = await downloadCompiler(version);
    }

    debug(`${cache} was added to path`);

    addPath(cache);

    return version;
}

async function downloadCompiler(version: string) {
    const spPath = await downloadTool(versions[version].toEndpoint());

    debug(`${versions[version].toEndpoint()} was downloaded`);
    
    let extracted;

    if (process.platform === 'linux') {
        extracted = await extractTar(spPath);
    } else {
        extracted = await extractZip(spPath);
    }

    let spRoot = pathJoin(extracted, 'addons', 'sourcemod', 'scripting');

    debug(`${spRoot} was added to tool cache`);

    return await cacheDir(spRoot, 'sourcepawn', version);
}