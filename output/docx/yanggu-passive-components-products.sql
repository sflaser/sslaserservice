-- Generated from 3-光无源器件产品手册.docx for Aurora Photonics / Wuhan Yanggu Technology Co., Ltd.
-- Source Word cover/internal-use labels were intentionally omitted from public product content.

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
  '(1+1)x1 / (2+1)x1 Pump + Signal Combiner',
  '1-plus-1-2-plus-1-pump-signal-combiner',
  'High-power multimode pump and signal combiner for 900-1000 nm pump paths, 1060/1550 nm signal transmission, and up to 2 x 30 W output.',
  $$
Aurora Photonics (Wuhan Yanggu Technology Co., Ltd.) supplies (1+1)x1 and (2+1)x1 high-power multimode pump + signal combiners made with fused taper processing. The device combines high-power multimode fiber-coupled pump laser output while allowing the central signal fiber to transmit with low loss.

Key features:
- High power conversion efficiency
- Preserves mode content during high-power combining
- Wavelength insensitive design
- Custom configurations available on request

Typical applications:
- Pump + signal combining
- All-fiber high-power fiber amplifiers
- Research and laboratory optical systems

Main technical highlights:
- Product type: (1+1)x1 / (2+1)x1
- Pump wavelength: 900-1000 nm
- Signal wavelength: 1060 or 1550 nm
- Pump fiber: 105/125 um, 0.15 or 0.22 NA
- Signal input/output fiber: 10/125 DCF or 20/130 DCF
- Maximum output power: 2 x 30 W
- Signal insertion loss: <0.50 dB
- Coupling efficiency: 93% typical, 90% minimum
- Package size: 70 x 12 x 8 mm
- Operating temperature: -5 to +65 C
- Storage temperature: -40 to +85 C
$$,
  '/images/products/passive-components/pump-signal-combiner.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  'PM (1+1)x1 / PM (2+1)x1 Pump + Signal Combiner',
  'pm-1-plus-1-2-plus-1-pump-signal-combiner',
  'Polarization-maintaining pump + signal combiner with high conversion efficiency, 900-1000 nm pump wavelength, and 18 dB extinction ratio.',
  $$
Aurora Photonics PM (1+1)x1 and PM (2+1)x1 pump + signal combiners support high-power multimode pump combining while maintaining low-loss signal transmission for polarization-sensitive fiber systems.

Key features:
- High power conversion efficiency
- Preserves mode content
- Wavelength insensitive design
- High polarization extinction ratio
- Custom configurations available on request

Typical applications:
- Pump + signal combining
- All-fiber high-power fiber amplifiers
- High-power PM fiber amplifiers
- Coherent combining research
- Research and laboratory optical systems

Main technical highlights:
- Product type: (1+1)x1 / (2+1)x1
- Pump wavelength: 900-1000 nm
- Signal wavelength: 1060 or 1550 nm
- Pump fiber: 105/125 um, 0.15 or 0.22 NA
- Signal input fiber: PM10/125 DCF or 20/130 DCF
- Signal output fiber: 10/125 DCF or 20/130 DCF
- Maximum output power: 2 x 30 W
- Signal insertion loss: <0.50 dB
- Coupling efficiency: 93% typical, 90% minimum
- Polarization extinction ratio: 18 dB
- Package size: 70 x 12 x 8 mm
- Operating temperature: -5 to +65 C
- Storage temperature: -40 to +85 C
$$,
  '/images/products/passive-components/pm-pump-signal-combiner.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '(6+1)x1 Pump + Signal Combiner',
  '6-plus-1-pump-signal-combiner',
  'High-power (6+1)x1 pump + signal combiner for 900-1000 nm pump combining, 1064 nm signal paths, and up to 6 x 50 W output.',
  $$
Aurora Photonics (6+1)x1 high-power multimode pump + signal combiners are designed for multi-pump fiber systems where high conversion efficiency and pump brightness preservation matter.

Key features:
- High power conversion efficiency
- Preserves mode content during high-power combining
- Wavelength insensitive design
- Custom configurations available on request

Typical applications:
- Pump + signal combining
- All-fiber high-power fiber amplifiers
- Research and laboratory optical systems

Main technical highlights:
- Product type: (6+1)x1
- Pump wavelength: 900-1000 nm
- Signal wavelength: 1064 nm
- Pump fiber: Nufern 105/125 um, 0.15 NA or 0.22 NA
- Signal input fiber: Hi 1060 or 20/130 DC, NA 0.08/0.46
- Signal output fiber: 20/130 DC, NA 0.08/0.46
- Maximum output power: 6 x 50 W
- Signal insertion loss: <0.80 dB
- Coupling efficiency: 95% typical, 93% minimum
- Package size: 70 x 12 x 8 mm
- Operating temperature: -5 to +65 C
- Storage temperature: -40 to +85 C
$$,
  '/images/products/passive-components/pump-signal-combiner.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  'N x 1 Multimode Pump Combiner',
  'n-by-1-multimode-pump-combiner',
  'Multimode pump combiner family for high-power pump combining, including 7x1 configurations with 900-1000 nm pump wavelength.',
  $$
Aurora Photonics N x 1 multimode pump combiners use fused taper processing to combine multiple multimode laser-diode pump outputs and deliver the combined high power through a single output fiber.

Key features:
- High power conversion efficiency
- Wavelength insensitive design
- Custom configurations available on request
- RoHS-compliant options

Typical applications:
- High-power pump combining
- All-fiber high-power fiber lasers
- Research and laboratory optical systems

Main technical highlights:
- Product type: 7x1
- Pump wavelength: 900-1000 nm
- Pump fiber: Nufern 105/125 um, 0.15 NA or 0.22 NA
- Output fiber: 25/250 DC or 20/400, NA 0.06/0.46
- Maximum output power: 7 x 50 W / 7 x 100 W
- Signal insertion loss: <0.80 dB
- Coupling efficiency: 95% typical, 93% minimum
- Package size: 70 x 12 x 8 mm
- Operating temperature: -5 to +65 C
- Storage temperature: -40 to +85 C
$$,
  '/images/products/passive-components/pump-signal-combiner.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1x2 / 2x2 Standard Fiber Coupler',
  '1x2-2x2-standard-fiber-coupler',
  'Fused 1x2 / 2x2 standard fiber coupler with compact packaging, low insertion loss, and high reliability for optical modules and sensing systems.',
  $$
Aurora Photonics fused 1x2 / 2x2 standard fiber couplers provide compact packaging, low insertion loss, and high reliability for optical modules, fiber sensors, and fiber test instruments.

Key features:
- Compact fused taper package
- Low excess loss and low insertion loss
- High directivity
- Multiple coupling ratios available
- Custom pigtail and package options

Typical applications:
- Optical modules
- Fiber sensors
- Fiber test instruments
- General optical signal splitting and combining

Main technical highlights:
- Operating wavelengths: 780/830 nm, 980/1064 nm, 1310/1480/1550/200 nm families
- Operating bandwidth: +/-20 nm
- Coupling ratios: 50/50, 20/80, 10/90, 5/95, 1/99
- Excess loss: as low as <=0.3 dB depending on wavelength and grade
- Directivity: >=55 dB
- Maximum handling power: 2 W
- Operating temperature: -40 to +85 C
- Storage temperature: -50 to +85 C
- Fiber length: 1 m or custom
- Fiber type: standard fiber
- Pigtail options: 250 um bare fiber, 900 um loose tube, 2 mm / 3 mm loose tube
- Package options: 3.0 x 54 mm or 90 x 14 x 8.5 mm
$$,
  '/images/products/passive-components/standard-fiber-coupler.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1x2 / 2x2 PM Fiber Coupler',
  '1x2-2x2-pm-fiber-coupler',
  'Polarization-maintaining 1x2 / 2x2 fused fiber coupler with high ER, compact packaging, and low insertion loss.',
  $$
Aurora Photonics PM 1x2 / 2x2 fused fiber couplers are designed for polarization-maintaining optical paths that need compact packaging, low insertion loss, high extinction ratio, and reliable long-term operation.

Key features:
- Polarization-maintaining fused taper structure
- Low excess loss and low insertion loss
- High extinction ratio
- High directivity
- Custom pigtail and package options

Typical applications:
- PM optical modules
- Fiber sensors
- Fiber test instruments
- Polarization-sensitive optical systems

Main technical highlights:
- Operating wavelengths: 780/830 nm, 980/1064 nm, 1310/1480/1550/200 nm families
- Operating bandwidth: +/-20 nm
- Coupling ratios: 50/50, 20/80, 10/90, 5/95, 1/99
- Extinction ratio: >=20 dB for P grade, >=18 dB for A grade
- Excess loss: as low as <=0.3 dB depending on wavelength and grade
- Directivity: >=55 dB
- Maximum handling power: 2 W
- Operating temperature: -40 to +85 C
- Storage temperature: -50 to +85 C
- Fiber length: 1 m or custom
- Fiber type: panda fiber
- Pigtail options: 250 um bare fiber, 900 um loose tube, 2 mm / 3 mm loose tube
- Package options: 3.0 x 54 mm or 90 x 14 x 8.5 mm
$$,
  '/images/products/passive-components/multiport-fiber-coupler.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1x3 / 3x3 Fiber Coupler',
  '1x3-3x3-fiber-coupler',
  'Fused 1x3 / 3x3 fiber coupler family for 1310 nm or 1550 nm systems, with SSC, WBC, and DWC options.',
  $$
Aurora Photonics 1x3 / 3x3 fused fiber couplers provide compact, reliable signal distribution for optical modules, fiber sensors, and fiber test instruments.

Key features:
- Fused taper construction
- Compact package options
- Low insertion loss and high reliability
- SSC, WBC, and DWC configurations
- Custom pigtail and package options

Typical applications:
- Optical modules
- Fiber sensors
- Fiber test instruments
- Multi-port optical distribution

Main technical highlights:
- Configurations: 1x3 SSC, 3x3 SSC, 1x3 WBC, 3x3 WBC, 1x3 DWC
- Operating wavelength: 1310 or 1550 nm
- Operating bandwidth: +/-15 nm for SSC, +/-40 nm for WBC/DWC options
- Grades: P and A
- Excess loss: 0.1 dB typical for P grade, 0.15 dB typical for A grade
- PDL: <=0.2 to <=0.3 dB depending on configuration and grade
- Directivity: >=55 dB
- Fiber type: SMF-28E
- Operating temperature: -40 to +85 C
- Fiber length: 1 m or custom
- Pigtail options: 250 um bare fiber, 900 um loose tube, 2 mm / 3 mm loose tube
- Package options: 3.0 x 54 mm or 90 x 14 x 8.5 mm
$$,
  '/images/products/passive-components/multiport-fiber-coupler.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1x4 Fiber Coupler',
  '1x4-fiber-coupler',
  'Fused 1x4 fiber coupler family for 1310 nm, 1490 nm, and 1550 nm optical paths with SSC, WBC, DWC, and TWC options.',
  $$
Aurora Photonics 1x4 fused fiber couplers provide compact, reliable multi-way optical splitting for modules, sensing systems, and fiber test equipment.

Key features:
- Fused taper construction
- Compact package options
- Low insertion loss and high reliability
- SSC, WBC, DWC, and TWC configurations
- Custom pigtail and package options

Typical applications:
- Optical modules
- Fiber sensors
- Fiber test instruments
- Multi-channel optical signal distribution

Main technical highlights:
- Configurations: 1x4 SSC, 1x4 WBC, 1x4 DWC, 1x4 TWC
- Operating wavelength: 1310 or 1550 nm; TWC supports 1310, 1490, and 1550 nm paths
- Operating bandwidth: +/-15 nm, +/-40 nm, or 1310+/-40 / 1490+/-10 / 1550+/-40 depending on configuration
- Grades: P and A
- Excess loss: 0.1 dB typical for P grade, 0.15 dB typical for A grade
- PDL: <=0.25 to <=0.45 dB depending on configuration and grade
- Directivity: >=55 dB
- Fiber type: SMF-28E
- Operating temperature: -40 to +85 C
$$,
  '/images/products/passive-components/multiport-fiber-coupler.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1x2 / 2x2 Fused WDM Coupler',
  '1x2-2x2-fused-wdm-coupler',
  'Compact fused WDM coupler family with low loss, high isolation, low PDL, and 980/1550, 980/1590, or 1310/1550 nm options.',
  $$
Aurora Photonics 1x2 / 2x2 fused WDM couplers are compact micro-optical passive devices with low loss, stable long-term performance, and multiple connector and package options.

Key features:
- Low insertion loss
- High environmental stability
- High wavelength isolation
- Low polarization sensitivity
- High return loss
- All-fiber structure

Typical applications:
- EDFA systems
- Other fiber amplifiers
- Fiber lasers
- Optical research systems

Main technical highlights:
- Types: 980/1550 WDM, 980/1590 WDM, 1310/1550 WDM
- Operating wavelengths: 980 and 1550 nm, 980 and 1590 nm, or 1310 and 1550 nm
- Operating bandwidth: +/-10/20 nm or +/-15 nm depending on type
- Package size: Phi 2.4/3.0 x 30 mm, Phi 2.4 x 25 mm, or Phi 2.4 x 30 mm depending on type
- Grades: P and A
- Insertion loss: <=0.25 dB for P grade, <=0.35 dB for A grade
- Isolation: >=20/18 dB for 980 nm WDM types, >=17/16 dB for 1310/1550 WDM
- PDL: <=0.08 dB for P grade, <=0.12 dB for A grade
- Directivity: >=55 dB
- Operating temperature: -40 to +85 C
- Structure: 1x2 or 2x2
$$,
  '/images/products/passive-components/fused-wdm-coupler.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '1W In-line Optical Isolator',
  '1w-inline-optical-isolator',
  'Compact 1 W in-line optical isolator for 1064 nm or 1550 nm systems, with 28 dB maximum isolation and PM panda fiber.',
  $$
Aurora Photonics 1 W in-line optical isolators provide compact passive isolation for fiber laser, amplifier, optical communication, and optical test systems.

Key features:
- High isolation
- Low insertion loss
- Compact structure
- High return loss
- Passive device
- High environmental stability

Typical applications:
- Fiber lasers
- High-performance laser systems
- Optical amplifiers
- Optical communication research
- Optical test instruments

Main technical highlights:
- Center wavelength: 1064 or 1550 nm
- Maximum isolation: 28 dB
- Insertion loss at 1 W operation: 2.5 dB
- Minimum return loss input/output: 50/50 dB
- Extinction ratio: 20 dB
- Average power: 1 W
- Peak power handling: 10 kW
- Maximum tensile load: 5 N
- Input fiber: PM 980 panda fiber
- Output fiber: PM 980 panda fiber
- Operating temperature: 10 to +50 C
- Storage temperature: 0 to +60 C
$$,
  '/images/products/passive-components/1w-inline-isolator.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

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
  '20W Optical Isolator',
  '20w-optical-isolator',
  '20 W optical isolator for 1064 nm systems with <0.5 dB insertion loss, 28 dB maximum isolation, and free-space output.',
  $$
Aurora Photonics 20 W optical isolators are designed for higher-power 1064 nm fiber laser and high-performance laser systems that need compact passive isolation and low insertion loss.

Key features:
- High isolation
- Low insertion loss
- Compact structure
- High return loss
- Passive device
- High environmental stability

Typical applications:
- Fiber lasers
- High-performance laser systems
- High-power optical paths requiring isolation

Main technical highlights:
- Center wavelength: 1064 nm
- Maximum isolation: 28 dB
- Insertion loss: <0.5 dB
- Minimum return loss: 50 dB
- Average power: 20 W
- Peak power handling: 10 kW
- Maximum tensile load: 5 N
- Input fiber: Nufern LMA-GDF-20/130-M, NA 0.08/0.46
- Output: free space
- Output beam diameter: 7 +/- 1 mm at 1/e^2
- Operating temperature: 10 to +50 C
- Storage temperature: 0 to +60 C
$$,
  '/images/products/passive-components/20w-inline-isolator.png',
  null,
  0,
  'USD',
  '',
  'published',
  now()
) on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  image_url = excluded.image_url,
  brochure_url = excluded.brochure_url,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  purchase_url = excluded.purchase_url,
  status = excluded.status,
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();
