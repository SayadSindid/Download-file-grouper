

// Dynamic key type necessary otherwise IDE error
type processedObjectType = {
	[key: string]: string;
};

// match every string with a dot in the name w/o it being at the first index
const regexFileExtension = /^[^.]+\.(.+)$/;

function getFileExtension(fileName: string) {
	if (regexFileExtension.test(fileName)) {
		return fileName.match(regexFileExtension)![1];
	} else {
		return false;
	}
}

export { regexFileExtension, getFileExtension };
export type { processedObjectType };