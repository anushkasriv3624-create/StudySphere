-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  major TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 5),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  session_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('in_person', 'online')),
  max_capacity INTEGER NOT NULL CHECK (max_capacity >= 2 AND max_capacity <= 20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Sessions are viewable by everyone." 
ON sessions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create sessions." 
ON sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own sessions." 
ON sessions FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own sessions." 
ON sessions FOR DELETE USING (auth.uid() = creator_id);

-- Create session joins table
CREATE TABLE session_joins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable RLS for session joins
ALTER TABLE session_joins ENABLE ROW LEVEL SECURITY;

-- Session join policies
CREATE POLICY "Session joins are viewable by everyone." 
ON session_joins FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join sessions." 
ON session_joins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions." 
ON session_joins FOR DELETE USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar." 
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
