# United Nations skin — v0.3.0

The skin is now an ordinary, switchable DSH plugin.

## What changed

- **Installed through DSH's plugin manager.** `install_bundle` records the dependency and selects the
  bundle; there is no hand-copied package and no edited profile file.
- **Native on/off switch.** The sidebar **Plugins** page lists the theme under **Installed plugins**
  as **United Nations**. Switching it off removes the palette, background rotation, ribbons, brand
  slot and settings page immediately; switching it on restores them. Removing the plugin uninstalls
  it cleanly.
- **Display metadata.** `locale/en.json` and `locale/zh.json` give the plugin card its title and
  description; `icon.png` is the card icon.
- **Docs.** The READMEs now lead with the Plugins-page install and switch, and keep the
  script/CLI/manual route for DSH 0.1.5–0.2.1.

Nothing in the DSH installation itself is modified. A local-directory install is a `link:` and needs
the checkout to stay in place; a GitHub install is self-contained.

## Verify the switch

1. Sidebar → **Plugins** → **Installed plugins** → **United Nations**.
2. Toggle off: the native DSH appearance returns (no restart on a profile with HMR).
3. Toggle on: the skin returns.
4. Detail page → **Remove** uninstalls it.

## Install

Plugins → **Add plugin** → `github:muzapar00/united_nation_skin_deepseek_harness` → **Install** →
**Enable now**. Legacy DSH users can still run `./scripts/install.sh`.

Community project, not affiliated with or endorsed by the United Nations.
