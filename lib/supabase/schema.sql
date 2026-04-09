-- ════════════════════════════════════════════════════════════════
-- NAKSHATRA SHARMA — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for fast text search

-- ── Enums ──────────────────────────────────────────────────────
create type service_category as enum ('cut','color','treatment','styling','bridal');
create type appointment_status as enum ('pending','confirmed','completed','cancelled','no_show');
create type faq_category as enum ('general','services','booking','aftercare','pricing');
create type hairstyle_category as enum ('cut','color','updo','bridal','treatment');
create type face_shape as enum ('oval','round','square','heart','oblong');

-- ════════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════════

-- ── Services ────────────────────────────────────────────────────
create table services (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  name         text not null,
  slug         text not null unique,
  category     service_category not null,
  description  text not null default '',
  includes     text[] not null default '{}',      -- bullet points
  duration_min integer not null check (duration_min > 0),
  price_from   numeric(10,2) not null check (price_from >= 0),
  price_to     numeric(10,2) check (price_to is null or price_to >= price_from),
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  image_url    text
);

create index services_category_idx on services (category);
create index services_featured_idx on services (is_featured) where is_featured = true;

-- ── Appointments ────────────────────────────────────────────────
create table appointments (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  client_name    text not null,
  client_email   text not null,
  client_phone   text,
  service_id     uuid not null references services(id),
  date           date not null,
  time_slot      time not null,
  duration_min   integer not null check (duration_min > 0),
  notes          text,
  status         appointment_status not null default 'pending',
  internal_note  text,

  -- Prevent exact duplicate submissions
  constraint unique_slot unique (date, time_slot, status)
    deferrable initially deferred
);

create index appointments_date_idx  on appointments (date);
create index appointments_email_idx on appointments (client_email);
create index appointments_status_idx on appointments (status);

-- ── Testimonials ─────────────────────────────────────────────────
create table testimonials (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  client_name    text not null,
  client_handle  text,                               -- @instagram
  avatar_url     text,
  rating         smallint not null check (rating between 1 and 5),
  quote          text not null,
  service_name   text,
  is_published   boolean not null default false,
  sort_order     integer not null default 0
);

create index testimonials_published_idx on testimonials (is_published, sort_order)
  where is_published = true;

-- ── Hairstyles (recommendation catalog) ─────────────────────────
create table hairstyles (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  name         text not null,
  slug         text not null unique,
  description  text not null default '',
  image_urls   text[] not null default '{}',
  thumbnail    text not null,                        -- primary image URL
  face_shapes  face_shape[] not null default '{}',   -- which shapes this flatters
  category     hairstyle_category not null,
  tags         text[] not null default '{}',
  service_id   uuid references services(id),
  why          text not null default '',             -- "Why this works for [shape]"
  is_featured  boolean not null default false,
  sort_order   integer not null default 0
);

-- GIN index for the array column → fast @> (contains) queries
create index hairstyles_face_shapes_idx on hairstyles using gin (face_shapes);
create index hairstyles_tags_idx        on hairstyles using gin (tags);
create index hairstyles_category_idx    on hairstyles (category);

-- ── FAQ ──────────────────────────────────────────────────────────
create table faq (
  id         uuid primary key default uuid_generate_v4(),
  question   text not null,
  answer     text not null,
  category   faq_category not null default 'general',
  sort_order integer not null default 0
);

create index faq_category_idx on faq (category, sort_order);

-- ── Salon Config (single row, managed via admin) ─────────────────
create table salon_config (
  id           uuid primary key default uuid_generate_v4(),
  -- Ensure only one row
  singleton    boolean not null unique default true check (singleton = true),
  name         text not null default 'Nakshatra Sharma',
  tagline      text not null default '',
  phone        text not null default '',
  email        text not null default '',
  address      text not null default '',
  instagram_url text,
  buffer_min   integer not null default 15,          -- gap between appointments
  hours_open   time not null default '09:00',
  hours_close  time not null default '18:00',
  working_days integer[] not null default '{1,2,3,4,5,6}'  -- Mon–Sat (0=Sun)
);

-- Insert default config
insert into salon_config (name, tagline, phone, email, address, instagram_url)
values (
  'Nakshatra Sharma',
  'The art of perfect hair.',
  '',
  '',
  '',
  null
);

-- ════════════════════════════════════════════════════════════════
-- STORED FUNCTIONS
-- ════════════════════════════════════════════════════════════════

-- ── get_available_slots(date, service_id) ────────────────────────
-- Returns all time slots for a given date, marking each as available/booked.
-- Runs atomically — no race conditions.
create or replace function get_available_slots(
  p_date       date,
  p_service_id uuid
)
returns table (
  time_slot  text,
  available  boolean,
  reason     text
)
language plpgsql stable security definer
as $$
declare
  v_open        time;
  v_close       time;
  v_buffer      integer;
  v_duration    integer;
  v_current     time;
  v_slot_end    time;
  v_conflict    boolean;
begin
  -- Load config
  select hours_open, hours_close, buffer_min
  into   v_open, v_close, v_buffer
  from   salon_config limit 1;

  -- Load service duration
  select duration_min into v_duration
  from   services where id = p_service_id;

  if v_duration is null then
    raise exception 'Service not found: %', p_service_id;
  end if;

  -- Walk through each slot
  v_current := v_open;
  while v_current + (v_duration || ' minutes')::interval <= v_close loop
    v_slot_end := v_current + (v_duration + v_buffer || ' minutes')::interval;

    -- Check conflicts with existing confirmed/pending appointments
    select exists (
      select 1
      from   appointments a
      where  a.date   = p_date
        and  a.status in ('pending', 'confirmed')
        -- Overlap: new slot starts before existing ends AND ends after existing starts
        and  v_current < a.time_slot + (a.duration_min + v_buffer || ' minutes')::interval
        and  v_slot_end > a.time_slot
    ) into v_conflict;

    -- Mark past slots as unavailable
    if p_date = current_date and v_current <= current_time then
      return query select
        to_char(v_current, 'HH24:MI'),
        false,
        'past';
    elsif v_conflict then
      return query select
        to_char(v_current, 'HH24:MI'),
        false,
        'booked';
    else
      return query select
        to_char(v_current, 'HH24:MI'),
        true,
        null::text;
    end if;

    v_current := v_current + (v_duration || ' minutes')::interval;
  end loop;
end;
$$;

-- ── book_appointment(request) ────────────────────────────────────
-- Atomic insert with conflict check. Returns the new appointment or raises.
create or replace function book_appointment(
  p_service_id   uuid,
  p_date         date,
  p_time_slot    time,
  p_client_name  text,
  p_client_email text,
  p_client_phone text default null,
  p_notes        text default null
)
returns uuid
language plpgsql volatile security definer
as $$
declare
  v_duration  integer;
  v_buffer    integer;
  v_slot_end  time;
  v_conflict  boolean;
  v_new_id    uuid;
begin
  -- Load service duration
  select duration_min into v_duration
  from   services where id = p_service_id;

  -- Load buffer
  select buffer_min into v_buffer
  from   salon_config limit 1;

  v_slot_end := p_time_slot + ((v_duration + v_buffer) || ' minutes')::interval;

  -- Check for conflicts (with row-level lock on conflicting rows)
  perform 1
  from    appointments
  where   date   = p_date
    and   status in ('pending', 'confirmed')
    and   p_time_slot < time_slot + (duration_min + v_buffer || ' minutes')::interval
    and   v_slot_end  > time_slot
  for update;  -- locks the rows to prevent concurrent inserts

  get diagnostics v_conflict = row_count;

  if v_conflict > 0 then
    raise exception 'SLOT_UNAVAILABLE' using hint = 'The selected time slot is no longer available.';
  end if;

  -- Insert
  insert into appointments (
    service_id, date, time_slot, duration_min,
    client_name, client_email, client_phone, notes
  )
  values (
    p_service_id, p_date, p_time_slot, v_duration,
    p_client_name, p_client_email, p_client_phone, p_notes
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table services      enable row level security;
alter table appointments  enable row level security;
alter table testimonials  enable row level security;
alter table hairstyles    enable row level security;
alter table faq           enable row level security;
alter table salon_config  enable row level security;

-- ── services: public read, admin write ──────────────────────────
create policy "services_public_read" on services
  for select using (true);

create policy "services_admin_write" on services
  for all using (auth.role() = 'authenticated');

-- ── hairstyles: public read, admin write ────────────────────────
create policy "hairstyles_public_read" on hairstyles
  for select using (true);

create policy "hairstyles_admin_write" on hairstyles
  for all using (auth.role() = 'authenticated');

-- ── testimonials: public read (published only), admin write ─────
create policy "testimonials_public_read" on testimonials
  for select using (is_published = true);

create policy "testimonials_admin_all" on testimonials
  for all using (auth.role() = 'authenticated');

-- ── faq: public read, admin write ───────────────────────────────
create policy "faq_public_read" on faq
  for select using (true);

create policy "faq_admin_write" on faq
  for all using (auth.role() = 'authenticated');

-- ── salon_config: public read, admin write ──────────────────────
create policy "config_public_read" on salon_config
  for select using (true);

create policy "config_admin_write" on salon_config
  for all using (auth.role() = 'authenticated');

-- ── appointments: anyone can insert (booking), owner reads own, admin reads all ──
create policy "appointments_insert" on appointments
  for insert with check (true);    -- anyone can book

create policy "appointments_owner_read" on appointments
  for select using (client_email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "appointments_admin_all" on appointments
  for all using (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- SEED DATA — Services
-- ════════════════════════════════════════════════════════════════

insert into services (name, slug, category, description, includes, duration_min, price_from, price_to, is_featured, sort_order) values
  ('Signature Cut',      'signature-cut',       'cut',       'A precision cut tailored to your face shape and lifestyle. Includes wash, cut, blow-dry, and style.',     ARRAY['Wash & conditioning', 'Precision cut', 'Blow-dry & style'], 60,  55,  null,  true,  1),
  ('Fringe & Tidy',      'fringe-tidy',         'cut',       'A quick tidy-up — fringe trim, shape refresh, or neck line clean up.',                                    ARRAY['Consultation', 'Trim', 'Style finish'],                     30,  25,  null,  false, 2),
  ('Full Colour',        'full-colour',         'color',     'All-over permanent colour applied root to tip. From natural enhancement to bold transformation.',         ARRAY['Consultation', 'Full colour application', 'Toner', 'Style'], 120, 95, 140,   true,  3),
  ('Balayage / Ombré',   'balayage',            'color',     'Hand-painted highlights for a lived-in, dimensional look. No harsh lines, just light.',                   ARRAY['Balayage placement', 'Toner', 'Blow-dry'],                 150, 130, 180,   true,  4),
  ('Toning & Gloss',     'toning-gloss',        'color',     'A stand-alone toner or gloss treatment to refresh existing colour and boost shine.',                      ARRAY['Toner application', 'Style finish'],                        45,  40,  null,  false, 5),
  ('Keratin Treatment',  'keratin-treatment',   'treatment', 'Smooth, de-frizz, and strengthen with a professional keratin bond treatment. Lasts 3–5 months.',        ARRAY['Deep cleanse', 'Keratin application', 'Sealing iron'],     120, 150, 200,   true,  6),
  ('Deep Conditioning',  'deep-conditioning',   'treatment', 'Intensive moisture and repair mask for dry, damaged, or chemically processed hair.',                     ARRAY['Treatment mask', 'Steam', 'Style'],                         60,  45,  null,  false, 7),
  ('Bridal Hair',        'bridal-hair',         'bridal',    'Your wedding day look — from elegant updos to flowing waves. Includes a pre-wedding trial.',             ARRAY['Pre-wedding trial', 'Wedding day styling', 'Touch-up kit'], 180, 250, 350,   true,  8),
  ('Occasion Styling',   'occasion-styling',    'styling',   'A blowout, updo, or special occasion style for events, photoshoots, or any moment worth dressing for.', ARRAY['Consultation', 'Wash', 'Style'],                            60,  65,  null,  false, 9);

-- ════════════════════════════════════════════════════════════════
-- SEED DATA — FAQ
-- ════════════════════════════════════════════════════════════════

insert into faq (question, answer, category, sort_order) values
  ('How do I book an appointment?',             'Use the booking page on this website — select your service, choose a date and time, fill in your details. You''ll receive a confirmation email instantly.', 'booking',  1),
  ('How far in advance should I book?',         'For cuts and styling, 1–2 weeks is usually enough. For colour services and bridal hair, 3–4 weeks is recommended to secure your preferred slot.',            'booking',  2),
  ('What if I need to cancel or reschedule?',   'Please give at least 48 hours'' notice. Late cancellations (under 24h) may incur a 50% charge. Use the link in your confirmation email to reschedule.',     'booking',  3),
  ('What services do you specialise in?',       'Precision cuts, balayage and hand-painted colour, keratin treatments, and bridal styling. All services are done by Nakshatra personally — no juniors.',      'services', 1),
  ('Do you do hair extensions?',                'Not currently, but this is coming soon. Sign up to the newsletter to be notified first.',                                                                     'services', 2),
  ('How long do keratin treatments last?',      'Between 3 and 5 months depending on your hair type, how often you wash, and the products you use at home. Sulphate-free shampoo extends longevity.',        'aftercare',1),
  ('What should I do before my colour appointment?', 'Come with clean, dry hair (no oils or heavy products). Don''t wash within 24 hours of the appointment. Avoid tight hairstyles the morning of.',       'services', 3),
  ('How do I maintain my balayage?',            'Use a colour-protecting shampoo and conditioner, apply a weekly hair mask, and minimise heat without a protectant. A gloss refresh every 10–12 weeks keeps it vibrant.', 'aftercare', 2),
  ('Do you offer a consultation?',              'Yes — all bookings include a 10-minute consultation at the start of the appointment. For major colour changes or bridal services, a separate consultation can be booked.', 'general', 1),
  ('What products do you use?',                 'Predominantly Davines and Olaplex. Both are professional, ethically produced, and free from harsh sulphates and parabens.',                                  'general',  2);
