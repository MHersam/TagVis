<!-- This component provides buttons and their functionality that are displayed in the top of the visualization view. Including TagPreferences button, create and share sessions and save graph as png -->
<template>
  <v-container fluid class="ma-0 pt-2">
    <v-row>
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-on:click="togglePreferences"
            elevation="2"
            v-bind="attrs"
            v-on="on"
            class="btn mt-1"
            ><v-icon>mdi-tag-text</v-icon></v-btn
          >
        </template>
        <span>Tags</span>
      </v-tooltip>
      <v-select
        :items="this.$store.getters.get_graph_type_items"
        :disabled="isLoadedSession || isLoading"
        v-model="type"
        style="max-width: 260px"
        class="ml-4 mt-0 mb-0 mr-0 btn"
        hide-details
        :loading="isLoading"
        solo
      ></v-select>
      <v-switch
        class="ml-4 mt-2 mb-0 mr-3 btn"
        label="Forces"
        v-model="isForcesOn"
      ></v-switch>
      <v-spacer></v-spacer>
      <span
        :style="'margin-right: ' + (this.$store.getters.get_is_vis_exploration_drawer ? 450 : 0) + 'px'"
      >
        <span style="margin-right: 10px">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                small
                v-on:click="shareSession"
                :loading="isSharingSession"
                :disabled="isSharingSession"
                elevation="2"
                v-bind="attrs"
                v-on="on"
                class="btn mt-1"
              >
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </template>
            <span>Share Graph</span>
          </v-tooltip>
        </span>
        <span style="margin-right: 10px">
          <v-dialog
            max-width="500"
            v-model="dialog"
            :persistent="isSavingSession"
          >
            <template v-slot:activator="{ on: dialog }">
              <v-tooltip transition="slide-y-transition" bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    v-on="{ ...tooltip, ...dialog }"
                    class="btn mt-1"
                    elevation="2"
                    fab
                    :disabled="!isLoggedIn"
                    small
                    ><v-icon size="24px">mdi-content-save</v-icon></v-btn
                  >
                </template>
                <span>Save Session</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-toolbar color="primary" dark>
                <div style="font-size: 18px">Save Session</div>
              </v-toolbar>
              <v-card-text class="pb-0">
                <v-text-field
                  v-model="sessionName"
                  label="Title (optional)"
                  class="mt-4"
                  hide-details
                  @keydown.enter="saveSession"
                  outlined
                  :disabled="isSavingSession"
                ></v-text-field>
                <v-textarea
                  v-model="sessionDescription"
                  label="Description (optional)"
                  class="mt-3"
                  hide-details
                  :disabled="isSavingSession"
                  outlined
                >
                </v-textarea>
              </v-card-text>
              <v-card-actions class="justify-end mt-1">
                <v-btn text @click="dialog = false" :disabled="isSavingSession"
                  >Cancel</v-btn
                >
                <v-btn
                  color="primary"
                  @click="saveSession"
                  :loading="isSavingSession"
                  >Save</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </span>
        <span style="margin-right: 10px">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                small
                elevation="2"
                v-on:click="saveSVG"
                v-bind="attrs"
                v-on="on"
                class="btn mt-1"
                ><v-icon>mdi-camera</v-icon></v-btn
              >
            </template>
            <span>Save Image</span>
          </v-tooltip>
        </span>
        <span class="btn mt-1">
          <Drawer />
        </span>
      </span>
    </v-row>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
const ssap = require("save-svg-as-png");
import axios from "axios";
import d3 from "d3";
import Drawer from "./Exploration/Drawer.vue";
// import { svg2png } from "svg-png-converter";
// import saveSvgAsPng from 'save-svg-as-png'

export default Vue.extend({
  name: "ActionPanel",
  components: { Drawer },
  data: () => ({
    type: "",
    isLoading: false,
    sessionName: "",
    sessionDescription: "",
    dialog: false,
    snackbar: false,
    snackbarText: "Copied share link to clipboard",
    snackbarTimeout: 4000,
    isSavingSession: false,
    isSharingSession: false,
    isForcesOn: true,
  }),
  watch: {
    type: function (val) {
      if (val !== this.$store.getters.get_graph_type) {
        this.$store.commit("change_graph_type", val);
        this.isLoading = true;
        this.$parent.getGraph(
          this.$store.getters.get_settings.add_semantic_scholar_topics_to_graphs
        );
      }
    },
    "$store.getters.get_graph": function (val) {
      this.isLoading = false;
    },
    "$store.getters.get_is_graph_forces_on": function (val) {
      this.isForcesOn = val;
    },
    isForcesOn: function (val) {
      d3.select("g")
        .selectAll(".node")
        .each(function (d) {
          d.fixed = !val;
        });
      this.$store.commit("change_is_graph_forces_on", val);
    },
  },
  mounted() {
    this.type = this.$store.getters.get_graph_type;
  },
  methods: {
    togglePreferences() {
      this.$store.commit(
        "change_show_tag_preferences",
        !this.$store.getters.get_show_tag_preferences
      );
    },
    // save new session with preview image
    saveSession() {
      var vm = this;
      vm.isSavingSession = true;
      var previewImage = null;
      const rect = document
        .getElementsByTagName("g")[0]
        .getBoundingClientRect();
      // TODO: When graphs are too large preview image generation can fail. Consider alternatives.
      // PNG for preview image
      ssap
        .svgAsPngUri(document.getElementById("graphSVG"), {
          // adjust zoom scale to get images with 250px height
          scale: 1 / (rect.height / 250),
          backgroundColor: "#FFFFFF",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })
        // save new session
        .then((uri) => {
          //console.log(uri)
          previewImage = uri;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          axios
            .post("/api/sessions/new", {
              auth_token: vm.$store.getters.get_access_token,
              name: vm.sessionName,
              description: vm.sessionDescription,
              graph: vm.$store.getters.get_graph,
              tags: vm.$store.getters.get_session.tags,
              //graph: vm.$parent.storedGraphs[1],
              preview_image: previewImage,
              type: vm.$store.getters.get_graph_type,
              user: vm.$store.getters.get_user_id,
              views: 0,
              active_lense: vm.$store.getters.get_active_lense
            })
            .then(function (res) {
              vm.$router.replace("/vis/" + res.data.sessionID);
              vm.dialog = false;
              vm.sessionDescription = "";
              vm.sessionName = "";
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(() => {
              vm.isSavingSession = false;
            });
        });
      // SVG to load with session ???
      /*
      ssap.svgAsDataUri(document.getElementById('graphSVG'), {
        scale: 2,
        backgroundColor: '#FFFFFF',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }).then(uri=>{
        console.log(uri)
      })
      */
    },
    // create a session that is not linked to a user
    shareSession() {
      var vm = this;
      vm.isSharingSession = true;
      axios
        .post("/api/sessions/new", {
          graph: vm.$store.getters.get_graph,
          tags: vm.$store.getters.get_session.tags,
          type: vm.$store.getters.get_graph_type,
          active_lense: vm.$store.getters.get_active_lense
        })
        .then(function (res) {
          vm.$clipboard(
            window.location.origin + "/#/vis/" + res.data.sessionID
          );
          vm.$router.replace("/vis/" + res.data.sessionID);
          vm.snackbar = true;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          vm.isSharingSession = false;
        });
    },
    // generate a cropped, high-res image of the displayed graph and offer the file to the user as download
    async saveSVG() {
      // const appBarHeight = document.getElementsByTagName('header')[0].getBoundingClientRect().height
      const rect = document
        .getElementsByTagName("g")[0]
        .getBoundingClientRect();
      /*
      var g = d3.select("g");
      var old = g[0][0].attributes.transform.value;
      console.log(old);
      g.attr("transform", "translate(" + 0 + "," + 0 + ") scale(" + 1 + ")");
      */
      var scale = 2;
      //limit image resolution
      if (rect.height > 4096) {
        scale = 1 / (rect.height / 4096);
      }
      if (rect.width > 4096) {
        scale = Math.min(scale, 1 / (rect.width / 4096));
      }

      //TODO: When graphs are too large this can fail and users can not download the image. Consider alternatives. Also letting the users download an .svg file here might be an option
      ssap.saveSvgAsPng(document.getElementById("graphSVG"), "graph.png", {
        scale: scale,
        backgroundColor: "#FFFFFF",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      /*
      var s = new XMLSerializer();
      var str = s.serializeToString(document.getElementById("graphSVG"));

      let outputBuffer = await svg2png({
        input: str,
        encoding: "dataURL",
        format: "jpeg",
      });
      downloadURI(outputBuffer, "graph.JPG");
      console.log(outputBuffer);
      //window.open(outputBuffer, "graph.jpg");
      //window.location.assign(outputBuffer);
      //writeFileSync("tmp25.jpg", outputBuffer);
      function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      //get svg element.
      var svg = document.getElementById("graphSVG");

      //get svg source.
      var serializer = new XMLSerializer();
      var source = serializer.serializeToString(svg);

      //add name spaces.
      if (
        !source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)
      ) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
        );
      }

      //add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      //convert svg source to URI data scheme.
      var url =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

      function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      downloadURI(url, "graph.svg");
      */
    },
  },
  computed: {
    isDarkMode: function () {
      return this.$vuetify.theme.dark;
    },
    isLoggedIn: function () {
      return this.$store.getters.is_logged_in;
    },
    isLoadedSession: function () {
      return this.$store.getters.get_is_loaded_session;
    },
  },
});
</script>

<style scoped>
.btn {
  pointer-events: auto;
}
</style>
