<!-- Learn more view, gives users a more detailed introduction to the tool -->
<template>
  <v-container fluid class="globalMaxWidth">
    <h1>Learn More</h1>
    In TagVis, researchers are able to import their library of papers to then
    view and interact with networks of their papers. The links between papers
    are established by user-defined tags, that were assigned to the papers, or
    by the incoming and outgoing citations. Generated networks are visualized as
    force-directed graphs, where related papers become identifiable by their
    edges and proximity to each other. Groups of similar documents form visible
    clusters while unrelated documents are positioned further away, which allows
    an easier distinction between related and unrelated papers. A non-static and
    interactive character of the visualization encourages users to explore and
    manipulate the graphs to discover further details, and empowers users to
    understand complex networks faster, compared to a static image. The tool
    also features collaborative elements, that allow colleagues to collectively
    build libraries of papers, and streamlines sharing and communicating
    analysis results and insights. Furthermore, users are supported at tagging
    their library by tag suggestions. The graphs being created from tags are
    visually dividable into research topics, which allows a fast identification
    of related papers. Related papers that are not yet in the user's library
    are identified by TagVis and recommended to the user.
    <v-img
      class="mt-4 mb-2 center"
      src="./../assets/example_graph.png"
      width="600"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
  components: {},
})
export default class LearnMore extends Vue {}
</script>

<style>
</style>
