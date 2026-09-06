import { find as findCache, downloadTool, extractTar, extractZip, cacheDir } from '@actions/tool-cache';
import { addPath, exportVariable, getBooleanInput } from '@actions/core';
import { maxSatisfying } from 'semver';
import { existsSync } from 'fs';
import { copyFile, rename, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';
import { getVersions } from './utils/scraper';
import { Version } from './structures/versioning';

const CACHE_KEY = 'sourcepawn';
const OLD_SPCOMP_CACHE_KEY = `${CACHE_KEY}-oldspcomp`;
let versions: { [x: string]: Version | { toEndpoint: () => string; }; };

export async function installCompiler(range: string): Promise<string> {
    versions = await getVersions();

    let version = maxSatisfying(Object.keys(versions), range);

    if (version === null) {
        throw new Error(`Unable to find a version matching ${range}`);
    }

    const useOldSpcomp = getBooleanInput('use-old-spcomp', { required: false });
    const noSpcompProxy = (
        getBooleanInput('no-spcomp-proxy', { required: false })
        || Boolean(process.env.NO_SPCOMP_PROXY)
    );
    const compilerCacheKey = useOldSpcomp ? OLD_SPCOMP_CACHE_KEY : CACHE_KEY;
    const cacheKey = noSpcompProxy ? `${compilerCacheKey}-no-proxy` : compilerCacheKey;
    let cache = findCache(cacheKey, version);

    if (!cache) {
        cache = await downloadCompiler(version, cacheKey, useOldSpcomp);
    }

    // Workaround for https://github.com/rumblefrog/setup-sp/issues/5
    // We use a proxy script to call the original spcomp64 and include the path to the compiler
    if (
        !noSpcompProxy &&
        process.platform == 'linux' && !existsSync(pathJoin(cache, 'spcomp64_original'))
    ) {
        await rename(pathJoin(cache, 'spcomp64'), pathJoin(cache, 'spcomp64_original'));
        await rename(pathJoin(cache, 'spcomp'), pathJoin(cache, 'spcomp_original'));

        // SECURITY-REVIEW: Shell arguments derived from the runner cache path are escaped.
        const proxyScript = `#!/bin/bash
exec ${quoteShellArgument(pathJoin(cache, 'spcomp64_original'))} ${quoteShellArgument(`-i${pathJoin(cache, 'include')}`)} "$@"
`;

        await writeFile(pathJoin(cache, 'spcomp'), proxyScript, { mode: 0o755 });
        await writeFile(pathJoin(cache, 'spcomp64'), proxyScript, { mode: 0o755 });
    }

    addPath(cache);
    exportVariable('scriptingPath', pathJoin(cache));
    exportVariable('includePath', pathJoin(cache, 'include'));

    return version;
}

async function downloadCompiler(version: string, cacheKey: string, useOldSpcomp: boolean) {
    const spPath = await downloadTool(versions[version].toEndpoint());
    
    let extracted: string;

    if (process.platform === 'linux') {
        extracted = await extractTar(spPath);
    } else {
        extracted = await extractZip(spPath);
    }

    const spRoot = pathJoin(extracted, 'addons', 'sourcemod', 'scripting');

    if (useOldSpcomp) {
        await exposeOldSpcomp(spRoot, version);
    }

    return await cacheDir(spRoot, cacheKey, version);
}

async function exposeOldSpcomp(spRoot: string, version: string): Promise<void> {
    const executableExtension = process.platform === 'win32' ? '.exe' : '';

    await replaceCompiler(spRoot, 'spcomp', executableExtension, version);
    await replaceCompiler(spRoot, 'spcomp64', executableExtension, version);
}

async function replaceCompiler(
    spRoot: string,
    compilerName: string,
    executableExtension: string,
    version: string,
): Promise<void> {
    const compilerPath = pathJoin(spRoot, `${compilerName}${executableExtension}`);
    const oldCompilerPath = pathJoin(spRoot, `old${compilerName}${executableExtension}`);

    if (!existsSync(oldCompilerPath)) {
        throw new Error(
            `SourceMod ${version} does not include old${compilerName}${executableExtension}`,
        );
    }

    if (!existsSync(compilerPath)) {
        throw new Error(`SourceMod ${version} does not include ${compilerName}${executableExtension}`);
    }

    const sourcePawn2CompilerPath = pathJoin(
        spRoot,
        `${compilerName}-sourcepawn2${executableExtension}`,
    );

    await rename(compilerPath, sourcePawn2CompilerPath);
    await copyFile(oldCompilerPath, compilerPath);
}

function quoteShellArgument(argument: string): string {
    return `'${argument.replace(/'/g, `'\\''`)}'`;
}
