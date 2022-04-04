const User = require('../models/user.js');
const Documents = require('../models/document.js');
const SemanticScholarDocument = require('../models/semantic_scholar_document.js');
const specterEmbeddingService = require('./specter_embedding')

// service to update the recommendations for a user.
updateRecommendations = (userId) => {
    return new Promise(async function (resolve, reject) {
        var user = await User.findOne({ _id: userId }, { library_clusters: 1, library_recommendation_blacklist: 1 })
        if (user) {
            var libraryDocuments = await Documents.find({ user: user._id }, { embedding: 1, semantic_scholar_document: 1 }).populate({ path: "semantic_scholar_document", select: "paperId citations references" }).catch(err => { reject(err); })
            //paperIds of papers that we need to get from DB to get the saved embeddings
            var candidatesToRetrieve = []
            //paperIds of papers that already are in the users library
            alreadyInLibrary = []
            //paperIds of papers the user manually added to their blacklist
            blacklisted = user.library_recommendation_blacklist.map(d => d.paperId)

            libraryDocuments.forEach(doc => {
                if (doc && doc.semantic_scholar_document) {
                    if (doc.semantic_scholar_document.citations) {
                        doc.semantic_scholar_document.citations.forEach(c => {
                            candidatesToRetrieve.push(c.paperId)
                        });
                    }
                    if (doc.semantic_scholar_document.references) {
                        doc.semantic_scholar_document.references.forEach(r => {
                            candidatesToRetrieve.push(r.paperId)
                        });
                    }
                    alreadyInLibrary.push(doc.semantic_scholar_document.paperId)
                }
            });
            // remove duplicates
            candidatesToRetrieve = [...new Set(candidatesToRetrieve)];

            // remove papers that already are in the user's library
            alreadyInLibrary = [...new Set(alreadyInLibrary)];
            candidatesToRetrieve = candidatesToRetrieve.filter(paperId => !alreadyInLibrary.includes(paperId) && !blacklisted.includes(paperId))

            var candidates = await SemanticScholarDocument.find({ paperId: candidatesToRetrieve }, { embedding: 1, paperId: 1, citationCount: 1, year: 1 }).catch(err => { reject(err); })

            var rankedRecommendations = [];
            candidates.forEach(candidate => {
                var similarityScore = librarySimilarity(candidate.embedding, user);
                var ageInYears = candidate.year ? Math.min(new Date().getFullYear() - candidate.year, 10) : 10
                var recencyScore = 1 - ageInYears / 10
                var impactScore = Math.min(Math.log10(candidate.citationCount + 1), 4) / 4;
                var relevance = similarityScore * 0.8 + recencyScore * 0.1 + impactScore * 0.1;
                rankedRecommendations.push({ paperId: candidate.paperId, relevance: relevance })
            });
            //sort descending by relevance
            rankedRecommendations.sort(function (a, b) { return (a.relevance < b.relevance) ? 1 : ((b.relevance < a.relevance) ? -1 : 0); })
            if (rankedRecommendations.length > 10000) {
                rankedRecommendations = rankedRecommendations.slice(0, 10000);
            }

            User.findOneAndUpdate({ _id: user._id }, { library_ranked_recommendations: { list: rankedRecommendations, length: rankedRecommendations.length } }).then(() => { resolve(); console.log("recommendations updated") }).catch(err => reject(err))

            // returns the similarity to the user's library cluster with the highest similarity
            function librarySimilarity(embedding, user) {
                var clusters = user.library_clusters;
                var librarySimilarity = 0;
                clusters.forEach(cluster => {
                    let sim = cosinesim(embedding, cluster.centroid)
                    librarySimilarity = Math.max(sim, librarySimilarity)
                });
                return librarySimilarity;
            }
            // cosine similarity between two vectors A and B
            function cosinesim(A, B) {
                var dotproduct = 0;
                var mA = 0;
                var mB = 0;
                for (i = 0; i < A.length; i++) {
                    dotproduct += (A[i] * B[i]);
                    mA += (A[i] * A[i]);
                    mB += (B[i] * B[i]);
                }
                mA = Math.sqrt(mA);
                mB = Math.sqrt(mB);
                var similarity = (dotproduct) / ((mA) * (mB))
                return similarity;
            }
        } else {
            reject()
        }
    })
}
exports.updateRecommendations = updateRecommendations;

// This function is intended as background task that is run periodically. It finds and embeds new citations that SemanticScholar documents received and updates the recommendation lists of all users
fetchNewCitationsAndUpdateRecommendations = () => {
    User.find({}, { _id: 1 }).then(async users => {
        for (let i = 0; i < users.length; i++) {
            console.log("Background recommendation list update currently at user " + (i + 1) + " of " + users.length)
            var userDocs = await Documents.find({ user: users[i]._id }, { semantic_scholar_document: 1, identifiers: 1 })
            for (let j = 0; j < userDocs.length; j++) {
                // I am very afraid of this function. Better do one doc at a time here to not risk system instability for this. there are potentially thousands of docs with thounds of citations each in a library which would completely wreck RAM usage
                await specterEmbeddingService.embedCitedAndReferencedDocument(new Array(userDocs[j]))
            }
            await this.updateRecommendations(users[i]._id)
        }
    })
}
exports.fetchNewCitationsAndUpdateRecommendationss = fetchNewCitationsAndUpdateRecommendations;
