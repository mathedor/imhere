-- ============================================================
-- Grants padrão do Supabase (recriados após drop schema cascade)
-- Aplicar SEMPRE depois do schema, RLS e RPCs.
-- ============================================================

-- Schema usage
grant usage on schema public to postgres, anon, authenticated, service_role;

-- Tabelas existentes
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

-- Defaults para tabelas/sequences/funções FUTURAS
alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;

-- Faz o PostgREST recarregar o schema cache
notify pgrst, 'reload schema';
