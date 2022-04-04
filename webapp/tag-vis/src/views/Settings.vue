<!-- Settings view, wraps the settings list component -->
<template>
  <v-container>
    <SettingsList />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import SettingsList from "../components/SettingList.vue";

@Component({
  components: { SettingsList },
})
export default class Settings extends Vue {}
</script>
