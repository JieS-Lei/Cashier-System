<script setup>
import { useRouter } from 'vue-router'

import refundVue from './refund.vue'
import cashierVue from './cashier.vue'
import discountTabVue from './discount-tab.vue'
import selectGoodsTabVue from './selectGoods-tab.vue'
import createOrderEntryTabVue from './createOrderEntry-tab.vue'


const router = useRouter()

const headerTabVal = ref(true)
const headerTabFn = event => {
    const target = event.target
    if (target.className) return
    headerTabVal.value = !headerTabVal.value
}
document.addEventListener('keydown', event => {
    if (event.altKey && event.key === 'q') event.preventDefault()
})
document.addEventListener('keyup', event => {
    if (event.altKey && event.key === 'q') headerTabVal.value = !headerTabVal.value
})

const tabs = [{
    label: '优惠折扣 [F4]',
    component: discountTabVue
}, {
    label: '手选商品 [F5]',
    component: selectGoodsTabVue
}, {
    label: '直接收款 [F6]',
    component: createOrderEntryTabVue
}]
const activeIndex = ref(0)
const handleTabClick = tabName => activeIndex.value = tabName
</script>
<template>
    <el-scrollbar>
        <el-container class="container">
            <el-header class="header">
                <div class="box">
                    <el-button size="large" text @click="router.back()">
                        <el-icon>
                            <epArrowLeftBold />
                        </el-icon>
                        返回 [ESC]
                    </el-button>
                </div>
                <span class="title" @click="headerTabFn">
                    <span :class="['mask', { 'on': !headerTabVal }]">蒙版</span>
                    <span :class="{ 'on': headerTabVal }">收银 [Alt+Q]</span>
                    <span :class="{ 'on': !headerTabVal }">退货 [Alt+Q]</span>
                </span>
                <div class="box herder-right">
                    <el-button class="radius" plain size="large">设置</el-button>
                </div>
            </el-header>
            <el-container class="shell pageBgColor">
                <el-aside class="aside" width="450px">
                    <KeepAlive>
                        <component :is="headerTabVal ? cashierVue : refundVue"></component>
                    </KeepAlive>
                </el-aside>
                <el-container style="overflow: hidden;border: 1px solid var(--el-border-color);">
                    <el-main class="main" style="background-color: #fff;">
                        <KeepAlive>
                            <component :is="tabs[activeIndex].component"></component>
                        </KeepAlive>
                    </el-main>
                    <el-footer class="footer">
                        <span v-for="(tab, tabIndex) of tabs" :class="{ 'is-active': activeIndex === tabIndex }"
                            @click="handleTabClick(tabIndex)">
                            {{ tab.label }}
                        </span>
                    </el-footer>
                </el-container>
            </el-container>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.herder-right {
    text-align: right;
    padding-right: 12px;
}

.header .title {
    position: relative;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    background-color: rgba(64, 158, 255, .1);
}

.header .title span {
    --oneTabWidth: 80px;
    display: inline-block;
    text-align: center;
    height: 40px;
    line-height: 40px;
    transition: all .2s;
    border: 1px solid transparent;
    width: 130px;
    overflow: hidden;
    cursor: pointer;
}

.header .title span.on {
    width: var(--oneTabWidth);
    color: #fff;
}

.header .title span.mask {
    width: var(--oneTabWidth);
    word-break: keep-all;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
    color: transparent;
    background-color: rgb(64, 158, 255);
    z-index: -1;
}

.header .title span.mask.on {
    left: 100%;
    transform: translateX(-100%);
}

.container .shell {
    padding: 10px;
    overflow: hidden;
}

.container .aside {
    overflow: hidden;
    margin-right: 10px;
    background-color: #fff;
}

.footer {
    --el-footer-height: 49px;
    display: flex;
    align-items: center;
    padding: 0;
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color-light);
}

.footer span {
    margin-top: -1px;
    padding: 8px;
    padding: 0 25px;
    height: 100%;
    border: 1px solid transparent;
    font-size: var(--el-font-size-base);
    font-weight: bold;
    line-height: var(--el-footer-height);
    color: var(--el-text-color-secondary);
    transition: all .3s cubic-bezier(.645, .045, .355, 1);
}

.footer span:first-child {
    margin-left: -1px;
}

.footer span:hover {
    color: var(--el-color-primary);
    cursor: pointer;
}

.footer span.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-bg-color-overlay);
    border-right-color: var(--el-border-color);
    border-left-color: var(--el-border-color);
}
</style>