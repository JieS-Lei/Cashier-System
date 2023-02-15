<script setup>
import { storeToRefs } from 'pinia'
import { useCheckoutStore } from '~/store/modules/checkoutStore'

import keyboardVue from '~/components/keyboard.vue'
import { watch } from 'vue';

const checkoutStore = useCheckoutStore()
const { currentGoods, vipCheck } = storeToRefs(checkoutStore)

const goods = computed(() => currentGoods.value[1])
const goodsPrice = computed(() => goods.value.diyPrice ?? goods.value.goods_sku[vipCheck.value ? 'goods_vip_price' : 'goods_price'])

const sumCopy = ref(goods.value.num)

console.log(goods.value);

const showInput = ref(0) // 显示输出框，1售价，2单品折扣
const ipuVal = reactive({
    val1: goodsPrice.value,
    val2: goods.value.oneDis
})

// 单价修改确定
const handlePriceClick = val => {
    goods.value.diyPrice = val
    showInput.value = 0
}
// 单品折扣修改确定
const handleDisClick = val => {
    goods.value.oneDis = val
    showInput.value = 0
}

watch(goods, () => showInput.value = 0)
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
                                <el-input class="inp" v-model="ipuVal.val1" style="width: 110px;">
                                    <template #suffix>元</template>
                                </el-input>
                                <el-button type="primary" @click="handlePriceClick(ipuVal.val1)">确认</el-button>
                            </template>
                            <template v-else>
                                <b>{{ goodsPrice }}</b>
                                <el-icon class="editIcon" @click="showInput = 1">
                                    <epEdit />
                                </el-icon>
                            </template>
                        </span>
                    </div>
                    <div>
                        <span class="tit">单品折扣：</span>
                        <span class="cont colorRed">
                            <template v-if="showInput === 2">
                                <el-input class="inp" v-model="ipuVal.val2" style="width: 62px;">
                                    <template #suffix>%</template>
                                </el-input>
                                <el-button type="primary" @click="handleDisClick(ipuVal.val2)">确认</el-button>
                            </template>
                            <template v-else>
                                <b>{{ goods.oneDis }}%</b>
                                <el-icon class="editIcon" @click="showInput = 2">
                                    <epEdit />
                                </el-icon>
                            </template>
                        </span>
                    </div>
                    <div>
                        <span class="tit">数量：</span>
                        <span class="cont">
                            <el-input-number v-model="sumCopy" :min="1" :max="99" :precision="0" value-on-clear="min"
                                step-strictly @change="val => goods.num = val" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="keyboard" style="min-width: 450px;">
            <keyboardVue />
        </div>
    </div>
</template>
<style scoped>
.wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
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