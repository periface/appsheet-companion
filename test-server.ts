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
async function testObservados(req: http.IncomingMessage, res: http.ServerResponse){
    const companion = Init(config);
    const promise = companion.spreadSheetServices.useDataFromTable(    {
        sheetName:'Listado_Completo_69-B',
        googleFileId:'13KF5fC3g9thIIUjWZ7t8hPz8QiWVNVnd54VqdkwsTfE',
        sheetRange:'A1:ZZ',
        columns:[{
            position:0,
            name:'No'
        },
            {
                position:1,
                name:'RFC',
            },
            {
                position:2,
                name:'nombreContribuyente',
            },
            { 
                position:3,
                name:'situacionContribuyente'
            },
            {
                position:4,
                name:'numeroFechaOficioGlobalPresuncionSAT'
            },
            {
                position:5,
                name:'publicacionPaginaSATPresuntos'
            },
            {
                position:6,
                name:'numeroFechaOficioGlobalPresuncionDOF'
            },
            {
                position:7,
                name:'publicacionDOFpresuntos'
            },
            {
                position:8,
                name:'numeroFechaOficioGlobalContribuyentesDesvirtuaronSAT'
            },
            {
                position:9,
                name:'publicacionPaginaSATDesvirtuados'
            },
            {
                position:10,
                name:'numeroFechaOficioGlobalContribuyentesDesvirtuaronDOF'
            },
            {
                position:11,
                name:'publicacionDOFdesvirtuados'
            },
            {
                position:12,
                name:'numeroFechaOficioGlobalDefinitivosSAT'
            },
            {
                position:13,
                name:'publicacionPaginaSATDefinitivos'
            },
            {
                position:14,
                name:'numeroFechaOficioGlobalDefinitivosDOF'
            },
            {
                position:15,
                name:'publicacionDOFdefinitivos'
            },
            {
                position:16,
                name:'numeroFechaOficioGlobalSentenciaFavorableSAT'
            },
            {
                position:17,
                name:'publicacionPaginaSATSentenciaFavorable'
            },
            {
                position:18,
                name:'numeroFechaOficioGlobalSentenciaFavorableDOF'
            },
            {
                position:19,
                name:'publicacionDOFSentenciaFavorable'
            }
        ]

    }

    );
    const result = await promise
    console.log(result.response.data);
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
    else if (req.url === '/observados') {
        await testObservados(req,res);
    }
    else {
        res.write('Hello World');
        res.end();
    }
}).listen(1634);
