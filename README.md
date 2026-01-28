# Qwen 声音克隆工具使用说明

本工具提供了完整的网页界面，用于调用阿里云通义千问（Qwen）TTS 声音克隆 API。

## 功能特性

- ✅ **创建音色**：上传音频样本（10-20秒），快速复刻专属音色
- ✅ **音色管理**：查询、使用、删除已创建的音色
- ✅ **语音合成**：使用复刻的音色将文本转为语音
- ✅ **实时播放**：边合成边播放音频
- ✅ **音频下载**：保存合成的语音为 WAV 文件
- ✅ **CORS 支持**：通过代理服务器解决跨域问题

---

## 目录

- [环境要求](#环境要求)
- [准备工作](#准备工作)
- [快速开始](#快速开始)
- [详细使用说明](#详细使用说明)
- [常见问题](#常见问题)
- [音频要求](#音频要求)

---

## 环境要求

### 必需软件

1. **Node.js** (建议 v16 或更高)
   - 下载地址：https://nodejs.org/
   - 验证安装：`node --version`

2. **Python 3** (可选，用于 HTTPS 服务器)
   - 下载地址：https://www.python.org/
   - 验证安装：`python3 --version`

3. **浏览器** (Chrome, Firefox, Safari, Edge)

### 操作系统

- macOS
- Linux
- Windows

---

## 准备工作

### 1. 获取阿里云 API Key

1. 访问阿里云百炼控制台：https://bailian.console.aliyun.com/?tab=model#/api-key
2. 登录阿里云账号
3. 点击「创建 API Key」
4. 复制生成的 API Key（格式：`sk-xxxxxxxx...`）

![API设置界面](https://raw.githubusercontent.com/qtwaiter/qwen-tts-clone-api/main/apiset.png)

⚠️ **注意**：
- 中国内地（北京）和国际站（新加坡）的 API Key 不同
- 确保你的 API Key 有访问语音合成服务的权限
- API Key 仅存储在你的本地浏览器中，不会上传到其他服务器

### 2. 下载工具

```bash
cd /Users/xiaweite/clawd/qwen-voice-clone
```

如果文件夹不存在，请先创建：

```bash
mkdir -p /Users/xiaweite/clawd/qwen-voice-clone
```

---

## 快速开始

### 方式一：使用 HTTP 服务器（推荐）

#### 1. 启动 WebSocket 代理服务器

```bash
cd /Users/xiaweite/clawd/qwen-voice-clone

# 安装依赖（首次运行）
npm run install-deps

# 启动代理服务器
npm start
```

你会看到：

```
[Proxy] Starting WebSocket Proxy Server...
[Proxy] Server running on http://127.0.0.1:3001
[Proxy] WebSocket endpoint: ws://127.0.0.1:3001/proxy
[Proxy] Ready for connections...
```

#### 2. 启动 HTTP 服务器

打开新的终端窗口，选择以下任一方式：

**方式一：使用 Node.js（推荐，无需安装）**

```bash
cd /Users/xiaweite/clawd/qwen-voice-clone
npx http-server -p 8080
```

**方式二：使用 Python 3**

```bash
cd /Users/xiaweite/clawd/qwen-voice-clone
python3 -m http.server 8080
```

**方式三：使用 Python 2**

```bash
cd /Users/xiaweite/clawd/qwen-voice-clone
python -m SimpleHTTPServer 8080
```

你会看到类似输出：

```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.1.x:8080
Hit CTRL-C to stop the server
```

#### 3. 访问网页

在浏览器中打开：http://localhost:8080

#### 4. 配置设置

1. 点击「设置」标签页
2. 输入你的 API Key
3. 选择服务地域（中国内地/国际站）
4. 选择语音合成模型（建议使用 `qwen3-tts-vc-realtime-2026-01-15`）
5. 确认「WebSocket 代理地址」是 `ws://localhost:3001/proxy`
6. 点击「保存设置」
7. 点击「测试连接」，确保连接成功

### 方式二：使用 HTTPS 服务器（无需代理）

如果你不想使用代理服务器，可以使用 HTTPS 服务器：

```bash
# 生成自签名证书（首次运行）
cd /Users/xiaweite/clawd/qwen-voice-clone
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

# 启动 HTTPS 服务器
python3 -m http.server 8443 --certfile cert.pem --keyfile key.pem
```

然后在浏览器中访问：https://localhost:8443

浏览器会提示证书不受信任，点击「继续访问」即可。

使用 HTTPS 服务器时，在「设置」页面将「WebSocket 代理地址」留空即可。

---

## 详细使用说明

### 1. 创建音色

#### 步骤

1. 点击「创建音色」标签页
2. 输入音色名称（用于识别，如：`my_voice`）
3. 点击「选择音频文件」上传音频样本
4. 点击「创建音色」按钮

![创建音色界面](https://raw.githubusercontent.com/qtwaiter/qwen-tts-clone-api/main/create.png)

#### 音频要求

| 项目 | 要求 |
|------|------|
| 格式 | WAV (16bit)、MP3、M4A |
| 时长 | 推荐 10-20 秒，最长不超过 60 秒 |
| 文件大小 | < 10 MB |
| 采样率 | ≥ 24 kHz |
| 声道 | 单声道 |
| 内容 | 清晰朗读，无背景音、噪音或其他人声 |
| 语言 | 中文、英文、德语、意大利语、葡萄牙语、西班牙语、日语、韩语、法语、俄语 |

#### 录音建议

**环境：**
- 选择 10 平方米以内的小型封闭空间
- 关闭门窗，隔绝外部噪音
- 关闭空调、风扇、日光灯等设备
- 拉上窗帘，减少玻璃反射

**设备：**
- 使用具备降噪功能的麦克风
- 或在安静环境下使用手机近距离录音
- 与录音设备保持约 10 厘米距离

**内容：**
- 避免短句（如"你好"），使用完整句子
- 保持语义连贯，朗读时避免频繁停顿
- 语音内容应与目标应用场景一致

### 2. 我的音色

#### 查询音色列表

1. 点击「我的音色」标签页
2. 点击「🔄 刷新列表」按钮

#### 操作

- **使用**：点击音色右侧的「使用」按钮，直接跳转到语音合成页面
- **删除**：点击音色右侧的「删除」按钮，删除不再需要的音色

### 3. 语音合成

#### 步骤

1. 点击「语音合成」标签页
2. 从下拉菜单中选择已创建的音色
3. 在文本框中输入要合成的文本
4. 点击「开始合成」按钮

![语音合成界面](https://raw.githubusercontent.com/qtwaiter/qwen-tts-clone-api/main/clone.png)

#### 文本输入

- 支持中文、英文等多种语言
- 建议单次输入 500 字以内
- 长文本会自动分段处理

#### 输出

- 合成过程中会实时播放音频
- 合成完成后可以在线试听
- 点击「下载音频」保存为 WAV 文件

### 4. 设置

#### 参数说明

| 参数 | 说明 |
|------|------|
| DashScope API Key | 阿里云 API 密钥，必填 |
| 服务地域 | 中国内地（北京）/ 国际站（新加坡），需与 API Key 对应 |
| 语音合成模型 | 推荐使用 `qwen3-tts-vc-realtime-2026-01-15` |
| WebSocket 代理地址 | 代理服务器地址，HTTP 网页必填，HTTPS 网页留空 |

#### 测试连接

点击「测试连接」按钮，验证 API 配置是否正确。

成功后会显示：
- HTTP 状态码
- 完整的 API 响应
- 你的音色列表

失败会显示错误信息，请检查：
- API Key 是否正确
- 服务地域是否与 API Key 对应
- 网络连接是否正常

#### 运行日志

「运行日志」区域会显示所有操作日志，包括：
- 连接状态
- 发送的消息
- 接收的响应
- 错误信息

可以点击「清空日志」或「导出日志」进行管理。

---

## 常见问题

### Q1: 提示「Failed to fetch」

**原因**：CORS（跨域）限制

**解决方法**：
1. 确保启动了 WebSocket 代理服务器（`npm start`）
2. 确保在「设置」页面勾选了「使用 CORS 代理」
3. 确保通过 `http://localhost:8080` 或 `https://localhost:8443` 访问网页

### Q2: 提示「Missing API Key」

**原因**：未设置 API Key

**解决方法**：
1. 进入「设置」页面
2. 输入你的阿里云 API Key
3. 点击「保存设置」

### Q3: 创建音色失败

**可能原因**：
- 音频文件不符合要求（格式、时长、采样率等）
- 音频内容不清晰，有背景噪音
- API Key 无权限或额度不足

**解决方法**：
- 检查音频文件是否符合[音频要求](#音频要求)
- 重新录制清晰的音频
- 查看「运行日志」获取详细错误信息

### Q4: 语音合成失败

**可能原因**：
- 音色 ID 不正确或已过期
- 文本内容包含特殊字符
- WebSocket 连接中断

**解决方法**：
- 在「我的音色」页面确认音色是否存在
- 使用简洁的文本进行测试
- 确保代理服务器正在运行

### Q5: WebSocket 连接失败

**原因**：代理服务器未启动或端口被占用

**解决方法**：
```bash
# 检查代理服务器是否运行
lsof -i :3001

# 如果端口被占用，可以更换端口
# 编辑 proxy-server.js，修改 PORT 变量
```

### Q6: API Key 在哪里查看？

进入阿里云百炼控制台：https://bailian.console.aliyun.com/?tab=model#/api-key

### Q7: 如何获取更多免费额度？

阿里云百炼新用户开通后 90 天内，可享 1000 次免费音色创建机会。

查看更多信息：https://help.aliyun.com/zh/model-studio/qwen-tts-voice-cloning#a162110bff6c4

### Q8: 音色会自动删除吗？

是的，如果单个音色在过去一年内未被用于任何语音合成请求，系统会自动将其删除。

---

## 音频要求

### 创建音色的音频样本

#### 格式要求

- **支持格式**：WAV (16bit)、MP3、M4A
- **文件大小**：< 10 MB
- **采样率**：≥ 24 kHz，推荐 48 kHz
- **声道**：单声道
- **位深**：16 bit

#### 内容要求

- **时长**：推荐 10-20 秒，最长不超过 60 秒
- **内容**：至少包含 3 秒连续清晰的朗读
- **语言**：中文、英文、德语、意大利语、葡萄牙语、西班牙语、日语、韩语、法语、俄语

#### 录音环境

**推荐环境：**
- 10 平方米以内的小型封闭空间
- 配有吸音材料（吸音棉、地毯、窗帘）的房间
- 避免空旷大厅、会议室、教室等高混响场所

**噪音控制：**
- 关闭门窗，隔绝外部噪音
- 关闭空调、风扇、日光灯等电器
- 避免背景音乐、噪音或其他人声

#### 录音文案

- 文案内容应与目标应用场景一致
- 避免短句，使用完整句子
- 保持语义连贯，朗读时避免频繁停顿
- 可以带入目标情绪（亲切、严肃等），但避免过度夸张

**示例文案：**
```
今天天气真好，我们一起去公园散步吧。你看，那边有小鸟在树枝上唱歌，真是太美妙了。
```

---

## 技术说明

### 架构

```
浏览器 → HTTP 服务器 → index.html
                ↓
        WebSocket 代理 (3001 端口)
                ↓
      阿里云 DashScope API
```

### 端口说明

| 端口 | 用途 |
|------|------|
| 3001 | WebSocket 代理服务器 |
| 8080 | HTTP 静态文件服务器 |
| 8443 | HTTPS 静态文件服务器（可选）|

### 代理服务器

代理服务器的作用：
- 解决 HTTP 网页访问 HTTPS API 的跨域问题
- 转发 WebSocket 请求到阿里云
- 添加详细的调试日志

---

## 文件说明

```
qwen-voice-clone/
├── index.html          # 主网页文件
├── proxy-server.js     # WebSocket 代理服务器
├── package.json        # Node.js 依赖配置
├── README.md           # 本文档
├── cert.pem          # HTTPS 证书（自动生成）
└── key.pem           # HTTPS 私钥（自动生成）
```

---

## 隐私与安全

- API Key 仅存储在本地浏览器的 `localStorage` 中
- 不会上传到任何第三方服务器
- 代理服务器仅用于转发请求，不会记录 API Key
- 建议定期更换 API Key

---

## 许可与版权

- 本工具仅供个人学习和使用
- 请勿上传侵犯他人隐私或版权的音频
- 你需对所提供声音的所有权及合法使用权负责
- 相关服务条款：https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20240229113512917/20240229113512917.html

---

## 更新日志

### v1.0.0 (2026-01-28)

- ✅ 支持创建音色
- ✅ 支持查询音色列表
- ✅ 支持删除音色
- ✅ 支持语音合成
- ✅ 支持实时播放
- ✅ 支持 CORS 代理
- ✅ 支持音频下载

---

## 获取帮助

如遇到问题：

1. 查看「运行日志」获取详细错误信息
2. 点击「导出日志」保存日志
3. 查看本文档的[常见问题](#常见问题)章节
4. 访问阿里云官方文档：https://help.aliyun.com/zh/model-studio/qwen-tts-voice-cloning

---

## 贡献

欢迎提出建议和反馈！

---

**祝你使用愉快！** 🎙️
