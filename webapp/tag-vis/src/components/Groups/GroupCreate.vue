<!-- A dialog that can be used to create a new group -->
<template>
  <v-dialog
    max-width="500"
    v-model="dialog"
    v-if="this.$store.getters.is_logged_in"
    :persistent="isCreating"
  >
    <template v-slot:activator="{ on: dialog }">
      <v-btn v-on="{ ...dialog }" elevation="2" color="primary" class="pl-3"
        ><v-icon size="24px" class="ml-0 mr-2">mdi-plus</v-icon>New Group</v-btn
      >
    </template>
    <v-card>
      <v-toolbar color="primary" dark>
        <div style="font-size: 18px">Create a new Group</div>
      </v-toolbar>
      <v-card-text class="pb-0">
        <v-text-field
          v-model="newGroupTitle"
          label="Title (optional)"
          class="mt-4"
          hide-details
          outlined
          :disabled="isCreating"
        ></v-text-field>
        <v-textarea
          v-model="newGroupDescription"
          class="mt-3"
          hide-details
          label="Description (optional)"
          outlined
          :disabled="isCreating"
        >
        </v-textarea>
      </v-card-text>
      <v-card-actions class="justify-end mt-1">
        <v-btn text @click="cancelCreateGroup" :disabled="isCreating"
          >Cancel</v-btn
        >
        <v-btn color="primary" @click="createGroup" :loading="isCreating"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
export default Vue.extend({
  name: "GroupCreate",
  data: () => ({
    dialog: false,
    newGroupTitle: "",
    newGroupDescription: "",
    isCreating: false,
  }),
  methods: {
    cancelCreateGroup() {
      this.dialog = false;
    },
    // Create a new group by sending request to the back end
    createGroup() {
      var vm = this;
      vm.isCreating = true;
      axios
        .post("/api/groups/new", {
          auth_token: vm.$store.getters.get_access_token,
          name: vm.newGroupTitle,
          description: vm.newGroupDescription,
          tags: [],
          members: [vm.$store.getters.get_user_id],
          admins: [vm.$store.getters.get_user_id],
          documents: [],
        })
        .then(function (res) {
          vm.$router.push({
            name: "Groups",
            params: { groupID: res.data._id },
          });
          vm.dialog = false;
          vm.newGroupTitle = "";
          vm.newGroupDescription = "";
        })
        .catch(function (error) {
          console.log(error);
          vm.dialog = false;
        })
        .finally(() => {
          vm.isCreating = false;
        });
    },
  },
});
</script>

<style>
</style>