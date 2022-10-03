const MAYBE = 0;
const FOUND = 1;
const ERROR = 2;
const SAVING = 3;

//Parser de campos, recibe un numero que será el cual aceptará, en caso de encontrarlo guarda la información del campo designado

class Parser {
    reset(){
        /*
         if(this.saved.length > 0 ){
             this.saved = this.saved.join("")
             console.log(`reseting with the string "${this.saved}" inside`);
         }*/
       
        this.state = MAYBE;

         this.position = 0;

         this.saved = [];
         this.saved_position = 0;
         this.lines = 0;
     }

    constructor(target , divisor){
        this.target = target;
        this.divisor = divisor;
        this.reset();
    }
    
    getSaved(){
        return this.saved.join("").replace(/;/g , '.,')
    }
    
    feed(char){

        if(this.position == 0 && char == ' '){
            return;
        }

        /*
        if ( char == this.divisor){
            this.state = MAYBE;
            this.reset();
            return;
        }*/

        if(this.state == ERROR){
            return;
        }

        if(this.state == MAYBE && this.position < this.target.length){
            if(this.target[this.position] == char){
                this.position++;
                if(this.position == this.target.length){
                    this.state = FOUND;
                }
            }else{
                this.state = ERROR;
            }
            return;
        }
        
        if( this.state == FOUND || this.state == SAVING){
            this.state = SAVING
            if(char == '\n'){
                char = ' ';
                this.lines++;
            }
            this.saved[this.saved_position] = char;
            this.saved_position++;
            return;
        }
    }
 
}

module.exports = {Parser , MAYBE , FOUND , ERROR , SAVING}