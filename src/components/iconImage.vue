<script setup>
const props = defineProps({
    src: {
        type: String,
        required: true
    },
    fit: {
        type: String,
        default: 'contain'
    },
    size: {
        type: [String, Number],
        default: 18
    },
    widHei: [String, Array],
    bg: Boolean,
})
const w_h = computed(() => {
    const widHei = props.widHei
    const arr = 'string' === typeof widHei ? widHei.split(',') : widHei
    if (!Array.isArray(arr) || 'string' !== typeof arr[0]) return false
    return /\D/g.test(arr[0]) ? arr : arr.map(item => item + 'px')
})
</script>
<template>
    <el-image class="icon-image" :src="props.src" :fit="fit"
        :style="w_h && `width:${w_h[0]};height:${w_h[1] ?? w_h[0]}`">
        <template #placeholder>
            <div :class="['image-slot', { bg }]" :style="{ fontSize: `${size}px` }">
                <el-icon class="is-loading">
                    <ep-loading />
                </el-icon>
            </div>
        </template>
        <template #error>
            <div :class="['image-slot', { bg }]" :style="{ fontSize: `${size}px` }">
                <ep-picture />
            </div>
        </template>
    </el-image>
</template>
<style scoped>
.icon-image {
    width: 30px;
    height: 30px;
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.image-slot.bg {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
}
</style>