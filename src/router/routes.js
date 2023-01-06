const routes = [
    {
        path: '/',
        redirect: '/login'
    }, {
        path: '/home',
        name: 'home',
        component: () => import('~/pages/home/index.vue'),
        meta: {
            admin: true
        }
    }, {
        path: '/goods',
        name: 'goods',
        component: () => import('~/pages/goods/index.vue'),
        meta: {
            admin: true
        }
    }, {
        path: '/vip',
        meta: {
            admin: true
        },
        children: [{
            path: '',
            name: 'vip',
            component: () => import('~/pages/vip/index.vue'),
        }, {
            path: 'setting',
            component: () => import('~/pages/vip/setting/index.vue'),
            children: [{
                path: '',
                name: 'vipSetting',
                component: () => import('~/pages/vip/setting/base.vue'),
            }, {
                path: 'auto',
                name: 'vipAuto',
                component: () => import('~/pages/vip/setting/auto.vue')
            }]
        }]
    }, {
        path: '/login',
        name: 'login',
        component: () => import('~/pages/login/index.vue'),
    }, {
        path: "/404",
        name: '404',
        component: () => import('~/components/404.vue'),
    }, {
        path: '/:catchAll(.*)',
        redirect: "/404"
    },
]

export default routes