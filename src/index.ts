import * as core from '@actions/core';
import { installCompiler } from './installer';
import * as fs from "fs";
import { parseFile } from "./utils/parser";

async function run() {
    try {
        const range = core.getInput('version', { required: true });

        let version = await installCompiler(range);
        core.setOutput('version', version);

        const versionFile = core.getInput('version-file', { required: false });
        const defineName = core.getInput('define-name', { required: false });

        if(versionFile !== "") {
            if(!fs.existsSync(versionFile)) {
                core.error("The path of the file containing the version is incorrect.");
                return;
            }

            let parsedVersion = parseFile(versionFile, defineName);
            core.setOutput('plugin-version', parsedVersion);
        }
    } catch (error: any) {
        core.setFailed(error.message);
    }
}

run();
