import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import pinia from '~/store'
import router from '~/router'

import '~/assets/style/index.css'
import 'element-plus/dist/index.css'
import locale from 'element-plus/lib/locale/lang/zh-cn'

// 创建vue实例
const app = createApp(App)

// 挂载pinia
app.use(pinia)
// 挂载vue-router
app.use(router)
// element 全局配置
app.use(ElementPlus, { locale, size: 'small', zIndex: 2000 })
// 挂载实例
app.mount('#app')
