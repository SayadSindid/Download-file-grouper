import path from 'node:path';
import * as fs from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync } from 'node:fs';


console.log("Starting...");

type linkType = string;


async function promptDownloadFolder(retriesCounter: number = 0) {
    let newLink:linkType = "";
    
    // New class thingy to manipulate Input/Output
    const rl = readline.createInterface({ input, output });
    try {
        // Prompting the user
        newLink = await rl.question("Download folder location: ");
        // Removing any white space
        newLink = newLink.trim();
        // Must include either / or \ (handling linux and windows path)
        if (!newLink.includes("/") && !newLink.includes("\\")) {
            throw new Error("Incorrect download folder link. Please re-type your download folder location");
        } else {
            rl.close();
            return newLink;
        }
    } catch (error: unknown) {
        // Type Guard error, No idea if it's best practice
        if (error instanceof Error) {
            // Handle Ctrl+C handling to stop the prompting
            // Note : I don't know if it's a correct approach to get the abort info from the error.message
            // Add a max retries handling at 40 to not overflow the stack
            if (error.message === "Aborted with Ctrl+C") {
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
            rl.close();
            // Recursively call the prompting function
            return await promptDownloadFolder(retriesCounter + 1);
        } else {
            // Handling unregistered Error
            console.log(error);
            console.log("Unregistered Error, exiting the program.");
            process.exit();
        }
    }
}

const downloadFolderLink: linkType = await promptDownloadFolder();

async function readDirectory(folderLink: linkType) {
        
    try {
        let files: Array<string> = await fs.readdir(folderLink)
        console.log(files);
        return files;
    } catch (error) {
        if (error instanceof Error) {
            // TODO: Need proper message error handling
            console.log(error.message);
            process.exit();
        } else {
            // Handling unregistered Error
            console.log(error);
            console.log("Unregistered Error, exiting the program.");
            process.exit();
        }
    }
}

const directoryContentDownloadFolder: Array<string> = await readDirectory(downloadFolderLink);


async function createNewFolders(folderLink: string) {
    // Data = XML, JSON, YAML ect..
    // Subtitles = Ass, Srt ect...
    // Executable = bat, exe, sh, wsf ect..
    // Text = pdf, txt, doc, odt ect...
    const folderList = ["Pictures", "Sounds", "Data", "Compressed", "Subtitles", "Executable", "Font", "Video", "Text"]


    // Create all directory
    console.log("Creating directory...");
    for (let i = 0; i < folderList.length; i++) {
        if (existsSync(`${folderLink}/${folderList[i]}`)) {
            await fs.mkdir(folderList[i]);
        } else {
            continue;
        }
    }
    console.log("All directory have been created.");
    
}






console.log("Closing...");
