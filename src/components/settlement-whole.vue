<script setup>
import keyboardVue from '~/components/keyboard.vue'

const PrintTickets = ref(false) // 支付后打印小票与否

</script>
<template>
    <div class="sA-warp">
        <div class="sA-main">
            <div class="top">
                <div class="receivable">
                    <span>应收</span>
                    <span>￥0.00</span>
                </div>
                <el-divider direction="vertical" style="height: auto;" />
                <div class="PaidIn">
                    <span>实收</span>
                    <span style="color: var(--el-color-primary);">￥0.00</span>
                </div>
                <el-divider direction="vertical" style="height: auto;" />
                <div class="giveChange">
                    <span>找零</span>
                    <span style="color: var(--el-color-danger);">￥0.00</span>
                </div>
            </div>
            <div class="middle">
                <el-checkbox v-model="PrintTickets" label="支付完成打印小票" size="large" style="font-weight: bolder;" />
            </div>
            <div class="bottom">
                <keyboardVue class="keyboar" direction="vertical">00</keyboardVue>
                <div class="flex-column shortcut-tab">
                    <span>￥100</span>
                    <span>￥50</span>
                    <span>￥10</span>
                    <span>￥5</span>
                </div>
                <div class="flex-column fn-btn">
                    <span>删除<b>[Bksp]</b></span>
                    <span>清空<b>[Del]</b></span>
                    <span class="confirm">确认<b>[Enter]</b></span>
                </div>
            </div>
        </div>
        <div class="sA-tab">
            <div style="flex: 1.3;">取消<b>[Esc]</b></div>
            <div>现金支付<b>[Alt+2]</b></div>
            <div>线下支付<b>[Alt+3]</b></div>
            <div>扫码支付<b>[Alt+4]</b></div>
        </div>
    </div>
</template>
<style scoped>
.sA-warp {
    --borderReadius: 5px;
    display: flex;
    padding: 10px 20px 20px;
    border-radius: 5px;
    width: 600px;
}

.sA-main {
    flex: 1;
}

.sA-tab {
    display: flex;
    flex-direction: column;
    width: 120px;
    margin-left: 20px;
}

.sA-tab>div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: var(--el-border-width) var(--el-border-style) var(--el-border-color);
    border-radius: var(--borderReadius);
    font-size: 14px;
    font-weight: 600;
    color: #777;
    background-color: #fff;
    transition: all .2s;
}

.sA-tab>div:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    outline: none;
    cursor: pointer;
}

.sA-tab>div:active {
    background-color: var(--el-fill-color-light);
}

.sA-tab>div.active {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
}

.sA-tab>div+div {
    margin-top: 10px;
}

.sA-main .top {
    display: flex;
    padding: 10px 0;
    border-radius: var(--borderReadius);
    background-color: #fff;
}

.sA-main .top>div:not(.el-divider) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    font-size: 12px;
}

.sA-main .top>div:not(.el-divider) span:last-child {
    margin-top: 10px;
    font-size: 22px;
    font-weight: bold;
}

.sA-main .middle {
    padding: 5px 0 10px;
    text-align: right;
}

.sA-main .bottom {
    --btn-height: 50px;
    --btn-bg-color: #fff;
    --btn-bg-color-hover: #fbfbfb78;
    --btn-gap: 8px;
    --btn-radius: 3px;
    --btn-border-color: var(--el-border-color-lighter);
    display: flex;
}

.sA-main .bottom .keyboar {
    --keyboard-height: var(--btn-height);
    flex: 3;
    gap: var(--btn-gap);
}

.sA-main .bottom .keyboar:deep(span) {
    border-radius: var(--btn-radius);
    border-color: var(--btn-border-color);
    background-color: var(--btn-bg-color);
}

.sA-main .bottom .keyboar:deep(span):hover {
    background-color: var(--btn-bg-color-hover);
}

.flex-column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.sA-main .bottom>div:not(.keyboar) {
    flex: 1;
    padding-left: 8px;
}

.sA-main .bottom>div:not(.keyboar) span {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--btn-border-color);
    border-radius: var(--btn-radius);
    height: var(--btn-height);
    line-height: 1;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    background-color: var(--btn-bg-color);
    box-sizing: border-box;
    transition: all .2s;
}

.sA-main .bottom>div:not(.keyboar) span:hover {
    background-color: var(--btn-bg-color-hover);
    cursor: pointer;
}

.sA-main .bottom .fn-btn span {
    font-size: 14px !important;
}

.sA-main .bottom .fn-btn span b {
    margin-top: 5px;
    font-size: 12px;
}

.sA-main .bottom .fn-btn span+span {
    margin-top: var(--btn-gap);
}

.sA-main .bottom .fn-btn .confirm {
    flex: 1;
    color: #fff;
    border: none;
    background-color: var(--el-color-primary);
}

.sA-main .bottom .fn-btn .confirm:hover {
    color: var(--el-color-white);
    background-color: var(--el-color-primary-light-3);
}
</style>