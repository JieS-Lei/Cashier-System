<script setup>
import { apis } from '~/apis'

import keyboardVue from '~/components/keyboard.vue'

const searchVal = ref('')
const showKeyboard = ref(false)

// 获取商品数据
const page = reactive({ // 分页参数
    current: 1, // 当前页
    pageSize: 10, // 一页的数据数量
    total: 0 // 总数
})
const loading = ref(false)
const goodsList = ref([])
const load = async () => {
    loading.value = true
    let options = {
        page: page.current, // 页数
        listRows: page.pageSize, // 单页数据量
        search: searchVal.value, // 搜索
        // category_id: typeId, // 分类id
    }
    // console.log(options);
    let [error, { data, code }] = await apis.getGoods(options)
    if (error || 1 !== code) return loading.value = false
    page.total = +data.list.total || 0
    goodsList.value = data.list.data
    loading.value = false
}
load()
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
        <el-scrollbar class="container" v-loading="loading">
            <ul v-if="goodsList.length" v-infinite-scroll="load" class="infinite-list" style="overflow: auto">
                <li v-for="item in goodsList" :key="item.id" class="infinite-list-item">

                </li>
            </ul>
            <el-empty v-else description="暂无商品" />
        </el-scrollbar>
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
    margin-top: 20px;
}
</style>