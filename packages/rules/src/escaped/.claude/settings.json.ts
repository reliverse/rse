export const content = `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bunx ultracite fix"
          }
        ]
      }
    ]
  }
}
`;
