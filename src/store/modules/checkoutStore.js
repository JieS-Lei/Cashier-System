import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
    state: () => {
        return {
            goods: [], // 商品
            order: new Map(), // 订单中的商品
            currentGoods: null, // 选中的订单中的商品
            onlyOneDiscount: true, // 是否禁止折扣与减价同时生效
            checkedDiscount: new Map(), // 选中的折扣和减价
            notSmaCha: 1 // 抹零方式：1-不抹零、2-抹分、3-抹角、4-四舍五入到角、5-逢分进角
        }
    },
    actions: {
        delete_checkedDiscount(key) {
            key && this.checkedDiscount.delete(key)
        },
        pushIntoOrder(goods) {
            if (null == goods || !goods?.goods_id) return
            if (this.order.has(goods.goods_id)) goods.num = this.order.get(goods.goods_id).num += 1
            console.log(goods);
            this.order.set(goods.goods_id, { ...goods })
        }
    }
})
// [{
//     goods_name: '测试商品',
//     goods_sku: {
//         goods_price: '999999.99',
//         stock_num: '0',
//         goods_vip_price: '100.00',
//         goods_cost_price: '10000.00'
//     },
//     num: 2
// }, {
//     goods_name: '康师傅红烧牛肉方便面',
//     goods_sku: {
//         goods_price: '5.00',
//         stock_num: '20',
//         goods_vip_price: '4.50',
//         goods_cost_price: '3.00'
//     },
//     num: 2
// }, {
//     goods_name: '农夫山泉矿泉水',
//     goods_sku: {
//         goods_price: '2.50',
//         stock_num: '30',
//         goods_vip_price: '2.00',
//         goods_cost_price: '2.30'
//     },
//     num: 3
// }, {
//     goods_name: '旺旺牛奶糖',
//     goods_sku: {
//         goods_price: '1.10',
//         stock_num: '25',
//         goods_vip_price: '0.85',
//         goods_cost_price: '0.50'
//     },
//     num: 15
// }]