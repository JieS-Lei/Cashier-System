import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
    state: () => {
        return {
            goods: [], // 商品
            order: [{
                goods_name: '测试商品',
                goods_sku: {
                    goods_price: '999999.99',
                    stock_num: '0',
                    goods_vip_price: '100.00',
                    goods_cost_price: '10000.00'
                },
                num: 2
            }, {
                goods_name: '康师傅红烧牛肉方便面',
                goods_sku: {
                    goods_price: '5.00',
                    stock_num: '20',
                    goods_vip_price: '4.50',
                    goods_cost_price: '3.00'
                },
                num: 2
            }, {
                goods_name: '农夫山泉矿泉水',
                goods_sku: {
                    goods_price: '2.50',
                    stock_num: '30',
                    goods_vip_price: '2.00',
                    goods_cost_price: '2.30'
                },
                num: 3
            }, {
                goods_name: '旺旺牛奶糖',
                goods_sku: {
                    goods_price: '1.00',
                    stock_num: '25',
                    goods_vip_price: '0.85',
                    goods_cost_price: '0.50'
                },
                num: 15
            }], // 订单中的商品
            currentGoods: null, // 选中的订单中的商品
            discounts: ['9.9', '9.5', '9', '5.5'], // 折扣配置
            reduces: ['5', '10', '15', '100'], // 减少金额配置
            checkedDiscount: new Map([
                ['reduce', '50'],
                ['discount', '8.5']
            ]),
            // {
            //     type: new Set(['reduce', 'discount']), // discount折扣，reduce减少金额
            //     index: 1
            // }
        }
    },
    actions: {
        init_checkedDiscount(key) {
            key && this.checkedDiscount.delete(key)
        }
    }
})