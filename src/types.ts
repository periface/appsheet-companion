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
    onEmptyFieldStringValue?: string;
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
export type GetDataFromTable = {
    (input: SheetDataReq): Promise<GetDataResponseProps>
}
export type UseDataFromTable = {
    response: GetDataResponseProps,
    findByColumnName: (value: string, column: string) => GetElementResponseProps,
    findByColumnPosition: (value: string, column: number) => GetElementResponseProps
}
export type SpreadSheetServices = {
    getDataFromTable:(input: SheetDataReq)=> Promise<GetDataResponseProps>,
    useDataFromTable:(input: SheetDataReq)=> Promise<UseDataFromTable> 
    insertDataIntoTable:(input: ReplaceDataTableInput)=> Promise<any>
}
export type Companion ={
    spreadSheetServices:  SpreadSheetServices
}
export type ReplaceDataTableInput = {
    sheetName: string;
    range: string;
    googleFileId: string;
    data: string[][]
}
