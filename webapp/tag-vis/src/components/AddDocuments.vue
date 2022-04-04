<!-- Dialog component for adding papers to a personal library via bibtex upload or semantic scholar lookup -->
<template>
  <v-dialog
    max-width="600"
    v-model="dialog"
    v-if="$store.getters.is_logged_in"
    :persistent="isAdding"
  >
    <template v-slot:activator="{ on: dialog }">
      <v-btn
        v-on="{ ...dialog }"
        elevation="2"
        color="primary"
        class="ml-3 pl-3"
        ><v-icon size="24px" class="ml-0 mr-2">mdi-plus</v-icon>Add
        Documents</v-btn
      >
    </template>
    <v-card>
      <v-toolbar color="primary" dark>
        <div style="font-size: 18px">Add documents to your library</div>
      </v-toolbar>
      <v-card-text class="mt-3 pl-3 pr-3">
        <v-tabs v-model="tab">
          <v-tab>Upload BibTeX</v-tab>
          <v-tab>Look up on SemanticScholar</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-container>
              <vue-dropzone
                ref="libraryDropzone"
                id="libraryDropzone"
                @hook:mounted="initListener"
                :options="dropzoneOptions"
                :useCustomSlot="true"
              >
                <div>
                  <h3>Drag and drop BibTeX file(s) here</h3>
                  <div>or click to select file(s) from your device</div>
                </div>
              </vue-dropzone></v-container
            >
          </v-tab-item>
          <v-tab-item>
            <div class="d-flex align-center mt-6">
              <v-select
                :items="identifiers"
                v-model="identifier"
                style="max-width: 150px; display: inline-block"
                class="mr-3"
                solo
                persistent-hint
                hint="Identifier"
              ></v-select>
              <v-text-field
                outlined
                class="mr-3"
                v-model="enteredIdentifier"
                clearable
                :loading="isLoading"
                :disabled="isLoading"
                autofocus
                :error="error"
                :errorMessages="errorMessage"
                :successMessages="successMessage"
                v-on:keyup.enter="find"
                :placeholder="placeholder[identifiers.indexOf(identifier)]"
              ></v-text-field>
              <v-btn
                v-on:click="find"
                :disabled="isfindBtnDisabled"
                class="mb-7"
                >find</v-btn
              >
            </div>
            <v-expansion-panels v-if="lastDocumentFound">
              <v-expansion-panel>
                <v-expansion-panel-header>
                  {{ lastDocumentFound.title }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div v-if="lastDocumentFound.authorsString.length > 0">
                    <b>Authors: </b>{{ lastDocumentFound.authorsString }}
                  </div>
                  <div v-if="lastDocumentFound.year">
                    <b>Year: </b>{{ lastDocumentFound.year }}
                  </div>
                  <div v-if="lastDocumentFound.source">
                    <b>Source: </b>{{ lastDocumentFound.source }}
                  </div>
                  <div v-if="lastDocumentFound.abstract">
                    <b>Abstract: </b>{{ lastDocumentFound.abstract }}
                  </div>
                  <v-btn text class="float-right" v-on:click="discardLastFound"
                    >discard</v-btn
                  >
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      <v-alert type="error" v-if="failedToAdd" class="ml-2 mr-2"
        ><span v-html="failedToAddErrorText"></span
      ></v-alert>
      <v-card-actions class="justify-end mt-1">
        <v-btn text @click="cancel" :disabled="isAdding">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="documents.length == 0"
          @click="add"
          :loading="isAdding"
          >Add ({{ documents.length }})</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import bibtexParse from "bibtex-parse-js";
export default Vue.extend({
  name: "AddDocuments",
  components: {
    vueDropzone: vue2Dropzone,
  },
  data: () => ({
    dialog: false,
    documents: [],
    tab: 0,
    identifiers: ["DOI", "ArXiv ID", "MAG ID", "ACL ID", "PubMed ID"],
    semanticScholarIdentifier: ["doi", "arxiv", "mag", "acl", "pmid"],
    placeholder: [
      "e.g. 10.1038/nrn3241",
      "e.g. 1705.10311",
      "e.g. 112218234",
      "e.g. W12-3903",
      "e.g. 19872477",
    ],
    identifier: "DOI",
    enteredIdentifier: "",
    isLoading: false,
    error: false,
    errorMessage: "",
    dropzoneOptions: {
      url: "https://localhost",
      autoQueue: false,
      thumbnailWidth: 200,
      maxFilesize: 10,
      acceptedFiles: ".bib",
      addRemoveLinks: true,
    },
    lastDocumentFound: null,
    successMessage: "",
    isAdding: false,
    failedToAdd: false,
    failedToAddErrorText: "",
  }),
  mounted() {
    var vm = this;
    console.log("mount");
  },
  computed: {
    isfindBtnDisabled: function () {
      if (this.enteredIdentifier) {
        return this.enteredIdentifier.length == 0 || this.isLoading;
      } else {
        return true;
      }
    },
  },
  methods: {
    initListener() {
      var vm = this;
      this.$refs.libraryDropzone.$on("vdropzone-files-added", (files) => {
        const promises = [];
        files.forEach((file) => promises.push(vm.parseDocuments(file)));
        Promise.all(promises).then((d) => {
          d.forEach((d2) => {
            d2.forEach((d3) => {
              // d3 is a single document
              vm.documents.push(d3);
            });
          });
        });
      });
    },
    cancel() {
      this.dialog = false;
      this.documents = [];
      this.lastDocumentFound = null;
      this.$refs.libraryDropzone.removeAllFiles();
      this.failedToAdd = false;
    },
    // add the new documents to the users library
    add() {
      var vm = this;
      vm.isAdding = true;
      vm.failedToAdd = false;
      axios
        .post("/api/documents/add", {
          auth_token: vm.$store.getters.get_access_token,
          user: vm.$store.getters.get_user_id,
          documents: vm.documents,
        })
        .then(function (res) {
          vm.dialog = false;
          vm.documents = [];
          //vm.$parent.syncDocs();
          vm.$store.commit(
            "change_documents",
            res.data.concat(vm.$store.getters.get_documents)
          );
          vm.$refs.libraryDropzone.removeAllFiles();
          vm.lastDocumentFound = null;
        })
        .catch(function (error) {
          vm.failedToAdd = true;
          if (error.response.status == 403) {
            vm.failedToAddErrorText =
              "Failed to add documents to Zotero due to missing write permissions! You can simply log out and back into TagVis to create a new Zotero key with the required permissions. Please make sure to keep 'Allow write access' checked when creating the new key.<br>Alternatively, you can edit the lastest TagVis key at <a href=https://www.zotero.org/settings/keys target='_blank'>https://www.zotero.org/settings/keys</a>";
          } else {
            vm.failedToAddErrorText = "Failed to add documents!";
          }
        })
        .finally(() => {
          vm.isAdding = false;
        });
    },
    // lookup a paper on semantic scholar
    find() {
      this.isLoading = true;
      this.lastDocumentFound = null;
      this.successMessage = "";
      var vm = this;
      vm.error = false;
      var doc = {
        identifiers: {
          [vm.semanticScholarIdentifier[vm.identifiers.indexOf(vm.identifier)]]:
            vm.enteredIdentifier,
        },
      };
      console.log(doc);
      axios
        .get("/api/documents/semanticScholarLookup", {
          headers: {
            document: JSON.stringify(doc),
          },
        })
        .then(function (res) {
          vm.errorMessage = "";
          vm.successMessage = "Document found";
          console.log(res);
          var doc = {};
          doc.title = res.data.title;
          doc.authors = [];
          doc.authorsString = "";
          res.data.authors.forEach((author) => {
            doc.authorsString = doc.authorsString.concat(author.name + " ");
            var arr = author.name.split(" ");
            var firstName = arr[0];
            for (var i = 1; i < arr.length - 1; i++) {
              firstName = firstName.concat(" " + arr[i]);
            }
            doc.authors.push({
              first_name: firstName,
              last_name: arr[arr.length - 1],
            });
          });
          doc.authorsString = doc.authorsString.slice(0, -1);
          doc.source = res.data.venue;
          doc.year = res.data.year;
          doc.created = new Date();
          doc.abstract = res.data.abstract;
          doc.identifiers = {};
          if (res.data.doi) {
            doc.identifiers.doi = res.data.doi;
          }
          if (res.data.arxiv) {
            doc.identifiers.arxiv = res.data.arxiv;
          }
          if (res.data.paperId) doc.identifiers.paperId;
          doc.identifiers[
            vm.semanticScholarIdentifier[vm.identifiers.indexOf(vm.identifier)]
          ] = vm.enteredIdentifier;
          doc.type = "journal";
          console.log(doc);
          vm.documents.push(doc);
          vm.isLoading = false;
          vm.enteredIdentifier = "";
          vm.lastDocumentFound = doc;
        })
        .catch(function (error) {
          console.log(error);
          vm.error = true;
          vm.errorMessage = "Document not found";
          vm.isLoading = false;
        });
    },
    discardLastFound: function () {
      this.documents.pop();
      this.lastDocumentFound = null;
    },
    // parse documents to the required format
    parseDocuments: async function (file) {
      return new Promise((resolve, reject) => {
        file.text().then((fileContent) => {
          const docJSON = bibtexParse.toJSON(fileContent);
          const docs = [];
          docJSON.forEach((doc) => {
            const entry = doc.entryTags;
            let tagName = "";
            Object.keys(entry).forEach((key) => {
              if (key.includes("tags")) {
                tagName = key;
              }
            });
            entry.tags = doc.entryTags[tagName]
              ? doc.entryTags[tagName].split(",")
              : [];
            if (
              doc.entryTags.journal ||
              doc.entryTags.booktitle ||
              doc.entryTags.publisher
            ) {
              if (doc.entryTags.journal) entry.source = doc.entryTags.journal;
              else if (doc.entryTags.booktitle)
                entry.source = doc.entryTags.booktitle;
              else if (doc.entryTags.publisher)
                entry.source = doc.entryTags.publisher;
            }
            entry.type = doc.entryType ? doc.entryType : "journal";
            entry.keywords = doc.entryTags.keywords
              ? doc.entryTags.keywords.split(",")
              : null;
            entry.url = doc.entryTags.url ? doc.entryTags.url : null;
            entry.pages = doc.entryTags.pages ? doc.entryTags.pages : null;
            entry.volume = doc.entryTags.volume ? doc.entryTags.volume : null;
            entry.number = doc.entryTags.number ? doc.entryTags.number : null;
            entry.created = new Date().toISOString().slice(0, 10);
            entry.id =
              "_" + Math.random().toString(36) + Math.random().toString(36);
            entry.authors = this.parseAuthorString(
              doc.entryTags.author ? doc.entryTags.author : ""
            );
            entry.authorsString = "";
            entry.authors.forEach((author) => {
              entry.authorsString += author.first_name
                ? author.first_name + " "
                : "";
              entry.authorsString += author.last_name + ", ";
            });
            entry.authorsString = entry.authorsString.substring(
              0,
              entry.authorsString.length - 2
            );
            entry.identifiers = this.parseIdentifiers(entry);
            entry.user = {};
            entry.user.photo = this.$store.getters.get_photo_url;
            entry.user._id = this.$store.getters.get_user_id;
            entry.user.display_name = this.$store.getters.get_display_name;
            docs.push(entry);
            console.log(entry);
          });
          console.log(docs);
          resolve(docs);
        });
      });
    },
    parseAuthorString(authors: string) {
      const authorsArray = [];
      const a = authors.split(" and ");
      a.forEach((author) => {
        const obj = {};
        if (author.includes(",")) {
          const a = author.split(",");
          obj.first_name = a[1].slice(1);
          obj.last_name = a[0];
        } else {
          const a = author.split(" ");
          obj.last_name = a.pop();
          obj.first_name = a.join(" ")
        }
        authorsArray.push(obj);
      });
      return authorsArray;
    },
    parseIdentifiers(doc: any) {
      const identifiers = {};
      doc.doi ? (identifiers.doi = doc.doi) : null;
      doc.eprint ? (identifiers.arxiv = doc.eprint) : null;
      doc.pmid ? (identifiers.pmid = doc.pmid) : null;
      doc.mag ? (identifiers.mag = doc.mag) : null;
      doc.acl ? (identifiers.acl = doc.acl) : null;
      doc.isbn ? (identifiers.isbn = doc.isbn) : null;
      doc.issn ? (identifiers.issn = doc.issn) : null;
      return identifiers;
    },
  },
});
</script>

<style>
</style>