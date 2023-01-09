<script setup>
import { useVipStore } from '~/store/modules/vipStore'
import { apis } from '~/apis'
import { priceChangeFormatter as priceFormatter, priceBlurFormatter } from '~/utils'
import { ElMessage, genFileId } from 'element-plus';

const store = useVipStore()

const loading = ref(false)
if (!store.setting?.fee) {
    // 获取会员基本设置
    loading.value = true
    apis.getVipSetting().then(([error, { data: { data }, code }]) => {
        if (error || 1 !== code) return ElMessage('设置信息获取失败，请刷新重试！')
        data.is_open = !!+data.is_open
        data.one_pay_money_open = !!+data.one_pay_money_open
        store.setSetting(data)
        Object.assign(form, data)
        loading.value = false
    })
}

const formRef = ref()
const form = reactive({ ...store.setting }) // 表单数据
const rules = reactive({
    fee: [
        { required: true, message: '请输入会员费', trigger: 'blur' }
    ],
    vip_min_money: [
        { required: true, message: '请输入会员费', trigger: 'blur' }
    ],
    one_pay_money: [
        { required: true, message: '请输入会员费', trigger: 'blur' }
    ],
    discount_ratio: [
        { required: true, message: '请输入会员费', trigger: 'blur' }
    ]
})
// blur时完善输入的金额
const priceBlur = key => form[key] = priceBlurFormatter(form[key])

// 上传
const uploadRef = ref() // 上传组件实例
const fileList = ref([]) // 上传文件列表
const dialogImageUrl = ref('') // 大图预览路径
const dialogVisible = ref(false) // 大图预览开关
// 允许上传的图片类型
const accept = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
]
// 图片上传限制
const beforeAvatarUpload = rawFile => {
    if (!accept.includes(rawFile.type)) {
        ElMessage.error('只能上传 JPG|JPEG|PNG|GIF 类型图像!')
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('图像限制在 2MB 以内')
        return false
    }
    return true
}

// 覆盖替换
const handleExceed = files => {
    uploadRef.value.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value.handleStart(file)
    uploadRef.value.submit()
}

// 查看大图
const handlePictureCardPreview = file => {
    if (!file.response) return ElMessage({
        message: '上传中，请稍等！',
        grouping: true
    })
    dialogVisible.value = true
}

// 上传处理
const upload = options => new Promise((resolve, reject) => {
    apis.upload({
        onProgress: options.onProgress,
        data: {
            'iFile': options.file
        }
    }).then(([err, res]) => {
        if (err || 1 !== res.code) {
            let e = err || res
            return reject(e)
        }
        resolve(res)
        dialogImageUrl.value = res.data.file_path
    })
})

// 提交修改
const submitForm = async formEl => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            let options = { ...form }
            if (dialogImageUrl) options.to_vip_bg = dialogImageUrl.value
            options.is_open = +form.is_open
            options.one_pay_money_open = +form.one_pay_money_open
            let [error, { code }] = await apis.setVIPSetting(options)
            if (error || 1 !== code) {
                Object.assign(form, store.setting)
                return ElMessage('修改失败')
            }
            store.setSetting(form)
            form.to_vip_bg = dialogImageUrl.value
            uploadRef.value.clearFiles()
            ElMessage.success('修改成功')
        } else console.warn('error submit!', fields)
    })
}
</script>
<template>
    <el-form v-loading="loading" ref="formRef" :rules="rules" :model="form" label-width="auto" size="large" status-icon>
        <el-alert class="a-info" type="info" show-icon :closable="false">
            <p>用户支付会员费后自动成为会员，享有会员权益</p>
        </el-alert>
        <el-form-item label="会员购买" prop="is_open">
            <el-switch v-model="form.is_open" />
        </el-form-item>
        <el-form-item label="会员费" prop="fee">
            <el-input diss v-model="form.fee" :formatter="priceFormatter" @blur="priceBlur('fee')"
                onfocus="this.select()" />
        </el-form-item>
        <el-form-item label="会员折扣" prop="discount_ratio">
            <el-select v-model="form.discount_ratio">
                <template v-for="index of 3">
                    <el-option v-for="i in 10" :label="`${(index + 6) * 10 + i - 1} 折`"
                        :value="`${(index + 6) * 10 + i - 1}`" />
                </template>
                <el-option label="不打折" value="100" />
            </el-select>
        </el-form-item>
        <el-form-item label="最低折扣金额" prop="vip_min_money">
            <el-input v-model="form.vip_min_money" :formatter="priceFormatter" @blur="priceBlur('vip_min_money')"
                onfocus="this.select()" />
        </el-form-item>
        <el-alert class="a-info" type="info" show-icon :closable="false">
            <p>用户单次消费金额达到此额度后自动成为会员，享有会员权益</p>
        </el-alert>
        <el-form-item label="消费成为会员" prop="one_pay_money_open">
            <el-switch v-model="form.one_pay_money_open" />
        </el-form-item>
        <el-form-item label="消费金额" prop="one_pay_money">
            <el-input v-model="form.one_pay_money" :formatter="priceFormatter" @blur="priceBlur('one_pay_money')"
                onfocus="this.select()" />
        </el-form-item>
        <el-alert class="a-info" type="info" show-icon :closable="false">
            <p>用户支付结束后，出现在支付页面的引导图</p>
        </el-alert>
        <el-form-item label="引导图" style="margin-bottom: 0; line-height: 1;">
            <el-upload ref="uploadRef" v-model:file-list="fileList" :http-request="upload" :accept="accept.join()"
                :limit="1" :on-exceed="handleExceed" :before-upload="beforeAvatarUpload"
                :on-preview="handlePictureCardPreview">
                <el-button type="primary" size="default">点击上传</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        尺寸为 300*125 且小于 2MB 的 jpg/png/gif 图片
                    </div>
                </template>
            </el-upload>
            <el-dialog v-model="dialogVisible">
                <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
        </el-form-item>
        <el-image class="povImg" :src="form.to_vip_bg" fit="fill" />
        <el-divider />
        <el-form-item class="submit">
            <el-button type="primary" @click="submitForm(formRef)" style="width: 100%;">提交修改</el-button>
        </el-form-item>
    </el-form>
</template>
<style scoped>
:deep(.el-input) {
    display: inline-block;
}

form {
    overflow-x: hidden;
}

:deep(.el-form-item) {
    padding-left: 5px;
}

.submit {
    margin: 0 auto;
    width: 15%;
}

.a-info {
    margin-bottom: 8px;
}

.a-info:deep(.el-alert__description) {
    margin: 0;
}

.el-upload__tip {
    display: inline-block;
    margin: 0 20px;
    color: var(--el-color-info);
}

.povImg {
    max-width: 350px;
    left: 50%;
    transform: translateX(-50%);
}
</style>