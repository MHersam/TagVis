<!-- List containing RecommendationListitems, displaying a users personal recommendations in Recommendation view -->
<template>
  <v-container style="max-width: 960px">
    <h1 v-if="!isLoading && recommendations.length > 0" class="mb-3">
      Recommendations based on the papers in your library
    </h1>
    <h1 v-if="!isLoading && recommendations.length == 0" class="mb-3">
      No recommendations available!
    </h1>
    <v-layout>
      <v-row>
        <v-col
          cols="12"
          class="ma-0 pa-0"
          v-for="recommendation in recommendations"
          :key="recommendation.paperId"
        >
          <RecommendationListItem :recommendation="recommendation" />
        </v-col>
      </v-row>
    </v-layout>
    <div class="text-center" v-if="!isLoading && recommendations.length > 0">
      <v-container>
        <v-row justify="center">
          <v-col cols="8">
            <v-container class="max-width">
              <v-pagination
                v-model="page"
                class="my-4"
                :length="numberOfPages"
              ></v-pagination>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <h3 v-if="!isLoading && recommendations.length == 0">
      After you added papers to your library
      <router-link to="/library" style="text-decoration: none; color: inherit"
        ><v-icon to="library" size="24px">mdi-bookshelf</v-icon></router-link
      >, it can take a while until your library is processed and you can find
      recommended papers here.
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
import axios from "axios";
import RecommendationListItem from "./RecommendationListItem.vue";

export default Vue.extend({
  name: "RecommendationList",
  components: {
    RecommendationListItem,
  },
  methods: {
    // retrieve all sessions the user has saved
    getRecommendations() {
      var vm = this;
      return new Promise((resolve, reject) => {
        axios
          .get(
            "/api/users/recommendations?page=" +
              (vm.page - 1) +
              "&limit=" +
              vm.limit,
            {
              headers: {
                access_token: vm.$store.getters.get_access_token,
                user_id: vm.$store.getters.get_user_id,
              },
            }
          )
          .then(function (res) {
            if (
              res.data.numberOfPages < vm.numberOfPages &&
              res.data.numberOfPages > 0
            ) {
              // a page greater than numberOfPages was requested, which can happen when the only item on the last page was removed -> switch to and request the new last page
              vm.numberOfPages = res.data.numberOfPages;
              vm.page = res.data.numberOfPages;
            } else {
              vm.recommendations = res.data.recommendations;
              vm.numberOfPages = res.data.numberOfPages;
            }
            console.log(res.data);
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
    limit: 10,
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
