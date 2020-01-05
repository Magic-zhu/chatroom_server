class Check{
    constructor(){

    }
    empty(data,paramsArray){
        let result = true;
        let paramsName = "";
        for(let i=0;i<paramsArray.length;i++){
            if(!data[paramsArray[i]]||data[paramsArray[i]]==""){
                result = false;
                paramsName = paramsArray[i];
                break
            }
        }
        return {result,paramsName}
    }
}
 
module.exports =  new Check();