# YTCoffee 后端接口文档

## 基础信息

- 基础URL: `https://hogskhzxeyyu.sealosbja.site`
- 所有请求和响应均使用 JSON 格式
- 认证方式：Bearer Token
- 图片上传大小限制：10MB
- 支持的图片格式：jpg、png、jpeg

## 通用响应格式

```json
{
  "code": 0,       // 0表示成功，非0表示失败
  "message": "",   // 提示信息
  "data": {}       // 响应数据，成功时返回
}
```

## 1. 用户认证接口

### 1.1 用户登录

**接口地址**：`/api/user/login`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| phoneNumber | string | 是 | 手机号码，11位 |
| password | string | 是 | 密码 |

**成功响应**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "10001",
      "phoneNumber": "13800138000",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "createTime": "2023-07-01 12:00:00",
      "root": 1  // 0表示管理员，1表示普通用户
    }
  }
}
```

**失败响应**：
```json
{
  "code": 1001,
  "message": "手机号不存在",
  "data": null
}
```
或
```json
{
  "code": 1002,
  "message": "密码错误",
  "data": null
}
```

### 1.2 用户注册

**接口地址**：`/api/user/register`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| phoneNumber | string | 是 | 手机号码，11位 |
| password | string | 是 | 密码，长度至少6位 |
| inviteCode | string | 否 | 邀请码，填写正确的邀请码将注册为管理员用户 |

**成功响应**：
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": "10001",
    "phoneNumber": "13800138000",
    "root": 1  // 0表示管理员，1表示普通用户
  }
}
```

**失败响应**：
```json
{
  "code": 2001,
  "message": "手机号已被注册",
  "data": null
}
```
或
```json
{
  "code": 2002,
  "message": "密码格式不正确",
  "data": null
}
```

## 2. 作品集接口

### 2.1 获取作品集列表

**接口地址**：`/api/portfolio/list`

**请求方式**：GET

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | integer | 否 | 页码，默认为1 |
| pageSize | integer | 否 | 每页条数，默认为20 |

**成功响应**：
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": "portfolio_id_1",
        "userPhone": "13800138000",
        "userNickname": "用户昵称",
        "imageArray": ["图片URL1", "图片URL2"],
        "likesTimes": ["13800138000", "13900139000"],
        "uploadTime": "2023-05-22 15:30"
      }
    ]
  }
}
```

### 2.2 切换点赞状态

**接口地址**：`/api/portfolio/like`

**请求方式**：POST

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| portfolioId | string | 是 | 作品集ID |

**成功响应**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "liked": true,  // true为点赞，false为取消点赞
    "likeCount": 10 // 当前点赞数
  }
}
```

**失败响应**：
```json
{
  "code": 4001,
  "message": "作品集不存在",
  "data": null
}
```

### 2.3 上传作品集

**接口地址**：`/api/portfolio/upload`

**请求方式**：POST

**请求头**：
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| images | file[] | 是 | 图片文件数组，最多9张 |

**成功响应**：
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "portfolioId": "portfolio_id_123",
    "status": "pending",  // 状态：pending(待审核), approved(已通过)
    "imageUrls": ["图片URL1", "图片URL2"]
  }
}
```

**失败响应**：
```json
{
  "code": 3001,
  "message": "图片数量超过限制",
  "data": null
}
```
或
```json
{
  "code": 3002,
  "message": "图片格式不支持",
  "data": null
}
```
或
```json
{
  "code": 3003,
  "message": "图片大小超过限制",
  "data": null
}
```

## 3. 审核接口

### 3.1 获取待审核作品集

**接口地址**：`/api/review/pending`

**请求方式**：GET

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | integer | 否 | 页码，默认为1 |
| pageSize | integer | 否 | 每页条数，默认为20 |

**成功响应**：
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 10,
    "list": [
      {
        "id": "pending_id_1",
        "uploader": "13900139000",
        "uploaderNickname": "用户昵称",
        "imageArray": ["图片URL1", "图片URL2"],
        "uploadTime": "2023-05-22 15:30"
      }
    ]
  }
}
```

### 3.2 获取已审核作品集

**接口地址**：`/api/review/list`

**请求方式**：GET

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| status | string | 是 | 状态：approved(已通过), rejected(已拒绝) |
| page | integer | 否 | 页码，默认为1 |
| pageSize | integer | 否 | 每页条数，默认为20 |

**成功响应**：
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 50,
    "list": [
      {
        "id": "portfolio_id_1",
        "uploader": "13900139000",
        "uploaderNickname": "用户昵称",
        "imageArray": ["图片URL1", "图片URL2"],
        "uploadTime": "2023-05-22 15:30",
        "reviewTime": "2023-05-22 16:30",
        "rejectReason": "图片不符合规范"  // 仅status为rejected时返回
      }
    ]
  }
}
```

### 3.3 审核作品集

**接口地址**：`/api/review/process`

**请求方式**：POST

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| portfolioId | string | 是 | 作品集ID |
| action | string | 是 | 操作：approve(通过), reject(拒绝) |
| reason | string | 否 | 拒绝原因，当action为reject时必填 |

**成功响应**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": "portfolio_id_1",
    "status": "approved"  // approved或rejected
  }
}
```

**失败响应**：
```json
{
  "code": 4001,
  "message": "作品集不存在",
  "data": null
}
```
或
```json
{
  "code": 4002,
  "message": "作品集状态不是待审核",
  "data": null
}
```
或
```json
{
  "code": 4003,
  "message": "拒绝时必须提供理由",
  "data": null
}
```

## 错误码说明

| 错误码 | 说明 |
| --- | --- |
| 1001 | 手机号不存在 |
| 1002 | 密码错误 |
| 2001 | 手机号已被注册 |
| 2002 | 密码格式不正确 |
| 3001 | 图片数量超过限制 |
| 3002 | 图片格式不支持 |
| 3003 | 图片大小超过限制 |
| 4001 | 作品集不存在 |
| 4002 | 作品集状态不是待审核 |
| 4003 | 拒绝时必须提供理由 |
| 401 | 未登录或token无效 |
| 403 | 无权限访问 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`
2. 图片上传大小限制为10MB，支持jpg、png、jpeg格式
3. 管理员权限接口（如审核相关接口）需要验证用户root属性为0
4. Token有效期为24小时，超时需重新登录
5. 所有时间格式均为ISO 8601标准 