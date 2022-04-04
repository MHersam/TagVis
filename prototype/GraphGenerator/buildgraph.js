const fs = require('fs');

var input = JSON.parse(fs.readFileSync("input.json", 'utf8'));

var output = {};
output.graph = [];

var nodes = [];
var count = 0;
input.forEach(doc => {
    var entry = {};
    entry.id = "n"+count;
    entry.type = "circle";
    entry.tags = doc.tags;
    entry.authors = doc.authors;
    entry.title = doc.title;
    entry.abstract = doc.abstract;
    entry.year = doc.year;
    nodes.push(entry)
    count++;
});
count = 0;

var links = [];
for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
        linkTags = [];
        nodes[i].tags.forEach(t1 => {
            if(nodes[j].tags.includes(t1)){
                linkTags.push(t1)
            }
        });
        if(linkTags.length > 0){
            var entry = {};
            entry.id = "l"+count;
            entry.source = i;
            entry.target = j;
            entry.distance = 100;
            entry.tags = linkTags;

            tagUnion = new Set();
            nodes[i].tags.forEach(tagUnion.add, tagUnion)
            nodes[j].tags.forEach(tagUnion.add, tagUnion)

            entry.correspondenceRatio = linkTags.length / tagUnion.size;
            links.push(entry);
            count++;
        }else{
            //experimental
            var entry = {};
            entry.id = "l"+count;
            entry.source = i;
            entry.target = j;
            entry.distance = 400;
            entry.tags = [];
            entry.correspondenceRatio = 0;
            links.push(entry);
            count++;
        }
    }
}
links.sort(function(a, b){return a.correspondenceRatio - b.correspondenceRatio})

output.links = links;
output.nodes = nodes;
output.directed = false;
output.multigraph = false;
console.log(output)

let data = JSON.stringify(output);
fs.writeFileSync('graph.json', data);