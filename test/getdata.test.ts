import InitCompanion from "../src";
import { SetupProps, SheetDataReq } from "../types";
// yeh, i dont like testing, if it works, it works
const config: SetupProps = { 
    googleApi:{
        rootFolder: './credentials',
        fileName: 'credentials.json',
    } 
}

test('check valid result', async () => {
    const companion = InitCompanion(config);
    const promise = companion.spreadSheetServices.useDataFromTable({
        googleFileId: '1m0gmwlVxk1OUDevtyLD0dkZjJzm1EYTA7RqxkXDgj9Y',
        sheetName:'PADRON DE PROVEEDORES',
        sheetRange: 'A1:ZZ',
        columns:[{
            position:0,
            name:'RFC'
        },
            {
                position:5,
                name:'NOMBRE'
            }
        ]
    } as SheetDataReq);
    const result = await promise;
    expect(result.response.data.length).toHaveLength
    const value1 = result.findByColumnName('ISW2106233R1', 'RFC');
    expect(value1).not.toBeUndefined();
    const value2 = result.findByColumnPosition('ISW2106233R1', 0);
    expect(value2).not.toBeUndefined();
});
