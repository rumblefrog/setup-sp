import { ENDPOINT, MM_REGEX, BUILD_REGEX } from './constants';
import { Platform, Version, Versions, parsePlatform } from '../structures/versioning';
import { HttpClient } from 'typed-rest-client/HttpClient';
import to from 'await-to-js';

const client = new HttpClient('setup-sp');

export async function getVersions(): Promise<Versions> {
    const [ err, res ] = await to(client.get(ENDPOINT));

    if (err || !res || res.message.statusCode !== 200) {
        console.log(err, res);
        throw new Error(`Failed to pull major minor versions from ${ENDPOINT}`);
    }

    let versions: Versions = {};

    if (err) {
        return versions;
    }

    const body = await res.readBody();

    let match, promises: Promise<void>[] = [];

    while ((match = MM_REGEX.exec(body)) !== null) {
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
