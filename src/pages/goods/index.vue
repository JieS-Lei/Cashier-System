<script setup>
import { useRouter } from 'vue-router'
import { apis } from '~/apis'
import { useGoodsStore } from '~/store/modules/goodsStore'
import { debounce, priceChangeFormatter as priceFormatter, priceBlurFormatter, handleGoodsTypeObj } from '~/utils'

// 组件
import addGoodsVue from './addGoods.vue';
import reviseTypeVue from '../../components/reviseType.vue';
import setUnitVue from './setUnit.vue';
import delGoodsToTypeVue from '../../components/delGoodsToType.vue';
import { ElMessage } from 'element-plus';

const router = useRouter()
const goodsStore = useGoodsStore()

const checkeds = reactive({
    checked1: false, // 1，3销售
    checked2: false, // 2，4库存
    checked3: false,
    checked4: false
})
watch(checkeds, () => getGoodsList())

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
const delGoodsToTypeVisible = ref(false)
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
                let goodIds = multipleSelection.value.map(item => item.goods_id)
                if (!goodIds.length) {
                    ElMessage('未选中商品')
                    instance.action = 'close'
                    return done()
                }
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '删除中'
                let [error, { code }] = await apis.deleteGoodsById(goodIds.join())
                instance.confirmButtonLoading = false
                instance.confirmButtonText = '删除'
                if (error || 1 !== code) {
                    ElMessage('删除失败')
                    instance.action = 'close'
                } else getGoodsList()
                done()
            }
        })
            .then(() => ElMessage.success('删除成功'))
            .catch(() => false)
    } else if ('typeDelete' === type) delGoodsToTypeVisible.value = true
}

const sort = ref('timeDesc')
const sortChange = changeVal => getGoodsList()

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

// 页数改变 重新获取数据
watch(currentPage, () => getGoodsList())

// 获取表格数据方法
const getGoodsList = async () => {
    loading.value = true
    if (reviseTypeVisible.value) reviseTypeVisible.value = false
    if (setUnitVisible.value) setUnitVisible.value = false
    if (dialogPriceVisible.value) dialogPriceVisible.value = false
    let options = {
        page: currentPage.value,
        listRows: page.pageSize,
        search: search.value,
        category_id: typeId,
        sortType: sort.value,
        show_sale: +checkeds.checked1 || checkeds.checked3 * 2 || 0, // 销售
        show_stock: +checkeds.checked2 || checkeds.checked4 * 2 || 0 // 库存
    }
    // 时间
    if (Array.isArray(date.value)) {
        options['start_time'] = date.value[0].getTime()
        options['end_time'] = date.value[1].getTime()
    }
    // console.log(options);
    let [error, { data, code }] = await apis.getGoods(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +data.list.total || 0
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
onBeforeUnmount(() => window.onresize = null)

const searchFn = () => getGoodsList()

// 表中单行数据被点击
const rowClick = row => {
    goodsStore.rowForm = row
    addGoodsVisible.value = true
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
let isSetType = false
const setTypeFn = () => {
    if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', showClose: true, grouping: true })
    isSetType = true
    reviseTypeVisible.value = true
}
// 监听商品类型选中
watch(() => goodsStore.checkedType, async newVal => {
    if (!isSetType) return
    if (newVal.id) {
        let [error, { code }] = await apis.batchReviseGoodsInfo({
            category_id: newVal.id,
            goodsId: multipleSelection.value.map(item => item.goods_id).join()
        })
        if (error || 1 !== code) return ElMessage('修改失败')
        ElMessage.success('修改成功')
        goodsStore.clearChecked('Type') // 清空选中的type
        getGoodsList()
    }
    isSetType = false
})

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

// 请求商品类型数据
const getTypeList = async () => {
    typeLoading.value = true
    let [error, { data, code }] = await apis.getTypes()
    if (error || 1 !== code) return typeLoading.value = false
    if (null != data && 'object' === typeof data) typeList.value = handleGoodsTypeObj(data, 1)
    goodsStore.setTypeList(typeList.value) //pinia
    typeLoading.value = false
}
getTypeList()

// 单位管理对话框显隐
const setUnitVisible = ref(false)
let isSetUnit = false
const setUnitFn = () => {
    if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', showClose: true, grouping: true })
    isSetUnit = true
    setUnitVisible.value = true
}
// 监听商品单位选中
watch(() => goodsStore.checkedUnit, async newVal => {
    if (!isSetUnit) return
    if (newVal.unit_id) {
        let [error, { code }] = await apis.batchReviseGoodsInfo({
            goods_unit: newVal.unit_id,
            goodsId: multipleSelection.value.map(item => item.goods_id).join()
        })
        if (error || 1 !== code) return ElMessage('修改失败')
        ElMessage.success('修改成功')
        goodsStore.clearChecked('Unit') // 清空选中的unit
        getGoodsList()
    }
    isSetType = false
})

// 批量价格修改
const priceFormEl = ref()
const dialogPriceVisible = ref(false)
const priceForm = reactive({
    type: '',
    mode: '',
    money: ''
})
const priceRules = reactive({
    type: [{ required: true, message: '请选择价格类型', trigger: 'change' }],
    mode: [{ required: true, message: '请选择调价方式', trigger: 'change' }],
    money: [{ required: true, message: '请输入修改金额', trigger: 'blur' }]
})
const describePriceMode = computed(() => {
    switch (priceForm.mode) {
        case '2': return '原价格加固定金额'
        case '3': return '原价格减固定金额'
        case '4': return '原价格上浮固定百分比'
        case '5': return '原价格下浮固定百分比'
        default: return ''
    }
})
const setPriceFn = () => {
    if (!multipleSelection.value.length) return ElMessage.warning({ message: '您未选择任何商品', showClose: true, grouping: true })
    dialogPriceVisible.value = true
}
const updataPriceFn = async (priceFormEl) => {
    if (!priceFormEl) return
    await priceFormEl.validate(async (valid, fields) => {
        if (valid) {
            if (priceForm.mode == 4 || priceForm.mode == 5) priceForm.money /= 100
            let options = {
                price_type: priceForm.mode,
                [priceForm.type]: priceForm.money,
                goodsId: multipleSelection.value.map(item => item.goods_id).join()
            }
            let [error, { code }] = await apis.batchReviseGoodsInfo(options)
            if (error || 1 !== code) return ElMessage('修改失败')
            ElMessage.success('修改成功')
            dialogPriceVisible.value = false
            priceFormEl.resetFields()
            getGoodsList()
        } else console.warn('error submit!', fields)
    })
}

const autoBCardLoading = ref(false)
const autoBCardFn = async () => {
    autoBCardLoading.value = true
    let [error, { code }] = await apis.autoCreateBarCode()
    if (error || 1 != code) return ElMessage('条码创建失败')
    getGoodsList()
    autoBCardLoading.value = false
}

</script>
<template>
    <el-scrollbar>
        <el-container class="container" style="width: 100vw;">
            <el-header class="header">
                <div class="box">
                    <el-button size="large" text @click="router.back()">
                        <el-icon>
                            <epArrowLeftBold />
                        </el-icon>
                        返回 [ESC]
                    </el-button>
                </div>
                <span class="title">商品管理</span>
                <div class="box"></div>
            </el-header>
            <el-main class="main pageBgColor">
                <div class="top">
                    <div class="left">
                        <el-input v-model="search" class="large search radius" placeholder="商品名称/条码/首字母/扫码" clearable
                            @change="searchFn" />
                        <el-select class="select large radius" placeholder="显示设置">
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked1" :disabled="checkeds.checked3" label="隐藏未销售"
                                    size="large" @click.stop />
                            </el-option>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked2" :disabled="checkeds.checked4" label="隐藏零库存"
                                    size="large" @click.stop />
                            </el-option>
                            <el-divider style="margin: 10px 20px; width: auto;"></el-divider>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked3" :disabled="checkeds.checked1" label="显示未销售"
                                    size="large" @click.stop />
                            </el-option>
                            <el-option class="sel-checkbox" value="">
                                <el-checkbox v-model="checkeds.checked4" :disabled="checkeds.checked2" label="显示零库存"
                                    size="large" @click.stop />
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
                        <el-button class="addBtn radius" plain size="large" disabled>导入商品</el-button>
                        <el-button class="addBtn radius" type="primary" size="large"
                            @click="addGoodsVisible = true">新增商品</el-button>
                    </div>
                </div>
                <div div class=" btns radius">
                    <el-select v-model="deleteType" class="select" placeholder="批量删除" size="large"
                        @change="deleteChange">
                        <el-option label="删除已选商品" value="deleteChecked" />
                        <el-option label="按分类删除商品" value="typeDelete" />
                    </el-select>
                    <el-button class="radius" plain size="large" :loading="autoBCardLoading"
                        @click="autoBCardFn">自动生成条码</el-button>
                    <el-button class="radius" plain size="large" disabled>打印条码</el-button>
                    <el-button class="radius" plain size="large" disabled>打印标价签</el-button>
                    <el-button class="radius" plain size="large" @click="setTypeFn">设置分类</el-button>
                    <el-button class="radius" plain size="large" @click="setUnitFn">设置单位</el-button>
                    <el-button class="radius" plain size="large" @click="setPriceFn">批量改价</el-button>
                    <el-button class="radius" plain size="large" disabled>设置库存上/下限</el-button>
                    <el-select v-model="sort" class="sort" placeholder="排序方式" size="large" @change="sortChange">
                        <el-option label="最新创建" value="timeDesc" aria-checked />
                        <el-option label="首字母升序" value="charAsc" />
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
                            <el-table-column prop="goods_sku.goods_unit_name" label="单位" width="100" align="center"
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
    <!-- 批量修改价格 -->
    <el-dialog class="re-price" v-model="dialogPriceVisible" title="批量修改价格" width="400" draggable
        @close="priceFormEl?.resetFields()">
        <el-form ref="priceFormEl" :model="priceForm" :rules="priceRules">
            <el-form-item label="价格类型" label-width="80" prop="type">
                <el-select v-model="priceForm.type" placeholder="请选择价格类型" style="width:100%;">
                    <el-option label=" 售价" value="goods_price" />
                    <el-option label="会员价" value="goods_vip_price" />
                    <el-option label="进价" value="goods_cost_price" />
                </el-select>
            </el-form-item>
            <el-form-item label="调价方式" label-width="80" prop="mode">
                <el-select v-model="priceForm.mode" placeholder="请选择调价方式" style="width:100%;">
                    <el-option label="直接设定" value="1" />
                    <el-option label="加价" value="2" />
                    <el-option label="减价" value="3" />
                    <el-option label="原价上浮" value="4" />
                    <el-option label="原价下浮" value="5" />
                </el-select>
            </el-form-item>
            <el-form-item label="价格" label-width="80" prop="money">
                <el-input v-model="priceForm.money" autocomplete="off" :formatter="priceFormatter"
                    @blur="priceForm.money = priceBlurFormatter(priceForm.money)" onfocus="this.select()">
                    <template #prefix><span v-show="priceForm.mode <= 3">￥</span></template>
                    <template #suffix><span v-show="priceForm.mode > 3">%</span></template>
                </el-input>
            </el-form-item>
        </el-form>
        <div class="describe">{{ describePriceMode }}</div>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" size="large" @click="updataPriceFn(priceFormEl)"
                    style="width:100%;">确定</el-button>
            </div>
        </template>
    </el-dialog>
    <!-- 新增商品 -->
    <addGoodsVue :show="addGoodsVisible" @done="addGoodsVisible = false" @typeClick="reviseTypeVisible = true"
        @unitClick="setUnitVisible = true" @updata="getGoodsList" />
    <!-- 修改分类 -->
    <reviseTypeVue :show="reviseTypeVisible" @updataList="getTypeList" @done="reviseTypeVisible = false" />
    <!-- 单位管理 -->
    <setUnitVue v-if="setUnitVisible" :show="setUnitVisible" @done="setUnitVisible = false" />
    <!-- 按分类删除商品 -->
    <delGoodsToTypeVue v-if="delGoodsToTypeVisible" :show="delGoodsToTypeVisible" @done="delGoodsToTypeVisible = false"
        @delGoods="getGoodsList" @delType="getTypeList" />

</template>
<style scoped>
@import url(~/assets/style/common.css);
@import url(~/assets/style/goodsTypes.css);

.main .top .select {
    width: 130px;
    height: 100%;
}

.main .top .select:deep(div) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.main .top .select:deep(input) {
    padding: 0 9px;
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
}

.content .table {
    width: calc(100% - var(--type-width));
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

.re-price .el-dialog__body {
    padding: 10px 30px 0;
}

.re-price .el-dialog__footer .dialog-footer {
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
}

.re-price .describe {
    height: 20px;
    line-height: 20px;
    text-align: right;
}
</style>