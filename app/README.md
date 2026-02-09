# App Routes Overview

This folder is organized with Expo Router route groups so core screens are scoped and URLs stay clean.

## Route map

```
app/
  _layout.tsx
  index.tsx
  (auth)/
    login.tsx
    signup.tsx
  (onboarding)/
    index.tsx
  (core)/
    home.tsx
    saved.tsx
    chat/
      [coach].tsx
  paywall.tsx
  global.css
```

## Navigation flow

- Entry redirects to `/login`
- Auth screens replace to `/(onboarding)`
- Onboarding replaces to `/home`
- Home pushes to `/chat/[coach]`

## Notes

- Route groups like `(auth)` and `(core)` do not appear in URLs.
- Keep group layouts in the root `_layout.tsx` to avoid extra nesting.
