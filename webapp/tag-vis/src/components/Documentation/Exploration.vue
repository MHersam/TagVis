<!-- This component explains the paper exploration aspecct of TagVis to the user and is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Exploration</h1>
    Besides adding papers to their personal library themselves or getting papers
    from other users via groups <v-icon size="24px">mdi-account-group</v-icon> ,
    users can also explore further literature on their own in TagVis.
    <ol>
      <li>
        Users can find a list of papers related to papers in their library on
        their recommendations page <v-icon size="24px">mdi-compass</v-icon> .
        This list includes cited and referenced papers of papers in the user's
        library and considers similarity to papers in the user's library,
        citation count and recency to rank the recommendations.
      </li>
      <li>
        The visualization view provides an "exploration drawer" that shows
        related papers to the papers visualized in graphs. This list contains
        papers from the user's personal recommendation list (see 1.) that show
        strong similarity to the papers included in the graph. Users can then
        insert papers from the drawer into their graph, which may update the
        list again.
      </li>
      <li>
        Users can visualize the bibliography of a paper by clicking
        <v-icon size="24px">mdi-play-circle-outline</v-icon> in document table
        rows.
      </li>
    </ol>
    <h3 class="mt-3">Recommendations and Library Similarity</h3>
    Core requirement of our approach for the recommendations list and the
    exploration drawer is the ability to predict similarity of large amounts of
    individual papers to sets of papers at a fast pace. For that we are using
    Specter (<a href="https://arxiv.org/pdf/2004.07180.pdf" target="_blank"
      >paper</a
    >|<a href="https://github.com/allenai/specter" target="_blank">GitHub</a>),
    a pretrained model that uses title and abstract of papers to generate
    document representations. As soon as a user adds a paper to their library,
    this paper and all cited and referenced papers are embedded with specter.
    The the user's library is then clustered with the mean-shift algorithm and
    the clusters are saved to the database. Candidates for the recommendation
    list are all cited and referenced papers of papers in the user's library.
    Candidate papers are then compared to the cluster centroids of the user's
    library using the cosine similarity. The highest similarity is then used as
    library similarity which is worth 80% of the final score in the ranked
    recommendations list. Using the similarity to the cluster centroids ensures
    that users can also find recommendations for topics that are not dominant the
    library. The other 20% of the final score are split up between scores for
    high citation count and recency of publication. This leads to paper
    recommendations that are similar to the user's library, but also either
    highly cited or new.
  </v-container>
</template>

<script>
export default {};
</script>

<style>
</style>