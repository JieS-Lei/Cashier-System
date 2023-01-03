import { defineStore } from 'pinia'

export const useGoodsStore = defineStore('goods', {
    state: () => {
        return {
            typeList: [], // 分类数据
            unitList: [], // 商品单位数据
            checkedUnit: {}, // 选中的单位
            checkedType: {}, // 选中的单位
            rowForm: {} // 修改的单行数据
        }
    },
    actions: {
        setTypeList(list) {
            this.typeList = list
        },
        setUtilList(list) {
            this.typeList = list
        },
        clearChecked() {
            this.checkedType = {}
            this.checkedUnit = {}
        }
    }
})