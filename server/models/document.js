const mongoose = require('mongoose');
const { Schema } = mongoose;
var uniqueValidator = require('mongoose-unique-validator')

// create database model for documents in the document collection
const documentSchema = new Schema(
	{
		"user": {
			"type": mongoose.Schema.Types.ObjectId,
			"ref": 'User'
		},
		"origin": {
			"type": "String",
			//"required": true
		},
		"mendeley_id": {
			"type": "String",
			/*
			index: true,
			unique: true,
			dropDups: function () { return this.origin === "mendeley" },
			required: function () { return this.origin === "mendeley" }	
			*/		
		},
		"zotero_id": {
			"type": "String",
		},
		"version": {
			"type": "String",
		},
		"file_attached": {
			"type": Boolean
		},
		"semantic_scholar_document": {
			"type": mongoose.Schema.Types.ObjectId,
			"ref": 'Semantic_Scholar_Document'
		},
		"tags": {
			"type": [
				"String"
			]
		},
		"title": {
			"type": "String"
		},
		"type": {
			"type": "String"
		},
		"authors": {
			"type": [
				"Mixed"
			]
		},
		"authors_string": {
			"type": "String"
		},
		"year": {
			"type": "Number"
		},
		"created": {
			"type": "Date"
		},
		"last_modified": {
			"type": "Date"
		},
		"source": {
			"type": "String"
		},
		"identifiers": {
			"doi": {
				"type": "String"
			},
			"issn": {
				"type": "String"
			},
			"isbn": {
				"type": "String"
			},
			"arxiv": {
				"type": "String"
			},
			"mag": {
				"type": "String"
			},
			"acl": {
				"type": "String"
			},
			"pmid": {
				"type": "String"
			},
			"paperId": {
				"type": "String"
			}
			//...
		},
		"keywords": {
			"type": [
				"String"
			]
		},
		"abstract": {
			"type": "String"
		},
		"embedding": {
			"type": [
				"Double"
			]
		}
	}
);
documentSchema.plugin(uniqueValidator);
const Documents = mongoose.model('Document', documentSchema);
module.exports = Documents;
