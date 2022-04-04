<!-- Visualization exploration drawer component that also includes the button that opens/closes the drawer-->
<template>
  <span>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          small
          elevation="2"
          v-bind="attrs"
          v-on="on"
          class="mt-1"
          v-on:click="drawer = !drawer"
          :disabled="!$store.getters.is_logged_in"
          ><v-icon>mdi-compass-outline</v-icon></v-btn
        >
      </template>
      <span>Explore Related Papers</span>
    </v-tooltip>
    <v-navigation-drawer
      persistant
      hide-overlay
      v-model="drawer"
      right
      fixed
      style="top: 64px; padding-bottom: 64px"
      width="450px"
      height="100%"
    >
      <v-container class="fill-height ma-0 pa-0 grey lighten-5">
        <v-layout column class="fill-height">
          <v-flex class="flex shrink">
            <v-card-text class="ma-0 pa-0 grey lighten-3">
              <h2 style="display: inline-block" class="mt-4 mb-3 ml-3">
                Related Papers
              </h2>
              <v-btn
                icon
                text
                large
                v-on:click="drawer = !drawer"
                class="float-right mt-1 mr-1"
                ><v-icon>mdi-arrow-collapse-right</v-icon>
              </v-btn>
              <v-divider></v-divider>
            </v-card-text>
          </v-flex>
          <v-flex class="flex darken-3 overflow-y-auto overflow-x-hidden">
            <List ref="list" />
          </v-flex>
          <v-flex class="flex shrink">
            <v-card-text class="ma-0 pa-0">
              <v-divider></v-divider>
              <Actions />
            </v-card-text>
          </v-flex>
        </v-layout>
      </v-container>
    </v-navigation-drawer>
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import List from "./List.vue";
import Actions from "./Actions.vue";
export default Vue.extend({
  name: "ExplorationDrawer",
  components: {
    List,
    Actions,
  },
  data: () => ({
    drawer: false,
  }),
  methods: {},
  watch: {
    drawer: function (val) {
      this.$store.commit("change_is_vis_exploration_drawer", val);
    },
  },
  computed: {},
  mounted() {
    this.drawer = this.$store.getters.get_is_vis_exploration_drawer;
  },
});
</script>

<style>
</style>
