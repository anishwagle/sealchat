# Strategy: SEO Public Billboard Profiles

*Drafted: Future Migration Roadmap*

## The Goal
Transform user profiles into highly-curated, read-only public pages (`sealchat.com/profile/[username]`) accessible by Google Scrapers and unauthenticated guests. This follows the organic growth blueprint of Twitter (X) and Reddit, turning every user profile into a viral marketing funnel.

## 1. Exposing the Routing Layer
The Next.js Edge proxy completely blocks unauthorized traffic from traversing the application. 
When we are ready to implement public profiles, we must modify `src/proxy.ts`:

```typescript
// Add '/profile/' or the explicit dynamic route to the public bypass array
const PUBLIC_PAGE_PREFIXES = ['/auth/', '/profile/'];
```
This forces the middleware to allow Google bots to hit `sealchat.com/profile/[username]`.

## 2. Decoupling the Profile API
Currently, profiles are fetched securely using `GET /api/protected/profile/[username]`. We must generate a public, stripped-down equivalent.

**Create `src/app/api/public/profile/[username]/route.ts`:**
- This endpoint will execute the exact same Postgres RPC call (`get_profile_metadata`).
- If the guest is unauthenticated, the middleware shouldn't block it, and we pass `null` as the `p_current_user_id`.
- The `get_profile_metadata` Postgres RPC is mathematically designed for this: if the viewing user is `null`, its internal `CASE WHEN` logic automatically filters out any location, birthdate, or bio data marked as `'friends'` or `'private'`, safely returning only `'public'` data.

## 3. SEO Post Feed Migration
When a guest visits the public profile, the `<PostList>` component needs to display the user's opinions.
- Ensure the frontend checks a new endpoint like `GET /api/public/posts?username=[username]`.
- Enforce strict database policies: `SELECT * FROM posts WHERE user_id = X AND is_public = true`.

## 4. Viral Funnel UI
The most prominent element on this public profile page will not be the feed—it must be a massive sticky Call-To-Action button: **"Join SealChat to connect with [Name]."**
This ensures all organic SEO traffic funnels directly into the Waitlist/Magic Link authentication loop.
