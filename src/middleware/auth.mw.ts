import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import ErrorResponse from '../utils/error.util';
import asyncHandler from './async.mw';
import { getRolesByName } from '../utils/role.util'

import User from '../models/User.model';

declare global {
    namespace Express{	
        interface Request{
            user?: any;
        }
    }
}

// protect routes
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

	let token: string = '';		

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		// set token from bearer token in header
		token = req.headers.authorization.split(' ')[1]; //get the token
	}

	// set token from cookie
	else if(req.cookies.token){
	    token = req.cookies.token
	}

	try {
		//make sure token exists
		if (!token) {
            return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
		}	

		const jwtData = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;

		req.user = await User.findOne({_id: jwtData.id});

		if(req.user){
			return next();
		}else{
            return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
		}
	} catch (err) {
        return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
	}
});

// Grant access to specific roles
//roles are string array of roles (e.g. ['admin', 'superadmin'])
export const authorize = asyncHandler (async(roles: Array<string>, req: Request, res: Response, next: NextFunction) => {
    let allRoles: any = [];

		// get the authorized roles objects from db
		// this method returns a promise by default		
		await getRolesByName(roles).then((resp) => {
			allRoles = [...resp]; // use the spread operator
		});

		// get authorized role IDs
		const ids = allRoles.map((e: any) => { return e._id });

		if (!req.user) {
            return next (new ErrorResponse('unauthorized!', 401, ['user is not authorized to access this route']))
		}

		// check if id exists
		const flag = await checkRole(ids, req.user.role);

		if (!flag) {
            return next (new ErrorResponse('unauthorized!', 401, ['user is not authorized to access this route']))
		} else {
			return next();
		}
	});


// use brute force to compare roleIDs
const checkRole = (roleIds: Array<string>, userRoles: Array<string>): boolean => {

    let flag: boolean = false;

	for (let i = 0; i < roleIds.length; i++) {
		for (let j = 0; j < userRoles.length; j++) {
			if (roleIds[i].toString() === userRoles[j].toString()) {
				flag = true;
			}
		}
	}

	return flag;
};