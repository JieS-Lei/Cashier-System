import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import pinia from '@/stores'
import router from '@/router'

// 创建vue实例
const app = createApp(App)

// 挂载pinia
app.use(pinia)
// 挂载vue-router
app.use(router)
// element 全局配置
app.use(ElementPlus, { size: 'small', zIndex: 2000 })
// 挂载实例
app.mount('#app')
