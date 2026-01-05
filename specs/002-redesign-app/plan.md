# Implementation Plan: UI/UX Redesign

## Architecture Changes (Frontend Only)

### Routing
*   **Current**: `/` is protected (TodoList).
*   **New**:
    *   `/`: Public Landing Page.
    *   `/dashboard`: Protected TodoList (The "App").
    *   `middleware.ts`: Update matchers to allow `/` as public.

### Components
*   `app/page.tsx`: Transform into Landing Page.
*   `app/dashboard/page.tsx`: **NEW**. Move the existing Todo logic/components here.
*   `app/(components)/Navbar.tsx`: Rewrite for new design + Dropdown.
*   `app/(components)/Todo*.tsx`: Rewrite JSX/Classes for new design.

## Design System (Tailwind)
*   **Backgrounds**: `bg-gray-50`, `bg-white`.
*   **Primary Action**: `bg-blue-600` (or similar soft blue).
*   **Shadows**: `shadow-lg`, `shadow-xl`, custom arbitrary values if needed for "3D".
*   **Rounded**: `rounded-xl`, `rounded-2xl`.
*   **Colors**: `text-gray-800` (primary text), `text-gray-500` (secondary).

## Migration Steps
1.  **Refactor Directory**: Create `app/dashboard` and move Todo logic there.
2.  **Middleware**: Exclude `/` from auth redirect.
3.  **Landing Page**: Implement `app/page.tsx`.
4.  **Components**: Iteratively style `Navbar`, `Login`, `Signup`, `TodoList`.

## Verification Strategy
1.  **Visual Check**: Build and view in browser.
2.  **Auth Flow**: Verify Login/Signup redirects to `/dashboard`.
3.  **Public Access**: Verify `/` works without cookies.
4.  **Todo Ops**: Verify Add/Update/Delete works on `/dashboard`.
