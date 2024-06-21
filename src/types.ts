export type SetupProps = {
    credentials: string;
    /*
     * Deprecated
     * */
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
    sheetRange?: string;
    googleFileId: string;
    columns?: Column[];
    onEmptyFieldStringValue?: string;
    totalColumns?: number;
}
export type GetDataResponseProps = {
    data: Set<ColumnValue>;
    error?: string;
    rawData: string[];
    totalRows: number;
    columnSize: number;
    columns: Column[];
}
export type GetDataResponseGenericProps<T> = {
    data: Set<T>;
    error?: string;
    rawData: string[];
    totalRows: number;
    columnSize: number;
    columns: Column[];
}
export type GetElementResponseProps = {
    data: ColumnValue;
    error?: string;
    rawData: string[][];
}
export type GetElementResponseGenericProps<T> = {
    data: T | T[];
    error?: string;
    rawData: string[][];
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
export type GetDataFromTable = {
    (input: SheetDataReq): Promise<GetDataResponseProps>
}
export type UseDataFromTable = {
    response: GetDataResponseProps,
    findByColumnName: (value: string, column: string) => GetElementResponseProps,
}
export type UseDataFromTableMap<T> = {
    response: GetDataResponseGenericProps<T>,
    findByColumnName: (value: string, column: string) => GetElementResponseProps,
}
export type Companion = {
    getDataFromTable: (input: SheetDataReq) => Promise<GetDataResponseProps>,
    useDataFromTable: (input: SheetDataReq) => Promise<UseDataFromTable>
    insertDataIntoTable: (input: ReplaceDataTableInput) => Promise<any>
    getDataFromTableAndMap: <T>(input: SheetDataReq) => Promise<GetDataResponseGenericProps<T>>
    findElementByColumnName: <T> (value: string, column: string, data: Set<T>, many: boolean) => GetElementResponseGenericProps<T> | undefined
}
export type ReplaceDataTableInput = {
    sheetName: string;
    range: string;
    googleFileId: string;
    data: string[][]
}

