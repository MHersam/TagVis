<!-- This is the component reliable for the graph visualization -->
<!-- Uses parts from http://bl.ocks.org/eyaler/10586116 -->
<template>
  <div id="svgContainer">
    <div
      style="position: fixed; right: 0; bottom: 0; width: 100%"
      v-if="!this.$parent.isLoading"
    >
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-on:click="centerGraph"
            elevation="2"
            v-bind="attrs"
            v-on="on"
            class="mb-3 mr-3"
            :style="
              'position: absolute; bottom: 0; right: ' +
              ($store.getters.get_is_vis_exploration_drawer ? 450 : 0) +
              'px'
            "
          >
            <v-icon>mdi-image-filter-center-focus</v-icon>
          </v-btn>
        </template>
        <span>Center Graph</span>
      </v-tooltip>
      <span style="position: absolute; bottom: 0; left: 0">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              elevation="2"
              v-on:click="toggleHelp"
              v-bind="attrs"
              v-on="on"
              class="mb-3 ml-3"
              ><v-icon>mdi-help-circle-outline</v-icon></v-btn
            >
          </template>
          <span>Help</span>
        </v-tooltip>
        <v-tooltip right>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              small
              elevation="2"
              v-on:click="toggleLenses"
              v-bind="attrs"
              v-on="on"
              class="mb-3 ml-3"
              ><v-icon>mdi-layers-outline</v-icon></v-btn
            >
          </template>
          <span>Lenses</span>
        </v-tooltip>
      </span>
    </div>
    <svg id="graphSVG"></svg>
  </div>
</template>

<script>
import Vue from "vue";
import Vuex from "vuex";
import d3 from "d3";
import colors from "vuetify/lib/util/colors";
var scaleChromatic = require("d3-scale-chromatic");

export default Vue.extend({
  name: "Graph",

  data: () => ({
    showPreferences: true,
    zoom: null,
    force: null,
    store: null,
    initialZoomLevel: 1,
    sliderValues: [],
    linkedByIndex: {},
    max_stroke: 4.5,
    nominal_stroke: 1.5,
    graph: {},
    users: [],
  }),
  mounted() {
    this.store = this.$store;
    var sliderValues = [];
    if (this.$store.getters.get_session.tags) {
      this.$store.getters.get_session.tags.forEach((tag) => {
        sliderValues.push(tag.weight);
      });
    }
    this.sliderValues = sliderValues;
  },
  watch: {
    "$store.getters.get_graph": function (val) {
      this.linkedByIndex = {};
      this.graph = JSON.parse(JSON.stringify(val));
      this.drawGraph();
      this.$parent.$refs.tagPreferences.assignNodeColors();
      // this.initialZoomLevel = this.getInitialZoomLevel();
      // this.centerGraph();
    },
    /*
    "$store.getters.get_settings": function () {
      this.drawGraph();
    },
    */
    "$store.getters.get_session.tags": {
      handler: function (tags) {
        if (
          this.$store.getters.get_graph_type ==
          this.$store.getters.get_graph_type_items[0]
        ) {
          // an input happened to the tag panel -> refresh parts of the graph
          var vm = this;
          var sliderValues = [];
          var tagNames = [];
          tags.forEach((tag) => {
            sliderValues.push(tag.weight);
            tagNames.push(tag.name);
          });
          this.sliderValues = sliderValues;
          var allLinks = JSON.parse(
            JSON.stringify(this.$store.getters.get_graph)
          ).links;
          // the subset of links respecting the currently ignored tags
          var filteredLinks = [];
          for (let i = 0; i < tags.length; i++) {
            if (tags[i].isIgnored) {
              allLinks.forEach((link) => {
                link.tags = link.tags.remove(tags[i].name);
              });
            }
          }
          allLinks.forEach((link) => {
            if (link.tags.length > 0) {
              filteredLinks.push(link);
            }
          });
          filteredLinks.forEach((fl) => {
            vm.graph.links.forEach((gl) => {
              if (fl.id == gl.id) {
                fl.source = gl.source;
                fl.target = gl.target;
                var tagUnion = new Set();
                fl.source.tags.forEach(tagUnion.add, tagUnion);
                fl.target.tags.forEach(tagUnion.add, tagUnion);
                tagUnion.forEach((tag) => {
                  var index = tagNames.indexOf(tag);
                  if (tags[index].isIgnored) {
                    tagUnion.delete(tag);
                  }
                });
                fl.correspondenceRatio = fl.tags.length / tagUnion.size;
              }
            });
          });
          this.force.links(filteredLinks);

          //redraw links
          const link = d3.select("g").selectAll(".link").data(filteredLinks);
          link.exit().remove();
          link.enter().append("line");
          link
            .attr("class", "link")
            .style("stroke-width", function () {
              let stroke = vm.nominal_stroke;
              if (vm.nominal_stroke * vm.zoom.scale() > vm.max_stroke) {
                stroke = vm.max_stroke / vm.zoom.scale();
              }
              return stroke;
            })
            .style("stroke", function (d) {
              const a = 255 - d.correspondenceRatio * 255;
              return "rgb(" + a + ", " + a + ", " + a + ")";
            })
            .attr("id", (d) => {
              return d.id;
            })
            .attr("x1", function (d) {
              return d.source.x;
            })
            .attr("y1", function (d) {
              return d.source.y;
            })
            .attr("x2", function (d) {
              return d.target.x;
            })
            .attr("y2", function (d) {
              return d.target.y;
            })
            .attr("distance", (d) => {
              return this.dist(d);
            });
          const node = d3.select("g").selectAll(".node");
          const text = d3.select("g").selectAll("text");
          this.force.on("tick", function () {
            node.attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
            text.attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });

            link
              .attr("x1", function (d) {
                return d.source.x;
              })
              .attr("y1", function (d) {
                return d.source.y;
              })
              .attr("x2", function (d) {
                return d.target.x;
              })
              .attr("y2", function (d) {
                return d.target.y;
              });

            node
              .attr("cx", function (d) {
                return d.x;
              })
              .attr("cy", function (d) {
                return d.y;
              });
          });
          d3.select("g")
            .selectAll(".node")
            .each(function () {
              this.parentNode.appendChild(this);
            });
          d3.select("g")
            .selectAll("text")
            .each(function () {
              this.parentNode.appendChild(this);
            });
          var vm = this;
          vm.linkedByIndex = {};
          filteredLinks.forEach(function (d) {
            vm.linkedByIndex[d.source.index + "," + d.target.index] = true;
          });
          this.force.alpha(0.1).start();
        }
      },
      deep: true,
    },
    "$store.getters.get_is_graph_forces_on": function (val) {
      if (val) this.force.alpha(1).start();
    },
  },
  computed: {
    isDarkMode: function () {
      return this.$vuetify.theme.dark;
    },
  },
  methods: {
    toggleHelp() {
      this.$store.commit(
        "change_is_help_visible",
        !this.$store.getters.get_is_help_visible
      );
      if (this.$store.getters.get_is_help_visible)
        this.$store.commit("change_is_lenses_visible", false);
    },
    toggleLenses() {
      this.$store.commit(
        "change_is_lenses_visible",
        !this.$store.getters.get_is_lenses_visible
      );
      if (this.$store.getters.get_is_lenses_visible)
        this.$store.commit("change_is_help_visible", false);
    },
    // calculates the edge length
    dist(d) {
      switch (this.$store.getters.get_graph_type) {
        case this.$store.getters.get_graph_type_items[0]:
          return this.tagDistance(d);
        case this.$store.getters.get_graph_type_items[1]:
          return this.citationDistance(d);
        default:
          return d.distance;
      }
    },
    tagDistance(d) {
      const baseDistance = d.distance;
      const perTagDistance = [];
      d.tags.forEach((tag) => {
        const tagIndex = this.$store.getters.get_graph.uniqueTags.indexOf(tag);
        perTagDistance.push(
          ((d.distance / d.tags.length) * (100 - this.sliderValues[tagIndex])) /
            100
        );
      });
      return (
        d.source.r +
        d.target.r +
        (1 - d.correspondenceRatio) * baseDistance +
        perTagDistance.reduce(function (pv, cv) {
          return pv + cv;
        }, 0)
      );
    },
    citationDistance(d) {
      return d.source.r + d.target.r + d.distance;
    },
    centerGraph() {
      //TODO: Center with variable scale to make g fit on screen
      /*
      const appBarHeight = document
        .getElementsByTagName("header")[0]
        .getBoundingClientRect().height;
      let w = window.innerWidth;
      let h = window.innerHeight - appBarHeight;
      const rect = document
        .getElementsByTagName("g")[0]
        .getBoundingClientRect();
      var scale = h / rect.height;
      if (scale > w / rect.width) {
        scale = w / rect.width;
      }
      */
      this.zoom
        .scale(this.initialZoomLevel)
        .translate([
          this.$store.getters.get_is_vis_exploration_drawer ? -225 : 0,
          0,
        ]);
      this.zoom.event(d3.select("#graphSVG"));
    },
    // returns true if the two nodes are connected
    isConnected(a, b) {
      var vm = this;
      return (
        vm.linkedByIndex[a.index + "," + b.index] ||
        vm.linkedByIndex[b.index + "," + a.index] ||
        a.index == b.index
      );
    },
    /*
    getInitialZoomLevel() {
      var zoomLevel = 1;

      let w = window.innerWidth;
      let h = window.innerHeight;
      var numberOfNodes = d3.select("g").selectAll(".node").size()

      return zoomLevel;
    },
    */
    // draws the graph as svg including node, edges etc.
    drawGraph() {
      const store = this.$store;
      const vm = this;
      let sliderValue;
      let w = window.innerWidth;
      let h = window.innerHeight;

      let focus_node = null;
      let highlight_node = null;

      const text_center = false;
      const outline = false;

      const min_score = 0;
      const max_score = 1;

      const highlight_color = this.$vuetify.theme.currentTheme.secondary;
      const highlight_trans = 0.2;

      const size = d3.scale.pow().exponent(1).domain([1, 100]).range([8, 24]);

      const force = d3.layout
        .force()
        .size([w, h])
        .charge(-1000)
        .linkStrength(function (d) {
          return 0.2 + 0.8 * d.correspondenceRatio;
        });
      this.force = force;

      const default_node_color = this.$vuetify.theme.currentTheme.primary;
      const default_link_color = "#888";
      const nominal_base_node_size = 8;
      const nominal_text_size = 10;
      const max_text_size = 24;
      const nominal_stroke = 1.5;
      const max_stroke = 4.5;
      const max_base_node_size = 36;
      const min_zoom = 0.1;
      const max_zoom = 7;
      d3.select("#graphSVG").remove();
      d3.select("#svgContainer").append("svg").attr("id", "graphSVG");
      var svg = d3.select("svg");
      const zoom = d3.behavior
        .zoom()
        .scaleExtent([min_zoom, max_zoom])
        .size([w, h]);
      this.zoom = zoom;
      const g = svg.append("g");

      const graph = this.graph;
      graph.links.forEach(function (d) {
        vm.linkedByIndex[d.source + "," + d.target] = true;
      });
      vm.users = [];
      // calculate and assign node radius
      graph.nodes.forEach(function (d) {
        vm.users.includes(d.user._id) ? null : vm.users.push(d.user._id);
        const circleBaseArea = Math.PI * Math.pow(nominal_base_node_size, 2);
        var circleArea = circleBaseArea;
        circleArea += vm.$store.getters.get_settings.node_size_citation_count
          ? circleBaseArea * Math.log10(1 + parseInt(d.citationCount, 10))
          : 0;
        const circleRadius = Math.sqrt(circleArea / Math.PI);
        d.r = circleRadius;
      });
      // color scale for node colors in group graphs
      var ordinal = d3.scale
        .ordinal()
        .domain(vm.users.filter((u) => u.toString().charAt(0) != "-"))
        .rangePoints([0, 0.89]);
      //var linear = scaleChromatic.interpolateWarm;
      var linear = scaleChromatic.interpolateRainbow;
      function color(user_id) {
        if (user_id.toString().charAt(0) != "-" && vm.users.length > 1) {
          return linear(ordinal(user_id));
        } else if (vm.users.length == 1) {
          return vm.$vuetify.theme.currentTheme.primary;
        } else {
          switch (user_id) {
            case -1:
              return "#009ceb";
            case -2:
              return vm.$vuetify.theme.currentTheme.primary;
            case -3:
              return "#00ffc3";
          }
        }
        //return vm.users.includes(d)
        //  ? linear(ordinal(d))
        //  : vm.$vuetify.theme.currentTheme.primary;
      }
      graph.nodes.forEach((d) => {
        d.baseColor = color(d.user._id);
      });

      function hasConnections(a) {
        for (const property in this.linkedByIndex) {
          s = property.split(",");
          if (
            (s[0] == a.index || s[1] == a.index) &&
            this.linkedByIndex[property]
          ) {
            return true;
          }
        }
        return false;
      }

      force.nodes(graph.nodes).links(graph.links).start();
      // create links from data
      var link = g
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke-width", nominal_stroke)
        .style("stroke", function (d) {
          const a = 255 - d.correspondenceRatio * 255;
          return "rgb(" + a + ", " + a + ", " + a + ")";
        })
        .style("stroke-dasharray", (d) => {
          //only do dashed lines when direkt citation graph
          return vm.$store.getters.get_graph.type ==
            vm.$store.getters.get_graph_type_items[2]
            ? "10, 1"
            : "1, 0";
        })
        .attr("id", (d) => {
          return d.id;
        })
        .each(function (d) {
          d.offset = Math.random() * 11;
        });

      if (
        vm.$store.getters.get_graph.type ==
        vm.$store.getters.get_graph_type_items[2]
      ) {
        var t = d3.timer(tick, 0);
        function tick(elapsed, time) {
          g.selectAll("line").style("stroke-dashoffset", function (d) {
            d.offset = d.offset + 0.2;
            return d.offset;
          });
        }
      }

      // create nodes from data
      const node = g
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", (d) => {
          return "n" + d.id;
        })
        .on("dblclick.zoom", function (d) {
          store.commit("change_document_details", {
            isVisible: true,
            document: d,
          });
        })
        .call(force.drag);

      let tocolor = "fill";
      let towhite = "stroke";
      if (outline) {
        tocolor = "stroke";
        towhite = "fill";
      }
      const circle = node
        .append("path")
        .attr(
          "d",
          d3.svg
            .symbol()
            .size(function (d) {
              const baseArea = Math.PI * Math.pow(nominal_base_node_size, 2);
              var circleArea = baseArea;
              circleArea += vm.$store.getters.get_settings
                .node_size_citation_count
                ? baseArea * Math.log10(1 + parseInt(d.citationCount, 10))
                : 0;
              return circleArea;
            })
            .type(function (d) {
              return d.type;
            })
        )
        //.style(tocolor, function (d) {
        //  return color(d.user._id); //default_node_color;
        //})
        .style("stroke-width", nominal_stroke)
        .style(towhite, "white");
      // draw the text labels next to each node
      const text = g
        .selectAll(".text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .classed("unselectable", true)
        .attr("dy", ".35em")
        .style("font-size", nominal_text_size + "px")
        .style("fill", function () {
          return vm.$vuetify.theme.dark ? "white" : "black";
        });

      if (text_center) {
        text
          .text(function (d) {
            return (
              d.authors[0].last_name +
              ", " +
              d.authors[0].first_name +
              " (" +
              d.year +
              ")"
            );
          })
          .style("text-anchor", "middle");
      } else {
        text
          .attr("dx", function (d) {
            return d.r;
          })
          .text(function (d) {
            let str = "\u2002";
            if (d.authors && d.authors.length > 0) {
              if (d.authors[0].last_name) {
                str += d.authors[0].last_name;
                if (d.authors[0].first_name) {
                  str += ", " + d.authors[0].first_name.charAt(0) + ".";
                }
                if (d.authors.length > 1) {
                  str += " et al.";
                }
              }
              if (d.year) {
                str += " (" + d.year + ")";
              }
            }
            return str;
          });
      }
      // node interaction behaviour
      node
        .on("mouseover", function (d) {
          set_highlight(d);
        })
        .on("mousedown", function (d) {
          d3.event.stopPropagation();
          focus_node = d;
          set_focus(d);
          if (highlight_node === null) set_highlight(d);
        })
        .on("mouseout", function (d) {
          exit_highlight();
        });

      d3.select(window).on("mouseup", function () {
        link = g.selectAll(".link");
        if (focus_node !== null) {
          focus_node = null;
          if (highlight_trans < 1) {
            circle.style("opacity", 1);
            text.style("opacity", 1);
            link.style("opacity", 1);
          }
        }

        if (highlight_node === null) exit_highlight();
      });

      function exit_highlight() {
        link = g.selectAll(".link");
        highlight_node = null;
        if (focus_node === null) {
          if (highlight_color != "white") {
            circle.style(towhite, "white");
            text.style("font-weight", "normal");
            link.style("stroke", function (o) {
              const a = 255 - o.correspondenceRatio * 255;
              return "rgb(" + a + ", " + a + ", " + a + ")";
            });
          }
        }
      }

      function set_focus(d) {
        link = g.selectAll(".link");
        if (highlight_trans < 1) {
          circle.style("opacity", function (o) {
            return vm.isConnected(d, o) ? 1 : highlight_trans;
          });

          text.style("opacity", function (o) {
            return vm.isConnected(d, o) ? 1 : highlight_trans;
          });

          link.style("opacity", function (o) {
            return o.source.index == d.index || o.target.index == d.index
              ? 1
              : highlight_trans;
          });
        }
      }

      function set_highlight(d) {
        link = g.selectAll(".link");
        if (focus_node !== null) d = focus_node;
        highlight_node = d;

        if (highlight_color != "white") {
          circle.style(towhite, function (o) {
            return vm.isConnected(d, o) ? highlight_color : "white";
          });
          text.style("font-weight", function (o) {
            return vm.isConnected(d, o) ? "bold" : "normal";
          });
          link.style("stroke", function (o) {
            const a = 255 - d.correspondenceRatio * 255;
            return o.source.index == d.index || o.target.index == d.index
              ? highlight_color
              : "rgb(" + a + ", " + a + ", " + a + ")";
          });
        }
      }
      // zoom and scale nodes, links and text
      zoom.on("zoom", function () {
        let stroke = nominal_stroke;
        if (nominal_stroke * zoom.scale() > max_stroke) {
          stroke = max_stroke / zoom.scale();
        }
        link.style("stroke-width", stroke);
        circle.style("stroke-width", stroke);

        let base_radius = nominal_base_node_size;
        if (nominal_base_node_size * zoom.scale() > max_base_node_size) {
          base_radius = max_base_node_size / zoom.scale();
        }
        circle.attr(
          "d",
          d3.svg
            .symbol()
            .size(function (d) {
              const baseArea = Math.PI * Math.pow(nominal_base_node_size, 2);
              var circleArea = baseArea;
              circleArea += vm.$store.getters.get_settings
                .node_size_citation_count
                ? baseArea * Math.log10(1 + parseInt(d.citationCount, 10))
                : 0;
              return (
                /*
                Math.PI *
                Math.pow(
                  (size(d.size) * base_radius) / nominal_base_node_size ||
                    base_radius,
                  2
                )
                */
                circleArea
              );
            })
            .type(function (d) {
              return d.type;
            })
        );

        if (!text_center) {
          text.attr("dx", function (d) {
            return d.r;
          });
        }

        let text_size = nominal_text_size;
        if (nominal_text_size * zoom.scale() > max_text_size) {
          text_size = max_text_size / zoom.scale();
        }
        text.style("font-size", text_size + "px");

        g.attr(
          "transform",
          "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"
        );
      });

      svg.call(zoom).on("dblclick.zoom", null);

      resize();

      d3.select(window).on("resize", resize);
      this.zoom
        .scale(this.initialZoomLevel)
        .translate([
          this.$store.getters.get_is_vis_exploration_drawer ? -225 : 0,
          0,
        ]);
      this.zoom.event(d3.select("#graphSVG"));

      //Rectangular select on SVG, was intended to select nodes for recommendations in recommendation drawer
      /*
      function rect(x, y, w, h) {
        return (
          "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z"
        );
      }
      var selection = svg
        .append("path")
        .attr("class", "selection")
        .attr("visibility", "hidden");

      var startSelection = function (start) {
        selection
          .attr("d", rect(start[0], start[0], 0, 0))
          .attr("visibility", "visible");
      };

      var moveSelection = function (start, moved) {
        selection.attr(
          "d",
          rect(start[0], start[1], moved[0] - start[0], moved[1] - start[1])
        );
      };

      var endSelection = function (start, end) {
        console.log(start, end)
        selection.attr("visibility", "hidden");
      };

      svg.on("mousedown", function () {
        if (d3.event.ctrlKey || d3.event.shiftKey || d3.event.altKey) {
          var subject = d3.select(window),
            parent = this.parentNode,
            start = d3.mouse(parent);
          startSelection(start);
          subject
            .on("mousemove.selection", function () {
              moveSelection(start, d3.mouse(parent));
            })
            .on("mouseup.selection", function () {
              endSelection(start, d3.mouse(parent));
              subject
                .on("mousemove.selection", null)
                .on("mouseup.selection", null);
            });
        }
      });

      svg.on("touchstart", function () {
        var subject = d3.select(this),
          parent = this.parentNode,
          id = d3.event.changedTouches[0].identifier,
          start = d3.touch(parent, id),
          pos;
        startSelection(start);
        subject
          .on("touchmove." + id, function () {
            if ((pos = d3.touch(parent, id))) {
              moveSelection(start, pos);
            }
          })
          .on("touchend." + id, function () {
            if ((pos = d3.touch(parent, id))) {
              endSelection(start, pos);
              subject.on("touchmove." + id, null).on("touchend." + id, null);
            }
          });
      });
      */

      force.on("tick", function () {
        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        text.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

        link
          .attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

        node
          .attr("cx", function (d) {
            return d.x;
          })
          .attr("cy", function (d) {
            return d.y;
          });
      });

      function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        svg.attr("width", width).attr("height", height);
        zoom.size([width, height]);
        /*
        force
          .size([
            force.size()[0] + (width - w) / zoom.scale(),
            force.size()[1] + (height - h) / zoom.scale(),
          ])
          .resume();
        */
        force.size([width, height]).resume();
        w = width;
        h = height;
      }

      link.attr("distance", (d) => {
        return this.dist(d);
      });
      force.linkDistance(this.dist).alpha(1).start();
      vm.$store.commit("change_is_svg_initialized", true);
      vm.$store.commit("change_is_graph_forces_on", true);
      function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      Array.prototype.remove = function () {
        let what;
        const a = arguments;
        let L = a.length;
        let ax;
        while (L && this.length) {
          what = a[--L];
          while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
          }
        }
        return this;
      };
    },
  },
});
</script>
<style>
.node:hover {
  cursor: pointer;
}
text {
  font-family: sans-serif;
  pointer-events: none;
}
.selection {
  fill: #add8e6;
  stroke: #add8e6;
  fill-opacity: 0.3;
  stroke-opacity: 0.7;
  stroke-width: 2;
}
</style>
