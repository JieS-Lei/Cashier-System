<script setup>
const emit = defineEmits(['current-change'])
const props = defineProps({
    list: {
        type: Array,
        required: true
    },
    isVip: Boolean
})
const goodsPriceKey = computed(() => props.isVip ? 'goods_vip_price' : 'goods_price')
const currentRow = ref(-1)
const rowClick = (row, index) => {
    if (currentRow.value === index) return
    currentRow.value = index
    emit('current-change', row, index)
}

</script>
<template>
    <div class="table">
        <div class="table-title">
            <span>序号</span>
            <span>商品</span>
            <span>单价</span>
            <span>数量</span>
            <span>小计</span>
        </div>
        <el-scrollbar style="flex: 1;">
            <template v-if="list.length">
                <div :class="['row', { 'current-row': currentRow === index, 'error-row': (row.goods_sku.stock_num < row.num) }, { 'warning-row': +row.goods_sku[goodsPriceKey] < +row.goods_sku.goods_cost_price }]"
                    v-for="(row, index) of list" @click="rowClick(row, index)">
                    <div class="content">
                        <span>{{ index+ 1 }}</span>
                        <span>{{ row.goods_name }}</span>
                        <span>{{ row.goods_sku[goodsPriceKey] }}</span>
                        <span>{{ row.num }}</span>
                        <span>
                            <el-tooltip :disabled="`${row.goods_sku[goodsPriceKey] * row.num}`.length <= 9"
                                effect="dark" :content="`${row.goods_sku[goodsPriceKey] * row.num}`" placement="top">
                                {{ row.goods_sku[goodsPriceKey] * row.num }}
                            </el-tooltip>
                        </span>
                    </div>
                    <div class="error">
                        <span v-if="+row.goods_sku[goodsPriceKey] < +row.goods_sku.goods_cost_price"
                            style="color: var(--el-color-warning);">售价小于进价</span>
                        <span v-if="row.goods_sku.stock_num < row.num">库存不足，剩余{{ row.goods_sku.stock_num }}件</span>
                    </div>
                </div>
            </template>
            <el-empty v-else description="请扫描商品条形码" />
        </el-scrollbar>
    </div>
</template>
<style scoped>
.table .warning-row {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.table .error-row {
    --el-table-tr-bg-color: var(--el-color-error-light-9);
}

.table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.table .current-row {
    --el-table-tr-bg-color: var(--el-color-primary-light-9);
}

.table {
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.row .error {
    display: none;
    flex-direction: column;
    padding-left: 67px;
    padding-top: 3px;
    font-size: 12px;
    color: var(--el-color-error);
}

.row.warning-row .error,
.row.error-row .error {
    display: flex;
}

.row {
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-table-tr-bg-color, #fff);
    transition: background-color .25s ease;
}

.row:hover {
    background-color: var(--el-fill-color-light);
    cursor: pointer;
}

.row .content,
.table-title {
    display: flex;
    justify-content: space-between;
}

.table-title {
    padding: 8px 0;
}

.row .content>span,
.table-title>span {
    overflow: hidden;
    padding: 0 12px;
    width: 92px;
    box-sizing: border-box;
    font-size: 14px;
    font-weight: bold;
    line-height: 23px;
    text-align: center;
    text-indent: initial;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    /* word-break: break-all; */
}

.row .content>span:nth-child(1),
.table-title>span:nth-child(1) {
    width: 55px;
}

.row .content>span:nth-child(4),
.table-title>span:nth-child(4) {
    width: 64px;
}

.row .content>span:nth-child(2),
.table-title>span:nth-child(2) {
    flex: 1;
    text-align: left;
}
</style>