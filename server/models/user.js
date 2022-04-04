const mongoose = require('mongoose');
const { Schema } = mongoose;
var uniqueValidator = require('mongoose-unique-validator')
//const MendeleyUser = require('./mendeley_user.ts');

// create database model for documents in the user collection
const userSchema = new Schema({
    display_name: {
        type: String,
        required: true,
    },
    account_type: {
        type: String,
        required: true,
    },
    auth_token: {
        type: String,
        required: true,
    },
    auth_token_expires: {
        type: Date,
        required: true,
    },
    refresh_token: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: false,
    },
    created: {
        type: Date,
        required: true
    },
    "settings": {
        "dark_theme": {
            "type": "Boolean"
        },
        "multi_expand": {
            "type": "Boolean"
        },
        "number_of_table_rows": {
            "type": "String"
        },
        "png_resolution_scale": {
            "type": "String"
        },
        "node_size_citation_count": {
            "type": "Boolean"
        },
        "add_semantic_scholar_topics_to_graphs": {
            "type": "Boolean"
        },
        "default_graph_type": {
            "type": "String"
        },
    },
    "library_embedding": {
        "type": [
            "Double"
        ]
    },
    "library_clusters":
        [
            {
                id: {
                    "type": "Number"
                },
                centroid: {
                    "type": [
                        "Double"
                    ]
                },
                numberOfDocuments: {
                    "type": "Number"
                },
                documents: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Document'
                }]
            }
        ],

    "library_ranked_recommendations": {
        length: {
            "type": "Number"
        },
        list: [
            {
                paperId: {
                    "type": "String"
                },
                relevance: {
                    "type": "Decimal128"
                }
            }

        ]
    },
    "library_recommendation_blacklist": [{
        paperId: {
            "type": "String"
        },
        semantic_scholar_document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semantic_Scholar_Document'
        }
    }],
    tagvis: {
        username: {
            type: String,
            index: true,
            "unique": true,
            dropDups: function () { return this.account_type === 'TagVis'; },
            required: function () { return this.account_type === 'TagVis'; },
            sparse: true
        },
        hashed_password: {
            type: String,
            required: function () { return this.account_type === 'TagVis'; },
            sparse: true
        },
    },
    mendeley: {
        "id": {
            type: String,
            index: true,
            unique: true,
            required: function () { return this.account_type === 'Mendeley'; },
            sparse: true
        },
        "first_name": {
            "type": "String"
        },
        "last_name": {
            "type": "String"
        },
        "display_name": {
            "type": "String"
        },
        "link": {
            "type": "String"
        },
        "research_interests": {
            "type": "String"
        },
        "academic_status": {
            "type": "String"
        },
        "disciplines": {
            "type": [
                "Mixed"
            ]
        },
        "photos": {
            "type": [
                "Mixed"
            ]
        },
        "verified": {
            "type": "Boolean"
        },
        "location": {
            "latitude": {
                "type": "Number"
            },
            "longitude": {
                "type": "Number"
            },
            "name": {
                "type": "String"
            }
        },
        "created_at": {
            "type": "Date"
        },
        "education": {
            "type": [
                "Mixed"
            ]
        },
        "employment": {
            "type": [
                "Mixed"
            ]
        }
    },
    zotero: {
        "id": {
            type: String,
            index: true,
            unique: true,
            required: function () { return this.account_type === 'Zotero'; },
            sparse: true
        },
        "username": {
            type: String,
            index: true,
            unique: true,
            required: function () { return this.account_type === 'Zotero'; },
            sparse: true
        },
        "oauth_token_secret": {
            type: String,
            index: true,
            unique: true,
            required: function () { return this.account_type === 'Zotero'; },
            sparse: true
        },
        "oauth_token": {
            type: String,
            index: true,
            unique: true,
            required: function () { return this.account_type === 'Zotero'; },
            sparse: true
        },
        "library_version": {
            type: "String",
        },
        "real_name": {
            "type": "String"
        },
    }
});
userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);
module.exports = User;
