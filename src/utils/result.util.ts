import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

export const queryResults = async (model: Model<any>, ref: string, data: any, queryParam: any, populate: Array<any> = []): Promise<any> => {

    let query: any;

    // copy request query
	const reqQuery = { ...queryParam };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removeFields and delete them from request query
	removeFields.forEach((p) => delete reqQuery[p]);

	// create query string
	let queryStr = JSON.stringify(reqQuery);

    // create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

    // find resource
	query = model.find(JSON.parse(queryStr)).where(`${ref}`).equals(data._id);

    // select fields
	if (queryParam.select) {
		const fields = queryParam.select.toString().split(',').join(' ');
		query = query.select(fields);
	}

    // sort
	if (queryParam.sort) {
		const sortBy = (queryParam.sort as string).split(',').join(' ');
		query = query.select(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

    // pagination
	const page = queryParam.page ? parseInt(queryParam.page.toString(), 10) : 1;
	const limit = queryParam.limit ? parseInt(queryParam.limit.toString(), 10) : 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //populate
	if (populate) {
		query = query.populate(populate);
	}

    // execute query
	const results: any = await query;
	const totalRec = await model.find({}).where(`${ref}`).equals(data._id);

    // Pagination result
	const pagination: any = {};

    if (endIndex < totalRec.length) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

    const result = {
		total: totalRec.length,
		count: results.length,
		pagination: pagination,
		data: results,
	};

	return result;

}