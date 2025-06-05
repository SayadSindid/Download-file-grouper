import * as fs from 'node:fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';


console.log("Starting...");

type linkType = string;

// New class thingy to manipulate Input/Output
const rl = readline.createInterface({ input, output });


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

    // Data = XML, JSON, YAML ect..
    // Subtitles = Ass, Srt ect...
    // Executable = bat, exe, sh, wsf ect..
    // Text = pdf, txt, doc, odt ect...
    let folderList = ["Pictures", "Sounds", "Data", "Compressed", "Subtitles", "Executable", "Font", "Video", "Text"];
    const validationRegex = /[y, n]/mi;
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

    return folderList
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

const grouperFolderLink: linkType = await promptDownloadFolder();
const userNewFolders = await promptFolderChoice();
createNewFolders(grouperFolderLink, userNewFolders);
rl.close()

fs.watch(grouperFolderLink, (eventType, filename) => {
    console.log(`event type is: ${eventType}`);
    if (filename) {
        // TODO: Implement a check if either the file exist or not before trying to move it
        // TODO2:Get the extension of the file if it's among the extension I watch move to corresponding folder
        // TODO3: Regine the regex so the dot is not in the resulting string
        console.log(`filename provided: ${filename}`);
        if (filename.match(/\.[0-9a-z]+$/i) !== null) {
            console.log(filename.match(/\.[0-9a-z]+$/i)!.join(""));
        }
    } else {
        console.log('filename not provided');
    }
}); 



console.log("Closing...");
