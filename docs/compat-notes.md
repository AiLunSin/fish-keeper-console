# 目标鱼插件兼容笔记（M0 校准）

> 本文件记录对目标鱼插件 **dsh-fishtank** 的真实数据布局、字段与 HTTP 端点的校准结果。
> 结论来自已安装的插件源码，而不是猜测；样本文件见 [`demo/fishtank/fish.json`](../demo/fishtank/fish.json)。

## 1. 校准对象

| 项 | 值 |
|---|---|
| 插件包 | `dsh-fishtank@0.1.0` |
| 安装位置 | `%USERPROFILE%/.dsh/profiles/web/node_modules/dsh-fishtank` |
| Host 入口 | `index.js` |
| 数据实现 | `lib/fish.js` |
| 配置入口 | `cordis.patch.yml` → `config` |
| 浏览器端点 | `GET /fishtank/state`、`POST /fishtank/talk` |
| 工具入口 | `fishtank_talk`、`fishtank_status`、`fishtank_export`、`fishtank_import` |

## 2. 数据目录与文件

`lib/fish.js:97-98`：

```js
const dir = config.fishDir || join(homedir(), '.dsh', 'fishtank', String(config.id || 'default'))
const file = join(dir, 'fish.json')
```

- 默认目录：`~/.dsh/fishtank/default/`
- 唯一数据文件：`fish.json`
- 没有独立的 `diary/*.jsonl`、`river/*.jsonl`、`self.json` 或凭据目录。
- 插件把整份状态常驻内存，`flush()` 有防抖；运行期间外部改写 `fish.json` 可能被下一次保存覆盖。

## 3. `fish.json` 真实结构

`lib/fish.js:40-75` 的 `emptyState()` / `normalizeState()`：

```json
{
  "v": 1,
  "createdAt": 1762801200000,
  "mood": "安静",
  "energy": 0.64,
  "facts": [{ "text": "…", "when": "今天下午", "mood": "想知道", "why": "…", "at": 1762830000000 }],
  "people": { "主人": { "name": "主人", "warm": 0.82, "at": 1762830000000, "replied": 12 } },
  "whispers": [{ "text": "…", "at": 1762846800000 }],
  "reflections": [{ "text": "…", "at": 1762840000000 }],
  "diary": [{ "date": "2026-11-11", "text": "…" }],
  "self": { "text": "人格/自述", "at": 1762600000000 },
  "history": [{ "role": "user", "text": "…", "at": 1762846800000 }],
  "thought": { "day": "2026-11-11", "count": 2, "last": 1762839000000 },
  "reflect": { "day": "2026-11-11", "at": 1762840000000 }
}
```

要点：

- **日记在 `diary[]` 内**，条目只有 `{ date, text }`，`date` 是本地日期字符串，没有时间与时区。
- **私语在 `whispers[]`**，`{ text, at }`，`at` 是毫秒时间戳。
- **自省在 `reflections[]`**，`{ text, at }`。
- **对话在 `history[]`**，保留最近 60 条；不是日记，不进入审计时间线。
- **记忆在 `facts[]`**，**人格在 `self.text`**，二者都在同一个 `fish.json` 里。
- 没有公开/私有字段；插件本身把日记视为私有内容。

## 4. 字段映射（file 适配器，预设 `fishtank`）

| Fish Keeper 字段 | 来源 |
|---|---|
| `status.mood` | `fish.json.mood` |
| `status.energy` | `fish.json.energy` |
| `status.name` | `fish.json.self.name`（不存在时用数据源 `displayName`） |
| `status.lastActiveAt` | `history[].at` / `whispers[].at` / `reflections[].at` 的最大值；无则取最新日记日期 |
| `status.latestDiary` | `diary[]` 最后一条（`visibility = private`） |
| `status.latestWhisper` | `whispers[]` 最后一条 |
| `status.dataBytes` | `fish.json` 文件大小 |
| `status.channels` | 空（插件无渠道概念） |
| `timeline.diary.text` | `diary[].text` |
| `timeline.diary.time` | `diary[].date`（按本地日期解析） |
| `timeline.diary.visibility` | 固定 `private` |
| `timeline.external` | 空（插件没有外部事件） |
| `describe.identity` | `sha256("fishtank\0" + createdAt)`，可在导出/写回间比对同一只鱼 |

可用 `options.fieldMap` 覆盖（留空即用上表默认值）：

```yaml
options:
  preset: fishtank
  fieldMap:
    statusPath: fish.json
    diaryList: diary
    diaryText: text
    diaryTime: date
    whisperList: whispers
    mood: mood
    energy: energy
```

## 5. HTTP 端点校准

| 端点 | 方法 | 返回 | 用途 |
|---|---|---|---|
| `/fishtank/state` | GET | `view()`：mood、energy、createdAt、self、facts、people、whispers、reflections、diary、history | 状态 + 最近 3 条日记 |
| `/fishtank/talk` | POST `{ text, from }` | `talk()` 结果 | 说话（Fish Keeper 不调用） |

- 没有 `/diary`、`/events`、`/status` 路由。
- `view().diary` 只返回最近 **3** 条，`view().whispers` 返回最近 **5** 条。
- `view().history` 去掉了 `at`，因此 HTTP 模式无法用对话时间推断活跃时间；活跃时间回落到 `createdAt` 或最新日记日期。
- **两个路由都没有鉴权**。若未来通过反向代理加鉴权，可在数据源 `options.credentialKey` 指向一个 `api-key` 凭据记录；Host 会以 `Authorization: Bearer <key>` 发出请求，401/403 会显示为“凭据缺失或失效”。

HTTP 预设配置：

```yaml
- id: fishtank-http
  displayName: 目标鱼（HTTP）
  adapter: http
  location: 'http://127.0.0.1:3000'
  options:
    preset: fishtank
    # 可选：credentialKey: 'fishkeeper/gateway'
```

## 6. 回滚与写回评估

| 操作 | 结论 | 原因 |
|---|---|---|
| 读状态 / 日记 | 支持 | `fish.json` 可解析 |
| 检查点 | 支持，但**没有自动检查点** | 只有 `fish.json` 一个文件，角色是 `status`，不匹配自动触发角色（diary/persona/memory），避免每次保存都产生检查点 |
| 手动检查点 | 支持 | 快照整个 `fish.json` |
| 文件回滚 | 支持，属于**整状态回滚** | `fish.json` 是唯一文件；回滚会同时回退日记、记忆、人格与对话 |
| 迁移写回 | 支持（`import: true`） | 目标目录存在 `fish.json` 即可；写前备份、原子替换 |
| 外部事件 | 不支持 | 插件没有渠道/事件模型 |

**运行中写回的竞态**：dsh-fishtank 在内存中持有状态并防抖保存。控制台写回 `fish.json` 后，若插件仍在运行，下一次保存可能覆盖写回结果。正确做法是写回后重载/重启 `dsh-fishtank`；插件自带的 `fishtank_import` 工具可在运行中安全替换状态，但 Fish Keeper 不在鱼进程内，v1 仍采用“停插件 → 写文件 → 启插件”的运维约定。面板与 `describe.warnings` 都会提示这一点。

## 7. M0 样本

- 合成样本：[`demo/fishtank/fish.json`](../demo/fishtank/fish.json)
- 字段与真实 `normalizeState()` 一致，覆盖 4 条日记、3 条私语、2 条自省、6 条对话、3 条记忆、2 个关系。
- 冒烟测试会用这个样本断言：日记时间解析、私语映射、身份哈希、单文件检查点、写回。
- 若目标插件升级后改动字段，先更新本文件与样本，再改 `lib/sources.js` 的 `fishtankLayout()`。

---

> 本文件是非官方兼容说明，不包含 `dsh-fishtank` 的代码，也不代表其作者对本项目的背书。`dsh-fishtank` 及相关名称归其作者所有。
