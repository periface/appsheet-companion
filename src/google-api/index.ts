

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import type { GoogleAuth } from "google-auth-library";
import type { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { drive_v3, Auth, sheets_v4, docs_v1 } from "googleapis";
import { join } from "path";
import { Readable } from "stream";
import { Column } from '../types';
import cleanVariableName from '../../lib/variable-generador';
let _auth: GoogleAuth<JSONClient>;
let _credentials: string;
let _debug: boolean | undefined;
let _drive: drive_v3.Drive;
let _sheets: sheets_v4.Sheets;
let _docs: docs_v1.Docs;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
/**
 * Crea la instancia de autenticación de google
 * @returns GoogleAuth<JSONClient>9-8
 */

function authGoogle(credentials: string): GoogleAuth<JSONClient> {
    if (_auth) return _auth;
    const credentialsFile = join(process.cwd(), credentials);
    _auth = new Auth.GoogleAuth({
        keyFile: credentialsFile,
        scopes: SCOPES
    });

    return _auth;
}
function getSheetsInstance() {
    if (_sheets) return _sheets;

    const auth = authGoogle(_credentials);
    const sheets = new sheets_v4.Sheets({ auth: auth });
    _sheets = sheets;
    return _sheets;
}
function getDriveInstance() {
    if (_drive) return _drive;

    const auth = authGoogle(_credentials);
    const drive = new drive_v3.Drive({ auth: auth });
    _drive = drive;
    return drive;
}
function getDocsInstance() {
    if (_docs) return _docs;

    const auth = authGoogle(_credentials);
    const docs = new docs_v1.Docs({ auth: auth });
    _docs = docs;
    return _docs;

}
/**
 * Procesa el buffer del archivo de word y lo sube a google drive
 * @param fileName
 * @param buf
 */
async function readAndUpload(fileName: string, buf: Buffer, mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document", folderId: string) {
    try {
        const auth = authGoogle(_credentials);
        const drive = new drive_v3.Drive({ auth: auth });
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };
        const media = {
            mimeType: mimeType,
            body: Readable.from(buf)
        };
        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id,name",
        });
        if (_debug) {
            console.log("[readAndUpload] File Id: ", file.data.id!);
            console.log("[readAndUpload] file created: ", file);
        }
        return file.data.id!;
    } catch (error) {
        if (_debug) {
            console.log("[readAndUpload] Error");
            console.log(error);
        }
        throw error;
    }
}


async function getGoogleSheetDataAsFlatArray(sheetId: string, range: string): Promise<{
    rows: string[],
    columnsLength: number
    columns: Column[]
}> {
    try {
        const response = await _sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });
        const rows = response.data.values;
        if (!rows) return {
            rows: [],
            columnsLength: 0,
            columns: []
        };
        const columnsLength = rows[0].length;
        const columns = rows[0].map((column, index) => {

            const columnName = cleanVariableName(column);
            return {
                name: columnName,
                position: index
            } as Column;
        })
        // remove first row
        rows.shift();
        if (!rows) return {
            rows: [],
            columnsLength: 0,
            columns: []
        };
        if (rows.length) {
            for (let i = 0; i <= rows.length; i++) {
                const rowValues = rows[i];
                if (!rowValues) continue;
                if (rowValues.length < columnsLength) {
                    const diff = columnsLength - rowValues.length;
                    for (let j = 0; j < diff; j++) {
                        rowValues.push("");
                    }
                }
            }
            return {
                rows: rows.flat(),
                columnsLength: columnsLength || 0,
                columns
            };
        } else {
            return {
                rows: [],
                columnsLength: 0,
                columns: []
            };
        }
    } catch (error) {
        if (_debug) {
            console.log("[getGoogleSheetDataAsFlatArray] ERROR " + sheetId + "rango: " + range);
            console.info(error);
        }
        throw error;
    }

}


/**
 *
 * @param sheetId id de la hoja de google sheets
 * @param range rango de la hoja de google sheets (ejemplo: "CONTRATOS!A2:ZZ1000")
 * @returns array de arrays con los datos de la hoja de google sheets
 */



async function getGoogleSheetData(sheetId: string, range: string): Promise<string[][]> {
    try {
        const response = await _sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });
        const rows = response.data.values;
        if (!rows) return [];
        if (rows.length) {
            return rows as string[][];
        } else {
            return [[]];
        }
    } catch (error) {
        if (_debug) {
            console.log("[getGoogleSheetData] ERROR " + sheetId + "rango: " + range);
            console.info(error);
        }
        throw error;
    }
}

async function findFilesByName(folderId: string, name: string, strict = true): Promise<drive_v3.Schema$File[]> {
    try {
        const response = await _drive.files.list({
            q: `name contains '${name}' and '${folderId}' in parents`,
            fields: "files(*)",
            spaces: "drive",
        });
        if (!response.data.files) return [];
        if (strict) {
            const file = response.data.files.filter(file => file.name === name);
            console.log("file", file);
            return file;
        }
        return response.data.files;
    } catch (error) {
        if (_debug) {
            console.log("[findFilesByName] ERROR " + name + " en carpeta " + folderId);
            console.info(error);
        }
        throw error;
    }
}

async function downloadGoogleDocAsText(docId: string) {
    try {
        const docData = await _docs.documents.get({
            documentId: docId,
            fields: "body/content"
        })

        return docData.data.body;
    } catch (error) {
        if (_debug) {
            console.log("[downloadGoogleDocAsText] Error " + docId);
            console.log(error);
        }
        throw error;
    }
}
/**
 *
 * @param docId id del documento de google docs
 * @returns buffer del documento de google docs
 */
async function downloadGoogleDocAsStream(docId: string) {
    try {
        const response = _drive.files.get({ fileId: docId, supportsTeamDrives: true, supportsAllDrives: true, fields: "webContentLink" });
        const responseData = await response;
        const downloadUrl = responseData.data.webContentLink!;
        const responseAxios = await axios({
            method: "get",
            url: downloadUrl,
            responseType: "stream",
        });
        const buffer = await new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            responseAxios.data
                .on("data", (chunk: Uint8Array) => chunks.push(chunk))
                .on("end", () => resolve(Buffer.concat(chunks)))
                .on("error", reject);


        });
        return buffer as Buffer;
    } catch (error) {
        if (_debug) {
            console.log("[downloadGoogleDocAsStream] Error");
            console.log(error);
        }
        throw error;
    }
}
async function alternativeDownloadAsStream(docId: string) {
    try {
        const res = await _drive.files.get({
            fileId: docId,
            alt: 'media',
        }, { responseType: 'stream' });

        const buffer = await new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            res.data
                .on("data", (chunk: Uint8Array) => chunks.push(chunk))
                .on("end", () => resolve(Buffer.concat(chunks)))
                .on("error", reject);
        });

        return buffer as Buffer;
    } catch (error) {
        if (_debug) {
            console.log("[alternativeDownloadAsStream] Error");
            console.log(error);
        }
        throw error;
    }
}
async function insertGoogleSheetData(docId: string, bookAndRange: string, data: string[][], clear: boolean = false) {
    try {
        if (clear) {
            const clearResponse = await _sheets.spreadsheets.values.clear({
                spreadsheetId: docId,
                range: bookAndRange
            });
            if (_debug) {
                console.log("[insertGoogleSheetData] Clear Response");
                console.log(clearResponse);
            }
        }
        const response = await _sheets.spreadsheets.values.update({
            spreadsheetId: docId,
            range: bookAndRange,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: data
            }
        });
        return response.data;
    } catch (error) {
        if (_debug) {
            console.log("[insertGoogleSheetData] Error");
            console.log(error);
        }
        throw error;
    }
}


async function updateSheetRow(docId: string, book: string, row: number, data: never[]) {
    try {

        const response = await _sheets.spreadsheets.values.update({
            spreadsheetId: docId,
            range: `${book}!A${row}:ZZ${row}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [data]
            }
        });
        return response;
    } catch (error) {
        if (_debug) {
            console.log("[updateSheetRow] Error");
            console.log(error);
        }
        throw error;
    }
}

async function appendGoogleSheetData(docId: string, book: string, data: string[][]) {
    try {
        const response = await _sheets.spreadsheets.values.append({
            spreadsheetId: docId,
            range: `${book}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: data
            }
        });
        return response;
    } catch (error) {
        if (_debug) {
            console.log("[appendGoogleSheetData] Error");
            console.log(error);
        }
        throw error;
    }
}
async function updateSheetRowAtIndex(docId: string, book: string, index: number, data: string[]) {
    try {
        const response = await _sheets.spreadsheets.values.update({
            spreadsheetId: docId,
            range: `${book}!A${index}:ZZ${index}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [data]
            }
        });
        return response;
    } catch (error) {
        if (_debug) {
            console.log("[updateSheetRowAtIndex] Error");
            console.log(error);
        }
        throw error;
    }
}

async function downloadJsonFile(docId: string) {
    try {
        const response = _drive.files.get({ fileId: docId, supportsTeamDrives: true, supportsAllDrives: true, alt: "media" });
        const responseData = (await response).data;



        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return responseData;
    } catch (error) {
        console.log("ERROR", error);
        throw error;
    }
}

export type IGoogleApi = {
    readAndUpload: typeof readAndUpload,
    getGoogleSheetData: typeof getGoogleSheetData,
    downloadGoogleDocAsStream: typeof downloadGoogleDocAsStream,
    insertGoogleSheetData: typeof insertGoogleSheetData,
    downloadGoogleDocAsText: typeof downloadGoogleDocAsText,
    updateSheetRow: typeof updateSheetRow,
    alternativeDownloadAsStream: typeof alternativeDownloadAsStream,
    appendGoogleSheetData: typeof appendGoogleSheetData,
    updateSheetRowAtIndex: typeof updateSheetRowAtIndex,
    downloadJsonFile: typeof downloadJsonFile,
    findFilesByName: typeof findFilesByName,
    getGoogleSheetDataAsFlatArray: typeof getGoogleSheetDataAsFlatArray
}

const GoogleApi = (credentials: string, debug?: boolean): IGoogleApi => {
    _credentials = credentials;
    _debug = debug;
    _auth = authGoogle(credentials);
    _drive = getDriveInstance();
    _sheets = getSheetsInstance();
    _docs = getDocsInstance();
    return {
        getGoogleSheetDataAsFlatArray,
        readAndUpload,
        getGoogleSheetData,
        downloadGoogleDocAsStream,
        insertGoogleSheetData,
        downloadGoogleDocAsText,
        updateSheetRow,
        alternativeDownloadAsStream,
        appendGoogleSheetData,
        updateSheetRowAtIndex,
        downloadJsonFile,
        findFilesByName
    }

}

export default GoogleApi;
