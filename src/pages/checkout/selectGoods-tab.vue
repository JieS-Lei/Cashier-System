<script setup>
import { apis } from '~/apis'
import { useCheckoutStore } from '~/store/modules/checkoutStore'

import keyboardVue from '~/components/keyboard.vue'

const checkoutStore = useCheckoutStore()

const searchVal = ref('')
const showKeyboard = ref(false)

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
        // category_id: typeId, // 分类id
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
    goodsList.value[key].num = 1
    checkoutStore.pushIntoOrder(goodsList.value[key])
}
const noMore = computed(() => (page.current - 1) * page.pageSize >= page.total)
const disabled = computed(() => loading.value || noMore.value)
</script>
<template>
    <div class="selectGoods">
        <div class="search">
            <el-input class="search-input" v-model="searchVal" size="large" placeholder="商品名称/首字母/条码/扫码">
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
            <keyboardVue />
        </div>
        <div class="container">
            <!-- v-infinite-scroll="load" -->
            <el-empty v-if="!goodsList.length" description="暂无商品" />
            <ul v-else v-infinite-scroll="load" class="infinite-list" :infinite-scroll-disabled="disabled"
                v-loading="loading" @click="handleGoodsClick">
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
                <el-divider class="item-tip" v-if="loading">Loading...</el-divider>
                <el-divider class="item-tip" v-if="noMore">已经到底了</el-divider>
            </ul>
        </div>
    </div>
</template>
<style scoped>
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
    margin: 0 auto;
    width: 550px;
}

.container {
    flex: 1;
    overflow: hidden;
}



.infinite-list {
    padding: 10px 20px;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
    box-sizing: border-box;
}

.infinite-list .item-tip {
    flex-basis: 100%;
    margin: 8px 0 10px;
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
</style>