const workerpool = require('workerpool');

// worker for the computation of links in bibliographic correlations graphs
function distance(ssdi, ssdj, i, j) {
    var citationStrength = 0;
    var couplingStrength = 0;
    var BreakException = {}
    if (ssdi._doc) ssdi = ssdi._doc;
    if (ssdj._doc) ssdj = ssdj._doc;
    
    ssdi.citations.forEach(citation => {
        try {
            ssdj.citations.forEach(c => {
                if (citation.paperId == c.paperId) { citationStrength += 1; throw BreakException; }
            });
        } catch (error) {
            if (error !== BreakException) throw error;
        }
    });
    ssdi.references.forEach(reference => {
        try {
            ssdj.references.forEach(r => {
                if (reference.paperId == r.paperId) { couplingStrength += 1; throw BreakException; }
            });
        } catch (error) {
            if (error !== BreakException) throw error;
        }
    });
    var coCitationSimilarity = 0;
    var bibliographicCouplingSimilarity = 0;

    if (citationStrength > 0) {
        coCitationSimilarity = 0.5 * Math.log10(1 + 99 * citationStrength / Math.min(ssdi.citations.length, ssdj.citations.length));
    }
    if (couplingStrength > 0) {
        bibliographicCouplingSimilarity = 0.5 * Math.log10(1 + 99 * couplingStrength / Math.min(ssdi.references.length, ssdj.references.length));
    }
    return { dist: (citationStrength > 0 || couplingStrength > 0) ? Math.max(coCitationSimilarity, bibliographicCouplingSimilarity) : -1, i: i, j: j };
}

workerpool.worker({
    distance: distance
});