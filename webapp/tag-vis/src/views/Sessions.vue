<!-- Session view, displays the session grid -->
<template>
  <v-container>
    <SessionGrid />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import SessionGrid from "../components/Sessions/SessionGrid.vue";
@Component({
  components: { SessionGrid },
})
export default class Sessions extends Vue {
}
</script>

<style>
</style>
