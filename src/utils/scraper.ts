import { ENDPOINT, MM_REGEX, BUILD_REGEX, GITHUB_RELEASES_ENDPOINT, GITHUB_ASSET_REGEX } from './constants';
import { Platform, Version, GithubVersion, Versions, parsePlatform } from '../structures/versioning';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { BearerCredentialHandler } from 'typed-rest-client/Handlers';
import to from 'await-to-js';
import { warning, getInput } from '@actions/core';

const client = new HttpClient('setup-sp');

function getGithubClient(): HttpClient {
    const token = getInput('github-token') || process.env.GITHUB_TOKEN;
    if (token) {
        return new HttpClient('setup-sp', [new BearerCredentialHandler(token)]);
    }
    return new HttpClient('setup-sp');
}

export async function getVersions(): Promise<Versions> {
    const results = await Promise.allSettled([
        getSmDropVersions(),
        getGithubVersions(),
    ]);

    let versions: Versions = {};

    if (results[0].status === 'fulfilled') {
        Object.assign(versions, results[0].value);
    } else {
        warning(`Failed to fetch versions from smdrop: ${results[0].reason}`);
    }

    if (results[1].status === 'fulfilled') {
        // GitHub releases take precedence over smdrop for overlapping builds
        Object.assign(versions, results[1].value);
    } else {
        warning(`Failed to fetch versions from GitHub releases: ${results[1].reason}`);
    }

    if (Object.keys(versions).length === 0) {
        throw new Error('Failed to fetch SourceMod versions from all sources');
    }

    return versions;
}

async function getSmDropVersions(): Promise<Versions> {
    const [ err, res ] = await to(client.get(ENDPOINT));

    if (err || !res || res.message.statusCode !== 200) {
        throw new Error(`Failed to pull major minor versions from ${ENDPOINT}`);
    }

    let versions: Versions = {};

    const body = await res.readBody();

    let match, promises: Promise<void>[] = [];

    while ((match = MM_REGEX.exec(body)) !== null) {
        match[1] = match[1].replace('/', '');

        if (match[1].length <= 0) {
            continue;
        }

        let split = match[1].split('.');

        promises.push(getBuilds(
            `${ENDPOINT}/${match[1]}/`,
            versions,
            split[0],
            split[1],
        ));
    }

    await Promise.all(promises);

    return versions;
}

async function getGithubVersions(): Promise<Versions> {
    const githubClient = getGithubClient();
    let versions: Versions = {};
    let page = 1;
    const perPage = 100;

    while (true) {
        const url = `${GITHUB_RELEASES_ENDPOINT}?per_page=${perPage}&page=${page}`;
        const [err, res] = await to(githubClient.get(url));

        if (err || !res || res.message.statusCode !== 200) {
            if (page === 1) {
                throw new Error(`Failed to fetch releases from GitHub: ${err?.message ?? res?.message.statusCode}`);
            }
            break;
        }

        const body = await res.readBody();
        const releases: any[] = JSON.parse(body);

        if (!releases || releases.length === 0) {
            break;
        }

        for (const release of releases) {
            if (!release.tag_name) continue;

            // Tag format: "1.13.0.7316"
            const tagParts = release.tag_name.split('.');
            if (tagParts.length !== 4) continue;

            const major = parseInt(tagParts[0]);
            const minor = parseInt(tagParts[1]);
            const build = parseInt(tagParts[3]);

            if (isNaN(major) || isNaN(minor) || isNaN(build)) continue;

            for (const asset of release.assets as any[]) {
                const match = GITHUB_ASSET_REGEX.exec(asset.name);
                if (!match) continue;

                const platform = parsePlatform(match[2]);

                if (process.platform === 'win32' && platform !== Platform.Windows) continue;
                if (process.platform === 'darwin' && platform !== Platform.Mac) continue;
                if (process.platform === 'linux' && platform !== Platform.Linux) continue;

                const v = new GithubVersion(major, minor, build, platform, match[3], asset.browser_download_url);
                versions[v.toString()] = v;
            }
        }

        if (releases.length < perPage) {
            break;
        }

        page++;
    }

    return versions;
}

async function getBuilds(endpoint: string, versions: Versions, major: number, minor: number) {
    const [ err, res ] = await to(client.get(endpoint));

    if (err || !res || res.message.statusCode !== 200) {
        throw new Error(`Failed to pull builds from ${endpoint}`);
    }

    const body = await res.readBody();

    let match;

    while ((match = BUILD_REGEX.exec(body)) !== null) {
        let platform: Platform = parsePlatform(match[2]);

        if (process.platform == 'win32' && platform != Platform.Windows) {
            continue;
        }

        if (process.platform == 'darwin' && platform != Platform.Mac) {
            continue;
        }

        if (process.platform == 'linux' && platform != Platform.Linux) {
            continue;
        }

        let v = new Version(
            major,
            minor,
            match[1],
            platform,
            match[3],
        );

        versions[v.toString()] = v;
    }
}
