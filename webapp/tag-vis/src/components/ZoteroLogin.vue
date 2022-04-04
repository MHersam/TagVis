<!-- Button for the Zotero login, handles the login procedure with Zotero -->
<template>
  <v-container class="pt-0">
    <v-btn
      v-if="!this.$store.getters.is_logged_in"
      color="#ffffff"
      large
      v-on:click="redirectToZotero"
      class="pa-3 d-flex"
      style="width: 100%"
      ><v-img
        src="../assets/zotero_icon.png"
        lazy-src="../assets/zotero_icon.png"
        height="36px"
        width="36px"
        class="mr-3 ml-0 v-btn flex-grow-0"
      >
      </v-img
      ><div class="flex-grow-1">Log in with Zotero</div></v-btn
    >
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
const qs = require("querystring");
var config = require("../../../../config.json");

export default Vue.extend({
  name: "ZoteroLogin",
  data: function () {
    return {};
  },
  methods: {
    // Send the oauth verifier to our back end to complete the auth procedure there
    send: function (oAuthToken, oAuthVerifier) {
      const vm = this;
      const store = this.$store;
      const router = this.$router;
      const oAuthSecret = vm.$cookies.get("zotero_oauth_secret");
      axios
        .post(
          "/api/auth/zotero/verify",
          qs.stringify({
            oauth_token: oAuthToken,
            oauth_verifier: oAuthVerifier,
            oauth_secret: oAuthSecret,
          })
        )
        .then(function (res) {
          console.log(res.data);
          store.commit("change_user_id", res.data._id);
          store.commit("change_is_logged_in", true);
          store.commit("change_display_name", res.data.zotero.username);
          store.commit("change_photo_url", res.data.photo);
          store.commit("change_access_token", res.data.auth_token);
          vm.$store.commit("change_user_created", res.data.created);
          vm.$store.commit("change_account_type", res.data.account_type);
          vm.$store.commit("change_settings", res.data.settings);
          vm.$store.commit(
            "change_graph_type",
            res.data.settings.default_graph_type
          );
          vm.$cookies.set("auth_token", res.data.auth_token);
          vm.$cookies.set("refresh_token", res.data.refresh_token);
          window.history.replaceState({}, document.title, "/");
          var route = "/dashboard";
          if (
            vm.$cookies.isKey("last_route") &&
            vm.$cookies.get("last_route") != "/"
          ) {
            route = vm.$cookies.get("last_route");
          }
          vm.$cookies.remove("last_route");
          vm.$router.push(route);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    redirectToZotero() {
      var vm = this;
      this.$cookies.set("last_route", this.$router.currentRoute.fullPath);
      axios
        .get("/api/auth/zotero/redirect")
        .then(function (res) {
          console.log(res.data);
          vm.$cookies.set("zotero_oauth_secret", res.data.oAuthTokenSecret);
          window.location.href = res.data.url;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getURLParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
  },
  mounted() {
    const oAuthToken = this.getURLParameterByName("oauth_token");
    const oAuthVerifier = this.getURLParameterByName("oauth_verifier");
    console.log(oAuthToken);
    console.log(oAuthVerifier);
    if (oAuthVerifier && oAuthToken) {
      this.send(oAuthToken, oAuthVerifier);
    }
  },
});
</script>
<style scoped>
.v-btn:hover:before {
  display: none;
}
</style>
