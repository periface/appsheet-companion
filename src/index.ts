import { ColumnValue, Companion, SpreadSheetServices, SheetDataReq, Column, GetDataResponseProps, SetupProps, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput  } from "./types";
import GoogleApi, { IGoogleApi } from "./google-api";
let googleApi : IGoogleApi;  
const getDataFromTable= async (input: SheetDataReq): Promise<GetDataResponseProps> => {
    try {
        const table = input;
        const sheetRange = table.sheetName + '!' + table.sheetRange;
        const rawSpreadSheetData = await googleApi.getGoogleSheetDataAsFlatArray(table.googleFileId, sheetRange);
        const requestedColumns = table.columns.sort((a: Column, b: Column) => a.position - b.position);
        const dataSet: ColumnValue[] = []; // Cambiado a Array para simplificar el manejo
        const spreadSheetColumnsLength = rawSpreadSheetData.columnsLength - 1;
        const columnLimit = input.totalColumns ? input.totalColumns : spreadSheetColumnsLength;

        // No necesitamos calcular totalElements de esta manera ya que será recalculado
        requestedColumns.forEach((column: Column) => {
            if (column.position > spreadSheetColumnsLength) {
                throw new Error(`Column position is out of range Column: ${column.name} - Position: ${column.position} > ${spreadSheetColumnsLength}`);
            }
        });

        const spreadSheetDataRows = rawSpreadSheetData.rows;
        let currentColumnPosition = 0;
        let internalObject: ColumnValue = {};

        for (let i = 0; i < spreadSheetDataRows.length; i++) {
            const internalValue = spreadSheetDataRows[i];
            const columnInCurrentPosition = requestedColumns.find((column: Column) => column.position === currentColumnPosition);

            if (columnInCurrentPosition) {
                const columnName = columnInCurrentPosition.name;
                internalObject[columnName] = internalValue;
            }

            if (currentColumnPosition === columnLimit || i === spreadSheetDataRows.length - 1) {
                dataSet.push({ ...internalObject }); // Clonar el objeto para asegurar referencia única
                internalObject = {}; // Resetear el objeto para el próximo ciclo
                currentColumnPosition = -1; // Resetear a -1 ya que se incrementará a 0 al final del ciclo
            }

            currentColumnPosition++;
        }

        return {
            data: new Set(dataSet), // Convertir Array a Set si se requiere unicidad
            rawData: rawSpreadSheetData.rows,
            error: undefined,
            totalRows: dataSet.length, // Actualizar totalRows para reflejar el número de objetos únicos
            columnSize: spreadSheetColumnsLength
        };
    } catch (e: any) {
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

