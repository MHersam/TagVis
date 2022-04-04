<!-- Main component, contains the app bar and the router view where other views are displayed, handles auto login from token in cookies-->
<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <router-link :to="startLink">
        <div class="d-flex align-center">
          <!--
          <v-img
            alt="Vuetify Logo"
            class="shrink mr-2"
            contain
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
            transition="scale-transition"
            width="40"
          />
          <v-img
            alt="Vuetify Name"
            class="shrink mt-1 hidden-sm-and-down"
            contain
            min-width="100"
            src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
            width="100"
          />
          !-->
          <v-img
            alt="Vuetify Name"
            class="shrink mt-1"
            contain
            min-width="100"
            src="./assets/tv_logo_1.png"
            width="100"
          />
        </div>
      </router-link>
      <AppBarButtons />
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import AppBarButtons from "./components/AppBarButtons.vue";
import axios from "axios";
import qs from "querystring";
export default Vue.extend({
  data: () => ({}),
  components: {
    AppBarButtons,
  },
  computed: {
    startLink() {
      return this.$store.getters.is_logged_in ? "/dashboard" : "/";
    },
  },
  mounted() {
    // try to log in user if token is present in cookies
    console.log(this.$cookies.get("refresh_token"));
    if (this.$cookies.isKey("refresh_token")) {
      var vm = this;
      axios
        .post(
          "/api/auth/token",
          qs.stringify({
            refresh_token: this.$cookies.get("refresh_token"),
          })
        )
        .then(function (res) {
          console.log(res.data);
          vm.$store.commit("change_user_id", res.data._id);
          vm.$store.commit("change_is_logged_in", true);
          vm.$store.commit("change_display_name", res.data.display_name);
          vm.$store.commit("change_photo_url", res.data.photo);
          vm.$store.commit("change_access_token", res.data.auth_token);
          vm.$store.commit("change_user_created", res.data.created);
          vm.$store.commit("change_account_type", res.data.account_type);
          vm.$store.commit("change_settings", res.data.settings);
          //don't change graph type when it's loading a session
          if (!vm.$router.currentRoute.params.sessionID) {
            vm.$store.commit(
              "change_graph_type",
              res.data.settings.default_graph_type
            );
          }
          vm.$cookies.set("auth_token", res.data.auth_token);
          vm.$cookies.set("refresh_token", res.data.refresh_token);
          if (vm.$router.currentRoute.fullPath == "/") {
            vm.$router.push("/dashboard");
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  },
});
</script>
<style>
.globalMaxWidth {
  max-width: 960px;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.verticalCenter {
  position: relative;
  margin: 0;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

.unselectable {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
