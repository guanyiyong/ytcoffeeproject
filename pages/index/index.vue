<template>
	<view class="index-container">
		<view>
			<nav class="navbar">
        		<div class="navbar-title">精选</div>
    		</nav>
		</view>
		<!-- 网格布局图片展示 -->
		<view class="grid-container">
			<view 
				class="grid-item" 
				v-for="(portfolio, index) in portfolioList" 
				:key="index"
				@click="handleTap(portfolio)">
				<!-- 显示作品集的第一张图片 -->
				<image 
					class="grid-image" 
					:src="portfolio.imageArray ? getFullImageUrl(portfolio.imageArray[0]) : ''"
					mode="aspectFill">
				</image>
				<!-- 根据当前用户是否喜欢该作品集显示爱心 -->
				<view class="like-icon" v-if="isLiked(portfolio)">
					<text style="color: #ff3a3a; font-size: 46rpx;">❤</text>
				</view>
			</view>
		</view>
		
		<!-- 底部固定按钮 -->
		<view class="action-buttons">
			<view class="review-btn" @tap="handleReview" v-if="isAdmin">
				<text class="icon-review">≡</text>
			</view>
			<view class="upload-btn" @tap="handleUpload">
				<text class="icon-upload">+</text>
			</view>
		</view>
	</view>
</template>

<script>
import api from '../../utils/request.js';

export default {
	navigationStyle: 'custom', // 隐藏默认导航栏
	data() {
		return {
			isAdmin: false, // 是否为管理员
			lastTapTime: 0, // 上次点击时间
			currentUserPhone: '', // 当前登录用户的手机号
			portfolioList: [] // 展平后的作品集列表
		}
	},
	computed: {
		// 计算当前用户是否喜欢该作品集
		isLiked() {
			return (portfolio) => {
				// 检查当前用户的手机号是否在likesTimes数组中
				// 使用可选链操作符 ?. 安全地访问 likesTimes
				return portfolio.likesTimes?.includes(this.currentUserPhone);
			}
		},
		// 获取当前用户信息 (此计算属性可能需要根据实际后端返回的用户信息进行调整)
		currentUser() {
			// 从本地存储获取用户信息，而不是从模拟数据中查找
			const userInfo = uni.getStorageSync('userInfo');
			return userInfo || null;
		}
	},
	onLoad() {
		// 获取登录用户信息
		this.getUserInfo();
		
		// 获取数据
		this.fetchData();
	},

	// 启用下拉刷新
	enablePullDownRefresh: true,

	onPullDownRefresh() {
		console.log('下拉刷新');
		this.fetchData().finally(() => {
			uni.stopPullDownRefresh();
		});
	},

	// 页面显示/从其他页面返回时触发
	onShow() {
		console.log('页面显示');
		this.fetchData();
	},

	methods: {
		// 获取登录用户信息并设置权限
		getUserInfo() {
			try {
				// 从本地存储获取用户信息
				const userInfo = uni.getStorageSync('userInfo');
				
				if (userInfo) {
					// 设置当前用户手机号
					this.currentUserPhone = userInfo.phoneNumber;
					
					// 根据用户的root属性判断是否为管理员
					this.isAdmin = userInfo.root === 0;
					
					console.log('当前用户:', userInfo.phoneNumber, '是管理员:', this.isAdmin);
				} else {
					// 未登录，跳转到登录页
					uni.redirectTo({
						url: '/pages/login/login'
					});
				}
			} catch (e) {
				console.error('获取用户信息失败:', e);
				// 获取失败也跳转登录页
				uni.redirectTo({
					url: '/pages/login/login'
				});
			}
		},
		// 处理点击事件，检测双击
		handleTap(portfolio) {
			const currentTime = new Date().getTime();
			const tapInterval = currentTime - this.lastTapTime;
			
			// 双击间隔不超过500ms
			if (tapInterval < 500 && tapInterval > 0) {
				this.toggleLike(portfolio);
			} else {
				this.viewPortfolio(portfolio);
			}
			
			this.lastTapTime = currentTime;
		},
		
		// 切换喜欢状态
		toggleLike(portfolio) {
			// **注意：此方法需要对接后端 /api/portfolio/like 接口**
			// 模拟本地更新喜欢状态
			// 确保 likesTimes 数组存在
			if (!portfolio.likesTimes) {
				portfolio.likesTimes = [];
			}
			const userIndex = portfolio.likesTimes.indexOf(this.currentUserPhone);
			
			if (userIndex === -1) {
				// 如果当前用户不在喜欢列表中，添加
				portfolio.likesTimes.push(this.currentUserPhone);
				uni.showToast({
					title: '已添加到喜欢',
					icon: 'none'
				});
			} else {
				// 如果当前用户在喜欢列表中，移除
				portfolio.likesTimes.splice(userIndex, 1);
				uni.showToast({
					title: '已取消喜欢',
					icon: 'none'
				});
			}
			
			// 在实际应用中，这里应该发送请求到服务器更新数据
			console.log('更新作品集喜欢状态:', portfolio);
		},
		
		// 查看作品集详情
		viewPortfolio(portfolio) {
			// 这里应该跳转到作品集详情页面，展示作品集中的所有图片
			// 为了演示，我们使用预览图片功能
			// 使用可选链操作符 ?. 安全地访问 ImageArray
			const urls = portfolio.imageArray; // 预览所有图片
			if (urls && urls.length > 0) {
				const current = urls[0];
				uni.previewImage({
					urls: urls.map(url => this.getFullImageUrl(url)), // 拼接完整图片URL
					current: this.getFullImageUrl(current) // 拼接完整当前图片URL
				});
			} else {
				uni.showToast({
					title: '作品集没有图片',
					icon: 'none'
				});
			}
		},
		
		// 获取基础URL的方法
		getBaseUrl() {
			// 根据 api.md，基础URL是 https://hogskhzxeyyu.sealosbja.site
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
		
		// 处理上传图片
		handleUpload() {
			uni.chooseImage({
				count: 9, // 限制最多选择9张图片
				success: (res) => {
					// 检查图片数量是否超过限制
					if (res.tempFilePaths.length > 9) {
						uni.showToast({
							title: '一次最多上传9张照片',
							icon: 'none',
							duration: 2000
						});
						return; // 终止上传流程
					}
					
					uni.showLoading({
						title: '上传中...'
					});
					
					// 一次性上传所有图片
					api.uploadPortfolioImages(res.tempFilePaths)
						.then(result => {
							uni.hideLoading();
							console.log('所有图片上传成功:', result);
							uni.showToast({
								title: '上传成功',
								icon: 'success'
							});
							// 上传成功后，刷新作品集列表
							this.fetchData();
						})
						.catch(err => {
							uni.hideLoading();
							console.error('图片上传失败:', err);
							uni.showToast({
								title: err.message || '上传失败，请稍后重试',
								icon: 'none',
								duration: 3000
							});
						});
				},
				fail: (err) => {
					console.log('选择图片失败', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 处理审核功能
		handleReview() {
			// 跳转到审核页面 (此功能需要实现审核页面)
			uni.navigateTo({
				url: '/pages/review/review', // 确保存在此页面
				// success: (res) => {
				// 	// 页面打开成功后，向页面传递待审核数据 (此数据应从后端获取)
				// 	res.eventChannel.emit('setPendingPortfolios', {
				// 		pendingPortfolios: this.pendingPortfolios
				// 	});
				// }
			});
		},
		
		// 获取数据并展平作品集列表
		fetchData() {
			// **对接后端 /api/portfolio/list 接口**
			uni.showLoading({
				title: '加载中...'
			});
			return api.getPortfolios() // 返回 Promise 以便在 finally 中停止刷新
				.then(res => {
					uni.hideLoading();
					console.log('获取作品集列表成功:', res);
					if (res && res.data && res.data.list) {
						this.portfolioList = res.data.list;
					} else {
						uni.showToast({
							title: res.message || '获取作品集失败',
							icon: 'none'
						});
					}
				})
				.catch(err => {
					uni.hideLoading();
					console.error('获取作品集列表失败:', err);
					uni.showToast({
						title: err.message || '获取作品集列表失败，请稍后重试',
						icon: 'none'
					});
				});
		},
		
		// 获取待审核作品集 (此方法需要对接后端API，目前保留以便后续实现)
		fetchPendingPortfolios() {
			// **注意：此方法需要对接后端 /api/review/pending 接口**
			// 模拟从服务器获取待审核数据
			// this.pendingPortfolios = [
			// 	{
			// 		LikesTimes: [],
			// 		ImageArray: ['/static/0073WEAEgy1i09r5d88fwj31400u0jzo.jpg'],
			// 		uploadTime: '2023-05-22 15:30',
			// 		uploader: '13900139000'
			// 	},
			// 	{
			// 		LikesTimes: [],
			// 		ImageArray: [
			// 			'/static/0073WEAEgy1i0z0dx4eggj31og28lhdt.jpg',
			// 			'/static/0073WEAEgy1hzbzocvn60j32i03c0kjn.jpg'
			// 		],
			// 		uploadTime: '2023-05-22 16:45',
			// 		uploader: '13900139000'
			// 	}
			// ];
		},
	}
}
</script>

<style lang="scss">

	.navbar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 48px;
            background-color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        
        .navbar-title {
            font-size: 18px;
            font-weight: 500;
            color: #000;
            position: relative;
            padding-bottom: 8px;
        }
        
        .navbar-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 2px;
            background-color: #ff0000;
            border-radius: 1px;
        }

	.index-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 12rpx;
		padding-bottom: 180rpx; // 为底部按钮留出空间
		box-sizing: border-box;
	}

	/* 网格布局样式 */
	.grid-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 24rpx;
		padding-top: 60px;
	}

	.grid-item {
		position: relative;
		overflow: hidden;
		border-radius: 24rpx;
		background-color: #ffffff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		aspect-ratio: 1/1;
	}

	.grid-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.like-icon {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: heartBeat 0.3s ease-in-out;
	}

	@keyframes heartBeat {
		0% { transform: scale(0); }
		50% { transform: scale(1.2); }
		100% { transform: scale(1); }
	}

	/* 底部按钮样式 */
	.action-buttons {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		display: flex;
		z-index: 100;
	}

	.upload-btn, .review-btn {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
		margin-left: 30rpx;
	}

	.upload-btn {
		background-color: #2d8cf0;
	}

	.review-btn {
		background-color: #19be6b;
	}

	.icon-upload, .icon-review {
		color: #ffffff;
		font-size: 50rpx;
		font-family: sans-serif;
	}
</style>
