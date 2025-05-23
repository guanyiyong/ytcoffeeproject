<template>
  <view class="review-container">
    <view class="review-header">
      <text class="header-title">图片审核</text>
    </view>
    
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }" 
        @tap="activeTab = 'pending'">
        待审核
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'approved' }" 
        @tap="activeTab = 'approved'">
        已通过
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'rejected' }" 
        @tap="activeTab = 'rejected'">
        已拒绝
      </view>
    </view>
    
    <view class="review-content">
      <!-- 待审核列表 -->
      <view class="image-list" v-if="activeTab === 'pending'">
        <view class="image-item" v-for="(item, index) in pendingPortfolios" :key="index">
          <image 
            class="review-image" 
            :src="item.imageArray && item.imageArray.length > 0 ? getFullImageUrl(item.imageArray[0]) : ''" 
            mode="aspectFill" 
            @tap="previewImage(item)">
          </image>
          <view class="action-buttons">
            <button class="approve-btn" @tap="approvePortfolio(index)">通过</button>
            <button class="reject-btn" @tap="rejectPortfolio(index)">拒绝</button>
          </view>
          <view class="upload-info">
            <text class="upload-time">{{ item.uploadTime }}</text>
            <text class="uploader">上传者: {{ item.uploader }}</text>
          </view>
          <view class="image-count" v-if="item.imageArray && item.imageArray.length > 1">
            <text>{{ item.imageArray.length }}张图片</text>
          </view>
        </view>
        
        <view class="empty-tip" v-if="pendingPortfolios.length === 0">
          <text>暂无待审核图片</text>
        </view>
      </view>
      
      <!-- 已通过列表 -->
      <view class="image-list" v-if="activeTab === 'approved'">
        <view class="image-item" v-for="(item, index) in approvedPortfolios" :key="index">
          <image 
            class="review-image" 
            :src="item.imageArray && item.imageArray.length > 0 ? getFullImageUrl(item.imageArray[0]) : ''" 
            mode="aspectFill" 
            @tap="previewImage(item)">
          </image>
          <view class="status-tag approved">已通过</view>
          <view class="upload-info">
            <text class="upload-time">{{ item.uploadTime }}</text>
            <text class="uploader">上传者: {{ item.uploader }}</text>
          </view>
          <view class="image-count" v-if="item.imageArray && item.imageArray.length > 1">
            <text>{{ item.imageArray.length }}张图片</text>
          </view>
        </view>
        
        <view class="empty-tip" v-if="approvedPortfolios.length === 0">
          <text>暂无已通过图片</text>
        </view>
      </view>
      
      <!-- 已拒绝列表 -->
      <view class="image-list" v-if="activeTab === 'rejected'">
        <view class="image-item" v-for="(item, index) in rejectedPortfolios" :key="index">
          <image 
            class="review-image" 
            :src="item.imageArray && item.imageArray.length > 0 ? getFullImageUrl(item.imageArray[0]) : ''" 
            mode="aspectFill" 
            @tap="previewImage(item)">
          </image>
          <view class="status-tag rejected">已拒绝</view>
          <view class="reject-reason" v-if="item.rejectReason">
            <text>拒绝原因：{{ item.rejectReason }}</text>
          </view>
          <view class="upload-info">
            <text class="upload-time">{{ item.uploadTime }}</text>
            <text class="uploader">上传者: {{ item.uploader }}</text>
          </view>
          <view class="image-count" v-if="item.imageArray && item.imageArray.length > 1">
            <text>{{ item.imageArray.length }}张图片</text>
          </view>
        </view>
        
        <view class="empty-tip" v-if="rejectedPortfolios.length === 0">
          <text>暂无已拒绝图片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '../../utils/request.js';

export default {
  data() {
    return {
      activeTab: 'pending',
      pendingPortfolios: [], // 待审核作品集
      approvedPortfolios: [], // 已通过作品集
      rejectedPortfolios: [], // 已拒绝作品集
      loading: false // 加载状态
    };
  },
  watch: {
      // 监听 activeTab 变化，切换时加载数据
      activeTab(newTab) {
          if (newTab === 'pending') {
              this.fetchPendingPortfolios();
          } else if (newTab === 'approved') {
              this.fetchApprovedPortfolios();
          } else if (newTab === 'rejected') {
              this.fetchRejectedPortfolios();
          }
      }
  },
  onLoad() {
    // 首次加载页面时获取待审核作品集
    this.fetchPendingPortfolios();
  },
  methods: {
    // 预览图片
    previewImage(item) {
      // 使用 item.imageArray 并添加安全访问
      const urls = item.imageArray;
      if (urls && urls.length > 0) {
        const current = urls[0];
        uni.previewImage({
          urls: urls.map(url => this.getFullImageUrl(url)), // 拼接完整图片URL
          current: this.getFullImageUrl(current) // 拼接完整当前图片URL
        });
      } else {
          uni.showToast({
              title: '该作品集没有图片',
              icon: 'none'
          });
      }
    },

    // 获取基础URL的方法
    getBaseUrl() {
        // 根据 api.md，基础URL是 https://hogskhzxeyyu.sealosbja.site
        // 静态资源可能直接从根路径提供
        return 'https://hogskhzxeyyu.sealosbja.site';
    },

    // 获取完整的图片URL，判断是否需要拼接基础URL
    getFullImageUrl(url) {
        if (!url) return '';
        // 检查是否已经是完整的URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        } else {
            // 拼接基础URL，确保只有一个斜杠分隔
            const baseUrl = this.getBaseUrl();
            return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        }
    },

    // 获取待审核作品集
    fetchPendingPortfolios() {
        if (this.loading) return;
        this.loading = true;
        uni.showLoading({ title: '加载中' });
        api.getPendingPortfolios()
            .then(res => {
                uni.hideLoading();
                this.loading = false;
                if (res && res.data && res.data.list) {
                    // 确保每个作品集都有 imageArray 属性，并初始化空数组
                    this.pendingPortfolios = res.data.list.map(item => {
                        return {
                            ...item,
                            imageArray: item.imageArray || []
                        };
                    });
                } else {
                    uni.showToast({
                        title: res.message || '获取待审核列表失败',
                        icon: 'none'
                    });
                     this.pendingPortfolios = []; // 清空列表
                }
            })
            .catch(err => {
                uni.hideLoading();
                this.loading = false;
                console.error('获取待审核列表失败:', err);
                uni.showToast({
                    title: err.message || '获取待审核列表失败，请稍后重试',
                    icon: 'none'
                });
                 this.pendingPortfolios = []; // 清空列表
            });
    },

    // 获取已通过作品集
    fetchApprovedPortfolios() {
        if (this.loading) return;
         this.loading = true;
        uni.showLoading({ title: '加载中' });
        api.getReviewedPortfolios('approved')
            .then(res => {
                uni.hideLoading();
                 this.loading = false;
                 if (res && res.data && res.data.list) {
                    // 确保每个作品集都有 imageArray 属性，并初始化空数组
                    this.approvedPortfolios = res.data.list.map(item => {
                        return {
                            ...item,
                            imageArray: item.imageArray || []
                        };
                    });
                } else {
                    uni.showToast({
                        title: res.message || '获取已通过列表失败',
                        icon: 'none'
                    });
                     this.approvedPortfolios = []; // 清空列表
                }
            })
            .catch(err => {
                uni.hideLoading();
                 this.loading = false;
                console.error('获取已通过列表失败:', err);
                uni.showToast({
                    title: err.message || '获取已通过列表失败，请稍后重试',
                    icon: 'none'
                });
                 this.approvedPortfolios = []; // 清空列表
            });
    },

    // 获取已拒绝作品集
    fetchRejectedPortfolios() {
         if (this.loading) return;
          this.loading = true;
        uni.showLoading({ title: '加载中' });
        api.getReviewedPortfolios('rejected')
            .then(res => {
                uni.hideLoading();
                 this.loading = false;
                 if (res && res.data && res.data.list) {
                    // 确保每个作品集都有 imageArray 属性，并初始化空数组
                    this.rejectedPortfolios = res.data.list.map(item => {
                        return {
                            ...item,
                            imageArray: item.imageArray || []
                        };
                    });
                } else {
                     uni.showToast({
                        title: res.message || '获取已拒绝列表失败',
                        icon: 'none'
                    });
                    this.rejectedPortfolios = []; // 清空列表
                }
            })
            .catch(err => {
                uni.hideLoading();
                 this.loading = false;
                console.error('获取已拒绝列表失败:', err);
                uni.showToast({
                    title: err.message || '获取已拒绝列表失败，请稍后重试',
                    icon: 'none'
                });
                 this.rejectedPortfolios = []; // 清空列表
            });
    },
    
    // 通过作品集审核
    approvePortfolio(index) {
      const portfolioToApprove = this.pendingPortfolios[index];
      console.log('尝试通过的作品集:', portfolioToApprove); // 打印作品集对象
      if (!portfolioToApprove || !portfolioToApprove._id) {
          uni.showToast({ title: '作品集信息不完整', icon: 'none' });
          return;
      }

      uni.showModal({
        title: '确认通过',
        content: '确定通过此作品集审核吗？',
        success: (res) => {
          if (res.confirm) {
            if (this.loading) return;
             this.loading = true;
            uni.showLoading({ title: '提交中' });
            api.reviewPortfolio(portfolioToApprove._id, 'approve')
            .then(() => {
                uni.hideLoading();
                 this.loading = false;
                uni.showToast({
                  title: '已通过审核',
                  icon: 'success'
                });
                // 移除待审核列表中的该项
                this.pendingPortfolios.splice(index, 1);
                // **注意：如果需要立即在已通过列表中显示，可以考虑添加到 approvedPortfolios 数组，或者直接刷新已通过列表**
                // this.fetchApprovedPortfolios();
            })
            .catch(err => {
                 uni.hideLoading();
                  this.loading = false;
                console.error('通过审核失败:', err);
                uni.showToast({
                  title: err.message || '通过审核失败，请稍后重试',
                  icon: 'none'
                });
            });
          }
        }
      });
    },
    
    // 拒绝作品集审核
    rejectPortfolio(index) {
      const portfolioToReject = this.pendingPortfolios[index];
      console.log('尝试拒绝的作品集:', portfolioToReject); // 打印作品集对象
       if (!portfolioToReject || !portfolioToReject._id) {
          uni.showToast({ title: '作品集信息不完整', icon: 'none' });
          return;
      }

      uni.showModal({
        title: '拒绝作品集',
        content: '请输入拒绝原因',
        editable: true,
        placeholderText: '请输入拒绝理由',
        success: (res) => {
          if (res.confirm) {
            const rejectReason = res.content || '未提供拒绝原因';
             if (this.loading) return;
              this.loading = true;
             uni.showLoading({ title: '提交中' });
             api.reviewPortfolio(portfolioToReject._id, 'reject', rejectReason)
             .then(() => {
                 uni.hideLoading();
                  this.loading = false;
                 uni.showToast({
                   title: '已拒绝作品集',
                   icon: 'success'
                 });
                 // 移除待审核列表中的该项
                 this.pendingPortfolios.splice(index, 1);
                 // **注意：如果需要立即在已拒绝列表中显示，可以考虑添加到 rejectedPortfolios 数组，或者直接刷新已拒绝列表**
                 // this.fetchRejectedPortfolios();
             })
            .catch(err => {
                 uni.hideLoading();
                  this.loading = false;
                console.error('拒绝审核失败:', err);
                uni.showToast({
                  title: err.message || '拒绝审核失败，请稍后重试',
                  icon: 'none'
                });
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.review-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.review-header {
  padding: 30rpx;
  text-align: center;
  background-color: #ffffff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 2rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666666;
  position: relative;
  
  &.active {
    color: #2d8cf0;
    font-weight: bold;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: #2d8cf0;
      border-radius: 2rpx;
    }
  }
}

.review-content {
  padding: 0 20rpx;
}

.image-list {
  display: flex;
  flex-direction: column;
}

.image-item {
  margin-bottom: 20rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.review-image {
  width: 100%;
  height: 400rpx;
  display: block;
}

.action-buttons {
  display: flex;
  padding: 20rpx;
}

.approve-btn, .reject-btn {
  flex: 1;
  margin: 0 10rpx;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.approve-btn {
  background-color: #19be6b;
  color: #ffffff;
}

.reject-btn {
  background-color: #ff9900;
  color: #ffffff;
}

.upload-info {
  padding: 20rpx;
  font-size: 24rpx;
  color: #999999;
  display: flex;
  justify-content: space-between;
}

.status-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: #ffffff;
  
  &.approved {
    background-color: #19be6b;
  }
  
  &.rejected {
    background-color: #ff9900;
  }
}

.reject-reason {
  padding: 20rpx;
  font-size: 26rpx;
  color: #ff5151;
  background-color: #fff5f5;
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999999;
  font-size: 28rpx;
}

.image-count {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
}
</style> 