import { defineStore } from 'pinia'


export const useGoodsTypeStore = defineStore('goodsType', {
    state: () => {
        return {
            typeList: []
        }
    },
    actions: {
        setList(list) {
            this.typeList = list
            console.log(this.typeList);
        }
    }
})