<!-- This component retrieves the documents in a personal library and displays them in a table -->
<template>
  <v-container
    fluid
    class="pt-2"
    style="margin: 0px; padding: 0px; width: 100%"
  >
    <v-alert type="error" v-if="failedToLoadLibrary"
      ><span v-html="failedToLoadLibraryErrorText"></span
    ></v-alert>
    <!--FileUpload id="customdropzone"/-->
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search for author, title, tag or source"
          clearable
          single-line
          hide-details
          class="mb-3"
        ></v-text-field>
        <v-tooltip
          transition="slide-y-reverse-transition"
          top
          v-if="this.$store.getters.is_logged_in"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              text
              small
              v-on:click="syncDocs"
              class="ml-2"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-sync</v-icon>
            </v-btn>
          </template>
          <span>Sync Documents</span>
        </v-tooltip>
      </v-card-title>

      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="documents"
        :items-per-page="number_of_table_rows"
        :footer-props="footerProps"
        :single-select="singleSelect"
        :search="search"
        :single-expand="singleExpand"
        :expanded.sync="expanded"
        show-expand
        :item-key="key"
        show-select
        :loading="isLoading"
        checkbox-color="blue"
        loading-text="Loading... Please wait"
        class="elevation-1"
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td
            :colspan="headers.length"
            class="pa-3"
            style="white-space: pre-wrap"
          >
            <span v-html="getExpandedText(item)"></span>
          </td>
        </template>
        <template v-slot:[`item.file_attached`]="{ item }">
          <v-tooltip transition="slide-y-transition" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-if="item.file_attached"
                v-on:click="openFile(item)"
                v-bind="attrs"
                v-on="on"
                >mdi-file-pdf</v-icon
              >
            </template>
            <span>Open PDF (TODO)</span>
          </v-tooltip>
        </template>

        <template v-slot:[`item.tags`]="{ item }">
          <span>
            <v-chip
              small
              class="mr-1 mb-1 mt-1"
              v-bind:key="tag"
              v-for="tag in item.tags"
              >{{ tag }}</v-chip
            >
          </span>
          <TagSuggestions v-bind:document="item" />
        </template>
        <template v-slot:[`item.semantic_scholar_document`]="{ item }">
          <v-icon
            v-if="item.semantic_scholar_document"
            v-on:click="explore(item)"
            color="primary"
            size="30"
            >mdi-play-circle-outline</v-icon
          >
          <v-progress-circular
            v-if="item.semanticScholarLookupPending"
            indeterminate
            size="26"
            color="primary"
          ></v-progress-circular>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import FileUpload from "@/components/FileUpload.vue";
import TagSuggestions from "./TagSuggestions.vue";
const qs = require("querystring");

export default Vue.extend({
  components: {
    FileUpload,
    TagSuggestions,
  },
  data() {
    return {
      singleSelect: false,
      isLoading: false,
      selected: [],
      documents: [],
      search: "",
      expanded: [],
      singleExpand: true,
      footerProps: {
        "items-per-page-options": [5, 10, 25, 50, -1],
      },
      headers: [
        {
          text: "Authors",
          align: "start",
          value: "authorsString",
          sortable: false,
          width: "18%",
        },
        { text: "Year", value: "year", width: "5%", filterable: false },
        { text: "Title", value: "title", width: "22%" },
        { text: "Tags", value: "tags", sortable: false, width: "22%" },
        { text: "Source", value: "source", width: "18%" },
        { text: "Added", value: "created", width: "8%", filterable: false },
        /*
        {
          text: "File",
          value: "file_attached",
          width: "5%",
          filterable: false,
        },
        */
        {
          text: "Explore Cited Papers",
          value: "semantic_scholar_document",
          width: "1%",
          filterable: false,
        },
        { text: "", value: "data-table-expand", width: "1%" },
      ],
      number_of_table_rows: 10,
      failedToLoadLibrary: false,
      failedToLoadLibraryErrorText: "",
    };
  },
  methods: {
    // retrieve docs of this user from back end
    getDocuments: function () {
      return new Promise((resolve, reject) => {
        const store = this.$store;
        const instance = this;
        // TODO: if access_token is expired, renew it first
        axios
          .get("/api/documents/all", {
            headers: {
              access_token: store.getters.get_access_token,
            },
          })
          .then(function (res) {
            console.log(res);
            const docs = res.data;
            res.data.forEach((doc: any) => {
              let authorString = "";
              if ("authors" in doc) {
                doc.authors.forEach((author: any) => {
                  authorString +=
                    author.first_name + " " + author.last_name + ", ";
                });
              }
              doc.authorsString = authorString.substring(
                0,
                authorString.length - 2
              );

              const created = new Date(doc.created);
              let month: string = "" + (created.getMonth() + 1);
              let day: string = "" + created.getDate();
              if (month.length < 2) {
                month = "0" + month;
              }
              if (day.length < 2) {
                day = "0" + day;
              }
              doc.created = created.getFullYear() + "-" + month + "-" + day;
              doc.user = {};
              doc.user.photo = instance.$store.getters.get_photo_url;
              doc.user._id = instance.$store.getters.get_user_id;
              doc.user.display_name = instance.$store.getters.get_display_name;
            });
            instance.documents = docs;
            instance.$store.commit("change_documents", docs);
            resolve();
          })
          .catch(function (error) {
            reject(error);
          });
      });
    },
    syncDocs: function () {
      this.failedToLoadLibrary = false;
      if (this.$store.getters.is_logged_in) {
        this.isLoading = true;
        const instance = this;
        this.getDocuments()
          .then(function () {
            // remove documents from selected array that are not in the document array
            /*
            for (let i = 0; i < instance.selected.length; i++) {
              var selectedDoc: any = instance.selected[i]
              var remove = true
              instance.documents.forEach((doc: any) => {
                if (selectedDoc.id === doc.id) {
                  remove = false
                  // break;
                }
              })
              if (remove) {
                instance.selected.splice(i, 1)
                i--
              }
            }
            */
            // clear documents array when at least one document is missing
            instance.filterSelectedDocuments();
            instance.lookupNewDocsOnSemanticScholar();
            instance.isLoading = false;
            instance.$store.commit("change_is_library_loaded", true);
          })
          .catch(function (error) {
            instance.isLoading = false;
            instance.failedToLoadLibrary = true;
            if (error.response.status == 403) {
              instance.failedToLoadLibraryErrorText =
                "Failed to load your Zotero library due to missing read permissions! You can simply log out and back into TagVis to create a new Zotero key with the required permissions. Please make sure to keep 'Allow library access' checked when creating the new key.<br>Alternatively, you can edit the lastest TagVis key at <a href=https://www.zotero.org/settings/keys target='_blank'>https://www.zotero.org/settings/keys</a>";
            } else {
              instance.failedToLoadLibraryErrorText =
                "Failed to load your library!";
            }
            console.log(error);
          });
      }
    },
    // get the text that is shown when expanding a table row
    getExpandedText: function (item: any) {
      let expandedText = "";
      if (item.abstract) {
        expandedText += "Abstract: " + item.abstract;
        expandedText += item.identifiers ? "\n\n" : "";
      }

      expandedText += item.identifiers ? getIdentifierList(item) : "";

      function getIdentifierList(item: any) {
        const keys = Object.keys(item.identifiers);
        let identifiers = "";
        keys.forEach((key) => {
          if (key === "doi") {
            identifiers +=
              "\n" +
              key +
              ": " +
              "<a href=https://www.doi.org/" +
              item.identifiers[key] +
              " target='_blank'>" +
              item.identifiers[key] +
              "</a>";
          } else if (key === "arxiv") {
            identifiers +=
              "\n" +
              key +
              ": " +
              "<a href=https://www.arxiv.org/abs/" +
              item.identifiers[key] +
              " target='_blank'>" +
              item.identifiers[key] +
              "</a>";
          } else {
            identifiers += "\n" + key + ": " + item.identifiers[key];
          }
        });
        return identifiers.substring(1);
      }
      return expandedText;
    },
    openFile: function (item: any) {
      console.log(item);
      /* TODO: get file download link
         https://dev.mendeley.com/methods/#files
      */
    },
    // clears selectedDocuments array when at least one document is missing in documents array
    filterSelectedDocuments() {
      var instance = this;
      for (let i = 0; i < instance.selected.length; i++) {
        var selectedDoc: any = instance.selected[i];
        var remove = true;
        instance.documents.forEach((doc: any) => {
          if (selectedDoc._id === doc._id) {
            remove = false;
            // break;
          }
        });
        if (remove) {
          instance.selected = [];
          break;
        }
      }
    },
    // apply user settings
    applySettings() {
      var settings = this.$store.getters.get_settings;
      this.singleExpand = !settings.multi_expand;
      this.number_of_table_rows = isNaN(Number(settings.number_of_table_rows))
        ? -1
        : Number(settings.number_of_table_rows);
    },

    // Quick visualize directly cited papers of the given semantic_scholar_document in vis view
    explore(doc) {
      this.$router.push({
        name: "Visualization",
        params: { semantic_scholar_document: doc.semantic_scholar_document },
      });
    },
    // try to find the doc on semantic scholar, if one was found 'Explore Cited Papers' will be available for this paper
    lookupNewDocsOnSemanticScholar() {
      var vm = this;
      var promises = [];
      this.documents.forEach((doc) => {
        promises.push(
          new Promise((resolve, reject) => {
            if (
              !doc.semantic_scholar_document &&
              doc.identifiers &&
              (doc.identifiers.doi ||
                doc.identifiers.paperId ||
                doc.identifiers.arxiv ||
                doc.identifiers.mag ||
                doc.identifiers.acl ||
                doc.identifiers.pmid)
            ) {
              doc.semanticScholarLookupPending = true;
              //vm.$forceUpdate();
              axios
                .get("/api/documents/semanticScholarLookup", {
                  headers: {
                    document: JSON.stringify({
                      _id: doc._id,
                      identifiers: doc.identifiers,
                    }),
                  },
                })
                .then((res) => {
                  delete doc.semanticScholarLookupPending;
                  doc.semantic_scholar_document = res.data._id;
                  vm.$forceUpdate();
                  console.log(doc);
                  resolve(doc);
                })
                .catch((err) => {
                  delete doc.semanticScholarLookupPending;
                  console.log(err);
                  reject();
                });
            } else {
              reject();
            }
          })
        );
      });
      Promise.allSettled(promises).then((res) => {
        console.log(res);
        vm.$store.commit("change_documents", vm.documents);
        console.log(vm.documents);

        //also update the doc in selected array in vuex store, if this doc is currently selected
        var selected = JSON.parse(
          JSON.stringify(vm.$store.getters.get_selected_documents)
        );
        var fulfilledPromises = res.filter((r) => r.status == "fulfilled");
        console.log(fulfilledPromises);
        fulfilledPromises.forEach((fp) => {
          for (let i = 0; i < selected.length; i++) {
            if (selected[i]._id == fp.value._id) {
              selected[i].semantic_scholar_document =
                fp.value.semantic_scholar_document;
              break;
            }
          }
        });
        vm.$store.commit("change_selected_documents", selected);
      });
    },
  },
  watch: {
    selected: function (val) {
      this.$store.commit("change_selected_documents", val);
    },
    "$store.getters.is_logged_in": function (val) {
      if (val) {
        this.syncDocs();
      }
    },
    "$store.getters.get_settings": function () {
      this.applySettings();
    },
    "$store.getters.get_documents": function (docs) {
      this.documents = docs;
      this.lookupNewDocsOnSemanticScholar()
    },
  },
  computed: {
    key: function () {
      if (this.documents.length > 0) {
        return this.documents[0]._id ? "_id" : "id";
      } else {
        return "id";
      }
    },
  },
  mounted() {
    this.selected = this.$store.getters.get_selected_documents;
    this.applySettings();
    if (
      !this.$store.getters.get_is_library_loaded &&
      this.$store.getters.is_logged_in
    ) {
      this.syncDocs();
    } else {
      this.documents = this.$store.getters.get_documents;
      this.lookupNewDocsOnSemanticScholar();
      this.filterSelectedDocuments();
    }
  },
});
</script>
<style scoped>
#customdropzone {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
}
</style>
