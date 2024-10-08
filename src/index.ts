import { ColumnValue, Companion, SheetDataReq, Column, GetDataResponseProps, SetupProps, GetElementResponseProps, UseDataFromTable, ReplaceDataTableInput, GetDataResponseGenericProps, GetElementResponseGenericProps } from "./types";
import GoogleApi, { IGoogleApi } from "./google-api";
import cleanVariableName from "../lib/variable-generador";
let googleApi: IGoogleApi;
const getDataFromTableAndMap = async <T>(input: SheetDataReq): Promise<GetDataResponseGenericProps<T>> => {
    const response = await getDataFromTable(input);
    const data = new Set<T>();
    response.data.forEach((element) => {
        const convertedElement = element as unknown as T;
        data.add(convertedElement);
    });
    return {
        data,
        error: response.error,
        rawData: response.rawData,
        totalRows: response.totalRows,
        columnSize: response.columnSize,
        columns: response.columns
    };
}
const getDataFromTable = async (input: SheetDataReq): Promise<GetDataResponseProps> => {
    //No  Saludo  Nombre
    //1    2        3
    //[1]  [2]      [3]
    // cuando llegues al 3, resetea el contador*/
    //
    validateInput(input);
    const table = input;
    let sheetRange = 'A1:ZZ';
    if (table.sheetRange) {
        sheetRange = table.sheetRange;
    }
    let inputHasColumns = input.columns ? true : false;
    var concatRange = table.sheetName + '!' + (sheetRange ?? 'A1:ZZ');
    let requestedColumns: Column[] = []
    const rawSpreadSheetData = await googleApi.getGoogleSheetDataAsFlatArray(table.googleFileId, concatRange);
    try {
        if (inputHasColumns && table.columns) {
            requestedColumns = table.columns.sort((a: Column, b: Column) => a.position - b.position);
        }
        else {
            requestedColumns = rawSpreadSheetData.columns;
        }
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
            columnSize: spreadSheetColumnsLength,
            columns: requestedColumns
        };
    } catch (e: any) {
        console.log('error', e.message);
        return {
            data: new Set<ColumnValue>(),
            error: e.message,
            rawData: [],
            totalRows: 0,
            columnSize: 0,
            columns: requestedColumns
        };
    }

}
const useDataFromTable = async (input: SheetDataReq): Promise<UseDataFromTable> => {
    validateInput(input)
    const response: GetDataResponseProps = await getDataFromTable(input);
    const findByColumnName = (value: string, column: string) => {
        try {
            const findResponse: GetElementResponseProps = {} as GetElementResponseProps;

            const result = findElementByColumnName(value, column, response.data);
            if (!result) {
                findResponse.error = 'No se encontró el elemento';
            }
            else {
                findResponse.data = result;
            }
            return findResponse;
        }
        catch (e: any) {
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
    try {
        const bookAndRange = input.sheetName + '!' + input.range;
        const response = await googleApi
            .insertGoogleSheetData(
                input.googleFileId,
                bookAndRange,
                input.data,
                true);
        return response
    }
    catch (e: any) {
        throw new Error(e.message);
    }

}
const findElementByColumnNameGeneric =
    <T>(value: string,
        column: string,
        data: Set<T>,
        many: boolean = false) => {
        if (!data) {
            throw new Error('data is required');
        }

        value = trimAndUpperCase(value);
        const arrResult: T[] = [];
        for (let element of data) {
            const columnValue = element[column as keyof T];
            if (columnValue) {
                if (trimAndUpperCase(columnValue as string) === value) {
                    if (!many) {
                        return {
                            data: element,
                            rawData: [] as string[][],
                        } as GetElementResponseGenericProps<T>;
                    }
                    arrResult.push(element);
                }
            }
        }
        if (many) {
            return {
                data: arrResult,
                rawData: [] as string[][],
            } as GetElementResponseGenericProps<T>;
        }
    }

export const Init = (props: SetupProps): Companion => {
    if (!props.credentials) throw new Error('credentials file required');
    googleApi = GoogleApi(props.credentials);
    return {
        getDataFromTable,
        getDataFromTableAndMap,
        useDataFromTable,
        insertDataIntoTable,
        findElementByColumnName: findElementByColumnNameGeneric,
        helpers: {
            cleanVariableName
        }
    }
}
export {
    GetDataResponseGenericProps,
    SetupProps,
    Companion,
    SheetDataReq,
    Column,
    GetDataResponseProps,
    ColumnValue,
    GetElementResponseProps,
    UseDataFromTable,
    ReplaceDataTableInput,

}
// HELPERS
function validateInput(input: SheetDataReq) {
    if (!input.googleFileId) {
        throw new Error('googleFileId is required');
    }
    if (!input.sheetName) {
        throw new Error('sheetName is required');
    }
}
function trimAndUpperCase(value: string) {
    if (!value) return '__EMPTY__';
    return value.trim().toUpperCase();
}
const findElementByColumnName = (value: string, column: string, data: Set<ColumnValue>) => {
    // using reverse for
    // trim and upper case value
    //
    value = trimAndUpperCase(value);
    for (let element of data) {
        const columnValue = element[column as keyof ColumnValue];
        if (columnValue) {
            if (trimAndUpperCase(columnValue as string) === value) {
                return element;
            }
        }
    }
}

