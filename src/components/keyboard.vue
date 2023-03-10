<script setup>
const props = defineProps({
    direction: {
        type: String,
        default: 'horizontal'
    }
})
const emit = defineEmits(['keyClick'])
const handelKeyClick = event => {
    let target = event.target
    if (target.tagName !== 'SPAN') return
    let text = target.innerText
    emit('keyClick', text)
}
</script>
<template>
    <div v-if="props.direction === 'horizontal'" class="keyboard horizontal" @click="handelKeyClick">
        <span>1</span><span>2</span><span>3</span><span>0</span>
        <span>4</span><span>5</span><span>6</span><span>.</span>
        <span>7</span><span>8</span><span>9</span><span>X</span>
    </div>
    <div v-else class="keyboard vertical" @click="handelKeyClick">
        <span>7</span><span>8</span><span>9</span>
        <span>4</span><span>5</span><span>6</span>
        <span>1</span><span>2</span><span>3</span>
        <span>0</span><span>.</span><span>
            <slot></slot>
        </span>
    </div>
</template>
<style scoped>
.keyboard {
    --keyboard-height: 55px;
    display: grid;
    gap: 5px;
}

.horizontal {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, var(--keyboard-height));
}

.vertical {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, var(--keyboard-height));
}

.keyboard span {
    border: 1px solid var(--el-border-color-light);
    font-size: 18px;
    font-weight: bolder;
    line-height: var(--keyboard-height);
    text-align: center;
    color: var(--el-text-color-regular);
    transition: all .2s;
}

.keyboard span:hover {
    border-color: #fff;
    background-color: var(--el-color-info-light-9);
    cursor: pointer;
}

.keyboard span:active {
    background-color: var(--el-color-info-light-8);
}
</style>