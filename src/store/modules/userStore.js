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
        setToken(token) {
            // action 中修改状态
            this.token = token
            this.isLogin = true
        },
        getUserInfo(getAdminInfo) {
            if (!getAdminInfo) return false
            getAdminInfo(this.token).then(([error, result]) => {
                if (error) return console.warn(error)
                if (1 != result.code) return console.warn(`code - ${result.code}\nerrMsg: ${result.msg}`)
                this.userInfo = result.data
                console.log(result.data)
            })
        }
    }
})