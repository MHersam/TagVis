<template>
  <v-carousel v-model="model" height=500 show-arrows-on-hover hide-delimiter-background cycle class="carousel center">
    <v-carousel-item
      v-for="(color, i) in colors"
      :key="color"
    >
      <v-sheet
        :color="color"
        height="100%"
        tile
      >
        <v-row
          class="fill-height"
          align="center"
          justify="center"
        >
          <div class="display-3 textMargin">
            {{text[i]}}
          </div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HowTo',

  data: () => ({
    model: 0,
    colors: [
      'red',
      'blue',
      'green'
    ],
    text: [
      'Log in to your Mendeley account',
      'Select papers from your library',
      'Analyze visualizations and gain insights'
    ]
  })
})
</script>
<style scoped>
  .carousel{
    max-width: 800px;
    text-align: center;
  }
  .textMargin{
    margin-left: 50px;
    margin-right: 50px;
  }
</style>
