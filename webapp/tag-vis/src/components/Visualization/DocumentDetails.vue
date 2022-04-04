<!-- This componen is shown when a node is double clicked, it gives users additional information about the paper -->
<template>
  <v-container>
    <v-sheet
      v-if="this.$store.getters.get_document_details.isVisible"
      class=""
      :style="
        'position: absolute; bottom: 60px; right: ' +
        (this.$store.getters.get_is_vis_exploration_drawer ? 460 : 10) +
        'px; margin-left: 10px; overflow: auto; opacity: 0.9;'
      "
      max-height="calc(100% - 70px - 50px)"
      max-width="800px"
      elevation="5"
      rounded
    >
      <v-container class="ma-0 pt-0 pb-3" fluid>
        <v-row>
          <v-col v-html="documentTitleText"></v-col>
          <v-btn icon text large v-on:click="close" class="float-right"
            ><v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-container class="pa-0" fluid>
          <span v-html="documentDetailText"></span>

          <div v-if="this.document.tags.length > 0">
            <b>Tags: </b>
            <v-chip
              small
              class="mr-1 mb-1 mt-1"
              v-bind:key="tag"
              v-for="tag in document.tags"
              >{{ tag }}</v-chip
            >
          </div>
        </v-container>
        <div>
          <span v-if="document.abstract" style="display: inline-block">
            <v-expansion-panels flat class="ma-0 pa-0">
              <v-expansion-panel>
                <v-expansion-panel-header class="ma-0 pa-0 mr-1">
                  <b>Abstract</b>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="ma-0 pa-0">
                  {{ document.abstract }}
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </span>
        </div>
        <span
          v-if="
            $store.getters.is_logged_in &&
            document.user._id != $store.getters.get_user_id
          "
          class="d-flex justify-end"
        >
          <v-btn v-on:click="addToLibrary" small :loading="isAddingToLibrary"
            >Add to Library</v-btn
          >
        </span>
      </v-container>
    </v-sheet>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import Vue from "vue";
import axios from "axios";
export default Vue.extend({
  name: "DocumentDetails",
  data: () => ({
    document: {},
    snackbar: false,
    snackbarText: "",
    snackbarTimeout: 4000,
    isAddingToLibrary: false,
  }),
  watch: {
    "$store.getters.get_document_details": function (val) {
      this.document = val.document;
      console.log(this.document);
    },
  },
  methods: {
    close() {
      this.$store.commit("change_document_details", {
        isVisible: false,
        //document: {}
      });
    },
    addToLibrary() {
      var vm = this;
      if (vm.document.user._id != vm.$store.getters.get_user_id) {
        vm.isAddingToLibrary = true;
        var docToAdd = JSON.parse(JSON.stringify(vm.document));
        delete docToAdd.mendeley_id;
        delete docToAdd.zotero_id;
        delete docToAdd.user;
        delete docToAdd._id;
        axios
          .post("/api/documents/add", {
            auth_token: vm.$store.getters.get_access_token,
            user: vm.$store.getters.get_user_id,
            documents: [docToAdd],
          })
          .then(function (res) {
            vm.$store.commit(
              "change_documents",
              res.data.concat(vm.$store.getters.get_documents)
            );
            vm.snackbarText = "Successfully added document to your library!";
            vm.snackbar = true;
            vm.isAddingToLibrary = false;
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            vm.isAddingToLibrary = false;
          });
      }
    },
  },
  computed: {
    documentTitleText: function () {
      return this.document.title ? "<h3>" + this.document.title + "</h3>" : "";
    },
    documentDetailText: function () {
      let text = "";
      text += this.document.authors
        ? "<b>Authors:</b> " + this.document.authorsString + "<br>"
        : "";
      text += this.document.year
        ? "<b>Year:</b> " + this.document.year + "<br>"
        : "";
      text += this.document.source
        ? "<b>Source:</b> " + this.document.source + "<br>"
        : "";
      text += "<b>Citation Count:</b> " + this.document.citationCount + "<br>";

      text += this.document.doi
        ? "<b>DOI:</b> " +
          "<a href=https://www.doi.org/" +
          this.document.doi +
          " target='_blank'>" +
          this.document.doi +
          "</a><br>"
        : "";
      text += this.document.arxiv
        ? "<b>arXiv:</b> " +
          "<a href=https://www.arxiv.org/abs/" +
          this.document.arxiv +
          " target='_blank'>" +
          this.document.arxiv +
          "</a><br>"
        : "";
      return text;
    },
  },
  destroyed: function () {
    this.$store.commit("change_document_details", {
      isVisible: false,
      document: {},
    });
  },
});
</script>
<style scoped>
</style>
