<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceBlurFormatter, formatter } from '~/utils'
import settementListVue from '~/components/settlementList.vue'
import { ref } from 'vue';

const checkoutStore = useCheckoutStore()

const { order, checkedDiscount } = storeToRefs(checkoutStore)

// vip身份结算
const vipCheck = ref(false)

// 订单金额数量合计
const orderSettlement = computed(() => {
    let peyObj = order.value.reduce((acc, cur) => ({
        num: acc.num + cur.num,
        count: +formatter.format(acc.count + (+cur.goods_sku[vipCheck.value ? 'goods_vip_price' : 'goods_price'] * cur.num))
    }), { num: 0, count: 0 })
    peyObj['receivable'] = peyObj.count
    checkedDiscount.value.forEach((value, key) => {
        if (key === 'discount') peyObj['receivable'] = +formatter.format(peyObj['receivable'] * (+value / 10))
        if (key === 'reduce') peyObj['receivable'] = +formatter.format(peyObj['receivable'] - +value)
    });
    peyObj.receivable = formatter.format(Math.max(0, peyObj.receivable))
    peyObj['reduce'] = formatter.format(peyObj.count - peyObj.receivable)
    return peyObj
})

// 订单数据单条选中
const currentChange = (row, rowIndex) => {
    console.log(row, rowIndex);
}

// 备注内容
const centerDialogVisible = ref(true) // 对话框显隐
const remarks = reactive({
    content: '',
    copy: ''
})

</script>
<template>
    <div class="cas">
        <header class="cas-header">
            <span class="tip">Ctrl+D</span>
            <el-button text style="margin-left: 5px;">
                <template #icon>
                    <el-icon>
                        <epDelete />
                    </el-icon>
                </template>
                全部清除
            </el-button>
        </header>
        <el-divider style="margin: 5px 0;" />
        <settementListVue class="cas-main" :list="order" :isVip="vipCheck" @current-change="currentChange" />
        <div class="cas-ps">
            <span>
                <span class="tip remarks mx-1" @click="centerDialogVisible = (remarks.copy = remarks.content, true)">
                    <template v-if="!remarks.content">
                        <el-icon size="14" style="margin-right:2px;vertical-align: bottom;">
                            <epEdit />
                        </el-icon>备注<b style="margin-left: 3px;">Ctrl+B</b>
                    </template>
                    <template v-else>
                        {{ remarks.content }}
                    </template>
                </span>
                <el-tag v-if="checkedDiscount.has('discount')" type="danger" class="mx-1" size="large" closable
                    @close="checkoutStore.init_checkedDiscount('discount')">
                    {{ checkedDiscount.get('discount') }}折
                </el-tag>
                <el-tag v-if="checkedDiscount.has('reduce')" type="warning" class="mx-1" size="large" closable
                    @close="checkoutStore.init_checkedDiscount('reduce')">
                    -{{ checkedDiscount.get('reduce') }}元
                </el-tag>
            </span>
            <el-check-tag :checked="vipCheck" size="large" @change="vipCheck = !vipCheck">
                {{ vipCheck?'会员': '顾客' }}
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
                <el-badge :hidden="false" :value="1" type="info">
                    <el-button type="info" plain size="large">取单 (F2)</el-button>
                </el-badge>
                <el-button type="warning" size="large">挂单 (F3)</el-button>
                <el-button type="danger" size="large" style="margin-left: 0;">结算 (Space)</el-button>
            </div>
        </div>
        <el-dialog v-model="centerDialogVisible" title="备注" width="40%" destroy-on-close center
            @keyup.enter="centerDialogVisible = false">
            <el-input v-model="remarks.copy" type="textarea" :rows="3" maxlength="50" resize="none" placeholder="请输入备注"
                show-word-limit autofocus />
            <template #footer>
                <el-button size="large" style="width: 105px;" @click="remarks.copy = ''">
                    清空 Delete
                </el-button>
                <el-button type="primary" size="large"
                    @click="centerDialogVisible = (remarks.content = remarks.copy, false)"
                    style="width: 105px; margin-left: 50px;">
                    添加 Enter
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
</style>