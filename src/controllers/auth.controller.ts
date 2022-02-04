import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import ErrorResponse from '../utils/error.util';
import asyncHandler from '../middleware/async.mw';
import { generate } from '../utils/random.util';
import { sendGrid } from '../utils/email.util';
import { strIncludesEs6, isString, strToArrayEs6  } from '../utils/functions.util';

import dayjs from 'dayjs'
import customparse from 'dayjs/plugin/customParseFormat';
dayjs.extend(customparse);

// models
import User from '../models/User.model';
import Role from '../models/Role.model';
import Status from '../models/Status.model';

declare global {
    namespace Express{
        interface Request{
            user?: any;
        }
    }
}

// @desc    Register Recruiters
// @route   POST /api/identity/v1/auth/register
// @access  Public
export const registerRecruiter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { firstName, lastName, companyName, title, email, password } = req.body;

    // find the user role
    const role = await Role.findOne({ name: 'user' });
    if(!role){
        return next(new ErrorResponse('an error occured. please contact support.', 500, ['roles not defined']));
    }

    // validate existing email
    const exist = await User.findOne({ email: email });
    if(exist){
        return next(new ErrorResponse('Error', 400, ['email already exist, use another email']));
    }

	// match user password with regex
	const match =  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
	const matched: boolean = match.test(password);

	if(!matched){
		return next(new ErrorResponse('Error', 400, ['password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number']));
	}

    // create the user
    const user = await User.create({
		firstName,
		lastName,
		title,
		companyName,
        email,
        password,
        isSuper: false,
		isActivated: false,
		isAdmin: false,
		isUser: true,
		isActive: true
    });

	// create status
	const status = await Status.create({
		profile: false,
		activated: false,
		apply: {
			status: false,
			step: 1
		},
		user: user._id,
		email: user.email
	});

	// attach the user and talent role
	user.roles.push(role._id);
	user.status = status._id;
	await user.save();

    // send emails
    if(user){

        try {

            // send welcome email data
            let emailData = {
                template: 'welcome-business',
                email: email,
                preheaderText: 'welcome',
                emailTitle: 'Welcome to Fatou',
                emailSalute: `Hello ${user.firstName},`,
                bodyOne: 'We\'re glad you signed up on Fatou. We will reach out to you when we are fully launched',
                fromName: 'Fatou'
            }
            await sendGrid(emailData);

            const _user = await User.findById(user._id).populate([{ path: 'roles' }]);

            // send response to client
            res.status(200).json({
                error: false,
                errors: [],
                data: { 
                    email: _user?.email,
                    _id: _user?._id,
                    id: _user?.id
                },
                message: 'successful',
                status: 200
            })
            
        } catch (err) {
            return next(new ErrorResponse('Error', 500, [`${err}`]));
        }


    }else{
        return next(new ErrorResponse('Error', 500, ['an error occured. please contact support']));
    }

});

// @desc    Add Recruiters to waiting list
// @route   POST /api/identity/v1/recruiters
// access   Public
export const addRecruiters = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { firstName, lastName, email, companyName, phoneNumber} = req.body;

    // find the user role
    const role = await Role.findOne({ name: 'user' });
    if(!role){
        return next(new ErrorResponse('An error occured. Please contact support.', 500, ['Roles not defined']));
    }

    if(!firstName){
        return next(new ErrorResponse('Error!', 400, ['firstname is required']));
    }

    if(!lastName){
        return next(new ErrorResponse('Error!', 400, ['lastName is required']));
    }
  
    if(!email){
        return next(new ErrorResponse('Error!', 400, ['email is required']));
    }

    if(!companyName){
        return next(new ErrorResponse('Error!', 400, ['company name is required']));
    }

    // validate existing email
      const exist = await User.findOne({ email: email });

      if(exist){
          return next(new ErrorResponse('Error', 400, ['email already exist, use another email']));
      }

      // validate existing company name
      const isExist = await User.findOne({ companyName: companyName });

      if(isExist){
          return next(new ErrorResponse('Error', 400, ['company name already exist, use another name']));
      }

      // create user
      const u = await User.create({
          firstName,
          lastName,
          email,
          companyName,
          phoneNumber,
          isUser: true,
          isActive: true
      })

      u.roles.push(role._id);
      await u.save();

      res.status(200).json({
        error: false,
        errors: [],
        message: `Successful`,
        data: u,
        status: 200
    });


})

// Helper function: get token from model, create cookie and send response
const sendTokenResponse = async (user: any, message: string, statusCode: number, res: Response): Promise<void> => {

	let result: any;

	// create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + 70 * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: false
	};

	// make cookie work for https
	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	const u = await User.findOne({ email: user.email }).populate({
		path: 'roles',
		select: '_id name',
	});

	const status = await Status.findOne({ user: user._id });

	if(!status){
		result = {
			profile: false,
			apply: {
				status: false,
				step: 1
			},
			activated: false
		}
	}else{
		result = {
			profile: status.profile ? status.profile  : false,
			apply: {
				status: status.apply.status,
				step: status.apply.step
			},
			activated: status.activated ? status.activated : false
		};
	}

	const userData = {
		_id: u?._id,
		email: u?.email,
		roles: u?.roles,
		phoneNumber: u?.phoneNumber,
		id: u?.id,
		isSuper: u?.isSuper,
		isActivated: u?.isActivated,
		isAdmin: u?.isAdmin,
		isUser: u?.isUser,
		isActive: u?.isActive,
		status: result
	}

	res.status(statusCode).cookie('token', token, options).json({
		error: false,
		errors: [],
		message: message,
		token: token,
		data: userData,
		status: 200
	});
};