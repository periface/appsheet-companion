# TS-NODE AppSheetCompanion 

## Herramienta para migración de datos almacenados en la plataforma Appsheets
# Introducción
En el ámbito gubernamental del estado de Tamaulipas, se ha adoptado la tecnología Google AppSheets para desarrollar aplicativos simples que aborden problemáticas cotidianas. Sin embargo, conforme algunos de estos aplicativos muestran un potencial significativo, surge la necesidad imperante de migrarlos hacia plataformas más robustas. Es importante destacar que esta decisión no implica que Google AppSheets carezca de robustez; simplemente, se busca aprovechar plataformas con características adicionales para atender las crecientes demandas y complejidades de dichos aplicativos.
# Introducción (SIN GPT)
Necesitamos una herramienta que nos permita llamar datos de hojas de spreadsheets de una manera
más conveniente, así que se desarrolló esta herramienta (sencilla para mi al menos), que nos proporciona
un api sencillo para poder cargar estos datos en memoria, pero convertidos a objetos faciles de manejar.

## USO BÁSICO... POR QUE NO HAY OTRO
Imagina que tenemos una base de datos de usuarios en un archivo de spreadsheets

![ejemplo1](https://drive.usercontent.google.com/download?id=1H-GWpWBcQOTvioUfAq3-W4qtwbEjWgiv&authuser=0, "Ejemplo 1")

### Que necesitamos?
**1.- Archivo Credentials.json de Google** 
[Lo puedes conseguir aquí](https://cloud.google.com/iam/docs/keys-create-delete?hl=es-419)  
**2.- Id del Spreadsheet**  
**3.- Nombre de la Hoja**  
**4.- Un buen nombre para cada columna dentro de tu código ;)**  

![ejemplo2](https://drive.usercontent.google.com/download?id=1C7fExBiyISIu1DKcTLJ1G4YFUBZF6iFz&authuser=0, "Ejemplo2")

### Dentro de tu proyecto de NodeJs, instala el paquete

### NPM
 `npm i appsheet-companion`
### YARN
 `yarn add appsheet-companion`

**Uso**
```
    import { Init, type Companion, type SheetDataReq} from 'appsheet-companion'
    async function main(){
        const companion = Init({
            googleApi:{
                rootFolder:'google', // not the sharpest tool in the shed
                fileName:'credentials.json' // not the sharpest tool in the shed
            }
        });
        const usersRequest:SheetDataReq = {
            sheetName:'USERS',// hoja dentro del spreadsheet
            sheetRange:'A2:ZZ',
            googleFileId:'1_1qQIS-cZhQqjhPQmnwevrjOKuBJo8G6-G-p5hIwjXc', // id del spreadsheet
            columns:[{
                position:0,
                name:'id',
            },
            {
                position:1,
                name:'nombre'
            },
            {
                position:2,
                name:'apellido'
            },
            {
                position:3,
                name:'email'
            }]
        }
        const usersTable = companion.spreadSheetServices.useDataFromTable(usersRequest);
        console.log(usersTable.response.rawData); // Datos recibidos de la tabla en formato string[][]
        console.log(usersTable.response.data); // Datos recibidos de la tabla convertidos a objetos
        /* ej. 
        [{
            id:'1',
            nombre:'Alan',
            apellido:'Torres',
            email:'a@a.com'
        }]
        */
    }   

```
