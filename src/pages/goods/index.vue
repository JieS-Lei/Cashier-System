<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { apis } from '~/apis'

const router = useRouter()

const search = ref('')
const back = () => router.replace('/home')
const escDown = event => event.key === 'Escape' && back()

onMounted(() => {
    document.documentElement.addEventListener('keyup', escDown)
})
onBeforeUnmount(() => {
    document.documentElement.removeEventListener('keyup', escDown)
})

const checked1 = ref(false)
const checked2 = ref(false)
const checkeds = reactive({
    checked3: false,
    checked4: false
})

watch(checkeds, newValue => {
    // 处理 checked3 和 checked4
    if (newValue.checked3) {
        // checkde3
    }
    if (newValue.checked4) {
        // checked4
    }

})
watch(checked1, newValue => {
    if (newValue) {

    } else {

    }

})
watch(checked2, newValue => {
    if (newValue) {

    } else {

    }
})

const date = ref('') // 选择的时间
const shortcuts = [
    {
        text: '最近一周',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        },
    },
    {
        text: '最近一月',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
        },
    },
    {
        text: '最近三个月',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
        },
    },
]
const change = changeDate => {
    console.log(date.value, changeDate);
}

const deleteType = ref('') //
const deleteChange = type => {
    deleteType.value = ''
    if ('deleteChecked' === type) {

    }
}

const sort = ref('new')
const sortChange = value => {
    console.log(value);
}

// 表格
const handleSelectionChange = val => {
    multipleSelection.value = val
}

const tableData = ref([])
onMounted(async () => {
    let [error, { data, code }] = await apis.getGoods()
    if (error || 1 !== code) return
    console.log(data);
    data.list.data[0].sku.goods_no = 1231321
    tableData.value = data.list.data
})

const fn = (row, column, cellValue, index) => {
    return cellValue || '-'
}

const activeName = ref('')

</script>
<template>
    <el-scrollbar>
        <el-container class="container">
            <el-header class="header">
                <el-button class="esc" size="large" text @click="back">
                    <el-icon size="20">
                        <ep-arrowLeft-bold />
                    </el-icon>
                    返回 [ESC]
                </el-button>
                <span class="title">商品管理</span>
                <div></div>
            </el-header>
            <el-main class="main">
                <div class="top">
                    <div class="left">
                        <el-input v-model="search" class="large search radius" placeholder="商品名称/条码/首字母/扫码" clearable />
                        <el-select class="select large radius" placeholder="显示设置">
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checked1" :disabled="checkeds.checked3" label="隐藏未销售" size="large"
                                    @click.stop />
                            </el-option>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checked2" :disabled="checkeds.checked4" label="隐藏零库存" size="large"
                                    @click.stop />
                            </el-option>
                            <el-divider style="margin: 10px 20px; width: auto;"></el-divider>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked3" :disabled="checked1" label="显示未销售" size="large"
                                    @click.stop />
                            </el-option>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked4" :disabled="checked2" label="显示零库存" size="large"
                                    @click.stop />
                            </el-option>
                        </el-select>
                        <div class="selectDate">
                            <span>创建时间</span>
                            <el-date-picker class="picker radius" v-model="date" type="daterange" unlink-panels
                                :shortcuts="shortcuts" range-separator="至" start-placeholder="开始日期"
                                end-placeholder="结束日期" size="large" @change="change" />
                        </div>
                    </div>
                    <div class="right">
                        <el-button class="addBtn radius" plain size="large">导入商品</el-button>
                        <el-button class="addBtn radius" type="primary" size="large">新增商品</el-button>
                    </div>
                </div>
                <div class="btns radius">
                    <el-select v-model="deleteType" class="select" placeholder="批量删除" size="large"
                        @change="deleteChange">
                        <el-option label="删除已选商品" value="deleteChecked" />
                        <el-option label="按分类删除商品" value="typeDelete" />
                    </el-select>
                    <el-button class="radius" plain size="large">自动生成条码</el-button>
                    <el-button class="radius" plain size="large" disabled>打印条码</el-button>
                    <el-button class="radius" plain size="large" disabled>打印标价签</el-button>
                    <el-button class="radius" plain size="large">设置分类</el-button>
                    <el-button class="radius" plain size="large">设置单价</el-button>
                    <el-button class="radius" plain size="large">批量改价</el-button>
                    <el-button class="radius" plain size="large">设置库存上/下限</el-button>
                    <el-select v-model="sort" class="sort" placeholder="排序方式" size="large" @change="sortChange">
                        <el-option label="最新创建" value="new" aria-checked />
                        <el-option label="首字母升序" value="initial" />
                    </el-select>
                </div>
                <div class="content">
                    <div class="table">
                        <el-table ref="multipleTableRef" :data="tableData" stripe size="large"
                            @selection-change="handleSelectionChange">
                            <el-table-column type="selection" width="55" />
                            <!-- <el-table-column label="时间" width="120">
                            <template #default="scope">{{ scope.row.date }}</template>
                        </el-table-column> -->
                            <el-table-column prop="goods_name" label="商品名称" show-overflow-tooltip />
                            <el-table-column prop="goods_sku.goods_no" label="条码" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="type" label="分类" width="120" align="center" />
                            <el-table-column prop="goods_sku.goods_price" label="售价" width="100" align="center" />
                            <el-table-column prop="goods_sku.goods_vip_price" label="会员价" width="100" align="center" />
                            <el-table-column prop="goods_sku.goods_cost_price" label="进价" width="100" align="center" />
                            <el-table-column prop="goods_sku.stock_num" label="库存" width="100" align="center" />
                            <el-table-column prop="goods_sku.goods_unit" label="单位" width="100" align="center"
                                :formatter="fn" />
                        </el-table>
                    </div>
                    <div class="type">
                        <div class="tit">编辑分类</div>
                        <div class="item">全部分类</div>
                        <div class="item">其他分类</div>
                        <el-collapse v-model="activeName" accordion>
                            <el-collapse-item title="矿泉水" name="1">
                                <div class="item">农夫山泉</div>
                                <div class="item">冰泉</div>
                                <div class="item">怡宝</div>
                            </el-collapse-item>
                            <el-collapse-item title="方便面" name="2">
                            </el-collapse-item>
                            <el-collapse-item title="香烟" name="3">
                            </el-collapse-item>
                            <el-collapse-item title="名酒" name="4">
                            </el-collapse-item>
                            <el-collapse-item title="饮料" name="5">
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </div>
            </el-main>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
.container {
    min-width: 1020px;
    height: 100vh;
    user-select: none;
}

.header {
    /* display: flex;
    align-items: center;
    justify-content: space-between; */
    position: relative;
    padding: 0 10px;
    text-align: center;
    line-height: 60px;
}

.esc {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
}

.title {
    margin: 0 auto;
    line-height: 1;
}

.main {
    --top-border-radius: 50px;
    display: flex;
    flex-direction: column;
    padding: 0;
    background-color: var(--el-bg-color-page);
}

.main .top {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    height: 50px;
    font-size: var(--el-font-size-medium);
    color: var(--el-text-color-regular);
}

.main .top .left {
    flex: 1;
}

.main .top .left>div+div {
    margin-left: 10px;
}

.main .top .search {
    min-width: 245px;
    max-width: 300px;
    width: 33%;
    height: 100%;
}

.main .top .select {
    min-width: 140px;
    max-width: 150px;
    width: 19%;
    height: 100%;
}

.main .top .select:deep(div) {
    width: 100%;
    height: 100%;
}

.main .select:deep(input::placeholder) {
    text-align: center;
    color: var(--el-text-color-regular);
}

.sel-checkbox:deep(.is-disabled) {
    cursor: not-allowed;
}

.main .top .selectDate {
    display: inline-flex;
    align-items: center;
    min-width: 315px;
    max-width: 375px;
    width: 43%;
    height: 100%;
    line-height: 1;
}

.main .top .selectDate span {
    margin-right: 10px;
}

.main .top .selectDate:deep(.picker) {
    flex: 1;
    height: 100%;
}

.addBtn {
    width: 110px;
    height: 100%;
}

.addBtn:deep(span) {
    font-size: var(--el-font-size-large);
}

.main .btns {
    display: flex;
    justify-content: space-between;
    max-width: 1070px;
    padding: 10px;
}

.main .btns .select {
    width: 110px;
}

.main .btns .sort {
    width: 122px;
}

.main .btns>:nth-child(n) {
    margin-left: 0;
}

.content {
    --type-width: 105px;
    flex: 1;
    display: flex;
    padding: 0 10px 10px;
    border-radius: 20px;
    /* overflow: hidden; */
}

.content .table {
    width: calc(100% - var(--type-width));
    height: 100%;
}

.content .type {
    margin-left: 5px;
    width: calc(var(--type-width) - 5px);
    background-color: var(--el-fill-color-blank);
}

.content .type .tit {
    height: 50px;
    line-height: 50px;
    font-size: var(--el-font-size-medium);
    font-weight: bolder;
    text-align: center;
    color: var(--el-color-white);
    background-color: var(--el-color-primary);
}

.content .type>.item {
    padding-left: 15px;
    font-size: var(--el-font-size-small);
    background-color: var(--el-fill-color-blank);
}

.content .type .item {
    border-top: 1px solid var(--el-border-color-lighter);
    height: 48px;
    line-height: 48px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    outline: 0;
}

.content .type:deep(.el-collapse .el-collapse-item__header) {
    padding-left: 15px;
    text-align: center;
}

.content .type:deep(.el-collapse .el-collapse-item__content) {
    padding-bottom: 0;
    text-align: center;
}

.content .type:deep(.el-collapse .el-collapse-item__content div) {
    border-color: #fff;
    background-color: #e2ecfe;
}

.content .type:deep(.el-collapse .el-collapse-item__content div):hover {
    background-color: #d2e4ee;
}

.active {
    font-weight: 600;
    color: var(--el-color-primary) !important;
    background-color: rgba(64, 158, 255, .1) !important;
}

/* 组件内input 大字体 */
.large:deep(input) {
    padding: 0 20px;
    font-size: var(--el-font-size-medium);
}

/* 圆角 */
:deep(.radius),
.radius:deep(div) {
    border-radius: var(--top-border-radius);
}
</style>
<style>
.sel-checkbox {
    padding: 0;
    display: flex;
    align-items: center;
}

.sel-checkbox .el-checkbox {
    flex: 1;
    padding: 0 32px 0 20px
}
</style>