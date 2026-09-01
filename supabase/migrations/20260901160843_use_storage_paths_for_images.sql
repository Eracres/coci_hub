alter table public.recipes
rename column image_url
to image_path;

alter table public.recipe_steps
rename column image_url
to image_path;