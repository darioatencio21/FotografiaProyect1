/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Photograph, Service, Testimonial, BlogPost, FAQ, Booking, Message, SEOMetadata, AnalyticsStats, PhotographerProfile, BookingConfig, EmailConfig, ClientAccount, SessionCategory, PhotographyPackage } from '../types';

// Curated selection of ultra-high-resolution Unsplash photography matching Leica, Hasselblad tones
export const INITIAL_PHOTOGRAPHS: Photograph[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=1200',
    title: 'Ethereal Solitude',
    title_es: 'Soledad Etérea',
    category: 'retrato',
    description: 'A study of light and character, highlighting the organic texture and emotional depth captured under soft North-light direction.',
    description_es: 'Un estudio de luz y carácter, destacando la textura orgánica y la profundidad emocional capturada bajo luz norte suave y direccional.',
    exif: {
      camera: 'Hasselblad X2D 100C',
      lens: 'XCD 90mm f/2.5 V',
      focalLength: '90mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/250s',
      iso: '64',
      location: 'Milan, Italy'
    },
    tags: ['Portrait', 'Editorial', 'Studio', 'Monochrome Accent', 'Fine Art'],
    colors: ['#0C0C0C', '#EADCB9', '#635A47'],
    isFavorite: true,
    isFeatured: true,
    resolution: '100MP (11656 x 8742)',
    size: '18.4 MB'
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=90&w=1200',
    title: 'Golden Hour Vows',
    title_es: 'Votos a la Hora Dorada',
    category: 'boda',
    description: 'An intimate sunset frame on the cliffs of Amalfi, reflecting the raw tenderness and premium atmosphere of high-fashion weddings.',
    description_es: 'Una íntima toma al atardecer en los acantilados de Amalfi, reflejando la ternura y la atmósfera premium de las bodas de alta costura.',
    exif: {
      camera: 'Leica SL3',
      lens: 'Summilux-SL 50mm f/1.4 ASPH.',
      focalLength: '50mm',
      aperture: 'f/1.4',
      shutterSpeed: '1/1000s',
      iso: '100',
      location: 'Amalfi Coast, Italy'
    },
    tags: ['Wedding', 'Luxury Wedding', 'Amalfi', 'Sunset', 'Candid'],
    colors: ['#1C160F', '#B48E43', '#FCF9F2'],
    isFavorite: false,
    isFeatured: true,
    resolution: '60MP (9520 x 6340)',
    size: '14.2 MB'
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=90&w=1200',
    title: 'Vogue editorial No. IV',
    title_es: 'Editorial Vogue No. IV',
    category: 'moda',
    description: 'High-contrast avant-garde editorial in Madrid\u2019s brutalist structures, focusing on dynamic drape mechanics and stark shadows.',
    description_es: 'Editorial vanguardista de alto contraste en las estructuras brutalistas de Madrid, centrado en la mecánica dinámica del drapeado y sombras marcadas.',
    exif: {
      camera: 'Leica M11',
      lens: 'Noctilux-M 50mm f/0.95 ASPH.',
      focalLength: '50mm',
      aperture: 'f/0.95',
      shutterSpeed: '1/2000s',
      iso: '64',
      location: 'Madrid, Spain'
    },
    tags: ['Fashion', 'Vogue', 'Minimalist', 'Editorial', 'Avant-Garde'],
    colors: ['#080808', '#DAC48D', '#ECECEC'],
    isFavorite: true,
    isFeatured: true,
    resolution: '60MP (9520 x 6340)',
    size: '12.8 MB'
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=90&w=1200',
    title: 'Azure Symmetry',
    title_es: 'Simetría Azul',
    category: 'drone',
    description: 'Orthogonal aerial capture of coastal formations in Portugal, capturing the abstract balance between ocean textures and golden shore cliffs.',
    description_es: 'Captura aérea ortogonal de formaciones costeras en Portugal, mostrando el equilibrio abstracto entre texturas oceánicas y acantilados dorados.',
    exif: {
      camera: 'DJI Inspire 3',
      lens: 'DL 18mm f/2.8 LS ASPH',
      focalLength: '18mm',
      aperture: 'f/4.0',
      shutterSpeed: '1/400s',
      iso: '100',
      location: 'Algarve, Portugal'
    },
    tags: ['Drone', 'Minimalist', 'Aerial', 'Fine Art Landscaping'],
    colors: ['#0A1D37', '#EADCB9', '#FFFFFF'],
    isFavorite: false,
    isFeatured: true,
    resolution: '45MP (8192 x 5462)',
    size: '15.6 MB'
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=90&w=1200',
    title: 'Chronos No. 12',
    title_es: 'Chronos No. 12',
    category: 'producto',
    description: 'Commercial studio macro layout for an ultra-luxury watch, celebrating brushed titanium textures and intricate hand-finished movements.',
    description_es: 'Macro de estudio comercial para un reloj de ultra lujo, celebrando las texturas de titanio cepillado y los intrincados movimientos acabados a mano.',
    exif: {
      camera: 'Hasselblad H6D-100c',
      lens: 'HC Macro 120mm f/4 II',
      focalLength: '120mm',
      aperture: 'f/11',
      shutterSpeed: '1/125s',
      iso: '64',
      location: 'Zurich, Switzerland'
    },
    tags: ['Product', 'Luxury', 'Commercial', 'Macro', 'Watch'],
    colors: ['#0D0D0E', '#EAEAEA', '#B48E43'],
    isFavorite: true,
    isFeatured: false,
    resolution: '100MP (11656 x 8742)',
    size: '22.1 MB'
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=90&w=1200',
    title: 'Positano Sunrise',
    title_es: 'Amanecer en Positano',
    category: 'viajes',
    description: 'A quiet dawn overlooking the iconic tiered pastel architectures of Positano, cloaked in mist and golden reflection.',
    description_es: 'Un amanecer tranquilo sobre las icónicas arquitecturas pastel escalonadas de Positano, envuelto en niebla y reflejos dorados.',
    exif: {
      camera: 'Leica Q3',
      lens: 'Summilux 28mm f/1.7 ASPH.',
      focalLength: '28mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/180s',
      iso: '200',
      location: 'Positano, Italy'
    },
    tags: ['Travel', 'Italy', 'Coastline', 'Landscape', 'Sunrise'],
    colors: ['#2B2420', '#C7A962', '#E1E9F0'],
    isFavorite: false,
    isFeatured: true,
    resolution: '60MP (9520 x 6340)',
    size: '13.9 MB'
  },
  {
    id: 'photo-7',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=90&w=1200',
    title: 'The Grand Ballroom Entrance',
    title_es: 'La Gran Entrada al Salón de Baile',
    category: 'evento',
    description: 'Candid photo of a prestigious gala at Palais Garnier. Masterclass in low-light ambience, high dynamic range preservation, and architectural framing.',
    description_es: 'Foto espontánea de una prestigiosa gala en el Palais Garnier. Maestría en iluminación ambiental escasa, preservación de alto rango dinámico y encuadre arquitectónico.',
    exif: {
      camera: 'Sony Alpha 1',
      lens: 'FE 24-70mm f/2.8 GM II',
      focalLength: '35mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/125s',
      iso: '1600',
      location: 'Paris, France'
    },
    tags: ['Event', 'Gala', 'Luxury', 'Ballroom', 'Candid'],
    colors: ['#12100C', '#DAC48D', '#ECE9E2'],
    isFavorite: false,
    isFeatured: false,
    resolution: '50MP (8640 x 5760)',
    size: '11.4 MB'
  },
  {
    id: 'photo-8',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=90&w=1200',
    title: 'Ethereal Forest Canopy',
    title_es: 'Dosel Forestal Etéreo',
    category: 'naturaleza',
    description: 'First rays of morning light breaking through a dense cedar canopy in Yakushima, casting dramatic light shafts into primeval moss meadows.',
    description_es: 'Los primeros rayos de luz matinal atraviesan un denso dosel de cedro en Yakushima, creando dramáticos haces de luz en prados de musgo primigenios.',
    exif: {
      camera: 'Hasselblad X2D 100C',
      lens: 'XCD 38mm f/2.5 V',
      focalLength: '38mm',
      aperture: 'f/8.0',
      shutterSpeed: '1/15s',
      iso: '100',
      location: 'Yakushima, Japan'
    },
    tags: ['Nature', 'Fine Art', 'Landscape', 'Forest', 'Sunbeams'],
    colors: ['#10150F', '#7E5929', '#E6EDE5'],
    isFavorite: true,
    isFeatured: false,
    resolution: '100MP (11656 x 8742)',
    size: '19.8 MB'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'service-1',
    title: 'Luxury Editorial Weddings',
    description: 'Cinematic, timeless, and documentary-style coverage of your wedding day. Tailored for couples seeking haute-couture composition and artistic preservation of their sacred moments.',
    duration: '10 Hours Coverage',
    includes: [
      'Pre-wedding consultation & location scouting',
      'Leica/Hasselblad dual camera set up',
      'Premium client-proofing web archive',
      '750+ fully developed custom high-res WebP images',
      'Artistic handmade leather-bound photobook (40 pages)',
      'Digital licensing for personal and editorial distribution'
    ],
    price: 4500,
    slug: 'wedding-luxury',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    title_es: 'Bodas Editoriales de Lujo',
    description_es: 'Cobertura cinematográfica, atemporal y estilo documental del día de su boda. Diseñado para parejas que buscan composiciones de alta costura y la preservación artística de sus momentos sagrados.',
    duration_es: '10 Horas de Cobertura',
    includes_es: [
      'Consulta previa a la boda y exploración de locaciones',
      'Configuración de cámara dual Leica/Hasselblad',
      'Archivo web premium de revisión para clientes',
      'Más de 750 imágenes WebP de alta resolución totalmente procesadas',
      'Fotolibro artístico encuadernado a mano en cuero premium (40 páginas)',
      'Licencia digital para distribución personal y de prensa'
    ],
  },
  {
    id: 'service-2',
    title: 'High-End Fashion & Portraiture',
    description: 'Striking, impactful editorial images designed for modeling agencies, luxury fashion houses, and individuals seeking museum-grade personal fine-art prints.',
    duration: '4 Hours Session',
    includes: [
      'In-studio or conceptual location shoot',
      'Creative direction & tailored styling advisor',
      '25 fully optimized digital master files with premium skin retouching',
      'Complete raw photo library access via client-proofing panel',
      'One museum-grade 24x36" archival cotton print',
      'Commercial usage licensing option'
    ],
    price: 1800,
    slug: 'fashion-editorial',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    title_es: 'Moda y Retrato de Alta Gama',
    description_es: 'Imágenes editoriales impactantes diseñadas para agencias de modelos, firmas de moda de lujo e individuos que buscan impresiones artísticas personales de calidad de museo.',
    duration_es: 'Sesión de 4 Horas',
    includes_es: [
      'Sesión en estudio o locación conceptualizada',
      'Dirección creativa y asesoría de estilismo de moda personalizada',
      '25 archivos maestros digitales completamente optimizados con retoque de piel premium',
      'Acceso completo a la biblioteca de fotos RAW mediante el panel de clientes',
      'Una impresión de calidad de museo en algodón de formato 24x36"',
      'Opción de licencia de uso comercial disponible'
    ],
  },
  {
    id: 'service-3',
    title: 'Architectural & Luxury Real Estate',
    description: 'Perfect symmetry, balanced ambient & artificial illumination, and aerial perspectives highlighting luxury residential or commercial spaces.',
    duration: '6 Hours Shoot',
    includes: [
      'Comprehensive interior & exterior layout framing',
      'Dual perspective setup: ultra-wide interior & high-altitude drone',
      'Professional color grading & HDR sky replacements',
      '35 high-resolution editorial interior assets',
      'Full commercial license for digital, print, and billboard listing'
    ],
    price: 2500,
    slug: 'architectural-real-estate',
    image: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=800',
    title_es: 'Arquitectura y Propiedades de Lujo',
    description_es: 'Simetría perfecta, iluminación ambiental y artificial equilibrada, y perspectivas aéreas que destacan espacios residenciales o comerciales de alta gama.',
    duration_es: 'Sesión de 6 Horas',
    includes_es: [
      'Encuadre exhaustivo de interiores y exteriores',
      'Configuración de doble perspectiva: interior ultra gran angular y dron de gran altitud',
      'Revelado de color profesional y reemplazos de cielo HDR',
      '35 activos fotográficos editoriales de alta resolución para interiores',
      'Licencia comercial completa para publicidad digital, impresa y vallas publicitarias'
    ],
  },
  {
    id: 'service-4',
    title: 'Commercial Product Campaigns',
    description: 'Studio macro shoots focusing on exquisite materials, intricate design engineering, and light styling. Tailored for premium watchmakers, jewelry houses, and fine spirit brands.',
    duration: 'Day Rate (8 Hours)',
    includes: [
      'Dedicated macro studio lighting array setup',
      'Product styling & dust-free preparation',
      'Ultra-high resolution 100MP Hasselblad capture',
      'Professional focus-stacking post-processing',
      'Full advertising usage and worldwide print syndication rights'
    ],
    price: 3200,
    slug: 'commercial-product',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    title_es: 'Campañas Comerciales de Producto',
    description_es: 'Sesiones de estudio macro enfocadas en materiales exquisitos, diseño de precisión e iluminación de autor. Hecho a medida para relojeros premium, firmas de alta joyería y destilados finos.',
    duration_es: 'Tarifa Diaria (8 Horas)',
    includes_es: [
      'Configuración de matriz de iluminación de estudio macro dedicada',
      'Estilismo de producto y preparación libre de polvo',
      'Captura de resolución ultra-alta de 100MP con Hasselblad',
      'Postprocesamiento profesional con apilamiento de enfoque (focus-stacking)',
      'Derechos de uso publicitario completo y distribución de prensa mundial'
    ],
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Alessandra & Matteo',
    role: 'Vogue Wedding Clients',
    comment: 'The imagery produced for our wedding on Lake Como is nothing short of majestic. Every photo looks like a high-fashion cover, capturing quiet, profound emotions we did not even realize were being watched. A true master of lens and space.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-2',
    name: 'Julian Vandeveld',
    role: 'Creative Director, Chronos Swiss',
    comment: 'For our global campaign launch, we needed pixel-perfect precision and emotional allure. The 100MP macro studio assets provided exceeded our highest guidelines. Flawless skin, rich tones, and professional cooperation.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-3',
    name: 'Gabriella Sterling',
    role: 'Fashion Model & Influencer',
    comment: 'The lighting was cinematic and the session felt completely artistic. They know exactly how to guide poses and composition while capturing your raw essence. The resulting editorial set has already elevated my portfolio immensely.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Art of Cinematic Lighting: Sculpting Shadows with Soft Boxes',
    excerpt: 'Deep-dive into recreating Rembrandt-style lighting in high-end studio portraiture. Learn how to control decay and contrast using luxury diffusers.',
    content: `### Sculpting with Light and Shadow

In premium portraiture, light is not merely used to illuminate the subject; it is used to **sculpt** their story. Drawing inspiration from 17th-century Dutch masters like Rembrandt, we explore how modern medium-format cameras like the **Hasselblad X2D** record the transitional gradient from skin highlight to deep shadow.

#### 1. The Power of North Light
Historically, painters prioritized northern-facing studio windows. This light is incredibly soft, indirect, and constant. In the studio, we replicate this using a massive 150cm octabox placed at a 45-degree angle to the subject, slightly higher than eye level.

#### 2. Managing the Inverse Square Law
The distance between your light source and your subject dictates how quickly light falls off. For deep, moody backgrounds:
* Place the light very close to the subject.
* Reduce the power output.
* This creates a steep gradient, wrapping the subject in golden luminance while casting the background into absolute pitch black.

#### 3. Color Temperature Harmonies
Leica glass is celebrated for its natural warmth. We balance our flash arrays at a steady **5400K**, introducing subtle golden reflectors to bounce warm tones back into the jawline, creating a rich cinematic feel.`,
    category: 'Tutorials',
    tags: ['Lighting', 'Studio', 'Tutorial', 'Leica M11', 'Rembrandt'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    date: '2026-06-28',
    readTime: '6 min read',
    seoKeywords: 'cinematic lighting, studio portraiture, Rembrandt lighting, Hasselblad, softbox lighting photography tips',
    status: 'published'
  },
  {
    id: 'blog-2',
    title: 'Medium Format vs 35mm: Deciding on the Ultimate Portrait Tool',
    excerpt: 'An objective analysis of sensor dimensions, crop factors, depth of field compression, and why medium format reigns supreme in luxury publishing.',
    content: `### Sensor Scale and the Medium Format Aesthetic

Why do photos taken on high-end cameras look inherently "different"? It is not just about megapixel count. It comes down to **sensor size** and the unique compression it grants your lens choices.

#### Depth-of-Field Falloff
A 90mm lens on a medium format sensor provides roughly the same field of view as a 70mm on a full-frame 35mm sensor. However, the depth of field remains that of a true 90mm lens. The result is a buttery, gradual falloff where the ears and hair melt smoothly into the background, leaving only the eyes in tack-sharp focus.

#### Dynamic Range and Tonal Gradations
With 16-bit color depth (standard on modern digital medium format sensors), you are recording over **281 trillion colors**. This results in skin tones that transition smoothly without banding or visual blockiness, even in high-contrast scenarios.`,
    category: 'Gear Reviews',
    tags: ['Medium Format', 'Hasselblad', 'Leica SL3', 'Sensor Science'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    date: '2026-05-14',
    readTime: '8 min read',
    seoKeywords: 'medium format camera, full frame vs medium format, Hasselblad X2D review, luxury photography gear, portrait depth of field',
    status: 'published'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What cameras and lenses do you use for your shoots?',
    answer: 'I shoot predominantly on the Hasselblad X2D 100C system for ultimate medium-format detail and unmatched skin-tone color rendition. For spontaneous or street-editorial projects, I rely on the iconic Leica SL3 and Leica M11 Rangefinder, paired with legendary Summilux-M prime lenses.',
    category: 'Gear & Production',
    question_es: '¿Qué cámaras y objetivos utilizas en tu trabajo?',
    answer_es: 'Trabajo principalmente con el sistema de formato medio Hasselblad X2D 100C para obtener el máximo detalle y una reproducción de color de piel inigualable. Para proyectos de calle o editoriales espontáneos, confío en las icónicas Leica SL3 y Leica M11, combinadas con los legendarios objetivos fijos Summilux-M.',
    question_en: 'What cameras and lenses do you use for your shoots?',
    answer_en: 'I shoot predominantly on the Hasselblad X2D 100C system for ultimate medium-format detail and unmatched skin-tone color rendition. For spontaneous or street-editorial projects, I rely on the iconic Leica SL3 and Leica M11 Rangefinder, paired with legendary Summilux-M prime lenses.'
  },
  {
    id: 'faq-2',
    question: 'Do you travel internationally for destination weddings and shoots?',
    answer: 'Absolutely. I am based in Europe, but shoot destination weddings and fashion campaigns worldwide. Travel, lodging, and visa coordination are handled directly by my studio manager, and a flat-rate custom travel expense package will be appended to your quotation.',
    category: 'Travel & Booking',
    question_es: '¿Viajas internacionalmente para bodas de destino y sesiones?',
    answer_es: 'Absolutamente. Tengo mi base en Europa, pero realizo reportajes de bodas de destino y campañas de moda en todo el mundo. Los vuelos, el alojamiento y la logística de visados son gestionados directamente por mi jefa de estudio, y se añadirá un paquete de gastos de viaje de tarifa plana personalizado a su cotización.',
    question_en: 'Do you travel internationally for destination weddings and shoots?',
    answer_en: 'Absolutely. I am based in Europe, but shoot destination weddings and fashion campaigns worldwide. Travel, lodging, and visa coordination are handled directly by my studio manager, and a flat-rate custom travel expense package will be appended to your quotation.'
  },
  {
    id: 'faq-3',
    question: 'How long does it take to receive the fully finished gallery?',
    answer: 'A high-fidelity teaser selection of 15-20 hand-edited images is uploaded to your Private Client Portal within 72 hours of your session. The full, color-graded, high-resolution master catalog is completed and published for download within 4 to 6 weeks.',
    category: 'Deliverables & Retouching',
    question_es: '¿Cuánto tiempo se tarda en recibir la galería finalizada?',
    answer_es: 'Una selección exclusiva de adelanto de 15 a 20 imágenes editadas a mano se subirá a su Portal Privado de Clientes dentro de las primeras 72 horas posteriores a la sesión. El catálogo maestro completo, procesado en alta resolución y con nuestra firma cromática, se entregará en un plazo garantizado de 4 a 6 semanas.',
    question_en: 'How long does it take to receive the fully finished gallery?',
    answer_en: 'A high-fidelity teaser selection of 15-20 hand-edited images is uploaded to your Private Client Portal within 72 hours of your session. The full, color-graded, high-resolution master catalog is completed and published for download within 4 to 6 weeks.'
  },
  {
    id: 'faq-4',
    question: 'Are raw files included in your packages?',
    answer: 'I pride myself on delivering polished, finalized masterpieces. Therefore, unedited raw files are generally not released. However, full access to view and proof the complete raw catalog is provided inside the secure Client proofing portal to select your final favorites for retouching.',
    category: 'Deliverables & Retouching',
    question_es: '¿Están incluidos los archivos RAW sin editar en sus paquetes?',
    answer_es: 'Me enorgullezco de entregar obras de arte pulidas y finalizadas con nuestra firma visual. Por lo tanto, los archivos RAW sin editar nunca se entregan al cliente final. Sin embargo, se proporciona acceso completo para visualizar y revisar todo el catálogo de pruebas dentro del Portal Privado para que pueda seleccionar sus capturas favoritas para el retoque final.',
    question_en: 'Are raw files included in your packages?',
    answer_en: 'I pride myself on delivering polished, finalized masterpieces. Therefore, unedited raw files are generally not released. However, full access to view and proof the complete raw catalog is provided inside the secure Client proofing portal to select your final favorites for retouching.'
  },
  {
    id: 'faq-5',
    question: 'How does the booking and secure payment process work?',
    answer: 'To book an exclusive date, we require a 30% booking deposit paid securely through Stripe using credit/debit cards or digital wallets. The remaining 70% balance is payable one week prior to the session date or on the day of the shoot before we begin.',
    category: 'Travel & Booking',
    question_es: '¿Cómo funciona el proceso de reserva y pago seguro?',
    answer_es: 'Para reservar una fecha exclusiva, requerimos un depósito de reserva del 30% que se abona cómodamente a través de Stripe utilizando tarjeta de crédito/débito o billeteras digitales. El 70% restante se abona una semana antes del día de la sesión o el mismo día del reportaje antes de comenzar.',
    question_en: 'How does the booking and secure payment process work?',
    answer_en: 'To book an exclusive date, we require a 30% booking deposit paid securely through Stripe using credit/debit cards or digital wallets. The remaining 70% balance is payable one week prior to the session date or on the day of the shoot before we begin.'
  },
  {
    id: 'faq-6',
    question: 'Do you offer fine art prints and handmade albums?',
    answer: 'Yes, we collaborate with the finest fine-art print labs in Italy and Germany to produce museum-grade archival cotton prints (100% acid-free). Our luxury photo albums are hand-bound with fine-grain leather or premium linen, designed to endure for generations.',
    category: 'Deliverables & Retouching',
    question_es: '¿Ofrecen impresiones artísticas y álbumes hechos a mano?',
    answer_es: 'Sí, trabajamos con los mejores laboratorios de bellas artes de Italia y Alemania para producir impresiones de calidad de museo en papel de algodón de archivo 100% libre de ácido. Nuestros álbumes de fotos de lujo están encuadernados a mano con cuero de grano fino o lino premium, diseñados para durar generaciones.',
    question_en: 'Do you offer fine art prints and handmade albums?',
    answer_en: 'Yes, we collaborate with the finest fine-art print labs in Italy and Germany to produce museum-grade archival cotton prints (100% acid-free). Our luxury photo albums are hand-bound with fine-grain leather or premium linen, designed to endure for generations.'
  },
  {
    id: 'faq-7',
    question: 'What happens if the weather is unfavorable for an outdoor session?',
    answer: 'We understand that weather is unpredictable. If heavy rain or storms are forecast that make the shoot impossible, we will reschedule the session at no additional cost to the next mutually available date. For light overcast, we often continue as clouds act as a beautiful natural light diffuser.',
    category: 'Travel & Booking',
    question_es: '¿Qué sucede si el clima no es favorable para una sesión en exteriores?',
    answer_es: 'Entendemos que las condiciones climáticas son impredecibles. Si se pronostican lluvias intensas o tormentas que imposibiliten la sesión, reprogramaremos el reportaje sin costo adicional para la primera fecha disponible que sea de mutuo acuerdo. Para nublado ligero, a menudo continuamos ya que las nubes actúan como un difusor de luz natural impecable.',
    question_en: 'What happens if the weather is unfavorable for an outdoor session?',
    answer_en: 'We understand that weather is unpredictable. If heavy rain or storms are forecast that make the shoot impossible, we will reschedule the session at no additional cost to the next mutually available date. For light overcast, we often continue as clouds act as a beautiful natural light diffuser.'
  },
  {
    id: 'faq-8',
    question: 'Can we request creative direction and styling assistance?',
    answer: 'Absolutely. All artistic and fashion commissions include a dedicated 1-hour pre-shoot creative direction consultation. We curate a bespoke style guide and collaborative visual moodboard to align your wardrobe color palette, location aesthetics, and lighting atmosphere with medium-format standards.',
    category: 'Gear & Production',
    question_es: '¿Podemos solicitar directrices creativas y ayuda para el estilismo?',
    answer_es: 'Absolutamente. Todas las comisiones artísticas y de moda incluyen una sesión de consulta de dirección de arte previa de 1 hora. Creamos una guía de estilo a medida y un panel de inspiración (moodboard) visual conjunto para coordinar las paletas de color de su vestuario, localizaciones y ambiente de iluminación para que se alineen perfectamente con los estándares de formato medio.',
    question_en: 'Can we request creative direction and styling assistance?',
    answer_en: 'Absolutely. All artistic and fashion commissions include a dedicated 1-hour pre-shoot creative direction consultation. We curate a bespoke style guide and collaborative visual moodboard to align your wardrobe color palette, location aesthetics, and lighting atmosphere with medium-format standards.'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@luxurybrands.co',
    clientPhone: '+1 (555) 389-2910',
    date: '2026-07-22',
    timeSlot: '10:00 - 14:00',
    serviceId: 'service-2',
    peopleCount: 1,
    notes: 'Agency portrait test. Need high-key lighting and clean gray/beige backdrops. Styling is focused on summer resort wear.',
    status: 'accepted',
    createdAt: '2026-07-09T14:22:00Z',
    amount: 1800
  },
  {
    id: 'book-2',
    clientName: 'Arthur Dent',
    clientEmail: 'dent.arthur@galaxy.io',
    clientPhone: '+44 7911 123456',
    date: '2026-08-15',
    timeSlot: '14:00 - 18:00',
    serviceId: 'service-3',
    peopleCount: 3,
    notes: 'Real estate interior shoot of a newly renovated mid-century modern villa in Cotswolds. Need dusk golden hour shots.',
    status: 'pending',
    createdAt: '2026-07-10T09:12:00Z',
    amount: 2500
  },
  {
    id: 'book-3',
    clientName: 'Evelyn & Daniel',
    clientEmail: 'eve.dan.wedding@gmail.com',
    clientPhone: '+33 6 1234 5678',
    date: '2026-09-05',
    timeSlot: '12:00 - 22:00',
    serviceId: 'service-1',
    peopleCount: 120,
    notes: 'Destination wedding in Château de Vaux-le-Vicomte, France. We would love emotional candid moments, fine-art black & whites, and drone setups.',
    status: 'pending',
    createdAt: '2026-07-11T05:43:00Z',
    amount: 4500
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    name: 'Helena Rostova',
    email: 'h.rostova@voguemagazine.cz',
    subject: 'Editorial cooperation offer - Autumn Issue',
    message: 'Hello, we absolutely love your "Ethereal Solitude" and "Vogue No. IV" photographs. We would like to pitch a 12-page editorial spreading for our upcoming Autumn print issue featuring European minimalists. Please let us know your availability.',
    createdAt: '2026-07-10T18:30:00Z',
    isRead: false
  },
  {
    id: 'msg-2',
    name: 'Carlos Mendes',
    email: 'carlos@mendes-architects.pt',
    subject: 'Quotation for architectural portfolio',
    message: 'We are completing an award-nominated boutique hotel project in Algarve and want premium, geometric, sun-drenched assets of the pools and suites. Can you send a detailed travel/day-rate pricing layout?',
    createdAt: '2026-07-11T08:15:00Z',
    isRead: true
  }
];

export const INITIAL_SEO: SEOMetadata = {
  title: 'Miriam Campos Photography | Premium Luxury Fine-Art Photography & Editorial Studio',
  description: 'Museum-grade editorial, portrait, and luxury wedding photography captured on medium-format Leica & Hasselblad systems. Crafted for high-end fashion and emotional preservation.',
  ogTitle: 'Miriam Campos Photography Portfolio | High-End Fine-Art & Editorial Photography',
  ogDescription: 'Experience a cinematic digital art gallery. Booking premium portrait, fashion editorial, and international destination wedding commissions.',
  ogImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=1200',
  twitterCard: 'summary_large_image',
  keywords: 'luxury wedding photographer, fine art portraits, fashion editorial photography, Hasselblad portrait, Leica wedding, architectural photography, premium commercial, Awwwards portfolio',
  robotsText: 'User-agent: *\nAllow: /\nSitemap: https://miriamcampos-photography.com/sitemap.xml',
  heroImageLeft: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1600',
  heroImageRight: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=85&w=1600'
};

export const INITIAL_BOOKING_CONFIG: BookingConfig = {
  timeSlots: [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00',
    '19:00 - 21:00'
  ],
  availableDays: [1, 2, 3, 4, 5, 6], // Monday through Saturday
  blockedDates: []
};

export const INITIAL_EMAIL_CONFIG: EmailConfig = {
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  receiverEmail: '',
  enableAutoResponse: false,
  emailjsAutoTemplateId: '',
  autoReplySubject: '¡Tu reserva ha sido recibida con éxito! - Aurea Studio',
  autoReplyMessage: 'Hola,\n\nMuchas gracias por reservar tu sesión fotográfica con nosotros. Hemos recibido tus datos correctamente y tu espacio ha sido bloqueado en nuestro calendario.\n\nEn las próximas horas nos pondremos en contacto contigo para coordinar los detalles finales, locación y responder cualquier consulta adicional.\n\n¡Estamos muy emocionados de crear arte juntos!\n\nAtentamente,\nEl equipo de Aurea Studio.'
};

export const INITIAL_PROFILE: PhotographerProfile = {
  name: 'Miriam Campos',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800',
  title: 'MIRIAM CAMPOS STUDIO HEAD PHOTOGRAPHER',
  preferredCamera: 'Hasselblad X2D 100C & Leica SL3',
  preferredLens: 'XCD 90mm f/2.5 V & Noctilux-M 50 f/0.95',
  aboutTitle_es: 'LA FILOSOFÍA DETRÁS DE LA LENTE',
  aboutTitle_en: 'THE PHILOSOPHY BEHIND THE GLASS',
  aboutText1_es: 'Soy Miriam Campos, fotógrafa y directora de arte de bellas artes, dedicada a congelar el tiempo bajo el estándar de Leica y Hasselblad. Entiendo la luz no solo como iluminación, sino como el medio supremo para esculpir emociones y narrar historias silenciosas con proporciones áureas.',
  aboutText2_es: 'Con más de 15 años documentando bodas editoriales de alta costura, campañas comerciales internacionales y retratos íntimos para agencias de modelos de élite, mi trabajo busca un minimalismo elegante, abundante espacio en blanco y simetría geométrica.',
  aboutText1_en: 'I am Miriam Campos, a fine art photographer and creative director dedicated to freezing time through the pristine optics of Leica and Hasselblad. I understand light not as simple exposure, but as the supreme medium to sculpt emotion and weave silent stories of golden ratio symmetry.',
  aboutText2_en: 'With over 15 years documenting haute-couture destination weddings, international commercial campaigns, and intimate editorial model books, my work strives for elegant minimalism, generous negative space, and absolute geometric structure.'
};

export const MILESTONES = [
  {
    year: '2010',
    title_es: 'El Inicio de una Pasión',
    title_en: 'The Beginning of a Passion',
    description_es: 'Descubrí mi vocación por la fotografía documental. Con una cámara prestada comencé a retratar la luz y las emociones en mi entorno, sentando las bases de lo que sería una trayectoria dedicada al arte visual.',
    description_en: 'I discovered my calling for documentary photography. With a borrowed camera I began capturing light and emotion in my surroundings, laying the foundation for a lifelong dedication to visual art.',
  },
  {
    year: '2013',
    title_es: 'Primeros Pasos en Editorial',
    title_en: 'First Steps in Editorial',
    description_es: 'Realicé mis primeras sesiones profesionales de moda y retrato. Comencé a colaborar con agencias locales y a definir un estilo propio basado en la luz natural, la simetría y la elegancia minimalista.',
    description_en: 'I completed my first professional fashion and portrait shoots. I began collaborating with local agencies, defining a signature style based on natural light, symmetry, and minimalist elegance.',
  },
  {
    year: '2017',
    title_es: 'Expansión Internacional',
    title_en: 'International Expansion',
    description_es: 'Llevé mi trabajo a Europa y América Latina, fotografiando bodas editoriales de alta costura y campañas comerciales. Mi portfolio cruzó fronteras y comencé a trabajar con equipos de formato medio.',
    description_en: 'I took my work to Europe and Latin America, shooting haute-couture destination weddings and commercial campaigns. My portfolio crossed borders and I began working with medium-format gear.',
  },
  {
    year: '2020',
    title_es: '500 Sesiones Realizadas',
    title_en: '500 Sessions Completed',
    description_es: 'Alcancé el hito de más de 500 sesiones fotográficas entre bodas, editoriales de moda, retratos y campañas de producto. Un momento de reflexión y consolidación artística que reafirmó mi compromiso con la excelencia.',
    description_en: 'I reached over 500 photographic sessions spanning weddings, fashion editorials, portraits, and product campaigns. A moment of reflection and artistic consolidation that reaffirmed my commitment to excellence.',
  },
  {
    year: '2023',
    title_es: 'Nuevo Estudio Creativo',
    title_en: 'New Creative Studio',
    description_es: 'Inauguré mi propio espacio fotográfico equipado con tecnología Hasselblad y Leica. Un estudio concebido como taller de luz donde cada sesión es una obra única, con atención meticulosa a cada detalle.',
    description_en: 'I opened my own photographic space equipped with Hasselblad and Leica technology. A studio conceived as a light workshop where every session is a unique piece, with meticulous attention to every detail.',
  },
  {
    year: '2025',
    title_es: '15 Años de Luz',
    title_en: '15 Years of Light',
    description_es: 'Más de 15 años de trayectoria, 200+ clientes felices en 12 países y una evolución constante. La fotografía sigue siendo mi lenguaje: congelar instantes, esculpir emociones y contar historias que trascienden el tiempo.',
    description_en: 'Over 15 years of career, 200+ happy clients across 12 countries, and constant evolution. Photography remains my language: freezing moments, sculpting emotions, and telling stories that transcend time.',
  },
];

export const INITIAL_SESSION_CATEGORIES: SessionCategory[] = [
  {
    id: 'boda', icon: 'Heart',
    name_es: 'Bodas', name_en: 'Weddings',
    description_es: 'El día más importante merece ser eterno.', description_en: 'The most important day deserves to be eternal.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=800',
    sortOrder: 1, active: true,
  },
  {
    id: 'compromiso', icon: 'Gem',
    name_es: 'Compromisos', name_en: 'Engagements',
    description_es: 'El amor merece celebrarse.', description_en: 'Love deserves to be celebrated.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=85&w=800',
    sortOrder: 2, active: true,
  },
  {
    id: 'retrato', icon: 'Camera',
    name_es: 'Retratos', name_en: 'Portraits',
    description_es: 'Tu esencia en una imagen.', description_en: 'Your essence in one image.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800',
    sortOrder: 3, active: true,
  },
  {
    id: 'familia', icon: 'Users',
    name_es: 'Familia', name_en: 'Family',
    description_es: 'El vínculo más hermoso.', description_en: 'The most beautiful bond.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc87141906cf?auto=format&fit=crop&q=85&w=800',
    sortOrder: 4, active: true,
  },
  {
    id: 'infantil', icon: 'Baby',
    name_es: 'Infantil', name_en: 'Children',
    description_es: 'La ternura hecha foto.', description_en: 'Tenderness captured in a photo.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=800',
    sortOrder: 5, active: true,
  },
  {
    id: 'maternidad', icon: 'Sparkles',
    name_es: 'Maternidad', name_en: 'Maternity',
    description_es: 'La espera más dulce.', description_en: 'The sweetest wait.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=85&w=800',
    sortOrder: 6, active: true,
  },
  {
    id: 'cumpleanos', icon: 'PartyPopper',
    name_es: 'Cumpleaños', name_en: 'Birthdays',
    description_es: 'Celebra con estilo.', description_en: 'Celebrate in style.',
    image: 'https://images.unsplash.com/photo-1464349153735-7db50b83c84c?auto=format&fit=crop&q=85&w=800',
    sortOrder: 7, active: true,
  },
  {
    id: 'graduacion', icon: 'GraduationCap',
    name_es: 'Graduaciones', name_en: 'Graduations',
    description_es: 'Tu esfuerzo merece un recuerdo.', description_en: 'Your effort deserves a memory.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f9?auto=format&fit=crop&q=85&w=800',
    sortOrder: 8, active: true,
  },
  {
    id: 'corporativo', icon: 'Briefcase',
    name_es: 'Corporativo', name_en: 'Corporate',
    description_es: 'Imagen profesional para tu marca.', description_en: 'Professional image for your brand.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=800',
    sortOrder: 9, active: true,
  },
  {
    id: 'gastronomia', icon: 'Utensils',
    name_es: 'Gastronomía', name_en: 'Gastronomy',
    description_es: 'El arte de la comida.', description_en: 'The art of food.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=85&w=800',
    sortOrder: 10, active: true,
  },
  {
    id: 'producto', icon: 'Package',
    name_es: 'Producto', name_en: 'Product',
    description_es: 'Tu producto, tu mejor carta de presentación.', description_en: 'Your product, your best business card.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=85&w=800',
    sortOrder: 11, active: true,
  },
  {
    id: 'evento', icon: 'Calendar',
    name_es: 'Eventos', name_en: 'Events',
    description_es: 'Momentos que merecen ser recordados.', description_en: 'Moments worth remembering.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=85&w=800',
    sortOrder: 12, active: true,
  },
];

export const INITIAL_PHOTOGRAPHY_PACKAGES: PhotographyPackage[] = [
  // ── BODA ──
  { id: 'pkg-boda-civil', category: 'boda', name_es: 'Civil', name_en: 'Civil', price: 2500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '4 horas', duration_en: '4 hours', description_es: 'Cobertura esencial de la ceremonia civil con un enfoque documental y elegante.', description_en: 'Essential civil ceremony coverage with a documentary and elegant approach.', benefits: ['Cobertura de ceremonia', '50 fotos editadas', 'Galería privada online', 'Entrega en 7 días'], benefits_es: ['Cobertura de ceremonia', '50 fotos editadas', 'Galería privada online', 'Entrega en 7 días'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-boda-completa', category: 'boda', name_es: 'Completa', name_en: 'Complete', price: 4500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '8 horas', duration_en: '8 hours', description_es: 'Cobertura completa del día: preparativos, ceremonia, fiesta y galería privada.', description_en: 'Full day coverage: preparations, ceremony, party and private gallery.', benefits: ['Preparativos', 'Ceremonia completa', 'Fiesta y recepción', '150 fotos editadas', 'Galería privada online', 'Álbum digital premium'], benefits_es: ['Preparativos', 'Ceremonia completa', 'Fiesta y recepción', '150 fotos editadas', 'Galería privada online', 'Álbum digital premium'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-boda-luxury', category: 'boda', name_es: 'Luxury', name_en: 'Luxury', price: 8000, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: 'Cobertura completa', duration_en: 'Full coverage', description_es: 'La experiencia definitiva: cobertura total, álbum premium, drone y video resumen.', description_en: 'The ultimate experience: full coverage, premium album, drone and highlight video.', benefits: ['Cobertura completa 12h', 'Álbum premium impreso', 'Drone aéreo', 'Video resumen editado', '300+ fotos editadas', 'Galería privada'], benefits_es: ['Cobertura completa 12h', 'Álbum premium impreso', 'Drone aéreo', 'Video resumen editado', '300+ fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── COMPROMISO ──
  { id: 'pkg-comp-basico', category: 'compromiso', name_es: 'Básico', name_en: 'Basic', price: 250, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión íntima para capturar la esencia de su compromiso.', description_en: 'Intimate session to capture the essence of your engagement.', benefits: ['1 hora de sesión', '20 fotos editadas', 'Galería privada'], benefits_es: ['1 hora de sesión', '20 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-comp-completo', category: 'compromiso', name_es: 'Completo', name_en: 'Complete', price: 450, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión con cambio de vestuario y locación para un reportaje más completo.', description_en: 'Session with outfit change and location for a fuller story.', benefits: ['2 horas de sesión', '2 cambios de vestuario', '40 fotos editadas', 'Galería privada'], benefits_es: ['2 horas de sesión', '2 cambios de vestuario', '40 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-comp-premium', category: 'compromiso', name_es: 'Premium', name_en: 'Premium', price: 650, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '3 horas', duration_en: '3 hours', description_es: 'Experiencia completa con múltiples locaciones y styling profesional.', description_en: 'Complete experience with multiple locations and professional styling.', benefits: ['3 horas de sesión', '3 cambios de vestuario', '60 fotos editadas', 'Maquillaje básico', 'Galería privada'], benefits_es: ['3 horas de sesión', '3 cambios de vestuario', '60 fotos editadas', 'Maquillaje básico', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── RETRATO ──
  { id: 'pkg-ret-mini', category: 'retrato', name_es: 'Mini', name_en: 'Mini', price: 200, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '30 minutos', duration_en: '30 minutes', description_es: 'Sesión exprés ideal para retratos de perfil o redes sociales.', description_en: 'Express session ideal for profile portraits or social media.', benefits: ['30 minutos de sesión', '10 fotos editadas', 'Galería privada'], benefits_es: ['30 minutos de sesión', '10 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-ret-clasico', category: 'retrato', name_es: 'Clásico', name_en: 'Classic', price: 350, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión de retrato con cambio de vestuario y dirección de arte.', description_en: 'Portrait session with outfit change and art direction.', benefits: ['1 hora de sesión', '25 fotos editadas', 'Cambio de vestuario', 'Galería online'], benefits_es: ['1 hora de sesión', '25 fotos editadas', 'Cambio de vestuario', 'Galería online'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-ret-premium', category: 'retrato', name_es: 'Premium', name_en: 'Premium', price: 600, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión completa con estilismo, múltiples cambios y prints de calidad.', description_en: 'Full session with styling, multiple changes and quality prints.', benefits: ['2 horas de sesión', '60 fotos editadas', '2 cambios de ropa', 'Impresiones fine art', 'Galería privada'], benefits_es: ['2 horas de sesión', '60 fotos editadas', '2 cambios de ropa', 'Impresiones fine art', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── FAMILIA ──
  { id: 'pkg-fam-express', category: 'familia', name_es: 'Express', name_en: 'Express', price: 250, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión familiar rápida en locación o estudio.', description_en: 'Quick family session in location or studio.', benefits: ['1 hora de sesión', '15 fotos editadas', 'Galería privada'], benefits_es: ['1 hora de sesión', '15 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-fam-completa', category: 'familia', name_es: 'Completa', name_en: 'Complete', price: 450, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión familiar con variaciones de grupos y fondos.', description_en: 'Family session with group variations and backgrounds.', benefits: ['2 horas de sesión', '35 fotos editadas', 'Variaciones de grupo', 'Galería privada'], benefits_es: ['2 horas de sesión', '35 fotos editadas', 'Variaciones de grupo', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-fam-premium', category: 'familia', name_es: 'Premium', name_en: 'Premium', price: 650, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '3 horas', duration_en: '3 hours', description_es: 'Experiencia familiar completa con locación exterior y álbum digital.', description_en: 'Complete family experience with outdoor location and digital album.', benefits: ['3 horas de sesión', '60 fotos editadas', 'Locación exterior', 'Álbum digital', 'Galería privada'], benefits_es: ['3 horas de sesión', '60 fotos editadas', 'Locación exterior', 'Álbum digital', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── INFANTIL ──
  { id: 'pkg-inf-mini', category: 'infantil', name_es: 'Mini', name_en: 'Mini', price: 150, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '30 minutos', duration_en: '30 minutes', description_es: 'Sesión breve pensada para los más pequeños.', description_en: 'Short session designed for the little ones.', benefits: ['30 minutos de sesión', '10 fotos editadas', 'Galería privada'], benefits_es: ['30 minutos de sesión', '10 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-inf-clasico', category: 'infantil', name_es: 'Clásico', name_en: 'Classic', price: 250, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión infantil con cambios de atuendo y fondo.', description_en: 'Children session with outfit and background changes.', benefits: ['1 hora de sesión', '20 fotos editadas', 'Cambio de atuendo', 'Galería privada'], benefits_es: ['1 hora de sesión', '20 fotos editadas', 'Cambio de atuendo', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-inf-premium', category: 'infantil', name_es: 'Premium', name_en: 'Premium', price: 450, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Experiencia completa con temática personalizada y múltiples cambios.', description_en: 'Complete experience with custom theme and multiple changes.', benefits: ['2 horas de sesión', '40 fotos editadas', 'Temática personalizada', 'Decoración incluida', 'Galería privada'], benefits_es: ['2 horas de sesión', '40 fotos editadas', 'Temática personalizada', 'Decoración incluida', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── MATERNIDAD ──
  { id: 'pkg-mat-basico', category: 'maternidad', name_es: 'Básico', name_en: 'Basic', price: 250, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión íntima de maternidad en estudio.', description_en: 'Intimate maternity session in studio.', benefits: ['1 hora de sesión', '15 fotos editadas', 'Vestuario incluido', 'Galería privada'], benefits_es: ['1 hora de sesión', '15 fotos editadas', 'Vestuario incluido', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-mat-completo', category: 'maternidad', name_es: 'Completo', name_en: 'Complete', price: 400, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1.5 horas', duration_en: '1.5 hours', description_es: 'Sesión con vestuario y accesorios profesionales.', description_en: 'Session with professional wardrobe and accessories.', benefits: ['1.5 horas de sesión', '30 fotos editadas', 'Vestuario y accesorios', 'Maquillaje básico', 'Galería privada'], benefits_es: ['1.5 horas de sesión', '30 fotos editadas', 'Vestuario y accesorios', 'Maquillaje básico', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-mat-premium', category: 'maternidad', name_es: 'Premium', name_en: 'Premium', price: 600, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Experiencia premium con locación exterior y álbum digital.', description_en: 'Premium experience with outdoor location and digital album.', benefits: ['2 horas de sesión', '50 fotos editadas', 'Locación exterior', 'Álbum digital', 'Galería privada'], benefits_es: ['2 horas de sesión', '50 fotos editadas', 'Locación exterior', 'Álbum digital', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── CUMPLEAÑOS ──
  { id: 'pkg-cum-basico', category: 'cumpleanos', name_es: 'Básico', name_en: 'Basic', price: 150, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión divertida para celebrar tu cumpleaños.', description_en: 'Fun session to celebrate your birthday.', benefits: ['1 hora de sesión', '15 fotos editadas', 'Galería privada'], benefits_es: ['1 hora de sesión', '15 fotos editadas', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-cum-completo', category: 'cumpleanos', name_es: 'Completo', name_en: 'Complete', price: 300, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión con cambio de vestuario y decoración temática.', description_en: 'Session with outfit change and thematic decoration.', benefits: ['2 horas de sesión', '30 fotos editadas', 'Cambio de vestuario', 'Decoración temática', 'Galería privada'], benefits_es: ['2 horas de sesión', '30 fotos editadas', 'Cambio de vestuario', 'Decoración temática', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-cum-premium', category: 'cumpleanos', name_es: 'Premium', name_en: 'Premium', price: 500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '3 horas', duration_en: '3 hours', description_es: 'Experiencia completa con catering básico y multiple vestuario.', description_en: 'Complete experience with light catering and multiple outfits.', benefits: ['3 horas de sesión', '50 fotos editadas', 'Múltiples cambios', 'Catering básico', 'Galería privada'], benefits_es: ['3 horas de sesión', '50 fotos editadas', 'Múltiples cambios', 'Catering básico', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── GRADUACIÓN ──
  { id: 'pkg-grad-basico', category: 'graduacion', name_es: 'Básico', name_en: 'Basic', price: 200, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '1 hora', duration_en: '1 hour', description_es: 'Sesión de graduación con toga y birrete.', description_en: 'Graduation session with gown and cap.', benefits: ['1 hora de sesión', '15 fotos editadas', 'Toga y birrete incluido', 'Galería privada'], benefits_es: ['1 hora de sesión', '15 fotos editadas', 'Toga y birrete incluido', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-grad-completo', category: 'graduacion', name_es: 'Completo', name_en: 'Complete', price: 350, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión con cambios de vestuario y locación.', description_en: 'Session with outfit changes and location.', benefits: ['2 horas de sesión', '30 fotos editadas', 'Cambio de vestuario', 'Locación interior/exterior', 'Galería privada'], benefits_es: ['2 horas de sesión', '30 fotos editadas', 'Cambio de vestuario', 'Locación interior/exterior', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-grad-premium', category: 'graduacion', name_es: 'Premium', name_en: 'Premium', price: 550, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '3 horas', duration_en: '3 hours', description_es: 'Experiencia completa con invitados y múltiples locaciones.', description_en: 'Complete experience with guests and multiple locations.', benefits: ['3 horas de sesión', '60 fotos editadas', 'Fotos con invitados', 'Álbum digital', 'Galería privada'], benefits_es: ['3 horas de sesión', '60 fotos editadas', 'Fotos con invitados', 'Álbum digital', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── CORPORATIVO ──
  { id: 'pkg-corp-basico', category: 'corporativo', name_es: 'Básico', name_en: 'Basic', price: 500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión corporativa para retratos individuales y de equipo.', description_en: 'Corporate session for individual and team portraits.', benefits: ['2 horas de sesión', '20 fotos editadas', 'Retratos individuales', 'Fotos de equipo', 'Galería privada'], benefits_es: ['2 horas de sesión', '20 fotos editadas', 'Retratos individuales', 'Fotos de equipo', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-corp-profesional', category: 'corporativo', name_es: 'Profesional', name_en: 'Professional', price: 1000, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '4 horas', duration_en: '4 hours', description_es: 'Cobertura completa de personal e instalaciones.', description_en: 'Complete coverage of staff and facilities.', benefits: ['4 horas de sesión', '50 fotos editadas', 'Retratos + instalaciones', 'Maquillaje básico', 'Galería privada'], benefits_es: ['4 horas de sesión', '50 fotos editadas', 'Retratos + instalaciones', 'Maquillaje básico', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-corp-premium', category: 'corporativo', name_es: 'Premium', name_en: 'Premium', price: 2500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: 'Jornada completa', duration_en: 'Full day', description_es: 'Producción corporativa integral con drone y video.', description_en: 'Complete corporate production with drone and video.', benefits: ['Jornada completa', '100+ fotos editadas', 'Drone aéreo', 'Video corporativo', 'Galería privada'], benefits_es: ['Jornada completa', '100+ fotos editadas', 'Drone aéreo', 'Video corporativo', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── GASTRONOMÍA ──
  { id: 'pkg-gas-basico', category: 'gastronomia', name_es: 'Básico', name_en: 'Basic', price: 400, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión básica de fotografía gastronómica.', description_en: 'Basic food photography session.', benefits: ['2 horas de sesión', '15 fotos editadas', 'Styling básico', 'Galería privada'], benefits_es: ['2 horas de sesión', '15 fotos editadas', 'Styling básico', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-gas-profesional', category: 'gastronomia', name_es: 'Profesional', name_en: 'Professional', price: 800, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '4 horas', duration_en: '4 hours', description_es: 'Sesión gastronómica con styling profesional y múltiples platos.', description_en: 'Food session with professional styling and multiple dishes.', benefits: ['4 horas de sesión', '30 fotos editadas', 'Styling profesional', 'Utensillería incluida', 'Galería privada'], benefits_es: ['4 horas de sesión', '30 fotos editadas', 'Styling profesional', 'Utensillería incluida', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-gas-premium', category: 'gastronomia', name_es: 'Premium', name_en: 'Premium', price: 1500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: 'Jornada completa', duration_en: 'Full day', description_es: 'Producción completa de menú con video y styling.', description_en: 'Complete menu production with video and styling.', benefits: ['Jornada completa', '60+ fotos editadas', 'Video de platos', 'Styling completo', 'Galería privada'], benefits_es: ['Jornada completa', '60+ fotos editadas', 'Video de platos', 'Styling completo', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── PRODUCTO ──
  { id: 'pkg-prod-basico', category: 'producto', name_es: 'Básico', name_en: 'Basic', price: 350, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '2 horas', duration_en: '2 hours', description_es: 'Sesión básica de fotografía de producto.', description_en: 'Basic product photography session.', benefits: ['2 horas de sesión', '15 fotos editadas', 'Fondo blanco/infinito', 'Galería privada'], benefits_es: ['2 horas de sesión', '15 fotos editadas', 'Fondo blanco/infinito', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-prod-profesional', category: 'producto', name_es: 'Profesional', name_en: 'Professional', price: 700, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '4 horas', duration_en: '4 hours', description_es: 'Sesión con styling y múltiples ángulos del producto.', description_en: 'Session with styling and multiple product angles.', benefits: ['4 horas de sesión', '30 fotos editadas', 'Styling de producto', 'Ángulos múltiples', 'Galería privada'], benefits_es: ['4 horas de sesión', '30 fotos editadas', 'Styling de producto', 'Ángulos múltiples', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-prod-premium', category: 'producto', name_es: 'Premium', name_en: 'Premium', price: 1200, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: 'Jornada completa', duration_en: 'Full day', description_es: 'Producción completa de catálogo con video 360°.', description_en: 'Complete catalog production with 360° video.', benefits: ['Jornada completa', '50+ fotos editadas', 'Video 360°', 'Catálogo digital', 'Galería privada'], benefits_es: ['Jornada completa', '50+ fotos editadas', 'Video 360°', 'Catálogo digital', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },

  // ── EVENTO ──
  { id: 'pkg-eve-basico', category: 'evento', name_es: 'Básico', name_en: 'Basic', price: 500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '3 horas', duration_en: '3 hours', description_es: 'Cobertura esencial para eventos sociales y corporativos.', description_en: 'Essential coverage for social and corporate events.', benefits: ['3 horas de cobertura', '60 fotos editadas', 'Entrega en 72h', 'Galería privada'], benefits_es: ['3 horas de cobertura', '60 fotos editadas', 'Entrega en 72h', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 1, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-eve-completo', category: 'evento', name_es: 'Completo', name_en: 'Complete', price: 1200, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: '6 horas', duration_en: '6 hours', description_es: 'Cobertura completa del evento con segundo fotógrafo.', description_en: 'Full event coverage with second photographer.', benefits: ['6 horas de cobertura', '150 fotos editadas', 'Segundo fotógrafo', 'Entrega en 48h', 'Galería privada'], benefits_es: ['6 horas de cobertura', '150 fotos editadas', 'Segundo fotógrafo', 'Entrega en 48h', 'Galería privada'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 2, active: true, featured: true, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
  { id: 'pkg-eve-premium', category: 'evento', name_es: 'Premium', name_en: 'Premium', price: 2500, priceFromText_es: 'Desde', priceFromText_en: 'Starting from', duration_es: 'Jornada completa', duration_en: 'Full day', description_es: 'Producción ejecutiva del evento con video y highlights.', description_en: 'Executive event production with video and highlights.', benefits: ['Cobertura total', '300+ fotos editadas', 'Video highlights', 'Drone (exterior)', 'Galería privada', 'Entrega 24h'], benefits_es: ['Cobertura total', '300+ fotos editadas', 'Video highlights', 'Drone (exterior)', 'Galería privada', 'Entrega 24h'], buttonText_es: 'Contratar paquete', buttonText_en: 'Book this package', sortOrder: 3, active: true, featured: false, travelNote_es: 'Gastos de viaje y movilidad no incluidos', travelNote_en: 'Travel and mobility expenses not included' },
];

export const INITIAL_ANALYTICS: AnalyticsStats = {
  totalVisits: 14890,
  totalRevenue: 64200,
  bookingConversionRate: 4.8,
  sessionsCount: 512,
  revenueByMonth: [
    { month: 'Feb', value: 8500 },
    { month: 'Mar', value: 12400 },
    { month: 'Apr', value: 14500 },
    { month: 'May', value: 18200 },
    { month: 'Jun', value: 24500 },
    { month: 'Jul', value: 31000 }
  ],
  sessionsByService: [
    { service: 'Weddings', count: 18 },
    { service: 'Portraits', count: 42 },
    { service: 'Architectural', count: 12 },
    { service: 'Product', count: 24 }
  ],
  visitsByDay: [
    { day: 'Mon', count: 420 },
    { day: 'Tue', count: 490 },
    { day: 'Wed', count: 520 },
    { day: 'Thu', count: 610 },
    { day: 'Fri', count: 750 },
    { day: 'Sat', count: 880 },
    { day: 'Sun', count: 820 }
  ]
};

// Complete Internationalization Dictionary for Premium SEO and UI Luxury Feeling
export const TRANSLATIONS = {
  es: {
    navHome: 'Inicio',
    navAbout: 'Sobre Mí',
    navPortfolio: 'Portfolio',
    navServices: 'Servicios',
    navBlog: 'Journal',
    navFaq: 'Preguntas',
    navBook: 'Reservar',
    navContact: 'Contacto',
    navAdmin: 'Backoffice',
    navClientPortal: 'Área Clientes',
    heroTitle: 'LUZ, EMOCIÓN & SIMETRÍA',
    heroSubtitle: 'Fotografía artística de nivel internacional en formato medio. Preservando el lujo y la esencia de momentos trascendentes.',
    ctaPortfolio: 'Explorar Galería',
    ctaBook: 'Reservar Sesión',
    aboutTitle: 'LA FILOSOFÍA DETRÁS DE LA LENTE',
    aboutText1: 'Soy un fotógrafo y director de arte de bellas artes, dedicado a congelar el tiempo bajo el estándar de Leica y Hasselblad. Entiendo la luz no solo como iluminación, sino como el medio supremo para esculpir emociones y narrar historias silenciosas con proporciones áureas.',
    aboutText2: 'Con más de 15 años documentando bodas editoriales de alta costura, campañas comerciales internacionales y retratos íntimos para agencias de modelos de élite, mi trabajo busca un minimalismo elegante, abundante espacio en blanco y simetría geométrica.',
    awards: 'Premios & Reconocimientos',
    gear: 'El Equipo Utilizado',
    experience: 'Línea de Tiempo Artística',
    all: 'Todos',
    retrato: 'Retrato',
    boda: 'Boda',
    moda: 'Moda',
    drone: 'Drone/Paisaje',
    producto: 'Producto',
    viajes: 'Viajes',
    evento: 'Eventos',
    naturaleza: 'Naturaleza',
    compromiso: 'Compromiso',
    familia: 'Familia',
    infantil: 'Infantil',
    maternidad: 'Maternidad',
    cumpleanos: 'Cumpleaños',
    graduacion: 'Graduación',
    corporativo: 'Corporativo',
    gastronomia: 'Gastronomía',
    exifData: 'Metadatos EXIF',
    downloadPhoto: 'Descargar Master WebP',
    sharePhoto: 'Compartir Fotografía',
    servicesTitle: 'PAQUETES FOTOGRÁFICOS',
    servicesSubtitle: 'Elegí el paquete ideal para tu sesión.',
    priceFrom: 'Desde',
    includesLabel: 'Incluye',
    bookNow: 'Contratar paquete',
    categorySectionTitle: 'SERVICIOS',
    categorySectionSubtitle: 'Seleccioná el tipo de sesión que mejor se adapte a lo que necesitás.',
    backToCategories: '← Volver a tipos de sesión',
    recommended: 'Recomendado',
    testimonialsTitle: 'HISTORIAS DE CLIENTES',
    testimonialsSubtitle: 'Reseñas verificadas de bodas de alta costura y campañas globales.',
    statsTitle: 'MÉTRICAS DE EXCELENCIA',
    sessions: 'Sesiones Realizadas',
    yearsExp: 'Años de Experiencia',
    satisfied: 'Clientes Satisfechos',
    awardCount: 'Premios de Bellas Artes',
    sessionsSub: 'Editoriales, bodas y retrato de bellas artes',
    yearsExpSub: 'Leica y Hasselblad',
    satisfiedSub: 'Verificado 5 estrellas',
    faqTitle: 'PREGUNTAS FRECUENTES',
    faqSubtitle: 'Respuestas detalladas sobre nuestro flujo de trabajo, gear y entregables.',
    bookingTitle: 'AGENDA TU SESIÓN DE LUJO',
    bookingSubtitle: 'Selecciona una fecha libre y personaliza tu cotización premium en tiempo real.',
    clientName: 'Nombre Completo',
    clientEmail: 'Correo Electrónico',
    clientPhone: 'Teléfono',
    peopleCount: 'Cantidad de Personas',
    notes: 'Notas y Dirección Creativa',
    submitBooking: 'Solicitar Reserva Premium',
    contactTitle: 'DISEÑEMOS TU HISTORIA',
    contactSubtitle: 'Escríbeme para proyectos editoriales, bodas de destino o campañas de marcas de lujo.',
    sendMessage: 'Enviar Mensaje Directo',
    footerRights: 'Todos los derechos reservados.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    legal: 'Aviso Legal',
    customCursorScroll: 'SCROLL',
    customCursorView: 'VER',
    customCursorClose: 'CERRAR',
    favoriteAdded: '¡Añadido a tus favoritos!',
    favoriteRemoved: 'Eliminado de tus favoritos!',
    proofTitle: 'PORTAL PRIVADO DE CLIENTE',
    proofSubtitle: 'Acceso seguro a tu galería privada de pruebas',
    proofPassPlaceholder: 'Introduce tu código de acceso seguro (ej: SELECCION2026)',
    proofEnter: 'Acceder a mi Galería',
    proofError: 'Código de acceso incorrecto. Inténtalo de nuevo.',
    aiTitle: 'ASISTENTE DE SELECCIÓN IA',
    aiDesc: 'Nuestra red neuronal evalúa automáticamente tus fotos según nitidez, composición de regla de tercios y emoción.',
    stripePay: 'Pasarela Stripe Segura',
    compareTitle: 'Comparar Imágenes',
    compareDesc: 'Desliza para contrastar los sutiles retoques de color y corrección cromática Leica.',
    milestonesTitle: 'Una Década de Luz',
    philosophyTitle: 'Mi Enfoque',
    philosophyPillar1: 'Luz Natural',
    philosophyPillar1Desc: 'Cada sesión comienza con el estudio de la luz. Trabajo exclusivamente con luz natural y direccional para esculpir volúmenes y revelar la textura genuina de cada instante.',
    philosophyPillar2: 'Composición',
    philosophyPillar2Desc: 'La geometría y el equilibrio visual son el alma de cada imagen. Componer con intención, respetando los espacios y las proporciones, es mi forma de narrar sin palabras.',
    philosophyPillar3: 'Emoción',
    philosophyPillar3Desc: 'Más allá de la técnica, busco congelar lo que late: una mirada, un silencio, un gesto. La fotografía es emoción convertida en luz y sombra.',
    searchPlaceholder: 'Buscar fotos por etiqueta, cámara, color...'
  },
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navPortfolio: 'Portfolio',
    navServices: 'Services',
    navBlog: 'Journal',
    navFaq: 'FAQ',
    navBook: 'Book Session',
    navContact: 'Contact',
    navAdmin: 'CMS Suite',
    navClientPortal: 'Client Area',
    heroTitle: 'LIGHT, EMOTION & SYMMETRY',
    heroSubtitle: 'Medium-format fine art photography of international standards. Preserving luxury and the raw essence of profound moments.',
    ctaPortfolio: 'Explore Portfolio',
    ctaBook: 'Book Session',
    aboutTitle: 'THE PHILOSOPHY BEHIND THE GLASS',
    aboutText1: 'I am a fine art photographer and creative director dedicated to freezing time through the pristine optics of Leica and Hasselblad. I understand light not as simple exposure, but as the supreme medium to sculpt emotion and weave silent stories of golden ratio symmetry.',
    aboutText2: 'With over 15 years documenting haute-couture destination weddings, international commercial campaigns, and intimate editorial model books, my work strives for elegant minimalism, generous negative space, and absolute geometric structure.',
    awards: 'Awards & Distinctions',
    gear: 'Our Gear & Optics',
    experience: 'Artistic Timeline',
    all: 'All Works',
    retrato: 'Portrait',
    boda: 'Wedding',
    moda: 'Fashion',
    drone: 'Drone/Aerial',
    producto: 'Product',
    viajes: 'Travel',
    evento: 'Event',
    naturaleza: 'Nature',
    compromiso: 'Engagement',
    familia: 'Family',
    infantil: 'Children',
    maternidad: 'Maternity',
    cumpleanos: 'Birthday',
    graduacion: 'Graduation',
    corporativo: 'Corporate',
    gastronomia: 'Gastronomy',
    exifData: 'EXIF Metadata',
    downloadPhoto: 'Download Master WebP',
    sharePhoto: 'Share Photograph',
    servicesTitle: 'PHOTOGRAPHY PACKAGES',
    servicesSubtitle: 'Choose the ideal package for your session.',
    priceFrom: 'Starting from',
    includesLabel: 'Includes',
    bookNow: 'Book this package',
    categorySectionTitle: 'SERVICES',
    categorySectionSubtitle: 'Select the session type that best suits your needs.',
    backToCategories: '← Back to session types',
    recommended: 'Recommended',
    testimonialsTitle: 'CLIENT HISTORIES',
    testimonialsSubtitle: 'Verified reviews from high-fashion weddings and global commercial shoots.',
    statsTitle: 'METRICS OF EXCELLENCE',
    sessions: 'Completed Sessions',
    yearsExp: 'Years of Experience',
    satisfied: 'Satisfied Clients',
    awardCount: 'Fine Art Awards',
    sessionsSub: 'Editorial & weddings, fine art portraiture',
    yearsExpSub: 'Leica & Hasselblad',
    satisfiedSub: 'Verified 5-Star',
    faqTitle: 'FREQUENTLY ASKED QUESTIONS',
    faqSubtitle: 'In-depth answers detailing our production flow, gear, and deliverables.',
    bookingTitle: 'SECURE YOUR LUXURY EXPERIENCE',
    bookingSubtitle: 'Select an available date and customize your premium quote in real-time.',
    clientName: 'Full Name',
    clientEmail: 'Email Address',
    clientPhone: 'Phone Number',
    peopleCount: 'Number of Guests/Talents',
    notes: 'Creative Notes & Vision',
    submitBooking: 'Request Premium Booking',
    contactTitle: 'LET’S SHAPE YOUR STORY',
    contactSubtitle: 'Inquire for editorial projects, global destination commissions, or luxury brand campaigns.',
    sendMessage: 'Send Direct Message',
    footerRights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    legal: 'Legal Notice',
    customCursorScroll: 'SCROLL',
    customCursorView: 'VIEW',
    customCursorClose: 'CLOSE',
    favoriteAdded: 'Added to your favorites!',
    favoriteRemoved: 'Removed from your favorites!',
    proofTitle: 'SECURE CLIENT PORTAL',
    proofSubtitle: 'Secure access to your private proofing gallery',
    proofPassPlaceholder: 'Enter your secure access code (e.g., SELECCION2026)',
    proofEnter: 'Access my Gallery',
    proofError: 'Incorrect passcode. Please try again.',
    aiTitle: 'AI SELECTION ASSISTANT',
    aiDesc: 'Our custom neural model evaluates your photos based on focal sharpness, rule-of-thirds composition, and emotive scoring.',
    stripePay: 'Secure Stripe Checkout',
    compareTitle: 'Compare Masterclasses',
    compareDesc: 'Slide to compare the masterly raw file and final signature Leica color-grade edits.',
    milestonesTitle: 'A Decade of Light',
    philosophyTitle: 'My Approach',
    philosophyPillar1: 'Natural Light',
    philosophyPillar1Desc: 'Every session begins with the study of light. I work exclusively with natural and directional light to sculpt volumes and reveal the genuine texture of each moment.',
    philosophyPillar2: 'Composition',
    philosophyPillar2Desc: 'Geometry and visual balance are the soul of every image. Composing with intention, respecting space and proportion, is my way of telling stories without words.',
    philosophyPillar3: 'Emotion',
    philosophyPillar3Desc: 'Beyond technique, I seek to freeze what beats: a glance, a silence, a gesture. Photography is emotion turned into light and shadow.',
    searchPlaceholder: 'Search photos by tag, camera, color...'
  },
};

export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[] = [];

