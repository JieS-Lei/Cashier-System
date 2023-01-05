<script setup>
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

const search = ref('') // 搜索内容
const searchFn = () => console.log(search.value)

const birthdayOptions = [{
    value: '0',
    label: '全部',
}, {
    value: '1',
    label: '本月',
}, {
    value: '2',
    label: '本日',
}]
const birthdayVal = ref('')
const statusOption = [{
    value: '0',
    label: '全部',
}, {
    value: '1',
    label: '已激活',
}, {
    value: '2',
    label: '未激活',
}]
const statusVal = ref('1')


const loading = ref(false) // 列表加载
const multipleTableRef = ref() // 表格实例
const userList = ref([]) // 列表数据
const selectionDatas = ref([]) // 表格选中数据
const currentPage = ref(1) // 当前页数
const page = reactive({ // 分页参数
    pageSize: 10, // 一页的数据数量
    total: 0 // 总数
})
// 页数改变 重新获取数据
watch(currentPage, () => getVipList())
/* Start - 动态计算列表数据容量，设置pageSize */
let _clientHeight = 0, remainder = 0 // 初始高度 | 空余高度
const getPageSize = async el => {
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
    return isNaN(showNum) ? 10 : showNum
}
onMounted(async () => {
    let el = multipleTableRef.value?.$el
    if (el) page.pageSize = await getPageSize(el)
    _clientHeight = document.body.clientHeight
    window.onresize = debounce(async function () {
        if (page.total <= page.pageSize) return
        let clientHeight = document.body.clientHeight
        if (clientHeight - _clientHeight + remainder < 48) return
        _clientHeight = clientHeight
        page.pageSize = await getPageSize(el)
        getVipList()
    }, 1000)
    getVipList()
})
/* End - 动态计算列表数据容量，设置pageSize */

// 获取列表数据 
const getVipList = async () => {
    loading.value = true
    let options = {
        page: currentPage.value,
        listRows: page.pageSize,
        search: search.value,
    }
    // console.log(options);
    let [error, { data, code }] = await apis.getVips(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +data.list.total || 0
    userList.value = data.list.data
    loading.value = false
}
// 替换空数据
const replace = (row, column, cellValue, index) => {
    return +cellValue || '-'
}

const rowClick = (row) => console.log(row)



</script>
<template>
    <el-scrollbar>
        <el-container class="container" style="width: 100vw;">
            <el-header class="header">
                <div class="box">
                    <el-button size="large" text @click="back">
                        <el-icon>
                            <epArrowLeftBold />
                        </el-icon>
                        返回 [ESC]
                    </el-button>
                </div>
                <span class="title">会员管理</span>
                <div class="box herder-right">
                    <el-button class="radius" plain size="large">会员设置</el-button>
                </div>
            </el-header>
            <el-main class="main">
                <div class="top">
                    <div class="left">
                        <el-input v-model="search" class="large search radius" placeholder="请输入姓名/手机号/刷卡" clearable
                            @change="searchFn" />
                        <el-select v-model="birthdayVal" class="large radius select" placeholder="生日设置" size="large">
                            <el-option v-for="item in birthdayOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-select v-model="statusVal" class="large radius select" placeholder="会员状态" size="large">
                            <el-option v-for="item in statusOption" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <div class="discount">
                            <el-button class="radius discount-btn" plain size="large">批量修改折扣</el-button>
                        </div>
                    </div>
                    <div class="right">
                        <el-button class="addBtn radius" plain size="large" disabled>批量导入</el-button>
                        <el-button class="addBtn radius" type="primary" size="large"
                            @click="addGoodsVisible = true">新增会员</el-button>
                    </div>
                </div>
                <div class="content">
                    <div class="table" v-loading="loading" element-loading-text="Loading...">
                        <el-table class="table-main" ref="multipleTableRef" :data="userList" stripe size="large"
                            @selection-change="val => selectionDatas = val" @row-click="rowClick">
                            <el-table-column type="selection" width="55" />
                            <el-table-column prop="nickName" label="姓名" min-width="160" show-overflow-tooltip
                                :formatter="replace" />
                            <el-table-column prop="mobile" label="手机号" show-overflow-tooltip align="center"
                                :formatter="replace" />
                            <el-table-column prop="" label="生日" width="120" align="center" />
                            <el-table-column prop="" label="折扣" align="center" />
                            <el-table-column prop="balance" label="储值余额" min-width="100" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="points" label="会员积分" min-width="100" show-overflow-tooltip
                                align="center" />
                            <el-table-column prop="create_time" label="注册时间" width="120" align="center"
                                :formatter="(row, column, cellValue) => cellValue.split(' ')[0] || '-'" />
                            <el-table-column prop="vip" label="会员状态" width="100" align="center"
                                :formatter="(row, column, cellValue) => `${+cellValue ? '已' : '未'}激活`" />
                        </el-table>
                        <el-pagination class="pagination" v-model:current-page="currentPage" :total="page.total"
                            :page-size="page.pageSize" layout="total, prev, pager, next" hide-on-single-page />
                    </div>
                </div>
            </el-main>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.herder-right {
    text-align: right;
    padding-right: 12px;
}

.select {
    width: 130px;
    height: 100%;
}

.select:deep(div) {
    height: 100%;
    box-sizing: border-box;
}

.select:deep(input) {
    padding: 0 5px;
}

.discount {
    display: inline-block;
    width: 120px;
    height: 100%;
}

.discount-btn {
    width: 100%;
    height: 100%;
    font-size: 15px;
}

.discount-btn:hover {
    color: var(--el-button-text-color);
    border-color: var(--el-border-color-hover);
}

.discount-btn:focus {
    color: var(--el-button-text-color);
    border-color: var(--el-button-hover-border-color);
}

.discount-btn:active {
    color: var(--el-button-active-text-color);
    background-color: var(--el-color-primary-light-9);
}
</style>