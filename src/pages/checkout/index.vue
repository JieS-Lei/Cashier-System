<script setup>

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
                <span class="title">会员管理</span>
                <div class="box herder-right">
                    <el-button class="radius" plain size="large"
                        @click="router.push({ name: 'vipSetting' })">会员设置</el-button>
                </div>
            </el-header>
            <el-main class="main pageBgColor">
            </el-main>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
@import url(~/assets/style/common.css);
</style>