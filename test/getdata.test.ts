import {Init, type SetupProps,SheetDataReq } from "../src";
// yeh, i dont like testing, if it works, it works
const config: SetupProps = { 
    googleApi:{
        rootFolder: './credentials',
        fileName: 'credentials.json',
    } 
}

test('check valid result', async () => {
    const companion = Init(config);
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
    expect(result.response.error).toBeUndefined();
    expect(result.response.data.length).toHaveLength
    
    expect(result.response.data.length).toBeGreaterThan(0);
    const value1 = result.findByColumnName('COM9908193R3', 'RFC');
    expect(value1).not.toBeUndefined();
    expect(value1.data).toHaveProperty('RFC');
    const value2 = result.findByColumnPosition('COM9908193R3', 0);
    expect(value2).not.toBeUndefined();
});
