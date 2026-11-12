# Chrome Web Store 上架清单（v1.0.0）

上传包：`store/zhihu-bill-helper-v1.0.0.zip`（已按商店要求只含运行文件）
商店截图：`store/screenshot-1280x800.png`（1280×800，商店要求的尺寸）
图标：`bill-128.png`（128×128，商店用）

---

## 1. 基本信息

| 项 | 内容 |
|---|---|
| 名称 | 知乎账单助手 |
| 简短描述（≤132 字符） | 在知乎余额页直接显示盐粒/知乎币/直播盐币折合人民币，盐粒明细一键导出 CSV。纯本地运行，不上传数据。 |
| 类目 | Productivity（生产力工具） |
| 语言 | 中文（简体） |
| 地区 | 所有地区 |

## 2. 详细描述（商店页）

```
你在知乎赚的钱，值多少人民币，一眼看清。

写文章拿了 5000 盐粒是 50 块还是 500 块？直播收的盐币又值多少？

【余额换算】
打开知乎「我的余额」页面，盐粒 / 知乎币 / 直播盐币的数字旁直接显示 ≈ ¥：
· 默认按官方提现比例换算（100 盐粒 = 1 元，知乎币 1:1）
· 点击标注可自定义汇率，保存在本地，下次打开仍是你的价
· 知乎页面更新后自动重新标注，无需刷新

【交易导出】
在盐粒明细页点扩展图标：
· 交易记录按 支出 / 收入 自动分组，分别显示合计
· 一键复制 CSV（带 BOM，Excel 打开中文不乱码）
· 可逐条删除不需要的记录

【隐私承诺】
· 纯本地运行：所有计算在你浏览器内完成
· 不收集、不上传、不分享任何数据
· 不需要知乎授权，只读取你已登录页面上的内容

【免责】
本扩展为第三方工具，非知乎官方出品，与知乎无隶属或合作关系；
直播盐币汇率按公开资料估算，实际以知乎官方结算为准；
知乎页面改版可能导致功能暂时失效，我们会持续更新。
```

## 3. 隐私规范（Dashboard 表单怎么填）

| 问题 | 填法 |
|---|---|
| Single purpose（单一用途） | Read the user's Zhihu balance and transaction pages to display CNY conversion inline and export records as CSV. |
| 是否收集用户数据？ | **No**（我们不收集、不传输任何数据） |
| 是否使用远程代码？ | **No**（全部 JS 打包在扩展内） |
| 内容脚本注入声明 | Yes — extension uses content scripts（会要求勾选，按提示勾即可） |
| host permission 理由 | `https://*.zhihu.com/*` — required to annotate balance values inline on Zhihu pages the user is viewing. |
| activeTab / scripting 理由 | Inject the parsing script into the current Zhihu tab when the user clicks the extension icon. |
| tabs 理由 | Detect whether the current tab is on zhihu.com before running. |
| sidePanel 理由 | Display the exported transaction table and CSV copy button. |

## 4. 隐私政策

商店不强制要求（因为我们不收集数据），但填了过审更稳。文案见 `docs/privacy-policy.md`，
建议发布到 `https://taoyijiu.xin/privacy` 后把 URL 填进 Dashboard。

## 5. 上传步骤（需要你操作，约 10 分钟）

1. 打开 https://chrome.google.com/webstore/devconsole ，用 Google 账号登录
2. 首次使用需付 **一次性 $5 注册费**（Visa/Master 信用卡；没有的话告诉我，走别的方式）
3. 「新增item」→ 上传 `store/zhihu-bill-helper-v1.0.0.zip`
4. 填「商店资料」：名称/描述复制上面第 2 节，上传 `bill-128.png` 和 `screenshot-1280x800.png`
5. 填「隐私规范」：按第 3 节填
6. 「分发」：公开 / 按链接（定价 $0——**扩展本身免费上架**，19.9 在站外卖，避免商店分成和付费墙审核）
7. 提交审核。新扩展首次审核通常 1～7 天

## 6. 注意

- 商店版免费 + 站外收费的卖法：商店里的版本可以加一个「已购买」激活逻辑，或干脆商店版即完整版、
  买家从你这里拿「售后服务资格」。先免费上架冲安装量，付费逻辑跑通前别急着加激活码。
- 每次发新版：改 manifest `version` → 重新打包 zip → Dashboard 上传更新。
