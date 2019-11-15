import * as core from '@actions/core';
import { installCompiler } from './installer';

async function run() {
    try {
        const range = core.getInput('version');

        let version = await installCompiler(range);
        core.setOutput('version', version);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
