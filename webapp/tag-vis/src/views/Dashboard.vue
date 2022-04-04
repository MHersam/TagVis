<!-- Dashboard view lets users navigate the tool  -->
<template>
<div class="globalMaxWidth center">
  <v-container>
    <div class="mt-3 mb-3 ml-3">
      <h1>Welcome, {{ this.$store.getters.get_display_name }}</h1>
    </div>
    <DashboardLinks />
  </v-container>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import DashboardLinks from '@/components/DashboardLinks.vue'
import { Component } from 'vue-property-decorator'

@Component({
  components: {
    DashboardLinks
  }
})
export default class Home extends Vue {}
</script>

<style>
</style>
