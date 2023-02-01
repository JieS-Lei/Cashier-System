<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import settementListVue from '~/components/settlementList.vue'

const checkoutStore = useCheckoutStore()

const { order, discounts, reduces, checkedDiscount } = storeToRefs(checkoutStore)

const peyGoodsSum = computed(() => {
    let peyObj = order.reduce()
    return peyObj
})

const currentChange = (row, rowIndex) => {
    console.log(row, rowIndex);
}

const remarks = ref('') // 备注内容

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
        <settementListVue class="cas-main" :list="order" @current-change="currentChange" />
        <div class="cas-ps">
            <span class="tip remarks mx-1">
                <template v-if="!remarks">
                    <el-icon size="16" style="margin-right:2px;vertical-align: bottom;">
                        <epEdit />
                    </el-icon>备注<b style="margin-left: 3px;">Ctrl+B</b>
                </template>
                <template v-else>
                    {{ remarks }}
                </template>
            </span>
            <el-tag v-if="checkedDiscount.type" :type="checkedDiscount.type === 'discount' ? 'danger' : 'warning'"
                class="mx-1" size="large" closable @close="checkoutStore.init_checkedDiscount()">
                {{
                    checkedDiscount.type === 'discount'
                        ? `${discounts[checkedDiscount.index]}折`
                        : `-${reduces[checkedDiscount.index]}元`
                }}
            </el-tag>
        </div>
        <el-divider style="margin: 0 0 5px;" />
        <div class="billSummary">
            <ul class="amountView">
                <li class="cell"><span class="label">件数：</span><span class="content">0</span></li>
                <li class="cell"><span class="label">合计：</span><span class="content">￥0.00</span></li>
                <li class="cell"><span class="label">优惠：</span><span class="content red f-s-2">￥0.00</span></li>
                <li class="cell"><span class="label">应收：</span><span class="content red f-s-1">￥0.00</span></li>
            </ul>
            <div class="btns">
                <el-badge :hidden="false" :value="1" type="info">
                    <el-button type="info" plain size="large">取单 (F2)</el-button>
                </el-badge>
                <el-button type="warning" size="large">挂单 (F3)</el-button>
                <el-button type="danger" size="large" style="margin-left: 0;">结算 (Space)</el-button>
            </div>
        </div>
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
    padding: 10px;
    cursor: pointer;
}

.cas-ps .remarks {
    padding: 8px;
    font-size: 14px;
    line-height: 1;
    display: inline-block;
    color: var(--el-text-color-secondary);
    max-width: 100px;
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
    padding-bottom: 8px;
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