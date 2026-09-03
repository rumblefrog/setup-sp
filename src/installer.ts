import { find as findCache, downloadTool, extractTar, extractZip, cacheDir } from '@actions/tool-cache';
import { addPath, exportVariable, getBooleanInput } from '@actions/core';
import { maxSatisfying } from 'semver';
import { existsSync } from 'fs';
import { rename, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';
import { getVersions } from './utils/scraper';
import { Version } from './structures/versioning';

const CACHE_KEY = 'sourcepawn';
let versions: { [x: string]: Version | { toEndpoint: () => string; }; };

export async function installCompiler(range: string): Promise<string> {
    versions = await getVersions();

    let version = maxSatisfying(Object.keys(versions), range);

    if (version === null) {
        throw new Error(`Unable to find a version matching ${range}`);
    }

    let cache = findCache(CACHE_KEY, version);

    if (!cache) {
        cache = await downloadCompiler(version);
    }

    await useOldCompilerIfNeeded(cache, version);

    // Workaround for https://github.com/rumblefrog/setup-sp/issues/5
    // We use a proxy script to call the original spcomp64 and include the path to the compiler
    if (
        !(
            getBooleanInput('no-spcomp-proxy', { required: false })
            || process.env.NO_SPCOMP_PROXY
        ) &&
        process.platform == 'linux' && !existsSync(pathJoin(cache, 'spcomp64_original'))
    ) {
        await rename(pathJoin(cache, 'spcomp64'), pathJoin(cache, 'spcomp64_original'));
        await rename(pathJoin(cache, 'spcomp'), pathJoin(cache, 'spcomp_original'));

        const proxy_script = `
        #!/bin/bash
        ${pathJoin(cache, 'spcomp64_original')} -i${pathJoin(cache, 'include')} $@
        `;

        await writeFile(pathJoin(cache, 'spcomp'), proxy_script, { mode: 0o755 });
        await writeFile(pathJoin(cache, 'spcomp64'), proxy_script, { mode: 0o755 });
    }

    addPath(cache);
    exportVariable('scriptingPath', pathJoin(cache));
    exportVariable('includePath', pathJoin(cache, 'include'));

    return version;
}

async function useOldCompilerIfNeeded(cache: string, version: string): Promise<void> {
    if (!isSourceMod113Build7451OrLater(version)) {
        return;
    }

    await replaceCompiler(cache, 'spcomp', 'oldspcomp');
    await replaceCompiler(cache, 'spcomp64', 'oldspcomp64');
}

async function replaceCompiler(cache: string, currentCompiler: string, oldCompiler: string): Promise<void> {
    const oldCompilerPath = pathJoin(cache, oldCompiler);
    const currentCompilerPath = pathJoin(cache, currentCompiler);
    const sourcePawn2CompilerPath = pathJoin(cache, `${currentCompiler}_sourcepawn2`);

    if (!existsSync(oldCompilerPath) || !existsSync(currentCompilerPath)) {
        return;
    }

    if (!existsSync(sourcePawn2CompilerPath)) {
        await rename(currentCompilerPath, sourcePawn2CompilerPath);
    }

    await rename(oldCompilerPath, currentCompilerPath);
}

function isSourceMod113Build7451OrLater(version: string): boolean {
    const [major, minor, build] = version.split('.').map(Number);

    return major === 1 && minor === 13 && build >= 7451;
}

async function downloadCompiler(version: string) {
    const spPath = await downloadTool(versions[version].toEndpoint());
    
    let extracted: string;

    if (process.platform === 'linux') {
        extracted = await extractTar(spPath);
    } else {
        extracted = await extractZip(spPath);
    }

    const spRoot = pathJoin(extracted, 'addons', 'sourcemod', 'scripting');

    return await cacheDir(spRoot, CACHE_KEY, version);
}