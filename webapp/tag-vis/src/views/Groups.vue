<!-- Group view, switches shown content between group table component and group grid -->
<template>
  <div style="max-width: 1600px" class="center">
    <v-container class="pa-3" fluid>
      <div v-if="groupID.length == 0">
        <GroupGrid />
      </div>
      <div v-if="groupID.length != 0">
        <GroupTable ref="groupTable" />
        <SelectionProceed />
      </div>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import GroupGrid from "../components/Groups/GroupGrid.vue";
import GroupTable from "../components/Groups/GroupTable.vue";
import SelectionProceed from "../components/SelectionProceed.vue";

@Component({
  components: { GroupGrid, GroupTable, SelectionProceed },
})
export default class Groups extends Vue {
  dialog = false;
  newGroupTitle = "";
  newGroupDescription = "";
  mounted() {
    if (this.$route.params.groupID) {
      this.groupID = this.$route.params.groupID;
    }
  }
  syncDocs() {
    this.$refs.groupTable.syncDocs();
  }
  get groupID() {
    return this.$route.params.groupID ? this.$route.params.groupID : "";
  }
  set groupID(val) {}
}
</script>

<style>
</style>
