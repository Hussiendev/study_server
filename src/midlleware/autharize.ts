import { PERMISSION, ROLE } from "../config/roles";
import { Request, Response, NextFunction } from "express";
import { InsufficientPermissionsException, InvalidRoleException } from "../util/exceptions/http/AutharizationException";
import { ROLE_PERMISSIONS as rolePermission } from "../config/roles";
import { AuthRequest } from "../config/authRequest";
import { AuthenticationFailedException } from "../util/exceptions/http/AuthenticationException";
import logger from "../util/logger";

// This function creates the 'security guard' middleware
export function hasPermission(permission: PERMISSION) { // Takes the required permission (e.g., READ_ORDER)
    return (req: Request, res:Response, next: NextFunction) => { // Returns the actual middleware function
        // 1. Get the user's role from the request (assume they are logged in)
      const authreq=req as AuthRequest
        if(!authreq.user){
            throw new AuthenticationFailedException();

        }
        const userRole = authreq.user.role;
    if(!rolePermission[userRole]) { // e.g., 'admin', 'user', etc.
        throw new InvalidRoleException(userRole);
    }
        // 2. Check if the user's role has the required permission in our mapping
        if (!rolePermission[userRole].includes(permission)) {
            // 5. If not, throw an error (Access Denied!)
            logger.error(`User with role ${userRole} does not have permission ${permission}`);
            
            throw new InsufficientPermissionsException();
        }

        // 4. If yes, call next() to allow the request to proceed
        next();
    }
}
export function hasRole(allowedroles:ROLE[]){
    return (req: Request, res:Response, next: NextFunction) => { // Returns the actual middleware function
        // 1. Get the user's role from the request (assume they are logged in)
      const authreq=req as AuthRequest
        if(!authreq.user){
            throw new AuthenticationFailedException();  
        }
        const userRole = authreq.user.role;
 if(!allowedroles.includes(userRole)){
    logger.error(`User with role ${userRole} is not in allowed roles ${allowedroles.join(",")}`);
    throw new InsufficientPermissionsException();
 }
        next();
    }
}