<!-- Dialog for editing tags of a document -->
<template>
  <v-dialog
    max-width="600"
    v-model="dialog"
    v-if="this.$store.getters.is_logged_in"
    :persistent="isSaving"
  >
    <template v-slot:activator="{ on: dialog }">
      <v-tooltip transition="slide-y-transition" bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-chip
            v-on="{ ...dialog, ...tooltip }"
            v-on:click="getSuggestions"
            small
            class="pl-1 pr-1"
            ><v-icon size="22px" class="ml-0 mr-0">mdi-pencil</v-icon></v-chip
          >
        </template>
        <span>Edit Tags</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-toolbar color="primary" dark>
        <div style="font-size: 18px">Edit Tags</div>
      </v-toolbar>
      <v-card-text class="pl-2 pr-2">
        <div class="pb-0 d-flex align-center mt-4">
          <v-text-field
            v-model="newTag"
            label="New Tag"
            class="flex-grow-1"
            hide-details
            outlined
            @keydown.enter="btnAdd"
          ></v-text-field>
          <v-btn color="primary" class="ml-2" v-on:click="btnAdd">add</v-btn>
        </div>
        <div class="mt-3">
          <b>Current Tags: </b><span v-if="editedTags == 0">none</span>
          <v-chip
            small
            class="mr-1 mb-1 mt-1"
            v-bind:key="tag"
            v-for="tag in editedTags"
            >{{ tag
            }}<v-icon class="ml-2" v-on:click="remove(tag)"
              >mdi-delete</v-icon
            ></v-chip
          >
        </div>
        <div v-if="suggest.length > 0" class="mt-3">
          <b>Suggestions: </b>
          <v-chip
            small
            class="mr-1 mb-1 mt-1"
            v-bind:key="tag"
            v-for="tag in suggest"
            >{{ tag
            }}<v-icon class="ml-2" v-on:click="add(tag)"
              >mdi-plus</v-icon
            ></v-chip
          >
        </div>
        <div class="mt-3">
          <v-row justify="center" style="width: 100%" v-if="isLoading">
            <v-progress-circular
              :size="30"
              :width="5"
              color="primary"
              style="position: relative"
              class=""
              indeterminate
            ></v-progress-circular>
          </v-row>
        </div>
        <div class="mt-3">
          <b class="mt-3">Document Details:</b><br />
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ document.title }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="document.authorsString.length > 0">
                  <b>Authors: </b>{{ document.authorsString }}
                </div>
                <div v-if="document.year"><b>Year: </b>{{ document.year }}</div>
                <div v-if="document.source">
                  <b>Source: </b>{{ document.source }}
                </div>
                <div v-if="document.abstract">
                  <b>Abstract: </b>{{ document.abstract }}
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card-text>
      <v-alert type="error" v-if="failedToSave" class="ml-2 mr-2"><span v-html="failedToSaveErrorText"></span></v-alert>
      <v-card-actions class="justify-end mt-1">
        <v-btn text @click="cancelEdit" :disabled="isSaving">Cancel</v-btn>
        <v-btn color="primary" @click="saveTags" :loading="isSaving"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
export default Vue.extend({
  name: "TagSuggestions",
  data: () => ({
    dialog: false,
    newTag: "",
    suggestions: [],
    editedTags: [],
    isLoading: true,
    isSaving: false,
    failedToSave: false,
    failedToSaveErrorText: "",
  }),
  props: {
    document: {},
  },
  mounted() {
    this.editedTags = JSON.parse(JSON.stringify(this.document.tags));
  },
  methods: {
    add(tag) {
      if (!this.editedTags.includes(tag)) {
        this.editedTags.push(tag);
      }
    },
    remove(tag) {
      var index = this.editedTags.indexOf(tag);
      if (index !== -1) {
        this.editedTags.splice(index, 1);
      }
    },
    // update the tags of this document
    saveTags() {
      var vm = this;
      vm.isSaving = true;
      vm.failedToSave = false;
      axios
        .patch("/api/documents/update", {
          document: JSON.stringify({
            _id: vm.document._id,
            tags: vm.editedTags,
            access_token: vm.$store.getters.get_access_token,
          }),
        })
        .then(function (res) {
          vm.document.tags = res.data;
          vm.dialog = false;
        })
        .catch(function (error) {
          vm.failedToSave = true;
          vm.document.tags = error.response.data;
          if (error.response.status == 403) {
            vm.failedToSaveErrorText =
              "Failed to save tags in Zotero due to missing write permissions! Your changes may be overwritten when syncing with Zotero.<br>You can simply log out and back into TagVis to create a new Zotero key with the required permissions. Please make sure to keep 'Allow write access' checked when creating the new key.<br>Alternatively, you can edit the lastest TagVis key at <a href=https://www.zotero.org/settings/keys target='_blank'>https://www.zotero.org/settings/keys</a>";
          } else {
            vm.failedToSaveErrorText = "Failed to save tags!";
          }
        })
        .finally(() => {
          //if doc is selected: update tags in selected array in store
          const selected = JSON.parse(
            JSON.stringify(vm.$store.getters.get_selected_documents)
          );
          for (let i = 0; i < selected.length; i++) {
            if (selected[i]._id == vm.document._id) {
              selected[i].tags = vm.editedTags;
              vm.$store.commit("change_selected_documents", selected);
              break;
            }
          }
          vm.isSaving = false;
        });
    },
    cancelEdit() {
      this.dialog = false;
    },
    // get suggestions for this paper from back end
    getSuggestions() {
      var vm = this;
      vm.editedTags = JSON.parse(JSON.stringify(vm.document.tags));
      if (vm.suggestions.length == 0) {
        vm.isLoading = true;
        axios
          .get("/api/documents/suggestions", {
            headers: {
              id: vm.document._id,
            },
          })
          .then(function (res) {
            vm.suggestions = res.data;
            console.log(vm.suggestions);
            vm.isLoading = false;
          })
          .catch(function (error) {
            console.log(error);
            vm.isLoading = false;
          });
      }
    },
    btnAdd() {
      if (this.newTag.length > 0) {
        this.add(this.newTag);
        this.newTag = "";
      }
    },
  },
  computed: {
    suggest: function () {
      let a = new Set(this.suggestions);
      let b = new Set(this.editedTags);
      return [...a].filter((x) => !b.has(x));
    },
  },
});
</script>

<style>
</style>