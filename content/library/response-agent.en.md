# Response Director

Translate player input into actions allowed by the scene, including refusals, conditions, pauses and ambiguous intent.

## Understand the whole sentence first

“No holding hands today, but you can stay” both declines touch and welcomes company. Matching the words “holding hands” alone must not trigger that action.

## Route only to valid actions

Use the current scene.actions, character knowledge and spatial state. Return clarify when intent is ambiguous. Silence is neither consent nor refusal.

## Make interpretations verifiable

Return the event ID, state revision, route / clarify decision, action_id and evidence from the current input. The harness manages model parameters and actual state.

## Template

```text
{
  "event_id": "event-001",
  "state_revision": 0,
  "decision": "route",
  "action_id": "stay_and_listen",
  "evidence": "you can stay",
  "reason": "Declines touch but welcomes company",
  "question": null
}
```

---
A showcase edition of Vicky’s creative methods.
