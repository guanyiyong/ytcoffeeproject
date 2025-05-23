<template>
  <view class="register-container">
    <view class="logo-section">
      <image class="logo" src="/static/logo.jpg" mode="aspectFit"></image>
    </view>
    
    <view class="form-container">
      <view class="input-group">
        <input 
          class="input-field" 
          type="number" 
          placeholder="请输入手机号" 
          maxlength="11" 
          v-model="phoneNumber"
          @focus="phoneInputFocus = true"
          @blur="phoneInputFocus = false"
          :class="{'input-focused': phoneInputFocus}" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="password" 
          placeholder="请输入密码" 
          maxlength="20" 
          v-model="password"
          @focus="passwordInputFocus = true"
          @blur="passwordInputFocus = false"
          :class="{'input-focused': passwordInputFocus}" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="password" 
          placeholder="请确认密码" 
          maxlength="20" 
          v-model="confirmPassword"
          @focus="confirmPasswordInputFocus = true"
          @blur="confirmPasswordInputFocus = false"
          :class="{'input-focused': confirmPasswordInputFocus}" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="text" 
          placeholder="邀请码（选填）" 
          maxlength="20" 
          v-model="inviteCode"
          @focus="inviteCodeInputFocus = true"
          @blur="inviteCodeInputFocus = false"
          :class="{'input-focused': inviteCodeInputFocus}" 
        />
      </view>
      
      <view class="buttons-row">
        <button class="button register-button" @click="handleRegister" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <button class="button back-button" @click="goToLogin" :disabled="loading">返回登录</button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '../../utils/request.js';

export default {
  data() {
    return {
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      inviteCode: '',
      phoneInputFocus: false,
      passwordInputFocus: false,
      confirmPasswordInputFocus: false,
      inviteCodeInputFocus: false,
      loading: false
    };
  },
  methods: {
    // 注册处理
    handleRegister() {
      if (this.loading) {
        return;
      }
      // 表单验证
      if (!/^1\d{10}$/.test(this.phoneNumber)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      if (!this.password || this.password.length < 6) {
        uni.showToast({
          title: '密码长度至少为6位',
          icon: 'none'
        });
        return;
      }
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }
      this.loading = true;
      uni.showLoading({
        title: '注册中...'
      });
      // 调用注册API
      api.register(this.phoneNumber, this.password, this.inviteCode)
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          uni.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                uni.redirectTo({
                  url: '/pages/login/login'
                });
              }, 1500);
            }
          });
        })
        .catch(err => {
          uni.hideLoading();
          this.loading = false;
          uni.showToast({
            title: err.message || '注册失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        });
    },
    // 返回登录页
    goToLogin() {
      uni.navigateBack();
    }
  }
};
</script>

<style lang="scss">
.register-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 40px;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-top: 60px;
  margin-bottom: 80px;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.form-container {
  width: 100%;
}

.input-group {
  margin-bottom: 24px;
}

.input-field {
  width: 100%;
  height: 48px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 0 15px;
  box-sizing: border-box;
  font-size: 16px;
  color: #333333;
  transition: border-color 0.3s ease;
  
  &::placeholder {
    color: #999999;
  }
}

.input-focused {
  border-color: #57A3F3;
}

.buttons-row {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.button {
  height: 48px;
  line-height: 48px;
  border-radius: 8px;
  font-size: 16px;
  flex: 1;
  
  &:active {
    opacity: 0.9;
    transform: translateY(2px);
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
  }
}

.register-button {
  background-color: #2D8CF0;
  color: #ffffff;
  border: none;
  margin-right: 10px;
}

.back-button {
  background-color: #2D8CF0;
  color: #ffffff;
  border: none;
  margin-left: 10px;
}
</style> 