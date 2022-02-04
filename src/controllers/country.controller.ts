import mongoose, { Document, ObjectId } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/error.util';
import asyncHandler from '../middleware/async.mw';
import { strIncludesEs6, isString, strToArrayEs6  } from '../utils/functions.util';

import Country from '../models/Country.model';

// @desc    Get All Countries
// @route   GET /api/resources/v1/countries
// access   Public
export const getCountries = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json(res.advancedResults);
})

// @desc    Get A Country
// @route   GET /api/resource/v1/countries/:id
// access   Public
export const getCountry = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	let reqId = req.params.id 
    let country;

	if(strIncludesEs6(reqId, '+')){ // find a country by phoneCode
		country = await Country.findOne({ phoneCode: reqId });
	}

	if(mongoose.Types.ObjectId.isValid(reqId)){ // find by valid mongoose ID
		country = await Country.findById(reqId); 
	} 

    if(!country){
        return next(new ErrorResponse('Cannot find country', 404, [`Cannot find country`]))
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: country,
        message: 'successful',
        status: 200
    })

})

// @desc     Get all states for a country
// @route    GET /api/v1/countries/states/:id
// @access   Public
export const getStates = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	
	const c = await Country.findById(req.params.id)

	if (!c) {
		return next(
			new ErrorResponse(`Cannot find country]`, 404, [`Cannot find country [${req.params.id}`])
		);
	}    

	const states = c.states;
	const countryData = {
		_id: c._id,
		name: c.name,
		code2: c.code2,
		code3: c.code3,
		region: c.region,
		subregion: c.subregion
	}

	res.status(200).json({
        error: false,
        errors: [],
        data: { country: countryData, states: states },
		message: `successfull`,
        status: 200
	});

})

/** 
 * snippet
 * **/ 

// @desc        Login user (with verification)
// @route       POST /api/identity/v1/auth/login
// @access      Public
// export const funcd = asyncHandler(async (req: Request, res:Response, next: NextFunction) => {

// })