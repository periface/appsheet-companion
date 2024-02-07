import { ColumnValue, Companion, SpreadSheetServices, SheetDataReq, Column, GetDataResponseProps, SetupProps, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput  } from "./types";
import GoogleApi, { IGoogleApi } from "./google-api";
let googleApi : IGoogleApi;  
const getDataFromTable= async (input: SheetDataReq): Promise<GetDataResponseProps> => {
    try{
        const table = input;
        const sheetRange = table.sheetName + '!' + table.sheetRange;
        const rawSpreadSheetData = await googleApi.getGoogleSheetData(table.googleFileId, sheetRange);
        const data = rawSpreadSheetData.map((row: string[]) => {
            const rowData = buildRowData(row, table.columns);
            return rowData;
        });
        return {
            data,
            rawData: rawSpreadSheetData,
            error: undefined
        };
    }
    catch(e: any){
        console.log('error', e.message);
        return {
            data: [],
            error: e.message,
            rawData: []
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
                rawData: []
            } 
        };
    }

    const findByColumnPosition = (value: string, column: number) => {
        try{
            const findResponse : GetElementResponseProps = {} as GetElementResponseProps;
            const result = findElementByColumnPosition(value, column, response.rawData);
            if(!result){
                findResponse.error = 'No se encontró el elemento';
            }
            else{
                findResponse.data = buildRowData(result, input.columns);
            }
            return findResponse;
        }
        catch(e:any){
            return {
                error: e.message,
                data: {} as ColumnValue,
                rawData: []
            } as GetElementResponseProps
        };
    }
    return {
        response,
        findByColumnName,
        findByColumnPosition
    } as UseDataFromTable;
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
export {SetupProps, SpreadSheetServices, SheetDataReq, Column, GetDataResponseProps, ColumnValue, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput}
// HELPERS
function trimAndUpperCase(value: string){
    return value.trim().toUpperCase();
}
const findElementByColumnName = (value: string, column: string, data: ColumnValue[]) => {
    // using reverse for
    let algoritm = "reverse-for"
    // trim and upper case value
    //
    value = trimAndUpperCase(value);
    switch(algoritm){
        case 'reverse-for':
            for(let i = data.length - 1; i >= 0; i--){
                const row = data[i];
                if(trimAndUpperCase(row[column]) === value){
                    return row;
                }
            }
        case 'for':
            for(let i = 0; i < data.length; i++){
                const row = data[i];
                if(trimAndUpperCase(row[column]) === value){
                    return row;
                }
            }
        case 'filter':
            const filterResult = data.filter((row: ColumnValue) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            })[0];
            return filterResult;
        case 'find':
            const findResult = data.find((row: ColumnValue) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            });
            return findResult;
        case 'findIndex':
            const findIndexResult = data.findIndex((row: ColumnValue) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            });
            return data[findIndexResult];
        case 'reduce':
            const reduceResult = data.reduce((prev: ColumnValue, row: ColumnValue) => {
                const match = trimAndUpperCase(row[column]) === value;
                if(match){
                    return row;
                }
                return prev;
            }, {} as ColumnValue);
            return reduceResult;
        default:
            const result = data.filter((row: ColumnValue) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            })[0];
            return result;
    }
}
const findElementByColumnPosition = (value: string, column: number, data: string[][]) => {
    // using reverse for
    //
    let algoritm = "reverse-for"
    switch(algoritm){
        case 'reverse-for':
            for(let i = data.length - 1; i >= 0; i--){
                const row = data[i];
                if(trimAndUpperCase(row[column]) === value){
                    return row;
                }
            }
        case 'for':
            for(let i = 0; i < data.length; i++){
                const row = data[i];
                if(trimAndUpperCase(row[column]) === value){
                    return row;
                }
            }
        case 'filter':
            const filterResult = data.filter((row: string[]) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            })[0];
            return filterResult;
        case 'find':
            const findResult = data.find((row: string[]) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            });
            return findResult;
        case 'findIndex':
            const findIndexResult = data.findIndex((row: string[]) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            });
            return data[findIndexResult];
        case 'reduce':
            const reduceResult = data.reduce((prev: string[], row: string[]) => {
                const match = trimAndUpperCase(row[column]) === value;
                if(match){
                    return row;
                }
                return prev;
            }, [] as string[]);
            return reduceResult;
        default:
            const result = data.filter((row: string[]) => {
                const match = trimAndUpperCase(row[column]) === value;
                return match;
            })[0];
            return result;
    }

}
const buildRowData = (row: string[], columns: Column[]) => {
    const rowData: ColumnValue = {};
    columns.forEach((column: Column) => {
        const value = row[column.position];
        rowData[column.name] = value ? value : 'N/D';
    });
    return rowData;
}
