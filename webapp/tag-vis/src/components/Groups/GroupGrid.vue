<!-- The GroupGrid displays the groups a user is member of as SessionCard components -->
<template>
  <v-container>
    <h1>
      <span class="ml-3 mr-6">{{ headlineText }}</span
      ><GroupCreate v-if="!isLoading" />
    </h1>

    <v-layout class="mt-2">
      <v-row class="pa-0 ma-0">
        <v-col
          xs="12"
          sm="12"
          md="12"
          lg="12"
          xl="6"
          class="pa-0 ma-0"
          v-for="group in groups"
          :key="group._id"
        >
          <GroupCard :group="group" />
        </v-col>
      </v-row>
    </v-layout>
    <h3 v-if="!isLoading && groups.length == 0" class="ml-3 mt-0">
      Groups let you share documents with others. Create your first group now,
      or join a group by following an invite link.
    </h3>
    <v-row justify="center" v-if="isLoading">
      <v-progress-circular
        :size="90"
        :width="9"
        color="primary"
        style="position: absolute"
        class="verticalCenter"
        indeterminate
      ></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import GroupCard from "./GroupCard.vue";
import axios from "axios";
import GroupCreate from "./GroupCreate.vue";

export default Vue.extend({
  name: "GroupGrid",
  components: {
    GroupCard,
    GroupCreate,
  },
  methods: {
    changeView(link: string) {
      this.$router.push(link);
    },
    // retrieves all groups the user is member of
    getGroups() {
      var vm = this;
      axios
        .get("/api/groups/all", {
          headers: {
            access_token: vm.$store.getters.get_access_token,
            user: vm.$store.getters.get_user_id,
          },
        })
        .then(function (res) {
          console.log(res);
          vm.groups = res.data;
          vm.isLoading = false;
          console.log(vm.groups);
        })
        .catch(function (error) {
          vm.groups = [];
          vm.isLoading = false;
          console.log(error);
        });
    },
  },
  data: () => ({
    groups: [],
    isLoading: true,
  }),
  mounted() {
    if (this.$store.getters.is_logged_in) {
      this.getGroups();
    }
  },
  watch: {
    "$store.getters.is_logged_in": function () {
      this.getGroups();
    },
  },
  computed: {
    headlineText: function () {
      if (!this.isLoading) {
        return this.groups.length == 0 ? "No groups found" : "Your groups";
      } else {
        return "";
      }
    },
  },
});
</script>

<style scoped>
</style>
