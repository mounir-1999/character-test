<template>
  <div>
    <LanguageSwitcher />
    <RouterView />
  </div>
</template>

<script>
import { RouterView } from 'vue-router'
import LanguageSwitcher from './components/LanuageSwitcher.vue'

export default {
  components: {
    LanguageSwitcher
  },

}
</script>


