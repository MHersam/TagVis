<!-- Visualization exploration drawer paper list that contains ListItems representing a paper each -->
<template>
  <v-container class="ma-0 pa-0" style="max-width: 960px">
    <v-progress-linear
      indeterminate
      absolute
      style="z-index: 2"
      v-if="recommendations.length != 0 && isLoading"
    ></v-progress-linear>
    <v-row>
      <v-col
        cols="12"
        class="ma-0 pa-0"
        v-for="recommendation in recommendations"
        :key="recommendation.paperId"
      >
        <v-card tile class="pa-3 ml-2 mr-2 grey lighten-5">
          <ListItem :recommendation="recommendation" />
        </v-card>
      </v-col>
    </v-row>
    <div v-if="!isLoading && recommendations.length == 0" class="pa-3">
      <h3 class="mb-3">No recommendations available!</h3>
      <h4>
        After you added papers to your library
        <router-link to="/library" style="text-decoration: none; color: inherit"
          ><v-icon to="library" size="24px">mdi-bookshelf</v-icon></router-link
        >, it can take a while until your library is processed and you can find
        recommended papers here.
      </h4>
    </div>
    <v-row justify="center" v-if="isLoading && recommendations.length == 0">
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
import axios from "axios";
import ListItem from "./ListItem.vue";

export default Vue.extend({
  name: "ExplorationList",
  components: {
    ListItem,
  },
  methods: {
    // retrieve all sessions the user has saved
    getRecommendations() {
      var vm = this;
      vm.isLoading = true;
      return new Promise((resolve, reject) => {
        axios
          .post("/api/users/recommendations/selection?limit=" + vm.limit, {
            data: {
              access_token: vm.$store.getters.get_access_token,
              user_id: vm.$store.getters.get_user_id,
              documents: vm.$store.getters.get_graph.nodes,
            },
          })
          .then(function (res) {
            vm.recommendations = vm.recommendations.filter((d) => d.selected);
            res.data.forEach((r) => {
              r.selected = false;
              if (
                !vm.recommendations.map((d) => d.paperId).includes(r.paperId) &&
                vm.recommendations.length < vm.limit
              ) {
                vm.recommendations.push(r);
              }
            });
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            vm.isLoading = false;
            resolve(1);
          });
      });
    },
  },
  data: () => ({
    recommendations: [],
    isLoading: true,
    limit: 25,
    page: 1,
    numberOfPages: 1,
  }),
  mounted() {
    if (this.$store.getters.is_logged_in) {
      this.getRecommendations();
    } else {
      this.isLoading = false;
    }
  },
  watch: {
    "$store.getters.is_logged_in": function (val) {
      if (val) {
        this.getRecommendations();
      }
    },
    page: function (val) {
      this.getRecommendations();
    },
  },
});
</script>

<style scoped>
</style>
