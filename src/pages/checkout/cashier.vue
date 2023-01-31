<script setup>
import settementListVue from '~/components/settlementList.vue'

const tableData = [{
    goods_name: '测试商品',
    goods_sku: {
        goods_price: '999999.99',
        stock_num: '0'
    },
    num: 2
}, {
    goods_name: '康师傅红烧牛肉方便面',
    goods_sku: {
        goods_price: '4.50',
        stock_num: '20'
    },
    num: 2
}, {
    goods_name: '农夫山泉矿泉水',
    goods_sku: {
        goods_price: '4.50',
        stock_num: '30'
    },
    num: 3
}, {
    goods_name: '旺旺牛奶糖',
    goods_sku: {
        goods_price: '0.50',
        stock_num: '25'
    },
    num: 15
}]
const tableRowClassName = ({ row, rowIndex }) => {
    console.log(row, rowIndex);
    if (row.goods_sku.stock_num < 1) {
        return 'warning-row'
    } else if (rowIndex === 3) {
        return 'error-row'
    }
    return ''
}

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
        <settementListVue class="cas-main" :list="tableData" />
        <div class="cas-ps">
            <span class="tip remarks">
                <el-icon size="16" style="margin:0 2px -1px 0;">
                    <epEdit />
                </el-icon>
                备注<b style="margin-left: 3px;">Ctrl+B</b>
            </span>
        </div>
        <el-divider style="margin: 0 0 5px;" />

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
}

.cas-ps .remarks {
    font-size: 14px;
    line-height: 1;
    display: inline-flex;
    align-items: flex-end;
    color: var(--el-text-color-secondary);
    max-width: 100px;
    overflow: hidden;
}

.tip {
    padding: 5px;
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