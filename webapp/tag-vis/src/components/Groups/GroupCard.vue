<!-- A group card represents one group, this component also provides functionality to manage this group. Group cards are displayed in the GroupGrid -->
<template>
  <v-container>
    <v-card class="center" elevation="6" min-width="300">
      <v-card-title class="mt-0 mb-0">{{ this.group.name }}</v-card-title>

      <v-card-text>
        <div class="mb-3 subtitle-1" v-if="group.description !== ''">
          <b>Description:</b> {{ this.group.description }}
        </div>
        <div class="">
          <b>Number of Documents:</b> {{ this.group.numberOfDocuments }}<br />
          <b>Last Modified:</b> {{ this.lastModifiedDateString }}<br />
          <b>Created:</b> {{ this.createdDateString }}<br />
          <div v-if="this.group.tags.length > 0">
            <b>Tags: </b>
            <v-chip
              small
              class="mr-1 mb-1 mt-1"
              v-bind:key="tag"
              v-for="tag in group.tags"
              >{{ tag }}</v-chip
            >
            <br />
          </div>
          <b>Members:</b>
          <v-tooltip
            bottom
            v-for="member in group.members"
            v-bind:key="member._id"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-avatar
                size="40"
                class="ml-1"
                :color="member.photo ? '' : 'primary'"
              >
                <v-img
                  v-if="member.photo"
                  :src="member.photo"
                  v-bind="attrs"
                  v-on="on"
                ></v-img>
                <v-icon
                  dark
                  v-else
                  v-bind="attrs"
                  v-on="on"
                  size="40"
                  style="cursor: default"
                >
                  mdi-account-circle
                </v-icon>
              </v-avatar>
            </template>
            <span>{{ member.display_name }}</span>
          </v-tooltip>
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
              <v-icon>mdi-bookshelf</v-icon>
            </v-btn>
          </template>
          <span>Group library</span>
        </v-tooltip>
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
          <span>Copy invite link</span>
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
              <span>Edit group</span>
            </v-tooltip>
          </template>
          <v-card>
            <v-toolbar color="primary" dark>
              <div style="font-size: 18px">Edit group</div>
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
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Leave group</span>
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
          :disabled="isLeaving"
          >Cancel</v-btn
        >
        <v-btn class="" color="red" @click="leave" :loading="isLeaving"
          >Leave</v-btn
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
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

Vue.use(Clipboard);

export default Vue.extend({
  name: "GroupCard",
  methods: {
    load() {
      this.$router.push({
        name: "Groups",
        params: { groupID: this.group._id },
      });
    },
    share() {
      this.$clipboard(window.location.origin + "/#/groups/" + this.group._id);
      this.snackbar = true;
    },
    leave() {
      var vm = this;
      vm.isLeaving = true;
      axios
        .patch("/api/groups/leave", {
          access_token: vm.$store.getters.get_access_token,
          id: vm.group._id,
          user: vm.$store.getters.get_user_id,
        })
        .then(function (res) {
          //remove left group from grid
          vm.$parent.groups.splice(
            vm.$parent.groups.findIndex((e) => e._id === vm.group._id),
            1
          );
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.isLeaving = false;
        });
    },
    edit() {
      var vm = this;
      vm.isEditing = true;
      axios
        .patch("/api/groups/update", {
          group: JSON.stringify({
            _id: vm.group._id,
            name: vm.editedTitle,
            description: vm.editedDescription,
          }),
        })
        .then(function (res) {
          vm.group.name = vm.editedTitle;
          vm.group.description = vm.editedDescription;
          vm.group.last_modified = new Date();
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.dialog = false;
          vm.isEditing = false;
        });
    },
    cancelEdit() {
      this.dialog = false;
      //this.group = this.$parent.groups[this.$parent.groups.findIndex((e) => e._id === this.group._id)]
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
    timeAgo: new TimeAgo("en-US"),
    isEditing: false,
    isLeaving: false,
  }),
  props: {
    group: {},
  },
  computed: {
    createdDateString: function () {
      return new Date(this.group.created).toLocaleDateString("en-us");
    },
    lastModifiedDateString: function () {
      return this.timeAgo.format(new Date(this.group.last_modified));
    },
  },
  mounted() {
    this.editedTitle = this.group.name;
    this.editedDescription = this.group.description;
  },
});
</script>

<style scoped>
</style>
