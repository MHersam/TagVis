<!-- Dialog for login and signup, handles both -->
<template>
  <v-dialog
    max-width="400"
    v-model="showLoginDialog"
    v-if="!isLoggedIn"
    :persistent="isLoggingIn || isSigningUp"
  >
    <template v-slot:activator="{ on: dialog }">
      <span class="mt-0">
        <v-btn
          v-on="{ ...dialog }"
          elevation="2"
          color="primary darken-1"
          class="pa-3 mr-3"
          v-on:click="tab = 0"
          >Log In</v-btn
        >
        <v-btn
          v-on="{ ...dialog }"
          elevation="2"
          color="secondary darken-1"
          class="pa-3 mr-2"
          v-on:click="tab = 1"
          >Sign Up</v-btn
        >
      </span>
    </template>
    <v-card>
      <v-card-text class="pb-0">
        <v-tabs v-model="tab">
          <v-tab>Log In</v-tab>
          <v-tab>Sign Up</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-container class="mt-3 mb-12" style="max-width: 350px">
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="loginUsername"
                label="Username"
                :error-messages="loginUsernameErrorMessage"
                required
                :disabled="isLoggingIn"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="loginPassword"
                v-on:keyup.enter="login"
                :append-icon="showLoginPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showLoginPassword ? 'text' : 'password'"
                @click:append="showLoginPassword = !showLoginPassword"
                label="Password"
                :error-messages="loginPasswordErrorMessage"
                required
                :disabled="isLoggingIn"
              ></v-text-field>
              <v-btn
                color="primary"
                class="float-right"
                v-on:click="login"
                :loading="isLoggingIn"
                >Log In</v-btn
              >
            </v-container>
          </v-tab-item>
          <v-tab-item>
            <v-container class="mt-3 mb-12" style="max-width: 350px">
              <image-input
                ref="imageInput"
                v-model="avatar"
                class="d-flex justify-center flex-wrap"
              >
                <div slot="activator">
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
                </div>
              </image-input>

              <div class="d-flex justify-center">
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

              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="signupUsername"
                :error-messages="signupUsernameErrorMessage"
                label="Username"
                required
                :disabled="isSigningUp"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="signupDisplayName"
                :error-messages="signupDisplayNameErrorMessage"
                label="Display Name"
                required
                :disabled="isSigningUp"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="signupPassword"
                :error-messages="signupPasswordErrorMessage"
                :append-icon="showSignupPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showSignupPassword ? 'text' : 'password'"
                @click:append="showSignupPassword = !showSignupPassword"
                label="Password"
                required
                :disabled="isSigningUp"
              ></v-text-field>
              <v-text-field
                class="mb-3"
                outlined
                hide-details="auto"
                v-model="signupPasswordConfirm"
                :error-messages="signupPasswordErrorMessage"
                :append-icon="showSignupPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showSignupPassword ? 'text' : 'password'"
                @click:append="showSignupPassword = !showSignupPassword"
                label="Confirm Password"
                required
                :disabled="isSigningUp"
              ></v-text-field>
              <v-btn
                color="primary"
                class="float-right"
                v-on:click="signUp"
                :loading="isSigningUp"
                >Sign Up</v-btn
              >
            </v-container>
          </v-tab-item>
        </v-tabs-items>
        <v-divider class="mt-3 mb-3"></v-divider>
        <v-container class="pt-0 pb-0 pl-8 pr-8">
          <v-layout>
            <v-row class="text-center">
              <MendeleyLogin />
            </v-row>
          </v-layout>
          <v-layout>
            <v-row class="text-center mt-0 mb-3">
              <ZoteroLogin />
            </v-row>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import MendeleyLogin from "./MendeleyLogin.vue";
import ZoteroLogin from "./ZoteroLogin.vue";
import vueDropzone from "vue2-dropzone";
import ImageInput from "./ImageInput.vue";
import Vue from "vue";
import axios from "axios";
export default Vue.extend({
  name: "LogInSignUp",
  components: {
    MendeleyLogin,
    ZoteroLogin,
    vueDropzone,
    ImageInput,
  },
  data: () => ({
    loginUsername: "",
    loginPassword: "",
    showLoginPassword: false,
    signupUsername: "",
    signupPassword: "",
    signupPasswordConfirm: "",
    signupDisplayName: "",
    signupUsernameErrorMessage: "",
    signupPasswordErrorMessage: "",
    signupDisplayNameErrorMessage: "",
    showSignupPassword: false,
    tab: 0,
    loginUsernameErrorMessage: "",
    loginPasswordErrorMessage: "",
    isLoggingIn: false,
    isSigningUp: false,
    avatar: null,
  }),
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
  },

  methods: {
    signUp() {
      var vm = this;
      vm.isSigningUp = true;
      // validate the input before sending a request
      if (this.validateSignUp()) {
        console.log(this.avatar);
        axios
          .post("/api/users/new", {
            username: vm.signupUsername,
            display_name: vm.signupDisplayName,
            password: vm.signupPassword,
            photo: vm.avatar ? vm.avatar.uri : null,
          })
          .then(function (res) {
            vm.$router.push("/dashboard");
            vm.$store.commit("change_show_login_dialog", false);
            vm.signupPassword = "";
            vm.signupPasswordConfirm = "";
            vm.signupDisplayName = "";
            vm.signupUsername = "";
            vm.$store.commit("change_user_id", res.data._id);
            vm.$store.commit("change_is_logged_in", true);
            vm.$store.commit("change_display_name", res.data.display_name);
            vm.$store.commit("change_photo_url", res.data.photo);
            vm.$store.commit("change_access_token", res.data.auth_token);
            vm.$store.commit("change_user_created", res.data.created);
            vm.$store.commit("change_account_type", res.data.account_type);
            vm.$store.commit("change_selected_documents", []);
            vm.$store.commit("change_documents", []);
            vm.$store.commit("change_settings", res.data.settings);
            vm.$cookies.set("auth_token", res.data.auth_token);
            vm.$cookies.set("refresh_token", res.data.refresh_token);
            vm.avatar = null;
            console.log(res);
          })
          .catch(function (error) {
            vm.signupUsernameErrorMessage = "Username already exists";
            console.log(error);
            vm.dialog = false;
          })
          .finally(() => {
            vm.isSigningUp = false;
          });
      } else {
        vm.isSigningUp = false;
      }
    },
    validateSignUp() {
      var error = false;
      var vm = this;
      vm.signupUsernameErrorMessage = "";
      vm.signupDisplayNameErrorMessage = "";
      vm.signupPasswordErrorMessage = "";
      if (vm.signupUsername.length == 0) {
        vm.signupUsernameErrorMessage = "Required";
        error = true;
      }
      if (vm.signupDisplayName.length == 0) {
        vm.signupDisplayNameErrorMessage = "Required";
        error = true;
      }
      if (
        vm.signupPassword.length == 0 &&
        vm.signupPasswordConfirm.length == 0
      ) {
        vm.signupPasswordErrorMessage = "Required";
        error = true;
      }
      if (vm.signupPassword != vm.signupPasswordConfirm) {
        vm.signupPasswordErrorMessage = "Passwords don't match";
        error = true;
      }
      return !error;
    },
    login() {
      var vm = this;
      vm.isLoggingIn = true;
      // validate the input before sending a request
      if (this.validateLogin()) {
        axios
          .post("/api/auth/tagvis/login", {
            username: vm.loginUsername,
            password: vm.loginPassword,
          })
          .then(function (res) {
            vm.$router.push("/dashboard");
            vm.$store.commit("change_show_login_dialog", false);
            vm.loginPassword = "";
            vm.loginUsername = "";
            vm.$store.commit("change_user_id", res.data._id);
            vm.$store.commit("change_is_logged_in", true);
            vm.$store.commit("change_display_name", res.data.display_name);
            vm.$store.commit("change_photo_url", res.data.photo);
            vm.$store.commit("change_access_token", res.data.auth_token);
            vm.$store.commit("change_user_created", res.data.created);
            vm.$store.commit("change_account_type", res.data.account_type);
            vm.$store.commit("change_selected_documents", []);
            vm.$store.commit("change_documents", []);
            vm.$store.commit("change_settings", res.data.settings);
            vm.$store.commit(
              "change_graph_type",
              res.data.settings.default_graph_type
            );
            vm.$cookies.set("auth_token", res.data.auth_token);
            vm.$cookies.set("refresh_token", res.data.refresh_token);
            vm.loginUsernameErrorMessage = null;
            vm.loginPasswordErrorMessage = null;
            console.log(res);
          })
          .catch(function (error) {
            console.log(error);
            vm.loginUsernameErrorMessage = "Username or password wrong";
            vm.loginPasswordErrorMessage = "Username or password wrong";
          })
          .finally(() => {
            vm.isLoggingIn = false;
          });
      } else {
        vm.isLoggingIn = false;
      }
    },
    validateLogin() {
      var vm = this;
      vm.loginUsernameErrorMessage = null;
      vm.loginPasswordErrorMessage = null;
      var error = false;
      if (vm.loginUsername.length == 0) {
        vm.loginUsernameErrorMessage = "Required";
        error = true;
      }
      if (vm.loginPassword.length == 0) {
        vm.loginPasswordErrorMessage = "Required";
        error = true;
      }
      return !error;
    },
    removeAvatar() {
      this.$refs.imageInput.avatar = null;
      this.$refs.imageInput.$refs.file.value = null;
      this.avatar = null;
    },
  },
});
</script>

<style scoped>
</style>