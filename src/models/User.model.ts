import crypto from 'crypto';
import mongoose, { ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Role from './Role.model';

interface IUserModel extends mongoose.Model<IUserDoc> {
    build(attrs: any): IUserDoc,
	getSignedJwtToken(): any,
	hasRole(role: any, roles: Array<ObjectId>): boolean,
	findByEmail(email: string): IUserDoc,
}

interface IUserDoc extends mongoose.Document {

    firstName: string;
    lastName: string;
	companyName: string;
	phoneNumber: string;
	email: string;

	activationToken: string | undefined;
	activationTokenExpire: Date | undefined;
	resetPasswordToken: string | undefined;
	resetPasswordTokenExpire: Date | undefined;
	emailCode: string | undefined;
	emailCodeExpire: Date | undefined;

	isSuper: boolean;
	isActivated: boolean;
	isAdmin: boolean;
	isUser: boolean;
	isActive: boolean;

	// relationships
	country: mongoose.Schema.Types.ObjectId | any;
	status: mongoose.Schema.Types.ObjectId | any;
	roles: Array<mongoose.Schema.Types.ObjectId | any>;

    // time stamps
    createdAt: string;
    updatedAt: string;
	_version: number;
	_id: mongoose.Schema.Types.ObjectId;
	id: mongoose.Schema.Types.ObjectId;

	// props for the model
	build(attrs: any): IUserDoc,
	getSignedJwtToken(): any,
	hasRole(role: any, roles: Array<ObjectId>): Promise<boolean>,
	findByEmail(email: string): IUserDoc,

}

const UserSchema = new mongoose.Schema(

    {
        firstName: {
            type: String
        },
 
        lastName: {
            type: String
        },

        phoneNumber: {
			type: String
		},

        email: {
			type: String,
			required: [true, 'email is required'],
			unique: [true, 'email already exist'],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'a valid email is required',
			],
		},

        activationToken: String,
		activationTokenExpire: Date,
		resetPasswordToken: String,
		resetPasswordTokenExpire: Date,
		emailCode: String,
		emailCodeExpire: Date,
		inviteToken: String,
		inviteTokenExpire: Date,

        isSuper: {
			type: Boolean,
			default: false
		},

        isActivated: {
			type: Boolean,
			default: false
		},

        isAdmin: {
			type: Boolean,
			default: false
		},

        isUser: {
			type: Boolean,
			default: false
		},

		isActive: {
			type: Boolean,
			default: false
		},

    
		status: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Status',
		},

        roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Role',
				required: true,
			},
		],

    },
    {

        timestamps: true,
		versionKey: '_version',
		toJSON: {
			transform(doc, ret){
				ret.id = ret._id
			}
		}

    }

)

UserSchema.set('toJSON', {getters: true, virtuals: true});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id, email: this.email, roles: this.roles }, process.env.JWT_SECRET as string, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Find out if user has a role
UserSchema.methods.hasRole = async (name: any, roles: Array<ObjectId>): Promise<boolean> => {

	let flag = false;

	const _role = await Role.findOne({ name: name });

	for (let i = 0; i < roles.length; i++) {
		if (roles[i].toString() === _role?._id.toString()) {
			flag = true;
			break;
		}
	}

	return flag;
};

UserSchema.statics.findByEmail = (email) => {
	return User.findOne({ email: email });
};

// this function helps us to check with typescript
UserSchema.statics.build = (attrs: any) => {
    return new User(attrs)
}

// define the model
const User = mongoose.model<IUserDoc, IUserModel>('User', UserSchema);

export default User;