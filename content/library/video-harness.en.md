# Video Harness

Separate events, directing plans, model calls and reviewed state transitions, keeping evidence of every execution.

## Separate planning from execution

interpret → plan → prepare → submit → collect → accept. A creative plan is not an observed result. Advance the state only after reviewing the actual output.

## Keep evidence for every action

Identify each round by session_id, event_id and state revision. Validate input, permitted actions and model parameters; reject stale plans and mismatched states.

## Interchangeable models and agents

An agent turns free-form input into a constrained interpretation; model adapters compile parameters against the current schema. The framework does not promise unlimited generation or automatic approval.

## Template

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
A showcase edition of Vicky’s creative methods.
