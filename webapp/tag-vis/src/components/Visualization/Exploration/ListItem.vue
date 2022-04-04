<!-- List items of the visualization exploration drawer paper list -->
<template>
<div>
    <span class="font-weight-bold">
      <span><v-checkbox class="ma-0 ml-1 pa-0" style="display: inline-block" v-model="recommendation.selected" hide-details></v-checkbox></span>
      {{ recommendation.title }}</span
    ><br />
    {{ authorString }}<br />
    <span v-if="recommendation.venue">{{ recommendation.venue }}, </span
    ><span v-if="recommendation.year">{{ recommendation.year }}</span
    >, Citations: {{ recommendation.citationCount }}<br />
    <span v-if="recommendation.abstract" style="display: inline-block">
      <v-expansion-panels flat class="ma-0 pa-0">
        <v-expansion-panel>
          <v-expansion-panel-header class="ma-0 pa-0 mr-1 grey lighten-5">
            <b>Abstract</b>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="ma-0 pa-0 grey lighten-5">
            {{ recommendation.abstract }}
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </span>
</div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "RecommendationListItem",
  methods: {
  },
  data: () => ({
  }),
  props: {
    recommendation: {
      type: Object,
      required: true,
    },
  },
  mounted() {},
  computed: {
    authorString() {
      var s = "";
      for (let i = 0; i < this.recommendation.authors.length && i < 3; i++) {
        s += this.recommendation.authors[i].name;
        if (i + 1 < this.recommendation.authors.length && i != 2) s += ", ";
      }
      if (this.recommendation.authors.length >= 3) s += "...";
      return s;
    },
  },
});
</script>

<style scoped>
</style>
