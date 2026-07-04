
CREATE TABLE public.order_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_events_order_id ON public.order_events(order_id, created_at);

GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order owners can view their events"
ON public.order_events FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND o.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can insert events"
ON public.order_events FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events;
ALTER TABLE public.order_events REPLICA IDENTITY FULL;

-- Seed an initial "pending" event for each existing order that has none
INSERT INTO public.order_events (order_id, status, note, created_at)
SELECT o.id, o.status, 'Order placed', o.created_at
FROM public.orders o
WHERE NOT EXISTS (SELECT 1 FROM public.order_events e WHERE e.order_id = o.id);
