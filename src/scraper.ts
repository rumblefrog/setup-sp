import { ENDPOINT, MM_REGEX, BUILD_REGEX } from './constants';
import { Platform, Version, Versions, parsePlatform } from './structures/versioning';
import { default as axios } from 'axios';
import to from 'await-to-js';

export async function getVersions(): Promise<Versions> {
    let res, err;

    [ err, res ] = await to(axios.get(ENDPOINT));

    let versions: Versions = {};

    if (err) {
        return versions;
    }

    let match, promises: Promise<void>[] = [];

    while ((match = MM_REGEX.exec(res.data)) !== null) {
        match[1] = match[1].replace('/', '');

        if (match[1].length <= 0) {
            continue;
        }

        let split = match[1].split('.');

        promises.push(getBuilds(
            `${ENDPOINT}/${match[1]}`,
            versions,
            split[0],
            split[1],
        ));
    }

    await Promise.all(promises);

    return versions;
}

async function getBuilds(endpoint: string, versions: Versions, major: number, minor: number) {
    let err, res;

    [ err, res ] = await to(axios.get(endpoint));

    if (err) {
        throw new Error(`Failed to pull builds from ${endpoint}`);
    }

    let match;

    while ((match = BUILD_REGEX.exec(res.data)) !== null) {
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
