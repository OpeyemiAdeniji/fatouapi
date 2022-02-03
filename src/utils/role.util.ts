const Role = require('../models/Role.model');

export const getRolesByName = async (roles: Array<string>): Promise<any> => {
	const result = roles.map(async (r) => await Role.findByName(r));
	const authorized = Promise.all(result);
	return authorized;
};

exports.getRoleNames = async (roleIDs: Array<string>): Promise<any> => {
	const result = roleIDs.map(async (r) => await Role.getRoleName(r));
	const rIds = Promise.all(result);
	return rIds;
};