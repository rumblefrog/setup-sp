import { find as findCache, downloadTool, extractTar, extractZip, cacheDir } from '@actions/tool-cache';
import { addPath, exportVariable } from '@actions/core';
import { maxSatisfying } from 'semver';
import { join as pathJoin } from 'path';
import { getVersions } from './utils/scraper';

let versions;

export async function installCompiler(range: string): Promise<string> {
    versions = await getVersions();

    let version = maxSatisfying(Object.keys(versions), range);

    if (version === null) {
        throw new Error(`Unable to find a version matching ${range}`);
    }

    let cache = findCache('amxxpawn', version);

    if (!cache) {
        cache = await downloadCompiler(version);
    }

    addPath(cache);
    exportVariable('includePath', pathJoin(cache, 'include'));

    return version;
}

async function downloadCompiler(version: string) {
    const spPath = await downloadTool(versions[version].toEndpoint());
    
    let extracted;

    if (process.platform === 'linux') {
        extracted = await extractTar(spPath);
    } else {
        extracted = await extractZip(spPath);
    }

    let spRoot = pathJoin(extracted, 'addons', 'amxmodx', 'scripting');

    return await cacheDir(spRoot, 'amxxpawn', version);
}