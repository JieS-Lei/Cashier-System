<script setup>
import { apis } from '~/apis'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { handleGoodsTypeObj } from '~/utils'

import keyboardVue from '~/components/keyboard.vue'
import { watch } from 'vue';

const checkoutStore = useCheckoutStore()

// 搜索
const searchVal = ref('')
const showKeyboard = ref(false)

const initData = () => {
    page.current = 1
    load()
    goodsList.value = []
}

// 获取商品数据
const page = reactive({ // 分页参数
    current: 1, // 当前页
    pageSize: 20, // 一页的数据数量
    total: 0 // 总数
})
const loading = ref(false)
const goodsList = ref([])
const load = () => {
    loading.value = true
    let options = {
        page: page.current, // 页数
        listRows: page.pageSize, // 单页数据量
        search: searchVal.value, // 搜索
        category_id: typeId, // 分类id
    }
    apis.getGoods(options).then(([error, { data, code }]) => {
        if (error || 1 !== code) return loading.value = false
        page.total = +data.list.total || 0
        goodsList.value.push(...data.list.data)
        page.current++
        loading.value = false
    })
}
onMounted(() => load())
const handleGoodsClick = event => {
    let key = event.target.getAttribute('goodskey')
    if (!key) return
    let goods = goodsList.value[key]
    goods.num = 1 // 商品数量
    goods.oneDis = 100 // 单个物品折扣（百分比）
    checkoutStore.pushIntoOrder(goods)
}
const noMore = computed(() => (page.current - 1) * page.pageSize >= page.total)
const disabled = computed(() => loading.value || noMore.value)

// 分类数据
const hidden = ref(true)
const typeLoading = ref(true)
const typeList = ref([]) // 分类数据列表
const checkedType = ref(0) // 选中的分类 0:全部,-1:其他
// 展开的二级分类的 name 属性
const activeName = ref('')

// 二级分类点击
const childTypeClick = event => {
    let tag = event.target.getAttribute('data-index')
    if (undefined == tag) return
    checkedType.value = tag
}

// 请求商品类型数据
apis.getTypes().then(([error, { data, code }]) => {
    if (error || 1 !== code) return typeLoading.value = false
    if (null != data && 'object' === typeof data) typeList.value = handleGoodsTypeObj(data, 1)
    typeLoading.value = false
})

// 商品类型切换
let typeId = 0
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
    initData()
})

const keyClick = val => {
    let txt = searchVal.value
    if (val === 'X') return txt && (searchVal.value = txt.slice(0, txt.length - 1))
    searchVal.value += val
}

</script>
<template>
    <div class="selectGoods">
        <div class="search">
            <el-input class="search-input" v-model="searchVal" size="large" placeholder="商品名称/首字母/条码/扫码"
                @change="initData">
                <template #prefix>
                    <el-icon>
                        <epSearch />
                    </el-icon>
                </template>
            </el-input>
            <el-icon class="vKeyShowBtn" size="28" @click="showKeyboard = !showKeyboard">
                <epGrid />
            </el-icon>
        </div>
        <div class="vKeyboard" v-show="showKeyboard">
            <keyboardVue @keyClick="keyClick" />
            <el-button circle size="large" @click="initData">
                <template #icon>
                    <el-icon>
                        <epSearch />
                    </el-icon>
                </template>
            </el-button>
        </div>
        <div class="container" v-loading="loading">
            <el-empty v-if="!goodsList.length" description="暂无商品" />
            <ul v-else v-infinite-scroll="load" class="infinite-list" :infinite-scroll-disabled="disabled"
                @click="handleGoodsClick">
                <li v-for="(item, index) in goodsList" :key="item.goods_id" class="infinite-list-item">
                    <div class="item-main">
                        <div class="substitute" :goodskey="index"></div>
                        <div class="top">
                            <div class="img">
                                <el-avatar shape="square" :size="70" fit="cover" :src="item.goods_image" />
                                <div class="num">库存: {{ item.goods_sku.stock_num }}</div>
                            </div>
                            <div class="tit">
                                <span>{{ item.goods_name }}</span>
                            </div>
                        </div>
                        <div class="bottom">
                            <span class="price">￥{{ item.goods_sku.goods_price }}</span>
                        </div>
                    </div>
                </li>
                <div class="item-tip">
                    <el-divider v-if="loading">Loading...</el-divider>
                    <el-divider v-if="noMore">已经到底了</el-divider>
                </div>
            </ul>
            <el-scrollbar :class="['navTab', { hidden }]">
                <div class="type" v-loading="typeLoading">
                    <div :class="['item', { 'active': !checkedType }]" @click="checkedType = activeName = 0">全部分类
                    </div>
                    <el-collapse v-model="activeName" accordion @change="name => name && (checkedType = name)"
                        @click="childTypeClick">
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
                                :data-index="`${index + 1}.${i + 1}`" v-for="(item, i) in typeItem.children" :key="i">
                                {{ item.label }}
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
                <span class="arrowRight" @click="hidden = !hidden">
                    <i></i>
                    <i></i>
                </span>
            </el-scrollbar>
        </div>
    </div>
</template>
<style scoped>
@import url(~/assets/style/goodsTypes.css);

.selectGoods {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.search {
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-input {
    width: 350px;
    margin-right: 10px;
}

.vKeyShowBtn {
    --color: var(--el-text-color-regular);
    transition: color .2s;
}

.vKeyShowBtn:hover {
    --color: var(--el-text-color-placeholder);
    cursor: pointer;
}

.vKeyboard {
    display: flex;
    justify-content: center;
    align-items: center;
}

.vKeyboard>div {
    width: 550px;
    margin-right: 10px;
}

.container {
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: 10px 20px;
}

.infinite-list {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
    box-sizing: border-box;
}

.infinite-list .item-tip {
    flex-basis: 100%;
    margin: 8px 0 10px;
    display: flex;
    justify-content: center;
}

.infinite-list .item-tip>div {
    width: 30%;
}

.infinite-list .infinite-list-item {
    --gird: 8px;
    padding: var(--gird);
    width: 230px;
    margin-left: calc(-1 * var(--gird));
    margin-top: calc(-1 * var(--gird));
}

.item-main {
    position: relative;
    padding: 5px;
    background-color: var(--el-bg-color-page);
}

.item-main .substitute {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.item-main .tit {
    flex: 1;
    margin-left: 5px;

}

.item-main .tit span {
    font-size: 16px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}

.item-main .top {
    display: flex;
}

.item-main .top .img {
    position: relative;
}

.item-main .top .img .num {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 2px 0;
    width: 100%;
    font-size: 12px;
    text-align: center;
    color: #fff;
    background-color: rgba(22, 22, 22, 0.5);
}

.item-main .bottom {
    padding: 5px;
    text-align: right;
}

.navTab {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translate(0, -50%);
    width: 100px;
    height: 90%;
    box-shadow: 0 0 8px var(--el-color-info-light-7);
    background: #fff;
    overflow: visible;
    z-index: 1;
    transition: transform .2s;
}

.navTab.hidden {
    transform: translate(calc(100% + 8px), -50%);
}

.navTab.hidden .arrowRight i {
    transform-origin: 0;
}

.navTab .tit {
    height: 55px;
    font-size: var(--el-font-size-medium);
    font-weight: bolder;
    color: var(--el-color-white);
}

.navTab .arrowRight {
    position: absolute;
    top: 50%;
    left: -15px;
    transform: translateY(-50%);
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
    width: 15px;
    height: 35px;
    color: #fff;
    background-color: #fff;
    box-shadow: 0 0 8px var(--el-color-info-light-7);
    z-index: -1;
    cursor: pointer;
    overflow: hidden;
    box-sizing: border-box;
}

.navTab .arrowRight i {
    position: absolute;
    top: 50%;
    left: 5px;
    margin-top: -1px;
    display: block;
    width: 8px;
    height: 2px;
    background-color: var(--el-color-info);
    transform-origin: 100%;
    transition: all .3s .1s;
}

.navTab .arrowRight:hover i {
    background-color: var(--el-color-primary);
}

.navTab .arrowRight i:first-child {
    transform: rotate(45deg);
}

.navTab .arrowRight i:last-child {
    transform: rotate(-45deg);
}
</style>