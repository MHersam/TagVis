<!-- Session view, displays the session grid -->
<template>
  <v-container>
    <RecommendationList />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import RecommendationList from "../components/Recommendations/RecommendationList.vue";
@Component({
  components: { RecommendationList },
})
export default class Sessions extends Vue {
}
</script>

<style>
</style>
