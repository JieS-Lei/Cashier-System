<script setup>
import { useUserStore } from '~/store/modules/userStore.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

/* Start - 设置 Token 到 pinia */
let tokenFromLoc = localStorage.getItem('token')
if (!userStore.token && tokenFromLoc) userStore.setToken(tokenFromLoc)
/* End - 设置Token 到 pinia */

/* Start 绑定Esc按键事件 */
const backPages = ['goods', 'vip', 'vipSetting']
const escDown = event => {
  if (event.key !== 'Escape') return false
  let info = router.currentRoute.value
  if (backPages.includes((info.name || '').split(/(?=[A-Z])/)[0])) router.back()
}
document.documentElement.addEventListener('keyup', escDown)
onBeforeUnmount(() => {
  document.documentElement.removeEventListener('keyup', escDown)
})
/* End 绑定Esc按键事件 */
</script>

<template>
  <router-view />
</template>

<style>
#app {
  font-family: var(--el-font-family);
}
</style>
