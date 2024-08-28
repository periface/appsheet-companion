
//INPUT SAMPLE ["hola como estan todos (menos alan)", "hola como estan todos menos alan", "hola como estan todos [menos alan]"];
//EXPECTED RESULT "hola_como_estan_todos_menos_alan";
export default function cleanVariableName(variableName: string) {
    let cleanedText = variableName
        .normalize("NFD")                   // Descompone caracteres con acento en base + acento
        .replace(/[\u0300-\u036f]/g, "")    // Remueve los acentos
        .replace(/[^a-zA-Z0-9\s]/g, '')     // Elimina cualquier carácter que no sea alfanumérico o espacio
        .replace(/\s+/g, '_')               // Reemplaza espacios por guion bajo
        .replace(/_+$/g, '').trim();               // Elimina guiones bajos al final
    console.log("cleaned", cleanedText);
    // Mover números al final si están al inicio
    if (/^\d/.test(cleanedText)) {
        cleanedText = cleanedText.replace(/^(\d+)(.*)/, '$2_$1');
    }

    return cleanedText;
}
