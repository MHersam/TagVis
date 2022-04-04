<!-- The Help component that explains the basic controls of the visualization and provides a legend of the users that contributed to the displayed graph -->
<template>
  <v-container>
    <v-sheet
      v-if="this.$store.getters.get_is_help_visible"
      style="
        position: absolute;
        bottom: 60px;
        left: 10px;
        overflow: auto;
        opacity: 0.9;
      "
      class="pa-3 pb-0"
      max-height="calc(100% - 125px)"
      max-width="800px"
      elevation="5"
      rounded
    >
      <b>Controls:</b><br />
      <div class="mb-3">
        Zoom: Scroll wheel up and down<br />
        Pan: Click on white space and move mouse<br />
        Drag node: Click node and move mouse <br />
        Highlight first-order neighbourhood: hover/click node<br />
        Show document details: double click node<br />
        Highlight<span v-if="isTagGraph">, ignore and weight</span>
        tags: click
        <v-icon v-on:click="openTagPreferences">mdi-tag-text</v-icon>
      </div>
    </v-sheet>
  </v-container>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  name: "Help",
  data: () => ({
    isTagGraph: true,
  }),
  watch: {
    "$store.getters.get_graph": function (val) {
      this.isTagGraph = val.type == this.$store.getters.get_graph_type_items[0];
    },
  },
  methods: {
    openTagPreferences() {
      this.$store.commit("change_show_tag_preferences", true);
    },
  },
  mounted() {
    if (
      this.$store.getters.get_graph &&
      this.$store.getters.get_graph.type !=
        this.$store.getters.get_graph_type_items[0]
    )
      this.isTagGraph = false;
  },
  destroyed() {
    this.$store.commit("change_is_help_visible", false);
  },
});
</script>
<style scoped>
</style>
