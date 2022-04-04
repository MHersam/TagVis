<!-- This component explains the similarity measure in more depth to the user. It is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Similarity Measures</h1>
    Measures of similarity are essential for the generation of graphs. Some
    measure is required to compare two documents, in order to decide if there
    should be a link connecting a pair of documents. Links in the visualizations
    are not only showing that there is some relation between two documents, but
    they also show how related documents are, by varying link lengths. Shorter
    edges show a closer relationship between two papers, and a subgraph with
    similar papers stands out as dense cluster. The system lets users choose
    between different kinds of similarity measures to base graphs on: tags,
    bibliographic correlations and direct citations. The following measures all
    result in a value between zero and one, representing the similarity between
    two documents. A similarity score of one is the highest and indicates the
    closest relationship possible. The similarity is used to determine the
    target edge lengths in visualized graphs and changes the elasticity and
    brightness of edges. Two strongly related documents will share a short,
    strong and dark edge. Two papers are linked, when the similarity between the
    two is larger than zero.
    <h3 class="mt-3">Tags as Content-Centered Similarity Measure</h3>
    The use of tags to compare the similarity between two publications is the
    main focus of this project. Custom tags allow a content-based evaluation of
    similarity between papers, that is tailored to the user. Every document has
    a set of tags assigned to it. The chosen approach makes use of the Jaccard
    similarity coefficient, which measures the similarity between two general
    sets. The Jaccard similarity coefficient between two sets A and B is defined
    as
    <v-img
      class="mt-2 mb-2 center"
      src="./../../assets/documentation/equations/jaccard.png"
      width="200"
    />This is refined by tag weights, that users can dynamically change. Users
    can weight all occurring tags in a visualization individually and manipulate
    the edge lengths with that. Changes are applied to the graph in real-time.
    Another way users can change the tag graph is to ignore specific tags. An
    edge contains the intersection of the tag sets of the two connected
    documents, ignoring an tag temporarily removes it from all edges. This
    influences the edge lengths and leads to a removal of links between nodes,
    when no mutual tags are left. When a tag is ignored, it is temporarily
    removed from nodes. This influences the edge lengths and can lead to a
    removal of links between nodes, when no mutual tags are left.
    <h3 class="mt-3">Bibliographic Correlations as Similarity Measure</h3>
    The co-citation similarity between two given documents a and b is calculated
    as
    <v-img
      class="mt-2 mb-2 center"
      src="./../../assets/documentation/equations/co_citation.png"
      width="400"
    />
    where C<sub>i</sub> is a set of other documents, citing document i.<br />The
    bibliographic coupling similarity between two given documents a and b is
    calculated similar to the co-citation similarity as <v-img
      class="mt-2 mb-2 center"
      src="./../../assets/documentation/equations/bibliographic_coupling.png"
      width="400"
    /> where R<sub>i</sub> is a set of other documents, referenced by
    document i.<br>Equation 3.3 and 3.4 use the log scale as correction to
    distribute the data points more evenly across the interval [0; 1], as it
    became apparent that the uncorrected similarity coefficients tend to pile up
    at the lower end of the interval. Document pairs with a low double-digit
    percentage of matching references or citations already indicate a strong
    relationship while high percentages are uncommon and this correction
    accounts for that.<br>The bibliographic coupling- and co-citation
    similarities are then combined as <v-img
      class="mt-2 mb-2 center"
      src="./../../assets/documentation/equations/bibliographic_correlations.png"
      width="380"
    /> to obtain a similarity measure based on both
    concepts. Using the maximum treats both measures equally and prevents a
    degradation of the combined score, when a large gap is present.
    <h3 class="mt-3">Direct Citation</h3>
    Two documents share an edge when one document directly cites the other.
    Edges have a standard length that is shortened when the paper was strongly
    influenced by the referenced paper. Highly influential citations are
    identified and provided by
    <a href="https://www.semanticscholar.org/" target="_blank"
      >Semantic Scholar</a
    >. They use a machine-learning model considering different factors such the
    the number of citations to a publication and the context of each citation to
    identify citations with significant impact.
    <h3 class="mt-3">Source of Bibliographic Records</h3>
    A reliable source of bibliographic records is crucial to use the concepts of
    co-citation, bibliographic coupling and direct citation as similarity
    measures. For our use case, the records need to include citations and
    references of the documents.<br>To calculate the similarity between two
    documents, records for both documents are required. When a record is
    missing, an evaluation of similarity is not possible for this pair of
    documents. To ensure finding as many documents as possible, a database with
    a large corpus is needed. Bibliographic databases available online can
    usually be queried by document identifiers such as the DOI. With the chosen
    approach, corresponding records can only be retrieved, when a supported
    document identifier is provided. The service used for this project to
    retrieve bibliographic records is
    <a href="https://www.semanticscholar.org/" target="_blank"
      >Semantic Scholar</a
    >. Lightweight programmatic access to their corpus of over 190 million
    papers (in January 2021) is provided by an API. Paper records can be looked
    up by different popular identifiers, the supported ones are DOI, ArXiv ID,
    MAG ID, ACL ID and PubMed ID. This flexibility enables the tool to find
    corresponding records of more papers on average. Access to the
    <a href="https://api.semanticscholar.org/" target="_blank"
      >Semantic Scholar API</a
    >
    is limited, but entering into a partnership promises increased rates, which
    makes their service feasible for this project. A request queue ensures that
    the rate limit is not exceeded. Besides metadata of papers,
    <a href="https://www.semanticscholar.org/" target="_blank"
      >Semantic Scholar</a
    >
    also provides other interesting data that is beneficial to this project.
    They classify papers into topics. Topics are very similar to what tags are,
    they group papers covering similar content under a more general term. Topics
    are utilized as suggestions for tags, that users can apply to their papers
    to tag their library quickly and consistently.</v-container
  >
</template>

<script>
export default {};
</script>

<style>
</style>