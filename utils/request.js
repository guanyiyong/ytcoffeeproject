// 创建请求工具类
const baseURL = 'https://hogskhzxeyyu.sealosbja.site/api'; // 线上API地址

// 请求拦截器
const requestInterceptor = (config) => {
  // 获取token
  const token = uni.getStorageSync('token');
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
};

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response;
  
  if (statusCode === 200) {
    return data;
  } else if (statusCode === 401) {
    // token过期或无效，清除本地存储并跳转到登录页
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.redirectTo({
      url: '/pages/login/login'
    });
    return Promise.reject(new Error('登录已过期，请重新登录'));
  } else {
    return Promise.reject(new Error(data.message || '请求失败'));
  }
};

// 封装请求方法
const request = (options) => {
  const { url, method = 'GET', data, header = {} } = options;
  
  // 应用请求拦截器
  const config = requestInterceptor({
    url: `${baseURL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...header
    }
  });
  
  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
};

// API方法
const api = {
  // 登录
  login(phoneNumber, password) {
    return request({
      url: '/user/login',
      method: 'POST',
      data: {
        phoneNumber,
        password
      }
    });
  },
  
  // 注册
  register(phoneNumber, password, inviteCode) {
    return request({
      url: '/user/register',
      method: 'POST',
      data: {
        phoneNumber,
        password,
        inviteCode
      }
    });
  },
  
  // 获取用户信息
  getUserInfo() {
    return request({
      url: '/user/info',
      method: 'GET'
    });
  },
  
  // 上传图片
  uploadPortfolioImages(filePaths) {
    return new Promise((resolve, reject) => {
      // 创建一个 FormData 对象
      const formData = new FormData();
      
      // 将所有文件添加到 FormData 中
      filePaths.forEach((filePath, index) => {
        formData.append('images', filePath);
      });
      
      // 使用 uni.uploadFile 上传
      uni.uploadFile({
        url: `${baseURL}/portfolio/upload`,
        files: filePaths.map(filePath => ({
          name: 'images',
          uri: filePath
        })),
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          let responseData;
          try {
            responseData = JSON.parse(res.data);
          } catch (e) {
            reject(new Error('上传失败: 响应数据解析错误'));
            return;
          }

          if (res.statusCode === 200 && responseData.code === 0) {
            resolve(responseData);
          } else {
            reject(new Error(responseData.message || '上传失败'));
          }
        },
        fail: (error) => {
          console.error('uploadFile fail:', error);
          reject(new Error('网络或上传失败'));
        }
      });
    });
  },
  
  // 获取作品集列表
  getPortfolios() {
    return request({
      url: '/portfolio/list',
      method: 'GET'
    });
  },
  
  // 获取待审核作品集
  getPendingPortfolios() {
    return request({
      url: '/review/pending',
      method: 'GET'
    });
  },
  
  // 获取已审核作品集列表 (通过状态过滤)
  getReviewedPortfolios(status) {
    return request({
      url: '/review/list',
      method: 'GET',
      data: { status }
    });
  },
  
  // 审核作品集
  reviewPortfolio(portfolioId, action, reason) {
    const data = { portfolioId, action };
    if (action === 'reject' && reason !== undefined) {
        data.reason = reason;
    }
    return request({
      url: '/review/process',
      method: 'POST',
      data: data
    });
  },
  
  // 点赞/取消点赞
  toggleLike(portfolioId) {
    return request({
      url: `/portfolio/like/${portfolioId}`,
      method: 'POST'
    });
  }
};

export default api; 