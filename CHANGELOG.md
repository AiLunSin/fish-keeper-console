# Changelog

本文件记录 Fish Keeper Console 的版本变更。格式参考 Keep a Changelog，版本号遵循 SemVer。

## [0.1.0] - 2026-11-11

首个公开版本。分发渠道：npm 包 [`dsh-fishkeeper@0.1.0`](https://www.npmjs.com/package/dsh-fishkeeper) 与 [Release 附件 zip](https://github.com/AiLunSin/fish-keeper-console/releases/download/v0.1.0/fish-keeper-console-0.1.0.zip)。

### 新增

- 多数据源只读总览：文件源（JSON/JSONL 自动识别）与 loopback HTTP 源。
- `fishtank` 预设：按 `dsh-fishtank@0.1.0` 的真实 `fish.json` 结构校准字段与 HTTP 端点。
- 审计时间线：日记与外部行为合并、分页、搜索、风险筛选、默认脱敏。
- 风险规则：邮箱、手机号、身份证校验位、银行卡 Luhn、地址、常见 API 密钥。
- 检查点：启动基线、手动检查点、diff、回滚、安全检查点、固定/删除、按源只读降级。
- 迁移：`.fishkeeper` 导出（full/share）、导入预检、参考导入，以及写入目标数据目录（备份、安全检查点、原子替换、身份校验、确认令牌）。
- 环境自检：数据目录、凭据权限、profile 依赖、插件运行时、`ffmpeg`、锁状态。
- 数据源设置面板：面板内新增/编辑/删除数据源，经 `configEditor` 持久化并自动重载。
- HTTP 源鉴权：`credentialKey` 指向 `api-key` 记录时附加 Bearer，401/403 明确提示。

### 已知限制

- 写回与回滚 `fish.json` 需要先停止 dsh-fishtank，避免其防抖保存覆盖外部写入。
- 真实 DSH 桌面壳内的视觉复核受本机 Web 端口鉴权限制；深浅色已在同源浏览器预览中检查。

[0.1.0]: https://github.com/AiLunSin/fish-keeper-console/releases/tag/v0.1.0
