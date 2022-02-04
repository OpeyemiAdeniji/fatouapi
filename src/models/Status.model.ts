import mongoose, { ObjectId } from 'mongoose'
import slugify from 'slugify'

// interface that describes the properties the model has
interface IStatusModel extends mongoose.Model<IStatusDoc> {

    // functions
    findByUser(id: any): IStatusDoc;

}

// interface that describes the properties that the Doc has
interface IStatusDoc extends mongoose.Document{

    profile: boolean;
    apply: object | any;
    activated: boolean;
    email: string;

    user: mongoose.Schema.Types.ObjectId | any

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: mongoose.Schema.Types.ObjectId;
    id: mongoose.Schema.Types.ObjectId;

    // functions
    findByUser(id: any): IStatusDoc;


}

const StatusSchema = new mongoose.Schema (

    {

        profile: {
            type: Boolean,
        },

        apply: {
            status: {
                type: Boolean,
            },
            step: {
                type: Number,
                default: 0
            }
        },

        activated: {
            type: Boolean,
        },

        email: {
            type: String
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

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

StatusSchema.set('toJSON', { getters: true, virtuals: true });

StatusSchema.pre<IStatusDoc>('save', async function(next){
    next();
});

StatusSchema.statics.findByUser = (id: any) => {
    return Status.findOne({user: id});
}

// define the model constant
const Status = mongoose.model<IStatusDoc, IStatusModel>('Status', StatusSchema);

export default Status;
