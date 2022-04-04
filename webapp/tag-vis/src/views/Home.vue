<!-- Home view, displays the different components on the root view -->
<template>
  <v-container class="home globalMaxWidth center">
    <Introduction/>
    <MendeleyLogin style="display: none"/>
    <ZoteroLogin style="display: none"/>
    <FileUpload/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MendeleyLogin from '@/components/MendeleyLogin.vue' // @ is an alias to /src
import ZoteroLogin from '@/components/ZoteroLogin.vue'
import HowTo from '@/components/HowTo.vue'
import Introduction from '@/components/Introduction.vue'
import FileUpload from '@/components/FileUpload.vue'

@Component({
  components: {
    MendeleyLogin,
    ZoteroLogin,
    HowTo,
    Introduction,
    FileUpload
  }
})
export default class Home extends Vue {
}
</script>
