export type SetupProps = {
    googleApi: GoogleApiConfig;
}
export type ColumnValue = {
    [key: string]: string;
}
export type Column = {
    position: number;
    name: string;
}

export type SheetDataReq = {
    sheetName: string;
    sheetRange: string;
    googleFileId: string;
    columns: Column[];
    algoritm?: 'reduce' | 'for' | 'reverse-for' | 'filter' | 'find' | 'findIndex';
}
export type GetDataResponseProps = {
    data: ColumnValue[];
    error?: string;
    rawData: string[][];
}
export type GetElementResponseProps = {
    data: ColumnValue;
    error?: string;
    rawData: string[];
}
export type GoogleApiConfig = {
    /**
     * The root folder for the Google API.
     */
    rootFolder?: string,
    /**
     * The file name for the Google API.
     */
    fileName?: string,
   
}

