# SADAT BEIGH Music Website

A Next.js artist site with a private Supabase-powered admin dashboard. Admins can add, edit, publish/unpublish, and delete music entries using official YouTube, Spotify, or SoundCloud URLs. No audio files are uploaded; embeds are supplied by each platform.

## 1) Create Supabase project
1. Create a project at https://supabase.com/ and keep the project URL and anon/public key.
2. In Authentication > Providers, ensure Email is enabled.
3. In Authentication > Settings, turn **off public sign-ups**. The owner will create the admin account manually.
4. Open SQL Editor, paste `supabase.sql`, and run it.
5. In Authentication > Users, choose Add user and create your admin email/password. Confirm the user if required.
6. Copy the user's UUID. In SQL Editor run (replace the UUID):
   ```sql
   insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
   ```
   Do not expose the service-role key in the website or commit it to GitHub.

## 2) Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
```
Edit `.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL` = Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon/public key (never service-role key)

Then:

```bash
npm run dev
```
Open http://localhost:3000. Admin page is http://localhost:3000/admin.

## 3) Deploy with GitHub + Vercel
1. Create a GitHub repository and push this project.
2. In Vercel, import that repository.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in Vercel Project Settings > Environment Variables.
4. Deploy. Every commit to the connected branch triggers a new deployment.

## 4) Add music
1. Sign in at `/admin` with the manually-created admin user.
2. Enter song title, artist, platform, and the official URL. Optional: cover image URL and release date.
3. Keep “Publish on website” checked to display it on the homepage.
4. Click Add release. Edit or delete entries in the list below.

### Supported URLs
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- Spotify: `https://open.spotify.com/track/TRACK_ID` (album/playlist links also supported)
- SoundCloud: public track URL such as `https://soundcloud.com/artist/track`

## Security notes
- Supabase RLS is enabled. Public visitors can select only published songs.
- Admin writes require the authenticated user's UUID to be manually present in `admin_users`.
- Disable public signups. Never use the Supabase service-role key in browser code.
- Only add music and cover art you own or have permission to publish. Platform embeds follow the platform's availability and terms.
