<script setup>
// const emit = defineEmits(['done', 'updataList'])
const props = defineProps({
    list: {
        type: Array,
        required: true
    }
})
const currentRow = ref(-1)
const rowClick = (row, index) => {
    console.log(row, index);
    if (currentRow.value === index) return
    currentRow.value = index
}

</script>
<template>
    <div class="table">
        <div class="row table-title">
            <span>序号</span>
            <span>商品</span>
            <span>单价</span>
            <span>数量</span>
            <span>小计</span>
        </div>
        <el-scrollbar style="flex: 1;">
            <div :class="['row', { 'current-row': currentRow === index, 'error-row': row.goods_sku.stock_num < row.num }]"
                v-for="(row, index) of list" @click="rowClick(row, index)">
                <span>{{ index+ 1 }}</span>
                <span>{{ row.goods_name }}</span>
                <span>{{ row.goods_sku.goods_price }}</span>
                <span>{{ row.num }}</span>
                <span>
                    <el-tooltip disabled class="box-item" effect="dark" content="Top Left prompts info"
                        placement="top-start">
                        {{ row.goods_sku.goods_price * row.num }}
                    </el-tooltip>
                </span>
            </div>
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

.error {
    font-size: 12px;
    color: red;
}

.table {
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.row {
    padding: 8px 0;
    /* margin: 0 8px; */
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-table-tr-bg-color, #fff);
    transition: background-color .25s ease;
}

.row:not(.table-title):hover {
    background-color: var(--el-fill-color-light);
    cursor: pointer;
}

.row.table-title {
    padding: 8px 0;
    /* border-bottom: none; */
}

.row span {
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

.row span:nth-child(1) {
    width: 55px;
}

.row span:nth-child(4) {
    width: 64px;
}

.row span:nth-child(5) {
    overflow: hidden;
}

.row span:nth-child(2) {
    flex: 1;
    text-align: left;
}
</style>