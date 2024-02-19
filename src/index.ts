import { ColumnValue, Companion, SpreadSheetServices, SheetDataReq, Column, GetDataResponseProps, SetupProps, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput  } from "./types";
import GoogleApi, { IGoogleApi } from "./google-api";
let googleApi : IGoogleApi;  
const getDataFromTable= async (input: SheetDataReq): Promise<GetDataResponseProps> => {
    try{
        const table = input;
        const sheetRange = table.sheetName + '!' + table.sheetRange;
        const rawSpreadSheetData = await googleApi.getGoogleSheetDataAsFlatArray(table.googleFileId, sheetRange);
        const requestedColumns = table.columns.sort((a: Column, b: Column) => a.position - b.position); 
        const dataSet = new Set<ColumnValue>();
        const spreadSheetColumnsLength = rawSpreadSheetData.columnsLength;
        const rowLimit = input.totalColumns ? input.totalColumns: spreadSheetColumnsLength;
        console.log('rowLimit', rowLimit);
        //remove first row because it contains the column names
        const totalElements = rawSpreadSheetData.rows.length / spreadSheetColumnsLength;
        requestedColumns.forEach((column: Column) => {
            if(column.position > spreadSheetColumnsLength){
                throw new Error(`Column position is out of range Column: ${column.name} - Position: ${column.position} > ${spreadSheetColumnsLength}`);
            }
        });

        const spreadSheetDataRows = rawSpreadSheetData.rows;
        // we need to separate the rows by spreadSheetDataColumns length and then build the row data using the requested columns
        let columnPosition = 0;
        let internalObject: ColumnValue = {};
        for (let i = 0; i < spreadSheetDataRows.length; i++) {
            const internalValue = spreadSheetDataRows[i];

            const foundColumnPosition = requestedColumns.find((column: Column) => column.position === columnPosition);

            if(!foundColumnPosition){

                if(columnPosition === rowLimit){
                    dataSet.add(internalObject);
                    internalObject = {};
                    columnPosition = 0;
                }

                columnPosition++;
                continue;
            }

            const columnName = foundColumnPosition.name;
            internalObject[columnName] = internalValue;
            if(columnPosition === rowLimit ){ 
                dataSet.add(internalObject);
                internalObject = {};
                columnPosition = 0;
            }
            columnPosition++;
        }
        return {
            data:dataSet,
            rawData: rawSpreadSheetData.rows,
            error: undefined,
            totalRows: totalElements,
            columnSize: spreadSheetColumnsLength
        };
    }
    catch(e: any){
        console.log('error', e.message);
        return {
            data: new Set<ColumnValue>(), 
            error: e.message,
            rawData: [],
            totalRows: 0,
            columnSize: 0
        };
    }
}

const useDataFromTable = async (input: SheetDataReq) : Promise<UseDataFromTable> => {
    const response: GetDataResponseProps = await getDataFromTable(input);   
    const findByColumnName = (value: string, column: string) => {
        try{
            const findResponse : GetElementResponseProps = {} as GetElementResponseProps;

            const result = findElementByColumnName(value, column, response.data );
            if(!result){
                findResponse.error = 'No se encontró el elemento';
            }
            else{
                findResponse.data = result;
            }
            return findResponse;
        }
        catch(e: any){
            return {
                error: e.message,
                data: {} as ColumnValue,
                rawData: [] as string[][]
            } as GetElementResponseProps;
        };
    }
    return {
        response,
        findByColumnName,

    }
}
const insertDataIntoTable = async (input: ReplaceDataTableInput) => {
    try{
        const bookAndRange = input.sheetName + '!' + input.range;
        const response =  await googleApi.insertGoogleSheetData(input.googleFileId, bookAndRange, input.data,true);
        return response
    }
    catch(e: any){
        throw new Error(e.message);
    }

}
const spreadSheetServices: SpreadSheetServices = {
    getDataFromTable,
    useDataFromTable,
    insertDataIntoTable
}

export const Init = (props:SetupProps) : Companion=>{
    if(!props.googleApi) throw new Error('googleApi is not defined');
    googleApi = GoogleApi(props.googleApi);
    return {
        spreadSheetServices
    } 
}
export {SetupProps, Companion, SpreadSheetServices, SheetDataReq, Column, GetDataResponseProps, ColumnValue, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput}
// HELPERS
function trimAndUpperCase(value: string){
    return value.trim().toUpperCase();
}
const findElementByColumnName = (value: string, column: string, data: Set<ColumnValue>) => {
    // using reverse for
    // trim and upper case value
    //
    value = trimAndUpperCase(value);
    for (let element of data) {
        if(trimAndUpperCase(element[column]) === value){
            return element;
        }
    }   
}

