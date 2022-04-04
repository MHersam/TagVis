<!-- This component contains buttons in the app bar that are used to navigate the app -->
<template>
  <v-container fluid class="pr-0">
    <div class="d-flex floatRight align-center">
      <v-tooltip
        transition="slide-y-transition"
        bottom
        v-if="this.$store.getters.is_logged_in"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/library"
            class="order-1"
          >
            <v-icon size="24px">mdi-bookshelf</v-icon>
          </v-btn>
        </template>
        <span>Library</span>
      </v-tooltip>

      <v-tooltip
        transition="slide-y-transition"
        bottom
        v-if="this.$store.getters.is_logged_in"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/recommendations"
            class="order-2"
          >
            <v-icon size="24px">mdi-compass</v-icon>
          </v-btn>
        </template>
        <span>Recommendations</span>
      </v-tooltip>

      <v-tooltip
        transition="slide-y-transition"
        bottom
        v-if="this.$store.getters.is_logged_in"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/groups"
            class="order-3"
          >
            <v-icon size="24px">mdi-account-group</v-icon>
          </v-btn>
        </template>
        <span>Groups</span>
      </v-tooltip>

      <v-tooltip
        transition="slide-y-transition"
        bottom
        v-if="this.$store.getters.is_logged_in"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/sessions"
            class="order-4"
          >
            <v-icon size="24px">mdi-progress-clock</v-icon>
          </v-btn>
        </template>
        <span>Sessions</span>
      </v-tooltip>

      <v-tooltip
        transition="slide-y-transition"
        bottom
        v-if="this.$store.getters.is_logged_in"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/settings"
            class="order-5 d-none d-sm-flex"
          >
            <v-icon size="24px">mdi-cog</v-icon>
          </v-btn>
        </template>
        <span>Settings</span>
      </v-tooltip>

      <v-tooltip transition="slide-y-transition" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/learn-more"
            class="d-none d-sm-flex order-6"
          >
            <v-icon size="24px">mdi-school</v-icon>
          </v-btn>
        </template>
        <span>Learn more</span>
      </v-tooltip>

      <v-tooltip transition="slide-y-transition" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            v-on="on"
            text
            to="/documentation/visualization"
            class="d-none d-sm-flex order-7"
          >
            <v-icon size="24px">mdi-file-document-multiple</v-icon>
          </v-btn>
        </template>
        <span>Documentation</span>
      </v-tooltip>
      <!--
      <v-dialog max-width="500" v-model="dialog">
        <template v-slot:activator="{ on: dialog }">
          <v-tooltip transition="slide-y-transition" bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                v-on="{ ...tooltip, ...dialog }"
                class="d-none d-sm-flex order-7"
                fab
                small
                text
                ><v-icon size="24px">mdi-message-alert</v-icon></v-btn
              >
            </template>
            <span>Feedback</span>
          </v-tooltip>
        </template>
        <v-card>
          <v-toolbar color="primary" dark>
            <div style="font-size: 18px">
              Feedback of any kind is highly appreciated!
            </div>
          </v-toolbar>
          <v-card-text class="pb-0">
            <div class="mt-3" style="font-size: 16px;">
              You can contact me via Zulip or mail:
              <br /><br />
              HCI-CS Zulip: Michael Hersam
              <br />
              Email:
              <a href="mailto:st141496@stud.uni-stuttgart.de"
                >st141496@stud.uni-stuttgart.de</a
              >
              <br /><br />
              Looking forward to hearing what you think.<br /><br />
              Best,<br />
              Michael
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      -->
      <LogInSignUp />
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-y
        bottom
        v-if="isLoggedIn"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn text class="pa-2 ml-2 order-8" v-bind="attrs" v-on="on">
            <div class="hidden-sm-and-down mr-3">
              {{ displayName }}
            </div>
            <v-avatar size="36px">
              <img v-if="photo" alt="Avatar" v-bind:src="photo" />
              <v-icon dark v-else v-bind="attrs" v-on="on" size="36">
                mdi-account-circle
              </v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar size="60px" :color="photo ? '' : 'primary'">
                <img v-if="photo" :src="photo" alt="Avatar" />
                <v-icon dark v-else size="60" style="cursor: default">
                  mdi-account-circle
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{ displayName }}</v-list-item-title>
                <v-list-item-subtitle
                  >Account type: {{ accountType }}</v-list-item-subtitle
                >
                <v-list-item-subtitle
                  >Member since: {{ userCreated }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-tooltip
              transition="slide-y-transition"
              bottom
              v-if="this.$store.getters.is_logged_in"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  v-bind="attrs"
                  v-on="on"
                  text
                  to="/settings"
                  @click="menu = false"
                >
                  <v-icon size="25px">mdi-cog</v-icon>
                </v-btn>
              </template>
              <span>Settings</span>
            </v-tooltip>
            <v-tooltip transition="slide-y-transition" bottom v-if="isLoggedIn">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  small
                  v-bind="attrs"
                  v-on="on"
                  v-on:click="logout"
                  text
                  class="order-last"
                >
                  <v-icon size="25px">mdi-logout-variant</v-icon>
                </v-btn>
              </template>
              <span>Log Out</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import LogInSignUp from "./LogInSignUp.vue";
export default Vue.extend({
  name: "AppBarButtons",
  components: {
    LogInSignUp,
  },
  data: () => ({
    dialog: false,
    menu: false,
  }),
  methods: {
    logout() {
      this.menu = false;
      this.$store.commit("resetState");
      this.$cookies.remove("auth_token");
      this.$cookies.remove("refresh_token");
      this.$router.push({ name: "Home" });
    },
  },
  computed: {
    showLoginDialog: {
      get: function () {
        return this.$store.getters.get_show_login_dialog;
      },
      set: function (val) {
        this.$store.commit("change_show_login_dialog", val);
      },
    },
    isLoggedIn() {
      return this.$store.getters.is_logged_in;
    },
    displayName() {
      return this.$store.getters.get_display_name;
    },
    photo() {
      return this.$store.getters.get_photo_url;
    },
    accountType() {
      return this.$store.getters.get_account_type;
    },
    userCreated() {
      var d = new Date(this.$store.getters.get_user_created);
      return d.toLocaleDateString("en-en");
    },
  },
});
</script>

<style scoped>
.floatRight {
  float: right;
}
</style>
