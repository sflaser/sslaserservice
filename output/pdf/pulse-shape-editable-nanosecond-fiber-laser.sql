insert into public.products (
  name,
  slug,
  short_description,
  description,
  image_url,
  brochure_url,
  price_cents,
  currency,
  purchase_url,
  status,
  published_at
) values (
  'Pulse-Shape Editable Nanosecond Fiber Laser',
  'pulse-shape-editable-nanosecond-fiber-laser',
  'FPGA-based nanosecond fiber laser with user-defined pulse shaping, 20-500 ns pulse width, and up to 50 MHz repetition.',
  $$
This product is a pulse-shape editable nanosecond fiber laser built around an FPGA high-speed signal processing platform and programmable pulse control. It is designed for applications that need precise temporal shaping, stable wavelength control, and flexible trigger behavior.

Key capabilities:
- User-defined waveform output
- Pulse width adjustable from 20 to 500 ns
- Repetition rate from 5 kHz to 50 MHz
- Internal trigger and external trigger operating modes
- External trigger timing jitter <= 0.5 ns
- TEC temperature control for seed wavelength tuning
- Fiber-coupled output with PM fiber and FC/APC connector
- 24V DC input and RS232 communication

Typical waveform options:
- Gaussian
- Lorentzian
- Front-rise
- Rear-fall
- Double-M
- Voigt

Main technical highlights:
- Center wavelength: 1064.3 +/- 0.1 nm
- Tuning range: >= 0.6 nm through temperature control
- Average power: >100 mW @ 8 kHz, 150 ns
- Spectral width: <= 0.3 nm
- Polarization: linear polarization
- Power stability: RMS <= 1% @ 1 hr
- Beam quality: TEM00, M2 < 1.1
- Operating voltage: DC 24V
- Protection functions: pulse width, repetition rate, temperature, and current limits
- Operating temperature: 15-50 C
- Operating humidity: 10-80%
- Modular size: 16.3 x 21.4 x 3.25 cm
- Weight: <= 2 kg

Ideal for:
- Precision laser processing
- Research and laboratory systems
- Waveform-sensitive laser experiments
- Custom optical and photonics integration
$$,
  '/images/products/pulse-shape-editable-nanosecond-fiber-laser/cover.png',
  '/assets/brochures/pulse-waveform-editable-nanosecond-fiber-laser-en.pdf',
  0,
  'USD',
  'https://www.sslaserservice.com/#contact',
  'published',
  now()
) on conflict (slug) do update set
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();
