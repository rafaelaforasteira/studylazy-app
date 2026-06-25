import { buildEnem2023Day2Question } from './buildQuestion';

export const naturalSciencesQuestions: ReturnType<typeof buildEnem2023Day2Question>[] = [
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q92',
    questionNumber: 92,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Em qual região espectral se situa o comprimento de onda do laser que otimiza o armazenamento e a leitura de dados em discos de uma mesma área?`,
    supportText: `Informações digitais — dados — são gravadas em discos ópticos, como CD e DVD, na forma de cavidades
microscópicas. A gravação e a leitura óptica dessas informações são realizadas por um laser (fonte de luz monocromática).
Quanto menores as dimensões dessas cavidades, mais dados são armazenados na mesma área do disco. O fator limitante
para a leitura de dados é o espalhamento da luz pelo efeito de difração, fenômeno que ocorre quando a luz atravessa um
obstáculo com dimensões da ordem de seu comprimento de onda. Essa limitação motivou o desenvolvimento de lasers
com emissão em menores comprimentos de onda, possibilitando armazenar e ler dados em cavidades cada vez menores.`,
    contentBlocks: [
      { type: 'paragraph', text: `Informações digitais — dados — são gravadas em discos ópticos, como CD e DVD, na forma de cavidades` },
      { type: 'paragraph', text: `microscópicas. A gravação e a leitura óptica dessas informações são realizadas por um laser (fonte de luz monocromática).` },
      { type: 'paragraph', text: `Quanto menores as dimensões dessas cavidades, mais dados são armazenados na mesma área do disco. O fator limitante` },
      { type: 'paragraph', text: `para a leitura de dados é o espalhamento da luz pelo efeito de difração, fenômeno que ocorre quando a luz atravessa um` },
      { type: 'paragraph', text: `obstáculo com dimensões da ordem de seu comprimento de onda. Essa limitação motivou o desenvolvimento de lasers` },
      { type: 'paragraph', text: `com emissão em menores comprimentos de onda, possibilitando armazenar e ler dados em cavidades cada vez menores.` }
    ],
    options: [
      { id: 'A', text: `Violeta.` },
      { id: 'B', text: `Azul.` },
      { id: 'C', text: `Verde.` },
      { id: 'D', text: `Vermelho.` },
      { id: 'E', text: `Infravermelho.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q93',
    questionNumber: 93,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Para que o sinal de bluetooth seja detectado pelas antenas, o valor mínimo de sua intensidade, em W m2 , é mais próximo de`,
    supportText: `O bluetooth é uma tecnologia de comunicação sem fio, de curto alcance, presente em diferentes dispositivos
eletrônicos de consumo. Ela permite que aparelhos eletrônicos diferentes se conectem e troquem dados entre
si. No padrão bluetooth, denominado de Classe 2, as antenas transmitem sinais de potência igual a 2,4 mW e
possibilitam conectar dois dispositivos distanciados até 10 m. Considere que essas antenas se comportam como
fontes puntiformes que emitem ondas eletromagnéticas esféricas e que a intensidade do sinal é calculada pela
potência por unidade de área. Considere 3 como valor aproximado para π.`,
    contentBlocks: [
      { type: 'paragraph', text: `O bluetooth é uma tecnologia de comunicação sem fio, de curto alcance, presente em diferentes dispositivos` },
      { type: 'paragraph', text: `eletrônicos de consumo. Ela permite que aparelhos eletrônicos diferentes se conectem e troquem dados entre` },
      { type: 'paragraph', text: `si. No padrão bluetooth, denominado de Classe 2, as antenas transmitem sinais de potência igual a 2,4 mW e` },
      { type: 'paragraph', text: `possibilitam conectar dois dispositivos distanciados até 10 m. Considere que essas antenas se comportam como` },
      { type: 'paragraph', text: `fontes puntiformes que emitem ondas eletromagnéticas esféricas e que a intensidade do sinal é calculada pela` },
      { type: 'formula', latex: `potência por unidade de área. Considere 3 como valor aproximado para π.`, fallbackText: `potência por unidade de área. Considere 3 como valor aproximado para π.` }
    ],
    options: [
      { id: 'A', text: `2,0 × 10⁻6.` },
      { id: 'B', text: `2,0 × 10⁻5.` },
      { id: 'C', text: `2,4 × 10⁻5.` },
      { id: 'D', text: `2,4 × 10⁻3.` },
      { id: 'E', text: `2,4 × 10⁻1.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q95',
    questionNumber: 95,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Em uma indústria alimentícia, para produção de doce de leite, utiliza-se um tacho de parede oca com uma entrada para vapor de água a 120 °C e uma saída para água líquida em equilíbrio com o vapor a 100 °C. Ao passar pela parte oca do tacho, o vapor de água transforma-se em líquido, liberando energia. A parede transfere essa energia para o interior do tacho, resultando na evaporação de água e consequente concentração do produto. No processo de concentração do produto, é utilizada energia proveniente`,
    options: [
      { id: 'A', text: `somente do calor latente de vaporização.` },
      { id: 'B', text: `somente do calor latente de condensação.` },
      { id: 'C', text: `do calor sensível e do calor latente de vaporização.` },
      { id: 'D', text: `do calor sensível e do calor latente de condensação.` },
      { id: 'E', text: `do calor latente de condensação e do calor latente de vaporização.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q96',
    questionNumber: 96,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `Entre esses compostos, aquele que conferirá maior desempenho como combustível é o`,
    supportTitle: `A gasolina é uma mistura de hidrocarbonetos de`,
    supportText: `cadeias saturadas contendo de 8 a 12 átomos de carbono.
Além disso, a gasolina de alto desempenho deve conter
elevados teores de hidrocarbonetos de cadeias ramificadas,
de forma a resistir à compressão e entrar em ignição apenas
quando a vela aciona uma centelha elétrica no motor.
No quadro, estão apresentados compostos que podem
ser utilizados como combustíveis.
Composto Nomenclatura
I n-decano
II n-heptano
III 2,2,4-trimetilpentano
IV 3-etil-4-metilex-1-eno
V 3-etil-2-metilpentan-1-ol`,
    contentBlocks: [
      { type: 'paragraph', text: `A gasolina é uma mistura de hidrocarbonetos de` },
      { type: 'paragraph', text: `cadeias saturadas contendo de 8 a 12 átomos de carbono.` },
      { type: 'paragraph', text: `Além disso, a gasolina de alto desempenho deve conter` },
      { type: 'paragraph', text: `elevados teores de hidrocarbonetos de cadeias ramificadas,` },
      { type: 'paragraph', text: `de forma a resistir à compressão e entrar em ignição apenas` },
      { type: 'paragraph', text: `quando a vela aciona uma centelha elétrica no motor.` },
      { type: 'paragraph', text: `No quadro, estão apresentados compostos que podem` },
      { type: 'paragraph', text: `ser utilizados como combustíveis.` },
      { type: 'paragraph', text: `Composto Nomenclatura` },
      { type: 'paragraph', text: `I n-decano` },
      { type: 'paragraph', text: `II n-heptano` },
      { type: 'paragraph', text: `III 2,2,4-trimetilpentano` },
      { type: 'paragraph', text: `IV 3-etil-4-metilex-1-eno` },
      { type: 'paragraph', text: `V 3-etil-2-metilpentan-1-ol` }
    ],
    options: [
      { id: 'A', text: `I.` },
      { id: 'B', text: `II.` },
      { id: 'C', text: `III.` },
      { id: 'D', text: `IV.` },
      { id: 'E', text: `V.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q97',
    questionNumber: 97,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `Suponha um frasco metálico de um aerossol de capacidade igual a 100 mL, contendo 0,1 mol de produtos gasosos à temperatura de 650 °C, no momento da explosão. Considere: R = 0,082 L atm mol K ⋅ ⋅ A pressão, em atm, dentro do frasco, no momento da explosão, é mais próxima de`,
    supportTitle: `De acordo com a Constituição Federal, é competência`,
    supportText: `dos municípios o gerenciamento dos serviços de limpeza e
coleta dos resíduos urbanos (lixo). No entanto, há relatos
de que parte desse lixo acaba sendo incinerado, liberando
substâncias tóxicas para o ambiente e causando acidentes
por explosões, principalmente quando ocorre a incineração
de frascos de aerossóis (por exemplo: desodorantes,
inseticidas e repelentes). A temperatura elevada provoca
a vaporização de todo o conteúdo dentro desse tipo de
frasco, aumentando a pressão em seu interior até culminar
na explosão da embalagem.`,
    sourceCitation: `ZVEIBIL, V. Z. et al. Cartilha de limpeza urbana. Disponível em: www.ibam.org.br. Acesso em: 6 jul. 2015 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `De acordo com a Constituição Federal, é competência` },
      { type: 'paragraph', text: `dos municípios o gerenciamento dos serviços de limpeza e` },
      { type: 'paragraph', text: `coleta dos resíduos urbanos (lixo). No entanto, há relatos` },
      { type: 'paragraph', text: `de que parte desse lixo acaba sendo incinerado, liberando` },
      { type: 'paragraph', text: `substâncias tóxicas para o ambiente e causando acidentes` },
      { type: 'paragraph', text: `por explosões, principalmente quando ocorre a incineração` },
      { type: 'paragraph', text: `de frascos de aerossóis (por exemplo: desodorantes,` },
      { type: 'paragraph', text: `inseticidas e repelentes). A temperatura elevada provoca` },
      { type: 'paragraph', text: `a vaporização de todo o conteúdo dentro desse tipo de` },
      { type: 'paragraph', text: `frasco, aumentando a pressão em seu interior até culminar` },
      { type: 'paragraph', text: `na explosão da embalagem.` },
      { type: 'citation', text: `ZVEIBIL, V. Z. et al. Cartilha de limpeza urbana. Disponível em: www.ibam.org.br. Acesso em: 6 jul. 2015 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `756.` },
      { id: 'B', text: `533.` },
      { id: 'C', text: `76.` },
      { id: 'D', text: `53.` },
      { id: 'E', text: `13.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q99',
    questionNumber: 99,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `A imunização produzida por esse tipo de vacina é alcançada por meio da`,
    supportTitle: `A tecnologia de vacinas de RNA mensageiro (RNAm)`,
    supportText: `é investigada há anos. Avanços científicos em genética
molecular permitiram desenvolver uma vacina para
controle da pandemia da covid-19 causada pelo vírus de
RNA SARS-CoV⁻2. A vacina de RNAm tem sequências
de genes do vírus. Entretanto, por ser muito instável, o
RNAm deve ser recoberto por uma capa de lipídios que
evita sua degradação e favorece sua ação. Dessa forma,
o RNAm desempenhará sua função específica atuando
no mesmo compartimento celular de sempre.`,
    sourceCitation: `Disponível em: https://sbim.org.br. Acesso em: 29 nov. 2021 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `A tecnologia de vacinas de RNA mensageiro (RNAm)` },
      { type: 'paragraph', text: `é investigada há anos. Avanços científicos em genética` },
      { type: 'paragraph', text: `molecular permitiram desenvolver uma vacina para` },
      { type: 'paragraph', text: `controle da pandemia da covid-19 causada pelo vírus de` },
      { type: 'formula', latex: `RNA SARS-CoV⁻2. A vacina de RNAm tem sequências`, fallbackText: `RNA SARS-CoV⁻2. A vacina de RNAm tem sequências` },
      { type: 'paragraph', text: `de genes do vírus. Entretanto, por ser muito instável, o` },
      { type: 'paragraph', text: `RNAm deve ser recoberto por uma capa de lipídios que` },
      { type: 'paragraph', text: `evita sua degradação e favorece sua ação. Dessa forma,` },
      { type: 'paragraph', text: `o RNAm desempenhará sua função específica atuando` },
      { type: 'paragraph', text: `no mesmo compartimento celular de sempre.` },
      { type: 'citation', text: `Disponível em: https://sbim.org.br. Acesso em: 29 nov. 2021 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `estimulação de leucócitos induzida pela capa lipídica contendo RNAm.` },
      { id: 'B', text: `atuação do RNAm como sequestrador do vírus para o meio extracelular.` },
      { id: 'C', text: `tradução do RNAm em proteína viral, desencadeando a resposta antigênica.` },
      { id: 'D', text: `competição entre o RNAm vacinal e o RNA viral pelos sítios dos ribossomos.` },
      { id: 'E', text: `incorporação do RNAm viral ao genoma do hospedeiro, gerando novo fenótipo.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q100',
    questionNumber: 100,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `O coquetel de inibidores impediu o(a)`,
    supportTitle: `Na fertilização in vitro, espermatozoides são adicionados`,
    supportText: `aos gametas femininos retirados de uma mulher. Após o
período de incubação, a fecundação é favorecida pela ação
de enzimas. Em um procedimento realizado, observou-se
que nenhum dos gametas femininos foi fertilizado e,
posteriormente, verificou-se que havia sido adicionado,
equivocadamente, um coquetel de inibidores das enzimas do
acrossomo, no lugar de um dos nutrientes constituintes do
meio de cultura.`,
    contentBlocks: [
      { type: 'paragraph', text: `Na fertilização in vitro, espermatozoides são adicionados` },
      { type: 'paragraph', text: `aos gametas femininos retirados de uma mulher. Após o` },
      { type: 'paragraph', text: `período de incubação, a fecundação é favorecida pela ação` },
      { type: 'paragraph', text: `de enzimas. Em um procedimento realizado, observou-se` },
      { type: 'paragraph', text: `que nenhum dos gametas femininos foi fertilizado e,` },
      { type: 'paragraph', text: `posteriormente, verificou-se que havia sido adicionado,` },
      { type: 'paragraph', text: `equivocadamente, um coquetel de inibidores das enzimas do` },
      { type: 'paragraph', text: `acrossomo, no lugar de um dos nutrientes constituintes do` },
      { type: 'paragraph', text: `meio de cultura.` }
    ],
    options: [
      { id: 'A', text: `formação do pronúcleo masculino.` },
      { id: 'B', text: `início da divisão mitótica do zigoto.` },
      { id: 'C', text: `término da segunda divisão meiótica do ovócito.` },
      { id: 'D', text: `passagem do espermatozoide pela corona radiata e zona pelúcida.` },
      { id: 'E', text: `fusão das membranas plasmáticas do ovócito e do espermatozoide.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q101',
    questionNumber: 101,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `O fogão por indução funciona a partir do surgimento de uma corrente elétrica induzida no fundo da panela, com consequente transformação de energia elétrica em calor por efeito Joule. A principal vantagem desses fogões é a eficiência energética, que é substancialmente maior que a dos fogões convencionais. A corrente elétrica mencionada é induzida por`,
    options: [
      { id: 'A', text: `radiação.` },
      { id: 'B', text: `condução.` },
      { id: 'C', text: `campo elétrico variável.` },
      { id: 'D', text: `campo magnético variável.` },
      { id: 'E', text: `ressonância eletromagnética.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q103',
    questionNumber: 103,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Um garoto comprou vários abacates na feira, mas descobriu que eles não estavam maduros o suficiente para serem consumidos. Sua mãe recomendou que ele colocasse os abacates em um recipiente fechado, pois isso aceleraria seu amadurecimento. Com certa dúvida, o garoto realizou esta experiência: colocou alguns abacates no recipiente e deixou os demais em uma fruteira aberta. Surpreendendo-se, ele percebeu que os frutos que estavam no recipiente fechado amadureceram mais rapidamente. A aceleração desse processo é causada por`,
    options: [
      { id: 'A', text: `acúmulo de gás etileno.` },
      { id: 'B', text: `redução da umidade do ar.` },
      { id: 'C', text: `aumento da concentração de CO2.` },
      { id: 'D', text: `diminuição da intensidade luminosa.` },
      { id: 'E', text: `isolamento do contato com O 2 atmosférico.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q104',
    questionNumber: 104,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Essa adaptação confere a esse organismo a capacidade de obter primariamente`,
    supportTitle: `Há muito tempo são conhecidas espécies de`,
    supportText: `lesmas-do-mar com uma capacidade ímpar: guardar
par te da maquinaria das células das algas que
consomem — os cloroplastos — e mantê-los funcionais
dentro das suas próprias células, obtendo assim
parte do seu alimento. Investigadores portugueses
descobriram que essas lesmas-do-mar podem ser
mais eficientes nesse processo do que as próprias
algas que consomem.`,
    sourceCitation: `Disponível em: www.cienciahoje.pt. Acesso em: 10 fev. 2015 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Há muito tempo são conhecidas espécies de` },
      { type: 'paragraph', text: `lesmas-do-mar com uma capacidade ímpar: guardar` },
      { type: 'paragraph', text: `par te da maquinaria das células das algas que` },
      { type: 'paragraph', text: `consomem — os cloroplastos — e mantê-los funcionais` },
      { type: 'paragraph', text: `dentro das suas próprias células, obtendo assim` },
      { type: 'paragraph', text: `parte do seu alimento. Investigadores portugueses` },
      { type: 'paragraph', text: `descobriram que essas lesmas-do-mar podem ser` },
      { type: 'paragraph', text: `mais eficientes nesse processo do que as próprias` },
      { type: 'paragraph', text: `algas que consomem.` },
      { type: 'citation', text: `Disponível em: www.cienciahoje.pt. Acesso em: 10 fev. 2015 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `ácidos nucleicos.` },
      { id: 'B', text: `carboidratos.` },
      { id: 'C', text: `proteínas.` },
      { id: 'D', text: `vitaminas.` },
      { id: 'E', text: `lipídios.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q105',
    questionNumber: 105,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Em qual material biológico dos cães a presença desse protozoário representa risco de transmissão dessa zoonose?`,
    supportTitle: `A leishmaniose visceral é uma zoonose causada por`,
    supportText: `um protozoário do gênero Leishmania que é encontrado em
diversos tecidos. Ela é transmitida ao homem de forma
indireta, por vetores do ambiente doméstico. O cão é
considerado um importante hospedeiro desse protozoário,
podendo ou não apresentar os sintomas da doença, como
perda de peso, anemia, ferimentos na pele, diarreia,
conjuntivite e insuficiência renal. Em uma região que
sofre com alta incidência dessa doença, uma campanha
do centro de zoonoses buscou verificar a presença desse
protozoário nos cães para tentar controlar a doença.`,
    contentBlocks: [
      { type: 'paragraph', text: `A leishmaniose visceral é uma zoonose causada por` },
      { type: 'paragraph', text: `um protozoário do gênero Leishmania que é encontrado em` },
      { type: 'paragraph', text: `diversos tecidos. Ela é transmitida ao homem de forma` },
      { type: 'paragraph', text: `indireta, por vetores do ambiente doméstico. O cão é` },
      { type: 'paragraph', text: `considerado um importante hospedeiro desse protozoário,` },
      { type: 'paragraph', text: `podendo ou não apresentar os sintomas da doença, como` },
      { type: 'paragraph', text: `perda de peso, anemia, ferimentos na pele, diarreia,` },
      { type: 'paragraph', text: `conjuntivite e insuficiência renal. Em uma região que` },
      { type: 'paragraph', text: `sofre com alta incidência dessa doença, uma campanha` },
      { type: 'paragraph', text: `do centro de zoonoses buscou verificar a presença desse` },
      { type: 'paragraph', text: `protozoário nos cães para tentar controlar a doença.` }
    ],
    options: [
      { id: 'A', text: `Urina.` },
      { id: 'B', text: `Saliva.` },
      { id: 'C', text: `Fezes.` },
      { id: 'D', text: `Sangue.` },
      { id: 'E', text: `Secreção ocular.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q106',
    questionNumber: 106,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Um professor lança uma esfera verticalmente para cima, a qual retorna, depois de alguns segundos, ao ponto de lançamento. Em seguida, lista em um quadro todas as possibilidades para as grandezas cinemáticas. Grandeza cinemática Módulo Sentido Velocidade v ≠ 0 Para cima Para baixo v = 0 Indefinido* Aceleração a ≠ 0 Para cima Para baixo a = 0 Indefinido* *Grandezas com módulo nulo não têm sentido definido. Ele solicita aos alunos que analisem as grandezas cinemáticas no instante em que a esfera atinge a altura máxima, escolhendo uma combinação para os módulos e sentidos da velocidade e da aceleração. A escolha que corresponde à combinação correta é`,
    options: [
      { id: 'A', text: `v = 0 e a ≠ 0 para cima.` },
      { id: 'B', text: `v ≠ 0 para cima e a = 0.` },
      { id: 'C', text: `v = 0 e a ≠ 0 para baixo.` },
      { id: 'D', text: `v ≠ 0 para cima e a ≠ 0 para cima.` },
      { id: 'E', text: `v ≠ 0 para baixo e a ≠ 0 para baixo.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q107',
    questionNumber: 107,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `A redução da produção desses hormônios nessa fase está relacionada com o(a)`,
    supportTitle: `Muitas mulheres sofrem com desconfortos nos dias`,
    supportText: `que antecedem a menstruação, a chamada tensão
pré-menstrual. Entre outros sintomas, podem ocorrer
alterações de humor. Atualmente, acredita-se que os
sintomas são resultado da queda na concentração do
neurotransmissor serotonina, que, por sua vez, está
relacionado com a diminuição na produção dos hormônios
ovarianos estrógeno e progesterona, observada nessa
fase do ciclo feminino.`,
    sourceCitation: `DIMMOCK, P. W. et al. Efficacy of Selective Serotonin-Reuptake Inhibitors in Premenstrual Syndrome: a Systematic Review. The Lancet, n. 9 236, 2000 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Muitas mulheres sofrem com desconfortos nos dias` },
      { type: 'paragraph', text: `que antecedem a menstruação, a chamada tensão` },
      { type: 'paragraph', text: `pré-menstrual. Entre outros sintomas, podem ocorrer` },
      { type: 'paragraph', text: `alterações de humor. Atualmente, acredita-se que os` },
      { type: 'paragraph', text: `sintomas são resultado da queda na concentração do` },
      { type: 'paragraph', text: `neurotransmissor serotonina, que, por sua vez, está` },
      { type: 'paragraph', text: `relacionado com a diminuição na produção dos hormônios` },
      { type: 'paragraph', text: `ovarianos estrógeno e progesterona, observada nessa` },
      { type: 'paragraph', text: `fase do ciclo feminino.` },
      { type: 'citation', text: `DIMMOCK, P. W. et al. Efficacy of Selective Serotonin-Reuptake Inhibitors in Premenstrual Syndrome: a Systematic Review. The Lancet, n. 9 236, 2000 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `regressão do corpo lúteo ovariano.` },
      { id: 'B', text: `diminuição na produção de ocitocina.` },
      { id: 'C', text: `liberação do gameta feminino na ovulação.` },
      { id: 'D', text: `aumento nos níveis dos hormônios LH e FSH.` },
      { id: 'E', text: `elevação nos níveis sorológicos de adrenalina.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q108',
    questionNumber: 108,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `As cetonas fazem parte de famílias olfativas encontradas em muitos alimentos. A molécula de hexan-3-ona é um exemplo desses compostos voláteis responsáveis pelo aroma, podendo ser obtida por processos energéticos realizados em meio ácido, na presença de oxidantes como o permanganato de potássio. Para se produzir esse composto volátil em laboratório, deve-se oxidar a molécula de`,
    options: [
      { id: 'A', text: `hexanal.` },
      { id: 'B', text: `hexan-1-ol.` },
      { id: 'C', text: `hexan-3-ol.` },
      { id: 'D', text: `hex-1-en-1-ol.` },
      { id: 'E', text: `ácido hexanoico.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q109',
    questionNumber: 109,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Durante a evolução das plantas, ocorreu uma transição do ambiente aquático para o ambiente terrestre graças ao surgimento de algumas estruturas que as tornaram independentes da água. Esse fato permitiu maior dispersão desse grupo de seres vivos, sendo possível observá-los em diferentes ambientes na atualidade. Qual estrutura possibilitou a independência da água para a fecundação dos seres vivos citados acima?`,
    options: [
      { id: 'A', text: `Fruto.` },
      { id: 'B', text: `Esporo.` },
      { id: 'C', text: `Semente.` },
      { id: 'D', text: `Tubo polínico.` },
      { id: 'E', text: `Vaso condutor.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q110',
    questionNumber: 110,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `Caso esse suplemento seja acondicionado em embalagem desse tipo de vidro, o risco de contaminação por alumínio será maior se o(a)`,
    supportTitle: `O vidro contendo alumínio em sua composição é`,
    supportText: `um excelente material para acondicionar medicamentos
e suplementos, porque pode ser esterilizado por
aquecimento. No entanto, quando o medicamento
ou suplemento contém substâncias que se ligam
for temente ao íon desse metal, a dissolução do
alumínio é promovida em função do deslocamento
do equilíbrio químico estabelecido entre a espécie
imobilizada no vidro e a espécie em solução. Por essa
razão, recomenda-se que suplementos de nutrição de
recém-nascidos contendo gluconato de cálcio sejam
acondicionados em embalagens plásticas, e não nesse
tipo de vidro.
Atualização da recomendação da Sociedade Portuguesa de Neonatologia.`,
    sourceCitation: `Disponível em: www.spneonatologia.pt. Acesso em: 22 out. 2021 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `O vidro contendo alumínio em sua composição é` },
      { type: 'paragraph', text: `um excelente material para acondicionar medicamentos` },
      { type: 'paragraph', text: `e suplementos, porque pode ser esterilizado por` },
      { type: 'paragraph', text: `aquecimento. No entanto, quando o medicamento` },
      { type: 'paragraph', text: `ou suplemento contém substâncias que se ligam` },
      { type: 'paragraph', text: `for temente ao íon desse metal, a dissolução do` },
      { type: 'paragraph', text: `alumínio é promovida em função do deslocamento` },
      { type: 'paragraph', text: `do equilíbrio químico estabelecido entre a espécie` },
      { type: 'paragraph', text: `imobilizada no vidro e a espécie em solução. Por essa` },
      { type: 'paragraph', text: `razão, recomenda-se que suplementos de nutrição de` },
      { type: 'paragraph', text: `recém-nascidos contendo gluconato de cálcio sejam` },
      { type: 'paragraph', text: `acondicionados em embalagens plásticas, e não nesse` },
      { type: 'paragraph', text: `tipo de vidro.` },
      { type: 'paragraph', text: `Atualização da recomendação da Sociedade Portuguesa de Neonatologia.` },
      { type: 'citation', text: `Disponível em: www.spneonatologia.pt. Acesso em: 22 out. 2021 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `vidro do frasco for translúcido.` },
      { id: 'B', text: `concentração de gluconato de cálcio for alta.` },
      { id: 'C', text: `frasco de vidro apresentar uma maior espessura.` },
      { id: 'D', text: `vidro for previamente esterilizado em altas temperaturas.` },
      { id: 'E', text: `reação do alumínio com gluconato de cálcio for endotérmica.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q111',
    questionNumber: 111,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `A morte desses indivíduos, decorrente da retirada do anel completo da casca, é provocada pela interrupção da`,
    supportTitle: `Barbatimão é o nome popular de uma árvore cuja`,
    supportText: `casca é utilizada para fins medicinais. Essa casca é
constituída principalmente de dois tecidos vegetais:
periderme e floema. A extração da casca tem levado à
morte muitos indivíduos dessa espécie, quando o corte
retira um anel completo ao longo da circunferência do
tronco. Aqueles que têm parte da casca retirada sem
completar essa circunferência podem sobreviver.`,
    contentBlocks: [
      { type: 'paragraph', text: `Barbatimão é o nome popular de uma árvore cuja` },
      { type: 'paragraph', text: `casca é utilizada para fins medicinais. Essa casca é` },
      { type: 'paragraph', text: `constituída principalmente de dois tecidos vegetais:` },
      { type: 'paragraph', text: `periderme e floema. A extração da casca tem levado à` },
      { type: 'paragraph', text: `morte muitos indivíduos dessa espécie, quando o corte` },
      { type: 'paragraph', text: `retira um anel completo ao longo da circunferência do` },
      { type: 'paragraph', text: `tronco. Aqueles que têm parte da casca retirada sem` },
      { type: 'paragraph', text: `completar essa circunferência podem sobreviver.` }
    ],
    options: [
      { id: 'A', text: `fotossíntese.` },
      { id: 'B', text: `transpiração.` },
      { id: 'C', text: `troca de gases.` },
      { id: 'D', text: `formação de brotos.` },
      { id: 'E', text: `nutrição das raízes.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q113',
    questionNumber: 113,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Os micronúcleos se originam dos(as)`,
    supportTitle: `Avaliação de substâncias genotóxicas`,
    supportText: `O ensaio de micronúcleos é um teste de avaliação de
genotoxicidade que associa a presença de micronúcleos
(pequenos núcleos que aparecem próximo aos núcleos
das células) com lesões genéticas. Os micronúcleos são
fragmentos de DNA encapsulados, provenientes do fuso
mitótico durante a divisão celular.`,
    sourceCitation: `DIAS, V. M. Micronúcleos em células tumorais: biologia e implicações para a tumorigênese. Dissertação de Mestrado. USP, 2006 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Avaliação de substâncias genotóxicas` },
      { type: 'paragraph', text: `O ensaio de micronúcleos é um teste de avaliação de` },
      { type: 'paragraph', text: `genotoxicidade que associa a presença de micronúcleos` },
      { type: 'paragraph', text: `(pequenos núcleos que aparecem próximo aos núcleos` },
      { type: 'paragraph', text: `das células) com lesões genéticas. Os micronúcleos são` },
      { type: 'paragraph', text: `fragmentos de DNA encapsulados, provenientes do fuso` },
      { type: 'paragraph', text: `mitótico durante a divisão celular.` },
      { type: 'citation', text: `DIAS, V. M. Micronúcleos em células tumorais: biologia e implicações para a tumorigênese. Dissertação de Mestrado. USP, 2006 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `nucléolos.` },
      { id: 'B', text: `lisossomos.` },
      { id: 'C', text: `ribossomos.` },
      { id: 'D', text: `mitocôndrias.` },
      { id: 'E', text: `cromossomos.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q115',
    questionNumber: 115,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Essa interferência poderá ocorrer somente se as ondas emitidas pelo celular e as recebidas pelo rádio do avião`,
    supportTitle: `É comum em viagens de avião sermos solicitados a`,
    supportText: `desligar aparelhos cujo funcionamento envolva a emissão
ou a recepção de ondas eletromagnéticas, como celulares.
A justificativa dada para esse procedimento é, entre
outras coisas, a necessidade de eliminar fontes de sinais
eletromagnéticos que possam interferir nas comunicações,
via rádio, dos pilotos com a torre de controle.`,
    contentBlocks: [
      { type: 'paragraph', text: `É comum em viagens de avião sermos solicitados a` },
      { type: 'paragraph', text: `desligar aparelhos cujo funcionamento envolva a emissão` },
      { type: 'paragraph', text: `ou a recepção de ondas eletromagnéticas, como celulares.` },
      { type: 'paragraph', text: `A justificativa dada para esse procedimento é, entre` },
      { type: 'paragraph', text: `outras coisas, a necessidade de eliminar fontes de sinais` },
      { type: 'paragraph', text: `eletromagnéticos que possam interferir nas comunicações,` },
      { type: 'paragraph', text: `via rádio, dos pilotos com a torre de controle.` }
    ],
    options: [
      { id: 'A', text: `forem ambas audíveis.` },
      { id: 'B', text: `tiverem a mesma potência.` },
      { id: 'C', text: `tiverem a mesma frequência.` },
      { id: 'D', text: `tiverem a mesma intensidade.` },
      { id: 'E', text: `propagarem-se com velocidades diferentes.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q117',
    questionNumber: 117,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Quais duas vantagens esse copo apresenta em comparação ao copo descartável?`,
    supportTitle: `Uma cafeteria adotou copos fabricados a partir`,
    supportText: `de uma composição de 50% de plástico reciclado não
biodegradável e 50% de casca de café. O copo é reutilizável
e retornável, pois o material, semelhante a uma cerâmica,
suporta a lavagem. Embora ele seja comercializado por
um preço considerado alto quando comparado ao de um
copo de plástico descartável, essa cafeteria possibilita aos
clientes retornarem o copo sujo e levarem o café quente
servido em outro copo já limpo e higienizado. O material
desse copo oferece também o conforto de não esquentar
na parte externa.`,
    sourceCitation: `Cafeteria adota copo reutilizável feito com casca de café. Disponível em: www.gazetadopovo.com.br. Acesso em: 5 dez. 2019 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Uma cafeteria adotou copos fabricados a partir` },
      { type: 'paragraph', text: `de uma composição de 50% de plástico reciclado não` },
      { type: 'paragraph', text: `biodegradável e 50% de casca de café. O copo é reutilizável` },
      { type: 'paragraph', text: `e retornável, pois o material, semelhante a uma cerâmica,` },
      { type: 'paragraph', text: `suporta a lavagem. Embora ele seja comercializado por` },
      { type: 'paragraph', text: `um preço considerado alto quando comparado ao de um` },
      { type: 'paragraph', text: `copo de plástico descartável, essa cafeteria possibilita aos` },
      { type: 'paragraph', text: `clientes retornarem o copo sujo e levarem o café quente` },
      { type: 'paragraph', text: `servido em outro copo já limpo e higienizado. O material` },
      { type: 'paragraph', text: `desse copo oferece também o conforto de não esquentar` },
      { type: 'paragraph', text: `na parte externa.` },
      { type: 'citation', text: `Cafeteria adota copo reutilizável feito com casca de café. Disponível em: www.gazetadopovo.com.br. Acesso em: 5 dez. 2019 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `Ter a durabilidade de uma cerâmica e ser totalmente biodegradável.` },
      { id: 'B', text: `Ser tão durável quanto uma cerâmica e ter alta condutividade térmica.` },
      { id: 'C', text: `Ser um mau condutor térmico e aumentar o resíduo biodegradável na natureza.` },
      { id: 'D', text: `Ter baixa condutividade térmica e reduzir o resíduo não biodegradável na natureza.` },
      { id: 'E', text: `Ter alta condutividade térmica e possibilitar a degradação do material no meio ambiente.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q118',
    questionNumber: 118,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Entre as duas versões apresentadas, o refrigerante comum possui`,
    supportTitle: `O consumo exagerado de refrigerantes é preocupante,`,
    supportText: `pois contribui para o aumento de casos de obesidade e
diabetes. Considere dois refrigerantes enlatados, um
comum e um diet, e que ambos possuam a mesma
quantidade de aditivos, exceto pela presença de
açúcar. O refrigerante comum contém basicamente
água carbonatada e grande quantidade de açúcar;
já o refrigerante diet tem água carbonatada e adoçantes,
cujas massas são muito pequenas.`,
    sourceCitation: `CAVAGIS, A. D. M.; PEREIRA, E. A.; OLIVEIRA, L. C. Um método simples para avaliar o teor de sacarose e CO 2 em refrigerantes. Química Nova na Escola, n. 3, ago. 2014 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `O consumo exagerado de refrigerantes é preocupante,` },
      { type: 'paragraph', text: `pois contribui para o aumento de casos de obesidade e` },
      { type: 'paragraph', text: `diabetes. Considere dois refrigerantes enlatados, um` },
      { type: 'paragraph', text: `comum e um diet, e que ambos possuam a mesma` },
      { type: 'paragraph', text: `quantidade de aditivos, exceto pela presença de` },
      { type: 'paragraph', text: `açúcar. O refrigerante comum contém basicamente` },
      { type: 'paragraph', text: `água carbonatada e grande quantidade de açúcar;` },
      { type: 'paragraph', text: `já o refrigerante diet tem água carbonatada e adoçantes,` },
      { type: 'paragraph', text: `cujas massas são muito pequenas.` },
      { type: 'citation', text: `CAVAGIS, A. D. M.; PEREIRA, E. A.; OLIVEIRA, L. C. Um método simples para avaliar o teor de sacarose e CO 2 em refrigerantes. Química Nova na Escola, n. 3, ago. 2014 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `maior densidade.` },
      { id: 'B', text: `menor viscosidade.` },
      { id: 'C', text: `maior volume de gás dissolvido.` },
      { id: 'D', text: `menor massa de solutos dissolvidos.` },
      { id: 'E', text: `maior temperatura de congelamento.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q120',
    questionNumber: 120,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Sabendo disso, um jovem casal, ambos com essa síndrome, procura um médico especialista para aconselhamento genético porque querem ter um bebê. O médico informa ao casal que, com relação ao cromossomo 21, os zigotos formados serão`,
    supportTitle: `Pais com síndrome de Down`,
    supportText: `A síndrome de Down é uma alteração genética associada à trissomia do cromossomo 21, ou seja, o indivíduo possui
três cromossomos 21 e não um par, como é normal. Isso ocorre pela união de um gameta contendo um cromossomo 21
com um gameta possuidor de dois cromossomos 21. Embora, normalmente, as mulheres com a síndrome sejam
estéreis, em 2008, no interior de São Paulo, uma delas deu à luz uma menina sem a síndrome de Down.`,
    sourceCitation: `MORENO, T. Três anos após dar à luz, mãe portadora de síndrome de Down revela detalhes de seu dia a dia. Disponível em: www.band.uol.com.br. Acesso em: 31 out. 2013 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Pais com síndrome de Down` },
      { type: 'paragraph', text: `A síndrome de Down é uma alteração genética associada à trissomia do cromossomo 21, ou seja, o indivíduo possui` },
      { type: 'paragraph', text: `três cromossomos 21 e não um par, como é normal. Isso ocorre pela união de um gameta contendo um cromossomo 21` },
      { type: 'paragraph', text: `com um gameta possuidor de dois cromossomos 21. Embora, normalmente, as mulheres com a síndrome sejam` },
      { type: 'paragraph', text: `estéreis, em 2008, no interior de São Paulo, uma delas deu à luz uma menina sem a síndrome de Down.` },
      { type: 'citation', text: `MORENO, T. Três anos após dar à luz, mãe portadora de síndrome de Down revela detalhes de seu dia a dia. Disponível em: www.band.uol.com.br. Acesso em: 31 out. 2013 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `todos normais.` },
      { id: 'B', text: `todos tetrassômicos.` },
      { id: 'C', text: `apenas normais ou tetrassômicos.` },
      { id: 'D', text: `apenas trissômicos ou tetrassômicos.` },
      { id: 'E', text: `normais, trissômicos ou tetrassômicos.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q121',
    questionNumber: 121,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `Para que uma molécula dê origem a um medicamento de administração oral, além de apresentar atividade farmacológica, deve ser capaz de atingir o local de ação. Para tanto, essa molécula não deve se degradar no estômago (onde o meio é fortemente ácido e há várias enzimas que reagem mediante catálise ácida), deve ser capaz de atravessar as membranas celulares e ser solúvel no plasma sanguíneo (sistema aquoso). Para os fármacos cujas estruturas são formadas por cadeias carbônicas longas contendo pelo menos um grupamento amino, um recurso tecnológico empregado é sua conversão no cloridrato correspondente. Essa conversão é representada, de forma genérica, pela equação química: R3 N + HCl (R3 NH) + Cl – O aumento da eficiência de circulação do fármaco no sangue, promovido por essa conversão, deve-se ao incremento de seu(sua)`,
    options: [
      { id: 'A', text: `basicidade.` },
      { id: 'B', text: `lipofilicidade.` },
      { id: 'C', text: `caráter iônico.` },
      { id: 'D', text: `cadeia carbônica.` },
      { id: 'E', text: `estado de oxidação.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q123',
    questionNumber: 123,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Esse método contribui para a preservação das abelhas porque`,
    supportTitle: `O número de abelhas encontra-se em declínio em`,
    supportText: `várias regiões do mundo, inclusive no Brasil, sendo
que vários fatores contribuem para o colapso de suas
colmeias. Nos Estados Unidos, bombas de sementes
de espécies vegetais nativas têm sido utilizadas para
combater o desaparecimento desses insetos. Elas são
pequenas bolinhas recheadas com sementes, adubo e
argila. Quando são arremessadas e ficam expostas ao
sol e à chuva, germinam até mesmo em solo pouco fértil.`,
    sourceCitation: `DARAYA, V. Disponível em: http://planetasustentavel.abril.com.br. Acesso em: 2 fev. 2015 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `O número de abelhas encontra-se em declínio em` },
      { type: 'paragraph', text: `várias regiões do mundo, inclusive no Brasil, sendo` },
      { type: 'paragraph', text: `que vários fatores contribuem para o colapso de suas` },
      { type: 'paragraph', text: `colmeias. Nos Estados Unidos, bombas de sementes` },
      { type: 'paragraph', text: `de espécies vegetais nativas têm sido utilizadas para` },
      { type: 'paragraph', text: `combater o desaparecimento desses insetos. Elas são` },
      { type: 'paragraph', text: `pequenas bolinhas recheadas com sementes, adubo e` },
      { type: 'paragraph', text: `argila. Quando são arremessadas e ficam expostas ao` },
      { type: 'paragraph', text: `sol e à chuva, germinam até mesmo em solo pouco fértil.` },
      { type: 'citation', text: `DARAYA, V. Disponível em: http://planetasustentavel.abril.com.br. Acesso em: 2 fev. 2015 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `reduz sua predação.` },
      { id: 'B', text: `reduz o uso de pesticidas.` },
      { id: 'C', text: `reduz a competição por abrigo.` },
      { id: 'D', text: `aumenta a oferta de alimento.` },
      { id: 'E', text: `aumenta os locais de reprodução.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q124',
    questionNumber: 124,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Os mais antigos cozinhavam o feijão na panela de ferro a fim de acabar com a palidez de seus filhos. Alguns chegavam até a colocar um prego enferrujado nesse cozimento para liberar o ferro contido nele. Sabe-se que esse elemento pode ser encontrado na sua forma metálica ou iônica, sendo essencial para a manutenção da vida humana. As estratégias citadas eram utilizadas com o objetivo de`,
    options: [
      { id: 'A', text: `tratar a diarreia.` },
      { id: 'B', text: `prevenir a anemia.` },
      { id: 'C', text: `evitar as verminoses.` },
      { id: 'D', text: `remediar o raquitismo.` },
      { id: 'E', text: `combater a febre amarela.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q125',
    questionNumber: 125,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `A utilização de tecnologia nuclear é um tema bastante controverso, por causa do risco de acidentes graves, como aqueles ocorridos em Chernobyl (1986), em Goiânia (1987) e em Fukushima (2011). Apesar de muitas desvantagens, como a geração de resíduos tóxicos, a descontaminação ambiental dispendiosa em caso de acidentes e a utilização em armas nucleares, a geração de energia nuclear apresenta vantagens em comparação a outras fontes de energia. A geração dessa energia tem como característica:`,
    options: [
      { id: 'A', text: `Formar resíduos facilmente recicláveis.` },
      { id: 'B', text: `Promover o aumento do desmatamento.` },
      { id: 'C', text: `Contribuir para a produção de chuva ácida.` },
      { id: 'D', text: `Emitir gases tóxicos que são lançados no ambiente.` },
      { id: 'E', text: `Produzir calor sem o consumo de combustíveis fósseis.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q126',
    questionNumber: 126,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Qual teste deve ser considerado para controlar a formação desse tipo de obstrução de tubulações?`,
    supportTitle: `Em uma indústria, o controle da dureza da água é`,
    supportText: `importante quando ela é utilizada em caldeiras, uma vez
que sais pouco solúveis, formados a partir de sulfatos e
carbonatos, podem acumular-se no interior das tubulações,
causando obstruções. Para avaliar a água utilizada nessa
indústria, foram realizados testes de qualidade que
consideraram os seguintes parâmetros:
Teste Parâmetro medido
1 Cálcio
2 Cloreto
3 Turbidez
4 Coliformes totais
5 Sólidos sedimentáveis`,
    contentBlocks: [
      { type: 'paragraph', text: `Em uma indústria, o controle da dureza da água é` },
      { type: 'paragraph', text: `importante quando ela é utilizada em caldeiras, uma vez` },
      { type: 'paragraph', text: `que sais pouco solúveis, formados a partir de sulfatos e` },
      { type: 'paragraph', text: `carbonatos, podem acumular-se no interior das tubulações,` },
      { type: 'paragraph', text: `causando obstruções. Para avaliar a água utilizada nessa` },
      { type: 'paragraph', text: `indústria, foram realizados testes de qualidade que` },
      { type: 'paragraph', text: `consideraram os seguintes parâmetros:` },
      { type: 'paragraph', text: `Teste Parâmetro medido` },
      { type: 'paragraph', text: `1 Cálcio` },
      { type: 'paragraph', text: `2 Cloreto` },
      { type: 'paragraph', text: `3 Turbidez` },
      { type: 'paragraph', text: `4 Coliformes totais` },
      { type: 'paragraph', text: `5 Sólidos sedimentáveis` }
    ],
    options: [
      { id: 'A', text: `1` },
      { id: 'B', text: `2` },
      { id: 'C', text: `3` },
      { id: 'D', text: `4` },
      { id: 'E', text: `5` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q127',
    questionNumber: 127,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Nas viagens por grandes distâncias, tais músculos são fundamentais, pois favorecem o(a)`,
    supportTitle: `As aves apresentam dois tipos de músculos em seus`,
    supportText: `corpos: vermelhos e brancos. Aves migratórias como garças,
gansos e patos selvagens têm os músculos vermelhos bem
desenvolvidos, com ampla rede de vasos sanguíneos.`,
    contentBlocks: [
      { type: 'paragraph', text: `As aves apresentam dois tipos de músculos em seus` },
      { type: 'paragraph', text: `corpos: vermelhos e brancos. Aves migratórias como garças,` },
      { type: 'paragraph', text: `gansos e patos selvagens têm os músculos vermelhos bem` },
      { type: 'paragraph', text: `desenvolvidos, com ampla rede de vasos sanguíneos.` }
    ],
    options: [
      { id: 'A', text: `execução de manobras.` },
      { id: 'B', text: `metabolismo corpóreo elevado.` },
      { id: 'C', text: `manutenção da aerodinâmica.` },
      { id: 'D', text: `deslocamento a grandes velocidades.` },
      { id: 'E', text: `capacidade de voo em grandes altitudes.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q128',
    questionNumber: 128,
    area: 'natural_sciences',
    topic: 'Química',
    prompt: `Existe no comércio um produto antimofo constituído por uma embalagem com tampa perfurada contendo cloreto de cálcio anidro, CaCl 2 . Uma vez aberto o lacre, essa substância absorve a umidade ambiente, transformando-se em cloreto de cálcio di-hidratado, CaCl2⋅⋅ 2H 2 O. Considere a massa molar da água igual a 18 g mol−1, e a massa molar do cloreto de cálcio anidro igual a 111 g mol−1. Na hidratação da substância presente no antimofo, o ganho percentual, em massa, é mais próximo de`,
    options: [
      { id: 'A', text: `14%` },
      { id: 'B', text: `16%` },
      { id: 'C', text: `24%` },
      { id: 'D', text: `32%` },
      { id: 'E', text: `75%` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q131',
    questionNumber: 131,
    area: 'natural_sciences',
    topic: 'Biologia',
    prompt: `Dentro do corpo do vegetal, esses contaminantes serão`,
    supportTitle: `A biorremediação designa tratamentos que usam`,
    supportText: `organismos para reduzir a quantidade de substâncias
tóxicas no ambiente ou degradá-las em substâncias
não tóxicas ou de menor toxicidade. Uma planta aquática,
o aguapé, tem sido utilizada para a biorremediação de
ambientes contaminados por metais tóxicos. Sabe-se
que esses poluentes serão captados para dentro do
corpo do vegetal.`,
    contentBlocks: [
      { type: 'paragraph', text: `A biorremediação designa tratamentos que usam` },
      { type: 'paragraph', text: `organismos para reduzir a quantidade de substâncias` },
      { type: 'paragraph', text: `tóxicas no ambiente ou degradá-las em substâncias` },
      { type: 'paragraph', text: `não tóxicas ou de menor toxicidade. Uma planta aquática,` },
      { type: 'paragraph', text: `o aguapé, tem sido utilizada para a biorremediação de` },
      { type: 'paragraph', text: `ambientes contaminados por metais tóxicos. Sabe-se` },
      { type: 'paragraph', text: `que esses poluentes serão captados para dentro do` },
      { type: 'paragraph', text: `corpo do vegetal.` }
    ],
    options: [
      { id: 'A', text: `digeridos por enzimas.` },
      { id: 'B', text: `acumulados nos tecidos.` },
      { id: 'C', text: `eliminados pelos estômatos.` },
      { id: 'D', text: `metabolizados por glândulas.` },
      { id: 'E', text: `utilizados como fonte energética.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q133',
    questionNumber: 133,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `A quantas radiografias torácicas corresponde a dose de radiação ionizante à qual um tripulante que atue no trecho Rio de Janeiro−Roma é exposto ao longo de um ano?`,
    supportTitle: `Os raios cósmicos são fontes de radiação ionizante`,
    supportText: `potencialmente perigosas para o organismo humano.
Para quantificar a dose de radiação recebida, utiliza-se
o sievert (Sv), definido como a unidade de energia
recebida por unidade de massa. A exposição à radiação
proveniente de raios cósmicos aumenta com a altitude,
o que pode representar um problema para as tripulações
de aeronaves. Recentemente, foram realizadas medições
acuradas das doses de radiação ionizante para voos entre
Rio de Janeiro e Roma. Os resultados têm indicado que a
dose média de radiação recebida na fase de cruzeiro (que
geralmente representa 80% do tempo total de voo) desse
trecho intercontinental é 2 μSv/h. As normas internacionais
da aviação civil limitam em 1 000 horas por ano o tempo
de trabalho para as tripulações que atuem em voos
intercontinentais. Considere que a dose de radiação ionizante
para uma radiografia torácica é estimada em 0,2 mSv.`,
    sourceCitation: `RUAS, A. C. O tripulante de aeronaves e a radiação ionizante. São Paulo: Edição do Autor, 2019 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Os raios cósmicos são fontes de radiação ionizante` },
      { type: 'paragraph', text: `potencialmente perigosas para o organismo humano.` },
      { type: 'paragraph', text: `Para quantificar a dose de radiação recebida, utiliza-se` },
      { type: 'paragraph', text: `o sievert (Sv), definido como a unidade de energia` },
      { type: 'paragraph', text: `recebida por unidade de massa. A exposição à radiação` },
      { type: 'paragraph', text: `proveniente de raios cósmicos aumenta com a altitude,` },
      { type: 'paragraph', text: `o que pode representar um problema para as tripulações` },
      { type: 'paragraph', text: `de aeronaves. Recentemente, foram realizadas medições` },
      { type: 'paragraph', text: `acuradas das doses de radiação ionizante para voos entre` },
      { type: 'paragraph', text: `Rio de Janeiro e Roma. Os resultados têm indicado que a` },
      { type: 'paragraph', text: `dose média de radiação recebida na fase de cruzeiro (que` },
      { type: 'paragraph', text: `geralmente representa 80% do tempo total de voo) desse` },
      { type: 'paragraph', text: `trecho intercontinental é 2 μSv/h. As normas internacionais` },
      { type: 'paragraph', text: `da aviação civil limitam em 1 000 horas por ano o tempo` },
      { type: 'paragraph', text: `de trabalho para as tripulações que atuem em voos` },
      { type: 'paragraph', text: `intercontinentais. Considere que a dose de radiação ionizante` },
      { type: 'paragraph', text: `para uma radiografia torácica é estimada em 0,2 mSv.` },
      { type: 'citation', text: `RUAS, A. C. O tripulante de aeronaves e a radiação ionizante. São Paulo: Edição do Autor, 2019 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `8` },
      { id: 'B', text: `10` },
      { id: 'C', text: `80` },
      { id: 'D', text: `100` },
      { id: 'E', text: `1 000` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q135',
    questionNumber: 135,
    area: 'natural_sciences',
    topic: 'Física',
    prompt: `Comparado ao caminhão, quantos minutos a menos o carro leva para percorrer toda a rodovia?`,
    supportText: `Uma concessionária é responsável por um trecho de 480 quilômetros de uma rodovia. Nesse trecho, foram
construídas 10 praças de pedágio, onde funcionários recebem os pagamentos nas cabines de cobrança. Também
existe o serviço automático, em que os veículos providos de um dispositivo passam por uma cancela, que se abre
automaticamente, evitando filas e diminuindo o tempo de viagem. Segundo a concessionária, o tempo médio para
efetuar a passagem em uma cabine é de 3 minutos, e as velocidades máximas permitidas na rodovia são 100 km/h,
para veículos leves, e 80 km/h, para veículos de grande porte.
Considere um carro e um caminhão viajando, ambos com velocidades constantes e iguais às máximas permitidas,
e que somente o caminhão tenha o serviço automático de cobrança.`,
    contentBlocks: [
      { type: 'paragraph', text: `Uma concessionária é responsável por um trecho de 480 quilômetros de uma rodovia. Nesse trecho, foram` },
      { type: 'paragraph', text: `construídas 10 praças de pedágio, onde funcionários recebem os pagamentos nas cabines de cobrança. Também` },
      { type: 'paragraph', text: `existe o serviço automático, em que os veículos providos de um dispositivo passam por uma cancela, que se abre` },
      { type: 'paragraph', text: `automaticamente, evitando filas e diminuindo o tempo de viagem. Segundo a concessionária, o tempo médio para` },
      { type: 'paragraph', text: `efetuar a passagem em uma cabine é de 3 minutos, e as velocidades máximas permitidas na rodovia são 100 km/h,` },
      { type: 'paragraph', text: `para veículos leves, e 80 km/h, para veículos de grande porte.` },
      { type: 'paragraph', text: `Considere um carro e um caminhão viajando, ambos com velocidades constantes e iguais às máximas permitidas,` },
      { type: 'paragraph', text: `e que somente o caminhão tenha o serviço automático de cobrança.` }
    ],
    options: [
      { id: 'A', text: `30` },
      { id: 'B', text: `42` },
      { id: 'C', text: `72` },
      { id: 'D', text: `288` },
      { id: 'E', text: `360` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
];
