<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'
import { priceChangeFormatter, priceBlurFormatter } from '~/utils'

import keyboardVue from '~/components/keyboard.vue'
import { watch } from 'vue';

const checkoutStore = useCheckoutStore()
const { currentGoods, vipCheck } = storeToRefs(checkoutStore)

const emits = defineEmits(['currentDelete'])

const goods = computed(() => currentGoods.value[1])
const goodsPrice = computed(() => goods.value.diyPrice ?? goods.value.goods_sku[vipCheck.value ? 'goods_vip_price' : 'goods_price'])

const showInput = ref(0) // 显示输出框，1售价，2单品折扣
const ipuVal = reactive({
    val1: goodsPrice.value,
    val2: goods.value.oneDis,
    sumCopy: goods.value.num
})

// 单价修改确定
const handlePriceClick = val => {
    if (!val) val = '0.00'
    else val = priceBlurFormatter(val)
    goods.value.diyPrice = val
    showInput.value = 0
    ipuVal.val1 = val
    focusInp = 'sumCopy'
}
// 单品折扣修改确定
const handleDisClick = val => {
    goods.value.oneDis = val
    showInput.value = 0
    ipuVal.val2 = val
    focusInp = 'sumCopy'
}
// 单品折扣输入框格式限制
const formatter = val => {
    val = val.replace(/[^\d]|^0(?=\d)|(?<=\d{3})./g, '')
    if (+val > 100) val = '100'
    return val
}

// 聚焦输入框
const inpShowBtnClick = val => {
    if ('number' !== typeof val) return
    showInput.value = val
    focusInp = `val${val}`
}

// 虚拟键盘单击监听
let focusInp = 'sumCopy' // 虚拟键盘修改的input的值
const keyClick = val => {
    let txt = `${ipuVal[focusInp]}`
    if (val === 'X') {
        if (null == txt) return
        let temp = txt.slice(0, txt.length - 1)
        // 折扣与数量为数字类型,且数量不能低于1
        if (focusInp === 'val1') ipuVal[focusInp] = temp
        else if (focusInp === 'sumCopy') {
            ipuVal[focusInp] = (+temp || 1)
            // 数量改变更新数据
            goods.value.num = ipuVal[focusInp]
        }
        else ipuVal[focusInp] = +temp
        return
    }
    if (val === '.') {
        // 除售价外的数据都为整数
        if (focusInp === 'val1') {
            if (!txt) return ipuVal[focusInp] = '0.'
            if (/\./.test(txt)) return
            ipuVal[focusInp] += '.'
        }
        return
    }
    // 数字键盘点击
    // 限制折扣最大值
    if (focusInp === 'val2' && +(txt + val) >= 100) return ipuVal[focusInp] = 100
    // 改变金额
    if (focusInp === 'val1') {
        if (txt === '0') txt = ''
        let [$1, $2] = txt.split('.')
        if ($2 == null && $1.length >= 6) return ipuVal[focusInp] = '999999.99'
        if ('string' === typeof $2 && $2.length >= 2) return
        return ipuVal[focusInp] = txt + val
    }
    ipuVal[focusInp] = +(txt + val)
    if (focusInp === 'sumCopy') goods.value.num = ipuVal[focusInp] > 99 ? 99 : ipuVal[focusInp] // 更新数量
}

// 监听选中变化
watch(goods, newVal => {
    if (null == newVal) return
    // 数据初始化
    showInput.value = 0
    ipuVal.val1 = goodsPrice.value
    ipuVal.val2 = goods.value.oneDis
    ipuVal.sumCopy = goods.value.num
})

// 删除选中
const deleteClick = () => {
    checkoutStore.deleteCurrentFormOrder(currentGoods.value[0])
    emits('currentDelete', 1)
    checkoutStore.clearCurrentGoods()
}
</script>
<template>
    <div class="wrap">
        <div class="top">
            <h3>{{ goods.goods_name }}</h3>
            <div class="info">
                <el-image class="avatar" :src="goods.goods_image" fit="cover" />
                <div class="editable">
                    <div><span class="tit">条码：</span><span class="cont">{{ goods.goods_no || '-' }}</span></div>
                    <div>
                        <span class="tit">售价：</span>
                        <span class="cont colorRed">
                            <template v-if="showInput === 1">
                                <el-input class="inp" v-model="ipuVal.val1" autofocus onfocus="this.select()"
                                    :formatter="val => priceChangeFormatter(val)"
                                    @blur="ipuVal.val1 = priceBlurFormatter(ipuVal.val1)" style="width: 110px;">
                                    <template #suffix>元</template>
                                </el-input>
                                <el-button type="primary" @click="handlePriceClick(ipuVal.val1)">确认</el-button>
                            </template>
                            <template v-else>
                                <b>{{ goodsPrice }}</b>
                                <el-icon class="editIcon" @click="inpShowBtnClick(1)">
                                    <epEdit />
                                </el-icon>
                            </template>
                        </span>
                    </div>
                    <div>
                        <span class="tit">单品折扣：</span>
                        <span class="cont colorRed">
                            <template v-if="showInput === 2">
                                <el-input class="inp" v-model="ipuVal.val2" :formatter="val => formatter(val)"
                                    onfocus="this.select()" autofocus style="width: 62px;">
                                    <template #suffix>%</template>
                                </el-input>
                                <el-button type="primary" @click="handleDisClick(ipuVal.val2)">确认</el-button>
                            </template>
                            <template v-else>
                                <b>{{ goods.oneDis }}%</b>
                                <el-icon class="editIcon" @click="inpShowBtnClick(2)">
                                    <epEdit />
                                </el-icon>
                            </template>
                        </span>
                    </div>
                    <div>
                        <span class="tit">数量：</span>
                        <span class="cont">
                            <el-input-number v-model="ipuVal.sumCopy" :min="1" :max="99" :precision="0" value-on-clear="min"
                                step-strictly @change="val => goods.num = val" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="keyboard" style="min-width: 450px;">
            <keyboardVue @keyClick="keyClick" />
        </div>
        <div class="delete" @click="deleteClick">
            <el-icon class="icon" size="25">
                <epDelete />
            </el-icon>
        </div>
</div>
</template>
<style scoped>
.wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}

.delete {
    --deleteSize: 100px;
    position: absolute;
    left: 0;
    top: 0;
    width: var(--deleteSize);
    height: var(--deleteSize);
    transform: translate(-50%, -50%);
    color: #fff;
    background-color: var(--el-color-danger);
    border-radius: 50%;
    transition: background-color .2s;
}

.delete:hover {
    background-color: var(--el-color-danger-light-3);
    cursor: pointer;
}

.delete .icon {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(calc(var(--deleteSize) / -6), calc(var(--deleteSize) / -6));
}

.top {
    margin: 20px auto 10px;
    max-width: 450px;
}

.top .info {
    display: flex;
    margin-top: 20px;
}

h3 {
    font-weight: bolder;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.avatar {
    --image-size: 160px;
    width: var(--image-size);
    height: var(--image-size);
    margin-right: 20px;
}

.editable {
    line-height: 1;
}

.editable>div {
    min-height: 40px;
    display: flex;
    align-items: center;
}

.editable .cont {
    min-width: 180px;
    font-weight: bolder;
}

.editable .cont .inp {
    margin-right: 8px;
    width: 80px;
}

.editable .tit {
    width: 85px;
    color: var(--el-text-color-regular);
}

.editIcon {
    margin-left: 10px;
    vertical-align: bottom;
    cursor: pointer;
    color: rgba(64, 158, 255, 1);
    transition: color .3s;
}

.editIcon:hover {
    color: rgba(71, 162, 253, 0.7);
}

.colorRed {
    color: var(--el-color-danger);
}
</style>