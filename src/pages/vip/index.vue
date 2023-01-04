<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const back = () => router.replace('/home')
const escDown = event => event.key === 'Escape' && back()

onMounted(() => {
    document.documentElement.addEventListener('keyup', escDown)
})
onBeforeUnmount(() => {
    document.documentElement.removeEventListener('keyup', escDown)
    window.onresize = null
})
</script>
<template>
    <el-scrollbar>
        <el-container class="container" style="width: 100vw;">
            <el-header class="header">
                <el-button class="esc" size="large" text @click="back">
                    <el-icon size="20">
                        <ep-arrowLeft-bold />
                    </el-icon>
                    返回 [ESC]
                </el-button>
                <span class="title">会员管理</span>
                <div></div>
            </el-header>
            <el-main class="main">

            </el-main>
        </el-container>
    </el-scrollbar>
</template>
<style scoped>
.container {
    min-width: 1020px;
    height: 100vh;
    user-select: none;
}

.header {
    /* display: flex;
    align-items: center;
    justify-content: space-between; */
    position: relative;
    padding: 0 10px;
    text-align: center;
    line-height: 60px;
}

.esc {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
}

.title {
    margin: 0 auto;
    line-height: 1;
}
</style>