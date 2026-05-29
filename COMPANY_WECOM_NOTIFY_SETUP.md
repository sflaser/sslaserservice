# 公司统一企业微信通知入口

这个入口用于把不同网站的工作状态统一发到企业微信群：

- `sslaserservice.com`
- `alleriastore.com`
- `laserpodcast.com`
- `small-laser.com`

统一接口：

```text
https://www.sslaserservice.com/.netlify/functions/company-work-notify
```

## 1. Netlify 环境变量

在 `sslaserservice` 的 Netlify 项目里添加：

```text
WECOM_WEBHOOK_URL = 企业微信群机器人 webhook
NOTIFY_INGEST_SECRET = 自己设置一个长一点的随机口令
```

`NOTIFY_INGEST_SECRET` 用来防止别人随便调用这个通知入口。

## 2. Codex 完成工作后发通知

本仓库已经有脚本：

```text
scripts/send-company-work-notify.mjs
```

用法：

```bash
export NOTIFY_INGEST_SECRET="你在 Netlify 设置的口令"

node scripts/send-company-work-notify.mjs \
  --site alleriastore.com \
  --type blog \
  --title "新博客标题" \
  --url "https://alleriastore.com/blogs/news/example" \
  --summary "这篇博客已经发布，主要讲..."
```

之后你可以直接对 Codex 说：

```text
发布完成后，调用 company work notify，通知企业微信群。
```

## 3. Shopify Flow 接入

如果 Shopify 店铺有 Shopify Flow，并且套餐支持 `Send HTTP request`，可以这样配置：

1. 打开 Shopify Admin。
2. 进入 `Apps -> Shopify Flow`。
3. 新建 workflow。
4. 选择触发器，例如：

```text
Product created
Order created
Product status updated
```

5. 添加 action：

```text
Send HTTP request
```

6. 配置：

```text
Method: POST
URL: https://www.sslaserservice.com/.netlify/functions/company-work-notify
Header:
  Content-Type: application/json
  X-Notify-Secret: 你在 Netlify 设置的口令
Body:
{
  "site": "alleriastore.com",
  "type": "product",
  "title": "{{ product.title }}",
  "url": "https://alleriastore.com/products/{{ product.handle }}",
  "summary": "Shopify product event from Flow",
  "status": "{{ product.status }}",
  "actor": "Shopify Flow"
}
```

`laserpodcast.com` 和 `small-laser.com` 只需要把 `site` 和 URL 域名改掉。

## 4. Shopify 普通 Webhook 接入

如果不用 Shopify Flow，也可以在 Shopify 后台创建普通 webhook，把产品/订单事件发到：

```text
https://www.sslaserservice.com/.netlify/functions/company-work-notify?token=你的口令
```

适合的事件：

```text
Product creation
Product update
Order creation
Order payment
```

注意：Shopify 标准 webhook 更适合产品和订单；我目前没有看到稳定的标准博客文章发布 webhook。Shopify 博客建议通过 Codex 发布脚本后通知，或者后续加一个定时轮询脚本。

## 5. 推荐日常流程

### 静态站 / Supabase CMS

`sslaserservice.com` 已经接好：后台发布博客后自动通知。

### Shopify 站点

产品、订单这类事件：用 Shopify Flow 或 Shopify Webhook 自动通知。

博客、页面、SEO 修复这类由 Codex 完成的工作：让 Codex 在发布脚本最后调用：

```text
scripts/send-company-work-notify.mjs
```

这样能覆盖 `alleriastore.com`、`laserpodcast.com`、`small-laser.com`，而不需要每个 Shopify 站都维护一套代码。
