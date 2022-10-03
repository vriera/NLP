
const { customParser} = require('./parser/parserMain')
const fetch = require('node-fetch')
const fs = require('fs');
const { off } = require('process');
const base_url ="https://portaltramites.inpi.gob.ar/Uploads/Boletines"

const latest_id = 945;
const startingYear = 2001;
const endingYear = 2008;


run();

async function run(){
    const args = process.argv.slice(2);
    if(args.length <1 || args[0] == 'help')
        printUsage();
    if(args[0] == 'parse' ){
        if(!args[1] || !args[2]){
            console.log("parse requires two arguments:\n 1 - input directory-name \n 2 - output file-name");
            return;
        }
        await customParser(args[1] , args[2]);
        return;
    }
    if(args[0] == 'scrape'){
        console.log("scraping pattern YYYYX_2.pdf")
        await scrapeOld();
        console.log("scraping pattern pXXX.pdf")
        await scrapeP();
        console.log("scraping pattern XXXX_2_.pdf")
        return;
    }


}
function printUsage(){
    console.log("ERROR: MISSING ARGUMENTS")
    console.log(`should be one of:\n\t- scrape\n\t- scrape-latests\n\t- scrape-old\n\t- parse INPUT-DIR OUTPUT-FILE`)
}
async function scrapeLatests(){
    file_number = latest_id;
    keep_fetching = true;
    while( keep_fetching){  
        outfile = file_number + "_2_.pdf";
        if(!fs.existsSync(outfile))
            keep_fetching = await fetchFileAndWrite(outfile);
        file_number+=1;
    }
}

async function scrapeP(){
    p = 325;
    while(p<945){
        outfile = "p"+p+".pdf";
        found = false;
        if(!fs.existsSync(outfile)){
            found = await fetchFileAndWrite(outfile);
            if(!found){
                outfile = p+".pdf";
                await fetchFileAndWrite(outfile)
            }
        }
        p+=1;
    }
}

async function scrapeOld(){
    actualYear = startingYear;
    while(actualYear <= endingYear){
        file_number = 0;
        keep_fetching = true;
        while( keep_fetching){
            outfile = actualYear + file_number +"_2_.pdf";
            if(!fs.existsSync(outfile))
                keep_fetching = await fetchFileAndWrite(outfile);
            file_number+=1;
        }
        actualYear+=1;
    }
}



async function fetchFileAndWrite(filename){
    const filepath = "./data_fetched/" + filename
    //console.log(`fetching ${base_url}/${filename}`)
    let res = await fetch(base_url + "/" + filename)
    if(res.status != '200'){
        console.log("failed: " + filename)
        return false
    }
    fs.closeSync(fs.openSync(filepath, 'w'));
    const stream =  fs.createWriteStream(filepath);
    await new Promise((resolve, reject) => {
        res.body.pipe(stream);
        res.body.on("error", reject);
        stream.on("finish", resolve);
      });
    return true;
}
