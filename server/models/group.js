const mongoose = require('mongoose');
const { Schema } = mongoose;
// create database model for documents in the group collection
const groupSchema = new Schema({
	name: {
		type: String
	},
	description: {
		type: String
	},
	members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	admins: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	documents: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Document'
	}],
	numberOfDocuments: {
		type: Number
	},
	tags: [{ type: String }],
	created: {
		type: Date
	},
	last_modified: {
		type: Date
	}
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
