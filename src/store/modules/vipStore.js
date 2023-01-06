import { defineStore } from 'pinia'

export const useVipStore = defineStore('vip', {
    state: () => {
        return {
            setting: {}, // 分类数据
        }
    },
    actions: {
        setSetting(options) {
            this.setting = options
        }
    }
})