<!-- Documention view, displays seperate documentation components that give users helpful information to better understand the tool -->
<template>
  <v-container fluid class="ma-0 pa-0" style="height: 100%; width: 100%">
    <v-app-bar-nav-icon
      @click.stop="drawer = !drawer"
      :style="
        'position: fixed; z-index: 1; ' + 'left: ' + sidebarButtonOffset + 'px'
      "
    ></v-app-bar-nav-icon>
    <v-card
      height="400"
      width="256"
      class="mx-auto float-left"
      style="height: 100%; position: fixed; z-index: 1"
      v-if="drawer"
    >
      <v-navigation-drawer
        temporary
        disable-route-watcher
        hide-overlay
        absolute
        stateless
        v-model="drawer"
      >
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title"> Documentation </v-list-item-title>
            <!--v-list-item-subtitle> subtext </v-list-item-subtitle-->
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense nav>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            :to="item.route"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-card>
    <router-view
      class="globalMaxWidth center"
      style="display: block; margin-left: auto; margin-right: auto"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
  components: {},
})
export default class Documentation extends Vue {
  drawer = true;
  // items in the drawer
  items = [
    {
      title: "Visualization",
      icon: "mdi-graphql",
      route: "/documentation/visualization",
    },
    {
      title: "Similarity Measures",
      icon: "mdi-pencil-ruler",
      route: "/documentation/similarity",
    },
    {
      title: "Groups",
      icon: "mdi-account-group",
      route: "/documentation/groups",
    },
    {
      title: "Keeping and Sharing Results",
      icon: "mdi-progress-clock",
      route: "/documentation/sessions",
    },
    {
      title: "Exploration",
      icon: "mdi-compass",
      route: "/documentation/exploration",
    },
    {
      title: "Lenses",
      icon: "mdi-layers",
      route: "/documentation/lenses",
    },
  ];
  right: null;
  // change offset of sidebar button depending on drawer opened or closed status
  get sidebarButtonOffset() {
    return this.drawer ? 256 : 0;
  }
}
</script>

<style>
</style>
