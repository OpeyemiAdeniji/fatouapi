import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import asyncHandler from '../middleware/async.mw';

// models
import User from '../models/User.model';
import Role from '../models/Role.model';

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
