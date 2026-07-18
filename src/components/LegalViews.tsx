import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, ArrowLeft, Calendar, HelpCircle, CheckCircle } from 'lucide-react';
import { ActiveLanguage } from '../types';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  lang: ActiveLanguage;
  onBack: () => void;
}

export default function LegalViews({ type, lang, onBack }: LegalViewProps) {
  const isEs = lang === 'es';

  const content = {
    privacy: {
      title: isEs ? 'Política de Privacidad' : 'Privacy Policy',
      subtitle: isEs 
        ? 'Estándares de confidencialidad y protección de datos de Miriam Campos Studio.' 
        : 'Confidentiality and data protection standards of Miriam Campos Studio.',
      lastUpdated: isEs ? 'Última actualización: 13 de Julio, 2026' : 'Last updated: July 13, 2026',
      sections: isEs ? [
        {
          title: '1. Compromiso con la Confidencialidad',
          text: 'En Miriam Campos Studio, entendemos que las fotografías no son solo imágenes, sino recuerdos preciados e invaluables activos artísticos. Nos comprometemos solemnemente a proteger la privacidad de cada sesión, asegurando que sus retratos, bodas y campañas comerciales sean tratados con la máxima discreción y seguridad.'
        },
        {
          title: '2. Información que Recopilamos',
          text: 'Solo recopilamos los datos necesarios para brindar una experiencia de lujo altamente personalizada: nombre completo, dirección de correo electrónico, número de teléfono, detalles del evento/sesión, briefing creativo y, para el Portal de Clientes, un código de acceso único generado de forma segura.'
        },
        {
          title: '3. Pasarela de Pago Segura (Stripe)',
          text: 'Todas las transacciones financieras y depósitos de reserva se procesan a través de la infraestructura segura de extremo a extremo de Stripe. El estudio nunca almacena ni tiene acceso directo a los datos de su tarjeta de crédito o débito, cumpliendo estrictamente con las normas PCI-DSS.'
        },
        {
          title: '4. Protección de la Galería Privada',
          text: 'Las fotografías de prueba se alojan en servidores seguros de Firebase con estrictas reglas de seguridad. El acceso a su portal privado está restringido al código único proporcionado. Las imágenes nunca se utilizarán en el portafolio público, redes sociales o medios impresos sin su consentimiento explícito por escrito.'
        },
        {
          title: '5. Política de Conservación de Archivos',
          text: 'Mantenemos sus galerías de prueba activas durante 12 meses después de la sesión para permitir descargas y solicitudes adicionales de retoque. Después de este período, las imágenes se archivan de forma segura en almacenamiento externo fuera de línea por hasta 3 años.'
        },
        {
          title: '6. Sus Derechos de Control',
          text: 'Usted conserva el control total sobre su información. Puede solicitar en cualquier momento la eliminación permanente de su cuenta de cliente, la cancelación de la suscripción a nuestro boletín o la eliminación completa de sus archivos de nuestros servidores.'
        }
      ] : [
        {
          title: '1. Commitment to Confidentiality',
          text: 'At Miriam Campos Studio, we understand that captured photographs are not just images, but cherished memories and invaluable artistic assets. We solemnly commit to protecting the privacy of every session, ensuring that your portraits, weddings, and commercial campaigns are treated with the utmost discretion and security.'
        },
        {
          title: '2. Information We Collect',
          text: 'We collect only the data necessary to provide a highly personalized luxury experience: full name, email address, phone number, event/session details, creative brief, and, for the Client Portal, a securely generated unique access code.'
        },
        {
          title: '3. Secure Payment Gateways (Stripe)',
          text: 'All financial transactions and booking deposits are processed through Stripe\'s secure end-to-end infrastructure. The studio never stores or has direct access to your credit or debit card details, adhering strictly to PCI-DSS rules.'
        },
        {
          title: '4. Private Gallery Protection',
          text: 'Proofing photographs are hosted on secure Firebase cloud servers with strict security rules. Access to your private portal is restricted to the unique code provided. Images will never be used in the public portfolio, social networks, or print media without your explicit written consent.'
        },
        {
          title: '5. File Retention Policy',
          text: 'We keep your proofing galleries active for 12 months after the session to allow for downloads and additional retouching requests. After this period, images are archived securely in offline cold storage for up to 3 years as a courtesy for disaster recovery.'
        },
        {
          title: '6. Your Rights of Control',
          text: 'You retain full control over your information. You may request at any time the permanent deletion of your client account, unsubscription from our newsletter, or the complete removal of your files from our servers by emailing our support desk directly.'
        }
      ]
    },
    terms: {
      title: isEs ? 'Términos de Servicio' : 'Terms of Service',
      subtitle: isEs 
        ? 'Acuerdo legal para la contratación de servicios de bellas artes de Miriam Campos.' 
        : 'Legal agreement for commissioning fine art photography services by Miriam Campos.',
      lastUpdated: isEs ? 'Última actualización: 13 de Julio, 2026' : 'Last updated: July 13, 2026',
      sections: isEs ? [
        {
          title: '1. Tarifas y Depósito de Reserva',
          text: 'Para asegurar una fecha de sesión exclusiva en el calendario del estudio, se requiere un depósito no reembolsable del 30% del precio total del paquete a través de nuestra pasarela de pago segura (Stripe). Este depósito bloquea la disponibilidad del artista y cancela otras comisiones potenciales.'
        },
        {
          title: '2. Cancelación y Reprogramación',
          text: 'Las solicitudes de reprogramación deben realizarse con al menos 14 días de antelación para bodas de destino y 5 días para sesiones editoriales individuales. En caso de fuerza mayor o condiciones climáticas adversas, el estudio acordará una fecha alternativa mutuamente conveniente sin costo adicional.'
        },
        {
          title: '3. Derechos de Autor y Licencia de Uso',
          text: 'Miriam Campos conserva todos los derechos morales y de propiedad intelectual sobre todas las fotografías. Al recibir la galería final, los clientes reciben una licencia indefinida para uso personal, impresión privada y uso en redes sociales. Para campañas comerciales, se firmará un contrato de licencia específico.'
        },
        {
          title: '4. Estilo Artístico y Postprocesado',
          text: 'Al contratar el estudio, usted reconoce que las fotografías se capturan y editan bajo la firma artística y los criterios cromáticos de Miriam Campos. Los archivos RAW son etapas intermedias de producción creativa y no se entregan al cliente final, garantizando solo obras maestras bellamente terminadas.'
        },
        {
          title: '5. Plazos de Entrega Premium',
          text: 'El estudio opera bajo un estricto estándar profesional: un adelanto exclusivo de 15 a 20 imágenes editadas a mano se sube a su Portal Privado dentro de las 72 horas posteriores a su sesión. El catálogo final completo se entrega en un plazo garantizado de 4 a 6 semanas.'
        },
        {
          title: '6. Limitación de Responsabilidad',
          text: 'En el caso altamente improbable de fallo del equipo fotográfico, pérdida accidental de medios digitales o emergencias médicas repentinas que impidan al fotógrafo ejecutar la comisión, la responsabilidad del estudio se limita estrictamente al reembolso inmediato de todos los pagos realizados por el cliente.'
        }
      ] : [
        {
          title: '1. Rates & Booking Deposit',
          text: 'To secure an exclusive session date in the studio calendar, a 30% non-refundable retainer of the total package price is required via our secure checkout gateway (Stripe). This deposit blocks the availability of the artist and cancels other potential commissions.'
        },
        {
          title: '2. Cancellation & Rescheduling',
          text: 'Rescheduling requests must be made at least 14 days in advance for destination weddings, and 5 days for individual editorial sessions. In the event of force majeure or severe weather conditions that prevent the required natural light photography, the studio will arrange a mutually convenient alternative date at no extra charge.'
        },
        {
          title: '3. Copyright & Usage License',
          text: 'Miriam Campos retains full moral rights and intellectual property copyright over all photographs. Upon delivery of the final gallery, clients are granted an indefinite license for personal use, private printing, and social media sharing. For commercial brand campaigns or editorial press syndication, a specific licensing contract will be signed.'
        },
        {
          title: '4. Artistic Style & Post-Processing',
          text: 'By booking the studio, you acknowledge and agree that the photographs are captured and edited under the firm artistic signature and color criteria of Miriam Campos. Raw files (RAW) are intermediate stages of creative production and are not delivered to the final client, ensuring only beautifully finished and high-resolution masterpieces are delivered.'
        },
        {
          title: '5. Premium Delivery Times',
          text: 'The studio operates under a strict professional standard: an exclusive hand-edited teaser of 15 to 20 images is uploaded to your Private Portal within 72 hours of your shoot. The final completed high-resolution color-graded catalog is delivered within a guaranteed 4 to 6 weeks.'
        },
        {
          title: '6. Limitation of Liability',
          text: 'In the highly unlikely event of camera equipment failure, accidental loss of digital media, or sudden medical emergencies preventing the photographer from executing the commission, the studio\'s liability is limited strictly to the immediate refund of all retainers and sums paid by the client.'
        }
      ]
    }
  };

  const activeContent = content[type];

  return (
    <div className="space-y-10 max-w-4xl mx-auto text-left">
      {/* Back Button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[10px] font-mono uppercase text-gold-400 hover:text-gold-300 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </button>
          
          <div className="flex items-center space-x-3.5 mt-2">
            <div className="p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
              {type === 'privacy' ? <Shield size={24} /> : <FileText size={24} />}
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-white tracking-wide">
                {activeContent.title}
              </h1>
              <p className="text-[10px] font-mono text-gold-300 uppercase tracking-widest mt-0.5">
                {activeContent.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Description */}
      <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
        <p className="text-xs md:text-sm text-white/90 leading-relaxed font-sans italic">
          "{activeContent.subtitle}"
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeContent.sections.map((section, idx) => (
          <div 
            key={idx}
            className="bg-dark-gray border border-white/5 rounded-2xl p-6 space-y-3 hover:border-gold-500/15 transition-all flex flex-col justify-start"
          >
            <h3 className="font-serif text-lg text-gold-300 font-semibold border-b border-white/5 pb-2">
              {section.title}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans mt-1 flex-1">
              {section.text}
            </p>
          </div>
        ))}
      </div>

      {/* Decorative footer certification stamp */}
      <div className="flex flex-col items-center justify-center pt-8 border-t border-white/5 space-y-3">
        <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] font-mono uppercase tracking-widest bg-gold-400/5 px-4 py-2 border border-gold-400/20 rounded-full">
          <CheckCircle size={12} />
          <span>{isEs ? 'Estudio Certificado Internacional' : 'International Studio Certified'}</span>
        </div>
        <p className="text-[10px] text-white/40 font-sans max-w-sm text-center leading-normal">
          {isEs 
            ? 'Para consultas adicionales relativas a nuestros estatutos legales o acuerdos especiales de licencia, póngase en contacto directo con nuestro despacho.'
            : 'For additional questions regarding our legal statutes or custom commercial licensing terms, please contact our administrative desk directly.'
          }
        </p>
      </div>
    </div>
  );
}
