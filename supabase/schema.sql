-- Run this in the Supabase SQL Editor

create table products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text
);

create table orders (
  id bigint generated always as identity primary key,
  customer_name text,
  customer_email text,
  customer_address text,
  customer_phone text,
  total numeric,
  created_at timestamp default now()
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id),
  product_id bigint references products(id),
  quantity integer
);

create table reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  reviewer_name text not null,
  comment text not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamp default now()
);

insert into products (name, description, price, image_url)
values
(
  'Wireless Mouse',
  'Simple wireless mouse',
  25.99,
  'https://placehold.co/300x200'
),
(
  'Mechanical Keyboard',
  'RGB mechanical keyboard',
  89.99,
  'https://placehold.co/300x200'
),
(
  'Gaming Headset',
  'Surround sound headset',
  59.99,
  'https://placehold.co/300x200'
);
