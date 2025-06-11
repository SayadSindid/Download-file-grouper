import path from 'node:path';

// Dynamic key type necessary otherwise IDE error
type generalObjectType = {
	[key: string]: string | number;
};

// Type for config data
type objectCacheData = {
	"grouperFolderLink": string,
	"PID": number,
	[key: string]: string | number,
}

// match every string with a dot in the name w/o it being at the first index
const regexFileExtension = /^[^.]+\.(.+)$/;

const pathConfigFile = `${process.cwd()}${path.sep}config_filewatcher.json`;


function getFileExtension(fileName: string) {
	if (regexFileExtension.test(fileName)) {
		return fileName.match(regexFileExtension)![1];
	} else {
		return false;
	}
}

function handlingUnrecognizedError(error: unknown) {
    console.log(error);
    console.log("Unregistered Error, exiting the program.");
    process.exit(1);
}


export { regexFileExtension, getFileExtension, handlingUnrecognizedError, pathConfigFile };
export type { generalObjectType, objectCacheData };