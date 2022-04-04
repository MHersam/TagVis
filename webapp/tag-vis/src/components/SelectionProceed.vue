<!-- Organize and visualize selected documents -->
<template>
  <div class="d-flex justify-end flex-wrap align-top pt-2">
    <span
      v-if="this.$store.getters.get_selected_documents.length < 1"
      class="mr-3 mb-3 mt-3"
    >
      <b>Hint: select documents to proceed.</b>
    </span>
    <b class="mr-3 mb-3 mt-3"
      >{{ this.$store.getters.get_selected_documents.length }} selected</b
    >
    <v-dialog
      max-width="400"
      v-model="removeFromGroupDialog"
      v-if="$store.getters.is_logged_in && $parent.groupID"
      :persistent="isRemoving"
    >
      <template v-slot:activator="{ on: dialog }">
        <v-btn
          v-on="{ ...dialog }"
          class="btn ml-3 mt-1 mb-3"
          elevation="1"
          :disabled="$store.getters.get_selected_documents.length < 1"
          >Remove</v-btn
        >
      </template>
      <v-card>
        <v-toolbar color="primary" dark>
          <div style="font-size: 18px">
            Remove
            {{ this.$store.getters.get_selected_documents.length }} Documents?
          </div>
        </v-toolbar>
        <v-card-text class="mt-3"
          ><div style="font-size: 16px">
            Removes the selected documents from this group.
          </div></v-card-text
        >
        <v-card-actions class="justify-end mt-1">
          <v-btn text @click="cancelRemoveFromGroup" :disabled="isRemoving"
            >Cancel</v-btn
          >
          <v-btn color="red" @click="removeFromGroup" :loading="isRemoving"
            >Remove</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      max-width="500"
      v-model="removeFromLibraryDialog"
      v-if="$store.getters.is_logged_in && !$parent.groupID"
      :persistent="isRemoving"
    >
      <template v-slot:activator="{ on: dialog }">
        <v-btn
          v-on="{ ...dialog }"
          class="btn ml-3 mt-1 mb-3"
          elevation="1"
          :disabled="$store.getters.get_selected_documents.length < 1"
          >Remove</v-btn
        >
      </template>
      <v-card>
        <v-toolbar color="primary" dark>
          <div style="font-size: 18px">
            Remove
            {{ this.$store.getters.get_selected_documents.length }} Documents?
          </div>
        </v-toolbar>
        <v-card-text class="mt-3"
          ><div style="font-size: 16px">
            Removes the selected documents from your library and from all
            groups.
            <span v-if="$store.getters.get_account_type == 'Zotero'"
              ><b
                >The documents are also moved to the trash in your Zotero
                library!</b
              ></span
            ><span v-if="$store.getters.get_account_type == 'Mendeley'"
              ><b
                >The documents are also moved to the trash in your Mendeley
                library.</b
              ></span
            >
          </div></v-card-text
        >
        <v-alert type="error" v-if="removalFailed" class="ml-2 mr-2"
          ><span v-html="removalFailedErrorText"></span
        ></v-alert>
        <v-card-actions class="justify-end mt-1">
          <v-btn text @click="cancelRemoveFromLibrary" :disabled="isRemoving"
            >Cancel</v-btn
          >
          <v-btn color="red" @click="removeFromLibrary" :loading="isRemoving"
            >Remove</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      class="btn ml-3 mt-1 mb-3"
      elevation="1"
      v-if="$parent.groupID && $store.getters.is_logged_in"
      :disabled="$store.getters.get_selected_documents.length == 0"
      v-on:click="addToLibrary"
      :loading="isAddingToLibrary"
      >Add to library</v-btn
    >
    <v-dialog
      max-width="500"
      v-model="dialog"
      v-if="$store.getters.is_logged_in"
      :persistent="isAddingToGroup"
    >
      <template v-slot:activator="{ on: dialog }">
        <v-tooltip transition="slide-y-reverse-transition" top>
          <template v-slot:activator="{ on: tooltip }">
            <v-btn
              v-on="{ ...tooltip, ...dialog }"
              class="btn ml-3 mt-1 mb-3"
              elevation="1"
              :disabled="$store.getters.get_selected_documents.length < 1"
              v-on:click="getUserGroups"
              >Add to Group(s)</v-btn
            >
          </template>
          <span>Add Selected Documents to Group(s)</span>
        </v-tooltip>
      </template>
      <v-card>
        <v-toolbar color="primary" dark>
          <div style="font-size: 18px">
            Add
            {{ this.$store.getters.get_selected_documents.length }} Documents to
            Group(s)
          </div>
        </v-toolbar>
        <v-card-text class="pb-0 pl-0 pr-0">
          <v-container class="mt-3" v-if="isLoading">
            <v-row justify="center">
              <v-progress-circular
                :size="45"
                :width="5"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-row>
          </v-container>
          <v-list subheader three-line>
            <v-list-item-group v-model="selectedGroups" multiple>
              <v-list-item v-for="group in groups" v-bind:key="group._id">
                <template v-slot:default="{ active }">
                  <v-list-item-action>
                    <v-checkbox
                      :input-value="active"
                      color="primary"
                    ></v-checkbox>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>{{ group.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      group.description
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end mt-1">
          <v-btn text @click="cancel" :disabled="isAddingToGroup">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="add"
            :disabled="selectedGroups.length == 0"
            :loading="isAddingToGroup"
            >Add to Group(s)</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-select
      :items="this.$store.getters.get_graph_type_items"
      v-model="type"
      style="max-width: 260px; display: inline-block"
      class="ml-3 mb-0 mr-3"
      solo
      persistent-hint
      hint="Graph type"
    ></v-select>
    <v-btn
      color="primary"
      v-on:click="next()"
      class="mt-1 mr-0"
      elevation="1"
      :disabled="this.$store.getters.get_selected_documents.length < 1"
      >Visualize</v-btn
    >
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
  name: "SelectionProceed",
  data: () => ({
    type: "",
    dialog: false,
    removeFromGroupDialog: false,
    removeFromLibraryDialog: false,
    removalFailed: false,
    removalFailedErrorText: "",
    groups: [],
    selectedGroups: [],
    isLoading: false,
    isRemoving: false,
    isAddingToLibrary: false,
    isAddingToGroup: false,
    snackbar: false,
    snackbarText: "",
    snackbarTimeout: 4000,
  }),
  watch: {
    type: function () {
      this.$store.commit("change_graph_type", this.type);
    },
    "$store.getters.get_graph_type": function (val) {
      this.type = val;
    },
  },
  methods: {
    next: function () {
      this.$router.push({
        name: "Visualization",
      });
    },
    add: function () {
      var vm = this;
      vm.isAddingToGroup = true;
      var promises = [];
      console.log(vm.selectedGroups);
      vm.selectedGroups.forEach((sg) => {
        var docIDs = [];
        vm.$store.getters.get_selected_documents.forEach((doc) => {
          docIDs.push(doc._id);
        });
        promises.push(
          axios.patch("/api/groups/addDocuments", {
            access_token: vm.$store.getters.get_access_token,
            id: vm.groups[sg]._id,
            documents: docIDs,
          })
        );
      });
      Promise.all(promises)
        .then(function (res) {
          vm.selectedGroups = [];
          vm.dialog = false;
          vm.snackbarText = "Successfully added documents to group(s)!";
          vm.snackbar = true;
        })
        .catch(function (error) {
          vm.dialog = false;
          console.log(error);
        })
        .finally(() => {
          vm.isAddingToGroup = false;
        });
    },
    addToLibrary: function () {
      var vm = this;
      vm.isAddingToLibrary = true;
      var docs = JSON.parse(
        JSON.stringify(vm.$store.getters.get_selected_documents)
      );
      docs = docs.filter(
        (doc) => doc.user._id != vm.$store.getters.get_user_id
      );
      docs.forEach((doc) => {
        delete doc.mendeley_id;
        delete doc.zotero_id;
        delete doc.user;
        delete doc._id;
      });
      if (docs.length > 0) {
        axios
          .post("/api/documents/add", {
            auth_token: vm.$store.getters.get_access_token,
            user: vm.$store.getters.get_user_id,
            documents: docs,
          })
          .then(function (res) {
            vm.$store.commit(
              "change_documents",
              res.data.concat(vm.$store.getters.get_documents)
            );
            vm.snackbarText = "Successfully added documents to your library!";
            vm.snackbar = true;
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            vm.isAddingToLibrary = false;
          });
      } else {
        vm.isAddingToLibrary = false;
      }
    },
    removeFromGroup: function () {
      var vm = this;
      vm.isRemoving = true;
      var docIDs = [];
      vm.$store.getters.get_selected_documents.forEach((doc) => {
        docIDs.push(doc._id);
      });
      axios
        .patch("/api/groups/removeDocuments", {
          access_token: vm.$store.getters.get_access_token,
          id: vm.$router.currentRoute.params.groupID,
          documents: docIDs,
        })
        .then(function (res) {
          vm.$parent.syncDocs();
          vm.$store.commit("change_selected_documents", []);
          vm.removeFromGroupDialog = false;
          vm.snackbarText = "Successfully removed documents from this group!";
          vm.snackbar = true;
        })
        .catch(function (error) {
          vm.removeFromGroupDialog = false;
          console.log(error);
        })
        .finally(() => {
          vm.isRemoving = false;
        });
    },
    cancel: function () {
      this.dialog = false;
    },
    cancelRemoveFromGroup: function () {
      this.removeFromGroupDialog = false;
    },
    removeFromLibrary: function () {
      var vm = this;
      vm.removalFailed = false;
      vm.isRemoving = true;
      var docIDs = [];
      vm.$store.getters.get_selected_documents.forEach((doc) => {
        docIDs.push(doc._id);
      });
      axios
        .patch("/api/documents/remove", {
          access_token: vm.$store.getters.get_access_token,
          user: vm.$store.getters.get_user_id,
          documents: docIDs,
        })
        .then(function (res) {
          vm.$parent.syncDocs();
          vm.$store.commit("change_selected_documents", []);
          vm.removeFromLibraryDialog = false;
          vm.snackbarText = "Successfully removed documents from your library!";
          vm.snackbar = true;
        })
        .catch(function (error) {
          console.log(error);
          vm.removalFailed = true;
          if (error.response.status == 403) {
            vm.removalFailedErrorText =
              "Failed to trash documents in Zotero due to missing write permissions! You can simply log out and back into TagVis to create a new Zotero key with the required permissions. Please make sure to keep 'Allow write access' checked when creating the new key.<br>Alternatively, you can edit the lastest TagVis key at <a href=https://www.zotero.org/settings/keys target='_blank'>https://www.zotero.org/settings/keys</a>";
          } else {
            vm.removalFailedErrorText = "Failed to remove documents!";
          }
        })
        .finally(() => {
          vm.isRemoving = false;
        });
    },
    cancelRemoveFromLibrary: function () {
      this.removeFromLibraryDialog = false;
    },
    getUserGroups: function () {
      if (this.groups.length == 0) {
        var vm = this;
        vm.isLoading = true;
        axios
          .get("/api/groups/all", {
            headers: {
              access_token: vm.$store.getters.get_access_token,
              user: vm.$store.getters.get_user_id,
            },
          })
          .then(function (res) {
            vm.groups = res.data;
            vm.isLoading = false;
            console.log(vm.groups);
          })
          .catch(function (error) {
            vm.groups = [];
            vm.isLoading = false;
            console.log(error);
          });
      }
    },
  },
  mounted() {
    this.type = this.$store.getters.get_graph_type;
  },
});
</script>
<style scoped>
</style>
