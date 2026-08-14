
CREATE EXTENSION IF NOT EXISTS vector;

-- ===== enums =====
CREATE TYPE public.app_role AS ENUM ('user','caregiver','admin');
CREATE TYPE public.memory_type AS ENUM ('person','place','event','object','conversation','information','family','personal');
CREATE TYPE public.importance_level AS ENUM ('low','medium','high','critical');
CREATE TYPE public.caregiver_status AS ENUM ('pending','accepted','revoked');
CREATE TYPE public.caregiver_permission AS ENUM ('VIEW_MEMORIES','ADD_MEMORIES','EDIT_MEMORIES','DELETE_MEMORIES','MANAGE_PEOPLE','VIEW_ACTIVITY');

-- ===== shared trigger fn =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  accessibility_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ===== caregivers =====
CREATE TABLE public.caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_email TEXT NOT NULL,
  caregiver_name TEXT,
  status public.caregiver_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caregivers TO authenticated;
GRANT ALL ON public.caregivers TO service_role;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER caregivers_updated_at BEFORE UPDATE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.caregiver_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_link_id UUID NOT NULL REFERENCES public.caregivers(id) ON DELETE CASCADE,
  permission public.caregiver_permission NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (caregiver_link_id, permission)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caregiver_permissions TO authenticated;
GRANT ALL ON public.caregiver_permissions TO service_role;
ALTER TABLE public.caregiver_permissions ENABLE ROW LEVEL SECURITY;

-- security definer helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_caregiver_of(_patient_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.caregivers c
    WHERE c.patient_id = _patient_id AND c.caregiver_id = auth.uid() AND c.status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.caregiver_can(_patient_id UUID, _permission public.caregiver_permission)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.caregivers c
    JOIN public.caregiver_permissions p ON p.caregiver_link_id = c.id
    WHERE c.patient_id = _patient_id
      AND c.caregiver_id = auth.uid()
      AND c.status = 'accepted'
      AND p.permission = _permission
      AND p.enabled = true
  );
$$;

CREATE POLICY "patients manage their caregiver links" ON public.caregivers FOR ALL TO authenticated
  USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "caregivers read their links" ON public.caregivers FOR SELECT TO authenticated
  USING (caregiver_id = auth.uid());
CREATE POLICY "caregivers accept their links" ON public.caregivers FOR UPDATE TO authenticated
  USING (caregiver_id = auth.uid()) WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "patients manage caregiver permissions" ON public.caregiver_permissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.caregivers c WHERE c.id = caregiver_link_id AND c.patient_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.caregivers c WHERE c.id = caregiver_link_id AND c.patient_id = auth.uid()));
CREATE POLICY "caregivers read their permissions" ON public.caregiver_permissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.caregivers c WHERE c.id = caregiver_link_id AND c.caregiver_id = auth.uid()));

-- profiles policies (needs caregiver helper)
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "caregivers view patient profile" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_caregiver_of(id));

-- ===== people =====
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  description TEXT,
  important_info TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  last_interaction DATE,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "owners manage people" ON public.people FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "caregivers view people" ON public.people FOR SELECT TO authenticated
  USING (public.caregiver_can(owner_id, 'VIEW_MEMORIES') OR public.caregiver_can(owner_id, 'MANAGE_PEOPLE'));
CREATE POLICY "caregivers add people" ON public.people FOR INSERT TO authenticated
  WITH CHECK (public.caregiver_can(owner_id, 'MANAGE_PEOPLE'));
CREATE POLICY "caregivers edit people" ON public.people FOR UPDATE TO authenticated
  USING (public.caregiver_can(owner_id, 'MANAGE_PEOPLE')) WITH CHECK (public.caregiver_can(owner_id, 'MANAGE_PEOPLE'));
CREATE POLICY "caregivers delete people" ON public.people FOR DELETE TO authenticated
  USING (public.caregiver_can(owner_id, 'MANAGE_PEOPLE'));

-- ===== places =====
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  image_url TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "owners manage places" ON public.places FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "caregivers view places" ON public.places FOR SELECT TO authenticated
  USING (public.caregiver_can(owner_id, 'VIEW_MEMORIES'));
CREATE POLICY "caregivers add places" ON public.places FOR INSERT TO authenticated
  WITH CHECK (public.caregiver_can(owner_id, 'ADD_MEMORIES'));
CREATE POLICY "caregivers edit places" ON public.places FOR UPDATE TO authenticated
  USING (public.caregiver_can(owner_id, 'EDIT_MEMORIES')) WITH CHECK (public.caregiver_can(owner_id, 'EDIT_MEMORIES'));
CREATE POLICY "caregivers delete places" ON public.places FOR DELETE TO authenticated
  USING (public.caregiver_can(owner_id, 'DELETE_MEMORIES'));

-- ===== objects =====
CREATE TABLE public.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  usual_location TEXT,
  image_url TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.objects TO authenticated;
GRANT ALL ON public.objects TO service_role;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER objects_updated_at BEFORE UPDATE ON public.objects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "owners manage objects" ON public.objects FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "caregivers view objects" ON public.objects FOR SELECT TO authenticated
  USING (public.caregiver_can(owner_id, 'VIEW_MEMORIES'));
CREATE POLICY "caregivers add objects" ON public.objects FOR INSERT TO authenticated
  WITH CHECK (public.caregiver_can(owner_id, 'ADD_MEMORIES'));
CREATE POLICY "caregivers edit objects" ON public.objects FOR UPDATE TO authenticated
  USING (public.caregiver_can(owner_id, 'EDIT_MEMORIES')) WITH CHECK (public.caregiver_can(owner_id, 'EDIT_MEMORIES'));
CREATE POLICY "caregivers delete objects" ON public.objects FOR DELETE TO authenticated
  USING (public.caregiver_can(owner_id, 'DELETE_MEMORIES'));

-- ===== memories =====
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  memory_type public.memory_type NOT NULL DEFAULT 'event',
  image_url TEXT,
  event_date DATE,
  location TEXT,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  importance public.importance_level NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER memories_updated_at BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX memories_owner_created_idx ON public.memories (owner_id, created_at DESC);
CREATE POLICY "owners manage memories" ON public.memories FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "caregivers view memories" ON public.memories FOR SELECT TO authenticated
  USING (public.caregiver_can(owner_id, 'VIEW_MEMORIES'));
CREATE POLICY "caregivers add memories" ON public.memories FOR INSERT TO authenticated
  WITH CHECK (public.caregiver_can(owner_id, 'ADD_MEMORIES'));
CREATE POLICY "caregivers edit memories" ON public.memories FOR UPDATE TO authenticated
  USING (public.caregiver_can(owner_id, 'EDIT_MEMORIES')) WITH CHECK (public.caregiver_can(owner_id, 'EDIT_MEMORIES'));
CREATE POLICY "caregivers delete memories" ON public.memories FOR DELETE TO authenticated
  USING (public.caregiver_can(owner_id, 'DELETE_MEMORIES'));

CREATE TABLE public.memory_people (
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, person_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_people TO authenticated;
GRANT ALL ON public.memory_people TO service_role;
ALTER TABLE public.memory_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory links follow memory access" ON public.memory_people FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.memories m WHERE m.id = memory_id));

-- ===== conversations =====
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "owners manage conversations" ON public.conversations FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "caregivers view conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.caregiver_can(owner_id, 'VIEW_ACTIVITY'));

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
CREATE POLICY "messages follow conversation access" ON public.messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.owner_id = auth.uid()));

-- ===== notifications =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() OR public.is_caregiver_of(user_id));

-- ===== embeddings =====
CREATE TABLE public.memory_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (memory_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_embeddings TO authenticated;
GRANT ALL ON public.memory_embeddings TO service_role;
ALTER TABLE public.memory_embeddings ENABLE ROW LEVEL SECURITY;
CREATE INDEX memory_embeddings_vector_idx ON public.memory_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE POLICY "owners manage embeddings" ON public.memory_embeddings FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.match_memories(_owner_id UUID, query_embedding vector(1536), match_count INT DEFAULT 6)
RETURNS TABLE (memory_id UUID, content TEXT, similarity FLOAT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.memory_id, e.content, 1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.memory_embeddings e
  WHERE e.owner_id = _owner_id
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ===== signup trigger =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== demo data helper =====
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  rahul UUID; anita UUID; rajesh UUID;
  m1 UUID; m2 UUID; m3 UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.people WHERE owner_id = uid AND is_demo) THEN RETURN; END IF;

  INSERT INTO public.people (owner_id, name, relationship, description, important_info, tags, last_interaction, is_demo)
  VALUES (uid,'Rahul Sharma','Son','Works in software engineering and lives nearby.','Calls every Sunday evening.',ARRAY['family','son'], CURRENT_DATE - 3, true) RETURNING id INTO rahul;
  INSERT INTO public.people (owner_id, name, relationship, description, important_info, tags, last_interaction, is_demo)
  VALUES (uid,'Anita Sharma','Daughter','Teaches at a school in the city.','Brings groceries on Saturdays.',ARRAY['family','daughter'], CURRENT_DATE - 8, true) RETURNING id INTO anita;
  INSERT INTO public.people (owner_id, name, relationship, description, important_info, tags, last_interaction, is_demo)
  VALUES (uid,'Rajesh Kumar','Friend','Old friend from the neighbourhood walking group.','Meets at the park most mornings.',ARRAY['friend'], CURRENT_DATE - 1, true) RETURNING id INTO rajesh;

  INSERT INTO public.places (owner_id, name, description, address, is_demo) VALUES
    (uid,'Home','Where you live, with the blue door.','12 Ashok Lane', true),
    (uid,'Park','Morning walking route with the pond.','Green Valley Park', true),
    (uid,'Hospital','Where your regular check-ups happen.','City Care Hospital', true),
    (uid,'Temple','Visited on festival days.','Old Town Temple', true);

  INSERT INTO public.objects (owner_id, name, description, usual_location, is_demo) VALUES
    (uid,'House Keys','Brass keys on a red keyring.','Bowl near the front door', true),
    (uid,'Wallet','Brown leather wallet.','Top drawer of the side table', true),
    (uid,'Medicine Box','Weekly pill organiser.','Kitchen shelf', true),
    (uid,'Glasses','Reading glasses with thin frames.','Bedside table', true);

  INSERT INTO public.memories (owner_id, created_by, title, description, memory_type, event_date, location, importance, tags, is_demo)
  VALUES (uid, uid,'Family Dinner','Everyone came home for dinner. Rahul cooked and Anita brought sweets.','family', CURRENT_DATE - 4,'Home','high',ARRAY['family','dinner','home'], true) RETURNING id INTO m1;
  INSERT INTO public.memories (owner_id, created_by, title, description, memory_type, event_date, location, importance, tags, is_demo)
  VALUES (uid, uid,'Birthday Celebration','Anita''s birthday with cake in the garden.','event', CURRENT_DATE - 40,'Home','medium',ARRAY['birthday','family'], true) RETURNING id INTO m2;
  INSERT INTO public.memories (owner_id, created_by, title, description, memory_type, event_date, location, importance, tags, is_demo)
  VALUES (uid, uid,'College Graduation','Rahul graduated in software engineering.','person', CURRENT_DATE - 900,'City College','high',ARRAY['rahul','milestone'], true) RETURNING id INTO m3;
  INSERT INTO public.memories (owner_id, created_by, title, description, memory_type, event_date, location, importance, tags, is_demo) VALUES
    (uid, uid,'Morning Walk','Walked around the pond with Rajesh.','personal', CURRENT_DATE - 1,'Park','low',ARRAY['walk','friend'], true),
    (uid, uid,'Doctor Appointment','Routine check-up. Next visit in three months.','information', CURRENT_DATE - 12,'Hospital','critical',ARRAY['health','appointment'], true);

  INSERT INTO public.memory_people (memory_id, person_id) VALUES
    (m1, rahul), (m1, anita), (m2, anita), (m3, rahul)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.notifications (user_id, title, message, type) VALUES
    (uid,'Welcome to Smriti AI','Your memory library is ready with a few example memories.','info');
END; $$;

REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
