import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            isLogin: false,
            token: null,
            userInfo: {}
        }
    },
    actions: {
        login() {

        }
    }
}, {
    persist: {
        key: 'user',
        storage: sessionStorage
    } // 持久化
})