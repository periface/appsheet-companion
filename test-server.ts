import http from 'http';
import {Init, type SetupProps,SheetDataReq } from "./src/index";
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

async function test(req: http.IncomingMessage, res: http.ServerResponse){
    const companion = Init(config);
    const promise = companion.spreadSheetServices.useDataFromTable(tableRequest.NAMES as SheetDataReq);
    const result = await promise
    res.write(JSON.stringify(Array.from(result.response.data)));
    res.end();
}
http.createServer(async (req, res) => {
    try{
        await test(req,res);
    }catch(e){
        if(e instanceof Error){
            res.write(e.message);
        }
        res.end();
    }
}).listen(1634);
