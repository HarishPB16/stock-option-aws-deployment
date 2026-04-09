import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryData extends Document {
    singletonId: string;
    categoryObj: any;
    subCategoryObj: any;
    valueObj: any;
    updatedAt: Date;
}

const CategoryDataSchema = new Schema(
    {
        singletonId: { 
            type: String, 
            default: 'global_config',
            required: true, 
            unique: true 
        },
        categoryObj: { type: Schema.Types.Mixed, default: {} },
        subCategoryObj: { type: Schema.Types.Mixed, default: {} },
        valueObj: { type: Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
);

export const CategoryData = mongoose.model<ICategoryData>('CategoryData', CategoryDataSchema);
