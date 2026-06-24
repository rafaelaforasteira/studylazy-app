import type { Question, QuestionContentFormat } from './questionTypes';
import { validateEnemQuestionBank } from './validateEnemQuestions';

/** Maps ENEM area labels to the session subject values used by the app. */
export const ENEM_AREA_TO_SUBJECT: Record<string, string> = {
  Linguagens: 'Português',
  'Ciências Humanas': 'Ciências Humanas',
};

function resolveEnemSubject(area: string) {
  return ENEM_AREA_TO_SUBJECT[area] ?? area;
}

function formatOption(id: string, text: string) {
  return `${id}) ${text}`;
}

function buildOfficialEnemQuestion(params: {
  externalId: string;
  source: string;
  year: number;
  area: string;
  topic: string;
  prompt: string;
  supportTitle?: string;
  supportText?: string;
  sourceCitation?: string;
  contentFormat?: QuestionContentFormat;
  options: { id: string; text: string }[];
  correctAnswerId: string;
  explanation: string;
}): Question {
  const options = params.options.map((option) =>
    formatOption(option.id, option.text)
  );

  const correctOption = params.options.find(
    (option) => option.id === params.correctAnswerId
  );

  if (!correctOption) {
    throw new Error(`Gabarito inválido para ${params.externalId}`);
  }

  return {
    id: params.externalId,
    externalId: params.externalId,
    originType: 'official_exam',
    verified: true,
    question: params.prompt,
    prompt: params.prompt,
    supportTitle: params.supportTitle,
    supportText: params.supportText,
    sourceCitation: params.sourceCitation,
    contentFormat: params.contentFormat ?? 'prose',
    options,
    correctAnswer: formatOption(
      correctOption.id,
      correctOption.text
    ),
    explanation: params.explanation,
    source: params.source,
    year: params.year,
    area: params.area,
    topic: params.topic,
    subject: resolveEnemSubject(params.area),
    requiresImage: false,
  };
}

export const enem2024LinguagensQuestions: Question[] = [
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q02',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Linguagens',
    topic: 'Interpretação de texto em língua inglesa',
    supportTitle: 'Holy War',
    supportText:
      'Oh, so we can hate each other and fear each other\nWe can build these walls between each other\nBaby, blow by blow and brick by brick\nKeep yourself locked in, yourself locked in\n[…]\nOh, maybe we should love somebody\nOh, maybe we could care a little more\nSo maybe we should love somebody\nInstead of polishing the bombs of holy war',
    sourceCitation: 'KEYS, A. Here. Estados Unidos: RCA Records, 2016.',
    contentFormat: 'verse',
    prompt:
      'Nessa letra de canção, que aborda um contexto de ódio e intolerância, o marcador “instead of ” introduz a ideia de',
    options: [
      { id: 'A', text: 'mudança de comportamento.' },
      { id: 'B', text: 'panorama de conflitos.' },
      { id: 'C', text: 'rotina de isolamento.' },
      { id: 'D', text: 'perspectiva bélica.' },
      { id: 'E', text: 'cenário religioso.' },
    ],
    correctAnswerId: 'A',
    explanation:
      'A expressão “instead of” introduz uma substituição: o eu lírico propõe amar e cuidar mais das pessoas em vez de alimentar a guerra, indicando mudança de comportamento.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q38',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Linguagens',
    topic: 'Interpretação de poema e identidade',
    contentFormat: 'verse',
    supportText:
      'pessoas com suas malas\nmochilas e valises\nchegam e se vão\nse encontram\nse despedem\ne se despem\nde seus pertences\ncomo se pudessem chegar\na algum lugar\nonde elas mesmas\nnão estivessem',
    sourceCitation:
      'RUIZ, A. In: SANT’ANNA, A. poemas. Rua Aribau: coletânea de Porto Alegre: TAG, 2018.',
    prompt:
      'Esse poema, por meio da ideia de deslocamento, metaforiza a tentativa de pessoas',
    options: [
      { id: 'A', text: 'buscarem novos encontros.' },
      { id: 'B', text: 'fugirem da própria identidade.' },
      { id: 'C', text: 'procurarem lugares inexplorados.' },
      { id: 'D', text: 'partirem em experiências inusitadas.' },
      { id: 'E', text: 'desaparecerem da vida em sociedade.' },
    ],
    correctAnswerId: 'B',
    explanation:
      'O poema sugere que as pessoas podem abandonar malas e pertences, mas não conseguem chegar a um lugar onde deixem de ser elas mesmas. O deslocamento metaforiza a tentativa de fugir da própria identidade.',
  }),
];

export const enem2024HumanasQuestions: Question[] = [
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q48',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Espaço vivido e vínculos afetivos',
    contentFormat: 'prose',
    supportText:
      'O rompimento da barragem de Fundão levou muito consigo. A lama soterrou sonhos e modificou de forma permanente centenas de vidas nascidas e criadas em Bento Rodrigues e Paracatu, em Mariana (MG). Mas não somente. Ao se estender ao longo do rio, outras famílias e histórias foram atingidas de formas diferentes. Ao fugirem dos rejeitos que rapidamente tomaram as localidades, deixaram para trás os resquícios da vida que tiveram até o 5 de novembro de 2015. Nada jamais seria igual.',
    sourceCitation:
      'SANTOS, P. Histórias soterradas. Curinga, n. 19, nov. 2016 (adaptado).',
    prompt:
      'Conforme o texto, o evento gerou o seguinte impacto na relação entre as pessoas e o seu espaço vivido:',
    options: [
      { id: 'A', text: 'Flexibilização de parâmetros ambientais.' },
      { id: 'B', text: 'Consolidação de identidades regionais.' },
      { id: 'C', text: 'Fragilização de vínculos afetivos.' },
      { id: 'D', text: 'Supressão de práticas exploratórias.' },
      { id: 'E', text: 'Recuperação de tradições ancestrais.' },
    ],
    correctAnswerId: 'C',
    explanation:
      'A destruição e o deslocamento forçado romperam a relação cotidiana das famílias com os lugares onde viviam, fragilizando vínculos afetivos construídos naquele espaço.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q54',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Injustiça epistêmica',
    contentFormat: 'prose',
    supportText:
      'Os grupos dominantes são beneficiados em termos de credibilidade e podem, com isso, controlar falas de membros de outros grupos, descredibilizando seus testemunhos com base em concepções compartilhadas de preconceito de identidade (gênero e raça). Algumas formas de preconceito tornam as declarações das pessoas menos importantes devido ao seu pertencimento a determinado grupo social. Assim, um falante recebe menos credibilidade devido ao preconceito do ouvinte.',
    sourceCitation:
      'KUHNEN, T. Resenha de The Power and Ethics of Knowing, de Miranda Fricker. Princípios, n. 33, 2013. Revista',
    prompt:
      'Com base na reflexão suscitada no texto, o preconceito de identidade é responsável por um tipo de injustiça',
    options: [
      { id: 'A', text: 'estética, que normatiza os padrões corporais.' },
      { id: 'B', text: 'sensorial, que privilegia as habilidades visuais.' },
      { id: 'C', text: 'afetiva, que impede as expressões emocionais.' },
      { id: 'D', text: 'epistêmica, que prejudica as trocas informacionais.' },
      { id: 'E', text: 'econômica, que perpetua as desigualdades materiais.' },
    ],
    correctAnswerId: 'D',
    explanation:
      'Quando o preconceito reduz injustamente a credibilidade de alguém como fonte de conhecimento, ocorre uma injustiça epistêmica, pois a troca de informações é prejudicada.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q55',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Dualismo entre corpo e alma',
    contentFormat: 'prose',
    supportText:
      'A alma funciona no meu corpo de maneira maravilhosa. Nele se aloja, certamente, mas sabe bem dele escapar: escapa para ver as coisas através da janela dos meus olhos, escapa para sonhar quando durmo, para sobreviver quando morro. Minha alma durará muito tempo e mais que muito tempo, quando meu corpo vier a apodrecer. Viva minha alma! É meu corpo luminoso, purificado, virtuoso, ágil, móvel, tépido, viçoso; é meu corpo liso, castrado, arredondado como uma bolha de sabão.',
    sourceCitation:
      'FOUCAULT, M. heterotopias. O corpo utópico, as São Paulo: Edições N-1, 2013.',
    prompt:
      'Esse texto reforça uma concepção metafísica clássica que remete a um(a)',
    options: [
      { id: 'A', text: 'pressuposto lógico.' },
      { id: 'B', text: 'pensamento dicotômico.' },
      { id: 'C', text: 'contemplação da natureza.' },
      { id: 'D', text: 'raciocínio argumentativo.' },
      { id: 'E', text: 'crítica à individualidade.' },
    ],
    correctAnswerId: 'B',
    explanation:
      'O texto apresenta alma e corpo como realidades distintas, com a alma capaz de existir além do corpo. Essa separação corresponde a um pensamento dicotômico.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q57',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Espaço público e democracia',
    contentFormat: 'prose',
    supportText:
      'Espaços públicos não são produtos dados e acabados, uma instituição que, uma vez estabelecida, traria a paz da consensualidade e a perfeita igualdade. São os lugares em que os problemas aparecem e se transformam em debates, em diálogo e em possibilidade de ajuste e compromissos. Por isso, não anulam os conflitos, ao contrário, são canais de comunicação e de visibilidade de oposições.',
    sourceCitation:
      'GOMES, P. C. C. Espaço público, espaços públicos. Geographia, n. 44, set.-dez. 2018 (adaptado).',
    prompt:
      'As características descritas no texto exibem a importância dos espaços públicos para a',
    options: [
      { id: 'A', text: 'prática do lazer.' },
      { id: 'B', text: 'vigilância da sociedade.' },
      { id: 'C', text: 'erradicação da violência.' },
      { id: 'D', text: 'construção da democracia.' },
      { id: 'E', text: 'diversificação do trabalho.' },
    ],
    correctAnswerId: 'D',
    explanation:
      'Os espaços públicos permitem debate, visibilidade de conflitos, diálogo e construção de compromissos, elementos fundamentais para a construção da democracia.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q63',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Indústria cultural',
    contentFormat: 'prose',
    supportText:
      'Uma das principais atividades provocadas pela arte, a reflexão, é abandonada pela indústria cultural. A indústria cultural seria como uma isca que ilude os indivíduos, com o sonho de que eles são livres, originais, únicos e especiais quando, na verdade, os trata como servos e partes de uma massa homogênea.',
    sourceCitation:
      'FONTES, B.; MAGALHÃES, R. O que é indústria cultural? In: BODART, C. N. (Org.). Conceitos e categorias do ensino de sociologia. Maceió: Café com Sociologia, 2021 (adaptado).',
    prompt:
      'Ao analisar as consequências da dinâmica apresentada no texto, as autoras destacam a importância do conceito como:',
    options: [
      { id: 'A', text: 'Ferramenta de luta coletiva.' },
      { id: 'B', text: 'Mecanismo de controle social.' },
      { id: 'C', text: 'Instituição de interesse público.' },
      { id: 'D', text: 'Organização da iniciativa privada.' },
      { id: 'E', text: 'Instrumento de manipulação estatal.' },
    ],
    correctAnswerId: 'B',
    explanation:
      'A indústria cultural padroniza os indivíduos e cria uma sensação ilusória de liberdade e originalidade, funcionando como mecanismo de controle social.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q65',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Globalização e identidades',
    contentFormat: 'prose',
    supportText:
      'Como conclusão provisória, parece então que a globalização tem, sim, o efeito de contestar e deslocar as identidades centradas e “fechadas” de uma cultura nacional. Ela tem um efeito pluralizante sobre as identidades, produzindo uma variedade de possibilidades e novas posições de identificação, e tornando as identidades mais posicionais, mais políticas, mais plurais e diversas; menos fixas, unificadas ou trans-históricas.',
    sourceCitation:
      'HALL, S. pós-modernidade. A identidade cultural na Rio de Janeiro: DP&A, 2011.',
    prompt:
      'De acordo com o texto, o processo apresentado contribuiu para',
    options: [
      { id: 'A', text: 'elevar a renda da população.' },
      { id: 'B', text: 'abandonar os valores morais.' },
      { id: 'C', text: 'estabelecer a igualdade racial.' },
      { id: 'D', text: 'fortalecer as pautas das minorias.' },
      { id: 'E', text: 'inverter os fluxos das migrações.' },
    ],
    correctAnswerId: 'D',
    explanation:
      'Ao tornar as identidades mais plurais, políticas e diversas, a globalização amplia posições de identificação e favorece o fortalecimento de pautas de grupos minoritários.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q81',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Comunidades quilombolas e Constituição de 1988',
    contentFormat: 'prose',
    supportText:
      'No Brasil, os remanescentes de antigos quilombos, “mocambos”, “comunidades negras rurais”, “quilombos contemporâneos”, “comunidades quilombolas” ou “terras de preto” referem-se a um mesmo patrimônio territorial e cultural inestimável, que só recentemente passaram a ter atenção do Estado e ser do interesse de algumas autoridades e organismos oficiais.',
    sourceCitation:
      'ANJOS, R. S. A. Cartografia e quilombos: territórios étnicos africanos no Brasil. Studia, n. 9, 2007. Africana',
    prompt:
      'Na esfera de ação do Estado, com a Constituição de 1988, os espaços mencionados tornaram-se objeto de',
    options: [
      { id: 'A', text: 'iniciativas de planejamento familiar.' },
      { id: 'B', text: 'projetos de reorientação religiosa.' },
      { id: 'C', text: 'programas de moradias sustentáveis.' },
      { id: 'D', text: 'políticas de inserção social.' },
      { id: 'E', text: 'medidas de homogeneização educacional.' },
    ],
    correctAnswerId: 'D',
    explanation:
      'Com a Constituição de 1988, comunidades quilombolas passaram a receber reconhecimento estatal e proteção por meio de políticas voltadas à sua inserção social e aos seus direitos territoriais e culturais.',
  }),
  buildOfficialEnemQuestion({
    externalId: 'ENEM2024_D1_C1_AZ_Q88',
    source: 'ENEM 2024',
    year: 2024,
    area: 'Ciências Humanas',
    topic: 'Adaptação climática e soluções baseadas na natureza',
    contentFormat: 'prose',
    supportText:
      'A mudança do clima nas cidades brasileiras é um desafio de adaptação e equidade. Inundações, alagamentos e ondas de calor são cada vez mais frequentes e intensas. Cidades precisam se adaptar com urgência, a começar pelas áreas e populações mais vulneráveis. Implementar soluções baseadas na natureza de forma sistêmica pode contribuir para a redução de desastres relacionados às mudanças do clima e ainda gerar múltiplos benefícios para a economia, o ambiente e as pessoas.',
    sourceCitation:
      'EVERS, H. et al. Soluções baseadas na natureza para adaptação cidades. Disponível em: www.wribrasil.org.br. em Acesso em: 19 out. 2023 (adaptado).',
    prompt:
      'Qual medida atenua os problemas abordados no texto?',
    options: [
      { id: 'A', text: 'Criação de faixas sinalizadoras.' },
      { id: 'B', text: 'Incineração de resíduos sólidos.' },
      { id: 'C', text: 'Implantação de parques públicos.' },
      { id: 'D', text: 'Verticalização de espaços centrais.' },
      { id: 'E', text: 'Construção de estacionamentos privados.' },
    ],
    correctAnswerId: 'C',
    explanation:
      'Parques públicos ampliam áreas verdes e permeáveis, ajudam a reduzir ilhas de calor e alagamentos e são exemplos de soluções baseadas na natureza para adaptação climática.',
  }),
];

const allEnem2024Questions: Question[] = [
  ...enem2024LinguagensQuestions,
  ...enem2024HumanasQuestions,
];

export { allEnem2024Questions };

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  validateEnemQuestionBank(allEnem2024Questions);
}
