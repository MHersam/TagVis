<!-- component for weighting, highlighting and ignoring tags during the visualization -->
<template>
  <v-container>
    <v-sheet
      v-if="this.$store.getters.get_show_tag_preferences"
      style="
        position: absolute;
        top: 65px;
        left: 10px;
        overflow: auto;
        opacity: 0.9;
      "
      max-height="calc(100% - 125px)"
      max-width="calc(100% - 20px)"
      elevation="5"
      rounded
    >
      <v-container class="ma-0 pa-0">
        <v-row
          v-bind:key="tag"
          v-for="tag in tags"
          align="center"
          justify="center"
          class="pa-0 ml-0 mr-0 mt-1 mb-1"
          style="flex-wrap: nowrap"
        >
          <v-col class="flex-shrink-0 flex-grow-1 ml-2 pa-0">
            <span style="font-weight: bold">{{ tag }} </span>
          </v-col>
          <v-col class="flex-grow-0 flex-shrink-0 pt-1 pb-1 pr-0 pl-0">
            <div class="d-flex align-center">
              <v-slider
                v-model="sliderValues[tags.indexOf(tag)]"
                max="100"
                min="0"
                dense
                v-if="isTagGraph"
                style="width: 200px; display: inline-block"
                class="ml-1 mr-1"
                hide-details
                :disabled="isIgnored[tags.indexOf(tag)]"
              >
              </v-slider>
              <v-text-field
                v-model="sliderValues[tags.indexOf(tag)]"
                hide-details
                single-line
                type="number"
                max="100"
                min="0"
                outlined
                dense
                :disabled="isIgnored[tags.indexOf(tag)]"
                v-if="isTagGraph"
                style="width: 80px; display: inline-block"
              ></v-text-field>
              <v-btn
                icon
                text
                large
                v-on:click="highlight(tag)"
                :color="highlightButtonColors[tags.indexOf(tag)]"
                ><v-icon>mdi-marker</v-icon></v-btn
              >
              <v-btn
                icon
                text
                large
                v-on:click="ignore(tag)"
                v-if="isTagGraph"
                :color="isIgnored[tags.indexOf(tag)] ? 'error' : ''"
                ><v-icon v-if="isIgnored[tags.indexOf(tag)]">mdi-eye</v-icon
                ><v-icon v-else>mdi-eye-off</v-icon></v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  name: "TagPreferences",
  data: () => ({
    tags: [],
    sliderValues: [],
    highlightButtonColors: [],
    isIgnored: [],
    init: true,
    isTagGraph: true,
  }),
  watch: {
    "$store.getters.get_graph": function (val) {
      this.isTagGraph = val.type == this.$store.getters.get_graph_type_items[0];
      if (!this.$store.getters.get_session.tags && this.init) {
        this.tags = val.uniqueTags;
        for (let i = 0; i < this.tags.length; i++) {
          this.sliderValues.push(50);
          this.highlightButtonColors.push("");
          this.isIgnored.push(false);
        }
        this.init = false;
      } else if (
        this.$store.getters.get_session.tags.length < val.uniqueTags.length
      ) {
        // nodes were inserted that have new tags, we have to init those
        //TODO: sort tags, right now new tags are just pushed at the end of the list
        var oldTags = this.$store.getters.get_session.tags.map((d) => d.name);
        val.uniqueTags.forEach((tag) => {
          if (!oldTags.includes(tag)) {
            this.tags.push(tag);
            this.sliderValues.push(50);
            this.highlightButtonColors.push("");
            this.isIgnored.push(false);
          }
        });
      } else {
        var sessionTags = this.$store.getters.get_session.tags;
        var tags = [];
        var sliderValues = [];
        var highlightButtonColors = [];
        var isIgnored = [];
        for (let i = 0; i < sessionTags.length; i++) {
          tags.push(sessionTags[i].name);
          sliderValues.push(sessionTags[i].weight);
          highlightButtonColors.push(
            sessionTags[i].isHighlighted
              ? this.$vuetify.theme.currentTheme.accent
              : ""
          );
          isIgnored.push(sessionTags[i].isIgnored);
        }
        this.tags = tags;
        this.sliderValues = sliderValues;
        this.highlightButtonColors = highlightButtonColors;
        this.isIgnored = isIgnored;
        this.assignNodeColors();
      }
    },
    sliderValues: function (val) {
      this.updateSession();
    },
    highlightButtonColors: function (val) {
      this.updateSession();
    },
    isIgnored: function (val) {
      this.updateSession();
    },
    "$store.getters.get_active_lense": function (val) {
      if (val != "tagHighlight" && this.$store.getters.get_session.tags) {
        this.highlightButtonColors = [];
        for (let i = 0; i < this.$store.getters.get_session.tags.length; i++) {
          this.highlightButtonColors.push("");
        }
        this.updateSession();
      }
    },
  },
  methods: {
    updateSession() {
      const store = this.$store;
      var session = { tags: [], graph: {} };
      for (let i = 0; i < this.sliderValues.length; i++) {
        var tag = {};
        tag.name = this.tags[i];
        tag.weight = this.sliderValues[i];
        tag.isHighlighted = this.highlightButtonColors[i] != "";
        tag.isIgnored = this.isIgnored[i];
        session.tags.push(tag);
      }
      store.commit("change_session", session);
    },
    highlight(tag) {
      const highlightColor = this.$vuetify.theme.currentTheme.accent;
      const baseNodeColor = this.$vuetify.theme.currentTheme.primary;
      const index = this.tags.indexOf(tag);
      const svg = d3.select("#graphSVG");
      const n = svg.select("g").selectAll(".node");
      const clickedColor = this.highlightButtonColors[index];
      this.highlightButtonColors = [];
      var vm = this;
      for (let i = 0; i < this.tags.length; i++) {
        if (i == index) {
          if (clickedColor == highlightColor) {
            this.highlightButtonColors.push("");
          } else {
            this.$store.commit("change_active_lense", "tagHighlight");
            this.highlightButtonColors.push(highlightColor);
          }
        } else {
          this.highlightButtonColors.push("");
        }
      }
      const p = n.select("path").style("fill", function (d) {
        return clickedColor == "" && d.tags.includes(tag)
          ? highlightColor
          : vm.$vuetify.theme.currentTheme.primary;
      });
    },
    ignore(tag) {
      const index = this.tags.indexOf(tag);
      this.isIgnored[index] = !this.isIgnored[index];
      this.isIgnored = JSON.parse(JSON.stringify(this.isIgnored));
      this.updateSession();
    },
    assignNodeColors() {
      for (let i = 0; i < this.highlightButtonColors.length; i++) {
        if (this.highlightButtonColors[i] !== "") {
          const tag = this.tags[i];
          //TODO: this is just a quick hack to highlight the right nodes, when switching graphs, REFACTOR!
          this.highlight(tag);
          this.highlight(tag);
        }
      }
    },
  },
});
</script>
<style scoped>
</style>
