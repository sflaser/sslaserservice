# 🚀 GitHub部署快速开始

## 方法1: 使用自动化脚本（推荐）

```bash
# 运行自动设置脚本
./setup-github.sh
```

## 方法2: 手动设置

### 步骤1: 初始化Git仓库
```bash
git init
git add .
git commit -m "Initial commit: Sky Fire Laser website"
```

### 步骤2: 创建GitHub仓库
1. 访问 [github.com](https://github.com) 并登录
2. 点击 "New repository"
3. 仓库名称：`skyfire-laser-website`
4. 描述：`Sky Fire Laser - 专业固体激光器维修服务网站`
5. 选择 Public
6. **不要**添加 README、.gitignore 或 license
7. 点击 "Create repository"

### 步骤3: 连接并推送
```bash
# 替换为你的GitHub用户名
git remote add origin https://github.com/你的用户名/skyfire-laser-website.git
git branch -M main
git push -u origin main
```

### 步骤4: 在Netlify设置自动部署
1. 访问 [netlify.com](https://netlify.com) 并登录
2. 点击 "New site from Git"
3. 选择 "GitHub" 并授权
4. 选择 `skyfire-laser-website` 仓库
5. 构建设置：
   - Build command: 留空
   - Publish directory: `/`
   - Production branch: `main`
6. 点击 "Deploy site"

## 🎉 完成！

部署成功后：
- 你的网站将有一个 `.netlify.app` 域名
- 每次推送代码到GitHub都会自动部署
- 支持自定义域名绑定

## 📚 详细文档

- 完整指南：[GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)
- 项目说明：[README.md](./README.md)

## 🛠️ 日常维护

```bash
# 修改网站后的更新流程
git add .
git commit -m "Update: 描述你的更改"
git push origin main
# Netlify会自动重新部署
``` 