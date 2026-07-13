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
  const isPt = lang === 'pt';

  const content = {
    privacy: {
      title: isEs ? 'Política de Privacidad' : isPt ? 'Política de Privacidade' : 'Privacy Policy',
      subtitle: isEs 
        ? 'Estándares de confidencialidad y protección de datos de Miriam Campos Studio.' 
        : isPt 
        ? 'Padrões de confidencialidade e proteção de dados do Miriam Campos Studio.' 
        : 'Confidentiality and data protection standards of Miriam Campos Studio.',
      lastUpdated: isEs ? 'Última actualización: 13 de Julio, 2026' : isPt ? 'Última atualização: 13 de Julho, 2026' : 'Last updated: July 13, 2026',
      sections: isEs ? [
        {
          title: '1. Compromiso de Confidencialidad',
          text: 'En Miriam Campos Studio, entendemos que las fotografías capturadas no son meras imágenes, sino memorias preciadas y activos artísticos de gran valor. Nos comprometemos solemnemente a proteger la privacidad de cada sesión, garantizando que sus retratos, bodas y campañas comerciales se traten con la máxima discreción y seguridad.'
        },
        {
          title: '2. Información que Recopilamos',
          text: 'Recopilamos únicamente los datos necesarios para brindar una experiencia de lujo altamente personalizada: nombre, dirección de correo electrónico, número de teléfono, detalles de su evento/sesión, dirección creativa de la sesión y, en el caso del Portal de Clientes, un código de acceso único (ej: SELECCION2026) generado de forma segura.'
        },
        {
          title: '3. Pasarelas de Pago Seguras (Stripe)',
          text: 'Todas las transacciones financieras y adelantos de reserva se procesan a través de la infraestructura de Stripe de extremo a extremo. El estudio nunca almacena ni tiene acceso directo a los datos de su tarjeta de crédito o débito, cumpliendo rigurosamente con las normativas PCI-DSS.'
        },
        {
          title: '4. Protección de Galerías Privadas',
          text: 'Las fotografías de prueba se alojan en servidores de nube seguros de Firebase con reglas de protección estrictas. El acceso a su portal privado está restringido al código único proporcionado. Las imágenes nunca se usarán en el portfolio público, redes sociales o medios de impresión sin su consentimiento explícito por escrito.'
        },
        {
          title: '5. Retención de Archivos',
          text: 'Mantenemos sus galerías de prueba activas durante 12 meses después de la sesión para permitir descargas y solicitudes de retoques adicionales. Después de este período, las imágenes se archivan de manera segura en almacenamiento frío offline por un periodo de hasta 3 años como cortesía para recuperación ante pérdidas fortuitas.'
        },
        {
          title: '6. Sus Derechos de Control',
          text: 'Usted conserva pleno control sobre su información. Puede solicitar en cualquier momento la eliminación definitiva de su cuenta de cliente, la baja de nuestra newsletter o la remoción completa de sus archivos de nuestros servidores enviando un correo directo a nuestro despacho.'
        }
      ] : isPt ? [
        {
          title: '1. Compromisso de Confidencialidade',
          text: 'No Miriam Campos Studio, compreendemos que as fotografias capturadas não são meras imagens, mas memórias preciosas e ativos artísticos de grande valor. Comprometemo-nos solenemente a proteger a privacidade de cada sessão, garantindo que os seus retratos, casamentos e campanhas comerciais sejam tratados com a máxima discrição e segurança.'
        },
        {
          title: '2. Informações que Recolhemos',
          text: 'Recolhemos apenas os dados necessários para proporcionar uma experiência de luxo altamente personalizada: nome, endereço de e-mail, número de telefone, detalhes do seu evento/sessão, direção criativa da sessão e, no caso do Portal do Cliente, um código de acesso único (ex: SELECCION2026) gerado de forma segura.'
        },
        {
          title: '3. Transações Financeiras Seguras (Stripe)',
          text: 'Todas as transações financeiras e adiantamentos de reserva são processados através da infraestrutura segura da Stripe de ponta a ponta. O estúdio nunca armazena nem tem acesso direto aos dados do seu cartão de crédito ou débito, cumprindo rigorosamente as diretrizes PCI-DSS.'
        },
        {
          title: '4. Proteção de Galerias Privadas',
          text: 'As fotografias de prova são alojadas em servidores de nuvem seguros da Firebase com regras de proteção estritas. O acesso ao seu portal privado é restrito ao código único fornecido. As imagens nunca serão utilizadas no portfolio público, redes sociais ou meios de imprensa sem o seu consentimento explícito por escrito.'
        },
        {
          title: '5. Retenção de Arquivos',
          text: 'Mantemos as suas galerias de prova ativas durante 12 meses após a sessão para permitir descarregamentos e pedidos de retoques adicionais. Após este período, as imagens são arquivadas de forma segura em armazenamento offline por um período de até 3 anos como cortesia para recuperação.'
        },
        {
          title: '6. Seus Direitos de Controle',
          text: 'O cliente conserva total controlo sobre as suas informações. Pode solicitar a qualquer momento a eliminação definitiva da sua conta de cliente, o cancelamento da subscrição da nossa newsletter ou a remoção completa dos seus ficheiros dos nossos servidores enviando um e-mail direto para o nosso estúdio.'
        }
      ] : [
        {
          title: '1. Commitment to Confidentiality',
          text: 'At Miriam Campos Studio, we understand that captured photographs are not just images, but cherished memories and invaluable artistic assets. We solemnly commit to protecting the privacy of every session, ensuring that your portraits, weddings, and commercial campaigns are treated with the utmost discretion and security.'
        },
        {
          title: '2. Information We Collect',
          text: 'We collect only the data necessary to provide a highly personalized luxury experience: full name, email address, phone number, event/session details, creative brief, and, for the Client Portal, a securely generated unique access code (e.g., SELECCION2026).'
        },
        {
          title: '3. Secure Payment Gateways (Stripe)',
          text: 'All financial transactions and booking deposits are processed through Stripe’s secure end-to-end infrastructure. The studio never stores or has direct access to your credit or debit card details, adhering strictly to PCI-DSS rules.'
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
      title: isEs ? 'Términos de Servicio' : isPt ? 'Termos de Serviço' : 'Terms of Service',
      subtitle: isEs 
        ? 'Acuerdo legal para la contratación de servicios de bellas artes de Miriam Campos.' 
        : isPt 
        ? 'Acordo legal para a contratação de serviços de belas artes da Miriam Campos.' 
        : 'Legal agreement for commissioning fine art photography services by Miriam Campos.',
      lastUpdated: isEs ? 'Última actualización: 13 de Julio, 2026' : isPt ? 'Última atualização: 13 de Julho, 2026' : 'Last updated: July 13, 2026',
      sections: isEs ? [
        {
          title: '1. Tarifas y Depósito de Reserva',
          text: 'Para asegurar una fecha de sesión exclusiva en el calendario del estudio, se requiere un depósito o anticipo del 30% del total contratado a través de nuestra pasarela de pago segura (Stripe). Este depósito no es reembolsable debido a que bloquea la disponibilidad de la artista y cancela otras comisiones potenciales.'
        },
        {
          title: '2. Proceso de Cancelación y Reprogramación',
          text: 'Las solicitudes de reprogramación de fechas deben realizarse con un mínimo de 14 días de antelación para bodas de destino, y 5 días para sesiones editoriales individuales. En caso de fuerza mayor o condiciones climáticas severas que imposibiliten la iluminación natural requerida, el estudio acordará una fecha alternativa mutuamente conveniente sin cargo adicional.'
        },
        {
          title: '3. Derechos de Autor y Licencia de Uso',
          text: 'Miriam Campos conserva todos los derechos morales y de propiedad intelectual sobre las fotografías. Al entregar la galería final, se otorga al cliente una licencia indefinida para uso personal, impresión privada y publicación en redes sociales sin fines comerciales. Para publicaciones editoriales o campañas de marcas comerciales, se redactará un acuerdo de licencia específico.'
        },
        {
          title: '4. Estilo Artístico y Edición de Autor',
          text: 'Al contratar los servicios del estudio, usted reconoce y acepta que las fotografías se editan bajo el estilo artístico de firma y los criterios cromáticos de Miriam Campos. Las fotos en bruto (RAW) representan un paso intermedio en la creación artística y no se entregan al cliente final, priorizando la entrega de obras completamente terminadas y de alta resolución.'
        },
        {
          title: '5. Plazos de Entrega Premium',
          text: 'El estudio se compromete con la excelencia operativa: un adelanto exclusivo de 15 a 20 imágenes seleccionadas a mano se publicará en su Portal Privado dentro de las primeras 72 horas posteriores a la sesión. El catálogo completo finalizado con revelado cromático impecable se entregará en un plazo garantizado de 4 a 6 semanas.'
        },
        {
          title: '6. Limitación de Responsabilidad',
          text: 'En el improbable caso de falla técnica del equipo fotográfico, daño de archivos digitales o imprevistos de extrema urgencia médica que impidan a la fotógrafa realizar su trabajo, la responsabilidad del estudio se limitará exclusivamente a la devolución total de cualquier depósito o importe pagado por el cliente.'
        }
      ] : isPt ? [
        {
          title: '1. Tarifas e Depósito de Reserva',
          text: 'Para garantir uma data de sessão exclusiva no calendário do estúdio, é necessário um depósito ou adiantamento de 30% do total contratado através da nossa plataforma segura (Stripe). Este depósito não é reembolsável, pois bloqueia a disponibilidade da artista e cancela outras comissões potenciais.'
        },
        {
          title: '2. Cancelamento e Reagendamento',
          text: 'Os pedidos de reagendamento de datas devem ser feitos com um mínimo de 14 dias de antecedência para casamentos de destino, e 5 dias para sessões editoriais individuais. Em caso de força maior ou condições climatéricas severas que impossibilitem a iluminação natural, o estúdio acordará uma data alternativa mútua conveniente sem custos adicionais.'
        },
        {
          title: '3. Direitos de Autor e Licença de Utilização',
          text: 'Miriam Campos retém todos os direitos de autor e propriedade intelectual sobre as fotografias. Após a entrega da galeria final, é concedida ao cliente uma licença ilimitada para uso pessoal, impressão privada e publicação em redes sociais sem fins comerciais. Para fins de campanhas comerciais, será redigido um acordo de licenciamento específico.'
        },
        {
          title: '4. Estilo Artístico e Edição de Autor',
          text: 'Ao contratar os serviços do estúdio, o cliente reconhece e aceita que as fotografias são editadas sob o estilo artístico de assinatura e critérios cromáticos de Miriam Campos. As fotos brutas (RAW) representam um passo intermédio e não se entregam ao cliente final, priorizando a entrega de obras completamente terminadas.'
        },
        {
          title: '5. Prazos de Entrega Garantidos',
          text: 'O estúdio compromete-se com a excelência operacional: um preview exclusivo de 15 a 20 imagens será publicado no seu Portal Privado dentro das primeiras 72 horas após a sessão. O catálogo completo finalizado com revelação de assinatura será entregue num prazo de 4 a 6 semanas.'
        },
        {
          title: '6. Limitação de Responsabilidade',
          text: 'No caso improvável de falha técnica do equipamento, perda acidental de ficheiros digitais ou imprevistos médicos graves que impeçam a fotógrafa de realizar o seu trabalho, a responsabilidade do estúdio limita-se exclusivamente ao reembolso integral de qualquer depósito ou valor pago pelo cliente.'
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
          text: 'In the highly unlikely event of camera equipment failure, accidental loss of digital media, or sudden medical emergencies preventing the photographer from executing the commission, the studio’s liability is limited strictly to the immediate refund of all retainers and sums paid by the client.'
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
            <span>{isEs ? 'Volver al Inicio' : isPt ? 'Voltar ao Início' : 'Back to Home'}</span>
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
          <span>{isEs ? 'Estudio Certificado Internacional' : isPt ? 'Estúdio Certificado Internacional' : 'International Studio Certified'}</span>
        </div>
        <p className="text-[10px] text-white/40 font-sans max-w-sm text-center leading-normal">
          {isEs 
            ? 'Para consultas adicionales relativas a nuestros estatutos legales o acuerdos especiales de licencia, póngase en contacto directo con nuestro despacho.'
            : isPt
            ? 'Para questões adicionais relativas aos nossos estatutos legais ou acordos especiais de licença, por favor contacte o nosso escritório.'
            : 'For additional questions regarding our legal statutes or custom commercial licensing terms, please contact our administrative desk directly.'
          }
        </p>
      </div>
    </div>
  );
}
