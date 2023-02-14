<script setup>
import { useCheckoutStore } from '~/store/modules/checkoutStore'

const checkoutStore = useCheckoutStore()

const goodsPriceKey = computed(() => checkoutStore.isVip ? 'goods_vip_price' : 'goods_price')

const goods = computed(() => checkoutStore.currentGoods[1])
const sumCopy = goods.num
</script>
<template>
    <div class="wrap">
        <div class="top">
            <h3>商品名称</h3>
            <div class="info">
                <el-image class="avatar" :src="goods.goods_image1" fit="cover" />
                <div class="editable">
                    <div><span class="tit">条码：</span><span class="cont">{{ goods.goods_no || '-' }}</span></div>
                    <div>
                        <span class="tit">售价：</span>
                        <span class="cont colorRed">{{ goods.goods_sku[goodsPriceKey] }}</span>
                    </div>
                    <div><span class="tit">单件优惠：</span><span class="cont colorRed">{{ goods.oneDis }}%</span></div>
                    <div>
                        <span class="tit">数量：</span>
                        <span class="cont">
                            <el-input-number v-model="sumCopy" :min="1" :max="99" @change="handleChange" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="keyboard"></div>
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
}

.top .info {
    display: flex;
    margin-top: 20px;
}

h3 {
    font-weight: bolder;
}

.avatar {
    --image-size: 140px;
    width: var(--image-size);
    height: var(--image-size);
    margin-right: 20px;
}

.editable {
    line-height: 1;
}

.editable .cont {
    font-weight: bolder;
}

.editable>div+div {
    margin-top: 10px;
}

.colorRed {
    color: var(--el-color-danger);
}
</style>