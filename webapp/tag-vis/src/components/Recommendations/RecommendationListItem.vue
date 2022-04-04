<!-- List item representing a recommendation in the Recommendation view -->
<template>
  <v-card class="pt-3 pl-3 pr-3 mt-3">
    <span class="font-weight-bold">{{ recommendation.title }}</span
    ><br />
    {{ authorString }}<br />
    <span v-if="recommendation.venue">{{ recommendation.venue }}, </span
    ><span v-if="recommendation.year">{{ recommendation.year }}</span
    >, Citations: {{ recommendation.citationCount }}<br />
    <span v-if="recommendation.abstract" style="display: inline-block">
      <v-expansion-panels flat class="ma-0 pa-0">
        <v-expansion-panel>
          <v-expansion-panel-header class="ma-0 pa-0 mr-1">
            <b>Abstract</b>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="ma-0 pa-0">
            {{ recommendation.abstract }}
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </span>
    <span class="d-flex justify-end pb-3">
      <v-btn
        small
        text
        v-on:click="addToBlackListAndRefresh"
        :loading="isAddingToBlacklist"
        :disabled="isAddingToLibrary"
        >Not interested</v-btn
      ><v-btn
        small
        class="ml-2"
        v-on:click="addToLibrary"
        :loading="isAddingToLibrary"
        :disabled="isAddingToBlacklist"
        >Add to Library</v-btn
      >
    </span>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  name: "RecommendationListItem",
  methods: {
    addToLibrary() {
      var vm = this;
      vm.isAddingToLibrary = true;
      axios
        .post("/api/documents/add", {
          auth_token: vm.$store.getters.get_access_token,
          user: vm.$store.getters.get_user_id,
          documents: [vm.semanticScholarToDocNotation(vm.recommendation)],
        })
        .then(async function (res) {
          vm.$store.commit(
            "change_documents",
            res.data.concat(vm.$store.getters.get_documents)
          );

          await vm.addToBlackListAndRefresh();
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.isAddingToLibrary = false;
          vm.snackbarText = "Successfully added document to your library!";
          vm.snackbar = true;
        });
    },
    semanticScholarToDocNotation(ssd) {
      var d = {};
      d.title = ssd.title;
      d.source = ssd.venue;
      d.year = ssd.year;
      d.authors = [];
      d.abstract = ssd.abstract;
      ssd.authors.forEach((author) => {
        var arr = author.name.split(" ");
        var firstName = arr[0];
        for (var i = 1; i < arr.length - 1; i++) {
          firstName = firstName.concat(" " + arr[i]);
        }
        d.authors.push({
          first_name: firstName,
          last_name: arr[arr.length - 1],
        });
      });
      d.identifiers = {};
      if (ssd.doi) {
        d.identifiers.doi = ssd.doi;
      }
      if (ssd.arxiv) {
        d.identifiers.arxiv = ssd.arxiv;
      }
      if (ssd.paperId) {
        d.identifiers.paperId = ssd.paperId;
      }
      return d;
    },
    addToBlackListAndRefresh() {
      var vm = this;
      vm.isAddingToBlacklist = !vm.isAddingToLibrary;
      return new Promise((resolve, reject) => {
        axios
          .post("/api/users/recommendations/blacklist", {
            auth_token: vm.$store.getters.get_access_token,
            user_id: vm.$store.getters.get_user_id,
            documents: [vm.recommendation],
          })
          .then(async function (res) {
            await vm.$parent.getRecommendations().then(() => {
              vm.isAddingToBlacklist = false;
            });
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            resolve(1);
          });
      });
    },
  },
  data: () => ({
    snackbar: false,
    snackbarText: "Successfully added document to your library!",
    snackbarTimeout: 4000,
    isAddingToLibrary: false,
    isAddingToBlacklist: false,
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
      for (let i = 0; i < this.recommendation.authors.length && i < 5; i++) {
        s += this.recommendation.authors[i].name;
        if (i + 1 < this.recommendation.authors.length && i != 4) s += ", ";
      }
      if (this.recommendation.authors.length >= 5) s += "...";
      return s;
    },
  },
});
</script>

<style scoped>
</style>
