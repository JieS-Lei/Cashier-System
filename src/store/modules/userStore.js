import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    persist: {
        key: 'USER',
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
        // action 中修改状态
        setToken(token) {
            this.token = token
            this.isLogin = true
        },
        clear() {
            this.isLogin = false,
                this.token = null,
                this.userInfo = {}
        },
        getUserInfo(getAdminInfo, callback, ...arg) {
            if (!getAdminInfo) return false
            getAdminInfo(this.token).then(([error, result]) => {
                callback && callback([error, result], ...arg)
                if (error) return console.warn(error)
                if (1 != result.code) return console.warn(`code - ${result.code}\nerrMsg: ${result.msg}`)
                this.userInfo = result.data
            })
        }
    }
})