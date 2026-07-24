# Learn Supabase with React

এই প্রজেক্টে Supabase-এর মূল ফিচারগুলো React অ্যাপে প্র্যাকটিক্যালি ইমপ্লিমেন্ট করা হয়েছে।

## এই প্রজেক্টে যা করা হয়েছে

1. **Supabase Cloud বনাম Self-Hosted আর্কিটেকচার** এবং **Coolify** ব্যবহার করে **Hostinger VPS**-এ Supabase সেটআপ
2. **React** প্রজেক্ট কানেক্ট করে সম্পূর্ণ **CRUD** অপারেশন
3. **Google SMTP** ব্যবহার করে সম্পূর্ণ **Authentication** সিস্টেম (Signup, email confirm, Login, Logout)
4. **Row Level Security (RLS)** পলিসি দিয়ে ডাটাবেজ-লেভেল সিকিউরিটি
5. **Supabase Realtime** দিয়ে লাইভ ডাটা সিঙ্ক
6. **Supabase Storage** (`tasks-banner` bucket) দিয়ে অ্যাপ থেকে ইমেজ আপলোড

---

## 1. Supabase Cloud vs Self-Hosted

| | Cloud (supabase.com) | Self-Hosted (VPS) |
|--|----------------------|-------------------|
| Setup | Dashboard থেকে project | Docker / Coolify দিয়ে নিজে হোস্ট |
| Cost | Free tier + paid plans | VPS খরচ (যেমন Hostinger) |
| Control | Limited | Full control (SMTP, DB, keys) |
| এই প্রজেক্ট | Local CLI দিয়ে ডেভ | Production-এ Coolify + VPS ব্যবহার করা যায় |

### Coolify + Hostinger VPS-এ Self-Hosted Supabase (সংক্ষেপ)

1. Hostinger VPS নিন → Docker install  
2. Coolify install করুন ([coolify.io](https://coolify.io))  
3. Coolify-তে Supabase (Docker Compose / one-click) ডিপ্লয়  
4. Domain + SSL সেট করুন  
5. Studio থেকে API URL ও anon/publishable key নিন  
6. React `.env`-এ সেই URL/key বসান  

লোকাল ডেভেলপমেন্টে এই রিপোতে **Supabase CLI** (`npx supabase start`) ব্যবহার করা হয়েছে — আর্কিটেকচার Cloud/Self-hosted-এর মতোই (Auth, DB, Storage, Realtime)।

---

## 2. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://docs.docker.com/get-docker/) (চালু থাকতে হবে)
- Git

```bash
docker ps
# fail হলে: sudo systemctl start docker
```

---

## 3. React project setup

```bash
npm create vite@latest learn_supabase_with_react -- --template react
cd learn_supabase_with_react
npm install
npm install @supabase/supabase-js react-router-dom
```

### Supabase client — `src/utils/supabase.js`

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 4. Local Supabase (ডেভ)

```bash
npx supabase init
npx supabase start
```

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| DB | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

```bash
npx supabase stop
```

---

## 5. Environment variables

```bash
cp .env.example .env
```

**Root `.env` (Vite):**

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

SMTP_USER=your-email@gmail.com
SMTP_PASS=your16digitapppassword
SMTP_ADMIN_EMAIL=your-email@gmail.com
SMTP_SENDER_NAME=BookLibrary
```

**`supabase/.env`** — একই SMTP values (CLI SMTP load করার জন্য)। App Password-এ **space রাখবেন না**।

### Google App Password

1. Google Account → Security → 2-Step Verification ON  
2. App passwords → Mail  
3. 16-digit password → `SMTP_PASS`

Self-hosted / Coolify-তেও Auth SMTP settings-এ একই Gmail SMTP ব্যবহার করা যায়।

---

## 6. Authentication (Google SMTP)

`supabase/config.toml`:

```toml
[auth]
site_url = "http://127.0.0.1:5173"
additional_redirect_urls = [
  "http://127.0.0.1:5173/login",
  "http://localhost:5173/login"
]

[auth.email]
enable_signup = true
enable_confirmations = true

[auth.email.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
user = "env(SMTP_USER)"
pass = "env(SMTP_PASS)"
admin_email = "env(SMTP_ADMIN_EMAIL)"
sender_name = "env(SMTP_SENDER_NAME)"
```

Config বদলালে:

```bash
npx supabase stop && npx supabase start
```

ইমপ্লিমেন্টেশন: `src/pages/Signup.jsx`, `src/pages/Login.jsx`, `src/components/Header.jsx`

---

## 7. Row Level Security (RLS)

`tasks` টেবিলে `user_id` + RLS — শুধু logged-in user নিজের ডাটা insert/update/delete করতে পারে।

উদাহরণ policy:

```sql
-- Insert: auth.uid() = user_id
create policy "Users can insert own tasks"
on public.tasks for insert
to authenticated
with check (auth.uid() = user_id);
```

কোডে insert-এর সময় `user_id: user.id` পাঠানো হয় (`src/hooks/useBooks.js`)।

---

## 8. Realtime

`tasks` table realtime publication-এ আছে। Channel:

```js
supabase
  .channel('tasks-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
    getBooks()
  })
  .subscribe()
```

অন্য ট্যাব/ডিভাইসে add/edit/delete করলে UI লাইভ আপডেট হয়।

---

## 9. Storage (image upload)

Bucket: **`tasks-banner`** (public)

```js
const path = `public/${Date.now()}_${image.name}`
const { data } = await supabase.storage.from('tasks-banner').upload(path, image)
const { data: { publicUrl } } = supabase.storage.from('tasks-banner').getPublicUrl(data.path)
```

ইমপ্লিমেন্টেশন: `src/utils/storage.js`, `src/components/BookForm.jsx`

---

## 10. Run the app

```bash
npm install
npm run dev
```

`dev` script: `supabase/.env` load → Supabase start → Vite

| Command | কাজ |
|---------|-----|
| `npm run dev` | Supabase + Vite |
| `npm run supabase:start` | শুধু Supabase |
| `npm run supabase:stop` | Supabase বন্ধ |
| `npm run build` | Production build |

App: http://localhost:5173

Cloud বা Coolify VPS ব্যবহার করলে `.env`-এ শুধু production `VITE_SUPABASE_URL` ও key বদলালেই React অ্যাপ কানেক্ট হবে।

---

## Project structure

```
learn_supabase_with_react/
├── .env / .env.example
├── package.json
├── supabase/
│   ├── config.toml
│   └── .env              # SMTP (gitignored)
└── src/
    ├── utils/supabase.js
    ├── utils/storage.js
    ├── hooks/useBooks.js   # CRUD + Realtime + RLS user_id
    ├── pages/Home.jsx
    ├── pages/Login.jsx
    ├── pages/Signup.jsx
    └── components/
```

---

## Common problems

| Problem | Fix |
|---------|-----|
| Docker connect error | Docker start করে `npx supabase start` |
| Signup 500 / SMTP BadCredentials | App Password ঠিক আছে কিনা; `supabase/.env`; restart |
| Insert RLS error | Login করুন; `user_id = auth.uid()` |
| Confirm redirect ভুল | `site_url` / redirect URLs → Vite port `5173` |
| Storage upload fail | Login + bucket `tasks-banner` policies |

---

## Docs

- [Supabase local development](https://supabase.com/docs/guides/cli/local-development)
- [Self-hosting](https://supabase.com/docs/guides/self-hosting)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)
