<script setup>
import { ref } from 'vue';
import { apis } from '~/apis'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceBlurFormatter } from '~/utils'
import { storeToRefs } from 'pinia'

import keyboardVue from '~/components/keyboard.vue'
import { ElMessage } from 'element-plus';

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

// 对话框显示类型 1自定义折扣，2编辑折扣
const dialogVisibleType = ref(0)
const vInputVals = reactive({
    '1': '',
    '2': '',
    '3': '',
    '4': '',
    content: ''
})

// 自定义 折扣|减价 对话框
const dialogType = ref(0)
const dialogVisible = computed({
    get: () => (dialogVisibleType.value === 1) && !!dialogType.value,
    set: () => dialogType.value = 0
})
const diyDisSubmit = (dType, val) => {
    dialogVisible.value = false
    if (!(val = +val)) return
    onChange(dType === 1 ? 'discount' : 'reduce', val)
}

// 编辑 折扣|减价
const editDialogVisible = computed({
    get: () => (dialogVisibleType.value === 2) && !!dialogType.value,
    set: () => dialogType.value = 0
})
const oneInputRef = []
const openEditDialog = eDType => {
    dialogType.value = eDType
    dialogVisibleType.value = 2
    Object.assign(vInputVals, disData[eDType - 1 ? 'reduces' : 'discounts'].val)
    setTimeout(() => nextTick(() => {
        oneInputRef[0].focus()
    }), 0)
}
let checkdeInpVal = ref(0) // 选中的输入框
let passClear = false // 虚拟键盘输入时是否先清空值

// 虚拟键盘输入
const keyClick = val => {
    let key = ''
    if (dialogVisibleType.value === 2) {
        key = checkdeInpVal.value
        if (!key) return
        if (passClear) {
            vInputVals[key] = ''
            passClear = false
        }
    } else key = 'content'
    let txt = vInputVals[key]
    if (val === 'X') return txt && (vInputVals[key] = txt.slice(0, txt.length - 1))
    if (val === '.') {
        if (!txt) return vInputVals[key] = '0.'
        if (/\./.test(txt)) return
        return vInputVals[key] += '.'
    }
    if (txt === '0') vInputVals[key] = ''
    let [$1, $2] = txt.split('.')
    if (dialogType.value === 1) {
        if ($2 == null && $1) return vInputVals[key] = val
        if ('string' === typeof $2 && $2) return vInputVals[key] = txt.slice(0, txt.indexOf('.') + 1) + val
    }
    if (dialogType.value === 2) {
        if ($2 == null && $1.length >= 5) return vInputVals[key] = '99999.99'
        if ('string' === typeof $2 && $2.length >= 2) return
    }
    vInputVals[key] += val
}
// 实体键盘输入格式化
const formatter = value => {
    value = value.replace(/[^\d\.]|^0(?=\d)|(?<=\.\d*)\./g, '') // 替换所有非数字 | 前置0 | 重复.
    if (dialogType.value === 1) value = value.replace(/(?<=^[^0])\d|(?<=\.\d{1}).*/g, '') // 限制格式为 \d.\d
    if (dialogType.value === 2) {
        value = value.replace(/(?<=\.\d{2}).*/g, '')
        if (100000 <= +value) value = '99999.99'
    }
    return value
}

// 更新 折扣|减价 配置
const updataDiscount = async () => {
    let obj = {}, dType = dialogType.value
    for (let index = 1; index <= 4; index++) obj[index] = vInputVals[index] = priceBlurFormatter(vInputVals[index], dType)
    let [error, { code }] = await apis.setCheckoutDiscount({
        param_id: dType,
        val: JSON.stringify(obj)
    })
    editDialogVisible.value = false
    if (error || 1 !== code) return ElMessage('保存失败')
    disData[dType === 1 ? 'discounts' : 'reduces'].val = obj
    ElMessage.success('保存成功')
}

// 编辑 折扣|减价 快捷键
const handelEditDialogKeyboard = event => {
    event.stopPropagation()
    if (event.key === 'Escape') return editDialogVisible.value = false
    if (event.key === 'Enter') return updataDiscount()
}
</script>
<template>
    <div class="main-content" v-loading="loading">
        <h4 class="tit">
            整单折扣
            <el-button type="primary" link @click="openEditDialog(1)">
                <el-icon size="16">
                    <epEdit />
                </el-icon>
                编辑
            </el-button>
        </h4>
        <div class="dis">
            <el-tag v-for="(tag, tagKey) in disData.discounts.val" :key="tagKey" size="large" type="danger"
                @click="onChange('discount', tag)">
                {{ tag }}折
            </el-tag>
            <el-tag effect="plain" size="large" type="danger" @click="dialogType = dialogVisibleType = 1">自定义折扣</el-tag>
        </div>
        <h4 class="tit">
            整单减价
            <el-button type="primary" link @click="openEditDialog(2)">
                <el-icon size="16">
                    <epEdit />
                </el-icon>
                编辑
            </el-button>
        </h4>
        <div class="dis">
            <el-tag v-for="(tag, tagKey) in disData.reduces.val" :key="tagKey" size="large" type="warning"
                @click="onChange('reduce', tag)">
                {{ priceBlurFormatter(tag) }}元
            </el-tag>
            <el-tag effect="plain" size="large" type="warning"
                @click="(dialogVisibleType = 1, dialogType = 2)">自定义减价</el-tag>
        </div>
        <h4 class="tit">抹零方式</h4>
        <div class="dis">
            <el-check-tag v-for="(tag, tagKey) in disData.notSmaCha.val" :key="tagKey" :checked="notSmaCha == +tagKey"
                size="large" @change="notSmaCha = +tagKey">
                {{ tag }}
            </el-check-tag>
        </div>
        <el-dialog v-model="dialogVisible" :title="dialogType - 1 ? '自定义减价' : '自定义折扣'" width="40%"
            @close="vInputVals.content = ''" :autofocus="false">
            <div class="vInput">
                <span v-show="!vInputVals.content" class="placeholder">请输入{{ dialogType - 1 ? '金额' : '折扣' }}</span>
                <span v-show="vInputVals.content" class="i-content">{{ vInputVals.content }}</span>
                <span class="placeholder">{{ dialogType - 1 ? '元' : '折' }}</span>
            </div>
            <keyboardVue @keyClick="keyClick" style="padding-top: 20px;" />
            <template #footer>
                <el-button class="i-btn" type="primary" size="large" auto-insert-space
                    @click="diyDisSubmit(dialogType, vInputVals.content)">
                    添加
                </el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="editDialogVisible" :title="dialogType - 1 ? '编辑减价' : '编辑折扣'" width="600px"
            @keyup="handelEditDialogKeyboard" :close-on-press-escape="false">
            <div class="editDialog-content">
                <div class="edit-inputs">
                    <el-input :class="{ 'isCheck': checkdeInpVal === i }" :ref="el => oneInputRef[i - 1] = el"
                        v-model="vInputVals[i]" v-for="i of 4" clearable onfocus="this.select()" :formatter="formatter"
                        @focus="passClear = !!(checkdeInpVal = i)"
                        @blur="vInputVals[i] = priceBlurFormatter(vInputVals[i], dialogType)">
                        <template #suffix><span>{{ dialogType - 1 ? '元' : '折'}}</span></template>
                    </el-input>
                </div>
                <div class="edit-key">
                    <keyboardVue @keyClick="keyClick" />
                </div>
            </div>
            <template #footer>
                <el-button size="large" @click="editDialogVisible = false">取消 [Esc]</el-button>
                <el-button type="primary" size="large" @click="updataDiscount">
                    保存 [Enter]
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
    line-height: 1;
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

.editDialog-content {
    display: flex;
}

.edit-inputs {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 130px;
    margin-right: 8px;
}

.edit-inputs .isCheck::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -10px;
    transform: translateY(-50%);
    display: block;
    border-radius: 50%;
    width: 5px;
    height: 5px;
    background-color: var(--el-text-color-disabled);
}

.edit-inputs:deep(.el-input__inner) {
    --el-input-inner-height: 20px;
}

.edit-inputs:deep(.el-input__suffix-inner) {
    min-width: 44px;
    justify-content: flex-start;
}

.edit-key {
    flex: 1;
}

:deep(.el-dialog__body) {
    padding: 10px var(--el-dialog-padding-primary);
}

:deep(.el-dialog__header span) {
    font-weight: bold;
    color: var(--el-text-color-regular);
}
</style>