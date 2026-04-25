CREATE POLICY "settlements_delete" ON public.settlements
  FOR DELETE USING (group_id = public.my_group_id());
