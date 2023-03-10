<script setup>
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceBlurFormatter } from '~/utils'

import keyboardVue from '~/components/keyboard.vue'

const checkoutStore = useCheckoutStore()

const handleAddKey = event => {
    if (event.key === '+') handleAddClick(moneyVal.value)
}
document.documentElement.addEventListener('keyup', handleAddKey, null)
onBeforeUnmount(() => {
    document.documentElement.removeEventListener('keyup', handleAddKey)
})

const moneyVal = ref('')
const keyClick = val => {
    let txt = moneyVal.value
    if (val === 'X') return moneyVal.value = txt.slice(0, txt.length - 1)
    if (val === '.') {
        if (!txt) return moneyVal.value = '0.'
        if (/\./.test(txt)) return
        return moneyVal.value += '.'
    }
    if (txt == 0) return moneyVal.value = val
    let [$1, $2] = txt.split('.')
    if (($2 == null && $1.length >= 5) || ('string' === typeof $2 && $2.length >= 2)) return
    moneyVal.value += val
}

let goods_id_num = 1
const handleAddClick = money => {
    if (!+money) return ElMessage.warning({ message: '请输入正确的金额', grouping: true })
    money = priceBlurFormatter(money)
    checkoutStore.pushIntoOrder({
        goods_id: `data${goods_id_num++}`,
        goods_name: '直接收款',
        goods_sku: {
            goods_price: money,
            goods_vip_price: money,
            line_price: '0.00',
            stock_num: 999999
        },
        num: 1,
        oneDis: 100
    })
    moneyVal.value = ''
}

</script>
<template>
    <div>
        <div class="money">
            <el-input class="money-input" v-model="moneyVal" size="large" placeholder="请输入金额"
                :formatter="value => `${value}`.replace(/[^\d\.]|^0(?=\d)|(?<=\.\d*)\.|(?<=\.\d{2}).*|(?<=^\d{5})\d*/g, '')"
                @blur="moneyVal = priceBlurFormatter(moneyVal)" onfocus="this.select()">
                <template #suffix><span>元</span></template>
            </el-input>
        </div>
        <div class="vKeyboard">
            <keyboardVue @keyClick="keyClick" />
        </div>
        <div class="addBtn">
            <el-button type="primary" size="large" @click="handleAddClick(moneyVal)">添加 [+]</el-button>
        </div>
    </div>
</template>
<style scoped>
.money {
    padding-top: 30px;
    text-align: center;
}

.money-input,
.vKeyboard,
.addBtn {
    margin: 15px auto 0;
    width: 450px;
}

.money-input:deep(.el-input__wrapper) {
    padding: 8px 20px;
}

.addBtn .el-button {
    --el-button-size: 50px;
    width: 100%;
}

.addBtn .el-button:deep(span) {
    font-size: 16px;
    letter-spacing: 3px;
}
</style>