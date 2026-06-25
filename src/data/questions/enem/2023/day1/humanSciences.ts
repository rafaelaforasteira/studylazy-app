import { buildEnem2023Question } from './buildQuestion';

export const humanSciencesQuestions: ReturnType<typeof buildEnem2023Question>[] = [
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q47',
    questionNumber: 47,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `Na perspectiva do autor, as tradições e os costumes sociofamiliares sofreram alterações, no século XIX, decorrentes de quais fatores?`,
    supportTitle: `Felizes tempos eram esses! As moças iam à missa de`,
    supportText: `madrugada. De dia ninguém as via e se alguma, em dia
de festa, queria passear com a avó ou a tia, havia de ir de
cadeirinhas. Bem razão têm os nossos velhos de chorar
por esses tempos, em que as filhas não sabiam escrever,
e por isso não mandavam nem recebiam bilhetinhos.
meados do século XIX: um estudo das revistas femininas editadas`,
    sourceCitation: `Novo Correio de Modas, 1853, apud DONEGÁ, A. L. Publicar ficção em pelos irmãos Laemmert. Campinas: Unicamp, 2013 (adaptado).`,
    options: [
      { id: 'A', text: `Hábitos de leitura e mobilidade regional.` },
      { id: 'B', text: `Circulação de impressos e trânsito religioso.` },
      { id: 'C', text: `Valorização da língua e imigração estrangeira.` },
      { id: 'D', text: `Práticas de letramento e transformação cultural.` },
      { id: 'E', text: `Flexibilização do ensino e reformismo pedagógico.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q48',
    questionNumber: 48,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `Os elementos descritos no texto, a respeito da territorialização da produção, demonstram que há um`,
    supportTitle: `No Cerrado, o conhecimento local está sendo cada`,
    supportText: `vez mais subordinado à lógica do agronegócio. De um
lado, o capital impõe os conhecimentos biotecnológicos,
como mecanismo de universalização de práticas agrícolas
e de novas tecnologias, e de outro, o modelo capitalista
subordina homens e mulheres à lógica do mercado. Assim,
as águas, as sementes, os minerais, as terras (bens
comuns) tornam-se propriedade privada. Além do mais,
há outros fatores negativos, como a mecanização pesada,
a “pragatização” dos seres humanos e não humanos, a
violência simbólica, a superexploração, as chuvas de
veneno e a violência contra a pessoa.`,
    sourceCitation: `CALAÇA, M.; SILVA, E. B.; JESUS, J. N. Territorialização do agronegócio e subordinação do campesinato no Cerrado. Élisée, Rev. Geo. UEG, n. 1, jan.-jun. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `cerco aos camponeses, inviabilizando a manutenção das condições para a vida.` },
      { id: 'B', text: `descaso aos latifundiários, impactando a plantação de alimentos para a exportação.` },
      { id: 'C', text: `desprezo ao assalariado, afetando o engajamento dos sindicatos para o trabalhador.` },
      { id: 'D', text: `desrespeito aos governantes, comprometendo a criação de empregos para o lavrador.` },
      { id: 'E', text: `assédio ao empresariado, dificultando o investimento de maquinários para a produção.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q49',
    questionNumber: 49,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `A política demográfica para a província mencionada nos textos é parte da seguinte ação estratégica do governo chinês:`,
    supportText: `TEXTO I
Com uma população de 25 milhões de habitantes
(cerca de 60% de minorias muçulmanas, principalmente
da etnia Uigur), Xinjiang é uma região estratégica para a
China. Faz fronteira com oito países, é uma artéria crucial
do megaprojeto de infraestrutura chinês Cinturão e Rota e
tem as maiores reservas nacionais de carvão e gás natural.
TEXTO II
Dentre as províncias da Região Oeste, Xinjiang se
destaca ao receber mais de 1,7 milhão de migrantes entre
2000 e 2010. O principal motivo desse fluxo migratório
é que o governo fornece subsídios à população visando
aumentar a proporção de chineses da etnia Han em
relação à população local de etnias turca e muçulmana.
interpretação de eventos contemporâneos segundo os clássicos do desenvolvimento.`,
    sourceCitation: `NINIO, M. Disponível em: https://oglobo.globo.com. Acesso em: 5 out. 2021 (adaptado). ALVES, F.; TOYOSHIMA, S. Disparidade socioeconômica e fluxo migratório chinês: Revista de Economia Contemporânea, n. 1, jan.-abr. 2017 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `Promover a ocupação rural.` },
      { id: 'B', text: `Favorecer a liberdade religiosa.` },
      { id: 'C', text: `Descentralizar a gestão pública.` },
      { id: 'D', text: `Incentivar a pluralidade cultural.` },
      { id: 'E', text: `Assegurar a integridade territorial.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q50',
    questionNumber: 50,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Em relação ao conhecimento sobre a formação cultural brasileira, iniciativas como a descrita no texto favorecem o(a)`,
    supportTitle: `Superar a história da escravidão como principal marca`,
    supportText: `da trajetória do negro no país tem sido uma tônica daqueles
que se dedicam a pesquisar as heranças de origem afro
à cultura brasileira. A esse esforço de reconstrução
da própria história do país, alia-se agora a criação da
plataforma digital Ancestralidades. “A história do negro
no Brasil vai continuar sendo contada, e cada passo que
a gente dá para trás é um passo que a gente avança”, diz
Márcio Black, idealizador da plataforma, sobre o estudo
de figuras ainda encobertas pela perspectiva histórica
imposta pelos colonizadores da América.
FIORATI, G. Projeto joga luz sobre negros e revê perspectiva histórica.`,
    sourceCitation: `Disponível em: www1.folha.uol.com.br. Acesso em: 10 nov. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `recuperação do tradicionalismo.` },
      { id: 'B', text: `estímulo ao antropocentrismo.` },
      { id: 'C', text: `reforço do etnocentrismo.` },
      { id: 'D', text: `resgate do teocentrismo.` },
      { id: 'E', text: `crítica ao eurocentrismo.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q51',
    questionNumber: 51,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `A análise do resultado do processo em questão revela que o governo inglês foi incapaz de garantir seu objetivo de`,
    supportTitle: `Escrito durante a Primeira Guerra Mundial, o seguinte`,
    supportText: `trecho faz parte da carta enviada pelo secretário do exterior
britânico, Sir Arthur James Balfour, ao banqueiro Lord
Rotschild, presidente da Liga Sionista, em 2 de novembro
de 1917, a carta ficou conhecida como Declaração Balfour:
“O governo de Sua Majestade vê com aprovação o
estabelecimento na Palestina de um lar nacional para
o povo judeu, e fará todos os esforços para facilitar tal
objetivo. Nada será feito que possa prejudicar os direitos
civis e religiosos das comunidades não judaicas na
Palestina.”`,
    sourceCitation: `GATTAZ, A. A Guerra da Palestina. São Paulo: Usina do Livro, 2002 (adaptado).`,
    options: [
      { id: 'A', text: `promover o bem-estar social.` },
      { id: 'B', text: `negociar o apoio muçulmano.` },
      { id: 'C', text: `mediar os conflitos territoriais.` },
      { id: 'D', text: `estimular a cooperação regional.` },
      { id: 'E', text: `combater os governos autocráticos.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q52',
    questionNumber: 52,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `Acesso em: 6 out. 2021 (adaptado). Com base no conceito de ética pedagógica presente nos textos, os educandos tornam-se responsáveis pela`,
    supportText: `TEXTO I
Como presença consciente no mundo não posso
escapar à responsabilidade ética no meu mover-me no
mundo. Se sou puro produto da determinação genética ou
cultural ou de classe, sou irresponsável pelo que faço no
meu mover-me no mundo e, se careço de responsabilidade,
não posso falar em ética.
FREIRE, P. Pedagogia da autonomia: saberes necessários
TEXTO II
Paulo Freire construiu uma pedagogia da esperança.
Na sua concepção, a história não é algo pronto e acabado.
As estruturas de opressão e as desigualdades, apesar
de serem naturalizadas, são sócio e historicamente
construídas. Daí a importância de os educandos tomarem
consciência da sua realidade para, assim, transformá-la.`,
    sourceCitation: `à prática educativa. São Paulo: Paz e Terra, 1996. DEMARCHI, J. L. Paulo Freire. Disponível em: https://diplomatique.org.br.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `participação sociopolítica.` },
      { id: 'B', text: `definição estético-cultural.` },
      { id: 'C', text: `competição econômica local.` },
      { id: 'D', text: `manutenção do sistema escolar.` },
      { id: 'E', text: `capacitação de mobilidade individual.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q53',
    questionNumber: 53,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `Qual dinâmica natural é responsável pelo fenômeno apresentado?`,
    supportTitle: `A Cordilheira do Himalaia tem mais de 50 milhões de`,
    supportText: `anos, sendo classificada como a maior cordilheira do planeta.
Originário da língua sânscrito, comum na região, seu nome
quer dizer “morada da neve”. É possível encontrar nessa
cordilheira as quinze maiores montanhas do mundo. Ao todo,
existem mais de cem picos, que contam com altitudes bem
maiores que 7 000 m. O Everest, considerado o ponto mais
alto da Terra, tem nada menos que 8 848 m de altitude, e
continua crescendo, aproximadamente, 0,8 mm a cada ano.`,
    sourceCitation: `Disponível em: https://meioambiente.culturamix.com. Acesso em: 12 nov. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `Derrame de lava vulcânica.` },
      { id: 'B', text: `Encontro de placas tectônicas.` },
      { id: 'C', text: `Ação do intemperismo químico.` },
      { id: 'D', text: `Sedimentação de erosão eólica.` },
      { id: 'E', text: `Derretimento de geleiras glaciais.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q54',
    questionNumber: 54,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `No que se refere ao problema do corpo, a filosofia cartesiana apresenta-se como contraponto ao entendimento expresso no texto por`,
    supportTitle: `Eu poderia concluir que a raiva é um pensamento, que`,
    supportText: `estar com raiva é pensar que alguém é detestável, e que
esse pensamento, como todos os outros — assim como
Descartes o mostrou —, não poderia residir em nenhum
fragmento de matéria. A raiva seria, portanto, espírito.
Porém, quando me volto para minha própria experiência
da raiva, devo confessar que ela não estava fora do meu
corpo, mas inexplicavelmente nele.
MERLEAU-PONTY, M. Quinta conversa: o homem visto de fora.`,
    sourceCitation: `São Paulo: Martins Fontes, 1948 (adaptado).`,
    options: [
      { id: 'A', text: `apresentar uma visão dualista.` },
      { id: 'B', text: `confirmar uma tese naturalista.` },
      { id: 'C', text: `demonstrar uma premissa realista.` },
      { id: 'D', text: `sustentar um argumento idealista.` },
      { id: 'E', text: `defender uma posição intencionalista.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q55',
    questionNumber: 55,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `No texto, o tempo livre é concebido como`,
    supportText: `A diversão é o prolongamento do trabalho sob o capitalismo tardio. Ela é procurada por quem quer escapar
ao processo de trabalho mecanizado para se pôr de novo em condições de enfrentá-lo. Mas, ao mesmo tempo,
a mecanização atingiu um tal poderio sobre a pessoa em seu lazer e sobre a sua felicidade, ela determina tão
profundamente a fabricação das mercadorias destinadas à diversão que essa pessoa não pode mais perceber outra
coisa senão as cópias que reproduzem o próprio processo de trabalho.`,
    sourceCitation: `ADORNO, T.; HORKHEIMER, M. Dialética do esclarecimento. Rio de Janeiro: Zahar, 1997.`,
    options: [
      { id: 'A', text: `consumo de produtos culturais elaborados no mesmo sistema produtivo do capitalismo.` },
      { id: 'B', text: `forma de realizar as diversas potencialidades da natureza humana.` },
      { id: 'C', text: `alternativa para equilibrar tensões psicológicas do dia a dia.` },
      { id: 'D', text: `promoção da satisfação de necessidades artificiais.` },
      { id: 'E', text: `mecanismo de organização do ócio e do prazer.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q57',
    questionNumber: 57,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `A reflexão sobre o perdão apresentada no texto encontra fundamento na(s)`,
    supportText: `Quem se mete pelo caminho do pedido de perdão deve estar pronto a escutar uma palavra de recusa. Entrar na
atmosfera do perdão é aceitar medir-se com a possibilidade sempre aberta do imperdoável. Perdão pedido não é
perdão a que se tem direito [devido]. É com o preço destas reservas que a grandeza do perdão se manifesta.`,
    sourceCitation: `RICOEUR, P. O perdão pode curar. Disponível em: www.lusosofia.net. Acesso em: 14 out. 2019.`,
    options: [
      { id: 'A', text: `rejeição particular amparada pelo desejo de poder.` },
      { id: 'B', text: `decisão subjetiva determinada pela vontade divina.` },
      { id: 'C', text: `liberdade mitigada pela predestinação do espírito.` },
      { id: 'D', text: `escolhas humanas definidas pelo conhecimento empírico.` },
      { id: 'E', text: `relações interpessoais mediadas pela autonomia dos indivíduos.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q58',
    questionNumber: 58,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `Acesso em: 12 out. 2021 (adaptado). As mudanças culturais mencionadas no texto caracterizam-se pela presença de`,
    supportTitle: `A Cavalgada de Sant’Ana é uma expressão da devoção`,
    supportText: `dos vaqueiros à padroeira de Caicó (RN). Nas décadas de
1950 a 1970, esse evento, então denominado Cavalaria,
era celebrado pelas pessoas que residiam na zona rural
do município de Caicó. Essas pessoas usavam os animais
(jegues, mulas e cavalos) como único meio de transporte,
sobretudo para se dirigirem à cidade nos dias de feiras,
trazendo seus produtos para comercializarem. Estando em
Caicó no período da Festa de Sant’Ana, esses agricultores
se organizavam em cavalgada até o pátio da Catedral de
Sant’Ana para louvar a santa e receber bênção para seus
animais. Por volta da década de 1970, com a chegada do
automóvel à zona rural do município, essa expressão cultural
foi extinta. O meio de transporte utilizando os animais passou
a ser substituído por carros, sobretudo caminhonetes e
caminhões, que transportavam os camponeses para a
cidade em dias de feiras e festas. Desde 2002, um grupo de
caicoenses retomou essa expressão cultural e, em conjunto
com a associação dos vaqueiros, realiza no primeiro
domingo da Festa a Cavalgada de Sant’Ana. O evento, além
de contar com a participação dos cavaleiros que residem
nas zonas rurais, atrai também pessoas que residem em
Caicó, cidades vizinhas e amantes das vaquejadas.`,
    sourceCitation: `FESTA DE SANT’ANA. Disponível em: http://portal.iphan.gov.br.`,
    options: [
      { id: 'A', text: `elementos tradicionais e modernos em torno de uma crença religiosa.` },
      { id: 'B', text: `argumentos teológicos e históricos em consequência de uma ordem papal.` },
      { id: 'C', text: `fundamentos estéticos e etnográficos em função de uma cerimônia clerical.` },
      { id: 'D', text: `práticas corporais e esportivas em decorrência de uma imposição eclesiástica.` },
      { id: 'E', text: `discursos filosóficos e antropológicos em resultado de uma determinação paroquial.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q59',
    questionNumber: 59,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `O processo social relatado indica a formação de uma etiqueta que tem como princípio a`,
    supportTitle: `Do século XVI em diante, pelo menos nas classes`,
    supportText: `mais altas, o garfo passou a ser usado como utensílio
para comer, chegando através da Itália primeiramente à
França e, em seguida, à Inglaterra e à Alemanha, depois
de ter servido, durante algum tempo, apenas para retirar
alimentos sólidos da travessa. Henrique III introduziu-o
na França, trazendo-o provavelmente de Veneza. Seus
cortesãos não foram pouco ridicularizados por essa
maneira “afetada” de comer e, no princípio, não eram
muito hábeis no uso do utensílio: pelo menos se dizia
que metade da comida caía do garfo no caminho do prato
à boca. Em data tão recente como o século XVII, o garfo
era ainda basicamente artigo de luxo, geralmente feito de
prata ou ouro.
ELIAS, N. O processo civilizador: uma história dos costumes.`,
    sourceCitation: `Rio de Janeiro: Zahar, 1994.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `distinção das classes sociais.` },
      { id: 'B', text: `valorização de hábitos de higiene.` },
      { id: 'C', text: `exaltação da cultura mediterrânea.` },
      { id: 'D', text: `consagração de tradições medievais.` },
      { id: 'E', text: `disseminação de produtos manufaturados.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q60',
    questionNumber: 60,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `https://valorinveste.globo.com. Acesso em: 23 out. 2021 (adaptado). O texto apresenta tipos de conduta sujeitos a punição, conforme previsto na Lei Maria da Penha, porque consistem em formas de`,
    supportTitle: `Negar o pedido por dinheiro indispensável para`,
    supportText: `necessidades pessoais ou comprar bens usando o nome
da pessoa sem o consentimento dela. Ameaçar o corte
de recursos dependendo de atitudes pessoais, esconder
documentos ou trocar senhas do banco sem avisar.
Ou, ainda, proibir a pessoa de trabalhar ou destruir seus
pertences. As histórias são comuns, mas às vezes não são
reconhecidas como abuso. Mas é uma das cinco formas de
conduta contra a mulher previstas na Lei Maria da Penha.`,
    sourceCitation: `LEWGOY, J. Conduta quase invisível destrói a vida de mulheres. Disponível em:`,
    options: [
      { id: 'A', text: `ação difamatória.` },
      { id: 'B', text: `desvio comportamental.` },
      { id: 'C', text: `expressão preconceituosa.` },
      { id: 'D', text: `violência patrimonial.` },
      { id: 'E', text: `desentendimento matrimonial.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q61',
    questionNumber: 61,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `O texto critica a mudança tecnológica em razão da seguinte consequência:`,
    supportTitle: `Por trás da “mágica” do Google Assistant de sua`,
    supportText: `capacidade de interpretar 26 idiomas está uma enorme
equipe de linguistas distribuídos globalmente, trabalhando
como subcontratados, que devem rotular tediosamente os
dados de treinamento para que funcione. Eles ganham
baixos salários e são rotineiramente forçados a trabalhar
horas extras não remuneradas. A inteligência artificial não
funciona com um pozinho mágico. Ela funciona por meio
de trabalhadores que treinam algoritmos incansavelmente
até que eles automatizem seus próprios trabalhos.
A Inteligência Artificial (IA) da economia freelancer está vindo atrás de você.`,
    sourceCitation: `Disponível em: https://mittechreview.com.br. Acesso em: 6 out. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `Diversificação da função.` },
      { id: 'B', text: `Mobilidade da população.` },
      { id: 'C', text: `Autonomia do empregado.` },
      { id: 'D', text: `Concentração da produção.` },
      { id: 'E', text: `Invisibilidade do profissional.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q62',
    questionNumber: 62,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `Os atos de competição citados têm suas origens históricas vinculadas a um contexto de`,
    supportTitle: `Enormes alto-falantes sul-coreanos instalados na`,
    supportText: `fronteira com o Norte costumavam transmitir desde
canções em estilo K-pop (como é chamado o pop
sul-coreano) até boletins climáticos e noticiário crítico ao
vizinho comunista. O Norte costuma praticar atividade
semelhante, transmitindo por seus alto-falantes discursos
críticos a Seul e aliados. Durante os anos 1980, o governo
sul-coreano construiu um mastro de 97 metros de altura
para hastear sua bandeira no povoado de Daesong-dong,
na fronteira com o Norte. O Norte respondeu com a
construção de um mastro ainda mais alto (160 m) na
cidade fronteiriça de Gijung-dong. “Essas demonstrações
são uma válvula de escape competitiva e importante entre
os dois lados, fora de um possível conflito militar”, diz o
analista Ankit Panda.
TAN, Y. Disputa de mastros e alto-falantes com K-pop: as pequenas picuinhas do conflito`,
    sourceCitation: `entre as Coreias. Disponível em: www.bbc.com. Acesso em: 7 nov. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `domínio cultural-identitário de atores sociais.` },
      { id: 'B', text: `disputas étnico-raciais de povos tradicionais.` },
      { id: 'C', text: `divergências político-ideológicas de agentes estatais.` },
      { id: 'D', text: `imposição econômico-financeira de empresas privadas.` },
      { id: 'E', text: `protestos ecológico-sustentáveis de entidades ambientais.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q63',
    questionNumber: 63,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `Acesso em: 23 nov. 2021 (adaptado). O desenvolvimento do processo artístico descrito no texto foi possível pelo(a)`,
    supportTitle: `Seda, madeiras aromáticas e têxteis, obras de arte,`,
    supportText: `lã, cristais e muitas, muitas peças de porcelana chegaram
ao Brasil ao longo dos séculos XVII e XVIII. A opulência
proporcionada pelo ouro fez com que esses itens fossem
ainda mais presentes em cidades mineiras como Ouro Preto,
Mariana e Sabará. Esses objetos inspiraram a criação das
chinesices, termo que designa um tipo de arte que evoca
motivos chineses, presentes em várias igrejas barrocas de
Minas Gerais. No Brasil, é bem provável que a inspiração
para as pinturas nas igrejas barrocas com pássaros,
elefantes, tigres, mandarins e pagodes tenha sido tirada de
gravuras, tecidos, móveis e, principalmente, das porcelanas
chinesas que circulavam livremente em uma sociedade
enriquecida pelo comércio do ouro e pedras preciosas.
MARIUZZO, P. Estudos interdisciplinares ampliam conhecimento sobre`,
    sourceCitation: `chinesice no barroco mineiro. Disponível em: http://cienciaecultura.bvs.br.`,
    options: [
      { id: 'A', text: `representação arquitetônica.` },
      { id: 'B', text: `intercâmbio transcontinental.` },
      { id: 'C', text: `dependência econômica.` },
      { id: 'D', text: `intervenção estatal.` },
      { id: 'E', text: `padrão estético.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q64',
    questionNumber: 64,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `O discurso da líder indígena explicita um problema global relacionado ao(à)`,
    supportTitle: `Txai Suruí, liderança da Juventude Indígena,`,
    supportText: `profere seu discurso na abertura da COP-26
“O clima está esquentando, os animais estão
desaparecendo, os rios estão morrendo e nossas
plantações não florescem como no passado. A Terra está
falando: ela nos diz que não temos mais tempo.”
VICK, M. Quais são as conquistas do movimento indígena na COP-26.`,
    sourceCitation: `Disponível em: www.nexojornal.com.br. Acesso em: 10 nov. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `manejo tradicional.` },
      { id: 'B', text: `reciclagem residual.` },
      { id: 'C', text: `consumo consciente.` },
      { id: 'D', text: `exploração predatória.` },
      { id: 'E', text: `reaproveitamento energético.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q65',
    questionNumber: 65,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `As transformações pelas quais passaram as sociedades ocidentais e que possibilitaram o reconhecimento recente do trabalho da arquiteta mencionada no texto foram resultado das mobilizações sociais pela`,
    supportTitle: `Nas reportagens publicadas sobre a inauguração do`,
    supportText: `Museu de Arte de São Paulo, em 1947, quando ele ainda
ocupava um edifício na rua Sete de Abril, Lina Bo Bardi não foi
mencionada nenhuma vez. A arquiteta era responsável pelo
projeto do museu que mudaria para sempre a posição de São
Paulo no circuito mundial das artes. Mas não houve nenhum
registro disso. O louvor se concentrou em seu marido e
parceiro profissional, o respeitado crítico de arte Pietro Maria
Bardi. Passados 75 anos, a mulher então ignorada recebeu
um Leão de Ouro póstumo, a maior homenagem da Bienal
de Arquitetura de Veneza, e tem agora sua história contada
em duas biografias de peso, que procuram destrinchar uma
carreira marcada pela ousadia e pela contradição.
PORTO, W. Lina Bo Bardi tem sua arquitetura contraditória destrinchada em biografias.`,
    sourceCitation: `Disponível em: www1.folha.uol.com.br. Acesso em: 10 nov. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `equidade de gênero.` },
      { id: 'B', text: `liberdade de expressão.` },
      { id: 'C', text: `admissibilidade de voto.` },
      { id: 'D', text: `igualdade de oportunidade.` },
      { id: 'E', text: `reciprocidade de tratamento.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q66',
    questionNumber: 66,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Considerando a realidade brasileira, os textos se aproximam ao apresentarem uma reflexão sobre o(a)`,
    supportText: `TEXTO I
Como é horrivel ver um filho comer e perguntar: “Tem
mais?” Esta palavra “tem mais” fica oscilando dentro do
cerebro de uma mãe que olha as panela e não tem mais.
TEXTO II
A experiência de ver os filhos com fome na década
de 1950, descrita por Carolina, é vivida no Brasil de 2021
por uma moradora de Petrolândia, em Pernambuco. “Eu
trabalhava de ajudante de cabeleireira, mas a moça que
tinha o salão fechou. Eu vinha me sustentando com o
auxílio que tinha, mas agora eu não fui contemplada. Às
vezes as pessoas me ajudam com alimentos para os meus
filhos. De vez em quando, eu acho algum bico para fazer,
mas é muito raro. Tem dias que não tenho nem o leite da
minha bebê.”
CARRANÇA, T. “Até o feijão nos esqueceu”: o livro de 1960 que poderia ter sido escrito`,
    sourceCitation: `JESUS, C. M. Quarto de despejo: diário de uma favelada. São Paulo: Ática, 2014. nas favelas de 2021. Disponível em: www.bbc.com. Acesso em: 6 out. 2021 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `recorrência da miséria.` },
      { id: 'B', text: `planejamento da saúde.` },
      { id: 'C', text: `superação da escassez.` },
      { id: 'D', text: `constância da economia.` },
      { id: 'E', text: `romantização da carência.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q67',
    questionNumber: 67,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `A prática produtiva apresentada é um exemplo de`,
    supportTitle: `No sul da Bahia, desde o século XVIII, tem-se`,
    supportText: `registros de um tipo de sistema agroflorestal. Até hoje,
esse sistema é característica marcante da paisagem
da região, conhecido como cabruca, que consiste no
cultivo do cacau à sombra do dossel da floresta nativa.
Esse sistema de cultivo do cacau (graças à tolerância
da espécie à sombra) é considerado amigável para a
vida silvestre, pois apresenta superioridade em termos
de conservação da biodiversidade quando comparado
com outras plantações tropicais (monoculturas de dendê,
seringa ou café), agricultura ou pastagens.
SOLLBERG, I.; SCHIAVETTI, A.; MORAES, M. E. B. Manejo agrícola no
Refúgio de Vida Silvestre de Una: agroflorestas como uma perspectiva`,
    sourceCitation: `de conservação. Revista Árvore, n. 2, 2014 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `difusão comercial de lavouras temporárias.` },
      { id: 'B', text: `utilização sustentável dos recursos naturais.` },
      { id: 'C', text: `ampliação tecnológica da pecuária intensiva.` },
      { id: 'D', text: `padronização alimentar dos povos tradicionais.` },
      { id: 'E', text: `modernização logística de plantios convencionais.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q68',
    questionNumber: 68,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `A aglomeração urbana representada no texto resulta em`,
    supportTitle: `O masseiro, a mulher, e quatro filhos, dormindo numa`,
    supportText: `tapera de quatro paredes de caixão, coberta de zinco.
A água do mangue, na maré cheia, ia dentro de casa.
Os maruins de noite encalombavam o corpo dos meninos.
O mangue tinha ocasião que fedia, e os urubus faziam
ponto por ali atrás dos petiscos. Perto da rua lavavam
couro de boi, pele de bode para o curtume de um espanhol.
Morria peixe envenenado, e quando a maré secava, os
urubus enchiam o papo, ciscavam a lama, passeando
banzeiros pelas biqueiras dos mocambos no Recife.`,
    sourceCitation: `RÊGO, J. L. O moleque Ricardo. Rio de Janeiro: J. Olympio, 1966 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `conservação do meio rural.` },
      { id: 'B', text: `crescimento da vegetação ciliar.` },
      { id: 'C', text: `interferência do espaço geográfico.` },
      { id: 'D', text: `equilíbrio do ambiente das cidades.` },
      { id: 'E', text: `controle da proliferação dos animais.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q69',
    questionNumber: 69,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `O texto evidencia situação representativa de`,
    supportTitle: `Elas foram as pioneiras dos direitos das mulheres`,
    supportText: `no Afeganistão. Defensoras ferrenhas da lei, buscaram
justiça para os mais marginalizados. Mas, agora, mais
de 220 juízas afegãs estão escondidas por medo de
retaliação sob o regime do Talibã. Uma delas condenou
centenas de homens por violência contra as mulheres,
incluindo estupro, assassinato e tortura. Mas poucos dias
depois que o Talibã assumiu o controle de sua cidade
e milhares de criminosos condenados foram libertados
da prisão, as ameaças de morte começaram. O país
sempre foi considerado um dos lugares mais difíceis e
perigosos do mundo para as mulheres. De acordo com
estudos de organizações não governamentais, cerca de
87% das mulheres e meninas serão vítimas de abuso
durante a vida.`,
    sourceCitation: `Disponível em: https://g1.globo.com. Acesso em: 12 out. 2021 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `afronta às estruturas sociais.` },
      { id: 'B', text: `desprezo aos valores religiosos.` },
      { id: 'C', text: `transgressão às normas morais.` },
      { id: 'D', text: `desrespeito à dignidade humana.` },
      { id: 'E', text: `oposição aos princípios hierárquicos.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q70',
    questionNumber: 70,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `O acontecimento descrito no texto, ocorrido em meados dos anos 1970, atesta a seguinte característica do regime político-institucional vigente:`,
    supportTitle: `No cemitério, a sociedade religiosa encarregada do`,
    supportText: `funeral, aterrorizada, apressou a cerimônia de tal forma que
a mãe de Herzog perdeu o momento em que o caixão do
filho começou a ser coberto pela terra. Quatro jornalistas
que estavam presos no DOI chegaram para assistir ao
sepultamento. Um se afastara, chorando. Dizia: Eles matam,
eles matam! Não pergunte nada. Não podemos dizer
nada. Eles matam mesmo. Falava-se baixo. Ouviram-se
dois curtos discursos. O primeiro, da atriz Ruth Escobar:
Até quando vamos suportar tanta violência? Até quando
vamos continuar enterrando nossos mortos em silêncio?
No segundo, Audálio Dantas recitou o Navio negreiro, de
Castro Alves: Senhor Deus dos desgraçados / Dizei-me
Vós, Senhor Deus / Se é mentira, se é verdade, / Tanto
horror perante os céus.`,
    sourceCitation: `GASPARI, E. A ditadura encurralada. São Paulo: Cia. das Letras, 2004.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `Incorporação da estética popular para justificar o ideal de integração nacional.` },
      { id: 'B', text: `Afirmação da estratégia psicossocial para favorecer o objetivo de propaganda cívica.` },
      { id: 'C', text: `Institucionalização de mecanismos repressivos para eliminar os focos de resistência.` },
      { id: 'D', text: `Adoção de cerimoniais públicos para controlar as manifestações de grupos opositores.` },
      { id: 'E', text: `Estatização de meios de comunicação para selecionar a divulgação de atos governamentais.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q71',
    questionNumber: 71,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `Na visão do autor, o problema central da situação descrita é desencadeado pela`,
    supportTitle: `Alternativas logísticas estão servindo de instrumentos`,
    supportText: `que ativam os mercados especuladores de terras
nas diferentes regiões da Amazônia e constituem em
indicadores utilizados por diferentes atores para defender
ou denunciar o avanço da cultura da soja na região e,
com ela, a retomada do desmatamento. É evidente que
o crescimento do desmatamento tem a ver também com
a expansão da soja, porém atribuir a ela o fator principal
parece não totalmente correto. Parto da compreensão
central de que a lógica que gera o desmatamento está
articulada pelo tripé grileiros, madeireiros e pecuaristas.
OLIVEIRA, A. U. A Amazônia e a nova geografia da produção da soja.`,
    sourceCitation: `Terra Livre, n. 26, jan.-jun. 2006 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `apropriação de áreas devolutas.` },
      { id: 'B', text: `sonegação de impostos federais.` },
      { id: 'C', text: `incorporação de exportação ilegal.` },
      { id: 'D', text: `desoneração de setores produtivos.` },
      { id: 'E', text: `flexibilização de legislação ambiental.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q73',
    questionNumber: 73,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `Qual acontecimento do período contribuiu diretamente para o agravamento da situação descrita?`,
    supportTitle: `Os séculos XV e XVI, quando se vão desmoronando`,
    supportText: `as estruturas socioeconômicas da Idade Média perante
os novos imperativos da Época moderna, constituem um
momento-chave na história florestal de toda a Europa
Ocidental. Abre-se, genericamente, um longo período
de “crise florestal”, que se manifesta com acuidade nos
países onde mais se desenvolvem as atividades industriais
e comerciais. As necessidades em produtos lenhosos
aumentam drasticamente com o crescimento do consumo
nos mercados urbanos e nas regiões onde progridem a
metalurgia e a construção naval, além da sua utilização
na vida quotidiana de toda a população.
DEVY-VARETA, N. Para uma geografia histórica da floresta portuguesa.`,
    sourceCitation: `Revista da Faculdade de Letras — Geografia, n. 1, 1986 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `O processo de expansão marítima.` },
      { id: 'B', text: `A eclosão do renascimento cultural.` },
      { id: 'C', text: `A concretização da centralização política.` },
      { id: 'D', text: `O movimento de reformas religiosas.` },
      { id: 'E', text: `A manutenção do sistema feudal.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q74',
    questionNumber: 74,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `http://antigo.anphlac.org. Acesso em: 6 out. 2021 (adaptado). Ao comparar, no texto, a vertente da dominação territorial com os aspectos culturais, os incas tinham uma postura`,
    supportTitle: `Tahuantinsuyu — nome do Império Inca em quéchua —`,
    supportText: `era dividido em quatro partes ou suyus: Chinchaysuyu
(noroeste do Peru e Equador), Antisuyu (parte amazônica
do império), Collasuyu (atual Bolívia) e Condesuyu (costa
do Oceano Pacífico) e tinha Cuzco, no atual Peru,
como sua capital imperial. Oficialmente, todas as etnias
dominadas pelos incas deveriam adotar a língua quéchua,
adorar o Sapa Inca e o Sol e pagar taxas em forma de
horas de trabalhos periódicos. No entanto, pode-se dizer
que o Império Inca era como um mosaico cultural em que
vários e diferentes grupos étnicos adoravam o Sapa Inca
e o Sol mas, simultaneamente, continuavam a adorar seus
deuses locais e também a falar em suas línguas nativas.`,
    sourceCitation: `MARTINS, C. Os incas e os tahuantinsuyu: apresentação. Disponível em:`,
    options: [
      { id: 'A', text: `aceitável no que alude aos direitos humanos.` },
      { id: 'B', text: `admissível no que remete às crenças coloniais.` },
      { id: 'C', text: `tolerável no que se refere aos regimes tributários.` },
      { id: 'D', text: `flexível no que diz respeito aos costumes religiosos.` },
      { id: 'E', text: `compreensível no que concerne às normas laborais.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q75',
    questionNumber: 75,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Qual mudança no comportamento social a proposta reportada no texto reflete?`,
    supportTitle: `A torcida do Fluminense inicia um movimento para`,
    supportText: `mudar a letra de uma das músicas mais populares das
arquibancadas tricolores. Grupos pedem a remoção do
termo “mulambo imundo”, em uma provocação direta ao
Flamengo. Mulambo é um termo que surgiu em Angola,
na época da escravatura, e eles eram chamados de
mulambos pelos senhores de engenho, os patrões
das fazendas.`,
    sourceCitation: `Disponível em: https://oglobo.globo.com. Acesso em: 23 nov. 2021.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `Rejeição de costumes elitistas.` },
      { id: 'B', text: `Repulsão de condutas misóginas.` },
      { id: 'C', text: `Condenação do preconceito racial.` },
      { id: 'D', text: `Criminalização de práticas homofóbicas.` },
      { id: 'E', text: `Contestação do comportamento machista.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q77',
    questionNumber: 77,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Escrito em 1828, o texto expressa a seguinte ideia de origem iluminista:`,
    supportTitle: `Havia já muito tempo que a Europa desfrutava os`,
    supportText: `benefícios da vacina e arrancava à morte milhares de
inocentes, condenados a serem vítimas do terrível flagelo
das bexigas, e o governo de Portugal nunca se lembrara de
transmitir ao Brasil a mais útil das descobertas humanas,
quando aliás nenhum país mais do que ele carecia deste
salutar invento ou se atendesse às vantagens da população
ou ao perdimento de imensas somas na mortandade
contínua de escravos, que este flagelo devorava. O certo
é que mais ocupado de seu ouro que de seus habitantes,
Portugal, como em outros muitos casos, esperou que o
Brasil por seu próprio impulso remediasse a este mal.
PEREIRA, J. C. 12 jan. 1828 apud LOPES, M. B.; POLITO, R. Para uma história
da vacina no Brasil: um manuscrito inédito de Norberto e Macedo. História,`,
    sourceCitation: `Ciências, Saúde — Manguinhos, n. 2, abr.-jun. 2007 (adaptado).`,
    options: [
      { id: 'A', text: `As leis observáveis regem o mundo material.` },
      { id: 'B', text: `O monarca racional promove a sociedade justa.` },
      { id: 'C', text: `O direito natural justifica a liberdade dos homens.` },
      { id: 'D', text: `A produção da terra garante a riqueza das nações.` },
      { id: 'E', text: `A responsabilidade dos governantes assegura a saúde dos povos.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q78',
    questionNumber: 78,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `A prática agrícola destacada no texto apresenta como vantagem no espaço urbano a`,
    supportTitle: `Os movimentos da agricultura urbana no Rio de`,
    supportText: `Janeiro vêm crescendo nos últimos vinte anos, tanto
por meio de reproduções de modelos de vida antigos,
vinculados ao resgate dos próprios costumes, como — e
cada vez mais — são revelados hábitos inventivos nos
quais moradores urbanos de diferentes classes sociais,
sem nenhuma referência anterior com o campo, passam a
se dedicar a essas atividades. Ao possibilitar o acesso ao
plantio e, consequentemente, à alimentação, permite-se
uma nova relação com o que se come, reduzindo o
percurso da cadeia produtiva e aproximando produtores
de consumidores, pois ambos se confundem nas
experiências de agricultura urbana.
PORTILHO, M.; RODRIGUES, C. G. O.; FERNANDEZ, A. C. F. Cultivando relações no
arranjo local da Penha: a mobilização de mulheres a partir das práticas de agricultura`,
    sourceCitation: `urbana na favela. Cidades, Comunidades e Territórios, n. 42, jun. 2021.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `ocupação de lugares ociosos.` },
      { id: 'B', text: `densificação da área central.` },
      { id: 'C', text: `valorização do mercado externo.` },
      { id: 'D', text: `priorização de insumos químicos.` },
      { id: 'E', text: `mecanização de técnicas de cultivo.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q79',
    questionNumber: 79,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `A postura determinista adotada pelo personagem Gerineldo contrasta com a ideia existencialista contida no pensamento filosófico de Sartre porque`,
    supportText: `TEXTO I
Gerineldo dorme porque já está conformado com o
seu mundo. Porque já sabe tudo o que lhe pode acontecer
após haver submetido todos os objetos que o rodeiam a um
minucioso inventário de possibilidades. Seu apartamento,
mais que um apartamento, é uma teoria de sorte e de azar.
Melhor que ninguém, Gerineldo conhece o coeficiente
da dilatação de suas janelas e mantém marcado no
termômetro, com uma linha vermelha, o ponto em que
se quebrarão os vidros, despedaçados em estilhaços
de morte. Sabe que os arquitetos e os engenheiros já
previram tudo, menos o que nunca já aconteceu.
TEXTO II
A situação é o sujeito inteiro (ele não é nada a não ser
a sua situação) e é também a coisa inteira (nunca há mais
nada senão as coisas). É o sujeito a elucidar as coisas
pela sua própria superação, se assim quisermos; ou são
as coisas a reenviar ao sujeito a imagem dele. É a total
facticidade, a contingência absoluta do mundo, do meu
nascimento, do meu lugar, do meu passado, dos meus
redores — e é a minha liberdade sem limites que faz com
que haja para mim uma facticidade.
SARTRE, J.-P. O ser e o nada: ensaio de ontologia fenomenológica.`,
    sourceCitation: `MÁRQUEZ, G. G. O pessimista. In: Textos do Caribe. Rio de Janeiro: Record, 1981. Petrópolis: Vozes, 1997 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `evidencia a manifestação do inconsciente.` },
      { id: 'B', text: `nega a possibilidade de transcendência.` },
      { id: 'C', text: `contraria o conhecimento difuso.` },
      { id: 'D', text: `sustenta a fugacidade da vida.` },
      { id: 'E', text: `refuta a evolução biológica.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q80',
    questionNumber: 80,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Os sindicatos rurais foram tratados da forma descrita no texto porque o governo pretendia utilizá-los para`,
    supportTitle: `O Golpe Militar de 1964 foi implacável no combate`,
    supportText: `ao que restava das Ligas Camponesas, generalizadas na
década anterior. No entanto, em relação aos sindicatos,
sua atitude foi ambígua. Por meio de acordos com os
Estados Unidos, foram concebidos centros sindicais e
cursos de liderança com base em princípios conservadores
e ministrados por membros da Igreja Católica.
DEL PRIORE, M.; VENÂNCIO, R. Uma história da vida rural no Brasil.`,
    sourceCitation: `Rio de Janeiro: Ediouro, 2006 (adaptado).`,
    options: [
      { id: 'A', text: `controlar as tensões políticas.` },
      { id: 'B', text: `limitar a legislação trabalhista.` },
      { id: 'C', text: `divulgar o programa populista.` },
      { id: 'D', text: `regularizar a propriedade da terra.` },
      { id: 'E', text: `estimular a oferta de mão de obra.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q81',
    questionNumber: 81,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `O texto apresenta uma relação de cálculo político-econômico que caracteriza o poder punitivo por meio da`,
    supportTitle: `A economia das ilegalidades se reestruturou com o`,
    supportText: `desenvolvimento da sociedade capitalista. A ilegalidade dos
bens foi separada da ilegalidade dos direitos. Divisão que
corresponde a uma oposição de classes, pois, de um lado, a
ilegalidade mais acessível às classes populares será a dos
bens — transferência violenta das propriedades; de outro,
à burguesia, então, se reservará a ilegalidade dos direitos:
a possibilidade de desviar seus próprios regulamentos
e suas próprias leis; e essa grande redistribuição das
ilegalidades se traduzirá até por uma especialização dos
circuitos judiciários; para as ilegalidades de bens — para
o roubo — os tribunais ordinários e os castigos; para
as ilegalidades de direitos — fraudes, evasões fiscais,
operações comerciais irregulares — jurisdições especiais
com transações, acomodações, multas atenuadas etc.`,
    sourceCitation: `FOUCAULT, M. Vigiar e punir: nascimento da prisão. Petrópolis: Vozes, 1987.`,
    options: [
      { id: 'A', text: `gestão das ilicitudes pelo sistema judicial.` },
      { id: 'B', text: `aplicação das sanções pelo modelo equânime.` },
      { id: 'C', text: `supressão dos crimes pela penalização severa.` },
      { id: 'D', text: `regulamentação dos privilégios pela justiça social.` },
      { id: 'E', text: `repartição de vantagens pela hierarquização cultural.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q82',
    questionNumber: 82,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `Conforme o texto, as correspondências trocadas entre imigrantes no Brasil com os seus países de procedência constituíam um dispositivo tecnológico que possibilitava o(a)`,
    supportTitle: `Os vapores cruzavam os mares transportando`,
    supportText: `pessoas, mercadorias e ideias, e ainda carregavam a mala
postal, repleta de mensagens. Múltiplas histórias escritas
atravessavam o oceano buscando por notícias de filhos e
pais, irmãos, maridos e esposas, noivos e noivas. As missivas
traziam boas e más novas, comunicavam alegremente
nascimentos e casamentos, também doenças e mortes;
enviavam declarações de amor e fidelidade, fotos de família;
encaminhavam conselhos de velhos, pedidos de ajuda e de
dinheiro; expediam cartas bancárias e de chamada. Essa
literatura epistolar possibilitava a transmissão e reconstrução
das tradições. Os deslocamentos tornaram-se um dos mais
potentes produtores de escritura ao longo da história.
TRUZZI, O.; MATOS, I. Saudades: sensibilidades no epistolário de e/imigrantes`,
    sourceCitation: `portugueses (Portugal-Brasil 1890-1930). Rev. Bras. Hist., n. 70, jul.-dez. 2015.`,
    options: [
      { id: 'A', text: `disputa ideológica entre a comunidade de estrangeiros e a de nativos.` },
      { id: 'B', text: `circularidade cultural entre a sociedade de partida e a de acolhimento.` },
      { id: 'C', text: `controle doutrinário das narrativas do cotidiano de origem e de destino.` },
      { id: 'D', text: `fiscalização política dos fluxos de populações do Novo e do Velho Mundo.` },
      { id: 'E', text: `monitoramento social dos grupos de trabalhadores da cidade e do campo.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q83',
    questionNumber: 83,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Geografia',
    prompt: `A partir da ocupação desordenada exposta no texto, o que impede a recuperação do recurso natural destacado é a`,
    supportTitle: `Diversos são os fatores causadores da degradação`,
    supportText: `do solo, atuando de forma direta ou indireta, mas quase
sempre a grande maioria das terras degradadas inicia esse
processo com o desmatamento, que pode ser seguido
por diversas formas de ocupação desordenada, como:
corte de taludes para a construção de casas, rodovias e
ferrovias, agricultura, com uso da queimada, vários tipos de
mineração, irrigação excessiva, crescimento desordenado
das cidades, superpastoreio, uso do solo para diversos
tipos de despejos industriais e domésticos, sem tratamento
da área que recebe esses despejos; enfim, de uma forma
ou de outra, os solos tornam-se degradados, sendo muitas
vezes difícil, ou quase impossível, a sua recuperação.
GUERRA, A. T. Degradação dos solos: conceitos e temas. In: GUERRA, A. T.;
JORGE, M. C. O. (Org.). Degradação dos solos no Brasil.`,
    sourceCitation: `Rio de Janeiro: Difel, 2018.`,
    options: [
      { id: 'A', text: `elevação da biomassa.` },
      { id: 'B', text: `redução da salinização.` },
      { id: 'C', text: `diminuição da fertilidade.` },
      { id: 'D', text: `ampliação da microfauna.` },
      { id: 'E', text: `decomposição do substrato.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q84',
    questionNumber: 84,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `No contexto descrito, as mudanças mencionadas proporcionavam às mulheres o(a)`,
    supportTitle: `A partir da década de 1930, começam a ser discutidos`,
    supportText: `no Brasil os princípios de racionalização do trabalho.
As preocupações com a cozinha e o trabalho doméstico
foram introduzidas com a medicina sanitária e a oferta
de gás e eletricidade para uso doméstico no início do
século XX. A organização da cozinha visava atingir
uma simplificação das tarefas, com a economia de
movimentos, e o barateamento dos equipamentos, a
partir da produção em grande escala. A padronização e
racionalização da habitação e seus componentes visava
uma radical transformação da casa, em especial da
cozinha, e apoiava-se tanto no desenvolvimento de novos
equipamentos quanto nos estudos de racionalização
do trabalho doméstico. A principal preocupação era
o desenvolvimento de um novo tipo de habitação, que
deveria induzir um novo comportamento social.
SILVA, J. L. M. Transformações no espaço doméstico: o fogão a gás e a cozinha`,
    sourceCitation: `paulistana, 1870-1930. Anais do Museu Paulista, n. 2, jul.-dez. 2007 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `controle do orçamento familiar.` },
      { id: 'B', text: `libertação das tradições religiosas.` },
      { id: 'C', text: `exercício da representatividade política.` },
      { id: 'D', text: `ampliação dos momentos de socialização.` },
      { id: 'E', text: `afastamento das atividades especializadas.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q85',
    questionNumber: 85,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `No contexto do acordo citado, os dois grupos econômicos europeus defendem, respectivamente, a`,
    supportTitle: `Produtores rurais europeus são antigos opositores`,
    supportText: `de um grande acordo com o Mercosul. Na visão deles,
existe um nítido risco de concorrência desleal, pois, na
Europa, é preciso seguir regras mais rígidas de produção,
o que encarece o processo. Assim, eles não conseguiriam
competir com os preços, por exemplo, da carne brasileira
e teriam seus negócios ameaçados. Por outro lado, o setor
industrial europeu se mobiliza a favor do acordo, uma
vez que as reduções de tarifas no comércio internacional
dariam maior acesso ao mercado sul-americano. Um
exemplo é o setor automotivo europeu, que prevê maior
participação e concorrência nos países do Mercosul caso
o acordo siga em frente.
ROUBICEK, M. Como o risco ambiental afeta o acordo entre Mercosul e União Europeia.`,
    sourceCitation: `Disponível em: www.nexojornal.com.br. Acesso em: 25 out. 2021.`,
    options: [
      { id: 'A', text: `restrição dos fluxos migratórios e a maior atuação de sindicatos.` },
      { id: 'B', text: `ampliação das leis trabalhistas e a plena importação de manufaturados.` },
      { id: 'C', text: `proteção das florestas nacionais e a ampla transferência de tecnologias.` },
      { id: 'D', text: `manutenção das barreiras fitossanitárias e a livre circulação de mercadorias.` },
      { id: 'E', text: `remoção dos entraves alfandegários e a melhor remuneração de empregados.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q86',
    questionNumber: 86,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'História',
    prompt: `O comportamento desenvolvido pela personagem evidencia uma postura de`,
    supportTitle: `Durante a Revolução Francesa, um certo padre Niollant`,
    supportText: `escondeu-se no pequeno castelo de L’Escarbas. Pagou
amplamente a hospitalidade do velho fidalgo ocupando-se
da educação de sua filha, Anaïs. A presença da mãe em
nada modificou essa educação masculina dada a uma
jovem criatura já muito inclinada à independência em
virtude da vida no campo. O padre transmitiu à aluna sua
intrepidez de opiniões e sua facilidade de julgamento,
sem pensar que essas qualidades, tão necessárias num
homem, se tornam defeitos numa mulher destinada aos
humildes afazeres de mãe de família. Embora o padre
recomendasse continuamente à aluna ser tanto mais
graciosa e modesta quanto seu saber era mais extenso,
a senhorita de Nègrepelisse ficou com excelente opinião
de si mesma.`,
    sourceCitation: `BALZAC, H. Ilusões perdidas. São Paulo: Penguin Classics; Cia. das Letras, 2011 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `abandono de laços afetivos.` },
      { id: 'B', text: `negação da ideia de subjetividade.` },
      { id: 'C', text: `aceitação da hierarquia de gênero.` },
      { id: 'D', text: `consolidação da estratificação social.` },
      { id: 'E', text: `ruptura de valores institucionalizados.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q87',
    questionNumber: 87,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Sociologia',
    prompt: `Conforme descrito nos textos, o tratamento dispensado aos grupos mencionados se fundamentava em`,
    supportText: `TEXTO I
Oriunda da Romênia, Genny Gleizer aportou no Brasil
em 1932. Assim como milhares de judeus do Leste Europeu,
sua vinda para o Brasil ocorreu em um momento de ascensão
do antissemitismo na Europa que tornava precárias suas
vidas. O Brasil se colocava como uma possibilidade na
busca por condições de sobrevivência e desenvolvimento.
ANTÃO, A. C. C. B. Gênero, imigração e política: o caso da judia comunista Genny Gleizer
TEXTO II
A presença judaica no Brasil foi criando aos poucos
certas desconfianças que se refletiram em órgãos da
imprensa e em círculos intelectuais e políticos. Em parte,
essa imagem negativa adviria da onda nacionalista surgida
no final dos anos 1910, que concebia imigrantes como
concorrentes dos trabalhadores brasileiros, ou como
seres improdutivos, exploradores da mão de obra e da
riqueza autóctone. Além disso, as elites políticas da época
acreditavam que os estrangeiros eram portadores das
doutrinas anarquista e comunista, estranhas à “índole
do povo brasileiro”. Esses “indesejáveis” seriam um mal
externo que corromperia a nação.
no Brasil. In: GRINBERG, K. (Org.). Os judeus no Brasil.`,
    sourceCitation: `no Governo Vargas (1932-1935). Rio de Janeiro: Casa de Oswaldo Cruz, 2017 (adaptado). MAIO, M. C.; CALAÇA, C. E. Um balanço da bibliografia sobre o antissemitismo Rio de Janeiro: Civilização Brasileira, 2005 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `preceitos teológicos e religiosos.` },
      { id: 'B', text: `aspectos socioeconômicos e ideológicos.` },
      { id: 'C', text: `regulamentações territoriais e alfandegárias.` },
      { id: 'D', text: `orientações constitucionais e estatutárias.` },
      { id: 'E', text: `decretos legislativos e internacionais.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q88',
    questionNumber: 88,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `De acordo com a diferenciação feita pelo autor, que prática econômica é considerada moralmente condenável?`,
    supportText: `Concorrer e competir não são a mesma coisa.
A concorrência pode até ser saudável sempre que a batalha
entre agentes, para melhor empreender uma tarefa e obter
melhores resultados finais, exige o respeito a certas regras de
convivência preestabelecidas ou não. Já a competitividade
se funda na invenção de novas armas de luta, num exercício
em que a única regra é a conquista da melhor posição.
A competitividade é uma espécie de guerra em que tudo
vale e, desse modo, sua prática provoca um afrouxamento
dos valores morais e um convite ao exercício da violência.
SANTOS, M. Por uma outra globalização: do pensamento único`,
    sourceCitation: `à consciência universal. Rio de Janeiro: Record, 2006.`,
    options: [
      { id: 'A', text: `Adoção do dumping comercial.` },
      { id: 'B', text: `Fusão da função administrativa.` },
      { id: 'C', text: `Criação de holding empresarial.` },
      { id: 'D', text: `Limitação do mercado monopolista.` },
      { id: 'E', text: `Modernização da produção industrial.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-Q90',
    questionNumber: 90,
    languageTrack: null,
    area: 'human_sciences',
    topic: 'Filosofia',
    prompt: `A descrição crítica do personagem de Machado de Assis assemelha-se às características dos sofistas, contestados pelos filósofos gregos da Antiguidade, porque se mostra alinhada à`,
    supportText: `Não tinha outra filosofia. Nem eu. Não digo que a Universidade me não tivesse ensinado alguma; mas eu decorei-lhe
só as fórmulas, o vocabulário, o esqueleto. Tratei-a como tratei o latim; embolsei três versos de Virgílio, dois de
Horácio, uma dúzia de locuções morais e políticas, para as despesas da conversação. Tratei-os como tratei a história
e a jurisprudência. Colhi de todas as cousas a fraseologia, a casca, a ornamentação.`,
    sourceCitation: `ASSIS, M. Memórias póstumas de Brás Cubas. Belo Horizonte: Autêntica, 1999.`,
    options: [
      { id: 'A', text: `elaboração conceitual de entendimentos.` },
      { id: 'B', text: `utilização persuasiva do discurso.` },
      { id: 'C', text: `narração alegórica dos rapsodos.` },
      { id: 'D', text: `investigação empírica da physis.` },
      { id: 'E', text: `expressão pictográfica da pólis.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
];
