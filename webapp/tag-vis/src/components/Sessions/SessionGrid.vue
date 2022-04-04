<!-- The SessionGrid displays the sessions a user has saved as SessionCard components -->
<template>
  <v-container>
    <div class="ml-3">
      <h1 v-if="!isLoading && sessions.length != 0">Your saved sessions</h1>
      <h1 v-if="!isLoading && sessions.length == 0">No sessions found</h1>
    </div>
    <v-layout>
      <v-row>
        <v-col
          xs="12"
          sm="12"
          md="6"
          lg="4"
          xl="3"
          v-for="session in sessions"
          :key="session._id"
        >
          <SessionCard :session="session" />
        </v-col>
      </v-row>
    </v-layout>
    <h3 v-if="!isLoading && sessions.length == 0" class="ml-3">
      Create your first session by clicking
      <v-icon size="24px">mdi-content-save</v-icon> in the top right corner,
      when viewing a graph.
    </h3>
    <v-row justify="center" v-if="isLoading">
      <v-progress-circular
        :size="90"
        :width="9"
        color="primary"
        style="position: absolute"
        class="verticalCenter"
        indeterminate
      ></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import SessionCard from "./SessionCard.vue";
import axios from "axios";

export default Vue.extend({
  name: "SessionGrid",
  components: {
    SessionCard,
  },
  methods: {
    changeView(link: string) {
      this.$router.push(link);
    },
    // retrieve all sessions the user has saved
    getSessions() {
      var vm = this;
      axios
        .get("/api/sessions/all", {
          headers: {
            access_token: vm.$store.getters.get_access_token,
            user: vm.$store.getters.get_user_id,
          },
        })
        .then(function (res) {
          console.log(res);
          vm.sessions = res.data;
          vm.isLoading = false;
          console.log(vm.sessions);
        })
        .catch(function (error) {
          vm.sessions = [];
          vm.isLoading = false;
          console.log(error);
        });
    },
  },
  data: () => ({
    sessions: [],
    isLoading: true,
  }),
  mounted() {
    if (this.$store.getters.is_logged_in) {
      this.getSessions();
    }
  },
  watch: {
    "$store.getters.is_logged_in": function (val) {
      if (val) {
        this.getSessions();
      }
    },
  },
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
