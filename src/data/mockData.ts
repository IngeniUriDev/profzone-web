import type { Category, Business, Review } from '../types/database';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Hospitales, Clínicas y Médicos',
    icon: 'Stethoscope',
    description: 'Hospitales generales, clínicas de especialidades, pediatría, medicina familiar y urgencias'
  },
  {
    id: 'cat-2',
    name: 'Consultorios Dentales y Odontología',
    icon: 'Smile',
    description: 'Odontología integral, ortodoncia, odontopediatría, limpieza y salud bucal'
  },
  {
    id: 'cat-3',
    name: 'Cocina Económica y Tradicional',
    icon: 'Utensils',
    description: 'Comida corrida con sazón casero, barbacoa de la región y antojitos'
  },
  {
    id: 'cat-4',
    name: 'Mariachi y Música Regional',
    icon: 'Music',
    description: 'Mariachis profesionales, agrupaciones y tríos para serenatas y celebraciones'
  },
  {
    id: 'cat-5',
    name: 'Talleres y Oficios',
    icon: 'Wrench',
    description: 'Plomería, electricidad, mecánica automotriz, herrería y carpintería de confianza'
  },
  {
    id: 'cat-6',
    name: 'Belleza, Barberías y Lashistas',
    icon: 'Sparkles',
    description: 'Cortes, barberías, diseño de cejas, pestañas, uñas y estilismo profesional'
  },
  {
    id: 'cat-7',
    name: 'Psicología y Salud Mental',
    icon: 'HeartHandshake',
    description: 'Terapia infantil, juvenil, familiar y acompañamiento psicológico'
  },
  {
    id: 'cat-8',
    name: 'Servicios Legales y Asesoría',
    icon: 'Scale',
    description: 'Abogados, notarías, asesoría jurídica y trámites civiles o mercantiles'
  }
];

export const INITIAL_BUSINESSES: Business[] = [
  // --- SANTIAGO TIANGUISTENCO ---
  {
    id: 'biz-1',
    name: 'Clínica Médica y Pediátrica San Ángel',
    category_id: 'cat-1',
    municipality: 'Santiago Tianguistenco',
    locality: 'Centro',
    address: 'Av. Hidalgo #104, Centro, Santiago Tianguistenco',
    google_maps_url: 'https://maps.google.com/?q=Santiago+Tianguistenco+Centro',
    phone: '7131234567',
    whatsapp: '527131234567',
    website_url: 'https://clinicasanangel.mx',
    schedule: 'Lunes a Viernes: 8:30 AM - 7:00 PM | Sáb: 9:00 AM - 3:00 PM',
    description: 'Centro de especialidades médicas infantiles y familiares. Cuenta con médicos certificados con atención cálida y seguimiento puntual.',
    image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.9,
    rating_count: 24,
    latitude: 19.1797,
    longitude: -99.4678,
    status: 'approved',
    staff: [
      {
        id: 'st-1',
        business_id: 'biz-1',
        name: 'Dra. Mariana San Ángel',
        specialty: 'Pediatría General y Neonatología',
        license_number: 'Céd. Prof. 8472910',
        schedule: 'Lun, Mié y Vie: 9:00 AM - 2:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.95,
        rating_count: 16
      },
      {
        id: 'st-2',
        business_id: 'biz-1',
        name: 'Dr. Roberto Mendoza',
        specialty: 'Alergología y Neumología Pediátrica',
        license_number: 'Céd. Prof. 9281734',
        schedule: 'Mar y Jue: 10:00 AM - 6:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.82,
        rating_count: 8
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-2',
    name: 'Clínica Dental Tianguistenco',
    category_id: 'cat-2',
    municipality: 'Santiago Tianguistenco',
    locality: 'Barrio de Guadalupe',
    address: 'Calle Morelos #215, Barrio de Guadalupe, Santiago Tianguistenco',
    google_maps_url: 'https://maps.google.com/?q=Santiago+Tianguistenco',
    phone: '7139876543',
    whatsapp: '527139876543',
    website_url: 'https://facebook.com/dental-tianguistenco',
    schedule: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
    description: 'Atención odontológica multidisciplinaria sin dolor. Ortodoncia, endodoncia, periodoncia y prótesis dental.',
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.8,
    rating_count: 19,
    latitude: 19.1812,
    longitude: -99.4660,
    status: 'approved',
    staff: [
      {
        id: 'st-3',
        business_id: 'biz-2',
        name: 'Dra. Andrea Morales',
        specialty: 'Ortodoncia y Brackets',
        license_number: 'Céd. Prof. 7819230',
        schedule: 'Lun, Mié y Sáb: 10:00 AM - 6:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.9,
        rating_count: 11
      },
      {
        id: 'st-4',
        business_id: 'biz-2',
        name: 'Dr. Carlos Vilchis',
        specialty: 'Cirugía Bucal y Endodoncia',
        license_number: 'Céd. Prof. 6519283',
        schedule: 'Mar y Jue: 11:00 AM - 7:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.7,
        rating_count: 8
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-3',
    name: 'Cocina Doña Lupe (Sazón Casero)',
    category_id: 'cat-3',
    municipality: 'Santiago Tianguistenco',
    locality: 'Centro',
    address: 'Calle Juárez #58 (A media cuadra del mercado), Centro',
    google_maps_url: 'https://maps.google.com/?q=Santiago+Tianguistenco',
    phone: '7135551212',
    whatsapp: '527135551212',
    schedule: 'Lunes a Domingo: 8:00 AM - 5:00 PM',
    description: 'Comida corrida con sopa, arroz o frijoles, guisado del día a elegir y tortillas hechas a mano al comal.',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.7,
    rating_count: 32,
    latitude: 19.1785,
    longitude: -99.4690,
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-4',
    name: 'Mariachi Águilas del Valle',
    category_id: 'cat-4',
    municipality: 'Santiago Tianguistenco',
    locality: 'Tianguistenco / Cobertura Regional',
    address: 'Servicio a domicilio en Tianguistenco, Capulhuac y Xalatlaco',
    google_maps_url: 'https://maps.google.com/?q=Santiago+Tianguistenco',
    phone: '7137778899',
    whatsapp: '527137778899',
    schedule: 'Atención y contrataciones telefónicas 24/7',
    description: 'Amplio repertorio tradicional y contemporáneo. Trajes de gala impecables, puntualidad y sonido profesional.',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    rating_avg: 5.0,
    rating_count: 15,
    latitude: 19.1820,
    longitude: -99.4670,
    status: 'approved',
    created_at: new Date().toISOString()
  },

  // --- CAPULHUAC ---
  {
    id: 'biz-cap-1',
    name: 'Centro Pediátrico Infantil Capulhuac',
    category_id: 'cat-1',
    municipality: 'Capulhuac',
    locality: 'Centro',
    address: 'Calle 16 de Septiembre #45, Col. Centro, Capulhuac',
    google_maps_url: 'https://maps.google.com/?q=Capulhuac+Centro',
    phone: '7132221100',
    whatsapp: '527132221100',
    schedule: 'Lunes a Viernes: 10:00 AM - 7:00 PM | Sábado: 9:00 AM - 3:00 PM',
    description: 'Atención pediátrica integral con doctores especializados en recién nacidos, nutrición y alergias infantiles.',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.95,
    rating_count: 18,
    latitude: 19.1969,
    longitude: -99.4664,
    status: 'approved',
    staff: [
      {
        id: 'st-5',
        business_id: 'biz-cap-1',
        name: 'Dra. Patricia Albarrán',
        specialty: 'Pediatría y Nutrición Infantil',
        license_number: 'Céd. Prof. 8192031',
        schedule: 'Lunes a Viernes: 10:00 AM - 4:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.95,
        rating_count: 18
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-cap-2',
    name: 'Barbacoa Tradicional Don Chuy',
    category_id: 'cat-3',
    municipality: 'Capulhuac',
    locality: 'San Miguel',
    address: 'Av. del Trabajo #88, Capulhuac',
    google_maps_url: 'https://maps.google.com/?q=Capulhuac+Centro',
    phone: '7133332211',
    whatsapp: '527133332211',
    schedule: 'Sábados y Domingos: 7:30 AM - 4:00 PM',
    description: 'La auténtica y afamada barbacoa de hoyo de Capulhuac con consomé caliente y tortillas de maíz azul.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.88,
    rating_count: 45,
    latitude: 19.1990,
    longitude: -99.4640,
    status: 'approved',
    created_at: new Date().toISOString()
  },

  // --- OCOYOACAC ---
  {
    id: 'biz-oco-1',
    name: 'Hospital y Especialidades Médicas Los Encinos',
    category_id: 'cat-1',
    municipality: 'Ocoyoacac',
    locality: 'Barrio Santa María',
    address: 'Carretera México-Toluca Km 44, Ocoyoacac',
    google_maps_url: 'https://maps.google.com/?q=Ocoyoacac',
    phone: '7281112233',
    whatsapp: '527281112233',
    schedule: 'Urgencias 24 Horas | Consultas: 8:00 AM - 8:00 PM',
    description: 'Hospital privado regional con áreas de pediatría, medicina interna, traumatología y quirófano.',
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.91,
    rating_count: 27,
    latitude: 19.2731,
    longitude: -99.4628,
    status: 'approved',
    staff: [
      {
        id: 'st-6',
        business_id: 'biz-oco-1',
        name: 'Dr. Luis Fernando Ramos',
        specialty: 'Pediatría y Urgencias Médicas',
        license_number: 'Céd. Prof. 9102834',
        schedule: 'Turno Matutino: 8:00 AM - 3:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.94,
        rating_count: 15
      },
      {
        id: 'st-7',
        business_id: 'biz-oco-1',
        name: 'Dra. Sofía Galindo',
        specialty: 'Ginecología y Obstetricia',
        license_number: 'Céd. Prof. 7619284',
        schedule: 'Lunes a Sábado: 11:00 AM - 6:00 PM',
        avatar_url: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&w=200&q=80',
        rating_avg: 4.88,
        rating_count: 12
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    business_id: 'biz-1',
    staff_id: 'st-1',
    staff_name: 'Dra. Mariana San Ángel (Pediatría)',
    user_name: 'María Carmen González',
    user_provider: 'facebook',
    rating: 5,
    comment: 'La Dra. Mariana atendió a mi hijo con un cuidado excepcional. Muy acertada con el tratamiento y sumamente empática.',
    created_at: '2026-03-15T10:30:00Z'
  },
  {
    id: 'rev-2',
    business_id: 'biz-1',
    staff_id: 'st-2',
    staff_name: 'Dr. Roberto Mendoza (Neumología)',
    user_name: 'Roberto Valdés',
    user_provider: 'phone',
    rating: 5,
    comment: 'Excelente especialista. Controló el asma de mi sobrino y nos explicó detalladamente los pasos a seguir.',
    created_at: '2026-03-20T16:15:00Z'
  },
  {
    id: 'rev-cap-1',
    business_id: 'biz-cap-1',
    staff_id: 'st-5',
    staff_name: 'Dra. Patricia Albarrán (Pediatría)',
    user_name: 'Claudia Estrada',
    user_provider: 'facebook',
    rating: 5,
    comment: 'La mejor pediatra de Capulhuac. Instalaciones impecables y seguimiento puntual de vacunas.',
    created_at: '2026-03-18T11:20:00Z'
  },
  {
    id: 'rev-oco-1',
    business_id: 'biz-oco-1',
    staff_id: 'st-6',
    staff_name: 'Dr. Luis Fernando Ramos (Pediatría Urgencias)',
    user_name: 'Laura Sánchez',
    user_provider: 'phone',
    rating: 5,
    comment: 'Atendió de emergencia a mi bebé en Ocoyoacac, muy profesional y con una calidez humana que tranquiliza a cualquiera.',
    created_at: '2026-03-24T17:15:00Z'
  }
];
