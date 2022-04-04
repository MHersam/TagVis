const mongoose = require('mongoose');
const { Schema } = mongoose;

// create database model for documents in the session collection
const sessionSchema = new Schema({
	name: {
		type: String
	},
	description: {
		type: String
	},
	type: {
		type: String
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	/*
	documents: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Document'
	}],
	*/
	views: {
		type: Number
	},
	preview_image: {
		type: String
	},
	created: {
		type: Date,
	},
	graph: {
		type: "Mixed",
		/*
		"links": {
			"type": [
				"Mixed"
			]
		},
		"nodes": {
			"type": [
				"Mixed"
			]
		},
		"uniqueTags": {
			"type": [
				"String"
			]
		},
		*/
	},
	tags:
		[
			{
				"name": {
					type: String
				},
				"weight": {
					type: Number
				},
				"isHighlighted": {
					type: Boolean
				},
				"isIgnored": {
					type: Boolean
				},
			}
		],
	active_lense: {
		type: String
	},
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
