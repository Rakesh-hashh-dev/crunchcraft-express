DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));