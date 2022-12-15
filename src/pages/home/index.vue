<script setup>
import iconImage from '~/components/iconImage.vue'
const buttons = [
    { text: '商品', icon: '/ArrowLeft.png', link: 'sp' },
    { text: '会员', icon: '/ArrowLeft.png', link: 'vip' },
]
const circleUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

</script>

<template>
    <el-container direction="horizontal">
        <el-aside class="aside">
            <div class="logo">
                <icon-image src="/logo.jpg" widHei="100%" bg />
            </div>
            <el-scrollbar class="menu">
                <div class="menu-btn-parent">
                    <el-button class="menu-btn" v-for="button in buttons" :key="button.text" :type="button.type" text bg
                        size="default">
                        <icon-image class="menu-btn-icon" :src="button.icon" />
                        {{ button.text }}
                    </el-button>
                </div>
                <div class="cashier">
                    <el-button class="cashier-btn" color="#b4995a">
                        <icon-image widHei="50" src="/logos.jpg" style="margin-bottom: 10px;" />
                        收银台
                    </el-button>
                </div>
            </el-scrollbar>
        </el-aside>
        <el-scrollbar style="flex: 1;">
            <el-container class="content">
                <el-header class="header">
                    <div class="setting">
                        <el-icon size="20">
                            <ep-setting />
                        </el-icon>
                        <span>设置</span>
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
                        <span>随客</span>
                    </div>
                </el-header>
                <el-main class="main">
                    <el-row :gutter="20">
                        <el-col :span="6">

                        </el-col>
                        <el-col :span="6">

                        </el-col>
                    </el-row>
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
    /* overflow: hidden; */
    /* background-color: ; */
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

.menu-btn {
    width: calc(100% * 0.47);
    height: 65px;
    font-size: var(--el-font-size-medium);
    font-weight: bolder;
    margin-left: 0;
    margin-top: 15px;
}

.menu-btn-icon {
    margin-right: 10px;
}

.cashier {
    padding: 30px 30px 20px;
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
    font-family: var(--el-font-family);
    line-height: 1;
}

.header>div {
    display: inline-flex;
    align-items: center;
    user-select: none;
}

.header>div+div {
    margin-left: 20px;
}

.header>div:hover {
    cursor: pointer;
}

.header>div span {
    margin-left: 8px;
}

/* .main {} */
</style>