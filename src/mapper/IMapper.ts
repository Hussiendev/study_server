export interface IMapper<T,U> {
    map(input: T): U;
    reversemap(input: U): T;
}