# 互动视频执行框架

Video Harness · Harness

将事件、导演计划、模型调用和审核过的状态推进分开，保留每轮执行证据。

## 规划与执行分开

interpret → plan → prepare → submit → collect → accept。创作计划不是已经发生的结果；实际输出审核后，才推进到下一轮状态。

## 为每次动作留下依据

session_id、event_id 与 state revision 共同定位一轮。校验输入、允许动作和模型参数，拒绝过期计划与不匹配的状态。

## 可替换的模型与 Agent

自由输入由 Agent 输出受限解释，模型适配器根据当前 schema 编译参数。框架本身不提供无限生成或自动通过的承诺。

## 使用模板

```text
scene + state + event
  → interpret / clarify
  → plan
  → schema validation
  → submit + collect
  → review actual output
  → accept actual end state
```

---
根据 Vicky 实际创作工具与方法整理的展示版，源文件：vicky-drama/scripts/video-harness.mjs。
