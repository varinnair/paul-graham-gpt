-- RUN 1st
create extension vector;

-- RUN 2nd
create table paul_graham (
  id bigserial primary key,
  essay_title text,
  essay_url text,
  essay_date text,
  content text,
  content_tokens bigint,
  embedding vector (1536)
);

-- RUN 3rd after running the scripts
create or replace function paul_graham_search (
  query_embedding vector (1536),
  similarity_threshold float,
  match_count int
)
returns table(
  id bigint,
  essay_title text,
  essay_url text,
  essay_date text,
  content text,
  content_tokens bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    paul_graham.id,
    paul_graham.essay_title,
    paul_graham.essay_url,
    paul_graham.essay_date,
    paul_graham.content,
    paul_graham.content_tokens,
    1 - (paul_graham.embedding <=> query_embedding) as 
similarity
from paul_graham 
where 1 - (paul_graham.embedding <=> query_embedding) > 
similarity_threshold
order by paul_graham.embedding <=> query_embedding
limit match_count;
end;
$$;

-- RUN 4th
create index on paul_graham
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);