const mongoose = require('mongoose');
const { Schema } = mongoose;
var uniqueValidator = require('mongoose-unique-validator')

// create database model for documents in the semantic_scholar_document collection
const semanticScholarDocumentSchema = new Schema({
    "accessed": {
        "type": "Date"
    },
    "abstract": {
        "type": "String"
    },
    "arxivId": {
        "type": "String",
    },
    "authors": {
        "type": [
            "Mixed"
        ]
    },
    "citationVelocity": {
        "type": "Number"
    },
    "citations": {
        "type": [
            "Mixed"
        ]
    },
    "citationCount": {
        "type": "Number"
    },
    "corpusId": {
        "type": "Number"
    },
    "doi": {
        "type": "String",
    },
    "fieldsOfStudy": {
        "type": [
            "String"
        ]
    },
    "influentialCitationCount": {
        "type": "Number"
    },
    "is_open_access": {
        "type": "Boolean"
    },
    "is_publisher_licensed": {
        "type": "Boolean"
    },
    "paperId": {
        "type": "String",
        unique: true,
        index: true,
        dropDups: true,
        required: true
    },
    "references": {
        "type": [
            "Mixed"
        ]
    },
    "title": {
        "type": "String"
    },
    "topics": {
        "type": [
            "Mixed"
        ]
    },
    "url": {
        "type": "String"
    },
    "venue": {
        "type": "String"
    },
    "year": {
        "type": "Number"
    },
    "embedding": {
        "type": [
            "Double"
        ]
    }
});

semanticScholarDocumentSchema.plugin(uniqueValidator);
const SemanticScholarDocument = mongoose.model('Semantic_Scholar_Document', semanticScholarDocumentSchema);
module.exports = SemanticScholarDocument;
