import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
    state: () => {
        return {
            information: {}, // 系统信息
        }
    },
    actions: {

    }
})