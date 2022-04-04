<!-- Component that shows the text on the start page -->
<template>
  <v-container class="pb-0">
    <div class="mt-3">
      <v-row class="ml-0 pl-0">
        <h1 class="display-2 font-weight-bold mb-2">Welcome to TagVis</h1>
        <p class="subheading font-weight-bold">
          An interactive visualization tool for analyzing relations between
          academic papers
        </p>
        <v-row class="textmargin mt-3" justify="left">
          TagVis visualizes the connections between papers in an interactive
          way. Connections between papers are established through assigned tags
          or citation data. Tagging papers is facilitated by tag suggestions and
          users can collectively build (tagged) collections of papers, or discover
          further literature on their own. Visualized graphs can be saved and shared as
          interactive sessions.
        </v-row>
      </v-row>
      <v-row class="textmargin mt-3 mb-3" justify="left">
        <v-btn color="primary" large to="/learn-more" class="mr-2" filled
          >Learn More
          <v-icon size="24px" class="ml-2">mdi-school</v-icon></v-btn
        >
        <v-btn outlined color="primary" large to="/documentation/visualization"
          >Documentation
          <v-icon size="24px" class="ml-2"
            >mdi-file-document-multiple</v-icon
          ></v-btn
        >
      </v-row>
      <v-row class="textmargin mt-12" justify="left"
        ><p class="subheading font-weight-bold">
          Ready to give it a try? Upload a BibTeX file below or
          <a v-on:click="openSignUp">sign up</a> and use the tool to its full
          extent.
        </p></v-row
      >
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Introduction",

  data: () => ({}),
  methods: {
    openSignUp() {
      this.$store.commit("change_show_login_dialog", true);
    },
  },
});
</script>
<style scoped>
.textMargin {
  margin-left: 15px;
  margin-right: 15px;
}
</style>
