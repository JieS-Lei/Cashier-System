<script setup>
import { useRouter } from 'vue-router'
import refundVue from './refund.vue'
import cashierVue from './cashier.vue'

const router = useRouter()

const headerTabVal = ref(true)
const headerTabFn = event => {
    const target = event.target
    if (target.className) return
    headerTabVal.value = !headerTabVal.value
}
document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'q') event.preventDefault()
})
document.addEventListener('keyup', event => {
    if (event.ctrlKey && event.key === 'q') headerTabVal.value = !headerTabVal.value
})


</script>
<template>
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
                <span :class="{ 'on': headerTabVal }">收银 [Ctrl+Q]</span>
                <span :class="{ 'on': !headerTabVal }">退货 [Ctrl+Q]</span>
            </span>
            <div class="box herder-right">
                <el-button class="radius" plain size="large">设置</el-button>
            </div>
        </el-header>
        <el-container class="shell pageBgColor">
            <el-aside class="aside" width="450px">
                <component :is="headerTabVal ? cashierVue : refundVue"></component>
            </el-aside>
            <el-container>
                <el-main class="main">

                </el-main>
                <el-footer>Footer</el-footer>
            </el-container>
        </el-container>
    </el-container>
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
</style>