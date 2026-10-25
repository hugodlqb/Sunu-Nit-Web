-- Store project and project-update text translations separately; retain existing tables/columns.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.project_translations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
 locale text NOT NULL CHECK(locale IN ('es','en','fr')),
 name text NOT NULL, description text, detail_description text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT project_translations_project_locale_key UNIQUE(project_id,locale)
);
CREATE TABLE IF NOT EXISTS public.project_update_translations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 update_id uuid NOT NULL REFERENCES public.project_updates(id) ON DELETE CASCADE,
 locale text NOT NULL CHECK(locale IN ('es','en','fr')),
 title text NOT NULL, description text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT project_update_translations_update_locale_key UNIQUE(update_id,locale)
);
-- Backfill current content in Spanish; do not overwrite any existing translation.
INSERT INTO public.project_translations(project_id,locale,name,description,detail_description)
SELECT id,'es',name,description,detail_description FROM public.projects
WHERE NULLIF(BTRIM(name),'') IS NOT NULL
ON CONFLICT(project_id,locale) DO NOTHING;
INSERT INTO public.project_update_translations(update_id,locale,title,description)
SELECT id,'es',title,description FROM public.project_updates
WHERE NULLIF(BTRIM(title),'') IS NOT NULL
ON CONFLICT(update_id,locale) DO NOTHING;
CREATE OR REPLACE FUNCTION public.can_manage_content_translations()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (
  SELECT 1 FROM public.persons p
  JOIN public.person_roles pr ON pr.person_id=p.id
  JOIN public.roles r ON r.id=pr.role_id
  WHERE p.auth_user_id=auth.uid() AND r.key IN ('admin','editor')
 );
$$;
REVOKE ALL ON FUNCTION public.can_manage_content_translations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_content_translations() TO authenticated;
ALTER TABLE public.project_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_update_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS project_translations_public_read ON public.project_translations;
CREATE POLICY project_translations_public_read ON public.project_translations FOR SELECT TO anon,authenticated USING(true);
DROP POLICY IF EXISTS project_translations_editor_write ON public.project_translations;
CREATE POLICY project_translations_editor_write ON public.project_translations FOR ALL TO authenticated
 USING(public.can_manage_content_translations()) WITH CHECK(public.can_manage_content_translations());
DROP POLICY IF EXISTS project_update_translations_public_read ON public.project_update_translations;
CREATE POLICY project_update_translations_public_read ON public.project_update_translations FOR SELECT TO anon,authenticated USING(true);
DROP POLICY IF EXISTS project_update_translations_editor_write ON public.project_update_translations;
CREATE POLICY project_update_translations_editor_write ON public.project_update_translations FOR ALL TO authenticated
 USING(public.can_manage_content_translations()) WITH CHECK(public.can_manage_content_translations());
GRANT SELECT ON public.project_translations,public.project_update_translations TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.project_translations,public.project_update_translations TO authenticated;
COMMIT;
