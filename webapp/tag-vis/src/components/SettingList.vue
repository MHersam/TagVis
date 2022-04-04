<!-- The component that lets users change their settings and save them to the database -->
<template>
  <v-container>
    <h1>Settings</h1>
    <v-card class="mt-3">
      <!--
      <v-list three-line subheader>
        <v-subheader>General</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-switch
              v-on:click="toggleDarkTheme"
              :value="dark_theme"
            ></v-switch>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dark Theme (WIP)</v-list-item-title>
            <v-list-item-subtitle
              >Changes the website to dark mode</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
      !-->
      <v-divider></v-divider>
      <v-list
        two-line
        subheader
        class="unselectable"
        v-if="$store.getters.get_account_type == 'TagVis'"
      >
        <v-subheader>Account</v-subheader>
        <v-list-item>
          <v-list-item-content>
            <image-input
              ref="imageInput"
              v-model="avatar"
              style="max-width: 150px"
            >
              <span slot="activator">
                <v-avatar
                  size="150px"
                  v-ripple
                  v-if="!avatar"
                  class="grey lighten-3 mb-3"
                >
                  <div>
                    <v-icon size="30">mdi-upload</v-icon><br />Click to upload
                    avatar
                  </div>
                </v-avatar>
              </span>
            </image-input>

            <div class="">
              <v-hover>
                <template v-slot:default="{ hover }">
                  <v-avatar
                    size="150px"
                    v-ripple
                    v-if="avatar"
                    class="mb-3"
                    v-on:click="removeAvatar"
                  >
                    <img :src="avatar.imageURL" alt="avatar" />
                    <v-fade-transition>
                      <v-overlay v-if="hover" absolute color="primary">
                        <v-icon size="48">mdi-image-remove</v-icon>
                      </v-overlay>
                    </v-fade-transition>
                  </v-avatar>
                </template>
              </v-hover>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-text-field
              class="mb-3"
              outlined
              hide-details="auto"
              v-model="displayName"
              :error-messages="displayNameErrorMessage"
              label="Display Name"
              style="max-width: 500px"
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>
        <v-dialog
          max-width="400"
          v-model="dialog"
          v-if="this.$store.getters.is_logged_in"
          :persistent="isChanging"
        >
          <template v-slot:activator="{ on: dialog }">
            <v-list-item ripple class="ma-0" v-on="{ ...dialog }">
              <v-list-item-content>
                <div>
                  Change password <v-icon class="ml-2">mdi-open-in-new</v-icon>
                </div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-card>
            <v-toolbar color="primary" dark>
              <div style="font-size: 18px">Change Password</div>
            </v-toolbar>
            <v-card-text class="mt-4 pb-0">
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="currentPassword"
                :error-messages="currentPasswordErrorMessage"
                :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showCurrentPassword ? 'text' : 'password'"
                @click:append="showCurrentPassword = !showCurrentPassword"
                label="Current Password"
                required
                :disabled="isChanging"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="newPassword"
                :error-messages="newPasswordErrorMessage"
                :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showNewPassword ? 'text' : 'password'"
                @click:append="showNewPassword = !showNewPassword"
                label="New Password"
                required
                :disabled="isChanging"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="confirmNewPassword"
                :error-messages="newPasswordErrorMessage"
                :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showNewPassword ? 'text' : 'password'"
                @click:append="showNewPassword = !showNewPassword"
                label="Confirm New Password"
                required
                :disabled="isChanging"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="justify-end mt-1">
              <v-btn text @click="cancelChangePassword" :disabled="isChanging"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                @click="changePassword"
                :loading="isChanging"
                >Change</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-list>
      <v-divider></v-divider>
      <v-list three-line subheader class="unselectable">
        <v-subheader>Tables</v-subheader>
        <v-list-item ripple v-on:click="multi_expand = !multi_expand">
          <v-list-item-action>
            <v-checkbox v-model="multi_expand" readonly></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Multi Expand Table Rows</v-list-item-title>
            <v-list-item-subtitle
              >Allows to have multiple table rows expanded at the same
              time</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-select
              :items="numberOfTableRows"
              v-model="number_of_table_rows"
              solo
              hide-details
              style="width: 75px"
            ></v-select>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              >Default Number of Table Rows per Page</v-list-item-title
            >
            <v-list-item-subtitle
              >Changes the default number of documents displayed on a table
              page</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-select
              :items="$store.getters.get_graph_type_items"
              v-model="default_graph_type"
              solo
              hide-details
              style="width: 260px"
            ></v-select>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Default Graph Type</v-list-item-title>
            <v-list-item-subtitle
              >Change the default graph type that is selected for
              visualizations</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list three-line subheader ripple class="unselectable mb-0 pb-0">
        <v-subheader>Visualization</v-subheader>
        <!--
        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="png_resolution_scale"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Graph PNG Resolution Scale</v-list-item-title>
            <v-list-item-subtitle
              >Specify the image resolution of graphs when clicking
              <v-icon>mdi-camera</v-icon></v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
        !-->
        <v-list-item
          ripple
          v-on:click="
            add_semantic_scholar_topics_to_graphs =
              !add_semantic_scholar_topics_to_graphs
          "
        >
          <v-list-item-action>
            <v-checkbox
              readonly
              v-model="add_semantic_scholar_topics_to_graphs"
            ></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              >Add Semantic Scholar Topics as Tags</v-list-item-title
            >
            <v-list-item-subtitle
              >If this option is enabled, Semantic Scholar topics are assigned
              to the nodes in visualized graphs in addition to your manually
              assigned tags. Your library stays untouched and "Explore Cited
              Papers" graphs are unaffected by this
              option.</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          ripple
          v-on:click="node_size_citation_count = !node_size_citation_count"
        >
          <v-list-item-action>
            <v-checkbox
              readonly
              v-model="node_size_citation_count"
            ></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              >Node Size Represents Citation Count</v-list-item-title
            >
            <v-list-item-subtitle
              >The node size shows how often the document has been
              cited</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-btn
        color="primary"
        class="mt-3 mb-3 float-right"
        :loading="isSaving"
        v-on:click="save"
        >Save</v-btn
      >
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
import axios from "axios";
import ImageInput from "./ImageInput.vue";
export default Vue.extend({
  name: "SettingList",
  components: {
    ImageInput,
  },
  data: () => ({
    dialog: false,
    dark_theme: false,
    multi_expand: false,
    number_of_table_rows: "10",
    png_resolution_scale: "2",
    node_size_citation_count: true,
    add_semantic_scholar_topics_to_graphs: true,
    default_graph_type: "Tags",
    numberOfTableRows: ["5", "10", "25", "50", "all"],
    isSaving: false,
    snackbar: false,
    snackbarText: "Settings saved!",
    snackbarTimeout: 4000,
    displayName: "",
    displayNameErrorMessage: "",
    avatar: null,
    isChanging: false,
    newPassword: "",
    confirmNewPassword: "",
    currentPassword: "",
    showNewPassword: false,
    showCurrentPassword: false,
    newPasswordErrorMessage: "",
    currentPasswordErrorMessage: "",
  }),
  methods: {
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    save() {
      var vm = this;
      if (this.displayName != "") {
        this.displayNameErrorMessage = "";
        vm.isSaving = true;
        var settings = {
          dark_theme: vm.dark_theme,
          multi_expand: vm.multi_expand,
          number_of_table_rows: vm.number_of_table_rows,
          png_resolution_scale: vm.png_resolution_scale,
          node_size_citation_count: vm.node_size_citation_count,
          add_semantic_scholar_topics_to_graphs:
            vm.add_semantic_scholar_topics_to_graphs,
          default_graph_type: vm.default_graph_type,
        };
        var user = {
          settings: settings,
          auth_token: vm.$store.getters.get_access_token,
          display_name: vm.displayName,
        };
        if (vm.$store.getters.get_account_type == "TagVis") {
          user.photo = vm.avatar ? vm.avatar.uri : null;
        }
        axios
          .post("/api/users/update", {
            user: user,
          })
          .then(function (res) {
            vm.$store.commit("change_settings", settings);
            vm.$store.commit("change_display_name", vm.displayName);
            if (vm.$store.getters.get_account_type == "TagVis") {
              var url = new URL(vm.$store.getters.get_photo_url);

              //Add a random string to url to force update of images
              var rURL =
                url.origin +
                url.pathname +
                "?userid=" +
                vm.$store.getters.get_user_id +
                "&random=" +
                (Math.random() + 1).toString(36).substr(2, 5);
              vm.$store.commit("change_photo_url", rURL);
            }
            vm.$store.commit("change_graph_type", settings.default_graph_type);
            vm.snackbarText = "Settings saved!";
            vm.snackbar = true;
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            vm.isSaving = false;
          });
      } else {
        this.displayNameErrorMessage = "Display name can't be empty";
      }
    },
    setLocalSettings() {
      var settings = this.$store.getters.get_settings;
      this.dark_theme = settings.dark_theme;
      this.multi_expand = settings.multi_expand;
      this.number_of_table_rows = settings.number_of_table_rows;
      this.png_resolution_scale = settings.png_resolution_scale;
      this.node_size_citation_count = settings.node_size_citation_count;
      this.add_semantic_scholar_topics_to_graphs =
        settings.add_semantic_scholar_topics_to_graphs;
      this.default_graph_type = settings.default_graph_type;
    },
    removeAvatar() {
      this.$refs.imageInput.avatar = null;
      this.$refs.imageInput.$refs.file.value = null;
      this.avatar = null;
    },
    changePassword() {
      var vm = this;
      vm.isChanging = true;
      vm.newPasswordErrorMessage = "";
      vm.currentPasswordErrorMessage = "";
      if (this.validatePasswords()) {
        axios
          .post("/api/users/changePassword", {
            auth_token: vm.$store.getters.get_access_token,
            new_password: vm.newPassword,
            current_password: vm.currentPassword,
          })
          .then(function (res) {
            vm.newPassword = "";
            vm.confirmNewPassword = "";
            vm.currentPassword = "";
            vm.showNewPassword = false;
            vm.showCurrentPassword = false;
            vm.newPasswordErrorMessage = "";
            vm.currentPasswordErrorMessage = "";
            vm.snackbarText = "Password successfully changed!";
            vm.snackbar = true;
            vm.dialog = false;
          })
          .catch(function (error) {
            vm.currentPasswordErrorMessage = "Password incorrect";
          })
          .finally(() => {
            vm.isChanging = false;
          });
      } else {
        vm.isChanging = false;
      }
    },
    cancelChangePassword() {
      this.newPassword = "";
      this.confirmNewPassword = "";
      this.currentPassword = "";
      this.showNewPassword = false;
      this.showCurrentPassword = false;
      this.dialog = false;
      this.currentPasswordErrorMessage = "";
      this.newPasswordErrorMessage = "";
    },
    validatePasswords() {
      var error = false;
      if (this.newPassword == "") {
        this.newPasswordErrorMessage = "Required";
        error = true;
      }
      if (this.currentPassword == "") {
        this.currentPasswordErrorMessage = "Required";
        error = true;
      }
      if (this.newPassword != this.confirmNewPassword) {
        this.newPasswordErrorMessage = "New Passwords don't match";
        error = true;
      }
      return !error;
    },
  },
  watch: {
    "$store.getters.get_settings": function () {
      this.setLocalSettings();
    },
    "$store.getters.get_display_name": function (val) {
      this.displayName = val;
    },
  },
  mounted() {
    this.displayName = this.$store.getters.get_display_name;
    this.setLocalSettings();
  },
});
</script>

<style>
</style>