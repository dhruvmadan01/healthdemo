-- 1. Add new columns to the existing doctors table if they do not exist
alter table public.doctors add column if not exists email text;
alter table public.doctors add column if not exists phone text;
alter table public.doctors add column if not exists status text default 'pending';

-- 2. Safely add check constraint for the status column
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'doctors_status_check') then
        alter table public.doctors add constraint doctors_status_check check (status in ('pending', 'approved', 'rejected'));
    end if;
end;
$$;


-- 3. Drop existing policies to prevent "already exists" errors
drop policy if exists "Users can view any profile (for searching by health_id)" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

drop policy if exists "Users can view family relationships they are part of" on public.family_members;
drop policy if exists "Users can propose family relationships" on public.family_members;
drop policy if exists "Users can update/approve family relationships they are the member of" on public.family_members;
drop policy if exists "Users can delete family relationships they are part of" on public.family_members;

drop policy if exists "Hospitals are viewable by everyone" on public.hospitals;
drop policy if exists "Anyone can register a hospital or clinic" on public.hospitals;

drop policy if exists "Doctors are viewable by everyone" on public.doctors;
drop policy if exists "Anyone can register as a doctor" on public.doctors;
drop policy if exists "Admins can update doctors" on public.doctors;

drop policy if exists "Users can view their own appointments" on public.appointments;
drop policy if exists "Users can insert their own appointments" on public.appointments;
drop policy if exists "Users can update their own appointments" on public.appointments;
drop policy if exists "Doctors can view appointments for verification" on public.appointments;
drop policy if exists "Doctors can update checkin status" on public.appointments;

drop policy if exists "Users can view their own prescriptions" on public.prescriptions;
drop policy if exists "Users can insert their own prescriptions" on public.prescriptions;

drop policy if exists "Users can view their own lab reports" on public.lab_reports;
drop policy if exists "Users can insert their own lab reports" on public.lab_reports;


-- 4. Create Tables (if they don't exist)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    health_id text unique not null,
    name text not null,
    email text,
    phone text,
    dob date,
    gender text default 'Unspecified',
    blood_group text default 'O+',
    height numeric default 170,
    weight numeric default 70,
    bmi numeric default 24.2,
    emergency_contact jsonb default '{"name": "", "relation": "", "phone": ""}'::jsonb,
    settings jsonb default '{"language": "English", "organDonor": false, "darkMode": false, "biometricsEnabled": false}'::jsonb,
    medical_history jsonb default '{"allergies": [], "chronicDiseases": [], "surgeries": [], "currentMedicines": []}'::jsonb,
    lifestyle jsonb default '{"smoking": "Never", "alcohol": "Never", "exercise": "None", "sleep": "8 hours"}'::jsonb,
    health_score integer default 80,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.family_members (
    id uuid primary key default gen_random_uuid(),
    primary_user_id uuid not null references public.profiles(id) on delete cascade,
    member_user_id uuid not null references public.profiles(id) on delete cascade,
    relation text not null,
    permission text not null check (permission in ('view', 'edit')),
    status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamptz default timezone('utc'::text, now()) not null,
    unique(primary_user_id, member_user_id)
);

create table if not exists public.hospitals (
    id text primary key,
    name text not null,
    image text,
    address text,
    coordinates jsonb,
    departments text[],
    emergency_icu_status text,
    amenities text[],
    rating numeric,
    reviews_count integer,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.doctors (
    id text primary key,
    name text not null,
    qualification text,
    specialty text,
    experience integer,
    hospital_id text references public.hospitals(id) on delete cascade,
    reviews jsonb,
    consulting_fee numeric,
    consultation_types text[],
    languages text[],
    accepted_insurance text[],
    availability text[],
    awards text[],
    image text,
    email text,
    phone text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.appointments (
    id text primary key,
    patient_id uuid references public.profiles(id) on delete cascade,
    doctor_id text references public.doctors(id) on delete cascade,
    hospital_id text references public.hospitals(id) on delete cascade,
    date date not null,
    time text not null,
    symptoms text,
    reports text[],
    insurance text,
    payment_status text,
    payment_amount numeric,
    qr_code text,
    visit_token text,
    status text,
    check_in_status text,
    queue jsonb,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.prescriptions (
    id text primary key,
    appointment_id text references public.appointments(id) on delete set null,
    patient_id uuid references public.profiles(id) on delete cascade,
    doctor_id text references public.doctors(id) on delete set null,
    doctor text,
    date date not null,
    notes text,
    medicines jsonb,
    file text,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.lab_reports (
    id text primary key,
    patient_id uuid references public.profiles(id) on delete cascade,
    test_name text not null,
    date date not null,
    status text,
    doctor text,
    file text,
    created_at timestamptz default timezone('utc'::text, now()) not null
);


-- 5. Recreate RLS Policies
alter table public.profiles enable row level security;
create policy "Users can view any profile (for searching by health_id)" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

alter table public.family_members enable row level security;
create policy "Users can view family relationships they are part of" on public.family_members for select using (auth.uid() = primary_user_id or auth.uid() = member_user_id);
create policy "Users can propose family relationships" on public.family_members for insert with check (auth.uid() = primary_user_id);
create policy "Users can update/approve family relationships they are the member of" on public.family_members for update using (auth.uid() = member_user_id or auth.uid() = primary_user_id);
create policy "Users can delete family relationships they are part of" on public.family_members for delete using (auth.uid() = primary_user_id or auth.uid() = member_user_id);

alter table public.hospitals enable row level security;
create policy "Hospitals are viewable by everyone" on public.hospitals for select using (true);
create policy "Anyone can register a hospital or clinic" on public.hospitals for insert with check (true);

alter table public.doctors enable row level security;
create policy "Doctors are viewable by everyone" on public.doctors for select using (true);
create policy "Anyone can register as a doctor" on public.doctors for insert with check (true);
create policy "Admins can update doctors" on public.doctors for update using (true);

alter table public.appointments enable row level security;
create policy "Users can view their own appointments" on public.appointments for select using (auth.uid() = patient_id);
create policy "Users can insert their own appointments" on public.appointments for insert with check (auth.uid() = patient_id);
create policy "Users can update their own appointments" on public.appointments for update using (auth.uid() = patient_id);
create policy "Doctors can view appointments for verification" on public.appointments for select using (true);
create policy "Doctors can update checkin status" on public.appointments for update using (true);

alter table public.prescriptions enable row level security;
create policy "Users can view their own prescriptions" on public.prescriptions for select using (auth.uid() = patient_id);
create policy "Users can insert their own prescriptions" on public.prescriptions for insert with check (auth.uid() = patient_id);

alter table public.lab_reports enable row level security;
create policy "Users can view their own lab reports" on public.lab_reports for select using (auth.uid() = patient_id);
create policy "Users can insert their own lab reports" on public.lab_reports for insert with check (auth.uid() = patient_id);


-- 6. Seed static tables and update entries
insert into public.hospitals (id, name, image, address, coordinates, departments, emergency_icu_status, amenities, rating, reviews_count)
values 
('h1', 'St. Elizabeth Medical Center', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400', '736 Medical Parkway, Metro City', '{"lat": 40.7128, "lng": -74.0060}', array['Cardiology', 'Pediatrics', 'Emergency Medicine', 'Neurology', 'Orthopedics'], 'Available (4 ICU beds free)', array['24/7 Ambulance', 'Valet Parking', 'Wheelchair Accessible', 'Cafeteria', 'Pharmacy'], 4.8, 1420),
('h2', 'Metro Pediatric & General Hospital', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400', '120 Oakwood Lane, West End', '{"lat": 40.7250, "lng": -74.0150}', array['Pediatrics', 'General Medicine', 'Dermatology', 'ENT'], 'Busy (ICU Full)', array['Ambulance Service', 'Parking', 'Wheelchair Accessible', 'On-site Pharmacy'], 4.5, 680),
('h3', 'Apex Cardiology & Rehabilitation Clinic', 'https://images.unsplash.com/photo-1586773860418-d3b3de97e663?auto=format&fit=crop&q=80&w=400', '95 Cardiovascular Blvd, Heights District', '{"lat": 40.7010, "lng": -73.9980}', array['Cardiology', 'Physical Rehab', 'Sports Medicine'], 'No ICU (Specialty Clinic)', array['Valet Parking', 'Wheelchair Accessible', 'Rehab Gym'], 4.9, 310)
on conflict (id) do update set
name = excluded.name,
address = excluded.address;

insert into public.doctors (id, name, qualification, specialty, experience, hospital_id, reviews, consulting_fee, consultation_types, languages, accepted_insurance, availability, awards, image, email, phone, status)
values
('d1', 'Dr. Elizabeth Vance', 'MD, FACC - Harvard Medical School', 'Cardiology', 14, 'h1', '{"rating": 4.9, "count": 245}', 150, array['In-person', 'Online'], array['English', 'Hindi'], array['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'], array['09:00 - 12:00', '14:00 - 17:00'], array['Top Cardiologist Metro Area 2024', 'AMA Research Award'], 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 'elizabeth.vance@medigi.com', '+1-555-0190', 'approved'),
('d2', 'Dr. Marcus Vance', 'MD, FAAP - Johns Hopkins University', 'Pediatrics', 10, 'h2', '{"rating": 4.7, "count": 189}', 100, array['In-person', 'Online'], array['English'], array['Blue Cross', 'Cigna', 'Medicaid'], array['08:30 - 11:30', '13:00 - 16:30'], array['Compassionate Care Award 2025'], 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', 'marcus.vance@medigi.com', '+1-555-0191', 'approved'),
('d3', 'Dr. Sarah Lin', 'MD, D.D.V - Stanford School of Medicine', 'Dermatology', 8, 'h2', '{"rating": 4.8, "count": 312}', 120, array['In-person', 'Online'], array['Hindi'], array['Aetna', 'UnitedHealth', 'Humana'], array['10:00 - 13:00', '15:00 - 18:00'], array['Young Investigator Fellowship 2023'], 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300', 'sarah.lin@medigi.com', '+1-555-0192', 'approved'),
('d4', 'Dr. Jonathan Reyes', 'MD, PhD - Yale School of Medicine', 'Neurology', 18, 'h1', '{"rating": 4.9, "count": 420}', 200, array['In-person'], array['English', 'Hindi'], array['Aetna', 'Blue Cross', 'Medicare'], array['09:00 - 13:00'], array['National Neurological Society Lifetime Fellow'], 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', 'jonathan.reyes@medigi.com', '+1-555-0193', 'approved')
on conflict (id) do update set
status = excluded.status,
email = excluded.email,
phone = excluded.phone;


-- 7. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
    new_health_id text;
    done bool;
begin
    done := false;
    while not done loop
        new_health_id := 'MED-' || floor(random() * (999999 - 100000 + 1) + 100000)::text;
        if not exists (select 1 from public.profiles where health_id = new_health_id) then
            done := true;
        end if;
    end loop;

    insert into public.profiles (
        id,
        health_id,
        name,
        email,
        phone,
        dob,
        gender,
        blood_group,
        height,
        weight,
        bmi,
        emergency_contact,
        settings,
        medical_history,
        lifestyle,
        health_score
    ) values (
        new.id,
        new_health_id,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        coalesce(new.raw_user_meta_data->>'phone', ''),
        case 
            when new.raw_user_meta_data->>'dob' is not null and new.raw_user_meta_data->>'dob' <> '' then (new.raw_user_meta_data->>'dob')::date
            else null
        end,
        coalesce(new.raw_user_meta_data->>'gender', 'Unspecified'),
        coalesce(new.raw_user_meta_data->>'blood_group', 'O+'),
        coalesce((new.raw_user_meta_data->>'height')::numeric, 170),
        coalesce((new.raw_user_meta_data->>'weight')::numeric, 70),
        coalesce((new.raw_user_meta_data->>'bmi')::numeric, 24.2),
        '{"name": "", "relation": "", "phone": ""}'::jsonb,
        '{"language": "English", "organDonor": false, "darkMode": false, "biometricsEnabled": false}'::jsonb,
        '{"allergies": [], "chronicDiseases": [], "surgeries": [], "currentMedicines": []}'::jsonb,
        '{"smoking": "Never", "alcohol": "Never", "exercise": "None", "sleep": "8 hours"}'::jsonb,
        80
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
