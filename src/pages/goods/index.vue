<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

const search = ref('')

const back = () => router.replace('/home')
const escDown = event => event.key === 'Escape' && back()

onMounted(() => {
    document.documentElement.addEventListener('keyup', escDown)
})
onBeforeUnmount(() => {
    document.documentElement.removeEventListener('keyup', escDown)
})

const checkeds = reactive({
    checked1: false,
    checked2: false,
    checked3: false,
    checked4: false
})

watch(checkeds, (newValue, oldValue) => {
    console.log(newValue, oldValue);
})

</script>
<template>
    <el-container style="height: 100vh;user-select: none;">
        <el-header class="header">
            <el-button class="esc" size="large" text @click="back">
                <el-icon size="20">
                    <ep-arrowLeft-bold />
                </el-icon>
                返回 [ESC]
            </el-button>
            <span class="title">商品管理</span>
            <div></div>
        </el-header>
        <el-main class="main">
            <div class="top">
                <el-input v-model="search" class="large search" placeholder="商品名称/条码/首字母/扫码" clearable />
                <el-select class="select large" placeholder="显示设置" multiple>
                    <el-option class="sel-checkbox" value="">
                        <el-checkbox v-model="checkeds.checked1" :disabled="checkeds.checked3" label="隐藏未销售"
                            size="large" @click.stop />
                    </el-option>
                    <el-option class="sel-checkbox" value="">
                        <el-checkbox v-model="checkeds.checked2" :disabled="checkeds.checked4" label="隐藏零库存"
                            size="large" @click.stop />
                    </el-option>
                    <el-divider style="margin: 10px 20px; width: auto;"></el-divider>
                    <el-option class="sel-checkbox" value="">
                        <el-checkbox v-model="checkeds.checked3" :disabled="checkeds.checked1" label="显示未销售"
                            size="large" @click.stop />
                    </el-option>
                    <el-option class="sel-checkbox" value="">
                        <el-checkbox v-model="checkeds.checked4" :disabled="checkeds.checked2" label="显示零库存"
                            size="large" @click.stop />
                    </el-option>
                </el-select>
            </div>
        </el-main>
    </el-container>
</template>
<style scoped>
.header {
    /* display: flex;
    align-items: center;
    justify-content: space-between; */
    position: relative;
    padding: 0 30px;
    text-align: center;
    line-height: 60px;
}

.esc {
    position: absolute;
    left: 30px;
    top: 50%;
    transform: translateY(-50%);
}

.title {
    margin: 0 auto;
    line-height: 1;
}

.main {
    --top-border-radius: 50px;
    padding-top: 0;
    background-color: var(--el-bg-color-page);
}

.main .top {
    display: flex;
    padding: 10px;
    height: 50px;
}

.main .top .search {
    width: 300px;
    height: 100%;
}

.main .top .search:deep(.el-input__wrapper) {
    border-radius: var(--top-border-radius);
}


.main .top .select {
    width: 150px;
    height: 100%;
}

.main .top .select:deep(div) {
    width: 100%;
    height: 100%;
    border-radius: var(--top-border-radius);
}

.main .top .select:deep(input::placeholder) {
    text-align: center;
    color: var(--el-text-color-regular);
}

.sel-checkbox {
    padding: 0;
    display: flex;
    align-items: center;
}

.sel-checkbox:deep(.el-checkbox) {
    width: 100%;
    height: 100%;
    padding: 0 32px 0 20px
}

.sel-checkbox:deep(.el-checkbox__label) {
    font-size: var(--el-font-size-medium);
}

.sel-checkbox:deep(.is-disabled) {
    cursor: not-allowed;
}


.main .top>div+div {
    margin-left: 10px;
}

/* 大字体 */
.large:deep(input) {
    padding: 0 20px;
    font-size: var(--el-font-size-medium);
}
</style>