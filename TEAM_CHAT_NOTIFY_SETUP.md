# 博客发布自动通知群

这个站点的博客不是 Markdown 文件仓库，而是通过 `/admin.html` 发布到 Supabase CMS。

现在已经接入自动通知逻辑：当你在后台保存一篇 `Published` 状态的新博客时，后台会调用 Netlify Function，然后把消息发到钉钉群或企业微信群。

## 你需要手动做的事

### 1. 在钉钉群里创建机器人

钉钉群里打开：

```text
群设置 -> 智能群助手 -> 添加机器人 -> 自定义
```

建议安全设置选择“加签”。创建后复制：

```text
Webhook
加签 Secret
```

Webhook 类似：

```text
https://oapi.dingtalk.com/robot/send?access_token=xxxx
```

Secret 一般以 `SEC` 开头。

如果你用的是企业微信，也可以只配置企业微信机器人 webhook。

### 2. 在 Netlify 里添加环境变量

进入 Netlify 项目：

```text
Site configuration -> Environment variables
```

如果用钉钉，添加：

```text
DINGTALK_WEBHOOK_URL = 钉钉机器人 Webhook
DINGTALK_SECRET = 钉钉机器人加签 Secret
BLOG_SITE_URL = https://www.sslaserservice.com
SUPABASE_URL = https://ydbviiswxofxapccpibv.supabase.co
SUPABASE_ANON_KEY = assets/js/cms-config.js 里的 supabaseAnonKey
```

如果用企业微信，添加：

```text
WECOM_WEBHOOK_URL = 企业微信群机器人 Webhook
BLOG_SITE_URL = https://www.sslaserservice.com
SUPABASE_URL = https://ydbviiswxofxapccpibv.supabase.co
SUPABASE_ANON_KEY = assets/js/cms-config.js 里的 supabaseAnonKey
```

不要把 webhook 或 secret 写进仓库。

### 3. 推送代码并重新部署

```bash
git add assets/js/cms-admin.js netlify.toml netlify/functions/notify-blog-published.js TEAM_CHAT_NOTIFY_SETUP.md
git commit -m "Add blog publish team notification"
git push origin main
```

Netlify 部署完成后，自动通知就生效。

## 日常发布流程

1. 打开：

```text
https://www.sslaserservice.com/admin.html
```

2. 登录 CMS。
3. 写博客或导入 Markdown。
4. 把状态选为：

```text
Published
```

5. 点击：

```text
Save Blog Post
```

保存成功后，系统会自动把这篇博客发到群里。

如果你保存的是草稿，不会通知。  
如果你编辑一篇已经发布过的文章，也不会重复通知。
