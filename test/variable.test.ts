
import cleanVariableName from "../lib/variable-generador";
test('check if variable is correctly generated', () => {
    const variable_names = ["hola como estan todos (menos alan)", "1234hola como estan todos (menos alan)", "hola como estan todos [menos alan]"];
    const expected = "hola_como_estan_todos_menos_alan";
    const expected2 = "hola_como_estan_todos_menos_alan_1234";
    const result = cleanVariableName(variable_names[0]);
    expect(result).toBe(expected);
    const result2 = cleanVariableName(variable_names[1]);
    expect(result2).toBe(expected2);

});
