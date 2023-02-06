<script setup>
import { ref } from 'vue';
import { apis } from '~/apis'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceBlurFormatter } from '~/utils'
import { storeToRefs } from 'pinia'

const checkoutStore = useCheckoutStore()
const { checkedDiscount, onlyOneDiscount, notSmaCha } = storeToRefs(checkoutStore)

const loading = ref(true)
const disData = reactive({
    discounts: {}, // 折扣配置
    reduces: {}, // 减少金额配置
    notSmaCha: {} // 抹零配置
})
apis.getCheckoutDiscount().then(([error, { code, data }]) => {
    if (error || code !== 1 || !Array.isArray(data)) return loading.value = false
    data.forEach(item => item.val = JSON.parse(item.val))
    disData.discounts = data[0]
    disData.reduces = data[1]
    disData.notSmaCha = data[2]
    loading.value = false
})

const onChange = (key, val) => {
    if (onlyOneDiscount.value) checkedDiscount.value.clear()
    checkedDiscount.value.set(key, val)
}
</script>
<template>
    <div class="main-content" v-loading="loading">
        <h4 class="tit">整单折扣<span></span></h4>
        <div class="dis">
            <el-tag v-for="(tag, tagKey) in disData.discounts.val" :key="tagKey" size="large" type="danger"
                @click="onChange('discount', tag)">
                {{ tag }}折
            </el-tag>
            <el-tag effect="plain" size="large" type="danger">自定义折扣</el-tag>
        </div>
        <h4 class="tit">整单减价<span></span></h4>
        <div class="dis">
            <el-tag v-for="(tag, tagKey) in disData.reduces.val" :key="tagKey" size="large" type="warning"
                @click="onChange('reduce', priceBlurFormatter(tag))">
                {{ priceBlurFormatter(tag) }}元
            </el-tag>
            <el-tag effect="plain" size="large" type="warning">自定义减价</el-tag>
        </div>
        <h4 class="tit">抹零方式</h4>
        <div class="dis">
            <el-check-tag v-for="(tag, tagKey) in disData.notSmaCha.val" :key="tagKey" :checked="notSmaCha == +tagKey"
                size="large" @change="notSmaCha = +tagKey">
                {{ tag }}
            </el-check-tag>
        </div>
    </div>
</template>
<style scoped>
.main-content {
    padding: 8px 20px;
    height: 100%;
}

.tit {
    margin-top: 15px;
    padding: 10px 0;
    font-size: 15px;
    font-weight: bolder;
    color: var(--el-text-color-regular);
}

.tit:first-child {
    margin-top: 0;
}

.dis .el-tag {
    width: 90px;
    height: auto;
    padding: 12px 0;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
}


.dis .el-tag:active {
    opacity: .7;
}

.dis .el-check-tag {
    padding: 12px 10px;
    min-width: 80px;
    max-width: 120px;
    text-align: center;
    box-sizing: border-box;
}

.dis .el-tag+.el-tag,
.dis .el-check-tag+.el-check-tag {
    margin-left: 2.13%;
}
</style>