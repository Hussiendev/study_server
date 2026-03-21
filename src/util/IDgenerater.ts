const { v4: uuidv4 } = require('uuid');

export const idGenerater = (prefix?: string): string => {
    return prefix ? `${prefix}-${uuidv4()}` : uuidv4();
};