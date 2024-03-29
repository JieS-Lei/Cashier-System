<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { formatter } from '~/utils'
import settementListVue from '~/components/settlementList.vue'
import { ref } from 'vue';
import { apis } from '~/apis'

const checkoutStore = useCheckoutStore()

const { order, checkedDiscount, notSmaCha, currentGoods, vipCheck } = storeToRefs(checkoutStore)

const emits = defineEmits(['current-change'])

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
        if (action === 'confirm') order.value.clear()
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

// 创建订单
const loadingOurderBtn = ref(false)
const submitOurder = async isPending => {
    if (!order.value.size) return
    loadingOurderBtn.value = true
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
        remark: remarks.content,
    }
    let [error, { code, data }] = await apis.createOrder(options)
    loadingOurderBtn.value = false
    if (error || 1 !== code) return ElMessage('订单创建失败')
    console.log(data);
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
        <el-divider style="margin: 0" />
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
                <el-button type="success" :loading="loadingOurderBtn" size="large" style="width: 180px;"
                    @click="submitOurder">退款 (Space)</el-button>
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
    </div>
</template>
<style scoped>
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
    padding: 15px 14px 10px;
    background-color: rgba(var(--el-color-success-rgb), .1);
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
    justify-content: flex-end;
    padding: 5px 10px 0;
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
</style>