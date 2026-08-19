# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Instead, use
GitHub's private vulnerability reporting ("Report a vulnerability" under the
Security tab) once the repository is published, or contact the maintainers
directly. You will get an acknowledgment within 7 days.

## Scope & threat model

Human Mode is a local-first app: there is no server, no account system, and
no network I/O in the MVP codebase. The data that matters most is the
user's own behavioral record and private reflections stored on-device.

Especially valuable reports:

- Any code path that causes user data to leave the device
- Data loss or corruption in storage/migrations
- Dependency vulnerabilities that affect the built app
- Ways the exported JSON could leak more than the user sees

## Privacy invariants (enforced by architecture, verifiable by grep)

1. No `fetch` / `XMLHttpRequest` / sockets in `packages/core` (lint-enforced)
   or in `apps/mobile` source.
2. All persistence goes through the `StoragePort` in `packages/core`.
3. Corrupt data is backed up locally, never silently discarded.
4. Deleting data removes both the store and any backup keys.

A PR that breaks an invariant fails privacy review regardless of intent.

## Dependency vulnerabilities

English · [繁體中文](#相依套件的漏洞繁體中文)

`npm install` reports 22 vulnerabilities. Dependabot reports 3 alerts. Both
numbers are correct and they measure different things: there are **two**
vulnerable packages and **three** advisories against them, and npm counts every
one of the 20 ancestor packages on the path as its own finding. Read the
Security tab, not the install output.

### How these are triaged

Three questions, in order. A "no" at the first two is not a dismissal — it is
the difference between a vulnerability and an exposure, and it decides urgency,
not whether to fix.

1. **Does the vulnerable code reach the shipped app?** The web export is static
   HTML and JavaScript; the bundler, the CLI and the native prebuild tooling
   do not ship. Verify rather than assume — grep `apps/mobile/dist` after
   `npm run build`.
2. **Does it reach an untrusted input?** A parser vulnerability matters when
   something an attacker controls is parsed. In a local-first app with no
   server and no network I/O, most build-time parsers only ever see files that
   are already in the repository.
3. **Is there a patched version, and does upgrading break anything we cannot
   test?** Forcing a resolution to silence an unreachable alert, in a code path
   with no test coverage, trades a theoretical problem for a real one.

### Standing assessment (2026-08-19)

| Advisory | Package | Path | Assessment |
| --- | --- | --- | --- |
| [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) — high, DoS via infinite loop in the ICNS / JXL / HEIF parsers | `image-size@1.2.1` | `expo` → `@expo/metro` → `metro` | **Build-time only, no fix available.** Every published version through 2.0.2 is affected; there is no patched release to move to. Metro calls it to read the dimensions of image assets while bundling, so the only "crafted image" it will ever see is one committed to this repository. Absent from the built bundle (verified by grep). Reachable only by someone who can already land an asset file here — which is a code-review problem, not a dependency problem. |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — medium, missing buffer bounds check | `uuid@7.0.3` | `expo-splash-screen` → `@expo/config-plugins` → `xcode` | **Unreachable, fix deliberately not forced.** The flaw is in `v3()`, `v5()` and `v6()` when the caller supplies an output buffer. `xcode` calls `uuid.v4()` with no buffer, and only during `expo prebuild`, which this project does not run — there is no `ios/` or `android/` directory. An `overrides` entry to `uuid@11` would clear the badge by jumping four majors in a package no test exercises. That is a worse trade than the alert. |

If either assessment stops holding — the app gains a build step that parses
user images, or the project starts running `expo prebuild` — revisit both.
Say so in a PR rather than quietly changing the table.

### Automated updates

`.github/dependabot.yml` turns alerts into pull requests, and CI decides
whether they can land. Two gates matter beyond the usual lint/typecheck/test:

- **`npx expo install --check`** is the authority on which versions of React
  Native, Metro and the `react-native-*` family an Expo SDK supports. A bump
  can satisfy semver, pass every other check, and still produce a tree Expo
  does not support — the react-native family moving 0.86 → 0.87 did exactly
  that, at *minor* level.
- **The app's own test suite**, which caught Dependabot bumping `react` without
  `react-dom`. React refuses to start on a version mismatch, and nothing else
  in CI would have noticed before it shipped.

Everything the Expo SDK pins is therefore ignored by Dependabot at every update
level and updated with `npx expo install --fix` during an SDK upgrade. That is
a deliberate trade: those packages stop getting automated version PRs, and
security *alerts* against them still arrive and are triaged by hand, as above.

## 相依套件的漏洞（繁體中文）

[English](#dependency-vulnerabilities) · 繁體中文

`npm install` 會說有 22 個漏洞，Dependabot 會說有 3 則警示。兩個數字都對，
只是在數不同的東西：實際上有**兩個**有問題的套件、**三則** advisory，
而 npm 把通往它們路徑上的 20 個上游套件也各算一筆。看 Security 分頁，
不要看 install 的輸出。

### 怎麼判斷

三個問題，照順序問。前兩題答「否」不是把問題掃掉——那是「漏洞」和「暴露」的
差別，決定的是急迫性，不是要不要修。

1. **有問題的程式碼會不會跑進出貨的 app？** 網頁版輸出是靜態的 HTML 和
   JavaScript；打包器、CLI、原生 prebuild 工具都不會被打包進去。
   要驗證，不要假設——跑完 `npm run build` 之後，grep 一次 `apps/mobile/dist`。
2. **它會不會碰到不受信任的輸入？** 一個 parser 的漏洞，要在它去解析
   攻擊者能控制的東西時才有意義。在一個沒有伺服器、沒有任何網路 I/O 的
   local-first app 裡，大多數 build 階段的 parser 這輩子只會看到
   已經在這個 repo 裡的檔案。
3. **有沒有修好的版本？升上去會不會弄壞我們測不到的東西？** 為了讓一則
   碰不到的警示消失，硬把某個沒有任何測試涵蓋的相依鎖到新版本，
   是拿一個理論上的問題去換一個真實的問題。

### 目前的判斷（2026-08-19）

| Advisory | 套件 | 路徑 | 判斷 |
| --- | --- | --- | --- |
| [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)、[GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq)——high，ICNS / JXL / HEIF 解析器無限迴圈造成的 DoS | `image-size@1.2.1` | `expo` → `@expo/metro` → `metro` | **只在 build 時跑，而且上游沒有修。** 到 2.0.2 為止每一個發布過的版本都中招，沒有可以升上去的版本。metro 呼叫它是為了在打包時讀圖片素材的尺寸，所以它這輩子唯一會看到的「惡意圖片」，是已經 commit 進這個 repo 的那一種。打包產物裡沒有它（已用 grep 確認）。要打到它，前提是那個人本來就有辦法把素材檔案放進來——那是 code review 的問題，不是相依套件的問題。 |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)——medium，缺少 buffer 邊界檢查 | `uuid@7.0.3` | `expo-splash-screen` → `@expo/config-plugins` → `xcode` | **打不到，而且刻意不去強制修它。** 問題出在 `v3()`、`v5()`、`v6()`，而且要呼叫端自己傳一個輸出 buffer 進去。`xcode` 呼叫的是 `uuid.v4()`、沒有傳 buffer，而且只在 `expo prebuild` 的時候才會跑——這個專案不跑它，連 `ios/` 和 `android/` 目錄都沒有。用 `overrides` 把 uuid 拉到 11 確實可以讓那個標記消失，代價是把一個沒有任何測試碰得到的套件跳四個大版本。那個交換比警示本身更糟。 |

如果哪一天上面的判斷不再成立——app 多了一個會去解析使用者圖片的 build 步驟、
或者專案開始跑 `expo prebuild`——那就兩個都要重新看一次。
請在 PR 裡說出來，不要默默改掉這張表。

### 自動更新

`.github/dependabot.yml` 把警示變成 pull request，再由 CI 決定它能不能進來。
除了常規的 lint／typecheck／test 之外，有兩道關卡真正重要：

- **`npx expo install --check`**——關於一個 Expo SDK 支援哪些版本的
  React Native、Metro 和 `react-native-*` 家族，它才是權威。一次版本升級
  可以完全合乎 semver、通過其他所有檢查，卻仍然產生一棵 Expo 不支援的
  相依樹——react-native 家族從 0.86 升到 0.87 就是這樣，而且那些全都是
  *minor* 等級。
- **App 自己的測試套件**——它抓到 Dependabot 只升了 `react`、卻沒有動
  `react-dom`。React 遇到版本不一致會直接拒絕啟動，而 CI 裡沒有別的東西
  會在它出貨之前發現這件事。

所以：只要是 Expo SDK 鎖住的套件，Dependabot 在**所有**更新等級上都被關掉，
改成在升級 SDK 時用 `npx expo install --fix` 一起帶。這是一個刻意的取捨：
那些套件不再收到自動的版本更新 PR，但針對它們的安全**警示**還是會照常進來，
然後照上面的方式一則一則人工判斷。

## Supported versions

Pre-1.0: only the latest release receives fixes.
