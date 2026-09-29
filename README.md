# LOCO.com – Premium Car Rental Platform

A complete, production-ready peer-to-peer car rental website built with **Next.js 15**, **TypeScript**, **Supabase**, and designed for **Vercel** deployment.

Customers can browse vehicles, view details, and submit booking requests. Owners manage the fleet and bookings through a protected admin dashboard.

---

## Features

### Customer
- Modern homepage with featured vehicles
- Browse all active cars
- Individual car pages with image gallery
- Booking request form with:
  - Personal info, pickup/drop-off addresses & times
  - Payment preference (PayPal, Cash App, Zelle, Chime)
  - Driver’s license / ID verification **placeholder** (no documents stored)
- Overlap prevention (server-side + PostgreSQL exclusion constraint)

### Admin (protected)
- Email/password login via Supabase Auth
- Role-based access (only `admin` role can access `/admin`)
- Add / edit / delete / hide-unhide vehicles
- Upload multiple images via Supabase Storage
- View all bookings with status filters
- Approve / reject / cancel bookings
- Full customer & trip details

### Security
- Row Level Security (RLS) on all tables
- Middleware protects `/admin` routes
- Booking data only visible to admins
- No sensitive ID documents stored

---

## Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Framework   | Next.js 15 (App Router) |
| Language    | TypeScript              |
| Styling     | Tailwind CSS            |
| Database    | Supabase (PostgreSQL)   |
| Auth        | Supabase Auth           |
| Storage     | Supabase Storage        |
| Deploy      | Vercel                  |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment)
- GitHub account

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `loco-com`), set a strong database password, pick a region
3. Wait for the project to finish provisioning

### 3. Run the Database Schema

1. In the Supabase dashboard go to **SQL Editor** → **New query**
2. Open the file `sql/schema.sql` from this project
3. Paste the entire contents into the SQL Editor and click **Run**
4. Confirm there are no errors

This creates:
- `profiles`, `cars`, `bookings` tables
- Overlap exclusion constraint
- RLS policies
- Storage bucket `car-images` + policies
- Sample seed vehicles (optional – you can delete them later)

### 4. Create the Admin Account

1. In Supabase go to **Authentication** → **Users** → **Add user**
2. Create a user with your email and a strong password  
   (or use the **Sign up** flow from the app later)
3. After the user exists, run this in the SQL Editor (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

4. Verify:

```sql
SELECT id, email, role FROM public.profiles;
```

### 5. Configure Supabase Storage (if not already created by schema)

1. Go to **Storage** in the Supabase dashboard
2. Confirm a public bucket named `car-images` exists
3. If not, create it: **New bucket** → name `car-images` → **Public bucket** = ON
4. The schema already adds the correct storage policies

### 6. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in values from Supabase → **Settings** → **API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 7. Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Customer site: `/`
- Admin login: `/login`
- Admin dashboard: `/admin` (after login)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial LOCO.com commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loco-com.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Add Environment Variables:

| Name                         | Value                          |
|-----------------------------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`  | your Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key     |

5. Click **Deploy**

### 3. Post-Deploy

- Visit your Vercel URL
- Test customer booking flow
- Log in at `/login` with the admin account
- Add/edit vehicles and manage bookings

---

## Project Structure

```
loco-com/
├── sql/
│   └── schema.sql          # Full database schema + RLS + seed
├── src/
│   ├── app/
│   │   ├── page.tsx        # Homepage
│   │   ├── cars/           # Browse & detail & book
│   │   ├── admin/          # Protected dashboard
│   │   ├── login/          # Admin login
│   │   ├── api/            # API routes (bookings, admin cars/bookings)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── cars/           # CarCard, Gallery, BookingForm
│   │   └── admin/          # AdminNav, CarForm, actions
│   ├── lib/
│   │   ├── supabase/       # Client, server, middleware helpers
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts       # Auth + admin role protection
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Testing Checklist

### Customer
- [ ] Homepage loads and shows featured cars
- [ ] `/cars` lists all active vehicles
- [ ] Car detail page shows gallery, price, description
- [ ] Booking form submits successfully
- [ ] Overlapping dates are rejected with a clear message
- [ ] Success page appears after booking

### Admin
- [ ] Non-admin users cannot access `/admin`
- [ ] Admin can log in at `/login`
- [ ] Dashboard shows stats and recent bookings
- [ ] Add a new vehicle with images
- [ ] Edit vehicle details and toggle visibility
- [ ] Delete a vehicle (only if no active bookings)
- [ ] View booking details
- [ ] Approve / reject / cancel a booking
- [ ] Sign out works

---

## ID Verification Placeholder

The booking form includes a clear notice that a driver’s license is required.  
**No identity documents are uploaded or stored.**

When you are ready for production identity verification, integrate a compliant provider such as:

- [Stripe Identity](https://stripe.com/identity)
- [Persona](https://withpersona.com)
- [Jumio](https://www.jumio.com)

Update the `id_verification_status` field on the booking after the provider callback.

---

## Payment Methods

PayPal, Cash App, Zelle, and Chime are stored as the customer’s **preferred** payment method only.  
No payment processing APIs are integrated. After approving a booking, contact the customer to arrange payment through their chosen method.

---

## Contact

- mattewgross85@gmail.com
- alexander22gate@gmail.com
- (201) 619-8112
- (303) 616-0578

---

## License

Private project – all rights reserved.
