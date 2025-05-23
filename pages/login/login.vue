<template>
  <view class="login-container">
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
      <view class="buttons-row">
        <button class="button login-button" @click="handleLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button class="button register-button" @click="handleRegister" :disabled="loading">
          注册
        </button>
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
      phoneInputFocus: false,
      passwordInputFocus: false,
      loading: false
    };
  },
  methods: {
    // 登录处理
    handleLogin() {
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
          title: '请输入至少6位密码',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      uni.showLoading({
        title: '登录中...'
      });
      
      // 调用登录API
      api.login(this.phoneNumber, this.password)
        .then(res => {
          // 检查 res.data 是否存在且包含 token
          if (res && res.data && res.data.token) {
            const { token, user } = res.data;
            
            // 保存登录信息
            uni.setStorageSync('token', token);
            uni.setStorageSync('userInfo', user);
            
            uni.hideLoading();
            this.loading = false;
            
            uni.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  });
                }, 1500);
              }
            });
          } else {
            // 处理 res 或 res.data 或 res.data.token 不存在的情况
            uni.hideLoading();
            this.loading = false;
            uni.showToast({
              title: '登录失败，请稍后重试或检查用户名密码',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch(err => {
          uni.hideLoading();
          this.loading = false;
          
          uni.showToast({
            title: err.message || '登录失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        });
    },
    
    // 注册处理
    handleRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    }
  }
};
</script>

<style lang="scss">
.login-container {
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

.login-button {
  background-color: #2D8CF0;
  color: #ffffff;
  border: none;
  margin-right: 10px;
}

.register-button {
  background-color: #2D8CF0;
  color: #ffffff;
  border: none;
  margin-left: 10px;
}
</style> 