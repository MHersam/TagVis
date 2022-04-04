<template>
  <v-container>
    <p>{{ this.$store.getters.get_display_name }}</p>
    <v-avatar size="256px" class="ml-3">
      <img alt="Avatar" v-bind:src="this.$store.getters.get_photo_url"
    /></v-avatar>
    <p>Access token: {{ this.$store.getters.get_access_token }}</p>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data: () => ({}),
  methods: {}
})
</script>
<style>
</style>
