// Define roles clearly
// roles.ts

export enum ROLE {
  ADMIN = 'admin',
  USER = 'user',
}

// Define all possible permissions
export enum PERMISSION {
  // User management
  CREATE_USER = 'user:create',
  READ_USER = 'user:read',
  UPDATE_USER = 'user:update',
  DELETE_USER = 'user:delete',
  READ_ALL_USERS = 'user:read:all',

  // Auth
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  Forget_PASS='auth:forget_pass',
  Update_PAsss='auth:update_pass'
}

// Map roles to their allowed permissions
type RolePermissions = {
  [key in ROLE]: PERMISSION[];
};

export const ROLE_PERMISSIONS: RolePermissions = {
  [ROLE.ADMIN]: [
    ...Object.values(PERMISSION), // Admin can do everything
  ],

  [ROLE.USER]: [
    PERMISSION.CREATE_USER,   // Can create his own account
    PERMISSION.READ_USER,     // Can read his own account
    PERMISSION.UPDATE_USER,   // Can update his own account
    PERMISSION.DELETE_USER,   // Can delete his own account
    PERMISSION.LOGIN,
    PERMISSION.LOGOUT,
    PERMISSION.Forget_PASS,
    PERMISSION.Update_PAsss
  ],
};

export const toRole = (role: string): ROLE => {
    switch(role){
        case ROLE.ADMIN:
            return ROLE.ADMIN;
        case ROLE.USER:
            return ROLE.USER;
        default:
            throw new Error(`Invalid role: ${role}`);
    }
    }

