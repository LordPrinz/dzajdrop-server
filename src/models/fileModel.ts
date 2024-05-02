import mongoose, { type Document } from "mongoose";

export interface IFile extends Document {
	_id: string;
	fileName: string;
	secretKey: string;
	size: number;
	downloads: number;
	messageIds: string[];
	incrementDownloads: () => Promise<void>;
}

const fileSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true },
		fileName: { type: String, required: true },
		secretKey: { type: String, required: true },
		size: { type: Number, required: true },
		messageIds: { type: [String], required: true },
		downloads: { type: Number, default: 0 },
	},
	{
		versionKey: false,
		_id: false,
	}
);

fileSchema.set("toJSON", {
	transform: function (_, ret) {
		ret.id = ret._id;

		delete ret._id;
		delete ret.__v;
	},
});

fileSchema.set("toObject", {
	virtuals: true,
	transform: (_, ret) => {
		delete ret._id;
	},
});

fileSchema.methods.incrementDownloads = async function () {
	this.downloads += 1;
	await this.save();
};

let FileModel: mongoose.Model<IFile>;

try {
	FileModel = mongoose.model<IFile>("files");
} catch {
	FileModel = mongoose.model<IFile>("files", fileSchema);
}

export default FileModel;
