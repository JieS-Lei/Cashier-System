<script setup>
import { ref } from 'vue';
import { apis } from '~/apis'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceBlurFormatter } from '~/utils'
import { storeToRefs } from 'pinia'

import keyboardVue from '~/components/keyboard.vue'

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

// 作用选中的折扣
const onChange = (key, val) => {
    if (onlyOneDiscount.value) checkedDiscount.value.clear()
    checkedDiscount.value.set(key, val)
}

// 自定义折扣对话框
const dialogType = ref(1)
const dialogVisible = computed({
    get: () => !!dialogType.value,
    set: () => dialogType.value = 0
})
const vInpContent = ref('')
const keyClick = val => {
    let txt = vInpContent.value
    if (val === 'X') return txt && (vInpContent.value = txt.slice(0, txt.length - 1))
    if (val === '.') {
        if (!txt) return vInpContent.value = '0.'
        if (/\./.test(txt)) return
        return vInpContent.value += '.'
    }
    if (txt === '0') vInpContent.value = ''
    let [$1, $2] = txt.split('.')
    if (dialogType.value === 1) {
        console.log('string' === typeof $2 && $2);
        if ($2 == null && $1) return vInpContent.value = val
        if ('string' === typeof $2 && $2) return vInpContent.value = txt.slice(0, txt.indexOf('.') + 1) + val
    }
    if (dialogType.value === 2) {
        if ($2 == null && $1.length >= 5) return vInpContent.value = '99999.99'
        if ('string' === typeof $2 && $2.length >= 2) return
    }
    vInpContent.value += val
}
const diyDisSubmit = (dType, val) => {
    dialogVisible.value = false
    if (!(val = +val)) return
    onChange(dType === 1 ? 'discount' : 'reduce', val)
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
            <el-tag effect="plain" size="large" type="danger" @click="dialogType = 1">自定义折扣</el-tag>
        </div>
        <h4 class="tit">整单减价<span></span></h4>
        <div class="dis">
            <el-tag v-for="(tag, tagKey) in disData.reduces.val" :key="tagKey" size="large" type="warning"
                @click="onChange('reduce', priceBlurFormatter(tag))">
                {{ priceBlurFormatter(tag) }}元
            </el-tag>
            <el-tag effect="plain" size="large" type="warning" @click="dialogType = 2">自定义减价</el-tag>
        </div>
        <h4 class="tit">抹零方式</h4>
        <div class="dis">
            <el-check-tag v-for="(tag, tagKey) in disData.notSmaCha.val" :key="tagKey" :checked="notSmaCha == +tagKey"
                size="large" @change="notSmaCha = +tagKey">
                {{ tag }}
            </el-check-tag>
        </div>
        <el-dialog v-model="dialogVisible" :title="dialogType - 1 ? '自定义减价' : '自定义折扣'" width="40%"
            @close="vInpContent = ''">
            <div class="vInput">
                <span v-show="!vInpContent" class="placeholder">请输入{{ dialogType - 1 ? '金额' : '折扣' }}</span>
                <span v-show="vInpContent" class="i-content">{{ vInpContent }}</span>
                <span class="placeholder">{{ dialogType - 1 ? '元' : '折' }}</span>
            </div>
            <keyboardVue @keyClick="keyClick" />
            <template #footer>
                <el-button class="i-btn" type="primary" size="large" auto-insert-space
                    @click="diyDisSubmit(dialogType, vInpContent)">
                    添加
                </el-button>
            </template>
        </el-dialog>
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

.vInput {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px;
    font-size: 16px;
    font-weight: bold;
    background-color: var(--el-color-info-light-9);
}

.vInput .placeholder {
    color: var(--el-text-color-placeholder);
}

.vInput .i-content {
    font-size: 20px;
    line-height: 1;
    color: var(--el-text-color-regular);
}

.i-btn {
    --el-button-size: 50px;
    width: 100%;
    font-size: 16px;
    font-weight: bold;
}

:deep(.el-dialog__body) {
    padding: 10px var(--el-dialog-padding-primary);
}

:deep(.el-dialog__header span) {
    font-weight: bold;
    color: var(--el-text-color-regular);
}
</style>