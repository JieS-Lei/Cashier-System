import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from '~/store/modules/userStore'

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    if (to.meta.admin) {
        // 权限路由
        if (userStore.isLogin) next()
        else next('/login')
    } else next()
})

export default router