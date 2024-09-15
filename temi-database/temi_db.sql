CREATE TABLE store (
    id integer PRIMARY KEY,
    name character varying, 
    price numeric, 
    product_image bytea, 
    qr_code_image bytea, 
    detail text, 
    created_at timestamp without time zone,  
    updated_at timestamp without time zone);