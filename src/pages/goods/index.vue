<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { debounce } from '~/utils'
import { useGoodsTypeStore } from '~/store/modules/goodsTypeStore'

// 组件
import addGoodsVue from '../../components/addGoods.vue';
import reviseTypeVue from '../../components/reviseType.vue';
import setUnitVue from '../../components/setUnit.vue';

const router = useRouter()

const goodsTypeStore = useGoodsTypeStore()

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

// 新增商品对话框显隐
const addGoodsVisible = ref(false)

// 选择的时间
const date = ref('')
// 时间快捷选择选项
const shortcuts = [{
    text: '最近一周',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [start, end]
    },
}, {
    text: '最近一月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
    },
}, {
    text: '最近三个月',
    value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [start, end]
    },
}]

// 删除商品
const deleteType = ref('')
const deleteChange = async type => {
    deleteType.value = ''
    if ('deleteChecked' === type) {
        // 删除选中
        if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', grouping: true })
        ElMessageBox({
            message: '是否删除选中商品',
            title: '提示',
            confirmButtonText: '删除',
            type: 'warning',
            draggable: true,
            beforeClose: async (action, instance, done) => {
                if (action !== 'confirm') return done()
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '删除中'
                let goodIds = multipleSelection.value.map(item => item.goods_id)
                let [error, { code }] = await await apis.deleteGoodsToId({ goodsId: goodIds.join() })
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '删除'
                if (error || 1 !== code) return ElMessage('删除失败')
                getGoodsList()
                done()
            }
        })
            .then(() => ElMessage.success('删除成功'))
            .catch(() => false)
    } else if ('typeDelete' === type) {
        // 按类型删除
        // deleteGoodsToTypeId
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
        category_id: typeId
    }
    // 时间
    if (Array.isArray(date.value)) {
        options['start_time'] = date.value[0].getTime()
        options['end_time'] = date.value[1].getTime()
    }
    // console.log(options);
    let [error, { data, code }] = await apis.getGoods(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +data.list.total
    tableData.value = data.list.data
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
const reviseTypeVisible = ref(false)
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
    if (!currentPage.value - 1) getGoodsList()
    else currentPage.value = 1

})

// 处理商品类型数据
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
            } else if (alias <= 1) obj['children'] = []
            result.push(obj)
        }
    }
    return result
}

// 请求商品类型数据
const getTypeList = async () => {
    typeLoading.value = true
    let [error, { data, code }] = await apis.getTypes()
    if (error || 1 !== code) return loading.value = false
    if (null != data && 'object' === typeof data) typeList.value = handleObj(data, 1)
    goodsTypeStore.setList(typeList.value) //pinia
    typeLoading.value = false
}
getTypeList()

// 是否通过新增商品打开的分类列表
let isAddGoodsVueOpenType = false
// 关闭分类
const itemType = ref({})
const reviseTypeDone = typeObj => {
    reviseTypeVisible.value = false
    if (isAddGoodsVueOpenType) {
        itemType.value = typeObj ?? (itemType.value.id ? itemType.value : {})
        isAddGoodsVueOpenType = false
    }
}

// 单位管理对话框显隐
const setUnitVisible = ref(false)
const unitItem = ref({})

// 新增商品完成
const addGoodsEnd = () => {
    addGoodsVisible.value = false
    itemType.value = {} // 初始化分类
    getGoodsList() // 刷新数据
}
</script>
<template>
    <el-scrollbar>
        <el-container class="container" style="width: 100vw;">
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
                                end-placeholder="结束日期" size="large" @change="getGoodsList" />
                        </div>
                    </div>
                    <div class="right">
                        <el-button class="addBtn radius" plain size="large">导入商品</el-button>
                        <el-button class="addBtn radius" type="primary" size="large" @click="addGoodsVisible = true">
                            新增商品 </el-button>
                    </div>
                </div>
                <div div class=" btns radius">
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
                    <el-button class="radius" plain size="large" disabled>设置库存上/下限</el-button>
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
                            <el-table-column prop="category_name" label="分类" show-overflow-tooltip align="center" />
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
                            @click="reviseTypeVisible = true">编辑分类</el-button>
                        <el-scrollbar>
                            <div class="type">
                                <div :class="['item', { 'active': !checkedType }]"
                                    @click="checkedType = activeName = 0">全部分类</div>
                                <!-- <div :class="['item', { 'active': -1 === checkedType }]"
                                    @click="checkedType = activeName = -1">其他分类
                                </div> -->
                                <el-collapse v-model="activeName" accordion
                                    @change="name => name && (checkedType = name)" @click="childTypeClick">
                                    <el-collapse-item
                                        :class="{ 'nochildren': !typeItem.children?.length, 'active': (index + 1) === parseInt(checkedType) }"
                                        :name="index + 1" v-for="(typeItem, index) in typeList" :key="typeItem.id">
                                        <template #title>
                                            <el-tooltip :disabled="typeItem.label.length <= 4" effect="dark"
                                                :content="typeItem.label" placement="left">
                                                <span class="overflow">{{ typeItem.label }}</span>
                                            </el-tooltip>
                                        </template>
                                        <div :class="['item', { 'active': `${index + 1}.${i + 1}` === checkedType }]"
                                            :data-index="`${index + 1}.${i + 1}`" v-for="(item, i) in typeItem.children"
                                            :key="i">
                                            {{ item.label }}
                                        </div>
                                    </el-collapse-item>
                                </el-collapse>
                            </div>
                        </el-scrollbar>
                    </div>
                </div>
            </el-main>
        </el-container>
    </el-scrollbar>
    <!-- 新增商品 -->
    <addGoodsVue :show="addGoodsVisible" :unitItem="unitItem" :itemType="itemType" @done="addGoodsVisible = false"
        @typeClick="isAddGoodsVueOpenType = reviseTypeVisible = true" @unitClick="setUnitVisible = true"
        @addEnd="addGoodsEnd" />
    <!-- 修改分类 -->
    <reviseTypeVue :show="reviseTypeVisible" @updataList="getTypeList" @done="reviseTypeDone" />
    <!-- 单位管理 -->
    <setUnitVue :show="setUnitVisible" @checked="row => unitItem = row" @done="setUnitVisible = false"></setUnitVue>
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

.type .overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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