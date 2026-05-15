import { 
  addDays, subDays, startOfWeek, addWeeks, setMonth, setDate,
  isSameDay, isAfter, isBefore, addMonths, startOfDay
} from 'date-fns';

export interface CommemorativeDate {
  date: Date;
  name: string;
  type: 'holiday' | 'commercial' | 'mobile' | 'niche';
  description?: string;
}

// Ousland algorithm for calculating Easter Sunday
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Function to get the Nth specific day of a month (e.g., 2nd Sunday)
function getNthDayOfMonth(year: number, monthIndex: number, dayOfWeek: number, n: number): Date {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  let d = firstDayOfMonth.getDay();
  let offset = (7 + dayOfWeek - d) % 7;
  if (offset === 0 && n === 1) {
    return firstDayOfMonth; // It's exactly the first day
  }
  return new Date(year, monthIndex, 1 + offset + (n - 1) * 7);
}

export function getBrazilianCalendar(year: number): CommemorativeDate[] {
  const dates: CommemorativeDate[] = [];

  const add = (day: number, monthIndex: number, name: string, type: CommemorativeDate['type'], description?: string) => {
    dates.push({ date: new Date(year, monthIndex, day), name, type, description });
  };

  // 1. Feriados Nacionais (Fixos)
  add(1, 0, 'Confraternização Universal', 'holiday');
  add(21, 3, 'Tiradentes', 'holiday');
  add(1, 4, 'Dia do Trabalhador', 'holiday');
  add(7, 8, 'Independência do Brasil', 'holiday');
  add(12, 9, 'Nossa Senhora Aparecida', 'holiday');
  add(2, 10, 'Finados', 'holiday');
  add(15, 10, 'Proclamação da República', 'holiday');
  add(25, 11, 'Natal', 'holiday');

  // 2. Móveis (Data base: Páscoa)
  const easter = getEaster(year);
  dates.push({ date: easter, name: 'Páscoa', type: 'mobile' });
  dates.push({ date: subDays(easter, 47), name: 'Carnaval', type: 'mobile' });
  dates.push({ date: subDays(easter, 2), name: 'Sexta-feira Santa', type: 'mobile' });
  dates.push({ date: addDays(easter, 60), name: 'Corpus Christi', type: 'mobile' });
  
  // Mães e Pais
  dates.push({ date: getNthDayOfMonth(year, 4, 0, 2), name: 'Dia das Mães', type: 'mobile', description: 'Promoções para mães' }); // Maio, Dom = 0, 2º
  dates.push({ date: getNthDayOfMonth(year, 7, 0, 2), name: 'Dia dos Pais', type: 'mobile', description: 'Presentes para pais' }); // Agosto, Dom = 0, 2º

  // Black Friday: 4ª sexta-feira de novembro
  dates.push({ date: getNthDayOfMonth(year, 10, 5, 4), name: 'Black Friday', type: 'commercial', description: 'Maior data de promoções' });

  // 3. Datas Comerciais Fortes
  add(15, 2, 'Dia do Consumidor', 'commercial');
  add(12, 5, 'Dia dos Namorados', 'commercial');
  add(15, 8, 'Dia do Cliente', 'commercial');
  add(4, 9, 'Dia dos Animais', 'commercial', 'Pet-friendly e mimos para pets');
  
  // 4. Datas Criativas e Nichadas
  add(8, 2, 'Dia Internacional da Mulher', 'commercial');
  add(19, 2, 'Dia do Artesão', 'niche');
  add(14, 3, 'Dia Mundial do Café', 'niche');
  add(24, 4, 'Dia Nacional do Café', 'niche', 'Amantes de café');
  add(20, 6, 'Dia do Amigo', 'niche');
  add(21, 8, 'Dia da Árvore', 'niche', 'Conscientização ambiental / Dia da Planta');
  add(22, 8, 'Início da Primavera', 'niche', 'Lançamento de novas coleções / Dia da Margarida');
  add(1, 9, 'Dia do Vendedor', 'niche');
  add(5, 10, 'Dia Nacional do Designer', 'niche');
  
  // Sort temporally
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());

  return dates;
}

export function getUpcomingDates(days: number = 30): CommemorativeDate[] {
  const today = startOfDay(new Date());
  const year = today.getFullYear();
  let calendar = getBrazilianCalendar(year);
  
  // If we are close to the end of the year, also load next year's dates
  if (today.getMonth() === 11) {
    calendar = calendar.concat(getBrazilianCalendar(year + 1));
  }

  const futureLimit = addDays(today, days);
  
  return calendar.filter(d => 
    (isAfter(d.date, today) || isSameDay(d.date, today)) && 
    isBefore(d.date, futureLimit)
  );
}
