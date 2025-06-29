import { getFileExtension } from "./utils.js";
import type { generalObjectType } from "./utils.js";
import * as fs from 'node:fs';
import path from 'node:path';

interface message {
    grouperFolderLink: string;
    ProcessedFolder: generalObjectType;
}

process.title = "fileGrouperWatcher_Script"

// Message to close the parent process after we established the child
process.send!("close");
const pathLogsFile = `${process.cwd()}${path.sep}logs_filewatcher.txt`;
let logsContent: string;


process.on("message", function (message: message) {
    const ProcessedFolder = message.ProcessedFolder;
    const grouperFolderLink = message.grouperFolderLink

    // Background process
    fs.watch(grouperFolderLink, (_, fileNameWatched) => {
        // console.log(`event type is: ${eventType}`);
        if (fileNameWatched) {
            // console.log(`filename provided: ${fileNameWatched}`);
            let fileExtensionWatched = getFileExtension(fileNameWatched);
            // Check if the regex returned something
            if (fileExtensionWatched) {
                let targetFolder = ProcessedFolder[fileExtensionWatched];
                // Check if the file exist
                // Check if the fileExtension is among the one we manage
                // Check if the folder we are trying to move is actually created and have been selected by the user.
                if (fs.existsSync(`${grouperFolderLink}${path.sep}${fileNameWatched}`) && ProcessedFolder[fileExtensionWatched] && fs.existsSync(`${grouperFolderLink}${path.sep}${targetFolder}`)) {
                    fs.renameSync(`${grouperFolderLink}${path.sep}${fileNameWatched}`, `${grouperFolderLink}${path.sep}${targetFolder}${path.sep}${fileNameWatched}`)
                    // logging logic
                    let timeNow = new Date();
                    let timeString: string = `[${timeNow.toLocaleString("en-GB")}]`;
                    logsContent = timeString + ` - ${grouperFolderLink}${path.sep}${fileNameWatched} -> ${grouperFolderLink}${path.sep}${targetFolder}${path.sep}${fileNameWatched}`;
                        try {
                            fs.appendFileSync(pathLogsFile, `${JSON.stringify(logsContent)}\n`);
                        } catch (error) {
                            if (error instanceof Error) {
                                logsContent = timeString + error.message;
                                fs.appendFileSync(pathLogsFile, `${JSON.stringify(logsContent)}\n`);
                                process.exit(1)
                            } else {
                                process.exit(1);
                            }
                        }
                }
            }
        } else {
            // console.log('filename not provided');
        }
    }); 
})

// TODO: CLEANUP config file old PID

