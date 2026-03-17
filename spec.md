# IPA Signer

## Current State
App has a custom-styled IPA signer UI with dark teal theme, header, hero section, How It Works, Features sections, and footer. While functionally similar, the visual design diverges significantly from applejr.net's signer page.

## Requested Changes (Diff)

### Add
- Exact CSS matching applejr.net signer: liquid glass form, #111 background, #1abc9c teal, drop zone, toggle switch, inputs, loader, progress bar, result buttons (.link-btn gray #444)
- File size display in drop zone after IPA selection (matching reference)
- MobileProvision input in manual cert section (currently missing)

### Modify
- Replace entire App.tsx UI to exactly mirror applejr.net's `#page-signer` HTML structure and CSS
- Title: "AppleJr IPA Signer"
- Drop zone text: "📥 Click here to Upload IPA"
- Toggle label: "🔐 Manual Certificate"
- Server cert label: "📁 Select from Server" with "🌏 (AppleJr DNS Required)" link
- Select options exactly: 0. National Oilwell, 1. VIETNAM AIRLINES, 2. Qingdao, 3. Forevermark, 4. China Academy, 5. ChinaTelecom, 6. Vientin, 7. Commission on Elections, 8. Atianjin, 9. Central
- Manual cert section: p12 input, mobileprovision input, password input
- Sign button: "🚀 Sign IPA"
- Loader: "⏳ Signing... please wait"
- Result buttons: "📲 Install IPA" and "⬇️ Download IPA" (gray #444 background)
- Remove header, How It Works, Features, footer sections

### Remove
- Header, nav, hero section, How It Works, Features, footer
- All custom teal-glow design system components

## Implementation Plan
1. Rewrite App.tsx with inline styles matching applejr.net's signer CSS
2. Implement exact HTML structure: form > drop-zone, toggle-group, serverCertSection, manualCertSection, submitBtn, loader, progressBar, resultBtns
3. Signing simulation: show loader+progress bar → after ~3s show result buttons with correct plist URLs
4. Install link uses itms-services:// protocol with selected cert plist URL
