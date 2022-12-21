<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { debounce } from '~/utils'

const router = useRouter()

const back = () => router.replace('/home')
const escDown = event => event.key === 'Escape' && back()

onMounted(() => {
    document.documentElement.addEventListener('keyup', escDown)
})
onBeforeUnmount(() => {
    document.documentElement.removeEventListener('keyup', escDown)
    window.onresize = null
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
    let startTime = changeDate[0].getTime(),
        endTime = changeDate[1].getTime()
    getGoodsList({
        startTime,
        endTime
    })
}

// 删除商品
const deleteType = ref('')
const deleteChange = async type => {
    deleteType.value = ''
    if ('deleteChecked' === type) {
        // 删除选中
        if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', showClose: true, grouping: true })
        let goodIds = multipleSelection.value.map(item => item.goods_id)
        loading = true
        let [error, { data, code }] = await apis.deleteGoods({
            goodsId: goodIds
        })
        if (error || 1 !== code) {
            ElMessage.error('删除失败')
            return loading = false
        }
        console.log(data)
        getGoodsList()
        ElMessage.success('修改成功')
    } else if ('typeDelete' === type) {
        // 按类型删除
    }
}

const sort = ref('new')
const sortChange = value => {
    console.log(value);
}

// 表格
let typeId = '' // 选中的id
const search = ref('') // 搜索内容
const multipleTableRef = ref() // 表格实例
const multipleSelection = ref([]) // 表格选中数据
const tableData = ref([]) // 表格数据
const currentPage = ref(1) // 当前页数
const page = reactive({ // 分页参数
    pageSize: 10, // 一页的数据数量
    total: 0 // 总数
})
const loading = ref(false)

// 单页数量改变 重新获取数据
watch(currentPage, () => getGoodsList())

// 获取表格数据方法
const getGoodsList = async params => {
    loading.value = true
    let options = {
        page: currentPage.value,
        listRows: page.pageSize,
        search: search.value,
        category_id: typeId,
        ...params
    }
    // console.log(options);
    let [error, { data: { list }, code }] = await apis.getGoods(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +list.total
    tableData.value = list.data
    loading.value = false
}

let _clientHeight = 0, remainder = 0 // 初始高度 | 空余高度
const revisePageSize = async el => {
    let elHeader, elBody
    if (!_clientHeight) {
        await nextTick(() => {
            elHeader = el.querySelector('.el-table__header-wrapper')
            elBody = el.querySelector('.el-table__body-wrapper')
        })
    } else {
        elHeader = el.querySelector('.el-table__header-wrapper')
        elBody = el.querySelector('.el-table__body-wrapper')
    }
    let oneHei = elHeader.offsetHeight, boxHei = elBody.offsetHeight
    let showNum = Math.floor(boxHei / oneHei)
    remainder = boxHei % oneHei
    if (!_clientHeight && remainder < 32) {
        showNum--
        remainder += oneHei // 补充剩余高度
    }
    if (!_clientHeight) remainder = Math.max(remainder - 32, 0)  // 剩余高度需要留出分页控件空间
    if ('number' === typeof showNum) page.pageSize = showNum
}

onMounted(async () => {
    let el = multipleTableRef.value?.$el
    if (el) await revisePageSize(el)
    _clientHeight = document.body.clientHeight
    window.onresize = debounce(function () {
        if (page.total <= page.pageSize) return
        let clientHeight = document.body.clientHeight
        if (clientHeight - _clientHeight + remainder < 48) return
        _clientHeight = clientHeight
        revisePageSize(el)
        getGoodsList()
    }, 1000)
    getGoodsList()
})

const searchFn = () => getGoodsList()

// 表中单行数据被点击
const rowClick = row => {
    console.log(row);
}

// 替换空数据
const replace = (row, column, cellValue, index) => {
    return cellValue || '-'
}

// 二级分类点击
const childTypeClick = event => {
    let tag = event.target.getAttribute('data-index')
    if (undefined == tag) return
    checkedType.value = tag
}

// 展开的二级分类的 name 属性
const activeName = ref('')

// 设置分类
const setTypeFn = () => {
    if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', showClose: true, grouping: true })
    console.log(multipleSelection.value[0]);
}

// 设置分类对话框显隐
const centerDialogVisible = ref(false)
const typeList = ref([]) // 分类数据列表
const checkedType = ref(0) // 选中的分类 0:全部,-1:其他
const typeLoading = ref(false)

// 商品类型切换
watch(checkedType, () => {
    let iArr = checkedType.value
    if (!iArr) typeId = ''
    else if (-1 == iArr) typeId = -1
    else {
        iArr = iArr.toString().split('.')
        let tar = typeList.value[iArr[0] - 1]
        if (iArr[1]) tar = tar.children[iArr[1] - 1]
        typeId = tar.id
    }
    getGoodsList()
})

const allowDrop = (draggingNode, dropNode, type) => {
    if (dropNode.data.text === 'only') return type !== 'inner'
    if (draggingNode.data.text === 'level1') return type !== 'inner'
    return true
}

const allowDrag = (draggingNode) => {
    console.log(draggingNode.data.label);
    return !draggingNode.data.label.includes('only')
}

const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
    console.log('tree drag end:', dropNode && dropNode.label, dropType)
}

const handleObj = (target, alias = 0) => {
    const result = []
    for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
            const element = target[key];
            const obj = {
                label: element.name,
                id: element.category_id
            }
            if (alias) obj['text'] = 'level' + alias
            if (Array.isArray(element.child)) {
                obj['children'] = handleObj(element.child, alias + 1)
            }
            result.push(obj)
        }
    }
    return result
}
onMounted(async () => {
    typeLoading.value = true
    let [error, { data: { list }, code }] = await apis.getTypes()
    if (error || 1 !== code) return loading.value = false
    if (null != list && 'object' === typeof list) typeList.value = handleObj(list, 1)
    typeLoading.value = false
})


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
                        <el-input v-model="search" class="large search radius" placeholder="商品名称/条码/首字母/扫码" clearable
                            @change="searchFn" />
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
                    <el-button class="radius" plain size="large" @click="setTypeFn">设置分类</el-button>
                    <el-button class="radius" plain size="large">设置单价</el-button>
                    <el-button class="radius" plain size="large">批量改价</el-button>
                    <el-button class="radius" plain size="large">设置库存上/下限</el-button>
                    <el-select v-model="sort" class="sort" placeholder="排序方式" size="large" @change="sortChange">
                        <el-option label="最新创建" value="new" aria-checked />
                        <el-option label="首字母升序" value="initial" />
                    </el-select>
                </div>
                <div class="content">
                    <div class="table" v-loading="loading" element-loading-text="Loading...">
                        <el-table class="table-main" ref="multipleTableRef" :data="tableData" stripe size="large"
                            @selection-change="val => multipleSelection = val" @row-click="rowClick">
                            <el-table-column type="selection" width="55" />
                            <el-table-column prop="goods_name" label="商品名称" min-width="160" show-overflow-tooltip />
                            <el-table-column prop="goods_sku.goods_no" label="条码" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="type" label="分类" align="center" />
                            <el-table-column prop="goods_sku.goods_price" label="售价" align="center" />
                            <el-table-column prop="goods_sku.goods_vip_price" label="会员价" align="center" />
                            <el-table-column prop="goods_sku.goods_cost_price" label="进价" align="center" />
                            <el-table-column prop="goods_sku.stock_num" label="库存" width="100" align="center" />
                            <el-table-column prop="goods_sku.goods_unit" label="单位" width="100" align="center"
                                :formatter="replace" />
                        </el-table>
                        <el-pagination class="pagination" v-model:current-page="currentPage" :total="page.total"
                            :page-size="page.pageSize" layout="total, prev, pager, next" hide-on-single-page />
                    </div>
                    <div class="type-shell" v-loading="typeLoading" element-loading-text="Loading...">
                        <el-button class="tit" type="primary" size="large"
                            @click="centerDialogVisible = true">编辑分类</el-button>
                        <el-scrollbar>
                            <div class="type">
                                <div :class="['item', { 'active': !checkedType }]"
                                    @click="checkedType = activeName = 0">全部分类</div>
                                <div :class="['item', { 'active': -1 === checkedType }]"
                                    @click="checkedType = activeName = -1">其他分类
                                </div>
                                <el-collapse v-model="activeName" accordion
                                    @change="name => name && (checkedType = name)" @click="childTypeClick">
                                    <el-collapse-item
                                        :class="{ 'nochildren': !typeItem.children, 'active': (index + 1) === parseInt(checkedType) }"
                                        :title="typeItem.label" :name="index + 1" v-for="(typeItem, index) in typeList"
                                        :key="index">
                                        <div :class="['item', { 'active': `${index + 1}.${i + 1}` === checkedType }]"
                                            :data-index="`${index + 1}.${i + 1}`" v-for="(item, i) in typeItem.children"
                                            :key="i">{{ item.label
                                            }}</div>
                                    </el-collapse-item>
                                </el-collapse>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
            </el-main>
        </el-container>
    </el-scrollbar>
    <el-dialog v-model="centerDialogVisible" title="分类管理" align-center :close-on-click-modal="false">
        <el-tree :allow-drop="allowDrop" :allow-drag="allowDrag" :data="typeList" accordion draggable node-key="tree"
            @node-drag-end="handleDragEnd" @node-drop="handleDrop" />
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="centerDialogVisible = false">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
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
    /* align-items: flex-start; */
    padding: 0 10px 10px;
    overflow: auto;
}

.content .table {
    display: flex;
    flex-direction: column;
    width: calc(100% - var(--type-width));
    height: 100%;
}

.content .table .table-main {
    flex: 1;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.content .table .pagination {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding: 0 10px;
    align-items: center;
    background-color: var(--el-fill-color-blank);
}

.content .table .pagination:deep(>span) {
    flex: 1;
}

.content .type-shell {
    --mLeft: 5px;
    display: flex;
    flex-direction: column;
    margin-left: var(--mLeft);
    width: calc(var(--type-width) - var(--mLeft));
}

.content .type-shell .tit {
    height: 55px;
    font-size: var(--el-font-size-medium);
    font-weight: bolder;
    color: var(--el-color-white);
    /* background-color: var(--el-color-primary); */
}

.content .type {
    background-color: var(--el-fill-color-blank);
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
    transition: all .3s;
}

.content .type .nochildren:deep(.el-collapse-item__arrow) {
    visibility: hidden;
}

.content .type .nochildren:deep(.el-collapse-item__wrap) {
    display: none;
}

.content .type .item:hover,
.content .type:deep(.el-collapse-item__header):hover {
    color: var(--el-color-primary);
}

.content .type:deep(.el-collapse .el-collapse-item__header) {
    padding-left: 15px;
    text-align: center;
    transition: all .3s;
}

.content .type:deep(.el-collapse .el-collapse-item__content) {
    padding-bottom: 0;
    text-align: center;
}

.content .type:deep(.el-collapse .el-collapse-item__content div) {
    border-color: #fff;
    background-color: #e2ecfe;
}

/* .content .type:deep(.el-collapse .el-collapse-item__content div):hover {
    background-color: #d2e4ee;
} */

.type .item.active,
.type .active:deep(.el-collapse-item__header) {
    font-weight: 600;
    color: var(--el-color-primary) !important;
    background-color: rgba(64, 158, 255, .1);
}

.type .el-collapse:deep(.el-collapse-item__content .active) {
    background-color: rgb(155 204 255 / 50%) !important;
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