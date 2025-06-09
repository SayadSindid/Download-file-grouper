import { getFileExtension } from "./utils.js";
import type { processedObjectType } from "./utils.js";
import * as fs from 'node:fs';
import path from 'node:path';

interface message {
    grouperFolderLink: string;
    ProcessedFolder: processedObjectType;
}

process.title = "fileGrouperWatcher_Script"

// Message to close the parent process after we established the child
process.send!("close");

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
                    // Implement logging loging here
                    // console.log(`${grouperFolderLink}${path.sep}${fileNameWatched} -> ${grouperFolderLink}${path.sep}${targetFolder}${path.sep}${fileNameWatched}`);
                }    
            }
        } else {
            // console.log('filename not provided');
        }
    }); 

})

