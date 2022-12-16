<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/modules/userStore.js'
import { api } from '~/apis'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
let loginForm = reactive({
  uname: '',
  pwd: '',
  remember: false
})
let loading = ref(false)
let getName = localStorage.getItem('DATA_NAME')
if (getName) {
  loginForm.uname = getName
  loginForm.remember = true
}

// const validatePhone = (rule, value, callback) => {
//   const reg = /^1[3-9]\d{9}$/
//   if (!reg.test(value)) callback(new Error('The mobile number format is incorrect'))
//   else callback()
// }
const rules = reactive({
  uname: [{ required: true, message: 'Please input user name', triggeer: 'blur' }],
  pwd: [{ required: true, message: 'Please input password', triggeer: 'blur' }],
  // uPhone: [
  //   { required: true, message: 'Please input Mobile number', triggeer: 'blur' },
  //   { min: 11, max: 11, message: 'Length should 11', trigger: 'blur' },
  //   { validator: validatePhone, trigger: 'blur' }
  // ]
})
const onLogin = function (formEl) {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      loginForm.uname = loginForm.uname.trim()
      if (!loginForm.uname) return ElMessage({ message: '请输入用户名', grouping: true })
      loading.value = true
      if (loginForm.remember) localStorage.setItem('DATA_NAME', loginForm.uname)
      else {
        localStorage.removeItem('DATA_NAME')
        localStorage.removeItem('token')
      }
      const [error, result] = await api.login({
        user_name: loginForm.uname,
        password: loginForm.pwd
      })
      loading.value = false
      if (error) console.warn(error)
      else if (result.code !== 1) console.log(`${result.code} - ${result.msg}`)
      else {
        const { token } = result.data
        userStore.setToken(token)
        if (loginForm.remember) localStorage.setItem('token', token)
        ElMessage.success('登录成功')
        formEl.resetFields()
        router.replace({ name: 'home' })
      }
      loading.value = false
    } else {
      ElMessage({ message: '填写有误，请检查', grouping: true })
      return false
    }
  })
}

</script>
<template>
  <el-scrollbar>
    <el-row class="row" justify="center">
      <el-col :span="6">
        <div class="logo">
          this is Logo.png
        </div>
      </el-col>
      <el-col :span="6">
        <div class="form">
          <h3 class="tit">账号登录</h3>
          <el-form ref="formRef" :model="loginForm" :rules="rules" label-width="55" size="large" hide-required-asterisk
            status-icon>
            <el-form-item label="用户名" prop="uname">
              <!-- <el-input v-model="loginForm.uPhone" @input="value => loginForm.uPhone = value.replace(/[^\d]|^0/g, '')"
              :maxlength="11" placeholder="Please input user name" /> -->
              <el-input v-model="loginForm.uname" placeholder="Please input user name" />
            </el-form-item>
            <el-form-item label="密码" prop="pwd">
              <el-input v-model="loginForm.pwd" type="password" placeholder="Please input password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button :loading="loading" color="#626aef" style="width: 100%;"
                @click="onLogin(formRef)">Login</el-button>
            </el-form-item>
            <el-form-item class="form-item">
              <el-checkbox v-model="loginForm.remember" label="记住我" name="type" style="height: auto;" />
              <el-button link style="padding: 0;height: auto;">忘记密码</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </el-scrollbar>
</template>
<style scoped>
.row {
  min-width: var(--win-min-width);
  height: 100vh;
  background-color: var(--el-bg-color);
}

.el-col {
  display: flex;
  align-items: center;
}

.logo {
  margin-right: 40px;
  width: 100%;
  height: 80px;
  background-color: var(--el-bg-color-page);
}

.form {
  width: 100%;
  user-select: none;
}

.form .tit {
  margin-bottom: 25px;
  text-align: center;
}

.form-item:deep(.el-form-item__content) {
  justify-content: space-between;
}
</style>