<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSelect = name => {
    let routerName = `vip${name.charAt(0).toUpperCase() + name.slice(1)}`
    router.replace({ name: routerName })
}
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
                <span class="title">会员设置</span>
                <div class="box"></div>
            </el-header>
            <el-container class="pageBgColor" style="overflow-y: auto;">
                <el-aside class="aside" width="180px">
                    <el-scrollbar>
                        <el-menu default-active="setting" class="el-menu-vertical-demo" @select="handleSelect">
                            <el-menu-item index="setting">
                                <el-icon>
                                    <epSetting />
                                </el-icon>
                                <span>基础设置</span>
                            </el-menu-item>
                            <el-menu-item index="auto">
                                <el-icon>
                                    <epSetting />
                                </el-icon>
                                <span>会员日设置</span>
                            </el-menu-item>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-main class="main">
                    <el-scrollbar>
                        <router-view v-slot="{ Component }">
                            <transition name="fade">
                                <component :is="Component" />
                            </transition>
                        </router-view>
                    </el-scrollbar>
                </el-main>
            </el-container>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);

.pageBgColor {
    padding: 10px;
}

.aside,
.main {
    /* border: 1px solid var(--el-border-color-light); */
    background-color: var(--el-bg-color-overlay);
}

.aside {
    padding: 5px 0;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    /* border-right: 1px solid var(--el-border-color-light); */
    box-sizing: border-box;
}

.main {
    padding: 20px;
    border-left: none;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.aside:deep(.el-scrollbar__view) {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.aside:deep(.el-menu) {
    flex: 1;
}
</style>