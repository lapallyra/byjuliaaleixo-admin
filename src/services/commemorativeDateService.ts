import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CommemorativeDate } from '../types';

const COLLECTION_NAME = 'datas_comemorativas';

export const commemorativeDateService = {
  subscribe(callback: (dates: CommemorativeDate[]) => void) {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(q, (snapshot) => {
      const dates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommemorativeDate));
      callback(dates);
    });
  },

  async addDate(date: Omit<CommemorativeDate, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COLLECTION_NAME), {
      ...date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async updateDate(id: string, updates: Partial<CommemorativeDate>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteDate(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return deleteDoc(docRef);
  },

  async toggleActive(id: string, active: boolean) {
    return this.updateDate(id, { active });
  },

  async seedInitialDates() {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (!snapshot.empty) return; // Already seeded

    const initialDates: Omit<CommemorativeDate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // JANEIRO
      { name: 'Ano Novo', description: 'Celebração universal do início do ano.', category: 'sazonal', day: 1, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#FFD700', icon: 'Sparkles', hashtags: ['AnoNovo', 'Reveillon'], marketing_phrase: 'Um novo ano, novas oportunidades!', priority: 1 },
      { name: 'Dia de Reis', description: 'Tradição cristã que encerra o ciclo natalino.', category: 'religiosa', day: 6, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#8B4513', icon: 'Crown', hashtags: ['DiaDeReis'], marketing_phrase: 'Paz e alegria no encerramento das festas.', priority: 2 },
      { name: 'Dia da Saudade', description: 'Data para recordar momentos e pessoas especiais.', category: 'emocional', day: 30, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#4682B4', icon: 'Heart', hashtags: ['DiaDaSaudade'], marketing_phrase: 'Recordar é viver.', priority: 2 },
      
      // FEVEREIRO
      { name: 'Carnaval', description: 'A maior festa popular brasileira.', category: 'sazonal', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#FF00FF', icon: 'Music', hashtags: ['Carnaval', 'Folia'], marketing_phrase: 'Alegria e cor no seu Carnaval!', priority: 1, mobile_id: 'carnaval' },
      
      // MARÇO
      { name: 'Dia da Mulher', description: 'Celebração das conquistas sociais e políticas das mulheres.', category: 'feminina', day: 8, month: 3, year_fixed: true, recurrent: true, active: true, theme_color: '#E0115F', icon: 'Venus', hashtags: ['DiaDaMulher', '8M'], marketing_phrase: 'Para quem move o mundo com força e delicadeza.', priority: 1 },
      { name: 'Dia do Consumidor', description: 'Foco em ofertas e direitos do cliente.', category: 'comercial', day: 15, month: 3, year_fixed: true, recurrent: true, active: true, theme_color: '#2E8B57', icon: 'ShoppingBag', hashtags: ['DiaDoConsumidor'], marketing_phrase: 'Ofertas exclusivas para você!', priority: 1 },
      
      // ABRIL
      { name: 'Páscoa', description: 'Celebração de renascimento e união.', category: 'religiosa', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#9370DB', icon: 'Rabbit', hashtags: ['Pascoa', 'Chocolate'], marketing_phrase: 'Uma Páscoa doce e cheia de luz.', priority: 1, mobile_id: 'pascoa' },
      { name: 'Tiradentes', description: 'Homenagem ao mártir da Inconfidência Mineira.', category: 'sazonal', day: 21, month: 4, year_fixed: true, recurrent: true, active: true, theme_color: '#B22222', icon: 'Flag', hashtags: ['Tiradentes'], marketing_phrase: 'Liberdade, ainda que tardia.', priority: 2 },
      
      // MAIO
      { name: 'Dia do Trabalhador', description: 'Homenagem a todos os profissionais.', category: 'profissional', day: 1, month: 5, year_fixed: true, recurrent: true, active: true, theme_color: '#4169E1', icon: 'Briefcase', hashtags: ['DiaDoTrabalhador'], marketing_phrase: 'Seu esforço constrói o futuro.', priority: 1 },
      { name: 'Dia das Mães', description: 'Homenagem àquela que nos deu a vida.', category: 'maternidade', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#FF69B4', icon: 'Heart', hashtags: ['DiaDasMaes', 'AmorDeMae'], marketing_phrase: 'O presente perfeito para quem te deu a vida.', priority: 1, mobile_id: 'mothers_day' },
      { name: 'Dia do Enfermeiro', description: 'Homenagem aos profissionais de saúde.', category: 'profissional', day: 12, month: 5, year_fixed: true, recurrent: true, active: true, theme_color: '#00CED1', icon: 'Stethoscope', hashtags: ['DiaDoEnfermeiro'], marketing_phrase: 'Cuidar é uma arte.', priority: 2 },
      
      // JUNHO
      { name: 'Dia dos Namorados', description: 'Celebração do amor e companheirismo.', category: 'casamento', day: 12, month: 6, year_fixed: true, recurrent: true, active: true, theme_color: '#DC143C', icon: 'HeartHandshakes', hashtags: ['DiaDosNamorados', 'Love'], marketing_phrase: 'Demonstre seu amor em cada detalhe.', priority: 1 },
      { name: 'Corpus Christi', description: 'Feriado religioso tradicional.', category: 'religiosa', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#FFDAB9', icon: 'Church', hashtags: ['CorpusChristi'], marketing_phrase: 'Fé e devoção.', priority: 2, mobile_id: 'corpus_christi' },
      
      // JULHO
      { name: 'Dia do Amigo', description: 'Dia de celebrar a amizade.', category: 'emocional', day: 20, month: 7, year_fixed: true, recurrent: true, active: true, theme_color: '#FF8C00', icon: 'Users', hashtags: ['DiaDoAmigo', 'Friends'], marketing_phrase: 'Amizade que vale ouro.', priority: 2 },
      { name: 'Dia dos Avós', description: 'Homenagem aos pilares da família.', category: 'emocional', day: 26, month: 7, year_fixed: true, recurrent: true, active: true, theme_color: '#708090', icon: 'Glasses', hashtags: ['DiaDosAvos'], marketing_phrase: 'Amor em dobro.', priority: 2 },
      
      // AGOSTO
      { name: 'Dia dos Pais', description: 'Homenagem aos pais brasileiros.', category: 'masculina', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#2F4F4F', icon: 'UserCircle', hashtags: ['DiaDosPais'], marketing_phrase: 'Para o herói de todos os dias.', priority: 1, mobile_id: 'fathers_day' },
      
      // SETEMBRO
      { name: 'Independência do Brasil', description: 'Feriado nacional da pátria.', category: 'sazonal', day: 7, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#228B22', icon: 'Map', hashtags: ['7DeSetembro'], marketing_phrase: 'Brasil, terra adorada.', priority: 1 },
      { name: 'Dia do Cliente', description: 'Agradecimento a quem faz nosso negócio crescer.', category: 'marketing', day: 15, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#4B0082', icon: 'Handshake', hashtags: ['DiaDoCliente'], marketing_phrase: 'Você é nossa maior prioridade.', priority: 1 },
      
      // OUTUBRO
      { name: 'Dia das Crianças', description: 'Muita diversão e alegria.', category: 'infantil', day: 12, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#FFA500', icon: 'Gamepad2', hashtags: ['DiaDasCriancas', 'Kids'], marketing_phrase: 'O mundo é mais feliz brincando.', priority: 1 },
      { name: 'Dia dos Professores', description: 'Homenagem a quem educa.', category: 'profissional', day: 15, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#8B0000', icon: 'BookOpen', hashtags: ['DiaDosProfessores'], marketing_phrase: 'Educar é transformar.', priority: 1 },
      { name: 'Halloween', description: 'Dia das Bruxas no estilo brasileiro.', category: 'sazonal', day: 31, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#FF4500', icon: 'Ghost', hashtags: ['Halloween', 'GostosurasOuTravessuras'], marketing_phrase: 'Uma diversão de arrepiar!', priority: 2 },
      
      // NOVEMBRO
      { name: 'Black Friday', description: 'O dia de maiores ofertas do ano.', category: 'comercial', day: 0, month: 0, year_fixed: false, recurrent: true, active: true, theme_color: '#000000', icon: 'Tag', hashtags: ['BlackFriday', 'Ofertas'], marketing_phrase: 'Descontos imperdíveis, só agora!', priority: 1, mobile_id: 'black_friday' },
      
      // DEZEMBRO
      { name: 'Natal', description: 'Momento de união e presentes.', category: 'sazonal', day: 25, month: 12, year_fixed: true, recurrent: true, active: true, theme_color: '#CD5C5C', icon: 'Gift', hashtags: ['Natal', 'MerryChristmas'], marketing_phrase: 'O encanto do Natal nos seus presentes.', priority: 1 },

      // PROFISSÕES
      { name: 'Dia do Médico', description: 'Homenagem aos médicos.', category: 'profissional', day: 18, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#008B8B', icon: 'HeartPulse', hashtags: ['DiaDoMedico'], marketing_phrase: 'Heróis de jaleco.', priority: 2 },
      { name: 'Dia do Psicólogo', description: 'Homenagem aos psicólogos.', category: 'profissional', day: 27, month: 8, year_fixed: true, recurrent: true, active: true, theme_color: '#4682B4', icon: 'Brain', hashtags: ['DiaDoPsicologo'], marketing_phrase: 'Cuidar da mente é cuidar da vida.', priority: 2 },
      { name: 'Dia do Dentista', description: 'Homenagem aos dentistas.', category: 'profissional', day: 25, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#ADD8E6', icon: 'Zap', hashtags: ['DiaDoDentista'], marketing_phrase: 'Sorrisos que transformam.', priority: 2 },
      { name: 'Dia do Advogado', description: 'Homenagem aos advogados.', category: 'profissional', day: 11, month: 8, year_fixed: true, recurrent: true, active: true, theme_color: '#191970', icon: 'Gavel', hashtags: ['DiaDoAdvogado'], marketing_phrase: 'Justiça e dedicação.', priority: 2 },
      { name: 'Dia do Contador', description: 'Homenagem aos contadores.', category: 'profissional', day: 22, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#2F4F4F', icon: 'Calculator', hashtags: ['DiaDoContador'], marketing_phrase: 'Equilíbrio e precisão.', priority: 2 },
      { name: 'Dia do Arquiteto', description: 'Homenagem aos arquitetos.', category: 'profissional', day: 15, month: 12, year_fixed: true, recurrent: true, active: true, theme_color: '#A0522D', icon: 'DraftingCompass', hashtags: ['DiaDoArquiteto'], marketing_phrase: 'Projetando sonhos.', priority: 2 },
      { name: 'Dia do Designer', description: 'Homenagem aos designers.', category: 'profissional', day: 5, month: 11, year_fixed: true, recurrent: true, active: true, theme_color: '#FF1493', icon: 'Palette', hashtags: ['DiaDoDesigner'], marketing_phrase: 'Criatividade que inspira.', priority: 2 },
      { name: 'Dia do Programador', description: 'Homenagem aos programadores.', category: 'profissional', day: 13, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#00FF00', icon: 'Code', hashtags: ['DiaDoProgramador'], marketing_phrase: 'Transformando café em código.', priority: 2 },
      { name: 'Dia do Fotógrafo', description: 'Homenagem aos fotógrafos.', category: 'profissional', day: 8, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#708090', icon: 'Camera', hashtags: ['DiaDoFotografo'], marketing_phrase: 'Eternizando momentos.', priority: 2 },
      { name: 'Dia do Veterinário', description: 'Homenagem aos veterinários.', category: 'profissional', day: 9, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#228B22', icon: 'PawPrint', hashtags: ['DiaDoVeterinario'], marketing_phrase: 'Amor pelos animais.', priority: 2 },
      { name: 'Dia da Secretária', description: 'Homenagem às secretárias.', category: 'profissional', day: 30, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#FF69B4', icon: 'FileText', hashtags: ['DiaDaSecretaria'], marketing_phrase: 'Organização e eficiência.', priority: 2 },
      { name: 'Dia do Administrador', description: 'Homenagem aos administradores.', category: 'profissional', day: 9, month: 9, year_fixed: true, recurrent: true, active: true, theme_color: '#4682B4', icon: 'Briefcase', hashtags: ['DiaDoAdministrador'], marketing_phrase: 'Gestão de excelência.', priority: 2 },
      { name: 'Dia do Engenheiro', description: 'Homenagem aos engenheiros.', category: 'profissional', day: 11, month: 12, year_fixed: true, recurrent: true, active: true, theme_color: '#B8860B', icon: 'HardHat', hashtags: ['DiaDoEngenheiro'], marketing_phrase: 'Construindo o progresso.', priority: 2 },
      { name: 'Dia do Farmacêutico', description: 'Homenagem aos farmacêuticos.', category: 'profissional', day: 20, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#00FA9A', icon: 'Pill', hashtags: ['DiaDoFarmaceutico'], marketing_phrase: 'Saúde em cada dose.', priority: 2 },
      { name: 'Dia do Nutricionista', description: 'Homenagem aos nutricionistas.', category: 'profissional', day: 31, month: 8, year_fixed: true, recurrent: true, active: true, theme_color: '#32CD32', icon: 'Apple', hashtags: ['DiaDoNutricionista'], marketing_phrase: 'Alimentando saúde.', priority: 2 },
      { name: 'Dia do Fisioterapeuta', description: 'Homenagem aos fisioterapeutas.', category: 'profissional', day: 13, month: 10, year_fixed: true, recurrent: true, active: true, theme_color: '#20B2AA', icon: 'Activity', hashtags: ['DiaDoFisioterapeuta'], marketing_phrase: 'Movimento é vida.', priority: 2 },
      { name: 'Dia da Esteticista', description: 'Homenagem às esteticistas.', category: 'profissional', day: 18, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#FFB6C1', icon: 'Sparkle', hashtags: ['DiaDaEsteticista'], marketing_phrase: 'Beleza e bem-estar.', priority: 2 },
      { name: 'Dia da Costureira', description: 'Homenagem às costureiras.', category: 'profissional', day: 25, month: 5, year_fixed: true, recurrent: true, active: true, theme_color: '#DB7093', icon: 'Scissors', hashtags: ['DiaDaCostureira'], marketing_phrase: 'Tecendo histórias.', priority: 2 },
      { name: 'Dia do Artesão', description: 'Homenagem aos artesãos.', category: 'profissional', day: 19, month: 3, year_fixed: true, recurrent: true, active: true, theme_color: '#A0522D', icon: 'Hammer', hashtags: ['DiaDoArtesao'], marketing_phrase: 'Feito à mão, com o coração.', priority: 2 },
      { name: 'Dia do Confeiteiro', description: 'Homenagem aos confeiteiros.', category: 'profissional', day: 2, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#F08080', icon: 'Cake', hashtags: ['DiaDoConfeiteiro'], marketing_phrase: 'Adoçando a vida.', priority: 2 },
      { name: 'Dia do Barbeiro', description: 'Homenagem aos barbeiros.', category: 'profissional', day: 3, month: 11, year_fixed: true, recurrent: true, active: true, theme_color: '#1E90FF', icon: 'Scissors', hashtags: ['DiaDoBarbeiro'], marketing_phrase: 'Estilo e tradição.', priority: 2 },
      { name: 'Dia do Cabeleireiro', description: 'Homenagem aos cabeleireiros.', category: 'profissional', day: 19, month: 1, year_fixed: true, recurrent: true, active: true, theme_color: '#800080', icon: 'Scissors', hashtags: ['DiaDoCabeleireiro'], marketing_phrase: 'Beleza em cada fio.', priority: 2 },
    ];

    for (const date of initialDates) {
      await this.addDate(date);
    }
  }
};
