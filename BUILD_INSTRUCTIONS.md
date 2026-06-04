# Chat Native 构建说明

## ⚠️ 当前服务器环境限制
当前服务器内存不足，无法进行本地 APK 构建。

## 推荐方案

### 方案 1: EAS 云端构建（最推荐）

```bash
# 1. 注册 Expo 账号（免费）
# 访问: https://expo.dev

# 2. 登录
npx eas login

# 3. 构建 APK
npx eas build --platform android --profile preview

# 4. 下载 APK
# 构建完成后会提供下载链接
```

### 方案 2: 在本地机器构建

将项目克隆到你的本地电脑（需要 8GB+ 内存）：

```bash
# 1. 安装依赖
npm install

# 2. 安装 JDK 17
# 下载: https://adoptium.net/

# 3. 设置环境变量
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/path/to/jdk-17

# 4. 构建
cd android
./gradlew assembleDebug

# 5. APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 方案 3: Expo Go 开发测试（无需构建）

```bash
# 1. 启动开发服务器
npm start

# 2. 手机安装 Expo Go
# Android: Play Store 搜索 "Expo Go"
# iOS: App Store 搜索 "Expo Go"

# 3. 扫码测试
# 用 Expo Go 扫描终端显示的二维码
```

## EAS 配置

项目已包含 `eas.json` 配置文件，支持以下构建类型：

- `development`: 开发版本
- `preview`: 内部测试 APK (推荐)
- `production`: 生产版本

## 环境要求

| 方案 | 内存要求 | 时间要求 |
|------|----------|----------|
| EAS 构建 | 无需 | 5-10 分钟 |
| 本地构建 | 8GB+ | 10-20 分钟 |
| Expo Go | 无需 | 实时 |
