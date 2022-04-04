<!-- A session card represents one session, this component also provides functionality to manage this session. Session cards are displayed in the SessionGrid component -->
<template>
  <v-container>
    <v-card class="center" max-width="400" min-width="375" elevation="6">
      <v-img height="250" contain :src="session.preview_image"></v-img>

      <v-card-title class="mt-0 mb-0">{{ this.session.name }}</v-card-title>

      <v-card-text>
        <div class="mb-3 subtitle-1" v-if="session.description !== ''">
          <b>Description:</b> {{ this.session.description }}
        </div>
        <div class="">
          <b>Created:</b> {{ this.createdDateString }}<br /><b>Graph Type:</b>
          {{ this.session.type }}<br /><b>Views:</b> {{ this.session.views }}
        </div>
      </v-card-text>

      <v-card-text v-if="!isRemoveConfirm">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              v-on:click="load"
              elevation="2"
              v-bind="attrs"
              v-on="on"
              color="primary"
              class="btn"
            >
              <v-icon>mdi-play</v-icon>
            </v-btn>
          </template>
          <span>Load Session</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              v-on:click="selectSessionDocuments"
              elevation="2"
              v-bind="attrs"
              v-on="on"
              class="btn ml-3"
            >
              <v-icon>mdi-check-box-multiple-outline</v-icon>
            </v-btn>
          </template>
          <span>Select Session Documents</span>
        </v-tooltip>

        <!--
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              rounded
              v-on:click="selectAndVisualize"
              elevation="2"
              v-bind="attrs"
              v-on="on"
              class="btn ml-3 pl-1 pr-1"
            >
              <v-icon>mdi-check-box-multiple-outline</v-icon>
              <v-icon>mdi-plus</v-icon>
              <v-icon>mdi-play</v-icon>
            </v-btn>
          </template>
          <span>Select Up-To-Date Documents and Visualize</span>
        </v-tooltip>
-->
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              v-on:click="share"
              elevation="2"
              v-bind="attrs"
              v-on="on"
              class="btn ml-3"
            >
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <span>Share Session</span>
        </v-tooltip>

        <v-dialog max-width="500" v-model="dialog" :persistent="isEditing">
          <template v-slot:activator="{ on: dialog }">
            <v-tooltip transition="slide-y-transition" bottom>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn
                  v-on="{ ...tooltip, ...dialog }"
                  class="btn ml-3"
                  elevation="2"
                  fab
                  small
                  ><v-icon size="24px">mdi-pencil</v-icon></v-btn
                >
              </template>
              <span>Edit Session</span>
            </v-tooltip>
          </template>
          <v-card>
            <v-toolbar color="primary" dark>
              <div style="font-size: 18px">Edit Session</div>
            </v-toolbar>
            <v-card-text class="pb-0">
              <v-text-field
                v-model="editedTitle"
                label="Title (optional)"
                class="mt-4"
                hide-details
                @keydown.enter="edit"
                outlined
                :disabled="isEditing"
              ></v-text-field>
              <v-textarea
                v-model="editedDescription"
                class="mt-3"
                hide-details
                label="Description (optional)"
                outlined
                :disabled="isEditing"
              >
              </v-textarea>
            </v-card-text>
            <v-card-actions class="justify-end mt-1">
              <v-btn text @click="cancelEdit" :disabled="isEditing"
                >Cancel</v-btn
              >
              <v-btn color="primary" @click="edit" :loading="isEditing"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              v-on:click="isRemoveConfirm = true"
              elevation="2"
              v-bind="attrs"
              v-on="on"
              class="btn ml-3"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Delete Session</span>
        </v-tooltip>
      </v-card-text>
      <v-container
        class="d-flex flex-row justify-end pt-5 pb-4"
        v-if="isRemoveConfirm"
      >
        <v-btn
          class=""
          text
          @click="isRemoveConfirm = false"
          :disabled="isRemoving"
          >Cancel</v-btn
        >
        <v-btn class="" color="red" @click="remove" :loading="isRemoving"
          >Delete</v-btn
        >
      </v-container>
    </v-card>
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

<script lang="ts">
import Vue from "vue";
import Clipboard from "v-clipboard";
import axios from "axios";

Vue.use(Clipboard);

export default Vue.extend({
  name: "SessionCard",
  methods: {
    load() {
      this.$router.push({
        name: "Visualization",
        params: { sessionID: this.session._id },
      });
    },
    share() {
      this.$clipboard(window.location.origin + "/#/vis/" + this.session._id);
      this.snackbarText = "Copied share link to clipboard";
      this.snackbar = true;
    },
    remove() {
      var vm = this;
      vm.isRemoving = true;
      axios
        .delete("/api/sessions/remove", {
          headers: {
            access_token: vm.$store.getters.get_access_token,
            id: vm.session._id,
          },
        })
        .then(function (res) {
          //remove deleted session session from grid
          vm.$parent.sessions.splice(
            vm.$parent.sessions.findIndex((e) => e._id === vm.session._id),
            1
          );
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.isRemoving = false;
        });
    },
    // change title and description of the session
    edit() {
      var vm = this;
      vm.isEditing = true;
      axios
        .patch("/api/sessions/update", {
          session: JSON.stringify({
            _id: vm.session._id,
            name: vm.editedTitle,
            description: vm.editedDescription,
          }),
        })
        .then(function (res) {
          vm.dialog = false;
          vm.session.name = vm.editedTitle;
          vm.session.description = vm.editedDescription;
        })
        .catch(function (error) {
          vm.dialog = false;
          console.log(error);
        })
        .finally(() => {
          vm.isEditing = false;
        });
    },
    cancelEdit() {
      this.dialog = false;
      //this.session = this.$parent.sessions[this.$parent.sessions.findIndex((e) => e._id === this.session._id)]
    },
    // get the documents that were included in the session and select them
    selectSessionDocuments() {
      var vm = this;
      return new Promise(function (resolve, reject) {
        axios
          .get("/api/sessions/documents", {
            headers: {
              id: vm.session._id,
            },
          })
          .then(function (res) {
            vm.$store.commit("change_selected_documents", res.data);
            vm.snackbarText = res.data.length + " documents selected";
            vm.snackbar = true;
            resolve(true);
          })
          .catch(function (error) {
            console.log(error);
            reject(error);
          });
      });
    },
    // not used anywhere right now
    selectAndVisualize() {
      var vm = this;
      this.selectSessionDocuments().then(() => {
        vm.$store.commit("change_graph_type", vm.session.type);
        vm.$router.push({ name: "Visualization" });
      });
    },
  },
  data: () => ({
    snackbar: false,
    snackbarText: "Copied share link to clipboard",
    snackbarTimeout: 4000,
    dialog: false,
    editedTitle: "",
    editedDescription: "",
    isRemoveConfirm: false,
    isEditing: false,
    isRemoving: false,
  }),
  props: {
    session: {
      type: Object,
      required: true,
    },
  },
  computed: {
    createdDateString: function () {
      return new Date(this.session.created).toLocaleString("en-us");
    },
  },
  mounted() {
    this.editedTitle = this.session.name;
    this.editedDescription = this.session.description;
  },
});
</script>

<style scoped>
</style>
