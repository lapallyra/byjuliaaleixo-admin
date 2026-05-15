import { SaleNotification, CompanyId, Product } from '../types';
import { PRODUCTS } from '../constants';

const CUSTOMER_NAMES = [
  'Maria Fernandes', 'João Felipe', 'Luana Mattos', 'Ana Beatriz', 'Lucas Santos',
  'Mariana Costa', 'Guilherme Alves', 'Beatriz Silva', 'Felipe Oliveira', 'Camila Rocha',
  'Rafael Lima', 'Juliana Souza', 'Thiago Pereira', 'Larissa Mendes', 'Breno Ferraz',
  'Isabela Gomes', 'Vitor Hugo', 'Letícia Castro', 'Matheus Duarte', 'Gabriela Borges',
  'Bruno Martins', 'Ricardo Fonseca', 'Fernanda Andrade', 'Patrícia Koster', 'Cláudia Monteiro',
  'Sérgio Valente', 'Amanda Ribeiro', 'Roberto Carlos', 'Aline Moraes', 'Paulo Ricardo',
  'Rodrigo Mello', 'Julia Azevedo', 'Renata Nogueira', 'Eduardo Torres', 'Tatiana Reis',
  'Fábio Lins', 'Carla Machado', 'Leonardo Vieira', 'Simone Tavares', 'Henrique Bueno'
];

export const generateRandomNotification = (companyId: CompanyId): SaleNotification => {
  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const seconds = Math.floor(Math.random() * 30); // Max 30 seconds as requested
  
  // Natural phrasing as requested
  let timeAgo = '';
  if (seconds === 0) {
    timeAgo = 'nesse momento';
  } else {
    timeAgo = `${seconds} segundos`;
  }
  
  const regions = ['São Paulo/SP', 'Rio de Janeiro/RJ', 'Curitiba/PR', 'Florianópolis/SC', 'Belo Horizonte/MG', 'Goiânia/GO', 'Brasília/DF'];
  const region = regions[Math.floor(Math.random() * regions.length)];

  // We don't have easy access to the full product list here, so we use common items
  const genericItems = {
    pallyra: ['Placa de Porta Maternidade', 'Kit Higiene Luxo', 'Álbum do Bebê Bordado', 'Quadro de Nascimento', 'Lembrancinha Batizado'],
    guennita: ['Planner 2026', 'Caderno de Receitas', 'Diário Devocional', 'Box Colecionador', 'Pasta Executiva'],
    mimada: ['Sacola Personalizada', 'Papel de Seda Premium', 'Lacre de Cera', 'Etiqueta Adesiva Ouro', 'Cartão de Agradecimento']
  };

  const pool = genericItems[companyId as keyof typeof genericItems] || ['um item especial'];
  const product = pool[Math.floor(Math.random() * pool.length)];

  // Randomize phrasing
  const phrasings = [
    `comprou ${product}`,
    `comprou o último ${product}`
  ];
  const phrase = phrasings[Math.floor(Math.random() * phrasings.length)];
  
  return {
    id: crypto.randomUUID(),
    customerName: name,
    productName: phrase,
    timeAgo: timeAgo,
    companyId
  };
};

export const createRealNotification = (name: string, products: string[], companyId: CompanyId): SaleNotification => {
  return {
    id: crypto.randomUUID(),
    customerName: name,
    productName: `comprou ${products.join(', ')}`,
    timeAgo: 'nesse momento',
    companyId
  };
};
