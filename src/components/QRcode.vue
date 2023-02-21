<script setup>
import QRCode from "qrcode";
import { onMounted, ref } from "vue";

const props = defineProps({
    //二维码存储内容
    qrUrl: {
        type: String,
        default: "not found"
    },
    // canvas width
    width: {
        type: Number,
        default: 300
    },
    // canvas height
    height: {
        type: Number,
        default: 300
    },
    // 二维码尺寸（正方形 长宽相同）
    qrSize: {
        type: Number,
        default: 300
    },
    // 二维码底部文字
    qrText: {
        type: String,
        default: ""
    },
    //底部说明文字字号
    qrTextSize: {
        type: Number,
        default: 20
    }
})


const qrCodeOption = {
    errorCorrectionLevel: "M", // 二维码容错级别
    width: props.qrSize, // 二维码大小
    version: 7 // 二维码容量
}

const canvas = ref();
/**
 * @argument qrUrl        二维码内容
 * @argument qrSize       二维码大小
 * @argument qrText       二维码中间显示文字
 * @argument qrTextSize   二维码中间显示文字大小(默认16px)
 */
const handleQrcode = () => {
    let dom = canvas.value
    QRCode.toDataURL(props.qrUrl, qrCodeOption)
        .then((url) => {
            // 画二维码里的logo// 在canvas里进行拼接
            const ctx = dom.getContext("2d")
            const image = new Image()
            image.src = url
            new Promise(resolve => {
                image.onload = () => resolve(image)
            }).then(img => {
                // console.log(img, ctx)
                ctx.drawImage(img, (props.width - props.qrSize) / 2, 0, props.qrSize, props.qrSize)
                if (props.qrText) {
                    //设置字体
                    ctx.font = "bold " + props.qrTextSize + "px Arial"
                    let tw = ctx.measureText(props.qrText).width // 文字真实宽度
                    let ftop = props.qrSize - props.qrTextSize // 根据字体大小计算文字top
                    let fleft = (props.width - tw) / 2 // 根据字体大小计算文字left
                    ctx.fillStyle = "#fff"
                    ctx.textBaseline = "top" //设置绘制文本时的文本基线。
                    ctx.fillStyle = "#333"
                    ctx.fillText(props.qrText, fleft, ftop)
                }
            })
        })
        .catch(err => console.error(err));
}

onMounted(() => {
    handleQrcode();
})

</script>
<template>
    <div class="cavColl">
        <canvas id="canvas" ref="canvas" class="canvas" :width="width" :height="height"></canvas>
    </div>
</template>
<style scoped>
.cavColl {
    display: flex;
    justify-content: center;
}

#canvas {
    background-color: antiquewhite;
}
</style>