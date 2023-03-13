<script setup>
import { formatter } from '~/utils'
import keyboardVue from '~/components/keyboard.vue'

const props = defineProps({
    receivable: {
        required: true,
        validator(value) {
            // The value must match one of these strings
            return new RegExp('^\\d+\\.\\d{2}$').test(value)
        }
    }
})

const PrintTickets = ref(false) // 支付后打印小票与否
const realMoney = ref('0.00') // 实付
const giveChange = computed(() => formatter.format(realMoney.value - props.receivable))
const selectModel = ref(1) // 切换支付方式

// 虚拟键盘点击
const handelKeyClick = keyVal => {
    let txt = realMoney.value
    if (txt === '0.00') txt = '0'
    txt += keyVal
    txt = txt.replace(/[^\d\.]|^00*(?=\d+)|(?<=\.\d{2}).*|(?<=\.\d*)\./g, '')
    realMoney.value = txt
}
// 删除
const handelDelete = () => {
    realMoney.value = realMoney.value.slice(0, realMoney.value.length - 1)
    if (!realMoney.value.includes('.') && +realMoney.value === 0) realMoney.value = '0.00'
}
// 清空
const handelRemove = () => realMoney.value = '0.00'

</script>
<template>
    <div class="sA-warp">
        <div class="sA-main">
            <div class="top">
                <div class="receivable">
                    <span>应收</span>
                    <span>￥{{ props.receivable }}</span>
                </div>
                <el-divider direction="vertical" style="height: auto;" />
                <div class="PaidIn">
                    <span>实收</span>
                    <span style="color: var(--el-color-primary);">￥{{ realMoney }}</span>
                </div>
                <el-divider direction="vertical" style="height: auto;" />
                <div class="giveChange">
                    <span>找零</span>
                    <span style="color: var(--el-color-danger);">￥{{ giveChange }}</span>
                </div>
            </div>
            <div class="middle">
                <el-checkbox v-model="PrintTickets" label="支付完成打印小票" size="large" style="font-weight: bolder;" />
            </div>
            <div class="bottom">
                <div v-if="selectModel === 1" class="cash">
                    <keyboardVue class="keyboar" direction="vertical" @keyClick="handelKeyClick">00</keyboardVue>
                    <div class="flex-column shortcut-tab">
                        <span @click="realMoney = '100.00'">￥100</span>
                        <span @click="realMoney = '50.00'">￥50</span>
                        <span @click="realMoney = '10.00'">￥10</span>
                        <span @click="realMoney = '5.00'">￥5</span>
                    </div>
                    <div class="flex-column fn-btn">
                        <span @click="handelDelete">删除<b>[Bksp]</b></span>
                        <span @click="handelRemove">清空<b>[Del]</b></span>
                        <span class="confirm">确认<b>[Enter]</b></span>
                    </div>
                </div>
                <div v-if="selectModel === 2" class="offline">
                    <div>
                        <el-image src="/public/icon/pay/unionPay.png" style="width: 40px;height: 40px" fit="contain" />
                        <span class="pay-name">已POS支付</span>
                        <span>[Alt+5]</span>
                    </div>
                    <div>
                        <el-image src="/public/icon/pay/weChatPay.png" style="width: 30px;height: 40px" fit="contain" />
                        <span class="pay-name" style="color: #54a44b;">已微信支付</span>
                        <span style="color: #54a44b;">[Alt+6]</span>
                    </div>
                    <div>
                        <el-image src="/public/icon/pay/aliPay.png" style="width: 30px;height: 40px" fit="contain" />
                        <span class="pay-name" style="color: #009fe8;">已支付宝支付</span>
                        <span style="color: #009fe8;">[Alt+7]</span>
                    </div>
                </div>
                <div v-if="selectModel === 3" class="ScanCode">

                </div>
            </div>
        </div>
        <div class="sA-tab">
            <div style="flex: 1.3;">取消<b>[Esc]</b></div>
            <div :class="selectModel == 1 && 'on'" @click="selectModel = 1">现金支付<b>[Alt+2]</b></div>
            <div :class="selectModel == 2 && 'on'" @click="selectModel = 2">线下支付<b>[Alt+3]</b></div>
            <div :class="selectModel == 3 && 'on'" @click="selectModel = 3">扫码支付<b>[Alt+4]</b></div>
        </div>
    </div>
</template>
<style scoped>
.sA-warp {
    --borderReadius: 5px;
    display: flex;
    padding: 10px 20px 20px;
    border-radius: 5px;
    width: 600px;
}

.sA-main {
    flex: 1;
}

.sA-tab {
    display: flex;
    flex-direction: column;
    width: 120px;
    margin-left: 20px;
}

.sA-tab>div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: var(--el-border-width) var(--el-border-style) var(--el-border-color);
    border-radius: var(--borderReadius);
    font-size: 14px;
    font-weight: 600;
    color: #777;
    background-color: #fff;
    transition: all .2s;
}

.sA-tab>div:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    outline: none;
    cursor: pointer;
}

.sA-tab>div:active {
    background-color: var(--el-fill-color-light);
}

.sA-tab>div.active {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
}

.sA-tab>div+div {
    margin-top: 10px;
}

.sA-main .top {
    display: flex;
    padding: 10px 0;
    border-radius: var(--borderReadius);
    background-color: #fff;
}

.sA-main .top>div:not(.el-divider) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    font-size: 12px;
}

.sA-main .top>div:not(.el-divider) span:last-child {
    margin-top: 10px;
    font-size: 22px;
    font-weight: bold;
}

.sA-main .middle {
    padding: 5px 0 10px;
    text-align: right;
}

.sA-main .cash {
    --btn-height: 50px;
    --btn-bg-color: #fff;
    --btn-bg-color-hover: #fbfbfb78;
    --btn-gap: 8px;
    --btn-radius: 3px;
    --btn-border-color: var(--el-border-color-lighter);
    display: flex;
}

.sA-main .cash .keyboar {
    --keyboard-height: var(--btn-height);
    flex: 3;
    gap: var(--btn-gap);
}

.sA-main .cash .keyboar:deep(span) {
    border-radius: var(--btn-radius);
    border-color: var(--btn-border-color);
    background-color: var(--btn-bg-color);
}

.sA-main .cash .keyboar:deep(span):hover {
    background-color: var(--btn-bg-color-hover);
}

.flex-column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.sA-main .cash>div:not(.keyboar) {
    flex: 1;
    padding-left: 8px;
}

.sA-main .cash>div:not(.keyboar) span {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--btn-border-color);
    border-radius: var(--btn-radius);
    height: var(--btn-height);
    line-height: 1;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    background-color: var(--btn-bg-color);
    box-sizing: border-box;
    transition: all .2s;
}

.sA-main .cash>div:not(.keyboar) span:hover {
    background-color: var(--btn-bg-color-hover);
    cursor: pointer;
}

.sA-main .cash .fn-btn span {
    font-size: 14px !important;
}

.sA-main .cash .fn-btn span b {
    margin-top: 5px;
    font-size: 12px;
}

.sA-main .cash .fn-btn span+span {
    margin-top: var(--btn-gap);
}

.sA-main .cash .fn-btn .confirm {
    flex: 1;
    color: #fff;
    border: none;
    background-color: var(--el-color-primary);
}

.sA-main .cash .fn-btn .confirm:hover {
    color: var(--el-color-white);
    background-color: var(--el-color-primary-light-3);
}

.sA-main .offline {
    display: flex;
    padding: 10px;
    height: 224px;
    border-radius: var(--borderReadius);
    box-sizing: border-box;
    background-color: #fff;
}

.sA-main .offline>div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 2px solid transparent;
    border-radius: var(--borderReadius);
    background-color: #f5f8fb;
    box-sizing: border-box;
    cursor: pointer;
    transition: border .2s;
}

.sA-main .offline>div:hover {
    border-color: rgb(64, 158, 255);
}

.sA-main .offline>div+div {
    margin-left: 10px;
}

.sA-main .offline>div span {
    margin-top: 10px;
    font-size: 12px;
    font-weight: bold;
    color: #082f67;
}

.sA-main .offline>div .pay-name {
    margin-top: 2px;
    font-size: 15px;
}
</style>