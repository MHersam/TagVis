<!-- This component contains cards that redirect to the different parts of the app for users to navigate -->
<template>
  <v-layout class="unselectable">
    <v-container>
      <v-row>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="select"
            @click="changeView('library')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-bookshelf</v-icon>
              <br />
              <p>Library</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="recommendations"
            @click="changeView('recommendations')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-compass</v-icon>
              <br />
              <p>Recommendations</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="group"
            @click="changeView('groups')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-account-group</v-icon>
              <br />
              <p>Groups</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="session"
            @click="changeView('sessions')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-progress-clock</v-icon>
              <br />
              <p>Sessions</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="setting"
            @click="changeView('settings')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-cog</v-icon>
              <br />
              <p>Settings</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="learn-more"
            @click="changeView('learn-more')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center">mdi-school</v-icon>
              <br />
              <p>Learn more</p>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="4" md="4" lg="4" xl="4">
          <v-card
            elevation="8"
            class="pb-2 card center"
            id="documentation"
            @click="changeView('/documentation/visualization')"
          >
            <div class="verticalCenter">
              <v-icon size="100px" class="center"
                >mdi-file-document-multiple</v-icon
              >
              <br />
              <p>Documentation</p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DashboardLinks",

  methods: {
    changeView(link: string) {
      this.$router.push(link);
    },
  },
  data: () => ({}),
});
</script>

<style scoped>
.card {
  min-width: 150px;
  height: 200px;
  font-size: 20px;
  text-align: center;
}
</style>
