<!-- Library view, displays the users personal library -->
<template>
  <div class="center tableMaxWidth">
    <v-container class="pa-3" fluid>
      <h1 class="subheading font-weight-bold"><span>Your library</span><AddDocuments /></h1>
      <h3>Select papers and visualize</h3>
      <Table ref="table" />
      <SelectionProceed />
    </v-container>
    <!-- v-if="false" for deploy -->
    <v-btn
      v-scroll="onScroll"
      v-show="fab"
      v-if="false"
      fab
      dark
      fixed
      bottom
      right
      color="primary"
      @click="toTop"
    >
      <v-icon>mdi-chevron-up</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Table from "@/components/Table.vue";
import SelectionProceed from "@/components/SelectionProceed.vue";
import AddDocuments from "../components/AddDocuments.vue"
import vuetify from "vuetify";

@Component({
  components: {
    Table,
    SelectionProceed,
    AddDocuments
  },
})
export default class PaperSelection extends Vue {
  fab = false;
  onScroll(e) {
    if (typeof window === "undefined") return;
    const top = window.pageYOffset || e.target.scrollTop || 0;
    this.fab = top > 20;
  }

  toTop() {
    this.$vuetify.goTo(0);
  }
  syncDocs() {
    this.$refs.table.syncDocs();
  }
}
</script>
<style scoped>
.tableMaxWidth {
  max-width: 1600px;
}
</style>
