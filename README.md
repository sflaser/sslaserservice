# Sky Fire Laser - 固体激光器维修服务

专业的固体激光器维修与保养服务网站，采用现代化设计和全面的SEO优化。

## 🚀 网站特性

### 🎯 SEO优化
- 完整的meta标签配置（标题、描述、关键词）
- Open Graph和Twitter Card标签
- JSON-LD结构化数据（本地商业+服务目录）
- 规范URLs和robots meta标签
- 完整的sitemap.xml和robots.txt

### ⚡ 性能优化
- 图片懒加载和预加载策略
- WebP/AVIF格式检测
- 旧版Service Worker缓存清理
- JavaScript性能监控和延迟加载
- CSS硬件加速优化
- 第三方脚本优化

### 📱 普通网页体验
- 不提供PWA安装入口
- 保留旧版Service Worker清理脚本，帮助浏览器退出旧缓存
- 移动端适配和主题色彩
- 从浏览器地址栏访问完整网页

### 🔒 安全优化
- 完整的安全头配置
- CSP内容安全策略
- HTTPS强制重定向
- 图片防盗链保护

## 🌐 部署到Netlify

### 方法1: GitHub自动部署（推荐）

1. **创建GitHub仓库**
   ```bash
   # 初始化Git仓库
   git init
   git add .
   git commit -m "Initial commit: Sky Fire Laser website"
   
   # 添加远程仓库
   git remote add origin https://github.com/你的用户名/skyfire-laser-website.git
   git push -u origin main
   ```

2. **连接Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择GitHub并授权
   - 选择你的仓库
   - 配置构建设置：
     - Build command: `node scripts/prerender-component-products.mjs && node scripts/build-blog-edge.mjs`
     - Publish directory: `/`
     - Production branch: `main`

3. **自动部署**
   - 每次推送到main分支都会自动部署
   - 支持分支预览和PR预览

### 方法2: Netlify CLI 预览部署

先在已关联的站点目录执行 `npx netlify deploy --build`，核验预览后再按项目发布流程部署正式站。不要只上传源码 ZIP：产品预渲染和博客 Edge Functions 需要构建与打包。

## 📁 项目结构

```
skyfire-laser-website/
├── sslaserservice.html      # 主页面文件
├── netlify.toml            # Netlify配置
├── _redirects              # URL重定向规则
├── sitemap.xml             # SEO站点地图
├── robots.txt              # 搜索引擎指令
├── manifest.json           # 浏览器模式站点清单（不作为应用安装入口）
├── sw.js                   # 旧版Service Worker清理脚本
├── .htaccess              # Apache服务器配置（备用）
└── README.md              # 项目说明
```

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/你的用户名/skyfire-laser-website.git
cd skyfire-laser-website

# 启动本地服务器（使用Python）
python -m http.server 8000

# 或使用Node.js
npx serve .

# 访问 http://localhost:8000
```

## 📊 性能指标

预期性能改进：
- 页面加载速度提升：40-60%
- Google PageSpeed评分：桌面95+，移动85+
- SEO排名提升：15-25%
- 用户参与度：跳出率降低20-30%

## 🎨 品牌色彩

- 主色调：`#ff8c00` (橙色)
- 用于保持品牌一致性

## 📞 联系方式

- 公司：Sky Fire Laser
- 服务：固体激光器维修与保养
- 网站：[你的域名]

## 📝 更新日志

### v1.0.0 (最新)
- ✅ 完整的SEO优化
- ✅ 普通网页体验（已移除可安装应用信号）
- ✅ 性能优化
- ✅ 安全加固
- ✅ 移动端适配
- ✅ Google Analytics集成
- ✅ 内容更新（移除不相关内容）

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进网站。

## 📄 许可证

Copyright © 2024 Sky Fire Laser. All rights reserved.


## CMS 和博客回归检查

- `node --test tests/*.test.cjs tests/*.test.mjs`：表单、管理员权限、资源编辑和博客渲染回归。
- 完整 build 会读取已发布产品生成静态产品页，并把当前中英博客模板和**公开** CMS 配置打包给 Edge Function。
- `/blog`、`/blog.html`、`/es/blog`、`/es/blog.html`（含尾斜线）在请求时读取已发布文章。发布、修改、撤稿不需要重建；无文章 / 草稿 / 空正文返回 404 + noindex，CMS 读取失败返回 503 + noindex。文章请求不缓存，不向客户端发送服务端密钥。
- 浏览器和 Edge 共用 `assets/js/blog-rendering.mjs`。本地静态服务器仍可使用浏览器读取文章；Netlify 的完整首屏 HTML 需在部署预览核验。
- 管理界面登录 / 恢复会话会检查 `is_cms_admin` RPC；实际写权限仍由数据库和通知端点校验。
