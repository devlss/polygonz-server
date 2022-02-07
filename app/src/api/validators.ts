import {body, param} from "express-validator";

export const vId = param('id').exists().withMessage('Please, provide ID').isNumeric().withMessage('ID must be number');
export const vUsername = body('username', 'Username must not be empty').exists();
export const vPassword = body('password', 'Length must be between 6 and 10 symbols').isLength({min: 6, max: 10});
export const vRoleName = body('name', 'Role name must not be empty and in lowercase').notEmpty().isLowercase();
