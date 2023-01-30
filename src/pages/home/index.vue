<script setup>
import iconImage from '~/components/iconImage.vue'
import dataView from '~/components/dataView.vue'

const buttons = [
    { text: '商品', icon: '/ArrowLeft.png', link: '/goods' },
    { text: '会员', icon: '/ArrowLeft.png', link: '/vip' },
]
const circleUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

let dropdownShow = ref(false)

const command = function (command) {
    ElMessage(`click on item ${command}`)
}
// const todo = function (event) {
//     let target = event.target
//     console.log(event);
// }


</script>

<template>
    <el-container direction="horizontal" style="font-family: var(--el-font-family);user-select: none;">
        <el-aside class="aside">
            <div class="logo">
                <icon-image src="/logo.jpg" widHei="100%" bg />
            </div>
            <el-scrollbar class="menu">
                <el-button-group class="menu-btn-parent">
                    <router-link class="menu-btn" :to="button.link" v-for="button in buttons" :key="button.text">
                        <el-button :type="button.type" size="default" text bg style="width: 100%;height: 100%;">
                            <icon-image class="menu-btn-icon" :src="button.icon" />
                            {{ button.text }}
                        </el-button>
                    </router-link>
                </el-button-group>
                <div class="cashier">
                    <router-link :to="{ name: 'checkout' }">
                        <el-button class="cashier-btn" color="#b4995a">
                            <icon-image widHei="50" src="/logos.jpg" style="margin-bottom: 10px;" />
                            收银台
                        </el-button>
                    </router-link>
                </div>
            </el-scrollbar>
        </el-aside>
        <el-scrollbar style="flex: 1;">
            <el-container class="content">
                <el-header class="header">
                    <div class="setting">
                        <el-icon size="20">
                            <ep-service />
                        </el-icon>
                        <span>联系客服</span>
                    </div>
                    <div class="setting">
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
</template>

<style scoped>
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
</style>