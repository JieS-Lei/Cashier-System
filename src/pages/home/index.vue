<script setup>
import { apis } from '~/apis'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '~/store/modules/systemStore'
import { useRouter } from 'vue-router'

import iconImage from '~/components/iconImage.vue'
import dataView from '~/components/dataView.vue'

const router = useRouter()
const systemStore = useSystemStore()
const { information } = storeToRefs(systemStore)

const buttons = [
    { text: '商品', icon: '/icon/goods.png', link: '/goods' },
    { text: '会员', icon: '/icon/vip.png', link: '/vip' },
    { text: '销售', icon: '/icon/vip.png', link: '/vip' },
]
const circleUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

let dropdownShow = ref(false)

const command = function (command) {
    ElMessage(`click on item ${command}`)
}

if (!information.value.sys_name) {
    apis.getSetting().then(([error, { code, data }]) => {
        if (error || 1 !== code) return ElMessage('系统参数获取失败')
        data.forEach(item => {
            information.value[item.key] = item.values
        })
    })
}

// 意见反馈
const customerVisible = ref(false)
const feedbackTextarea = ref('')
const feedbackLoading = ref(false)
const feedbackSubmit = async () => {
    if (feedbackTextarea.value.length < 5) return ElMessage.warning({ message: '请输入内容或输入内容过于简单', grouping: true })
    feedbackLoading.value = true
    let [error, { code, data }] = await apis.feedback(feedbackTextarea.value)
    feedbackLoading.value = true
    if (error || 1 !== code) return ElMessage('抱歉！反馈内容发送失败。')
    ElMessage.success(data)
    feedbackTextarea.value = ''
    customerVisible.value = false
}
</script>

<template>
    <el-container direction="horizontal" style="font-family: var(--el-font-family);user-select: none;">
        <el-aside class="aside">
            <div class="logo">
                <icon-image :src="information['sys_logo'] ?? ''" widHei="100%" bg />
            </div>
            <el-scrollbar class="menu">
                <el-button-group class="menu-btn-parent">
                    <router-link class="menu-btn" :to="button.link" v-for="button in buttons" :key="button.text">
                        <el-button :type="button.type" size="default" text bg style="width: 100%;height: 100%;">
                            <icon-image widHei="25" class="menu-btn-icon" :src="button.icon" />
                            {{ button.text }}
                        </el-button>
                    </router-link>
                </el-button-group>
                <div class="cashier">
                    <router-link :to="{ name: 'checkout' }">
                        <el-button class="cashier-btn" color="#b4995a">
                            <icon-image widHei="30" src="/icon/cashier1.png" style="margin-bottom: 10px;" />
                            收银台
                        </el-button>
                    </router-link>
                </div>
            </el-scrollbar>
        </el-aside>
        <el-scrollbar style="flex: 1;">
            <el-container class="content">
                <el-header class="header">
                    <div class="setting" @click="customerVisible = true">
                        <el-icon size="20">
                            <ep-service />
                        </el-icon>
                        <span>联系客服</span>
                    </div>
                    <div class="setting" @click="router.push({ name: 'setting' })">
                        <el-icon size="20">
                            <ep-setting />
                        </el-icon>
                        <span>设置</span>
                    </div>
                    <div class="userInfo">
                        <el-avatar :size="30" :src="circleUrl" fit="cover">
                            <ep-user-filled />
                        </el-avatar>
                        <el-dropdown size="large" @command="command" @visible-change="close => dropdownShow = close">
                            <span>
                                随客
                                <el-icon>
                                    <ep-arrow-down v-show="!dropdownShow" />
                                    <ep-arrow-up v-show="dropdownShow" />
                                </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="about">关于我们</el-dropdown-item>
                                    <el-dropdown-item disabled>Action 4</el-dropdown-item>
                                    <el-dropdown-item divided>Action 5</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-header>
                <el-main class="main">
                    <dataView />
                </el-main>
            </el-container>
        </el-scrollbar>
    </el-container>
    <Transition>
        <div class="overlay" v-show="customerVisible" @click.self="customerVisible = false">
            <div class="customer-box">
                <div class="customer">
                    <p class="tit">联系客服</p>
                    <div class="con">
                        <el-image :src="information.sys_service_img" fit="cover" />
                        <p class="i mSize">{{ information.sys_name }}</p>
                        <p class="i">微信扫码，联系客服</p>
                        <p class="i">客服电话：{{ information.sys_tel }}</p>
                    </div>
                </div>
                <div class="feedback">
                    <p class="tit">意见反馈</p>
                    <div class="con">
                        <el-input v-model="feedbackTextarea" resize="none" :input-style="{ height: '210px' }"
                            type="textarea" maxlength="800" placeholder="对我们的系统、服务，您还有什么建议嘛？您还期待什么新功能？请告诉我们……（800字以内）"
                            show-word-limit />
                        <el-button type="primary" size="large" :loading="feedbackLoading"
                            style="width: 100%;margin-top: 10px;" @click="feedbackSubmit">提交</el-button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity .3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.aside {
    /* logo高度 */
    --logo-height: 80px;
    --aside-width: 400px;
    padding-top: 30px;
    width: var(--aside-width);
    height: 100vh;
    font-size: 0;
    transition: width .2s;
    /* background-color: #243642; */
    /* overflow: hidden; */
    /* background-color: ; */
}

@media screen and (max-width: 1200px) {
    .aside {
        --aside-width: 300px;
    }
}

.logo {
    padding: 0 30px;
    width: 100%;
    height: var(--logo-height);
    font-size: 0;
    box-sizing: border-box;
}

.menu {
    height: calc(100% - var(--logo-height));
}

.menu-btn-parent {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 20px 30px 0;
    width: var(--aside-width);
    box-sizing: border-box;
}

.menu-btn-parent::before,
.menu-btn-parent::after {
    display: none;
}

.menu-btn {
    width: calc(100% * 0.47);
    height: 65px;
    font-size: var(--el-font-size-medium);
    font-weight: bolder;
    margin-left: 0;
    margin-top: 15px;
    transition: width .2s;
}

.menu-btn-icon {
    margin-right: 10px;
}

.cashier {
    padding: 40px 30px 20px;
}

.cashier-btn {
    width: 100%;
    height: 150px;
    font-weight: bolder;
    font-size: var(--el-font-size-medium);
    color: var(--el-color-white);
}

.cashier-btn:deep(span) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.content {
    --content-min-weidth: 800px;
    min-width: var(--content-min-weidth);
    height: 100vh;
}

.header {
    display: flex;
    justify-content: right;
    align-items: center;
    padding: 10px 60px;
    line-height: 1;
}

.header>div {
    display: inline-flex;
    align-items: center;
    font-size: var(--el-font-size-large);
}

.header>div+div {
    margin-left: 20px;
}

.header>div:hover {
    cursor: pointer;
}

.header>div span {
    display: inline-flex;
    margin-left: 8px;
}

.main {
    padding: 30px 50px;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
}

.customer-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    background-color: #fff;
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
}

.customer-box>div {
    padding: 10px;
    flex: 1;
    background-color: var(--el-bg-color-page);
}

.customer-box>div .tit {
    margin-bottom: 10px;
    font-size: 17px;
    font-weight: bolder;
    color: var(--el-text-color-primary);
}

.customer-box>div .con {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.customer-box>div .con .el-image {
    width: 200px;
    height: 200px;
    margin-bottom: 10px;
}

.customer-box>div .con .i {
    font-size: 12px;
    color: var(--el-text-color-regular);
}

.customer-box>div .con .mSize {
    font-size: 14px;
}

.customer-box .feedback {
    margin-left: 20px;
}
</style>