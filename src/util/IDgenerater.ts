import { v4 as uuidv4 } from 'uuid';
export  const idGenerater=(prefix?:string)=>{
    return prefix?`${prefix}-${uuidv4()}`:uuidv4();

}