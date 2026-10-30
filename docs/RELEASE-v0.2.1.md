# United Nations skin — v0.2.1

A small composer fix, requested from daily use.

## Send button

- **Enabled now looks enabled.** The send button had been mapped to a 10 % blue tint, so a white arrow
  on a pale pill read as “nothing to send” even with text in the composer. It now uses a solid UN blue
  (`#0077A8`; dark: `#1D9BCB`) with a white arrow and a soft shadow.
- **Disabled stays quiet.** With an empty composer it is the original pale tint at 38 % opacity, so the
  two states are unmistakable.
- **Restrained spring on send.** Press: the button squashes to 88 % with a fast ease and springs back
  on release. Send: one short pop and a single expanding ring, then nothing.
- **Locale-independent.** The styling and the feedback hook target the composer's primary button by
  class, not by the English “Send message” label, so it works in Chinese, Arabic and every other
  language.

## Update

```bash
cd united_nation_skin_deepseek_harness && git pull
./scripts/install.sh            # Windows: .\scripts\install.ps1
# fully quit and restart DeepSeek Harness
```

Requires DeepSeek Harness ≥ 0.1.5. Community project, not affiliated with or endorsed by the United
Nations.
