window.__ModuleLoader__.load({
  id: 'dsh-fishkeeper',
  factory(require) {
    const module = { exports: {} };
    (function (module, exports, require) {
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// locale/en.json
var en_default = {
  meta: {
    title: "Fish Keeper",
    description: "Read-only audit, checkpoints, migration, and environment checks for DSH fish."
  },
  panel: "Fish Keeper",
  title: "Fish Keeper",
  subtitle: "Read-only audit and protection for your fish.",
  "tab.overview": "Overview",
  "tab.timeline": "Timeline",
  "tab.checkpoints": "Checkpoints",
  "tab.migration": "Migration",
  "tab.doctor": "Doctor",
  "tab.settings": "Sources",
  "action.refresh": "Refresh",
  "action.retry": "Retry",
  "action.createCheckpoint": "Create checkpoint",
  "action.restore": "Restore",
  "action.cancel": "Cancel",
  "action.confirm": "Confirm",
  "action.close": "Close",
  "action.pin": "Pin",
  "action.unpin": "Unpin",
  "action.delete": "Delete",
  "action.loadMore": "Load more",
  "action.showOriginal": "Show original",
  "action.hideOriginal": "Hide original",
  "action.copyReport": "Copy report",
  "action.export": "Export",
  "action.preflight": "Preflight",
  "action.import": "Import",
  "action.openPath": "Copy path",
  "status.writer": "Writable",
  "status.readonly": "Read-only",
  "status.loading": "Loading\u2026",
  "status.empty": "No data sources configured yet.",
  "status.error": "Error",
  "status.ok": "OK",
  "status.warn": "Warning",
  "status.fail": "Failed",
  "status.unknown": "Unknown",
  "status.truncated": "Only the most recent records are indexed.",
  "overview.emptyTitle": "No fish yet",
  "overview.emptyBody": "Add a data source in the plugin configuration, then refresh.",
  "overview.lastActive": "Last active",
  "overview.mood": "Mood",
  "overview.energy": "Energy",
  "overview.latestDiary": "Latest diary",
  "overview.latestWhisper": "Latest whisper",
  "overview.channels": "Channels",
  "overview.dataPath": "Data path",
  "overview.size": "Size",
  "overview.noDiary": "No diary entries found.",
  "overview.noChannels": "No channels detected.",
  "overview.sourceError": "This source could not be read.",
  "overview.protection": "Protection starts when the console first runs.",
  "timeline.title": "Audit timeline",
  "timeline.searchPlaceholder": "Search text",
  "timeline.allSources": "All sources",
  "timeline.riskOnly": "Risk only",
  "timeline.noItems": "No matching records.",
  "timeline.truncated": "Some sources exceeded the scan limit; narrow the filters.",
  "timeline.source": "Source",
  "timeline.channel": "Channel",
  "timeline.private": "Private",
  "timeline.public": "Public",
  "timeline.unknown": "Unknown",
  "timeline.hits": "Risk hits",
  "timeline.detailTitle": "Record detail",
  "timeline.revealHint": "The original text is fetched only for this entry and is not cached.",
  "timeline.loaded": "{count} records shown",
  "checkpoints.title": "Checkpoints",
  "checkpoints.empty": "No checkpoints yet. They are created when a tracked file changes.",
  "checkpoints.createHint": "Create a checkpoint before editing persona or memory files.",
  "checkpoints.trigger": "Trigger",
  "checkpoints.files": "Files",
  "checkpoints.size": "Stored",
  "checkpoints.pinned": "Pinned",
  "checkpoints.diff": "Diff preview",
  "checkpoints.restoreTitle": "Restore checkpoint",
  "checkpoints.restoreWarning": "Restore writes the selected files back to their recorded before-state. The event stream is never rewritten.",
  "checkpoints.staleWarning": "These files changed after the checkpoint. Restoring will discard the newer content unless you explicitly allow it.",
  "checkpoints.restoreConfirm": "I understand and want to restore these files",
  "checkpoints.restoreDone": "Restored {count} files.",
  "checkpoints.unsupported": "This source does not support restore; checkpoints are for audit and migration only.",
  "checkpoints.noDiff": "No text diff was stored for this file.",
  "checkpoints.safety": "A safety checkpoint was created first.",
  "checkpoints.select": "Select a checkpoint to inspect it.",
  "checkpoints.trigger.diary": "Diary change",
  "checkpoints.trigger.persona": "Persona change",
  "checkpoints.trigger.memory": "Memory change",
  "checkpoints.trigger.manual": "Manual",
  "checkpoints.trigger.baseline": "Baseline",
  "checkpoints.trigger.pre-restore": "Pre-restore safety",
  "checkpoints.trigger.pre-import": "Pre-import safety",
  "doctor.title": "Environment check",
  "doctor.overall": "Overall",
  "doctor.check": "Check",
  "doctor.evidence": "Evidence",
  "doctor.remediation": "Suggested fix",
  "doctor.refreshHint": "Checks are read-only. Nothing is installed or modified.",
  "doctor.copied": "Report copied to the clipboard.",
  "migration.title": "Migration",
  "migration.exportTitle": "Export a .fishkeeper package",
  "migration.importTitle": "Import a .fishkeeper package",
  "migration.mode": "Mode",
  "migration.modeFull": "Full (includes data)",
  "migration.modeShare": "Share (metadata only)",
  "migration.includeCheckpoints": "Include checkpoints",
  "migration.exportHint": "Full mode copies tracked data. Share mode omits diary text, memory text, credentials, and checkpoint blobs.",
  "migration.exportDone": "Package written to {path}",
  "migration.importHint": "Paste the absolute path of a .fishkeeper package. Reference import extracts into the console data root only and never writes fish plugin data.",
  "migration.importMode": "Import mode",
  "migration.modeReference": "Reference import",
  "migration.modeWrite": "Write to target data directory",
  "migration.target": "Target source",
  "migration.targetPlaceholder": "Choose a target source",
  "migration.writeHint": "Write-back backs up the target fish.json, creates a safety checkpoint, then replaces the file atomically. Reload dsh-fishtank afterwards so its in-memory state does not overwrite the import.",
  "migration.noWriteTargets": "No file source supports write-back. Set preset to fishtank or options.allowImport: true under Sources first.",
  "migration.overwriteConfirm": "The target already holds data; overwrite it (a backup is kept)",
  "migration.writePlan": "Target: {target} \xB7 {files} files \xB7 identity: {identity}",
  "migration.writeDone": "Wrote to target data directory {path}",
  "migration.writeNote": "Reload dsh-fishtank before inspecting the result; the backup is kept next to the imports directory.",
  "migration.backupPath": "Backup: {path}",
  "migration.pathPlaceholder": "C:/path/to/fish.fishkeeper",
  "migration.preflightDone": "Preflight finished.",
  "migration.verdict.ok": "Ready to import",
  "migration.verdict.missing-dependencies": "Missing dependencies",
  "migration.verdict.incompatible": "Incompatible",
  "migration.verdict.corrupt": "Package is corrupt",
  "migration.verdict.unsafe": "Unsafe package",
  "migration.verdict.blocked": "Target not writable",
  "migration.importDone": "Reference copy written to {path}",
  "migration.referenceNote": "Reference-only import does not modify any fish plugin data directory.",
  "settings.title": "Data sources",
  "settings.hint": "Add, edit, or remove data sources. Saving reloads the plugin; changing an id leaves existing checkpoints under the old id.",
  "settings.dataRoot": "Console data root",
  "settings.add": "Add source",
  "settings.save": "Save",
  "settings.saving": "Saving\u2026",
  "settings.saved": "Configuration saved.",
  "settings.reloadHint": "The plugin is reloading. If the panel does not refresh automatically, retry in a moment.",
  "settings.empty": 'No sources yet. Click "Add source" to start.',
  "settings.id": "ID",
  "settings.displayName": "Display name",
  "settings.adapter": "Adapter",
  "settings.location": "Location",
  "settings.enabled": "Enabled",
  "settings.preset": "Preset",
  "settings.presetNone": "None (auto-detect)",
  "settings.presetFishtank": "dsh-fishtank",
  "settings.options": "Advanced options (JSON)",
  "settings.optionsHint": "File sources accept fieldMap; HTTP sources accept credentialKey, statusPath, allowRemote, and so on.",
  "settings.delete": "Delete",
  "settings.invalidOptions": "Advanced options must be a JSON object.",
  "settings.writeBackHint": "Write-back is available only for file sources with preset=fishtank or options.allowImport: true. HTTP sources never participate in write-back.",
  "error.title": "Request failed",
  "error.generic": "Something went wrong. Check the Host log for details.",
  "error.network": "Cannot reach the Host. Refresh the page and try again.",
  "error.notReady": "The console is still starting. Try again in a moment.",
  "error.overview": "Could not load the overview.",
  "error.timeline": "Could not load the timeline.",
  "error.checkpoints": "Could not load checkpoints.",
  "error.doctor": "Could not run the environment check.",
  "rule.pii.email": "Email address",
  "rule.pii.phone_cn": "Phone number",
  "rule.pii.id_cn": "National ID",
  "rule.pii.bank_card": "Bank card",
  "rule.pii.address_cn": "Address",
  "rule.secret.api_key": "API key",
  "rule.topic.sensitive": "Sensitive topic",
  "rule.topic.controversy": "Controversial topic",
  "kind.diary": "Diary",
  "kind.comment": "Comment",
  "kind.reply": "Reply",
  "kind.post": "Post",
  "common.source": "Source",
  "common.time": "Time",
  "common.kind": "Kind",
  "common.actions": "Actions",
  "common.none": "None"
};

// locale/zh.json
var zh_default = {
  meta: {
    title: "\u517B\u9C7C\u4EBA\u63A7\u5236\u53F0",
    description: "\u9762\u5411 DSH \u517B\u9C7C\u4EBA\u7684\u53EA\u8BFB\u5BA1\u8BA1\u3001\u68C0\u67E5\u70B9\u3001\u8FC1\u79FB\u4E0E\u73AF\u5883\u81EA\u68C0\u5DE5\u5177\u3002"
  },
  panel: "\u517B\u9C7C\u4EBA\u63A7\u5236\u53F0",
  title: "\u517B\u9C7C\u4EBA\u63A7\u5236\u53F0",
  subtitle: "\u53EA\u8BFB\u5BA1\u8BA1\u4E0E\u4FDD\u62A4\u4F60\u7684\u9C7C\u3002",
  "tab.overview": "\u603B\u89C8",
  "tab.timeline": "\u5BA1\u8BA1\u65F6\u95F4\u7EBF",
  "tab.checkpoints": "\u68C0\u67E5\u70B9",
  "tab.migration": "\u8FC1\u79FB",
  "tab.doctor": "\u73AF\u5883\u81EA\u68C0",
  "tab.settings": "\u6570\u636E\u6E90\u8BBE\u7F6E",
  "action.refresh": "\u5237\u65B0",
  "action.retry": "\u91CD\u8BD5",
  "action.createCheckpoint": "\u521B\u5EFA\u68C0\u67E5\u70B9",
  "action.restore": "\u56DE\u6EDA",
  "action.cancel": "\u53D6\u6D88",
  "action.confirm": "\u786E\u8BA4",
  "action.close": "\u5173\u95ED",
  "action.pin": "\u56FA\u5B9A",
  "action.unpin": "\u53D6\u6D88\u56FA\u5B9A",
  "action.delete": "\u5220\u9664",
  "action.loadMore": "\u52A0\u8F7D\u66F4\u591A",
  "action.showOriginal": "\u663E\u793A\u539F\u6587",
  "action.hideOriginal": "\u9690\u85CF\u539F\u6587",
  "action.copyReport": "\u590D\u5236\u62A5\u544A",
  "action.export": "\u5BFC\u51FA",
  "action.preflight": "\u5BFC\u5165\u9884\u68C0",
  "action.import": "\u5BFC\u5165",
  "action.openPath": "\u590D\u5236\u8DEF\u5F84",
  "status.writer": "\u53EF\u5199",
  "status.readonly": "\u53EA\u8BFB\u964D\u7EA7",
  "status.loading": "\u52A0\u8F7D\u4E2D\u2026",
  "status.empty": "\u8FD8\u6CA1\u6709\u914D\u7F6E\u6570\u636E\u6E90\u3002",
  "status.error": "\u9519\u8BEF",
  "status.ok": "\u6B63\u5E38",
  "status.warn": "\u8B66\u544A",
  "status.fail": "\u5931\u8D25",
  "status.unknown": "\u672A\u77E5",
  "status.truncated": "\u4EC5\u7D22\u5F15\u4E86\u6700\u8FD1\u7684\u8BB0\u5F55\u3002",
  "overview.emptyTitle": "\u8FD8\u6CA1\u6709\u9C7C",
  "overview.emptyBody": "\u5728\u63D2\u4EF6\u914D\u7F6E\u4E2D\u6DFB\u52A0\u6570\u636E\u6E90\uFF0C\u7136\u540E\u5237\u65B0\u3002",
  "overview.lastActive": "\u6700\u8FD1\u6D3B\u52A8",
  "overview.mood": "\u60C5\u7EEA",
  "overview.energy": "\u7CBE\u529B",
  "overview.latestDiary": "\u6700\u8FD1\u65E5\u8BB0",
  "overview.latestWhisper": "\u6700\u8FD1\u79C1\u8BED",
  "overview.channels": "\u6E20\u9053",
  "overview.dataPath": "\u6570\u636E\u76EE\u5F55",
  "overview.size": "\u5360\u7528",
  "overview.noDiary": "\u6CA1\u6709\u627E\u5230\u65E5\u8BB0\u3002",
  "overview.noChannels": "\u6CA1\u6709\u68C0\u6D4B\u5230\u6E20\u9053\u3002",
  "overview.sourceError": "\u8FD9\u4E2A\u6570\u636E\u6E90\u8BFB\u53D6\u5931\u8D25\u3002",
  "overview.protection": "\u4FDD\u62A4\u4ECE\u63A7\u5236\u53F0\u9996\u6B21\u8FD0\u884C\u5F00\u59CB\u3002",
  "timeline.title": "\u5BA1\u8BA1\u65F6\u95F4\u7EBF",
  "timeline.searchPlaceholder": "\u641C\u7D22\u6B63\u6587",
  "timeline.allSources": "\u5168\u90E8\u6570\u636E\u6E90",
  "timeline.riskOnly": "\u53EA\u770B\u98CE\u9669",
  "timeline.noItems": "\u6CA1\u6709\u5339\u914D\u7684\u8BB0\u5F55\u3002",
  "timeline.truncated": "\u90E8\u5206\u6570\u636E\u6E90\u8D85\u8FC7\u626B\u63CF\u4E0A\u9650\uFF0C\u8BF7\u7F29\u5C0F\u7B5B\u9009\u8303\u56F4\u3002",
  "timeline.source": "\u6570\u636E\u6E90",
  "timeline.channel": "\u6E20\u9053",
  "timeline.private": "\u79C1\u5BC6",
  "timeline.public": "\u516C\u5F00",
  "timeline.unknown": "\u672A\u77E5",
  "timeline.hits": "\u98CE\u9669\u547D\u4E2D",
  "timeline.detailTitle": "\u8BB0\u5F55\u8BE6\u60C5",
  "timeline.revealHint": "\u539F\u6587\u53EA\u5BF9\u5F53\u524D\u8BB0\u5F55\u6309\u9700\u8BFB\u53D6\uFF0C\u4E0D\u843D\u76D8\u3001\u4E0D\u7F13\u5B58\u3002",
  "timeline.loaded": "\u5DF2\u663E\u793A {count} \u6761",
  "checkpoints.title": "\u68C0\u67E5\u70B9",
  "checkpoints.empty": "\u8FD8\u6CA1\u6709\u68C0\u67E5\u70B9\u3002\u53D7\u8DDF\u8E2A\u6587\u4EF6\u53D1\u751F\u53D8\u5316\u65F6\u4F1A\u81EA\u52A8\u521B\u5EFA\u3002",
  "checkpoints.createHint": "\u4FEE\u6539\u4EBA\u8BBE\u6216\u8BB0\u5FC6\u6587\u4EF6\u524D\uFF0C\u5EFA\u8BAE\u5148\u624B\u52A8\u521B\u5EFA\u4E00\u4E2A\u68C0\u67E5\u70B9\u3002",
  "checkpoints.trigger": "\u89E6\u53D1\u539F\u56E0",
  "checkpoints.files": "\u6587\u4EF6\u6570",
  "checkpoints.size": "\u5360\u7528",
  "checkpoints.pinned": "\u5DF2\u56FA\u5B9A",
  "checkpoints.diff": "\u5DEE\u5F02\u9884\u89C8",
  "checkpoints.restoreTitle": "\u56DE\u6EDA\u68C0\u67E5\u70B9",
  "checkpoints.restoreWarning": "\u56DE\u6EDA\u4F1A\u628A\u9009\u4E2D\u7684\u6587\u4EF6\u5199\u56DE\u68C0\u67E5\u70B9\u8BB0\u5F55\u7684\u53D8\u66F4\u524D\u72B6\u6001\uFF1B\u4E8B\u4EF6\u6D41\u6C38\u8FDC\u4E0D\u4F1A\u88AB\u6539\u5199\u3002",
  "checkpoints.staleWarning": "\u8FD9\u4E9B\u6587\u4EF6\u5728\u68C0\u67E5\u70B9\u4E4B\u540E\u53C8\u88AB\u4FEE\u6539\u8FC7\u3002\u7EE7\u7EED\u56DE\u6EDA\u4F1A\u4E22\u5F03\u8F83\u65B0\u7684\u5185\u5BB9\uFF0C\u9664\u975E\u4F60\u663E\u5F0F\u5141\u8BB8\u3002",
  "checkpoints.restoreConfirm": "\u6211\u7406\u89E3\u5E76\u786E\u8BA4\u56DE\u6EDA\u8FD9\u4E9B\u6587\u4EF6",
  "checkpoints.restoreDone": "\u5DF2\u6062\u590D {count} \u4E2A\u6587\u4EF6\u3002",
  "checkpoints.unsupported": "\u8FD9\u4E2A\u6570\u636E\u6E90\u4E0D\u652F\u6301\u56DE\u6EDA\uFF1B\u68C0\u67E5\u70B9\u4EC5\u7528\u4E8E\u5BA1\u8BA1\u4E0E\u8FC1\u79FB\u53C2\u8003\u3002",
  "checkpoints.noDiff": "\u8FD9\u4E2A\u6587\u4EF6\u6CA1\u6709\u53EF\u9884\u89C8\u7684\u6587\u672C\u5DEE\u5F02\u3002",
  "checkpoints.safety": "\u5DF2\u5148\u81EA\u52A8\u521B\u5EFA\u5B89\u5168\u68C0\u67E5\u70B9\u3002",
  "checkpoints.select": "\u9009\u62E9\u4E00\u4E2A\u68C0\u67E5\u70B9\u67E5\u770B\u8BE6\u60C5\u3002",
  "checkpoints.trigger.diary": "\u65E5\u8BB0\u53D8\u66F4",
  "checkpoints.trigger.persona": "\u4EBA\u8BBE\u53D8\u66F4",
  "checkpoints.trigger.memory": "\u8BB0\u5FC6\u53D8\u66F4",
  "checkpoints.trigger.manual": "\u624B\u52A8\u521B\u5EFA",
  "checkpoints.trigger.baseline": "\u57FA\u7EBF",
  "checkpoints.trigger.pre-restore": "\u56DE\u6EDA\u524D\u5B89\u5168\u70B9",
  "checkpoints.trigger.pre-import": "\u5BFC\u5165\u524D\u5B89\u5168\u70B9",
  "doctor.title": "\u73AF\u5883\u81EA\u68C0",
  "doctor.overall": "\u603B\u4F53",
  "doctor.check": "\u68C0\u67E5\u9879",
  "doctor.evidence": "\u8BC1\u636E",
  "doctor.remediation": "\u4FEE\u590D\u5EFA\u8BAE",
  "doctor.refreshHint": "\u81EA\u68C0\u5B8C\u5168\u53EA\u8BFB\uFF0C\u4E0D\u4F1A\u5B89\u88C5\u6216\u4FEE\u6539\u4EFB\u4F55\u4E1C\u897F\u3002",
  "doctor.copied": "\u62A5\u544A\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002",
  "migration.title": "\u8FC1\u79FB",
  "migration.exportTitle": "\u5BFC\u51FA .fishkeeper \u5305",
  "migration.importTitle": "\u5BFC\u5165 .fishkeeper \u5305",
  "migration.mode": "\u6A21\u5F0F",
  "migration.modeFull": "\u5B8C\u6574\uFF08\u542B\u6570\u636E\uFF09",
  "migration.modeShare": "\u5206\u4EAB\uFF08\u4EC5\u5143\u6570\u636E\uFF09",
  "migration.includeCheckpoints": "\u5305\u542B\u68C0\u67E5\u70B9",
  "migration.exportHint": "\u5B8C\u6574\u6A21\u5F0F\u4F1A\u590D\u5236\u53D7\u8DDF\u8E2A\u6570\u636E\uFF1B\u5206\u4EAB\u6A21\u5F0F\u5254\u9664\u65E5\u8BB0\u6B63\u6587\u3001\u8BB0\u5FC6\u539F\u6587\u3001\u51ED\u636E\u4E0E\u68C0\u67E5\u70B9 blob\u3002",
  "migration.exportDone": "\u5305\u5DF2\u5199\u5165 {path}",
  "migration.importHint": "\u7C98\u8D34 .fishkeeper \u5305\u7684\u7EDD\u5BF9\u8DEF\u5F84\u3002\u53C2\u8003\u5BFC\u5165\u53EA\u89E3\u538B\u5230\u63A7\u5236\u53F0\u6570\u636E\u76EE\u5F55\uFF0C\u4E0D\u5199\u5165\u4EFB\u4F55\u9C7C\u63D2\u4EF6\u7684\u6570\u636E\u76EE\u5F55\u3002",
  "migration.importMode": "\u5BFC\u5165\u65B9\u5F0F",
  "migration.modeReference": "\u53C2\u8003\u5BFC\u5165",
  "migration.modeWrite": "\u5199\u5165\u76EE\u6807\u6570\u636E\u76EE\u5F55",
  "migration.target": "\u76EE\u6807\u6570\u636E\u6E90",
  "migration.targetPlaceholder": "\u9009\u62E9\u76EE\u6807\u6570\u636E\u6E90",
  "migration.writeHint": "\u5199\u56DE\u4F1A\u5148\u5907\u4EFD\u76EE\u6807 fish.json\uFF0C\u518D\u539F\u5B50\u66FF\u6362\uFF1B\u5199\u5165\u524D\u81EA\u52A8\u521B\u5EFA\u5B89\u5168\u68C0\u67E5\u70B9\u3002\u5199\u5165\u540E\u9700\u8981\u91CD\u8F7D dsh-fishtank\uFF0C\u907F\u514D\u5176\u5185\u5B58\u72B6\u6001\u8986\u76D6\u5199\u56DE\u7ED3\u679C\u3002",
  "migration.noWriteTargets": "\u6CA1\u6709\u652F\u6301\u5199\u56DE\u7684\u6587\u4EF6\u6570\u636E\u6E90\u3002\u8BF7\u5148\u5728\u201C\u6570\u636E\u6E90\u8BBE\u7F6E\u201D\u4E2D\u628A preset \u8BBE\u4E3A fishtank\uFF0C\u6216\u8BBE\u7F6E options.allowImport: true\u3002",
  "migration.overwriteConfirm": "\u76EE\u6807\u5DF2\u6709\u6570\u636E\uFF0C\u6211\u786E\u8BA4\u8986\u76D6\uFF08\u4F1A\u5148\u5907\u4EFD\uFF09",
  "migration.writePlan": "\u76EE\u6807\uFF1A{target} \xB7 {files} \u4E2A\u6587\u4EF6 \xB7 \u8EAB\u4EFD\uFF1A{identity}",
  "migration.writeDone": "\u5DF2\u5199\u5165\u76EE\u6807\u6570\u636E\u76EE\u5F55 {path}",
  "migration.writeNote": "\u8BF7\u91CD\u8F7D dsh-fishtank \u540E\u518D\u67E5\u770B\uFF1B\u5907\u4EFD\u76EE\u5F55\u4FDD\u7559\u5728\u540C\u7EA7 imports \u4E0B\u3002",
  "migration.backupPath": "\u5907\u4EFD\uFF1A{path}",
  "migration.pathPlaceholder": "C:/path/to/fish.fishkeeper",
  "migration.preflightDone": "\u9884\u68C0\u5B8C\u6210\u3002",
  "migration.verdict.ok": "\u53EF\u4EE5\u5BFC\u5165",
  "migration.verdict.missing-dependencies": "\u7F3A\u5C11\u4F9D\u8D56",
  "migration.verdict.incompatible": "\u4E0D\u517C\u5BB9",
  "migration.verdict.corrupt": "\u5305\u5DF2\u635F\u574F",
  "migration.verdict.unsafe": "\u5305\u4E0D\u5B89\u5168",
  "migration.verdict.blocked": "\u76EE\u6807\u4E0D\u53EF\u5199",
  "migration.importDone": "\u53C2\u8003\u526F\u672C\u5DF2\u5199\u5165 {path}",
  "migration.referenceNote": "\u53C2\u8003\u5BFC\u5165\u4E0D\u4F1A\u4FEE\u6539\u4EFB\u4F55\u9C7C\u63D2\u4EF6\u7684\u6570\u636E\u76EE\u5F55\u3002",
  "settings.title": "\u6570\u636E\u6E90\u8BBE\u7F6E",
  "settings.hint": "\u5728\u8FD9\u91CC\u65B0\u589E\u3001\u7F16\u8F91\u6216\u5220\u9664\u6570\u636E\u6E90\uFF0C\u4FDD\u5B58\u540E\u63D2\u4EF6\u4F1A\u81EA\u52A8\u91CD\u8F7D\uFF1B\u4FEE\u6539 id \u540E\u65E7\u68C0\u67E5\u70B9\u4F1A\u7559\u5728\u65E7 id \u4E0B\u3002",
  "settings.dataRoot": "\u63A7\u5236\u53F0\u6570\u636E\u76EE\u5F55",
  "settings.add": "\u65B0\u589E\u6570\u636E\u6E90",
  "settings.save": "\u4FDD\u5B58",
  "settings.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "settings.saved": "\u914D\u7F6E\u5DF2\u4FDD\u5B58\u3002",
  "settings.reloadHint": "\u63D2\u4EF6\u6B63\u5728\u91CD\u8F7D\uFF1B\u82E5\u9762\u677F\u6CA1\u6709\u81EA\u52A8\u5237\u65B0\uFF0C\u8BF7\u7A0D\u540E\u624B\u52A8\u91CD\u8BD5\u3002",
  "settings.empty": "\u8FD8\u6CA1\u6709\u6570\u636E\u6E90\uFF0C\u70B9\u51FB\u201C\u65B0\u589E\u6570\u636E\u6E90\u201D\u5F00\u59CB\u3002",
  "settings.id": "ID",
  "settings.displayName": "\u663E\u793A\u540D\u79F0",
  "settings.adapter": "\u9002\u914D\u5668",
  "settings.location": "\u4F4D\u7F6E",
  "settings.enabled": "\u542F\u7528",
  "settings.preset": "\u9884\u8BBE",
  "settings.presetNone": "\u65E0\uFF08\u81EA\u52A8\u63A2\u6D4B\uFF09",
  "settings.presetFishtank": "\u76EE\u6807\u9C7C dsh-fishtank",
  "settings.options": "\u9AD8\u7EA7\u9009\u9879\uFF08JSON\uFF09",
  "settings.optionsHint": "file \u6E90\u53EF\u5199 fieldMap\uFF1Bhttp \u6E90\u53EF\u5199 credentialKey\u3001statusPath\u3001allowRemote \u7B49\u3002",
  "settings.delete": "\u5220\u9664",
  "settings.invalidOptions": "\u9AD8\u7EA7\u9009\u9879\u5FC5\u987B\u662F JSON \u5BF9\u8C61\u3002",
  "settings.writeBackHint": "\u5199\u56DE\u53EA\u5BF9 preset=fishtank \u6216 options.allowImport: true \u7684 file \u6E90\u5F00\u653E\uFF1BHTTP \u6E90\u4E0D\u53C2\u4E0E\u5199\u56DE\u3002",
  "error.title": "\u8BF7\u6C42\u5931\u8D25",
  "error.generic": "\u51FA\u4E86\u70B9\u95EE\u9898\uFF0C\u8BF7\u67E5\u770B Host \u65E5\u5FD7\u3002",
  "error.network": "\u65E0\u6CD5\u8FDE\u63A5 Host\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\u3002",
  "error.notReady": "\u63A7\u5236\u53F0\u8FD8\u5728\u542F\u52A8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",
  "error.overview": "\u65E0\u6CD5\u52A0\u8F7D\u603B\u89C8\u3002",
  "error.timeline": "\u65E0\u6CD5\u52A0\u8F7D\u65F6\u95F4\u7EBF\u3002",
  "error.checkpoints": "\u65E0\u6CD5\u52A0\u8F7D\u68C0\u67E5\u70B9\u3002",
  "error.doctor": "\u65E0\u6CD5\u8FD0\u884C\u73AF\u5883\u81EA\u68C0\u3002",
  "rule.pii.email": "\u90AE\u7BB1\u5730\u5740",
  "rule.pii.phone_cn": "\u624B\u673A\u53F7",
  "rule.pii.id_cn": "\u8EAB\u4EFD\u8BC1\u53F7",
  "rule.pii.bank_card": "\u94F6\u884C\u5361\u53F7",
  "rule.pii.address_cn": "\u5730\u5740",
  "rule.secret.api_key": "API \u5BC6\u94A5",
  "rule.topic.sensitive": "\u654F\u611F\u8BDD\u9898",
  "rule.topic.controversy": "\u4E89\u8BAE\u8BDD\u9898",
  "kind.diary": "\u65E5\u8BB0",
  "kind.comment": "\u8BC4\u8BBA",
  "kind.reply": "\u56DE\u590D",
  "kind.post": "\u53D1\u5E16",
  "common.source": "\u6570\u636E\u6E90",
  "common.time": "\u65F6\u95F4",
  "common.kind": "\u7C7B\u578B",
  "common.actions": "\u64CD\u4F5C",
  "common.none": "\u65E0"
};

// src/client.jsx
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "fishkeeper";
var PANEL_ID = "fishkeeper";
var TABS = [
  ["overview", "tab.overview"],
  ["timeline", "tab.timeline"],
  ["checkpoints", "tab.checkpoints"],
  ["migration", "tab.migration"],
  ["doctor", "tab.doctor"],
  ["settings", "tab.settings"]
];
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { en: en_default, zh: zh_default }), "fishkeeper:locale");
  const t = ctx.locale.bind(NS);
  ctx.slots.inject("main", () => ctx.slots.register({
    name: "main",
    key: PANEL_ID,
    locale: NS,
    inject: () => ({ t })
  }, FishKeeperPage));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL_ID,
    order: 20,
    locale: NS,
    label: () => t("panel")
  }, FishIcon));
}
function FishIcon({ size = 20, active }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3.5 12c2.5-3.7 5.9-5.6 9.7-5.6 2.4 0 4.4.8 5.8 2.4-.8 3.1-3.1 5.4-6.2 6.6l-2.8 3-.8-3.5c-2.4-.4-4.4-1.5-5.7-2.9Z", fill: active ? "currentColor" : "none", fillOpacity: ".14" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "14.2", cy: "10.8", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 15.4c1.7.8 3.5.9 5.2.3" })
  ] });
}
function FishKeeperPage(props) {
  const { t } = props;
  const [tab, setTab] = (0, import_react.useState)("overview");
  const [overview, setOverview] = (0, import_react.useState)(void 0);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [toast, setToast] = (0, import_react.useState)(void 0);
  const toastTimer = (0, import_react.useRef)(void 0);
  const mounted = (0, import_react.useRef)(true);
  const notify = (message) => {
    if (!mounted.current) return;
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(void 0), 4200);
  };
  const loadOverview = async () => {
    try {
      const data = await api("/overview");
      if (!mounted.current) return;
      setOverview(data);
      setError(void 0);
    } catch (requestError) {
      if (mounted.current) setError(requestError);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    void loadOverview();
    return () => {
      mounted.current = false;
      clearTimeout(toastTimer.current);
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (tab !== "overview") return void 0;
    const timer = setInterval(() => {
      if (!document.hidden) void loadOverview();
    }, 15e3);
    return () => clearInterval(timer);
  }, [tab]);
  const sources = overview?.sources ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CSS }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-inner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "fk-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-head-copy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: t("title") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("subtitle") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-head-actions", children: [
          overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-badge ${overview.mode === "read-only" ? "fk-badge-warn" : "fk-badge-ok"}`, children: t(overview.mode === "read-only" ? "status.readonly" : "status.writer") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void loadOverview(), children: t("action.refresh") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "fk-tabs", role: "tablist", "aria-label": t("title"), children: TABS.map(([id, key]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": tab === id,
          className: `fk-tab ${tab === id ? "is-active" : ""}`,
          onClick: () => setTab(id),
          children: t(key)
        },
        id
      )) }),
      error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => void loadOverview() }),
      tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        OverviewTab,
        {
          t,
          overview,
          loading,
          onOpenTimeline: () => setTab("timeline"),
          onOpenCheckpoints: () => setTab("checkpoints")
        }
      ),
      tab === "timeline" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineTab, { t, sources }),
      tab === "checkpoints" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckpointsTab, { t, sources, notify }),
      tab === "migration" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MigrationTab, { t, sources, notify }),
      tab === "doctor" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoctorTab, { t }),
      tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsTab, { t, notify })
    ] }),
    toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-toast", role: "status", children: toast })
  ] });
}
function OverviewTab({ t, overview, loading, onOpenTimeline, onOpenCheckpoints }) {
  if (loading && !overview) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-grid", children: [0, 1].map((index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-card fk-skeleton" }, index)) });
  }
  const sources = overview?.sources ?? [];
  if (sources.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Empty,
      {
        title: t("overview.emptyTitle"),
        body: t("overview.emptyBody"),
        hint: `sources:\\n  - id: fish-a\\n    displayName: \u5927\u80A5\u9C7C A\\n    adapter: file\\n    location: C:/path/to/fish-a`
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-grid", children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    SourceCard,
    {
      t,
      source,
      onOpenTimeline,
      onOpenCheckpoints
    },
    source.id
  )) });
}
function SourceCard({ t, source, onOpenTimeline, onOpenCheckpoints }) {
  const fish = source.fish;
  const energy = typeof fish?.energy === "number" ? Math.max(0, Math.min(1, fish.energy)) : void 0;
  const error = source.error;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { className: "fk-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "fk-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-card-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-dot ${source.status === "error" ? "is-error" : "is-ok"}`, "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: source.displayName }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip", children: source.adapter }),
        source.readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip fk-chip-warn", children: t("status.readonly") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted fk-mono", children: source.id })
    ] }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-source-error", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-error-code", children: error.code }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error.message || t("overview.sourceError") })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      source.warnings?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "fk-warnings", children: source.warnings.map((warning, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: warning }, index)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-meta-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-label", children: t("overview.lastActive") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(fish?.lastActiveAt) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-label", children: t("overview.mood") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fish?.mood ?? "\u2014" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-label", children: t("overview.energy") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-energy-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-energy-track", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-energy-fill", style: { width: `${Math.round((energy ?? 0) * 100)}%` } }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: energy === void 0 ? "\u2014" : `${Math.round(energy * 100)}%` })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-snippet", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-label", children: t("overview.latestDiary") }),
        fish?.latestDiary?.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { children: fish.latestDiary.text }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("overview.noDiary") })
      ] }),
      fish?.latestWhisper?.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-snippet", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-label", children: t("overview.latestWhisper") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { children: fish.latestWhisper.text })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-channels", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-label", children: t("overview.channels") }),
        fish?.channels?.length ? fish.channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-channel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-dot ${channel.state === "ok" ? "is-ok" : channel.state === "warn" ? "is-warn" : "is-idle"}`, "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-channel-name", children: channel.channel }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-channel-detail", title: channel.detail, children: channel.detail })
        ] }, channel.channel)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("overview.noChannels") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "fk-card-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-path", title: fish?.dataPath ?? source.id, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-label", children: t("overview.dataPath") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: fish?.dataPath ?? "\u2014" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-card-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          t("overview.size"),
          ": ",
          formatBytes(fish?.dataBytes)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-link", onClick: onOpenTimeline, children: t("tab.timeline") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-link", onClick: onOpenCheckpoints, children: t("tab.checkpoints") })
      ] })
    ] })
  ] });
}
function TimelineTab({ t, sources }) {
  const [sourceId, setSourceId] = (0, import_react.useState)("");
  const [riskOnly, setRiskOnly] = (0, import_react.useState)(false);
  const [query, setQuery] = (0, import_react.useState)("");
  const [items, setItems] = (0, import_react.useState)([]);
  const [cursor, setCursor] = (0, import_react.useState)(void 0);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [detail, setDetail] = (0, import_react.useState)(void 0);
  const [revealing, setRevealing] = (0, import_react.useState)(false);
  const requestId = (0, import_react.useRef)(0);
  const load = async (reset = false) => {
    const current = ++requestId.current;
    if (reset) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sourceId) params.set("source", sourceId);
      if (riskOnly) params.set("risk", "any");
      if (query.trim()) params.set("q", query.trim());
      params.set("limit", "50");
      if (!reset && cursor) params.set("cursor", cursor);
      const data = await api(`/timeline?${params.toString()}`);
      if (current !== requestId.current) return;
      setItems((previous) => reset ? data.items : [...previous, ...data.items]);
      setCursor(data.nextCursor);
      setError(void 0);
    } catch (requestError) {
      if (current === requestId.current) setError(requestError);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    const timer = setTimeout(() => {
      void load(true);
    }, 220);
    return () => clearTimeout(timer);
  }, [sourceId, riskOnly, query]);
  const reveal = async () => {
    if (!detail) return;
    setRevealing(true);
    try {
      const data = await api(`/entry?${new URLSearchParams({ source: detail.sourceId, id: detail.id, reveal: "1" })}`);
      setDetail({ ...detail, text: data.text, revealed: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setRevealing(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: sourceId, onChange: (event) => setSourceId(event.target.value), "aria-label": t("timeline.source"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t("timeline.allSources") }),
        sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: source.id, children: source.displayName }, source.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: riskOnly, onChange: (event) => setRiskOnly(event.target.checked) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("timeline.riskOnly") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          className: "fk-input",
          type: "search",
          value: query,
          placeholder: t("timeline.searchPlaceholder"),
          onChange: (event) => setQuery(event.target.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void load(true), children: t("action.refresh") })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => void load(true) }),
    loading && items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("status.loading") }),
    !loading && items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: t("timeline.noItems"), body: t("timeline.truncated") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "fk-timeline", children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "fk-timeline-row", onClick: () => setDetail({ ...item, revealed: false }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-time", children: formatTime(item.occurredAt) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-timeline-main", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-timeline-meta", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip", children: item.sourceName }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: t(`kind.${item.kind}`) }),
          item.channel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-muted", children: [
            "\xB7 ",
            item.channel
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-muted", children: [
            "\xB7 ",
            t(`timeline.${item.visibility}`)
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-timeline-text", children: item.textMasked })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskChips, { hits: item.hits, t })
    ] }) }, `${item.sourceId}:${item.id}`)) }),
    cursor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void load(false), children: t("action.loadMore") }) }),
    detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { title: t("timeline.detailTitle"), onClose: () => setDetail(void 0), t, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip", children: detail.sourceName }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(`kind.${detail.kind}`) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: formatTime(detail.occurredAt) }),
        detail.channel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-muted", children: [
          "\xB7 ",
          detail.channel
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-muted", children: [
          "\xB7 ",
          t(`timeline.${detail.visibility}`)
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "fk-detail-text", children: detail.revealed ? detail.text : detail.textMasked }),
      detail.hits?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-hits", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-label", children: t("timeline.hits") }),
        detail.hits.map((hit, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-hit", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-severity is-${hit.severity}`, children: hit.severity }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ruleLabel(t, hit.ruleId) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: hit.masked })
        ] }, `${hit.ruleId}-${index}`))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-modal-actions", children: [
        !detail.revealed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: revealing, onClick: () => void reveal(), children: revealing ? t("status.loading") : t("action.showOriginal") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => setDetail(void 0), children: t("action.close") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("timeline.revealHint") })
    ] })
  ] });
}
function CheckpointsTab({ t, sources, notify }) {
  const [sourceId, setSourceId] = (0, import_react.useState)(sources[0]?.id ?? "");
  const [items, setItems] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [restoreSupported, setRestoreSupported] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [selectedId, setSelectedId] = (0, import_react.useState)(void 0);
  const [detail, setDetail] = (0, import_react.useState)(void 0);
  const [diff, setDiff] = (0, import_react.useState)(void 0);
  const [diffPath, setDiffPath] = (0, import_react.useState)(void 0);
  const [restorePlan, setRestorePlan] = (0, import_react.useState)(void 0);
  const [restoreConfirmed, setRestoreConfirmed] = (0, import_react.useState)(false);
  const [overrideStale, setOverrideStale] = (0, import_react.useState)(false);
  const [restoreResult, setRestoreResult] = (0, import_react.useState)(void 0);
  const [busy, setBusy] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!sourceId && sources[0]) setSourceId(sources[0].id);
  }, [sources, sourceId]);
  const load = async (id = sourceId) => {
    if (!id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api(`/checkpoints?${new URLSearchParams({ source: id })}`);
      setItems(data.items ?? []);
      setRestoreSupported(Boolean(data.restoreSupported));
      setError(void 0);
      if (selectedId && !(data.items ?? []).some((item) => item.id === selectedId)) {
        setSelectedId(void 0);
        setDetail(void 0);
      }
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    void load(sourceId);
  }, [sourceId]);
  const select = async (item) => {
    setSelectedId(item.id);
    setRestorePlan(void 0);
    setRestoreResult(void 0);
    setDiff(void 0);
    setDiffPath(void 0);
    try {
      const data = await api(`/checkpoint?${new URLSearchParams({ id: item.id })}`);
      setDetail(data);
      const first = (data.manifest.files ?? []).find((file) => file.restorable && file.before);
      if (first) await loadDiff(item.id, first.path);
    } catch (requestError) {
      setError(requestError);
    }
  };
  const loadDiff = async (id, path) => {
    setDiffPath(path);
    try {
      const data = await api(`/checkpoint/diff?${new URLSearchParams({ id, path })}`);
      setDiff(data);
    } catch (requestError) {
      setError(requestError);
    }
  };
  const create = async () => {
    if (!sourceId) return;
    setBusy(true);
    try {
      await api("/checkpoint/create", { method: "POST", body: { sourceId } });
      notify(t("action.createCheckpoint"));
      await load(sourceId);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  const startRestore = async () => {
    if (!detail) return;
    const files = (detail.manifest.files ?? []).filter((file) => file.restorable && file.before).map((file) => file.path);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const plan = await api("/checkpoint/restore", { method: "POST", body: { id: detail.manifest.id, files, dryRun: true } });
      setRestorePlan(plan);
      setRestoreConfirmed(false);
      setOverrideStale(false);
      setRestoreResult(void 0);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  const executeRestore = async () => {
    if (!restorePlan) return;
    setBusy(true);
    try {
      const files = restorePlan.files.filter((file) => file.action === "restore").map((file) => file.path);
      const result = await api("/checkpoint/restore", {
        method: "POST",
        body: {
          id: restorePlan.checkpointId,
          files,
          confirmToken: restorePlan.confirmToken,
          dryRun: false,
          overrideStale
        }
      });
      setRestoreResult(result);
      notify(t("checkpoints.restoreDone", { count: result.restored ?? 0 }));
      await load(sourceId);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  const pin = async () => {
    if (!detail) return;
    try {
      await api("/checkpoint/pin", { method: "POST", body: { id: detail.manifest.id, pinned: !detail.manifest.pinned } });
      await select({ id: detail.manifest.id });
      await load(sourceId);
    } catch (requestError) {
      setError(requestError);
    }
  };
  const remove = async () => {
    if (!detail) return;
    if (!window.confirm(`${t("action.delete")} ${detail.manifest.id}?`)) return;
    try {
      await api("/checkpoint/delete", { method: "POST", body: { id: detail.manifest.id } });
      setDetail(void 0);
      setSelectedId(void 0);
      await load(sourceId);
    } catch (requestError) {
      setError(requestError);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "fk-select", value: sourceId, onChange: (event) => setSourceId(event.target.value), "aria-label": t("timeline.source"), children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: source.id, children: source.displayName }, source.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: busy || !sourceId, onClick: () => void create(), children: t("action.createCheckpoint") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void load(sourceId), children: t("action.refresh") })
    ] }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => void load(sourceId) }),
    loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("status.loading") }),
    !loading && items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { title: t("checkpoints.empty"), body: t("checkpoints.createHint") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-split", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-list", children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: `fk-row ${selectedId === item.id ? "is-selected" : ""}`,
          onClick: () => void select(item),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-row-main", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-row-title", children: [
                formatTime(item.createdAt),
                item.pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip", children: t("checkpoints.pinned") }),
                item.baseline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-chip", children: t("checkpoints.trigger.baseline") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "fk-muted", children: [
                triggerLabel(t, item.trigger),
                " \xB7 ",
                t("checkpoints.files"),
                " ",
                item.files,
                " \xB7 ",
                formatBytes(item.storedBytes)
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-mono fk-muted", children: item.id.slice(0, 12) })
          ]
        },
        item.id
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-pane", children: [
        !detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("checkpoints.select") }),
        detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: detail.manifest.id }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-muted", children: [
                triggerLabel(t, detail.manifest.trigger?.kind),
                " \xB7 ",
                formatTime(detail.manifest.createdAt)
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-actions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void pin(), children: detail.manifest.pinned ? t("action.unpin") : t("action.pin") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void remove(), children: t("action.delete") })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-file-list", children: (detail.manifest.files ?? []).map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: `fk-file ${diffPath === file.path ? "is-selected" : ""}`,
              onClick: () => void loadDiff(detail.manifest.id, file.path),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-file-role", children: file.role }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-file-path", title: file.path, children: file.path }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-chip ${file.restorable ? "fk-chip-ok" : ""}`, children: file.restorable ? "restorable" : "read-only" })
              ]
            },
            file.path
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-diff-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-label", children: t("checkpoints.diff") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-mono fk-muted", children: diffPath ?? "" })
          ] }),
          diff?.patch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "fk-diff", children: diff.patch }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: diff ? t("checkpoints.noDiff") : t("checkpoints.select") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "fk-btn",
                disabled: busy || !restoreSupported || !(detail.manifest.files ?? []).some((file) => file.restorable && file.before),
                onClick: () => void startRestore(),
                children: t("action.restore")
              }
            ),
            !restoreSupported && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: t("checkpoints.unsupported") })
          ] })
        ] })
      ] })
    ] }),
    restorePlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { title: t("checkpoints.restoreTitle"), onClose: () => setRestorePlan(void 0), t, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-warning", children: t("checkpoints.restoreWarning") }),
      restorePlan.files.some((file) => file.stale) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-warning", children: t("checkpoints.staleWarning") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "fk-plan-list", children: restorePlan.files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-chip ${file.action === "restore" ? "fk-chip-warn" : ""}`, children: file.action }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: file.path }),
        file.stale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: " \xB7 stale" })
      ] }, file.path)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: restoreConfirmed, onChange: (event) => setRestoreConfirmed(event.target.checked) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("checkpoints.restoreConfirm") })
      ] }),
      restorePlan.files.some((file) => file.stale) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: overrideStale, onChange: (event) => setOverrideStale(event.target.checked) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("checkpoints.staleWarning") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-modal-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => setRestorePlan(void 0), children: t("action.cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: !restoreConfirmed || busy, onClick: () => void executeRestore(), children: t("action.restore") })
      ] }),
      restoreResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-success", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t("checkpoints.restoreDone", { count: restoreResult.restored ?? 0 }) }),
        restoreResult.safetyCheckpointId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-muted", children: t("checkpoints.safety") })
      ] })
    ] })
  ] });
}
function DoctorTab({ t }) {
  const [report, setReport] = (0, import_react.useState)(void 0);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const load = async () => {
    setLoading(true);
    try {
      setReport(await api("/doctor"));
      setError(void 0);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    void load();
  }, []);
  const copy = async () => {
    if (!report) return;
    const lines = [
      "# Fish Keeper environment check",
      `- Generated: ${report.generatedAt}`,
      `- Overall: ${report.overall}`,
      "",
      "| Status | Check | Evidence | Suggested fix |",
      "|---|---|---|---|",
      ...report.checks.map((check) => `| ${check.status} | ${check.title} | ${check.evidence} | ${check.remediation ?? ""} |`),
      ""
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 3e3);
    } catch {
      setCopied(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void load(), children: t("action.refresh") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: () => void copy(), disabled: !report, children: t("action.copyReport") }),
      report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-badge ${report.overall === "ok" ? "fk-badge-ok" : report.overall === "fail" ? "fk-badge-error" : "fk-badge-warn"}`, children: t(`status.${report.overall}`) }),
      copied && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: t("doctor.copied") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("doctor.refreshHint") }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => void load() }),
    loading && !report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-muted", children: t("status.loading") }),
    report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-table-wrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "fk-table", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("doctor.check") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("doctor.overall") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("doctor.evidence") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: t("doctor.remediation") })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: check.title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-status is-${check.status}`, children: t(`status.${check.status}`) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "fk-evidence", children: check.evidence }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "fk-evidence", children: check.remediation ?? "\u2014" })
      ] }, check.id)) })
    ] }) })
  ] });
}
function MigrationTab({ t, sources, notify }) {
  const [sourceId, setSourceId] = (0, import_react.useState)(sources[0]?.id ?? "");
  const [mode, setMode] = (0, import_react.useState)("full");
  const [includeCheckpoints, setIncludeCheckpoints] = (0, import_react.useState)(true);
  const [exportResult, setExportResult] = (0, import_react.useState)(void 0);
  const [packagePath, setPackagePath] = (0, import_react.useState)("");
  const [importMode, setImportMode] = (0, import_react.useState)("reference");
  const [targetSourceId, setTargetSourceId] = (0, import_react.useState)("");
  const [overwriteConfirmed, setOverwriteConfirmed] = (0, import_react.useState)(false);
  const [preflight, setPreflight] = (0, import_react.useState)(void 0);
  const [importResult, setImportResult] = (0, import_react.useState)(void 0);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(void 0);
  const writeTargets = sources.filter((source) => source.adapter === "file" && source.capabilities?.import);
  (0, import_react.useEffect)(() => {
    if (!sourceId && sources[0]) setSourceId(sources[0].id);
  }, [sources, sourceId]);
  (0, import_react.useEffect)(() => {
    if (importMode !== "write") return;
    if (!targetSourceId && writeTargets[0]) setTargetSourceId(writeTargets[0].id);
  }, [importMode, targetSourceId, writeTargets]);
  (0, import_react.useEffect)(() => {
    setPreflight(void 0);
    setImportResult(void 0);
    setOverwriteConfirmed(false);
  }, [packagePath, importMode, targetSourceId]);
  const runExport = async () => {
    if (!sourceId) return;
    setBusy(true);
    setError(void 0);
    try {
      const result = await api("/export", { method: "POST", body: { sourceId, mode, includeCheckpoints: mode === "full" && includeCheckpoints } });
      setExportResult(result);
      notify(t("migration.exportDone", { path: result.path }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  const runPreflight = async () => {
    if (!packagePath.trim()) return;
    setBusy(true);
    setError(void 0);
    setImportResult(void 0);
    try {
      const result = await api("/import/preflight", {
        method: "POST",
        body: { path: packagePath.trim(), mode: importMode, targetSourceId: importMode === "write" ? targetSourceId : void 0 }
      });
      setPreflight(result);
      notify(t("migration.preflightDone"));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  const needsOverwriteConfirm = importMode === "write" && Boolean(preflight?.plan?.target?.overwrite);
  const canImport = preflight?.verdict === "ok" && (importMode !== "write" || Boolean(targetSourceId) && (!needsOverwriteConfirm || overwriteConfirmed));
  const runImport = async () => {
    if (!preflight || preflight.verdict !== "ok" || !canImport) return;
    setBusy(true);
    setError(void 0);
    try {
      const result = await api("/import", {
        method: "POST",
        body: {
          path: packagePath.trim(),
          mode: importMode,
          targetSourceId: importMode === "write" ? targetSourceId : void 0,
          confirmToken: preflight.confirmToken,
          overwrite: overwriteConfirmed
        }
      });
      setImportResult(result);
      notify(t(importMode === "write" ? "migration.writeDone" : "migration.importDone", { path: result.importedPath }));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-panel fk-migration", children: [
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => setError(void 0) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-card fk-form-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("migration.exportTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-form-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("common.source") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "fk-select", value: sourceId, onChange: (event) => setSourceId(event.target.value), children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: source.id, children: source.displayName }, source.id)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("migration.mode") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: mode, onChange: (event) => setMode(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "full", children: t("migration.modeFull") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "share", children: t("migration.modeShare") })
          ] })
        ] }),
        mode === "full" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check fk-check-inline", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: includeCheckpoints, onChange: (event) => setIncludeCheckpoints(event.target.checked) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("migration.includeCheckpoints") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: busy || !sourceId, onClick: () => void runExport(), children: t("action.export") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("migration.exportHint") }),
      exportResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-result", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t("migration.exportDone", { path: exportResult.path }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-mono", children: exportResult.path }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-muted", children: [
          formatBytes(exportResult.bytes),
          " \xB7 ",
          exportResult.sha256?.slice(0, 16),
          "\u2026"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-card fk-form-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("migration.importTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-form-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "fk-input fk-path-input",
            value: packagePath,
            placeholder: t("migration.pathPlaceholder"),
            onChange: (event) => setPackagePath(event.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("migration.importMode") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: importMode, onChange: (event) => setImportMode(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "reference", children: t("migration.modeReference") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "write", children: t("migration.modeWrite") })
          ] })
        ] }),
        importMode === "write" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("migration.target") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: targetSourceId, onChange: (event) => setTargetSourceId(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t("migration.targetPlaceholder") }),
            writeTargets.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: source.id, children: source.displayName }, source.id))
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: busy || !packagePath.trim(), onClick: () => void runPreflight(), children: t("action.preflight") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: busy || !canImport, onClick: () => void runImport(), children: t("action.import") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: importMode === "write" ? t("migration.writeHint") : t("migration.importHint") }),
      importMode === "write" && writeTargets.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-warning", children: t("migration.noWriteTargets") }),
      needsOverwriteConfirm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check fk-check-inline", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: overwriteConfirmed, onChange: (event) => setOverwriteConfirmed(event.target.checked) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("migration.overwriteConfirm") })
      ] }),
      preflight && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-result", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `fk-status is-${preflight.verdict === "ok" ? "ok" : "fail"}`, children: t(`migration.verdict.${preflight.verdict}`) }),
        preflight.plan?.target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-muted", children: t("migration.writePlan", {
          target: preflight.plan.target.displayName,
          files: preflight.plan.target.files.length,
          identity: preflight.plan.target.identity
        }) }),
        preflight.findings?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "fk-findings", children: preflight.findings.map((finding, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: `fk-finding is-${finding.severity}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: finding.code }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: finding.message }),
          finding.remediation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-muted", children: finding.remediation })
        ] }, `${finding.code}-${index}`)) })
      ] }),
      importResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-result", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t(importResult.mode === "write" ? "migration.writeDone" : "migration.importDone", { path: importResult.importedPath }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-mono", children: importResult.importedPath }),
        importResult.mode === "write" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          importResult.backupPath && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-muted", children: t("migration.backupPath", { path: importResult.backupPath }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("migration.writeNote") })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("migration.referenceNote") })
      ] })
    ] })
  ] });
}
function SettingsTab({ t, notify }) {
  const [dataRoot, setDataRoot] = (0, import_react.useState)("");
  const [rows, setRows] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [saved, setSaved] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    api("/config").then((result) => {
      if (cancelled) return;
      setDataRoot(result.dataRoot ?? "");
      setRows((result.sources ?? []).map((source, index) => ({
        key: `source-${index}-${source.id}`,
        id: source.id,
        displayName: source.displayName,
        adapter: source.adapter,
        location: source.location,
        enabled: source.enabled !== false,
        optionsText: JSON.stringify(source.options ?? {}, null, 2)
      })));
    }).catch((requestError) => {
      if (!cancelled) setError(requestError);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const update = (index, patch) => {
    setSaved(false);
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  };
  const addRow = () => {
    setSaved(false);
    setRows((current) => [...current, {
      key: `new-${Date.now()}`,
      id: "",
      displayName: "",
      adapter: "file",
      location: "",
      enabled: true,
      optionsText: "{}"
    }]);
  };
  const removeRow = (index) => {
    setSaved(false);
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };
  const save = async () => {
    setError(void 0);
    let sources;
    try {
      sources = rows.map((row, index) => {
        let options;
        try {
          options = row.optionsText.trim() === "" ? {} : JSON.parse(row.optionsText);
        } catch {
          throw new Error(`${row.displayName || row.id || index + 1}: ${t("settings.invalidOptions")}`);
        }
        if (!options || typeof options !== "object" || Array.isArray(options)) {
          throw new Error(`${row.displayName || row.id || index + 1}: ${t("settings.invalidOptions")}`);
        }
        return {
          id: row.id.trim(),
          displayName: row.displayName.trim(),
          adapter: row.adapter,
          location: row.location.trim(),
          enabled: row.enabled,
          options
        };
      });
    } catch (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await api("/config/save", { method: "POST", body: { sources } });
      setSaved(true);
      notify(t("settings.saved"));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  };
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-panel", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-card fk-skeleton" }) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-panel", children: [
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBox, { error, t, onRetry: () => setError(void 0) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "fk-card fk-form-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("settings.title") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("settings.hint") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-detail-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn fk-btn-ghost", onClick: addRow, children: t("settings.add") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", disabled: saving, onClick: () => void save(), children: saving ? t("settings.saving") : t("settings.save") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "fk-hint", children: [
        t("settings.dataRoot"),
        ": ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-mono", children: dataRoot })
      ] }),
      saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-success", children: t("settings.reloadHint") }),
      rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("settings.empty") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-source-list", children: rows.map((row, index) => {
        let parsed;
        try {
          parsed = row.optionsText.trim() === "" ? {} : JSON.parse(row.optionsText);
        } catch {
          parsed = void 0;
        }
        const preset = parsed && typeof parsed === "object" && parsed.preset === "fishtank" ? "fishtank" : "";
        const setPreset = (value) => {
          const base = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...parsed } : {};
          if (value) base.preset = value;
          else delete base.preset;
          update(index, { optionsText: JSON.stringify(base, null, 2) });
        };
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-source-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-form-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.id") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "fk-input", value: row.id, onChange: (event) => update(index, { id: event.target.value }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.displayName") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "fk-input", value: row.displayName, onChange: (event) => update(index, { displayName: event.target.value }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.adapter") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: row.adapter, onChange: (event) => update(index, { adapter: event.target.value }), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "file", children: "file" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "http", children: "http" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.preset") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "fk-select", value: preset, onChange: (event) => setPreset(event.target.value), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t("settings.presetNone") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "fishtank", children: t("settings.presetFishtank") })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-check fk-check-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: row.enabled, onChange: (event) => update(index, { enabled: event.target.checked }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.enabled") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn fk-btn-ghost", onClick: () => removeRow(index), children: t("settings.delete") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.location") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "fk-input", value: row.location, onChange: (event) => update(index, { location: event.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "fk-field", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.options") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "textarea",
              {
                className: "fk-input fk-textarea",
                rows: 4,
                spellCheck: false,
                value: row.optionsText,
                onChange: (event) => update(index, { optionsText: event.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("settings.optionsHint") })
        ] }, row.key);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "fk-hint", children: t("settings.writeBackHint") })
    ] })
  ] });
}
function RiskChips({ hits, t }) {
  if (!hits || hits.length === 0) return null;
  const unique = [];
  const seen = /* @__PURE__ */ new Set();
  for (const hit of hits) {
    if (seen.has(hit.ruleId)) continue;
    seen.add(hit.ruleId);
    unique.push(hit);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fk-risks", children: unique.slice(0, 3).map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `fk-severity is-${hit.severity}`, children: ruleLabel(t, hit.ruleId) }, hit.ruleId)) });
}
function ErrorBox({ error, t, onRetry }) {
  const message = error?.code === "fishkeeper/network" ? t("error.network") : error?.code && error?.message ? error.message : t("error.network");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-error-box", role: "alert", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("error.title") }),
      error?.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "fk-error-code", children: error.code }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message })
    ] }),
    onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-btn", onClick: onRetry, children: t("action.retry") })
  ] });
}
function Empty({ title, body, hint }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-empty-art", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FishIcon, { size: 44 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
    body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: body }),
    hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "fk-code", children: hint })
  ] });
}
function Modal({ title, children, onClose, t }) {
  (0, import_react.useEffect)(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-overlay", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "fk-modal", role: "dialog", "aria-modal": "true", "aria-label": title, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "fk-modal-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "fk-icon-btn", "aria-label": t("action.close"), onClick: onClose, children: "\xD7" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fk-modal-body", children })
  ] }) });
}
async function api(path, options = {}) {
  const { method = "GET", body } = options;
  let response;
  try {
    response = await fetch(`/api/fishkeeper${path}`, {
      method,
      credentials: "same-origin",
      headers: body === void 0 ? { accept: "application/json" } : { accept: "application/json", "content-type": "application/json" },
      body: body === void 0 ? void 0 : JSON.stringify(body)
    });
  } catch {
    const error = new Error("Network request failed");
    error.code = "fishkeeper/network";
    throw error;
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message ?? `HTTP ${response.status}`);
    error.code = data?.error?.code ?? "fishkeeper/internal";
    error.details = data?.error?.details;
    throw error;
  }
  return data;
}
function formatTime(value) {
  if (!value) return "\u2014";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleString();
}
function formatBytes(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "\u2014";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
function triggerLabel(t, trigger) {
  const key = `checkpoints.trigger.${trigger ?? "manual"}`;
  const value = t(key);
  return value === key ? trigger ?? "manual" : value;
}
function ruleLabel(t, ruleId) {
  const key = `rule.${ruleId}`;
  const value = t(key);
  return value === key ? ruleId : value;
}
var CSS = `
.fk-page {
  height: 100%;
  min-height: 0;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.55;
}
.fk-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px clamp(20px, 4vw, 48px) 56px;
}
.fk-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.fk-head-copy h1 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 500; }
.fk-head-copy p { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.fk-head-actions { display: flex; align-items: center; gap: 10px; }
.fk-tabs { display: flex; gap: 4px; margin: 22px 0 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); overflow-x: auto; }
.fk-tab {
  appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
  padding: 9px 12px; font: inherit; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap;
}
.fk-tab:hover { color: var(--dsw-alias-label-primary); }
.fk-tab.is-active { color: var(--dsw-alias-brand-primary); border-bottom-color: var(--dsw-alias-brand-primary); }
.fk-badge, .fk-chip, .fk-severity, .fk-status {
  display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px; padding: 1px 8px; font-size: 12px; line-height: 18px; white-space: nowrap;
}
.fk-badge-ok, .fk-chip-ok, .fk-status.is-ok { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent); }
.fk-badge-warn, .fk-chip-warn, .fk-status.is-warn { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 35%, transparent); }
.fk-badge-error, .fk-status.is-fail, .fk-status.is-error { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent); }
.fk-status.is-unknown { color: var(--dsw-alias-label-secondary); }
.fk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.fk-card {
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px; min-width: 0;
}
.fk-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.fk-card-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.fk-card-title strong { font-weight: 600; }
.fk-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--dsw-alias-state-idle-primary); }
.fk-dot.is-ok { background: var(--dsw-alias-state-success-primary); }
.fk-dot.is-warn { background: var(--dsw-alias-state-warn-primary); }
.fk-dot.is-error { background: var(--dsw-alias-state-error-primary); }
.fk-dot.is-idle { background: var(--dsw-alias-state-idle-primary); }
.fk-muted { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.fk-mono, .fk-path code, .fk-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.fk-label { display: block; color: var(--dsw-alias-label-secondary); font-size: 12px; margin-bottom: 3px; }
.fk-meta-grid { display: grid; grid-template-columns: 1.4fr 1fr 1.4fr; gap: 10px; }
.fk-meta-grid > div { min-width: 0; }
.fk-energy-row { display: flex; align-items: center; gap: 8px; }
.fk-energy-track { flex: 1; height: 6px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; min-width: 50px; }
.fk-energy-fill { display: block; height: 100%; background: var(--dsw-alias-brand-primary); border-radius: 999px; }
.fk-snippet blockquote {
  margin: 0; padding: 8px 10px; border-left: 3px solid var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-2); border-radius: 0 8px 8px 0; font-size: 13px;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.fk-channels { display: flex; flex-direction: column; gap: 6px; }
.fk-channel { display: flex; align-items: center; gap: 8px; min-width: 0; }
.fk-channel-name { font-weight: 500; }
.fk-channel-detail { color: var(--dsw-alias-label-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fk-card-foot { margin-top: auto; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 10px; }
.fk-path { min-width: 0; }
.fk-path code { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); }
.fk-card-stats { display: flex; align-items: center; gap: 12px; color: var(--dsw-alias-label-secondary); font-size: 12px; flex-wrap: wrap; }
.fk-source-error { color: var(--dsw-alias-state-error-primary); }
.fk-warnings { margin: 0; padding: 8px 10px 8px 24px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent); color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.fk-warnings li + li { margin-top: 2px; }
.fk-source-error p { margin: 4px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; word-break: break-word; }
.fk-error-code { font-family: ui-monospace, monospace; font-size: 11px; opacity: .85; }
.fk-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 30px; padding: 0 11px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap;
}
.fk-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.fk-btn:disabled { opacity: .5; cursor: not-allowed; }
.fk-link { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); font: inherit; font-size: 12px; cursor: pointer; padding: 0; }
.fk-icon-btn { appearance: none; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 22px; line-height: 1; cursor: pointer; padding: 2px 6px; }
.fk-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.fk-select, .fk-input {
  height: 30px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 13px; padding: 0 9px; min-width: 120px;
}
.fk-input { flex: 1; min-width: 180px; }
.fk-path-input { flex: 2; }
.fk-check { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; cursor: pointer; }
.fk-check-inline { margin-left: 4px; }
.fk-check input { accent-color: var(--dsw-alias-brand-primary); }
.fk-panel { min-width: 0; }
.fk-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.fk-timeline-row {
  display: flex; gap: 12px; width: 100%; text-align: left; padding: 10px 8px;
  border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent;
  color: inherit; font: inherit; cursor: pointer;
}
.fk-timeline-row:hover { background: var(--dsw-alias-bg-layer-1); }
.fk-time { flex: 0 0 132px; color: var(--dsw-alias-label-secondary); font-size: 12px; padding-top: 2px; }
.fk-timeline-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fk-timeline-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12px; }
.fk-timeline-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fk-risks { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; max-width: 240px; }
.fk-severity { font-size: 11px; padding: 0 7px; }
.fk-severity.is-high { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent); }
.fk-severity.is-medium { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 35%, transparent); }
.fk-severity.is-low { color: var(--dsw-alias-label-secondary); }
.fk-center { display: flex; justify-content: center; padding: 16px; }
.fk-overlay {
  position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
  padding: 20px; background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
}
.fk-modal {
  width: min(720px, 100%); max-height: min(80vh, 760px); overflow: auto;
  background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px; box-shadow: 0 18px 50px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);
}
.fk-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.fk-modal-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-modal-body { padding: 16px 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.fk-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.fk-detail-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; }
.fk-detail-text { margin: 0; padding: 10px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 13px; max-height: 260px; overflow: auto; }
.fk-hits { display: flex; flex-direction: column; gap: 5px; }
.fk-hit { display: flex; align-items: center; gap: 8px; font-size: 12px; flex-wrap: wrap; }
.fk-hit code { color: var(--dsw-alias-label-secondary); }
.fk-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; margin: 0; }
.fk-warning { margin: 0; padding: 9px 10px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 30%, transparent); font-size: 13px; }
.fk-success { margin-top: 8px; padding: 10px; border-radius: 8px; background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent); }
.fk-error-box { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 12px; margin-bottom: 14px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }
.fk-error-box p { margin: 2px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.fk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px 20px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 12px; text-align: center; }
.fk-empty h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-empty p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; max-width: 560px; }
.fk-empty-art { color: var(--dsw-alias-brand-primary); }
.fk-code { text-align: left; max-width: 100%; overflow: auto; padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); }
.fk-skeleton { min-height: 210px; background: linear-gradient(90deg, var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-2), var(--dsw-alias-bg-layer-1)); background-size: 200% 100%; animation: fk-shimmer 1.4s ease-in-out infinite; }
@keyframes fk-shimmer { 0% { background-position: 0% 0; } 100% { background-position: -200% 0; } }
.fk-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 120; padding: 9px 14px; border-radius: 999px; background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent); font-size: 13px; }
.fk-split { display: grid; grid-template-columns: minmax(260px, 360px) minmax(0, 1fr); gap: 16px; align-items: start; }
.fk-list { display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; overflow: hidden; }
.fk-row { appearance: none; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent; color: inherit; font: inherit; text-align: left; padding: 10px 12px; cursor: pointer; display: flex; gap: 8px; align-items: center; }
.fk-row:hover, .fk-row.is-selected { background: var(--dsw-alias-bg-layer-1); }
.fk-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fk-row-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-weight: 500; }
.fk-detail-pane { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.fk-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.fk-detail-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.fk-file-list { display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; overflow: hidden; }
.fk-file { appearance: none; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); background: transparent; color: inherit; font: inherit; text-align: left; padding: 7px 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 12px; }
.fk-file:last-child { border-bottom: 0; }
.fk-file:hover, .fk-file.is-selected { background: var(--dsw-alias-bg-layer-1); }
.fk-file-role { color: var(--dsw-alias-label-secondary); flex: 0 0 64px; }
.fk-file-path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, monospace; }
.fk-diff-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fk-diff { margin: 0; max-height: 340px; overflow: auto; padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); font-family: ui-monospace, monospace; font-size: 12px; white-space: pre; }
.fk-plan-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow: auto; }
.fk-plan-list li { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.fk-table-wrap { overflow: auto; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; }
.fk-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.fk-table th, .fk-table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); vertical-align: top; }
.fk-table th { color: var(--dsw-alias-label-secondary); font-weight: 500; font-size: 12px; background: var(--dsw-alias-bg-layer-1); position: sticky; top: 0; }
.fk-evidence { color: var(--dsw-alias-label-secondary); font-size: 12px; max-width: 360px; word-break: break-word; }
.fk-migration { display: flex; flex-direction: column; gap: 16px; }
.fk-form-card h2 { margin: 0; font-size: 15px; font-weight: 600; }
.fk-form-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.fk-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fk-result { padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); display: flex; flex-direction: column; gap: 5px; font-size: 13px; }
.fk-findings { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.fk-finding { display: flex; flex-direction: column; gap: 2px; padding: 7px 9px; border-radius: 7px; background: var(--dsw-alias-bg-base); font-size: 12px; }
.fk-finding.is-blocker { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.fk-finding.is-warning { border-left: 3px solid var(--dsw-alias-state-warn-primary); }
.fk-source-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
.fk-source-row { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-base); }
.fk-source-row .fk-input, .fk-source-row .fk-select { min-width: 120px; }
.fk-textarea { height: auto; min-height: 90px; resize: vertical; font-family: ui-monospace, monospace; font-size: 12px; }
@media (max-width: 760px) {
  .fk-grid { grid-template-columns: 1fr; }
  .fk-split { grid-template-columns: 1fr; }
  .fk-meta-grid { grid-template-columns: 1fr 1fr; }
  .fk-time { flex-basis: 92px; }
}
`;

    })(module, module.exports, require);
    return module.exports;
  },
});
