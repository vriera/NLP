
//lector de pdf
const pdfparse = require('pdf-parse');
//mi parser a mano
const {Parser , MAYBE , FOUND , ERROR , SAVING} = require('./parser');
//para escrbir csv
const {ParserAnyNumber , anyTester} = require('./parserAnyNumber')
const {initCSVWriter , writeCSVpatente} = require('./csvwriter')
const fs = require('fs');
const {resetAll , resetAllExcluding , whoFound , clearBuffers , whoFoundExcluding , shouldAdd } = require('./utils')
let dir;
let outputFilename;

//Los campos de las patentes que se guardarán en el csv
const campos = [ 10 , 21 , 29 , 30 , 41 , 51 , 54 , 57 , 61 , 62 , 71 , 72 , 83 ];


let total = 0



async function customParser(inputDir , outFile){
    dir = inputDir;
    const files = fs.readdirSync(dir);
    outputFilename = outFile;
   // terminosRegExp = await getTerminosRegExp();
    await initCSVWriter(outputFilename , campos);
    totales = []
    
    for(let i = 0 ; i <files.length ; i++){
        console.log(`patente: ${i}`);
        filename = files[i];
        let file = fs.readFileSync(`${dir}/${filename}`);
            data = await pdfparse(file)
            let text = data.text;
            let totalPDF = await  masterParser(text, text.length , filename);
            total += totalPDF;
            if(totalPDF > 0){
                totales.push( [ filename , totalPDF] );
            }
    }
  

    console.log(total)
    totales.forEach( (t)=> {
        console.log(t)
    })
    
}

function initParsersCampos(){
    //parser de campos
    const map = new Map();
    for( let i = 0 ; i < campos.length ; i++)
    {
        map.set(campos[i] , new Parser(`(${campos[i]})` , '\n'));
    }
    return map
}



async function masterParser(text , text_len , filename){
    
    const p = initParsersCampos();
    const any = new ParserAnyNumber('\n')
    let totalLocal = 0;

    let count = 0; //cantidad de letras
    let enterCount = 0; //cantidad de enters
    let actual = -1; //el uiltimo parser que tiro FOUND 
    let newParser = -1; //un numero parser auxiliar

    let auxParser; 
    let buffer;

    let patenteActual = {}; //la pantente que se fue levantando
    let patentes = []; //el array con las patentes que fue leyendo

    let camposFound = [];

    let patentesEnteras = [];
    let patenteEntera = [];
    for(let i = 0 ; i < text_len ; i++ ){
        c = text[i];
       // checkState(p);
    
        count++;
        //primero le doy la letra a cada parser
        for ( let i = 0 ; i <campos.length ; i++){
            p.get(campos[i]).feed(c);
           
        }
        patenteEntera.push(c);
        any.feed(c)
        
        //si encontre un campo 10 significa que estoy leyendo una nueva patente
        if(p.get(10).state == FOUND && ( (i+1<text_len) && text[i+1] == ' ')){
            if(actual > -1){
                auxParser = p.get(actual);
                buffer = auxParser.getSaved();
                patenteActual[actual] = buffer.substring(0 , buffer.length - 4).trim().replace(/  +/g, ' ');
                camposFound.push(actual);
            }
            //console.log(camposFound);
            camposFound = [];
            if(patenteActual[10] && /^AR/.test(patenteActual[10])){
                patentes.push(patenteActual);
                patenteActual['pdf'] = filename;
            }
            patenteEntera = [];
            patenteActual = {};
            totalLocal++;
        }
        //Luego de haber leido los primeros 4 caracteres de una linea puedo saber si estoy viendo efectivamente un campo que me interesa, un campo que no, o si sigue siendo texto del campo anterior que ocupe mas de una linea
        
        if(count == 4 && ( (i+1<text_len) && text[i+1] == ' ')){
            //el actual en -1 significa que no estoy en ningun campo
            if(actual != -1){
                //me fijo si quien encontro
                newParser = whoFound(p,any);
                if(newParser != -1 && shouldAdd(newParser , camposFound)){
                        if(actual > -2 ){
                            auxParser = p.get(actual);
                            buffer = auxParser.getSaved();
                            //el primer replace saca los espacios multiples y los deja en uno solo
                            //el segundo te saca los saltos de linea con guión en español en una misma palabra
                            patenteActual[actual] = buffer.substring(0 , buffer.length - 4).trim().replace(/  +/g, ' ');
                            camposFound.push(actual);
                        }
                    actual = newParser;
                    
                }
                
            }else{
                actual = whoFound(p,any);
            }
        }

        if(c == '\n'){
            if(actual == -1 ){ 
                actual = whoFound(p,any);
            }
           // console.log(count)
           // printSaved(p);
            enterCount++;
            count = 0;
            //doble enter
            if(enterCount == 2 ){
                newParser = whoFound(p,any);
                if( newParser >= 0){
                   auxParser = p.get(newParser);
                   buffer = auxParser.getSaved();
                    //console.log(buffer.substring(0 , buffer.length - 4));
                    patenteActual[actual] = buffer.substring(0 , buffer.length - 4).trim().replace(/  +/g, ' ');
                    camposFound.push(actual);
                }
                actual = -1;
            }
            //            
            if(actual == 41 && p.get(41).lines == 2 ){ 
               // console.log("overflow del campo 41");
              //  console.log(`Tenia adentro: ${p.get(41).getSaved()}`);
                auxParser =  p.get(41);
                patenteActual[41] = auxParser.getSaved().trim().replace(/  +/g, ' ');
                actual = -1;
                camposFound.push(41);
            }
            resetAllExcluding(p, actual);
            if(actual != -2){
                any.reset()
            }
           // console.log(`reset con actual en ${actual}`);
        }else {
            enterCount = 0
        
        }
       
    }

    //para agregar al utlimo
    if(patenteActual[10] && patenteActual[10] != ''){
        patenteActual['pdf'] = filename;
        patentes.push(patenteActual);
    }

    for( let index = 0 ; index < patentes.length ; index++){
        totalLocal++;
        await writeCSVpatente(patentes[index]);
        //await writePatente(patentes[j][10] , patentes[j])
    }
    //patentes.forEach((p) =>{console.log(p)});
    patentesEnteras.forEach((p) =>{console.log(p)});
    return patentes.length;
}



module.exports = {
    customParser
}