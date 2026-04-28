update public.products
set
  brochure_url = '/assets/brochures/pulse-waveform-editable-nanosecond-fiber-laser-en.pdf',
  updated_at = now()
where slug = 'pulse-shape-editable-nanosecond-fiber-laser';
