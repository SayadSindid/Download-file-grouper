import * as fs from 'node:fs';
import { pathConfigFile } from "./utils.js";
import type { objectCacheData } from "./utils.js";


if (fs.existsSync(pathConfigFile)) {
    const configObject: objectCacheData = JSON.parse(fs.readFileSync(pathConfigFile, { encoding: "utf-8" }))
    const PID: number = configObject.PID;
    try {
        process.kill(PID, 0);
        process.kill(PID);
    } catch (error) {
        console.log("No watcher.");
    }
} else {
    console.log("ERROR: Couldn't find config file.");
}

process.exit(0)
