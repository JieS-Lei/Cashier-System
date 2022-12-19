<script setup>
import { useUserStore } from '~/store/modules/userStore.js'
const userStore = useUserStore()
let tokenFromLoc = localStorage.getItem('token')
if (!userStore.token && tokenFromLoc) userStore.setToken(tokenFromLoc)

</script>

<template>
  <router-view />
</template>

<style>
#app {
  font-family: var(--el-font-family);
}
</style>
