<!-- This component explains the lenses in visualization view to the user and is displayed in the documentation -->
<template>
  <v-container fluid
    ><h1>Lenses</h1>
    Lenses let users highlight specific properties of papers in any visualized
    graph. The Lense panel can be accessed by clicking
    <v-icon size="24px">mdi-layers</v-icon> in the bottom left corner, when
    viewing a graph. There are six different lenses available that can be used
    to reveal interesting correlations, analyze graphs in more depth and find
    interesting to read papers.
    <h3 class="mt-3">Default Lense</h3>
    The "default" lense highlights "seed" and "referenced" papers, this is
    exclusive to "Explore Cited Papers"-graphs (visualized by clicking the
    <v-icon size="24px">mdi-play-circle-outline</v-icon>-icon in document
    tables). Furthermore, papers that were added to a graph by inserting them
    from the exploration drawer (<v-icon size="24px">mdi-compass-outline</v-icon
    >-icon) are highlighted.
    <h3 class="mt-3">Relevance Lense</h3>
    The relevance lense highlights papers that are predicted to be relevant to
    the user based on the papers in their library. When papers in your library
    are similar to a paper in your graph, it is likely that this lense will show
    this papers as highly relevant to you. You can learn more about how
    similarity is determined in the
    <a @click="$router.push('/documentation/exploration')"
      >exploration section</a
    >.
    <h3 class="mt-3">Age Lense</h3>
    The "age" lense highlights papers that are new. The visualized range of
    years is alway ten years. Papers that were published ten or more years ago
    have the same color.
    <h3 class="mt-3">None Lense</h3>
    The "none" lense simply dyes all nodes in the same color to eliminates
    distractions caused by the different node colors.
    <h3 class="mt-3">User Lense</h3>
    The "user" lense dyes papers that were originally added by the same user in
    the same color. Each user gets a color from a color spectrum assigned and
    the documents added by a specific user are then dyed in their corresponding
    color. This lense can be helpful when visualizing a graph of papers from a
    group <v-icon size="24px">mdi-account-group</v-icon>, where multiple people
    contributed papers.
    <h3 class="mt-3">Source Lense</h3>
    The "source" lense works similar to the "user" lense. Instead of users, this
    lense dyes papers that were published by the same source in the same color.
  </v-container>
</template>

<script>
export default {};
</script>

<style>
</style>