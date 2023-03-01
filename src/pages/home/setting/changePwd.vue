<script setup>
import { apis } from '~/apis'

// 表单
const formRef = ref()
const pwdForm = reactive({
    old_password: '',
    new_password: '',
    re_new_password: ''
})
const pwdReg = new RegExp('^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?![a-zA-Z]+$)(?![a-z0-9]+$)(?![0-9A-Z]+$)[a-zA-Z][0-9A-Za-z]{7,31}$')
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入新密码'))
    } else {
        if (pwdForm.re_new_password !== '') {
            if (!formRef.value) return
            formRef.value.validateField('re_new_password', () => null)
        }
        callback()
    }
}
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入新密码'))
    } else if (value !== pwdForm.new_password) {
        callback(new Error("两次密码输入不相同"))
    } else callback()
}
const rules = reactive({
    old_password: [
        { required: true, message: '请输入原密码', trigger: 'blur' },
    ],
    new_password: [
        { validator: validatePass, trigger: 'blur' },
        { pattern: pwdReg, message: '密码是 同时包含 [数字]、[大写] 和 [小写字母] 且 不能以数字开头 的 8~32位 字符', trigger: 'blur' }
    ],
    re_new_password: [{ validator: validatePass2, trigger: 'blur' }],
})

const submitLoading = ref(false)
const submit = async formEl => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            submitLoading.value = true
            let [error, { code }] = await apis.changePwd(pwdForm)
            submitLoading.value = false
            if (error || 1 !== code) return
            ElMessage.success({ message: '密码修改成功' })
        } else {
            ElMessage.warning({ message: '表单存在错误项，请检查', grouping: true })
            console.warn(fields);
        }
    })
}

</script>
<template>
    <el-form ref="formRef" :rules="rules" :model="pwdForm" label-width="82" size="large" status-icon hide-required-asterisk>
        <el-form-item label="原密码" prop="old_password">
            <el-input v-model="pwdForm.old_password" autocomplete="off" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
            <el-input v-model="pwdForm.new_password" type="password" show-password autocomplete="off"
                placeholder="请输入由数字、大小写字母组成的新密码（长度为8-32个字符）" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="re_new_password">
            <el-input v-model="pwdForm.re_new_password" type="password" show-password autocomplete="off"
                placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
            <el-button :loading="submitLoading" type="danger" auto-insert-space style="width: 100px;"
                @click="submit(formRef)">修改</el-button>
        </el-form-item>
    </el-form>
</template>
<style scoped>
:deep(.el-form-item__content) {
    max-width: 500px;
}
</style>