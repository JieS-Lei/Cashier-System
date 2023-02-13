import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from '~/store/modules/userStore'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = createRouter({
    history: createWebHashHistory(),
    // mode: 'hash',
    routes
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    NProgress.start()
    if (to.meta.admin) {
        // 权限路由
        if (userStore.isLogin) next()
        else next('/login')
    } else if (to.name === 'login' && userStore.isLogin) {
        // 已存在token
        next('/home')
    }
    else next()
})

router.afterEach(() => {
    NProgress.done()
})

export default router