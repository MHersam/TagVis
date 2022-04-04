<!-- The lense panel lets users highlight different properties of nodes by coloring the nodes in different colors -->
<template>
  <v-container>
    <v-sheet
      v-if="this.$store.getters.get_is_lenses_visible"
      style="
        position: absolute;
        bottom: 60px;
        left: 10px;
        overflow: auto;
        opacity: 0.9;
      "
      class="pa-3"
      max-height="calc(100% - 125px)"
      max-width="800px"
      elevation="5"
      rounded
    >
      <div>
        <b>Lenses</b>
        <v-tooltip transition="slide-x-transition" right>
          <template v-slot:activator="{ on, attrs }">
            <span
              class="ml-2"
              v-bind="attrs"
              v-on="on"
              style="cursor: pointer"
              v-on:click="$router.push('/documentation/lenses')"
              >(?)</span
            >
          </template>
          <span>Click to learn more about lenses</span>
        </v-tooltip>
      </div>
      Highlight properties of papers
      <v-container max-width="800px">
        <v-row dense style="width: 450px">
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('default')"
              :color="active == 'default' ? 'grey lighten-1' : 'grey lighten-4'"
              >default</v-btn
            >
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('relevance')"
              :color="
                active == 'relevance' ? 'grey lighten-1' : 'grey lighten-4'
              "
              >relevance</v-btn
            >
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('age')"
              :color="active == 'age' ? 'grey lighten-1' : 'grey lighten-4'"
              >age</v-btn
            >
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('none')"
              :color="active == 'none' ? 'grey lighten-1' : 'grey lighten-4'"
              >none</v-btn
            >
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('user')"
              :color="active == 'user' ? 'grey lighten-1' : 'grey lighten-4'"
              >user</v-btn
            >
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              v-on:click="enableLense('source')"
              :color="active == 'source' ? 'grey lighten-1' : 'grey lighten-4'"
              >source</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
      <!-- Legend for default lense -->
      <v-container
        class="ma-0 pa-0"
        v-if="
          active == 'default' &&
          users.filter((d) => d._id.toString().charAt(0) == '-').length != 0
        "
      >
        <b>Legend:</b><br />
        <div class="mt-1">
          <div
            v-for="user in users.filter(
              (d) => d._id.toString().charAt(0) == '-'
            )"
            v-bind:key="user._id"
          >
            <v-container class="pl-0 pr-0 pt-0 pb-1" fluid>
              <v-avatar
                :color="user.baseColor"
                size="32"
                class="mr-1"
                style="opacity: 1"
              ></v-avatar>
              {{ user.display_name }}
            </v-container>
          </div>
        </div>
      </v-container>
      <!-- Legend for relevance and age lenses -->
      <v-container
        class="ma-0 pa-0"
        v-if="active == 'relevance' || active == 'age'"
      >
        <b>Legend:</b><br />
        <div v-if="active == 'relevance'">
          <span>low</span><span class="float-right">high</span>
        </div>
        <div v-if="active == 'age'">
          <span><{{ new Date().getFullYear() - 10 }}</span
          ><span class="float-right">{{ new Date().getFullYear() }}</span>
        </div>
        <v-img
          src="../../assets/YlOrRd.png"
          lazy-src="../../assets/YlOrRd.png"
          eager
          aspect-ratio="30"
        ></v-img>
      </v-container>
      <!-- Legend for user lense -->
      <v-container
        class="ma-0 pa-0"
        v-if="
          active == 'user' &&
          users.filter((d) => d._id.toString().charAt(0) != '-').length != 0
        "
      >
        <b>Legend:</b><br />
        <div class="mt-1" style="max-height: 300px; overflow: auto">
          <div
            v-for="user in users.filter(
              (d) => d._id.toString().charAt(0) != '-'
            )"
            v-bind:key="user._id"
          >
            <v-container class="pl-0 pr-0 pt-0 pb-1" fluid>
              <v-avatar
                :color="user.baseColor"
                size="32"
                class="mr-1"
                style="opacity: 1"
              ></v-avatar>
              <v-avatar
                v-if="user._id.toString().charAt(0) != '-'"
                size="32"
                :color="user.photo ? '' : 'primary'"
                class="mr-1"
              >
                <v-img v-if="user.photo" :src="user.photo"></v-img>
                <v-icon dark v-else size="32" style="cursor: default">
                  mdi-account-circle
                </v-icon>
              </v-avatar>
              <div
                style="display: inline-block; vertical-align: middle"
                class="truncate ml-1"
              >
                {{ user.display_name }}
              </div>
            </v-container>
          </div>
        </div>
      </v-container>
      <!-- Legend for source lense -->
      <v-container
        class="ma-0 pa-0"
        v-if="active == 'source' && sourceColorMap.length > 0"
      >
        <b>Legend:</b><br />
        <div class="mt-1" style="max-height: 300px; overflow: auto">
          <div v-for="s in sourceColorMap" v-bind:key="s.source">
            <v-container class="pl-0 pr-0 pt-0 pb-1" fluid>
              <v-avatar
                :color="s.color"
                size="32"
                class="mr-1"
                style="opacity: 1"
              ></v-avatar>

              <div
                style="display: inline-block; vertical-align: middle"
                class="truncate ml-1"
              >
                {{ s.source }}
              </div>
            </v-container>
          </div>
        </div>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script>
import Vue from "vue";
import d3 from "d3";
var scaleChromatic = require("d3-scale-chromatic");
export default Vue.extend({
  name: "Lenses",
  data: () => ({
    active: "default",
    users: [],
    //colors for each source for source lense
    sourceColorMap: [],
  }),
  watch: {
    "$store.getters.get_graph": function () {
      this.enableLense(this.active);
      this.users = [];
      this.setUsers();
    },
    "$store.getters.get_active_lense": function (val) {
      // assumes active lense is only set to 'default' by other components
      this.active = val;
    },
    "$store.getters.get_is_svg_initialized": function (val) {
      this.setUsers();
      this.enableLense(this.$store.getters.get_active_lense);
    },
  },
  methods: {
    enableLense(active) {
      console.log("enable " + active + " lense");
      this.active = active;
      switch (this.active) {
        case "default":
          this.enableDefaultLense();
          break;
        case "relevance":
          this.enableRelevanceLense();
          break;
        case "age":
          this.enableAgeLense();
          break;
        case "none":
          this.enableNoneLense();
          break;
        case "user":
          this.enableUserLense();
          break;
        case "source":
          this.enableSourceLense();
          break;
      }
      this.$store.commit("change_active_lense", this.active);
    },
    enableDefaultLense() {
      var vm = this;
      console.log(vm.users);
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          console.log(d);
          return d.user._id.toString().charAt(0) == "-"
            ? d.baseColor
            : vm.$vuetify.theme.currentTheme.primary;
        });
      this.active = "default";
    },
    enableRelevanceLense() {
      var vm = this;
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          //if (d.user && d.user._id == vm.$store.getters.get_user_id) {
          //  return vm.$vuetify.theme.currentTheme.primary;
          //} else {
          return scaleChromatic.interpolateYlOrRd(
            Math.max(0, d.librarySimilarity - 0.6) * 2.5
          );
          // }
        });
      this.active = "relevance";
    },
    enableAgeLense() {
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          return scaleChromatic.interpolateYlOrRd(
            1 - (new Date().getFullYear() - d.year) / 10
          );
        });
      this.active = "age";
    },
    enableNoneLense() {
      var vm = this;
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          return vm.$vuetify.theme.currentTheme.primary;
        });
      this.active = "none";
    },
    enableUserLense() {
      var vm = this;
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          return d.user._id.toString().charAt(0) != "-"
            ? d.baseColor
            : vm.$vuetify.theme.currentTheme.primary;
        });
    },
    enableSourceLense() {
      var vm = this;
      var nodes = this.$store.getters.get_graph.nodes;
      var sources = [...new Set(nodes.map((d) => d.source))];
      sources = sources.filter((s) => s != "");
      var ordinal = d3.scale.ordinal().domain(sources).rangePoints([0, 0.89]);
      var linear = scaleChromatic.interpolateRainbow;
      function color(d) {
        return linear(ordinal(d));
      }
      d3.select("#graphSVG")
        .select("g")
        .selectAll(".node")
        .select("path")
        .style("fill", (d) => {
          return d.source
            ? color(d.source)
            : vm.$vuetify.theme.currentTheme.primary;
        });
      this.sourceColorMap = [];
      sources.forEach((source) => {
        this.sourceColorMap.push({ source: source, color: color(source) });
      });
      console.log(this.sourceColorMap);
    },
    // extracts users including photo, display name and color from the svg
    setUsers() {
      if (this.$store.getters.get_is_svg_initialized) {
        const svg = d3.select("#graphSVG");
        var vm = this;
        const n = svg
          .select("g")
          .selectAll(".node")
          .each((d) => {
            var isNew = true;
            for (let i = 0; i < vm.users.length; i++) {
              if (vm.users[i]._id == d.user._id) {
                isNew = false;
              }
            }
            if (isNew) {
              vm.users.push({
                display_name: d.user.display_name,
                _id: d.user._id,
                photo: d.user.photo,
                baseColor: d.baseColor,
              });
              console.log(d.user);
            }
          });
      } else {
        this.users = [];
      }
    },
  },
  mounted() {
    this.setUsers();
    if (
      !this.$store.getters.get_is_loaded_session &&
      this.$store.getters.get_active_lense == "tagHighlight"
    ) {
      // reset lense to default in this special case
      this.enableLense("default");
    } else {
      this.enableLense(this.$store.getters.get_active_lense);
    }
  },
  destroyed() {
    this.$store.commit("change_is_lenses_visible", false);
  },
});
</script>
<style scoped>
.truncate {
  width: 390px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
