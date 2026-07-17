/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Photograph, Service, Testimonial, BlogPost, FAQ, Booking, Message, SEOMetadata, AnalyticsStats, PhotographerProfile, BookingConfig, EmailConfig, ClientAccount, CommissionedServicesConfig } from '../types';

// Curated selection of ultra-high-resolution Unsplash photography matching Leica, Hasselblad tones
export const INITIAL_PHOTOGRAPHS: Photograph[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=90&w=1200',
    title: 'Ethereal Solitude',
    category: 'retrato',
    description: 'A study of light and character, highlighting the organic texture and emotional depth captured under soft North-light direction.',
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
    category: 'boda',
    description: 'An intimate sunset frame on the cliffs of Amalfi, reflecting the raw tenderness and premium atmosphere of high-fashion weddings.',
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
    category: 'moda',
    description: 'High-contrast avant-garde editorial in Madrid’s brutalist structures, focusing on dynamic drape mechanics and stark shadows.',
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
    category: 'drone',
    description: 'Orthogonal aerial capture of coastal formations in Portugal, capturing the abstract balance between ocean textures and golden shore cliffs.',
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
    category: 'producto',
    description: 'Commercial studio macro layout for an ultra-luxury watch, celebrating brushed titanium textures and intricate hand-finished movements.',
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
    category: 'viajes',
    description: 'A quiet dawn overlooking the iconic tiered pastel architectures of Positano, cloaked in mist and golden reflection.',
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
    category: 'evento',
    description: 'Candid photo of a prestigious gala at Palais Garnier. Masterclass in low-light ambience, high dynamic range preservation, and architectural framing.',
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
    category: 'naturaleza',
    description: 'First rays of morning light breaking through a dense cedar canopy in Yakushima, casting dramatic light shafts into primeval moss meadows.',
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
    title_pt: 'Casamentos Editoriais de Luxo',
    description_pt: 'Cobertura cinematográfica, intemporal e estilo documental do dia do seu casamento. Desenvolvido para casais que procuram composições de alta-costura e a preservação artística de momentos sagrados.',
    duration_pt: '10 Horas de Cobertura',
    includes_pt: [
      'Consulta pré-casamento e exploração de locais',
      'Configuração de câmara dupla Leica/Hasselblad',
      'Arquivo web premium de seleção de clientes',
      'Mais de 750 imagens WebP personalizadas de alta resolução totalmente processadas',
      'Álbum de fotos artístico encadada à mão em couro premium (40 páginas)',
      'Licença digital para distribuição pessoal e de imprensa'
    ]
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
    title_pt: 'Moda e Retrato de Alta Gama',
    description_pt: 'Imagens editoriais marcantes concebidas para agências de modelos, marcas de luxo e indivíduos que procuram impressões artísticas pessoais com qualidade de museu.',
    duration_pt: 'Sessão de 4 Horas',
    includes_pt: [
      'Sessão em estúdio ou localização conceptualizada',
      'Direção criativa e assessoria de estilo personalizada',
      '25 ficheiros digitais master completamente otimizados com retoque de pele premium',
      'Acesso total à biblioteca de fotos RAW através do painel de clientes',
      'Uma impressão de qualidade de museu em algodão de formato 24x36"',
      'Opção de licença de uso comercial disponível'
    ]
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
    title_pt: 'Arquitetura e Imóveis de Luxo',
    description_pt: 'Simetria perfeita, iluminação artificial e natural equilibrada, e perspetivas aéreas que realçam espaços residenciais ou comerciais de alta gama.',
    duration_pt: 'Sessão de 6 Horas',
    includes_pt: [
      'Enquadramento completo de interiores e exteriores',
      'Configuração de perspetiva dupla: interior ultra grande angular e drone de alta altitude',
      'Revelação de cor profissional e substituições de céu HDR',
      '35 ficheiros editoriais de alta resolução de interiores',
      'Licença comercial completa para anúncios digitais, impressos e outdoors'
    ]
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
    title_pt: 'Campanhas de Produtos Comerciais',
    description_pt: 'Sessões de estúdio macro focadas em materiais requintados, design de engenharia detalhado e iluminação de autor. Feito sob medida para relojoeiros premium, joalharia fina e bebidas exclusivas.',
    duration_pt: 'Tarifa Diária (8 Horas)',
    includes_pt: [
      'Configuração de iluminação de estúdio macro dedicada',
      'Estilo de produto e preparação livre de pó',
      'Captura de resolução ultra-alta de 100MP com Hasselblad',
      'Pós-processamento profissional com empilhamento de foco (focus-stacking)',
      'Direitos de uso publicitário completo e distribuição global de imprensa'
    ]
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
    question_pt: 'Que câmeras e lentes utiliza para as suas sessões?',
    answer_pt: 'Trabalho principalmente com o sistema de formato médio Hasselblad X2D 100C para obter o máximo detalhe e uma reprodução de tons de pele inigualável. Para projetos de rua ou editoriais espontâneos, confio nas icónicas Leica SL3 e Leica M11, combinadas com as lendárias lentes fixas Summilux-M.',
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
    question_pt: 'Viaja internacionalmente para casamentos de destino e sessões?',
    answer_pt: 'Absolutamente. Estou baseada na Europa, mas fotografo casamentos de destino e campanhas de moda em todo o mundo. Viagens, alojamento e coordenação de vistos são geridos diretamente pela minha gestora de estúdio, e um pacote de despesas de viagem personalizado de tarifa fixa será anexado à sua proposta.',
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
    question_pt: 'Quanto tempo demora a receber a galeria finalizada?',
    answer_pt: 'Uma seleção exclusiva de pré-visualização de 15 a 20 imagens editadas à mão é enviada para o seu Portal de Cliente dentro de 72 horas. O catálogo master completo, processado em alta resolução e com a nossa assinatura cromática, será entregue num prazo de 4 a 6 semanas.',
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
    question_pt: 'Os arquivos RAW não editados estão incluídos nos seus pacotes?',
    answer_pt: 'Orgulho-me de entregar obras de arte polidas e finalizadas com a nossa assinatura visual. Portanto, os ficheiros RAW não editados nunca são entregues ao cliente final. No entanto, é fornecido acesso total para visualizar e rever todo o catálogo de provas dentro do Portal do Cliente para que possa selecionar as suas capturas favoritas para o retoque final.',
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
    question_pt: 'Como funciona o processo de reserva e pagamento seguro?',
    answer_pt: 'Para reservar uma data exclusiva, solicitamos um depósito de reserva de 30% pago de forma segura através da Stripe usando cartões de crédito/débito ou carteiras digitais. Os restantes 70% são pagos uma semana antes da data da sessão ou no próprio dia da sessão antes de começar.',
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
    question_pt: 'Oferece impressões de belas artes e álbuns feitos à mão?',
    answer_pt: 'Sim, colaboramos com os melhores laboratórios de impressão de belas artes em Itália e na Alemanha para produzir impressões de qualidade de museu em papel de algodão de arquivo 100% isento de ácido. Os nossos álbuns de fotos de luxo são encadernados à mão com couro de grão fino ou linho premium, concebidos para durar gerações.',
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
    question_pt: 'O que acontece se o clima for desfavorável para uma sessão ao ar livre?',
    answer_pt: 'Compreendemos que as condições climatéricas são imprevisíveis. Se houver previsão de chuva forte ou tempestades que impossibilitem a sessão, reagendaremos a sessão sem custos adicionais para a próxima data mutuamente disponível. Em caso de céu ligeiramente nublado, muitas vezes continuamos, pois as nuvens funcionam como um difusor de luz natural impecável.',
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
    question_pt: 'Podemos solicitar orientação criativa e ajuda com o estilo?',
    answer_pt: 'Absolutamente. Todas as comissões artísticas e de moda incluem uma consulta de direção criativa dedicada de 1 hora antes da sessão. Desenvolvemos um guia de estilo personalizado e um painel de inspiração (moodboard) visual conjunto para coordenar as paletas de cores do vestuário, localizações e ambiente de iluminação para que se alinhem perfeitamente com os padrões de formato médio.',
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
  robotsText: 'User-agent: *\nAllow: /\nSitemap: https://miriamcampos-photography.com/sitemap.xml'
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
  aboutTitle_pt: 'A FILOSOFIA POR TRÁS DA LENTE',
  aboutText1_es: 'Soy Miriam Campos, fotógrafa y directora de arte de bellas artes, dedicada a congelar el tiempo bajo el estándar de Leica y Hasselblad. Entiendo la luz no solo como iluminación, sino como el medio supremo para esculpir emociones y narrar historias silenciosas con proporciones áureas.',
  aboutText2_es: 'Con más de 15 años documentando bodas editoriales de alta costura, campañas comerciales internacionales y retratos íntimos para agencias de modelos de élite, mi trabajo busca un minimalismo elegante, abundante espacio en blanco y simetría geométrica.',
  aboutText1_en: 'I am Miriam Campos, a fine art photographer and creative director dedicated to freezing time through the pristine optics of Leica and Hasselblad. I understand light not as simple exposure, but as the supreme medium to sculpt emotion and weave silent stories of golden ratio symmetry.',
  aboutText2_en: 'With over 15 years documenting haute-couture destination weddings, international commercial campaigns, and intimate editorial model books, my work strives for elegant minimalism, generous negative space, and absolute geometric structure.',
  aboutText1_pt: 'Sou Miriam Campos, fotógrafa de belas artes e diretora de arte, dedicada a eternizar o tempo sob o padrão Leica e Hasselblad. Compreendo a luz não como mera iluminação, mas como a ferramenta suprema para esculpir sentimentos e desenhar geometrias douradas.',
  aboutText2_pt: 'Com mais de 15 anos documentando casamentos de alta-costura, campanhas publicitárias mundiais e ensaios de moda, o meu trabalho foca no minimalismo luxuoso, espaço em branco e equilíbrio visual absoluto.'
};

export const INITIAL_COMMISSIONED_CONFIG: CommissionedServicesConfig = {
  sectionTitle_es: 'SERVICIOS COMISIONADOS',
  sectionTitle_en: 'COMMISSIONED SERVICES',
  sectionTitle_pt: 'SERVIÇOS COMISSIONADOS',
  sectionSubtitle_es: 'BODAS DESTINO, RETRATOS DE ARTE FINO Y CAMPAÑAS COMERCIALES',
  sectionSubtitle_en: 'DESTINATION WEDDINGS, FINE ART PORTRAITS AND COMMERCIAL CAMPAIGNS',
  sectionSubtitle_pt: 'CASAMENTOS DESTINO, RETRATOS DE BELAS ARTES E CAMPANHAS COMERCIAIS',
  addons: [
    { id: 'drone', name_es: 'Cinematografía con Drone', name_en: 'Drone Cinematography', name_pt: 'Cinematografia com Drone', price: 450, enabled: true },
    { id: 'express', name_es: 'Entrega Exprés (48h)', name_en: 'Express Delivery (48h)', name_pt: 'Entrega Expressa (48h)', price: 300, enabled: true },
    { id: 'makeup', name_es: 'Maquillaje y Estilismo Profesional', name_en: 'Professional Makeup & Styling', name_pt: 'Maquiagem e Styling Profissional', price: 250, enabled: true },
  ],
  customServiceLabel_es: 'Sesión Personalizada / Otro Proyecto',
  customServiceLabel_en: 'Custom Session / Other Project',
  customServiceLabel_pt: 'Sessão Personalizada / Outro Projeto',
};

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
    exifData: 'Metadatos EXIF',
    downloadPhoto: 'Descargar Master WebP',
    sharePhoto: 'Compartir Fotografía',
    servicesTitle: 'SERVICIOS COMISIONADOS',
    servicesSubtitle: 'Tarifas y paquetes artesanales diseñados para la máxima exigencia visual.',
    priceFrom: 'Desde',
    includesLabel: 'Qué Incluye',
    bookNow: 'Contratar Servicio',
    testimonialsTitle: 'HISTORIAS DE CLIENTES',
    testimonialsSubtitle: 'Reseñas verificadas de bodas de alta costura y campañas globales.',
    statsTitle: 'MÉTRICAS DE EXCELENCIA',
    sessions: 'Sesiones Realizadas',
    yearsExp: 'Años de Experiencia',
    satisfied: 'Clientes Satisfechos',
    awardCount: 'Premios de Bellas Artes',
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
    proofPassPlaceholder: 'Introduce tu código de acceso seguro (ej: SELECCION2026)',
    proofEnter: 'Acceder a mi Galería',
    proofError: 'Código de acceso incorrecto. Inténtalo de nuevo.',
    aiTitle: 'ASISTENTE DE SELECCIÓN IA',
    aiDesc: 'Nuestra red neuronal evalúa automáticamente tus fotos según nitidez, composición de regla de tercios y emoción.',
    stripePay: 'Pasarela Stripe Segura',
    compareTitle: 'Comparar Imágenes',
    compareDesc: 'Desliza para contrastar los sutiles retoques de color y corrección cromática Leica.',
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
    exifData: 'EXIF Metadata',
    downloadPhoto: 'Download Master WebP',
    sharePhoto: 'Share Photograph',
    servicesTitle: 'COMMISSIONED SERVICES',
    servicesSubtitle: 'Artisan packages and pricing custom-tailored for maximum visual standards.',
    priceFrom: 'Starting from',
    includesLabel: 'What is Included',
    bookNow: 'Book This Package',
    testimonialsTitle: 'CLIENT HISTORIES',
    testimonialsSubtitle: 'Verified reviews from high-fashion weddings and global commercial shoots.',
    statsTitle: 'METRICS OF EXCELLENCE',
    sessions: 'Completed Sessions',
    yearsExp: 'Years of Experience',
    satisfied: 'Satisfied Clients',
    awardCount: 'Fine Art Awards',
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
    proofPassPlaceholder: 'Enter your secure access code (e.g., SELECCION2026)',
    proofEnter: 'Access my Gallery',
    proofError: 'Incorrect passcode. Please try again.',
    aiTitle: 'AI SELECTION ASSISTANT',
    aiDesc: 'Our custom neural model evaluates your photos based on focal sharpness, rule-of-thirds composition, and emotive scoring.',
    stripePay: 'Secure Stripe Checkout',
    compareTitle: 'Compare Masterclasses',
    compareDesc: 'Slide to compare the masterly raw file and final signature Leica color-grade edits.',
    searchPlaceholder: 'Search photos by tag, camera, color...'
  },
  pt: {
    navHome: 'Início',
    navAbout: 'Sobre Mim',
    navPortfolio: 'Portfolio',
    navServices: 'Serviços',
    navBlog: 'Journal',
    navFaq: 'Dúvidas',
    navBook: 'Reservar',
    navContact: 'Contacto',
    navAdmin: 'Painel CMS',
    navClientPortal: 'Área Cliente',
    heroTitle: 'LUZ, EMOÇÃO & SIMETRIA',
    heroSubtitle: 'Fotografia artística de formato médio sob os mais elevados padrões internacionais. Preservando o luxo de instantes profundos.',
    ctaPortfolio: 'Explorar Portfolio',
    ctaBook: 'Reservar Sessão',
    aboutTitle: 'A FILOSOFIA POR TRÁS DA LENTE',
    aboutText1: 'Sou fotógrafo de belas artes e diretor de arte, dedicado a eternizar o tempo sob o padrão Leica e Hasselblad. Compreendo a luz não como mera iluminação, mas como a ferramenta suprema para esculpir sentimentos e desenhar geometrias douradas.',
    aboutText2: 'Com mais de 15 anos documentando casamentos de alta-costura, campanhas publicitárias mundiais e ensaios de moda, o meu trabalho foca no minimalismo luxuoso, espaço em branco e equilíbrio visual absoluto.',
    awards: 'Prémios & Honrarias',
    gear: 'Equipamento Utilizado',
    experience: 'Linha do Tempo Artística',
    all: 'Todas as Obras',
    retrato: 'Retrato',
    boda: 'Casamento',
    moda: 'Moda',
    drone: 'Drone/Aéreo',
    producto: 'Produto',
    viajes: 'Viagem',
    evento: 'Eventos',
    naturaleza: 'Natureza',
    exifData: 'Metadados EXIF',
    downloadPhoto: 'Descarregar Master WebP',
    sharePhoto: 'Partilhar Fotografia',
    servicesTitle: 'SERVIÇOS COMISSIONADOS',
    servicesSubtitle: 'Planos e pacotes artesanais desenhados para marcas e casais exigentes.',
    priceFrom: 'A partir de',
    includesLabel: 'O que Inclui',
    bookNow: 'Contratar Serviço',
    testimonialsTitle: 'HISTÓRIAS DE CLIENTES',
    testimonialsSubtitle: 'Depoimentos certificados de casamentos reais e campanhas editoriais.',
    statsTitle: 'MÉTRICAS DE EXCELÊNCIA',
    sessions: 'Sessões Completas',
    yearsExp: 'Anos de Experiência',
    satisfied: 'Clientes Satisfeitos',
    awardCount: 'Prémios de Belas Artes',
    faqTitle: 'PERGUNTAS FREQUENTES',
    faqSubtitle: 'Respostas claras sobre os nossos fluxos de trabalho, equipamentos e entregas.',
    bookingTitle: 'AGENDE A SUA EXPERIÊNCIA DE LUXO',
    bookingSubtitle: 'Escolha um dia livre e customize o seu orçamento premium em tempo real.',
    clientName: 'Nome Completo',
    clientEmail: 'Endereço de E-mail',
    clientPhone: 'Número de Telefone',
    peopleCount: 'Número de Convidados',
    notes: 'Notas de Direção Criativa',
    submitBooking: 'Solicitar Reserva Premium',
    contactTitle: 'VAMOS CRIAR JUNTOS',
    contactSubtitle: 'Entre em contacto para casamentos de destino, editoriais de moda ou campanhas premium.',
    sendMessage: 'Enviar Mensagem Direta',
    footerRights: 'Todos os direitos reservados.',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',
    legal: 'Aviso Legal',
    customCursorScroll: 'RODE',
    customCursorView: 'VER',
    customCursorClose: 'FECHAR',
    favoriteAdded: 'Adicionado aos favoritos!',
    favoriteRemoved: 'Removido dos favoritos!',
    proofTitle: 'PORTAL PRIVADO DE CLIENTE',
    proofPassPlaceholder: 'Insira o seu código de acesso seguro (ex: SELECCION2026)',
    proofEnter: 'Aceder à Galeria',
    proofError: 'Código incorreto. Por favor tente novamente.',
    aiTitle: 'ASSISTENTE DE SELEÇÃO IA',
    aiDesc: 'O nosso modelo neural analisa automaticamente as suas fotos por foco, composição e índice emotivo.',
    stripePay: 'Pagamento Seguro Stripe',
    compareTitle: 'Comparar Edições',
    compareDesc: 'Deslize para ver a diferença entre o ficheiro RAW e a revelação cromática Leica.',
    searchPlaceholder: 'Procurar fotos por tag, câmara, cor...'
  }
};

export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[] = [];

