## Admin Backend Plan

A non-technical admin area at `/admin` to manage everything currently hardcoded, plus bookings.

### 1. Database (migrations)

**New tables**
- `treatments` — slug, name, category, short/long description, price, duration, sessions, benefits (text[]), what_to_expect, image_url, sort_order, is_active
- `team_members` — name, role, bio, credentials, tags (text[]), image_url, icon, sort_order, is_active
- `site_content` — key/value store (e.g. `home.hero.title`, `home.about.text`, `announcement.text`, `home.about.image`) for editable text & images across the site
- `user_roles` + `app_role` enum (`admin`) with `has_role()` security definer function (per security best practice)

**Existing `bookings`** — add admin RLS policies (select/update/delete) gated on `has_role(auth.uid(), 'admin')`. Status field already exists for cancellations.

**Storage** — public `site-images` bucket for uploads (treatments, team, site content). RLS: public read; admin-only write/update/delete.

### 2. Auth

- Email + password only (admins invited manually)
- No public signup page — admins are added by an existing admin from the admin UI ("Invite admin" creates auth user + assigns admin role via server function using service role)
- First admin: bootstrap script / instructions to assign role to your account after first signup
- `/admin/*` routes protected via `_authenticated` layout + role check (redirects non-admins)

### 3. Frontend changes

**Site** — replace hardcoded data sources with DB-backed loaders:
- `src/data/treatments.ts` becomes a thin re-export of a server function fetching from DB (with TanStack Query on consumer pages)
- `team.tsx` fetches team_members from DB
- Hero/About/Announcement/CTA components read from `site_content`
- Existing image imports remain as fallbacks/seed; new images served from storage URLs
- Seed migration inserts current treatments, team, and site content so nothing visually changes on launch

**Admin UI** at `/admin`:
- Dashboard (booking counts, quick links)
- Bookings — table with filters by date/status, view details, change status (pending/confirmed/cancelled/completed), reschedule date/time, delete
- Treatments — list, create, edit, delete, reorder, toggle active, image upload
- Team — list, create, edit, delete, reorder, image upload
- Site Content — form grouped by page/section to edit text and swap images
- Admins — list admins, invite new admin (email + temp password), remove

All CRUD via `createServerFn` with `requireSupabaseAuth` + admin role check. Image upload via storage SDK from the browser (admin session).

### 4. Technical notes

- Server functions in `src/lib/admin/*.functions.ts` and `src/lib/content/*.functions.ts`
- Public site reads use anon key (RLS allows public select on active rows)
- Admin writes verified server-side via `has_role()` in RLS, not client checks
- Image uploads: generate unique filenames (`{table}/{uuid}.{ext}`), store public URL in DB
- Booking status transitions trigger no automatic emails in this pass (existing `send-booking-emails` function is unaffected)

### 5. Out of scope for this pass

- Editing Footer/Header structural links (text only via site_content)
- Multi-language
- Audit log of admin changes
- Email notifications when admin cancels/reschedules a booking (can add later)

### Order of work

1. Migration: tables, RLS, roles, storage bucket, seed data
2. Auth pages (`/admin/login`) + protected layout with role guard
3. Refactor public site to read from DB
4. Admin UI: Bookings → Treatments → Team → Site Content → Admins
5. Bootstrap first admin (you'll sign up via `/admin/login` register-once flow, then I assign the role)