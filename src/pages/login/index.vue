<script setup>
import { reactive } from 'vue';
let loginForm = reactive({
  uPhone: '',
  pwd: '',
  remember: false
})
const validatePhone = (rule, value, callback) => {
  const reg = /^1\d{10}$/
  if (!reg.test(value)) callback(new Error('The mobile number format is incorrect'))
  else callback()
}
const validatePwd = (rule, value, callback) => {
  const reg = /^1\d{10}$/
  if (!reg.test(value)) callback(new Error('The mobile number format is incorrect'))
  else callback()
}
let getphone = localStorage.getItem('DATA_MO')
if (getphone) {
  loginForm.uPhone = getphone
  loginForm.remember = true
}
const rules = reactive({
  uPhone: [
    { required: true, message: 'Please input Mobile number', triggeer: 'blur' },
    { min: 11, max: 11, message: 'Length should 11', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: 'Please input password', triggeer: 'blur' },
    { min: 6, max: 20, message: 'Length should be 6 to 20', triggeer: 'blur' },
    { validator: validatePwd, triggeer: 'blur' }
  ]
})


</script>
<template>
  <el-row class="row" justify="center">
    <el-col :span="6">
      <div class="logo">
        this is Logo.png
      </div>
    </el-col>
    <el-col :span="6">
      <div class="form">
        <h3 class="tit">账号登录</h3>
        <el-form ref="ruleFormRef" :model="loginForm" :rules="rules" label-width="55" size="large"
          hide-required-asterisk status-icon>
          <el-form-item label="手机号" prop="uPhone">
            <!-- @input="dinput" -->
            <el-input v-model="loginForm.uPhone" @input="value => loginForm.uPhone = value.replace(/[^\d]|^0/g, '')"
              :maxlength="11" placeholder="Please input mobile number" />
          </el-form-item>
          <el-form-item label="密码" prop="pwd">
            <el-input v-model="loginForm.pwd" type="password" placeholder="Please input password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button color="#626aef" style="width: 100%;">Login</el-button>
          </el-form-item>
          <el-form-item class="form-item">
            <el-checkbox v-model="loginForm.remember" label="记住我" name="type" style="height: auto;" />
            <el-button text style="padding: 0;height: auto;">忘记密码</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-col>
  </el-row>
</template>
<style scoped>
.row {
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