export interface IMapper<T,U> {
    map(input: T,input_2?:string): U;
    reversemap(input: U): T;
}