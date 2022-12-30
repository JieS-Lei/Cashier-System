import { defineStore } from 'pinia'

export const goodsUnitStore = defineStore('goodsUnit', {
    persist: {
        key: 'GOODSUNIT',
        storage: sessionStorage
    }, // 持久化
    state: () => {
        return {
            isLogin: false,
            token: null,
            userInfo: {}
        }
    },
    actions: {
        setToken(token) {
            // action 中修改状态
            this.token = token
            this.isLogin = true
        }
    }
})