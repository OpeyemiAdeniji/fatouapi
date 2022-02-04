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
export const authorize = (roles:Array<string>) => {
    let allRoles: any = [];

	return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
		// get the authorized roles objects from db
		// this method returns a promise by default
		
		await getRolesByName(roles).then((r) => {
			allRoles = [...r]; // use the spread operator
		});

		// get authorized role IDs
		const ids = allRoles.map((e: any) => { return e._id });

		if (!req.user) {
			return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))

		}

		// check if id exists
		const flag = await checkRole(ids, req.user.role);

		if (!flag) {
			return next(new ErrorResponse('Invalid token', 401, ['user not authorized to access this route']))
		} else {
			return next();
		}
	});
};

// use brute force to compare roleIDs
const checkRole = (roleIds: Array<string> , userRoles: Array<string>) => {
	let flag = false;

	for (let i = 0; i < roleIds.length; i++) {
		for (let j = 0; j < userRoles.length; j++) {
			if (roleIds[i].toString() === userRoles[j].toString()) {
				flag = true;
			}
		}
	}

	return flag;
};