import { ColumnValue, SheetDataReq, Column, GetDataResponseProps, SetupProps, GetElementResponseProps } from "../types";
import GoogleApi, { IGoogleApi } from "./google-api";
let googleApi : IGoogleApi;  
const getDataFromTable= async (input: SheetDataReq) => {
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
        } as GetDataResponseProps;
    }
    catch(e: any){
        return {
            data: [],
            error: e.message,
            rawData: []
        } as GetDataResponseProps;
    }
}

const useDataFromTable = async (input: SheetDataReq) => {
    if(!input.algoritm) input.algoritm = 'reverse-for';
    const response: GetDataResponseProps = await getDataFromTable(input);   
    const findByColumnName = (value: string, column: string) => {
        try{
            const findResponse : GetElementResponseProps = {} as GetElementResponseProps;

            const result = findElementByColumnName(value, column, response.data, input.algoritm);
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
            } as GetElementResponseProps
        };
    }

    const findByColumnPosition = (value: string, column: number) => {
        try{
            const findResponse : GetElementResponseProps = {} as GetElementResponseProps;
            const result = findElementByColumnPosition(value, column, response.rawData, input.algoritm);
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
    }
}
const spreadSheetServices = {
    getDataFromTable,
    useDataFromTable
}
const InitCompanion = (props:SetupProps)=>{
    if(!props.googleApi) throw new Error('googleApi is not defined');
    googleApi = GoogleApi(props.googleApi);
    return {
        spreadSheetServices
    }
}
export default InitCompanion as typeof InitCompanion;
// HELPERS 
const findElementByColumnName = (value: string, column: string, data: ColumnValue[], algoritm="for") => {
    // using reverse for
    switch(algoritm){
        case 'reverse-for':
            for(let i = data.length - 1; i >= 0; i--){
                const row = data[i];
                if(row[column] === value){
                    return row;
                }
            }
        case 'for':
            for(let i = 0; i < data.length; i++){
                const row = data[i];
                if(row[column] === value){
                    return row;
                }
            }
        case 'filter':
            const filterResult = data.filter((row: ColumnValue) => {
                const match = row[column] === value;
                return match;
            })[0];
            return filterResult;
        case 'find':
            const findResult = data.find((row: ColumnValue) => {
                const match = row[column] === value;
                return match;
            });
            return findResult;
        case 'findIndex':
            const findIndexResult = data.findIndex((row: ColumnValue) => {
                const match = row[column] === value;
                return match;
            });
            return data[findIndexResult];
        case 'reduce':
            const reduceResult = data.reduce((prev: ColumnValue, row: ColumnValue) => {
                const match = row[column] === value;
                if(match){
                    return row;
                }
                return prev;
            }, {} as ColumnValue);
            return reduceResult;
        default:
            const result = data.filter((row: ColumnValue) => {
                const match = row[column] === value;
                return match;
            })[0];
            return result;
    }
}
const findElementByColumnPosition = (value: string, column: number, data: string[][], algoritm="for") => {
    // using reverse for
    switch(algoritm){
        case 'reverse-for':
            for(let i = data.length - 1; i >= 0; i--){
                const row = data[i];
                if(row[column] === value){
                    return row;
                }
            }
        case 'for':
            for(let i = 0; i < data.length; i++){
                const row = data[i];
                if(row[column] === value){
                    return row;
                }
            }
        case 'filter':
            const filterResult = data.filter((row: string[]) => {
                const match = row[column] === value;
                return match;
            })[0];
            return filterResult;
        case 'find':
            const findResult = data.find((row: string[]) => {
                const match = row[column] === value;
                return match;
            });
            return findResult;
        case 'findIndex':
            const findIndexResult = data.findIndex((row: string[]) => {
                const match = row[column] === value;
                return match;
            });
            return data[findIndexResult];
        case 'reduce':
            const reduceResult = data.reduce((prev: string[], row: string[]) => {
                const match = row[column] === value;
                if(match){
                    return row;
                }
                return prev;
            }, [] as string[]);
            return reduceResult;
        default:
            const result = data.filter((row: string[]) => {
                const match = row[column] === value;
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
