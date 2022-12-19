import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import pinia from '~/store'
import router from '~/router'

import '~/assets/style/index.css'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'default-passive-events'



// 创建vue实例
const app = createApp(App)

// 全局注册所有icon
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//     app.component(key, component)
// }
// 挂载pinia
app.use(pinia)
// 挂载vue-router
app.use(router)
// element 全局配置
app.use(ElementPlus, { locale: zhCn, size: 'small', zIndex: 2000, max: 3 })
// 挂载实例
app.mount('#app')
