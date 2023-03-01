<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSelect = name => router.replace({ name: name })
const defaultActive = ref(router.currentRoute.value.name)
</script>
<template>
    <el-container class="container">
        <el-header class="header">
            <!-- <div class="shell"> -->
            <div class="box">
                <el-button size="large" text @click="router.back()">
                    <el-icon>
                        <epArrowLeftBold />
                    </el-icon>
                    返回 [ESC]
                </el-button>
            </div>
            <span class="title">设置</span>
            <div class="box"></div>
            <!-- </div> -->
        </el-header>
        <el-container class="pageBgColor" style="overflow-y: auto;">
            <el-aside class="aside" width="200px">
                <el-scrollbar noresize>
                    <el-menu :default-active="defaultActive" class="el-menu-vertical-demo" @select="handleSelect">
                        <el-menu-item index="setting">
                            <el-icon>
                                <epShop />
                            </el-icon>
                            <span>店铺设置</span>
                        </el-menu-item>
                        <el-menu-item index="changePwd">
                            <el-icon>
                                <epLock />
                            </el-icon>
                            <span>密码修改</span>
                        </el-menu-item>
                    </el-menu>
                </el-scrollbar>
            </el-aside>
            <el-main class="main">
                <el-scrollbar>
                    <router-view v-slot="{ Component }">
                        <transition name="fade">
                            <KeepAlive>
                                <component class="roView" :is="Component" />
                            </KeepAlive>
                        </transition>
                    </router-view>
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-container>
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
    padding: 5px 0;
    border-left: none;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.roView {
    padding: 15px 40px;
}

.aside:deep(.el-scrollbar__view) {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.aside:deep(.el-menu) {
    flex: 1;
}

@media screen and (min-width: 1420px) {
    .pageBgColor {
        padding: 10px 50px;
    }

    .roView {
        padding: 15px 60px;
    }
}
</style>