import * as fs from 'node:fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';


console.log("Starting...");

type linkType = string;

// Dynamic key type necessary otherwise IDE error
type processedObjectType = {
    [key: string]: string;
};

// New class thingy to manipulate Input/Output
const rl = readline.createInterface({ input, output });

// y or n
const validationRegex = /[y, n]/mi;

// match every string with a dot in the name w/o it being at the first index
const regexFileExtension = /^[^.]+\.(.+)$/;

const folderExtension = {
    "Pictures": ["jpg", "jpeg", "png", "bmp", "wepb", "svg", "ico", "psd", "ai", "eps"],
    "Sounds": ["mid", "midi", "mp3", "ogg", "wav", "flac", "aac", "ogg", "m4a", "opus"],
    "Data": ["csv", "json", "xml", "yaml", "sql", "db", "sqlite", "xls", "xlsx", "ods", "mdb", "dat"],
    "Compressed": ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tar.gz", "tar.bz2"],
    "Subtitles": ["srt", "ass", "ssa", "vtt", "sub"],
    "Executable": ["exe", "msi", "app", "deb", "bin", "bat", "sh", "cmd", "rpm", "wsf"],
    "Font": ["ttf", "otf", "woff", "woff2", "eot", "fon"],
    "Video": ["gif", "mkv", "mp4", "avi", "mov", "wmv", "flv", "webm", "m4v", "3gp"],
    "Text": ["txt", "rtf", "doc", "docx", "odt", "tex", "md", "rst", "log", "pdf"],
}

// Data structure transformaton
const ProcessedFolder = processedFolderExtension();


function processedFolderExtension() {
    let newFolderExtension: processedObjectType = {};

    for (const [key, value] of Object.entries(folderExtension)) {
        for (let i = 0; i < value.length; i++) {
            Object.assign(newFolderExtension, {[value[i]]: key});
        }
    }

    return newFolderExtension;
}


async function promptingToUser(message: string, assertionCallback: (errorMessage: string) => boolean | Error, retriesCounter: number = 0) {
    let userResponse:linkType = "";
    
    try {
        // Prompting the user
        userResponse = await rl.question(message);
        // Removing any white space
        userResponse = userResponse.trim();

        let callbackResponse = assertionCallback(userResponse)

        if (callbackResponse === true) {
            return userResponse;
        } else {
            throw callbackResponse;
        }

    } catch (error: unknown) {
        // Type Guard error
        if (error instanceof Error) {
            // Handle Ctrl+C/Abort handling to stop the prompting
            // Add a max retries handling at 40 to not overflow the stack
            if (error.name === "AbortError") {
                // Close the interface
                rl.close();
                // Exiting the program
                process.exit();
            }

            if (retriesCounter === 40) {
                rl.close();
                console.log("Too many retries.");
                process.exit();
            }
            
            console.log(error.message);
            // Recursively call the prompting function
            // The callback is re-called and re-asigned anyway
            return await promptingToUser(message, assertionCallback, retriesCounter + 1);
        } else {
            // Handling unregistered Error
            console.log(error);
            console.log("Unregistered Error, exiting the program.");
            process.exit();
        }
    }
}

async function promptDownloadFolder() {

    // The callback manage the validation condition and the error throwing
    return await promptingToUser("Download folder location:", function(userMessage: string) {
        // Must include either / or \ (handling linux and windows path)
        if (!userMessage.includes("/") && !userMessage.includes("\\")) {
            return new Error("Incorrect download folder link. Please re-type your download folder location");
        } else {
            return true;
        }
    })

}

async function promptFolderChoice() {

    let folderList = ["Pictures", "Sounds", "Data", "Compressed", "Subtitles", "Executable", "Font", "Video", "Text"];
    let value: string;

    for (let i = 0; i < folderList.length; i++) {
        value = await promptingToUser(`Create ${folderList[i]} folder? (y/n)`, function(userMessage: string) {
            // Must include either y or n
            if (!userMessage.toLowerCase().match(validationRegex)) {
                return new Error("Incorrect input. Please type either y or n");
            } else {
                return true;
            }
        })

        if (value === "y") {
            // TODO: Add message "This folder will be created" or nothing
            console.log("gg");
        } else {
            // Note to self: The index need to be decremanted because
            // everything is shifted to the left when splicing an element.
            folderList.splice(i, 1);
            i--;
        }
    }

    return folderList.length === 0 ? false : folderList;
}

function createNewFolders(grouperFolder: string, folders: Array<string>) {

    // Create all directory
    console.log("Creating directories...");
    for (let i = 0; i < folders.length; i++) {
        if (!fs.existsSync(`${grouperFolder}/${folders[i]}`)) {
            fs.mkdirSync(`${grouperFolder}/${folders[i]}`);
            console.log(`Created ${folders[i]} folder.`);
        } else {
            console.log(`${folders[i]} folder already exist.`);
            continue;
        }
    }
    console.log("All directory have been created.");
    
}

async function promptSortExistingFile(folderLink: string) {

    let count: number = 0;
    
        let value = await promptingToUser("Do you want to classify all the existing files in the folders you created? (y/n)",function(userMessage: string) {
            // Must include either y or n
            if (!userMessage.toLowerCase().match(validationRegex)) {
                return new Error("Incorrect input. Please type either y or n");
            } else {
                return true;
            }
        })

        const filesGrouperFolder = fs.readdirSync(folderLink).filter((x) => x.match(regexFileExtension));

        if (value === "y") {
            for (let i = 0; i < filesGrouperFolder.length; i++) {
                let fileName = filesGrouperFolder[i];
                let extractedExtension = getFileExtension(fileName);
                if (!extractedExtension) {
                    continue;
                } else {
                    // Verify if the extension exist in the object
                    if (ProcessedFolder[ extractedExtension ]) {
                        let folderToMoveTo = ProcessedFolder[extractedExtension];
                        fs.renameSync(`${folderLink}${path.sep}${fileName}`, `${folderLink}${path.sep}${folderToMoveTo}${path.sep}${fileName}`)
                        console.log(`${folderLink}${path.sep}${fileName} -> ${folderLink}${path.sep}${folderToMoveTo}${path.sep}${fileName}`);
                        count++
                    } else {
                        continue;
                    }
                }
            }
            console.log(`${count} files has been moved.`);
            return null;
        } else {
            return null;
        }

}

function getFileExtension(fileName: string) {

    if (regexFileExtension.test(fileName)) {
        return fileName.match(regexFileExtension)![1]
    } else {
        return false;
    }

}

const grouperFolderLink: linkType = await promptDownloadFolder();
const userNewFolders = await promptFolderChoice();

if (!userNewFolders) {
    console.log("No new folders will be created.");
} else {
    createNewFolders(grouperFolderLink, userNewFolders);
    await promptSortExistingFile(grouperFolderLink);
}

rl.close()

fs.watch(grouperFolderLink, (eventType, fileNameWatched) => {
    console.log(`event type is: ${eventType}`);
    if (fileNameWatched) {
        console.log(`filename provided: ${fileNameWatched}`);
        let fileExtensionWatched = getFileExtension(fileNameWatched);
        // Check if the file exist
        // Check if the regex returned something
        // Check if the fileExtension is among the one we manage
        if (fs.existsSync(`${grouperFolderLink}${path.sep}${fileNameWatched}`) && fileExtensionWatched && ProcessedFolder[fileExtensionWatched]) {
            // TODO: Implement check if the folder we are trying to move is actually created and have been selected by the user. prob just make a fs.exists(targetfolder)
            let targetFolder = ProcessedFolder[fileExtensionWatched];
            fs.renameSync(`${grouperFolderLink}${path.sep}${fileNameWatched}`, `${grouperFolderLink}${path.sep}${targetFolder}${path.sep}${fileNameWatched}`)
        }
    } else {
        console.log('filename not provided');
    }
}); 



console.log("Closing...");
