import {Init, type SetupProps,SheetDataReq } from "../src";
// yeh, i dont like testing, if it works, it works
const config: SetupProps = { 
    googleApi:{
        rootFolder: './credentials',
        fileName: 'credentials.json',
    } 
}
const tableRequest: Record<string,SheetDataReq> = {
    NAMES: {
        googleFileId: '1f9ixtL0zNpcclRBYMMUBwu1fJnfm_ckjEIKgIGqG5Xw',
        sheetName:'Names',
        sheetRange: 'A1:ZZ',
        columns:[{
            position:0,
            name:'id'
        },
            {
                position: 1,
                name: 'name'

            },
            {
                position:2,
                name:'number'
            },
            {
                position:3,
                name:'email'
            },
            {
                position:4,
                name: 'noDomain'
            },
            {
                position:5,
                name: 'domain'
            }
        ]
    } 

} as const
test('data from spreadsheet is called correctly', async () => {
    const companion = Init(config);
    const promise = companion.spreadSheetServices.useDataFromTable(tableRequest.NAMES as SheetDataReq);
    const result = await promise;
    expect(result.response.error).toBeUndefined();
    expect(result.response.columnSize).toBe(5);
    expect(result.response.data.size).toBeGreaterThan(20); 
    expect(result.response.data.size).toBeLessThanOrEqual(100);
});
test('test call data and find value by id', async () => {
    const companion = Init(config);
    const promise = companion.spreadSheetServices.useDataFromTable(tableRequest.NAMES as SheetDataReq);
    const result = await promise;
    const david = result.findByColumnName('5', 'id');
    const elijah = result.findByColumnName('89', 'id');
    expect(david).not.toBeUndefined();
    expect(elijah).not.toBeUndefined();
    expect(david.data).toEqual({
        id: '5',
        name: 'David',
        number: '3,564,272',
        email: '5.david@yahoo.com',
        noDomain: '5.david@',
        domain: 'yahoo.com'
    });
    expect(elijah.data).toEqual({
        id: '89',
        name: 'Elijah',
        number: '341,144',
        email: '89.elijah@yahoo.com',
        noDomain: '89.elijah@',
        domain: 'yahoo.com'
    })
});
test('test generics', async () => {
    const companion = Init(config);
    const promise = companion.spreadSheetServices.getDataFromTableAndMap<{id:string, name:string, number:string, email:string, noDomain:string, domain:string}>(tableRequest.NAMES as SheetDataReq);
    const result = await promise;
    expect(result.error).toBeUndefined();
    expect(result.columnSize).toBe(5);
    expect(result.data.size).toBeGreaterThan(20);
    expect(result.data.size).toBeLessThanOrEqual(100);
    expect(result.data.values().next().value).toEqual({
        id: '89',
        name: 'Elijah',
        number: '341,144',
        email: '89.elijah@yahoo.com',
        noDomain: '89.elijah@',
        domain: 'yahoo.com'
    })
});
