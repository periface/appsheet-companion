import http from 'http';
import {Init, type SetupProps,SheetDataReq } from "./src/index";
// yeh, i dont like testing, if it works, it works
const config: SetupProps = { 
    googleApi:{
        rootFolder: './credentials',
        fileName: 'credentials.json',
    } 
}
async function testContratos(req: http.IncomingMessage, res: http.ServerResponse){
    const companion = Init(config);
    const promise = companion.spreadSheetServices.useDataFromTable({
        googleFileId: '1af0RQB2dw8SM9nX8T8XdeTbVyDBMTbHnZfWaKINUeu4',
        sheetName:'CONTRATOS',
        sheetRange: 'A1:ZZ',
        columns:[{
            position:0,
            name:'id'
        },
            {
                position: 1,
                name: 'numeroContrato'

            },
            {
                position:3,
                name:'Concepto'
            }
        ]
    } as SheetDataReq);
    const result = await promise
    res.write(JSON.stringify(Array.from(result.response.data)));
    res.end();
}
async function testProveedores(req: http.IncomingMessage, res: http.ServerResponse){

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
                position: 1,
                name: 'NUMEROPROVEEDOR'

            },
            {
                position:2,
                name:'NOMBRE'
            }
        ]
    } as SheetDataReq);
    const result = await promise
    res.write(JSON.stringify(Array.from(result.response.data)));
    res.end();

}
http.createServer(async (req, res) => {
    if (req.url === '/contratos') {
        await testContratos(req,res);
    } else if (req.url === '/proveedores') {
        await testProveedores(req,res);
    }
}).listen(3001);
