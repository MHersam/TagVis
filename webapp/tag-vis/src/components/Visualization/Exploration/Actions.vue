<!-- Action buttons in visualization exploration drawer with their functionality -->
<template>
  <div>
    <v-row>
      <v-col cols="6" class="ma-0 pa-0"
        ><v-btn
          elevation="1"
          large
          tile
          block
          class="grey lighten-2"
          :loading="isAddingToLibrary"
          v-on:click="addToLibrary"
          :disabled="
            $parent.$parent.$refs.list.recommendations.filter((d) => d.selected)
              .length == 0
          "
          >Add to Library</v-btn
        ></v-col
      >
      <v-col cols="6" class="ma-0 pa-0"
        ><v-btn
          elevation="1"
          large
          tile
          block
          class="primary"
          :loading="isInsertingIntoGraph"
          v-on:click="insertIntoGraph"
          :disabled="
            $parent.$parent.$refs.list.recommendations.filter((d) => d.selected)
              .length == 0
          "
          >Insert into Graph</v-btn
        ></v-col
      >
    </v-row>
    <!-- TODO: snackbar not showing up idk why-->
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";

export default Vue.extend({
  name: "ExplorationActions",
  components: {},
  data: () => ({
    snackbar: true,
    snackbarText: "Successfully added document to your library!",
    snackbarTimeout: 4000,
    isAddingToLibrary: false,
    isInsertingIntoGraph: false,
  }),
  methods: {
    insertIntoGraph() {
      var vm = this;
      vm.isInsertingIntoGraph = true;
      var recommendations = vm.$parent.$parent.$refs.list.recommendations;
      var selected = recommendations.filter((d) => d.selected);
      //set isLoading in ActionPanel component to true so that graph type v-select is loading and disabled
      vm.$parent.$parent.$parent.isLoading = true;
      axios
        .post("/api/graphs/insert", {
          auth_token: vm.$store.getters.get_access_token,
          user_id: vm.$store.getters.get_user_id,
          add_topics:
            vm.$store.getters.get_settings
              .add_semantic_scholar_topics_to_graphs,
          documents: vm.semanticScholarToDocNotation(selected),
          graph: vm.$store.getters.get_graph,
        })
        .then(async function (res) {
          console.log(res);
          //vm.$parent.$parent.$parent.$parent
          vm.$store.commit("change_graph", res.data);
          //get new recommendations that take the new nodes just added into account
          vm.$parent.$parent.$refs.list.getRecommendations();
          console.log(vm.$parent.$parent);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.isInsertingIntoGraph = false;
          vm.snackbarText = "Successfully inserted papers into graph!";
          vm.snackbar = true;
        });
    },
    addToLibrary() {
      var vm = this;
      vm.isAddingToLibrary = true;
      var recommendations = vm.$parent.$parent.$refs.list.recommendations;
      var selected = recommendations.filter((d) => d.selected);
      axios
        .post("/api/documents/add", {
          auth_token: vm.$store.getters.get_access_token,
          user: vm.$store.getters.get_user_id,
          documents: vm.semanticScholarToDocNotation(selected),
        })
        .then(async function (res) {
          vm.$store.commit(
            "change_documents",
            res.data.concat(vm.$store.getters.get_documents)
          );
          //remove from added recommendations from list
          //vm.$parent.$parent.$refs.list.recommendations = recommendations.filter((d) => !d.selected);
          await vm.addToBlackList(selected);
          vm.snackbarText = "Successfully added document to your library!";
          vm.snackbar = true;
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
    addToBlackList(docs) {
      var vm = this;
      return new Promise((resolve, reject) => {
        axios
          .post("/api/users/recommendations/blacklist", {
            auth_token: vm.$store.getters.get_access_token,
            user_id: vm.$store.getters.get_user_id,
            documents: docs,
          })
          .catch(function (error) {
            console.log(error);
            reject();
          })
          .finally(() => {
            resolve(1);
          });
      });
    },
    semanticScholarToDocNotation(ssds) {
      var docs = [];
      ssds.forEach((ssd) => {
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
        docs.push(d);
      });
      return docs;
    },
  },
  mounted() {},
  watch: {},
});
</script>

<style scoped>
</style>
