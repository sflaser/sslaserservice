# 博客发布自动通知群

这个站点的博客不是 Markdown 文件仓库，而是通过 `/admin.html` 发布到 Supabase CMS。

现在已经接入自动通知逻辑：当你在后台保存一篇 `Published` 状态的新博客时，后台会调用 Netlify Function，然后把消息发到企业微信群。

## 你需要手动做的事

### 1. 在企业微信群里创建机器人

企业微信群里打开：

```text
群设置 -> 群机器人 -> 添加机器人
```

创建后复制 webhook：

```text
Webhook
```

Webhook 类似：

```text
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxx
```

### 2. 在 Netlify 里添加环境变量

进入 Netlify 项目：

```text
Site configuration -> Environment variables
```

添加：

```text
BLOG_SITE_URL = https://www.sslaserservice.com
SUPABASE_URL = https://ydbviiswxofxapccpibv.supabase.co
SUPABASE_ANON_KEY = assets/js/cms-config.js 里的 supabaseAnonKey
WECOM_WEBHOOK_URL = 企业微信群机器人 Webhook
```

不要把 webhook 写进仓库。

如果某天需要改成钉钉，函数里也保留了 `DINGTALK_WEBHOOK_URL` 和 `DINGTALK_SECRET` 兼容入口；但公司主流程只需要配置企业微信。

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
