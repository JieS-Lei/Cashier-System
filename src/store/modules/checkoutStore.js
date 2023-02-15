import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
    state: () => {
        return {
            goods: [], // 商品
            order: new Map(), // 订单中的商品
            currentGoods: [], // 选中的订单中的商品
            onlyOneDiscount: true, // 是否禁止折扣与减价同时生效
            checkedDiscount: new Map(), // 选中的折扣和减价
            notSmaCha: 1, // 抹零方式：1-不抹零、2-抹分、3-抹角、4-四舍五入到角、5-逢分进角
            vipCheck: false, // vip身份
        }
    },
    actions: {
        delete_checkedDiscount(key) {
            key && this.checkedDiscount.delete(key)
        },
        pushIntoOrder(goods) {
            if (null == goods || !goods?.goods_id) return
            if (this.order.has(goods.goods_id)) goods.num = this.order.get(goods.goods_id).num += 1
            this.order.set(goods.goods_id, { ...goods })
        },
        clearCurrentGoods() {
            this.currentGoods = []
        }
    }
})