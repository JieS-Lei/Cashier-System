const home = () => import('@/pages/home/index.vue');
const login = () => import('@/pages/login/index.vue');
const Page404 = () => import('@/components/404.vue');

const routes = [
    {
        path: '/',
        redirect: '/login'
    }, {
        path: '/home',
        name: 'home',
        component: home,
    }, {
        path: '/login',
        name: 'login',
        component: login,
    }, {
        path: "/404",
        name: '404',
        component: Page404,
    }, {
        path: '/:catchAll(.*)',
        redirect: "/404"
    },
];
export default routes