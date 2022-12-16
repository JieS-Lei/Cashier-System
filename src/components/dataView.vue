<script setup>
const hide = ref(true)
const props = defineProps({

})
</script>
<template>
    <el-row>
        <el-col :span="12" style="padding-right: 70px;">
            <div class="tit">
                <h3>销售额</h3>
            </div>
            <div class="num" :style="hide || 'font-family: fangsong;'">{{ hide ? '108.54' : '*****' }}</div>
            <div class="info">
                <div class="tit">
                    <h3>销售数据排行</h3>
                </div>
                <div class="info-item">
                    <span class="name">康师傅红烧牛肉面<span style="margin-left: 10px;">[ 4 ]</span></span>
                    <el-progress :percentage="100" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">康师傅酸菜牛肉面<span style="margin-left: 10px;">[ 3 ]</span></span>
                    <el-progress :percentage="50" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">农夫山泉<span style="margin-left: 10px;">[ 2 ]</span></span>
                    <el-progress :percentage="25" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">直接收款<span style="margin-left: 10px;">[ 1 ]</span></span>
                    <el-progress :percentage="10" :stroke-width="7" :show-text="false" />
                </div>
            </div>
        </el-col>
        <el-col :span="12" style="padding-left: 70px;">
            <div class="tit">
                <h3 style="margin-right: 15px;">预估利润</h3>
                <el-icon class="eyeIcon" color="#909399" v-show="hide" size="18" @click="hide = false">
                    <ep-view />
                </el-icon>
                <el-icon class="eyeIcon" color="#909399" v-show="!hide" size="18" @click="hide = true">
                    <ep-hide />
                </el-icon>
            </div>
            <div class="num" :style="hide || 'font-family: fangsong;'">{{ hide ? '86.54' : '*****' }}</div>
            <div class="info">
                <div class="tit">
                    <h3>销售金额排行</h3>
                </div>
                <div class="info-item">
                    <span class="name">康师傅红烧牛肉面<span style="margin-left: 10px;">[76.00]</span></span>
                    <el-progress :percentage="100" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">康师傅酸菜牛肉面<span style="margin-left: 10px;">(19.27)</span></span>
                    <el-progress :percentage="50" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">农夫山泉<span style="margin-left: 10px;">[13.61]</span></span>
                    <el-progress :percentage="25" :stroke-width="7" :show-text="false" />
                </div>
                <div class="info-item">
                    <span class="name">直接收款<span style="margin-left: 10px;">[3.71]</span></span>
                    <el-progress :percentage="10" :stroke-width="7" :show-text="false" />
                </div>
            </div>
        </el-col>
    </el-row>
</template>
<style scoped>
.tit {
    display: flex;
    align-items: center;
    margin-bottom: 7%;
    font-size: var(--el-font-size-medium);
    color: var(--el-text-color-regular);
}

.tit .eyeIcon {
    cursor: pointer;
}

.num {
    display: flex;
    align-items: center;
    line-height: 1;
    font-weight: bolder;
    font-size: 35px;
    color: #b4995a;
}

.info {
    margin-top: 10%;
}

.info-item {
    margin-top: 7%;
}

.info-item .name {
    display: inline-block;
    margin-bottom: 5px;
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-base);
}
</style>