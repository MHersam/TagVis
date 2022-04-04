<!-- Button for the Mendeley login, handles the login procedure with mendeley -->
<template>
  <v-container>
    <v-btn
      v-if="!this.$store.getters.is_logged_in"
      color="#BE212E"
      large
      dark
      v-on:click="saveRoute"
      :href="this.btnLink"
      class="pa-3 d-flex"
      style="width: 100%"
    >
      <v-img
        src="../assets/mendeley_icon.png"
        lazy-src="../assets/mendeley_icon.png"
        height="36px"
        width="46px"
        class="mr-3 ml-0 v-btn flex-grow-0"
      ></v-img
      ><div class="flex-grow-1">Log in with Mendeley</div></v-btn
    >
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
const qs = require("querystring");
var config = require("../../../../config.json");

export default Vue.extend({
  name: "MendeleyLogin",
  data: function () {
    return {
      code: null,
      btnLink:
        "https://api.mendeley.com/oauth/authorize?client_id=" +
        config.mendeley.clientid +
        "&redirect_uri=" +
        encodeURIComponent(config.mendeley.redirecturi) +
        "&response_type=code&scope=all",
    };
  },
  methods: {
    // get an auth token from the auth_code we received
    send: function () {
      const vm = this;
      const store = this.$store;
      const router = this.$router;
      axios
        .post(
          "/api/auth/mendeley",
          qs.stringify({
            auth_code: this.code,
          })
        )
        .then(function (res) {
          console.log(res.data);
          store.commit("change_user_id", res.data._id);
          store.commit("change_is_logged_in", true);
          store.commit("change_display_name", res.data.display_name);
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
    // save current route to cookie before leaving to mendeley so we can return to the last page later
    saveRoute() {
      this.$cookies.set("last_route", this.$router.currentRoute.fullPath);
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
    this.code = this.getURLParameterByName("code");
    if (this.code) {
      this.send();
    }
  },
});
</script>
<style scoped>
.v-btn:hover:before {
  display: none;
}
</style>
