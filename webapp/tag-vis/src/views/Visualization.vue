<!-- Visualization view, displays the different parts of the visualization and send requests to generate gaphs and retrieve sessions -->
<template>
  <v-container fluid fill-height ma-0 pa-0>
    <div style="z-index: 2">
      <TagPreferences ref="tagPreferences" />
    </div>
    <div style="position: fixed; top: 0; z-index: 1">
      <Graph />
    </div>
    <v-container
      fluid
      pl-3
      pr-3
      pt-0
      pb-0
      style="position: absolute; top: 0; z-index: 4; pointer-events: none"
      v-if="!this.isLoading"
    >
      <ActionPanel />
    </v-container>
    <div style="z-index: 3">
      <DocumentDetails />
    </div>
    <div style="z-index: 4">
      <Lenses />
    </div>
    <div style="z-index: 5">
      <Help />
    </div>

    <v-container fill-height fluid v-if="isLoading" style="position: absolute">
      <v-row justify="center">
        <div class="text-center">
          <v-progress-circular
            :size="90"
            :width="9"
            color="primary"
            indeterminate
          ></v-progress-circular>
          <h3 class="mt-3">Loading... Please wait</h3>
        </div>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import Graph from "@/components/Visualization/Graph.vue";
import ActionPanel from "@/components/Visualization/ActionPanel.vue";
import TagPreferences from "@/components/Visualization/TagPreferences.vue";
import DocumentDetails from "@/components/Visualization/DocumentDetails.vue";
import Help from "@/components/Visualization/Help.vue";
import Lenses from "@/components/Visualization/Lenses.vue";
import axios from "axios";

@Component({
  components: {
    Graph,
    ActionPanel,
    TagPreferences,
    DocumentDetails,
    Help,
    Lenses
  },
})
export default class Visualization extends Vue {
  isLoading = true;
  storedGraphs = [];
  docs = JSON.parse(JSON.stringify(this.$store.getters.get_selected_documents));
  // Sends the selected documents to the back end, where a graph is generated
  getGraph(addTopics) {
    const graphTypes = this.$store.getters.get_graph_type_items;
    const store = this.$store;
    const instance = this;
    const docs = this.docs;
    //var unwatchSessionID = null;

    var route = "/api/graphs/";
    var index = 0;
    switch (this.$store.getters.get_graph_type) {
      case graphTypes[0]:
        route += "tags";
        index = 0;
        break;
      case graphTypes[1]:
        route += "bibliographic";
        index = 1;
        break;
      case graphTypes[2]:
        route += "direct-citation";
        index = 2;
        break;
    }
    if (this.storedGraphs[index]) {
      store.commit("change_graph", instance.storedGraphs[index]);
      console.log(instance.storedGraphs[index]);
      instance.isLoading = false;
    } else {
      axios
        .post(route, {
          type: this.$store.getters.get_graph_type,
          documents: JSON.stringify({
            docs,
          }),
          addTopics: addTopics,
          userId: this.$store.getters.get_user_id,
        })
        .then(function (res) {
          store.commit("change_graph", res.data);
          console.log(res.data);
          instance.storedGraphs[index] = res.data;
          instance.isLoading = false;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
  // Loads an existing session
  loadSession(id) {
    var vm = this;
    var store = this.$store;
    axios
      .get("/api/sessions/graph", {
        headers: {
          id: id,
        },
      })
      .then(function (res) {
        console.log(res);
        store.commit("change_graph_type", res.data.graph.type);
        store.commit("change_graph", res.data.graph);
        store.commit("change_session", {
          tags: res.data.tags,
          graph: res.data.graph,
        });
        store.commit("change_active_lense", res.data.active_lense);
        store.commit("change_is_loaded_session", true);
        vm.isLoading = false;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  getReferencedDocuments(id) {
    var vm = this;
    return axios
      .get("/api/documents/referenced-papers", {
        headers: {
          _id: id,
        },
      })
      .then(function (res) {
        console.log(res.data);
        vm.docs = res.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  mounted() {
    /*
    this.unwatchSessionID = this.$watch(
      "$route.params.sessionID",
      function (newValue, oldValue) {
        if (newValue != "") {
          this.loadSession(this.$route.params.sessionID);
        } else {
          this.getGraph();
        }
      }
    );
    */
    if (this.$route.params.sessionID) {
      this.loadSession(this.$route.params.sessionID);
    } else if (this.$route.params.semantic_scholar_document) {
      this.getReferencedDocuments(
        this.$route.params.semantic_scholar_document
      ).then(() => {
        this.getGraph(true);
      });
    } else {
      this.getGraph(
        this.$store.getters.get_settings.add_semantic_scholar_topics_to_graphs
      );
    }
  }
  destroyed() {
    this.$store.commit("change_session", {});
    this.$store.commit("change_is_loaded_session", false);
    this.$store.commit("change_is_svg_initialized", false);
    //this.unwatchSessionID();
  }
  @Watch("$store.getters.get_graph")
  private watchGraph() {
    console.log(this.$store.getters.get_graph)
    if (this.$store.getters.get_graph.nodes.length > this.docs.length) {
      this.docs = JSON.parse(
        JSON.stringify(this.$store.getters.get_graph.nodes)
      );
      this.storedGraphs = [];
      this.storedGraphs[
        this.$store.getters.get_graph_type_items.indexOf(
          this.$store.getters.get_graph.type
        )
      ] = this.$store.getters.get_graph;
      console.log(this.storedGraphs);
    }
  }
}
</script>
<style>
</style>
