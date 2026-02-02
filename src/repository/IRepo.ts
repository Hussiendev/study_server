export type id = string;  // or number if you use SERIAL in DB
export interface ID {
    getId(): id;
}
//TO apply solid principle i made thuis interface to make the repository intiazable
export interface Intiazable{
    /**
     * Initialize the repository (e.g., connect to database)
     *  * @returns Promise resolved when initialization is complete
     * @throws {RepositoryInitializationException} if initialization fails
     * @throws {DBException} if a database error occurs during initialization
     */
    init():Promise<void>;
    
}
export interface IRepository<T> {
      /**
     * Create a new item.
     *
    
     * @template T- type of item managed by the repository
     * @throws {ItemInvalidException }if the provided item fails validation
     *  @throws {DBException} if a database error occurs during initialization
     */
    
    create(item: T): Promise<id>;
    /**
     * Retrieve an item by id.
     *
     * @param id - item identifier
     * @returns Promise resolving to the found item
     * @throws {ItemNotFoundException} if no item exists with the given id
     *  @throws {DBException} if a database error occurs during initialization
     */
    get(id:id):Promise<T>;
     /**
     * Retrieve all items.
     *
     * @returns Promise resolving to an array of items (empty array if none)
     */
    getALL():Promise<T[]>;
 /**
     * Update an existing item.
     *
     * @param item - item to update
     * @returns Promise resolved when the update completes
     * @throws {ItemInvalidException} if the provided item fails validation
     * @throws {ItemNotFoundException} if the item to update does not exist
     *  @throws {DBException} if a database error occurs during initialization
     */
    update(item:T):Promise<void>;
  
    /**
     * Delete an item by id.
     *
     * @param id - item identifier
     * @returns Promise resolved when the deletion completes
     * @throws {ItemNotFoundException }if no item exists with the given id
     *  @throws {DBException} if a database error occurs during initialization
     */
    delete(id:id):Promise<void>;
}
//i made this interface so i can us both repository and intiazable as user 
