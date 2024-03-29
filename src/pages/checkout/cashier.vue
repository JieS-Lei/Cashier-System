<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { formatter, formatDate } from '~/utils'
import settementListVue from '~/components/settlementList.vue'
import { apis } from '~/apis'

import QRcodeVue from '~/components/QRcode.vue'
import settlementWholeVue from '~/components/settlement-whole.vue'

const checkoutStore = useCheckoutStore()

const { order, checkedDiscount, notSmaCha, currentGoods, vipCheck } = storeToRefs(checkoutStore)

const emits = defineEmits(['current-change', 'clear-order'])

// 金额抹零
const handleNotSmaCha = num => {
    if (notSmaCha.value < 2) return num
    num = num.toString()
    let newNum = num.replace(/(\d+)\.(\d)(\d)/, (txt, $0, $1, $2) => {
        let t = txt
        if (notSmaCha.value == 2) t = `${$0}.${$1}0` // 抹分
        else if (notSmaCha.value == 3) t = `${$0}.00` // 抹角
        else if (notSmaCha.value == 4) {
            if (+$2 < 5) t = `${$0}.${$1}0`
            else if ((+$1 + 1) < 10) t = `${$0}.${+$1 + 1}0`
            else t = `${+$0 + 1}.00`
        } else if (notSmaCha.value == 5) {
            if (+$2 === 0) t = `${$0}.${$1}0`
            else if ((+$1 + 1) < 10) t = `${$0}.${+$1 + 1}0`
            else t = `${+$0 + 1}.00`
        }
        return t
    })
    return newNum
}

// 订单金额数量合计
const orderSettlement = computed(() => {
    let orderToArray = Array.from(order.value)
    let peyObj = orderToArray.reduce((acc, cur) => {
        cur = cur[1]
        return {
            num: acc.num + cur.num,
            count: +formatter.format(acc.count + (+formatter.format((cur.diyPrice ?? cur.goods_sku[vipCheck.value ? 'goods_vip_price' : 'goods_price']) * (cur.oneDis / 100)) * cur.num))
        }
    }, { num: 0, count: 0 })
    peyObj.count = formatter.format(peyObj.count)
    peyObj['receivable'] = peyObj.count
    checkedDiscount.value.forEach((value, key) => {
        if (key === 'discount') peyObj['receivable'] = +formatter.format(peyObj['receivable'] * (+value / 10))
        if (key === 'reduce') peyObj['receivable'] = +formatter.format(peyObj['receivable'] - +value)
    });
    peyObj.receivable = formatter.format(Math.max(0, peyObj.receivable))
    peyObj.receivable = handleNotSmaCha(peyObj.receivable)
    peyObj['reduce'] = formatter.format(Math.max(0, peyObj.count - peyObj.receivable))
    return peyObj
})

// 订单数据单条选中
const currentChange = row => {
    currentGoods.value = row
    emits('current-change', row)
}

// 快捷键
const shortcutKeys = event => {
    if (event.ctrlKey && event.key === 'b') remarkOpen() // 打开备注
    if (event.altKey && event.key === '2') getOredrList()
    if (event.code === 'Space') submitOurder(1)
}
document.addEventListener('keyup', shortcutKeys)
onUnmounted(() => document.removeEventListener('keyup', shortcutKeys))

// 清除订单列表
const clearAll = () => ElMessageBox({
    title: '提示',
    message: h('p', null, [
        '确定',
        h('span', { style: 'margin: 0 5px;color: red' }, '清空'),
        '商品列表？'
    ]),
    cancelButtonText: '取消',
    center: true,
    showCancelButton: true,
    showClose: false,
    draggable: true,
    customStyle: {
        display: 'block',
        margin: '18vh auto 0'
    },
    async beforeClose(action, instance, done) {
        if (action === 'confirm') {
            order.value.clear()
            emits('clear-order')
        }
        done()
    },
    callback() { }
})

// 备注内容
const remarksDialogVisible = ref(false) // 对话框显隐
const remarks = reactive({
    content: '',
    copy: ''
})

// 备注对话框打开
const oneInputRef = ref() // input实例
const remarkOpen = () => {
    remarks.copy = remarks.content
    remarksDialogVisible.value = true
    // 获取焦点
    setTimeout(() => nextTick(() => {
        oneInputRef.value.focus()
    }), 0)
}
// 备注对话框提交
const remarksSubmit = () => remarksDialogVisible.value = (remarks.content = remarks.copy, false)
const handelRemarksKeyboard = event => {
    event.stopPropagation()
    if (event.key === 'Delete') remarks.copy = ''
    if (event.ctrlKey && event.key === 'Enter') remarksSubmit()
    return
}

const elTagOption = {
    'discount': {
        type: 'danger',
        unit: '折'
    },
    'reduce': {
        type: 'warning',
        unit: '元'
    }
}

// 结算台
const settleAccountsVisible = ref(true)

// 创建订单
let orderSN = '' // 订单id
const loadingOurderBtn = ref(false)
const submitOurder = async isPending => {
    if (!order.value.size) return ElMessage.warning({ message: '请选择商品', grouping: true })
    ElMessageBox.confirm(`是否确认 ${isPending ? '挂起' : '结算'} 订单？`, '提示', {
        showClose: false,
        draggable: true,
        async beforeClose(action, instance, done) {
            if (action !== 'confirm') return done()
            instance.confirmButtonLoading = loadingOurderBtn.value = true
            let discount_type = '', discount = ''
            if (checkedDiscount.value.has('discount')) {
                discount_type = 'ratio'
                discount = checkedDiscount.value.get('discount')
            }
            else if (checkedDiscount.value.has('reduce')) {
                discount_type = 'price'
                discount = checkedDiscount.value.get('reduce')
            }
            let options = {
                type: 0,
                pending: +isPending,
                goods_param: JSON.stringify(Array.from(order.value)),
                discount_type,
                discount,
                discount_delzero_val: notSmaCha.value,
                remark: remarks.content
            }
            if (orderSN) options['order_sn'] = orderSN
            let [error, { code, data }] = await apis.createOrder(options)
            instance.confirmButtonLoading = loadingOurderBtn.value = false
            done()
            if (error || 1 !== code) return ElMessage('订单创建失败')
            remarks.content = ''
            if (isPending) {
                // 挂单
                order.value.clear()
                emits('clear-order')
                data.order.goods_param = JSON.parse(data.order.goods_param)
                return pendingOrderList.value.push(data.order)
            }
            // 订单结算
            payOptions.url = data.pay_url
            payOptions.sn = data.order_sn
            payOptions.money = data.pay_amount
            payDialogVisible.value = true
            // 轮询结算结果
            polling()
        },
        callback() { }
    })
}

// 轮询
let countdown = ref(180)
let timer = null
let isReq = false
const endPolling = () => {
    payDialogVisible.value = false
    countdown.value = 180
    clearInterval(timer)
    payOptions = {
        url: '',
        sn: '',
        money: '0.00'
    }
}
const polling = () => {
    timer = setInterval(() => {
        countdown.value--
        if (countdown <= 0) endPolling()
        if (!isReq) {
            isReq = true
            apis.polling().then(([error, { code }]) => {
                isReq = false
                if (1 === code) {
                    endPolling()
                    alert('支付成功')
                    order.value.clear()
                    emits('clear-order')
                }
            })
        }
    }, 1000)
}

// 现金支付
const cashPayLoading = ref(false)
const handleCashPayClick = async () => {
    cashPayLoading.value = true
    let [error, { code }] = await apis.cashPay(payOptions.sn)
    cashPayLoading.value = false
    if (error || 1 !== code) return ElMessage.warning('支付失败')
    endPolling()
    ElMessage.success('支付成功')
    order.value.clear()
    emits('clear-order')
}

// 支付对话框
const payDialogVisible = ref(false)
let payOptions = {
    url: '',
    sn: '',
    money: '0.00'
}

// 打开挂单列表
const getOredrList = () => {
    if (!pendingOrderList.value.length) return ElMessage.warning({ message: '暂无挂起订单', grouping: true })
    pOrderVisible.value = true
}

// 挂单列表
const pOrderVisible = ref(false)
const pendingOrderList = ref([])
const inpVla = ref('')
const getPendingOrderList = async () => {
    let [error, { code, data }] = await apis.getPendingOrder({
        remark: inpVla.value
    })
    if (error || 1 !== code) return ElMessage('获取挂起订单列表失败')
    pendingOrderList.value = data.map(item => {
        item.goods_param = JSON.parse(item.goods_param)
        return item
    })
}
getPendingOrderList()

const delOrder = async (sn, i) => {
    ElMessageBox.confirm(`是否删除此挂单？`, '提示', {
        showClose: false,
        draggable: true,
        async beforeClose(action, instance, done) {
            if (action !== 'confirm') return done()
            instance.confirmButtonLoading = true
            let [error, { code }] = await apis.deleteOrder({ order_sn: sn })
            done()
            if (error || 1 !== code) return ElMessage('挂单删除失败')
            let tempObj = pendingOrderList.value.splice(i, 1)
            if (tempObj.order_sn === orderSN) orderSN = ''
        },
        callback() { }
    })
}
const clearOrder = () => {
    ElMessageBox.confirm(`是否清空全部挂单？`, '提示', {
        showClose: false,
        draggable: true,
        async beforeClose(action, instance, done) {
            if (action !== 'confirm') return done()
            instance.confirmButtonLoading = true
            let [error, { code }] = await apis.deleteOrder({ is_clear: 1 })
            done()
            if (error || 1 !== code) return ElMessage('清空挂单失败')
            pendingOrderList.value = []
            pOrderVisible.value = false
            orderSN = ''
        },
        callback() { }
    })
}
const getOrder = index => {
    let orderObj = pendingOrderList.value[index]
    orderSN = orderObj.order_sn
    emits('clear-order')
    order.value = new Map(orderObj.goods_param)
    pOrderVisible.value = false
}

// 整单支付 | 组合支付
const headerTabVal = ref(true)
const headerTabFn = event => {
    if (event) {
        const target = event.target
        if (target.className) return
    }
    headerTabVal.value = !headerTabVal.value
}

</script>
<template>
    <div class="cas">
        <header class="cas-header">
            <!-- <span class="tip">Ctrl+D</span> -->
            <el-button text style="margin-left: 5px;" @click="clearAll">
                <template #icon>
                    <el-icon>
                        <epDelete />
                    </el-icon>
                </template>
                全部清除
            </el-button>
        </header>
        <el-divider style="margin: 5px 0;" />
        <settementListVue class="cas-main" :list="order" :isVip="vipCheck" :currentId="currentGoods[0] ?? ''"
            @current-change="currentChange" />
        <div class="cas-ps">
            <span>
                <span class="tip remarks mx-1" @click="remarkOpen">
                    <template v-if="!remarks.content">
                        <el-icon size="14" style="margin-right:2px;vertical-align: bottom;">
                            <epEdit />
                        </el-icon>备注<b style="margin-left: 3px;">Ctrl+B</b>
                    </template>
                    <template v-else>
                        {{ remarks.content }}
                    </template>
                </span>
                <el-tag v-for="[key, val] in checkedDiscount" :type="elTagOption[key].type" class="mx-1" size="large"
                    closable @close="checkoutStore.delete_checkedDiscount(key)">
                    {{ key === 'reduce' ? '-' : '' }}{{ val + elTagOption[key].unit }}
                </el-tag>
            </span>
            <el-check-tag :checked="vipCheck" size="large" @change="vipCheck = !vipCheck">
                {{ vipCheck ? '会员' : '顾客' }}
            </el-check-tag>
        </div>
        <el-divider style="margin: 0 0 5px;" />
        <div class="billSummary">
            <ul class="amountView">
                <li class="cell">
                    <span class="label">件数：</span>
                    <span class="content">{{ orderSettlement.num }}</span>
                </li>
                <li class="cell">
                    <span class="label">合计：</span>
                    <span class="content">￥{{ orderSettlement.count }}</span>
                </li>
                <li class="cell">
                    <span class="label">优惠：</span>
                    <span class="content red f-s-2">￥{{ orderSettlement.reduce }}</span>
                </li>
                <li class="cell">
                    <span class="label">应收：</span>
                    <span class="content red f-s-1">￥{{ orderSettlement.receivable }}</span>
                </li>
            </ul>
            <div class="btns">
                <el-badge :hidden="!pendingOrderList.length" :value="pendingOrderList.length" type="info">
                    <el-button type="info" plain size="large" @click="getOredrList">取单 (Alt+2)</el-button>
                </el-badge>
                <el-button type="warning" size="large" @click="submitOurder(1)">挂单 (Alt+3)</el-button>
                <el-button type="danger" :loading="loadingOurderBtn" size="large" style="margin-left: 0;"
                    @click="submitOurder(0)">结算 (Space)</el-button>
            </div>
        </div>
        <el-dialog v-model="remarksDialogVisible" title="备注" width="40%" destroy-on-close center
            @keyup="handelRemarksKeyboard">
            <el-input ref="oneInputRef" v-model="remarks.copy" type="textarea" :rows="3" maxlength="50" resize="none"
                placeholder="请输入备注" onfocus="this.select()" show-word-limit autofocus />
            <template #footer>
                <el-button size="large" type="info" style="width: 125px;" @click="remarks.copy = ''">
                    清空 Delete
                </el-button>
                <el-button type="primary" size="large" @click="remarksSubmit" style="width: 125px; margin-left: 50px;">
                    添加 Ctrl+Enter
                </el-button>
            </template>
        </el-dialog>
        <el-dialog class="payDialog" v-model="payDialogVisible" title="支付" width="450" :close-on-click-modal="false"
            :show-close="false" center>
            <div class="header">
                <div class="left">
                    <p class="money"><span>金额</span>：{{ payOptions.money || '0.00' }}元</p>
                    <p class="sn"><span>订单号</span>：{{ payOptions.sn }}</p>
                </div>
                <div class="right">{{ countdown }}s</div>
            </div>
            <QRcodeVue :qrUrl="payOptions.url" />
            <p class="ps">请使用 <b>微信</b> 扫码支付</p>
            <template #footer>
                <el-button type="primary" size="large" :loading="cashPayLoading"
                    @click="handleCashPayClick">现金支付</el-button>
            </template>
        </el-dialog>
        <Transition>
            <div class="sA-overlay" v-show="settleAccountsVisible">
                <div class="sA-container">
                    <div class="sA-header">
                        <span class="title" @click="headerTabFn">
                            <span :class="['mask', { 'on': !headerTabVal }]">蒙版</span>
                            <span :class="{ 'on': headerTabVal }">整单支付 <b>Ctrl+Tab</b></span>
                            <span :class="{ 'on': !headerTabVal }">组合支付 <b>Ctrl+Tab</b></span>
                        </span>
                    </div>
                    <settlementWholeVue :receivable="orderSettlement.receivable" :scanCodePayOptions="{}" />
                </div>
            </div>
        </Transition>
        <Transition>
            <div class="pendingOrder-overlay" v-show="pOrderVisible" @click.self="pOrderVisible = false">
                <div class="pendingOrder">
                    <div class="p-o-top">
                        <el-input v-model="inpVla" class="w-50 m-2" size="large" placeholder="输入挂单备注搜索"
                            @change="getPendingOrderList">
                            <template #prefix>
                                <el-icon>
                                    <epSearch />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                    <el-scrollbar style="flex: 1">
                        <ul class="p-o-list">
                            <li class="p-o-item" v-for="(item, index) in pendingOrderList">
                                <div class="p-o-item-tit">
                                    <span>
                                        <el-icon size="16" style="vertical-align: text-top;">
                                            <epDocument />
                                        </el-icon>
                                        <b style="margin-left: 5px;">{{ item.order_sn }}</b>
                                    </span>
                                    <span>{{ formatDate(item.create_time * 1000, 'yyyy-MM-dd HH:mm:ss') }}</span>
                                </div>
                                <div class="goodsView">
                                    <div class="box">
                                        <span class="name textHiddle">{{ item.goods_param[0][1].goods_name }}</span>
                                        <span class="price">￥{{ item.goods_param[0][1].goods_sku.goods_price }}</span>
                                        <span class="num">x{{ item.goods_param[0][1].num }}</span>
                                        <span class="dis">{{ item.goods_param[0][1].oneDis }}%</span>
                                        <span class="count textHiddle">￥{{
                                            formatter.format(
                                                +formatter.format((item.goods_param[0][1].diyPrice ??
                                                    item.goods_param[0][1].goods_sku.goods_price)
                                                    * (item.goods_param[0][1].oneDis / 100))
                                                * item.goods_param[0][1].num)
                                        }}</span>
                                    </div>
                                    <div class="box" v-if="item.goods_param.length > 1">
                                        <span class="name textHiddle">{{ item.goods_param[1][1].goods_name }}</span>
                                        <span class="price">￥{{
                                            item.goods_param[1][1].diyPrice ?? item.goods_param[1][1].goods_sku.goods_price
                                        }}</span>
                                        <span class="num">x{{ item.goods_param[1][1].num }}</span>
                                        <span class="dis">{{ item.goods_param[0][1].oneDis }}%</span>
                                        <span class="count textHiddle">￥{{
                                            formatter.format(
                                                +formatter.format((item.goods_param[1][1].diyPrice ??
                                                    item.goods_param[1][1].goods_sku.goods_price)
                                                    * (item.goods_param[1][1].oneDis / 100))
                                                * item.goods_param[1][1].num)
                                        }}</span>
                                    </div>
                                    <div class="box" v-if="item.goods_param.length > 2">......</div>
                                </div>
                                <div class="pic">
                                    {{ item.count }}件商品，预计应付：￥{{ item.amount }}
                                </div>
                                <div class="btn">
                                    <el-button @click="delOrder(item.order_sn, index)">删除挂单</el-button>
                                    <el-button disabled>打印小票</el-button>
                                    <el-button type="primary" style="width: 88px;" @click="getOrder(index)">取单</el-button>
                                </div>
                            </li>
                        </ul>
                    </el-scrollbar>
                    <el-button size="large" style="height: 45px;" @click="clearOrder">
                        <template #icon>
                            <el-icon>
                                <epDelete />
                            </el-icon>
                        </template>
                        清空挂单
                    </el-button>
                </div>
            </div>
        </Transition>
    </div>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity .3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.pendingOrder-overlay {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    z-index: 11;
}

.pendingOrder {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 55px;
    bottom: 80px;
    left: 10px;
    width: 455px;
    background-color: #fff;
}

.pendingOrder .p-o-top {
    padding: 10px;
}

.p-o-item .p-o-item-tit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    font-size: 14px;
    line-height: 1;
    color: var(--el-color-primary);
    background-color: rgba(var(--el-color-primary-rgb), .1);
}

.goodsView .box {
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.goodsView .box>span {
    padding: 0 5px;
    box-sizing: border-box;
}

.goodsView .box .name {
    flex: 1;
}

.goodsView .box .price {
    width: 95px;
}

.goodsView .box .num {
    width: 56px;
    text-align: center;
}

.goodsView .box .dis {
    width: 46px;
}

.goodsView .box .count {
    width: 90px;
    text-align: right;
}

.textHiddle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.p-o-item .pic {
    padding: 15px 10px 0;
    text-align: right;
    font-size: 15px;
    font-weight: bolder;
    color: var(--el-color-danger);
}

.p-o-item .btn {
    padding: 5px 10px 10px;
    text-align: right;
}

.cas {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.cas-header {
    padding: 5px;
    text-align: right;
}

.cas-main {
    flex: 1;
}

.cas-ps {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    cursor: pointer;
}

.cas-ps .remarks {
    padding: 9px 8px;
    font-size: 14px;
    line-height: 1;
    display: inline-block;
    color: var(--el-text-color-secondary);
    max-width: 100px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    vertical-align: bottom;
}

.billSummary {
    padding: 10px 14px;
}

.billSummary .amountView {
    display: flex;
    flex-wrap: wrap;
}

.billSummary .amountView .cell {
    width: 50%;
    padding-bottom: 10px;
}

.billSummary .amountView .cell .label {
    font-size: 15px;
    font-weight: bold;
    line-height: 1;
    margin-right: 5px;
    color: var(--el-text-color-secondary);
}

.billSummary .amountView .cell .content {
    font-weight: bolder;
    font-size: 18px;
    line-height: 1;
    vertical-align: bottom;
    color: var(--el-text-color-regular);
}

.billSummary .red {
    color: var(--el-color-danger) !important;
}

.billSummary .f-s-2 {
    font-size: 20px !important;
}

.billSummary .f-s-1 {
    font-size: 22px !important;
}

.btns {
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
}

.btns:deep(.el-button span) {
    font-weight: bolder;
    font-size: 16px;
}

.tip {
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    color: var(--el-text-color-placeholder);
    background-color: var(--el-fill-color-light);
}

.tip b {
    font-size: 12px;
    font-weight: bold;
    color: var(--el-text-color-placeholder);
}

.payDialog .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    margin: 0 auto;
    width: 300px;
    font-weight: bolder;

}

.payDialog .header .left span {
    display: inline-block;
    width: 42px;
    text-align: justify;
    text-align-last: justify;
}

.payDialog .header .right {
    font-size: 20px;
    color: var(--el-color-danger);
}

.payDialog .ps {
    text-align: center;
    color: var(--el-color-danger);
}

.sA-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, .5);
    z-index: 9999;
}

.sA-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--el-bg-color-page);
}

.sA-header {
    --tabHeight: 30px;
    padding: 20px 0 0;
    height: var(--tabHeight);
    display: flex;
    justify-content: center;
}

.sA-header .title {
    position: relative;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    background-color: #fff;
}

.sA-header .title span {
    --oneTabWidth: 80px;
    position: relative;
    display: inline-block;
    text-align: center;
    height: var(--tabHeight);
    line-height: var(--tabHeight);
    transition: all .2s;
    width: 135px;
    overflow: hidden;
    cursor: pointer;
    z-index: 1;
}

.sA-header .title span.on {
    width: var(--oneTabWidth);
    color: #fff;
}

.sA-header .title span.mask {
    width: var(--oneTabWidth);
    word-break: keep-all;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
    color: transparent;
    background-color: rgb(64, 158, 255);
    z-index: 0;
}

.sA-header .title span.mask.on {
    left: 100%;
    transform: translateX(-100%);
}

.sA-header .title span b {
    border-radius: 4px;
    padding: 3px;
    font-size: 12px;
    color: #b7c7d0;
    background-color: var(--el-bg-color-page);
}
</style>