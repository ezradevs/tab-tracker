-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'mum')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- FAMILY GROUPS
-- ─────────────────────────────────────────
CREATE TABLE public.family_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL DEFAULT 'Family',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.family_members (
  group_id  UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- ─────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TYPE public.category_type AS ENUM (
  'groceries', 'transport', 'bills', 'dining', 'household', 'other'
);

CREATE TABLE public.transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  payer_id         UUID NOT NULL REFERENCES public.profiles(id),
  description      TEXT NOT NULL,
  amount           NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category         public.category_type NOT NULL DEFAULT 'other',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  is_settled       BOOLEAN NOT NULL DEFAULT FALSE,
  settlement_id    UUID,
  created_by       UUID NOT NULL REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- SETTLEMENTS
-- ─────────────────────────────────────────
CREATE TABLE public.settlements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  payer_id    UUID NOT NULL REFERENCES public.profiles(id),
  payee_id    UUID NOT NULL REFERENCES public.profiles(id),
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  notes       TEXT,
  settled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID NOT NULL REFERENCES public.profiles(id)
);

ALTER TABLE public.transactions
  ADD CONSTRAINT fk_settlement
  FOREIGN KEY (settlement_id) REFERENCES public.settlements(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────
CREATE TABLE public.invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  group_id   UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'mum')) DEFAULT 'mum',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  used_by    UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_transactions_group_id   ON public.transactions(group_id);
CREATE INDEX idx_transactions_payer_id   ON public.transactions(payer_id);
CREATE INDEX idx_transactions_is_settled ON public.transactions(is_settled);
CREATE INDEX idx_transactions_date       ON public.transactions(transaction_date DESC);
CREATE INDEX idx_settlements_group_id    ON public.settlements(group_id);
CREATE INDEX idx_family_members_user_id  ON public.family_members(user_id);
CREATE INDEX idx_invitations_token       ON public.invitations(token);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations    ENABLE ROW LEVEL SECURITY;

-- Helper: get the user's group_id
CREATE OR REPLACE FUNCTION public.my_group_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT group_id FROM public.family_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    id IN (SELECT user_id FROM public.family_members WHERE group_id = public.my_group_id())
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Family groups
CREATE POLICY "family_groups_select" ON public.family_groups
  FOR SELECT USING (id = public.my_group_id());

CREATE POLICY "family_groups_insert" ON public.family_groups
  FOR INSERT WITH CHECK (true);

-- Family members
CREATE POLICY "family_members_select" ON public.family_members
  FOR SELECT USING (group_id = public.my_group_id() OR user_id = auth.uid());

CREATE POLICY "family_members_insert" ON public.family_members
  FOR INSERT WITH CHECK (true);

-- Transactions
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT USING (group_id = public.my_group_id());

CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT WITH CHECK (group_id = public.my_group_id() AND created_by = auth.uid());

CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE USING (group_id = public.my_group_id());

CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE USING (created_by = auth.uid());

-- Settlements
CREATE POLICY "settlements_select" ON public.settlements
  FOR SELECT USING (group_id = public.my_group_id());

CREATE POLICY "settlements_insert" ON public.settlements
  FOR INSERT WITH CHECK (group_id = public.my_group_id() AND created_by = auth.uid());

-- Invitations
CREATE POLICY "invitations_select" ON public.invitations
  FOR SELECT USING (
    created_by = auth.uid() OR
    group_id = public.my_group_id() OR
    used_by = auth.uid()
  );

CREATE POLICY "invitations_insert" ON public.invitations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "invitations_update" ON public.invitations
  FOR UPDATE USING (true);

-- ─────────────────────────────────────────
-- BALANCE VIEW
-- positive = mum owes owner; negative = owner owes mum
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.group_balance AS
SELECT
  t.group_id,
  p_owner.id  AS owner_id,
  p_mum.id    AS mum_id,
  COALESCE(SUM(
    CASE
      WHEN t.payer_id = p_owner.id AND NOT t.is_settled THEN  t.amount
      WHEN t.payer_id = p_mum.id   AND NOT t.is_settled THEN -t.amount
      ELSE 0
    END
  ), 0) AS balance
FROM public.transactions t
JOIN public.family_members fm_o ON fm_o.group_id = t.group_id
JOIN public.profiles p_owner    ON p_owner.id = fm_o.user_id AND p_owner.role = 'owner'
JOIN public.family_members fm_m ON fm_m.group_id = t.group_id
JOIN public.profiles p_mum      ON p_mum.id = fm_m.user_id AND p_mum.role = 'mum'
GROUP BY t.group_id, p_owner.id, p_mum.id;
