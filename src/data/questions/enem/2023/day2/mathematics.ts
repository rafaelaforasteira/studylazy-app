import { buildEnem2023Day2Question } from './buildQuestion';

export const mathematicsQuestions: ReturnType<typeof buildEnem2023Day2Question>[] = [
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q136',
    questionNumber: 136,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Um casal realizará diariamente 30 minutos de caminhada, ingerindo, antes dessa atividade, a quantidade ideal de carboidratos recomendada. Para ter o consumo ideal apenas por meio do consumo de pão de fôrma integral, o casal planeja garantir o suprimento de pães para um período de 30 dias ininterruptos. Sabe-se que cada pacote desse pão vem com 18 fatias, e que cada uma delas tem 15 gramas de carboidratos. A quantidade mínima de pacotes de pão de fôrma necessários para prover o suprimento a esse casal é`,
    supportTitle: `Alguns estudos comprovam que os carboidratos`,
    supportText: `fornecem energia ao corpo, preservam as proteínas
estruturais dos músculos durante a prática de atividade
física e ainda dão força para o cérebro coordenar os
movimentos, o que de fato tem impacto positivo no
desenvolvimento do praticante. O ideal é consumir 1 grama
de carboidrato para cada minuto de caminhada.`,
    sourceCitation: `CIRINO, C. Boa pergunta: consumir carboidratos antes dos exercícios melhora o desempenho do atleta? Revista Saúde! É Vital, n. 330, nov. 2010 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Alguns estudos comprovam que os carboidratos` },
      { type: 'paragraph', text: `fornecem energia ao corpo, preservam as proteínas` },
      { type: 'paragraph', text: `estruturais dos músculos durante a prática de atividade` },
      { type: 'paragraph', text: `física e ainda dão força para o cérebro coordenar os` },
      { type: 'paragraph', text: `movimentos, o que de fato tem impacto positivo no` },
      { type: 'paragraph', text: `desenvolvimento do praticante. O ideal é consumir 1 grama` },
      { type: 'paragraph', text: `de carboidrato para cada minuto de caminhada.` },
      { type: 'citation', text: `CIRINO, C. Boa pergunta: consumir carboidratos antes dos exercícios melhora o desempenho do atleta? Revista Saúde! É Vital, n. 330, nov. 2010 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `1.` },
      { id: 'B', text: `4.` },
      { id: 'C', text: `6.` },
      { id: 'D', text: `7.` },
      { id: 'E', text: `8.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q139',
    questionNumber: 139,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Uma pessoa pratica quatro atividades físicas — caminhar, correr, andar de bicicleta e jogar futebol — como parte de seu programa de emagrecimento. Essas atividades são praticadas semanalmente de acordo com o quadro, que apresenta o número de horas diárias por atividade. Dias da semana Caminhar Correr Andar de bicicleta Jogar futebol Segunda-feira 1,0 0,5 0,0 2,0 Terça-feira 0,5 1,0 0,5 1,0 Quarta-feira 0,0 1,5 1,0 0,5 Quinta-feira 0,0 2,0 0,0 0,0 Sexta-feira 0,0 0,5 0,0 2,5 Ela deseja comemorar seu aniversário e escolhe o dia da semana em que o gasto calórico com as atividades físicas praticadas for o maior. Para tanto, considera que os valores dos gastos calóricos das atividades por hora (cal/h) são os seguintes: Atividade física Caminhar Correr Andar de bicicleta Jogar futebol Gasto calórico (cal/h) 248 764 356 492 O dia da semana em que será comemorado o aniversário é`,
    options: [
      { id: 'A', text: `segunda-feira.` },
      { id: 'B', text: `terça-feira.` },
      { id: 'C', text: `quarta-feira.` },
      { id: 'D', text: `quinta-feira.` },
      { id: 'E', text: `sexta-feira.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q140',
    questionNumber: 140,
    area: 'mathematics',
    topic: 'Matemática financeira',
    prompt: `O desconto necessário no preço final da compra, em porcentagem, pertence ao intervalo`,
    supportText: `A cada bimestre, a diretora de uma escola compra uma quantidade de folhas de papel ofício proporcional ao número
de alunos matriculados. No bimestre passado, ela comprou 6 000 folhas para serem utilizadas pelos 1 200 alunos
matriculados. Neste bimestre, alguns alunos cancelaram suas matrículas e a escola tem, agora, 1 150 alunos.
A diretora só pode gastar R$ 220,00 nessa compra, e sabe que o fornecedor da escola vende as folhas de papel
ofício em embalagens de 100 unidades a R$ 4,00 a embalagem. Assim, será preciso convencer o fornecedor a dar um
desconto à escola, de modo que seja possível comprar a quantidade total de papel ofício necessária para o bimestre.`,
    contentBlocks: [
      { type: 'paragraph', text: `A cada bimestre, a diretora de uma escola compra uma quantidade de folhas de papel ofício proporcional ao número` },
      { type: 'paragraph', text: `de alunos matriculados. No bimestre passado, ela comprou 6 000 folhas para serem utilizadas pelos 1 200 alunos` },
      { type: 'paragraph', text: `matriculados. Neste bimestre, alguns alunos cancelaram suas matrículas e a escola tem, agora, 1 150 alunos.` },
      { type: 'paragraph', text: `A diretora só pode gastar R$ 220,00 nessa compra, e sabe que o fornecedor da escola vende as folhas de papel` },
      { type: 'paragraph', text: `ofício em embalagens de 100 unidades a R$ 4,00 a embalagem. Assim, será preciso convencer o fornecedor a dar um` },
      { type: 'paragraph', text: `desconto à escola, de modo que seja possível comprar a quantidade total de papel ofício necessária para o bimestre.` }
    ],
    options: [
      { id: 'A', text: `(5,0 ; 5,5).` },
      { id: 'B', text: `(8,0 ; 8,5).` },
      { id: 'C', text: `(11,5 ; 12,5).` },
      { id: 'D', text: `(19,5 ; 20,5).` },
      { id: 'E', text: `(3,5 ; 4,0).` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q141',
    questionNumber: 141,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `De acordo com as informações fornecidas, durante quantos anos Tzolkim aquela comunidade maia foi governada por tal família?`,
    supportTitle: `O calendário maia apresenta duas contagens`,
    supportText: `simultâneas de anos, o chamado ano Tzolkim, composto
por 260 dias e que determinava o calendário religioso,
e o ano Haab, composto por 365 dias e que determinava o
calendário agrícola. Um historiador encontrou evidências
de que gerações de uma mesma família governaram certa
comunidade maia pelo período de 20 ciclos, sendo cada
ciclo formado por 52 anos Haab.`,
    sourceCitation: `Disponível em: www.suapesquisa.com. Acesso em: 20 ago. 2014.`,
    contentBlocks: [
      { type: 'paragraph', text: `O calendário maia apresenta duas contagens` },
      { type: 'paragraph', text: `simultâneas de anos, o chamado ano Tzolkim, composto` },
      { type: 'paragraph', text: `por 260 dias e que determinava o calendário religioso,` },
      { type: 'paragraph', text: `e o ano Haab, composto por 365 dias e que determinava o` },
      { type: 'paragraph', text: `calendário agrícola. Um historiador encontrou evidências` },
      { type: 'paragraph', text: `de que gerações de uma mesma família governaram certa` },
      { type: 'paragraph', text: `comunidade maia pelo período de 20 ciclos, sendo cada` },
      { type: 'paragraph', text: `ciclo formado por 52 anos Haab.` },
      { type: 'citation', text: `Disponível em: www.suapesquisa.com. Acesso em: 20 ago. 2014.` }
    ],
    options: [
      { id: 'A', text: `741` },
      { id: 'B', text: `1 040` },
      { id: 'C', text: `1 460` },
      { id: 'D', text: `2 100` },
      { id: 'E', text: `5 200` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q143',
    questionNumber: 143,
    area: 'mathematics',
    topic: 'Geometria',
    prompt: `Um maratonista, visando melhorar sua performance, auxiliado por um médico, mensura o seu consumo de oxigênio por minuto a velocidade constante. Com base nesse consumo e na massa do atleta, o médico calcula o EC do atleta. A unidade de medida da grandeza descrita pelo parâmetro EC é`,
    supportTitle: `Entre maratonistas, um parâmetro utilizado é o de`,
    supportText: `economia de corrida (EC). O valor desse parâmetro é
calculado pela razão entre o consumo de oxigênio, em
mililitro (mL) por minuto (min), e a massa, em quilograma (kg),
do atleta correndo a uma velocidade constante.`,
    sourceCitation: `Disponível em: www.treinamentoonline.com.br. Acesso em: 23 out. 2019 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Entre maratonistas, um parâmetro utilizado é o de` },
      { type: 'paragraph', text: `economia de corrida (EC). O valor desse parâmetro é` },
      { type: 'paragraph', text: `calculado pela razão entre o consumo de oxigênio, em` },
      { type: 'paragraph', text: `mililitro (mL) por minuto (min), e a massa, em quilograma (kg),` },
      { type: 'paragraph', text: `do atleta correndo a uma velocidade constante.` },
      { type: 'citation', text: `Disponível em: www.treinamentoonline.com.br. Acesso em: 23 out. 2019 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `min mL kg ⋅` },
      { id: 'B', text: `mL min kg ⋅` },
      { id: 'C', text: `min mL kg ⋅` },
      { id: 'D', text: `min kg mL ⋅` },
      { id: 'E', text: `mL kg min ⋅` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q144',
    questionNumber: 144,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Em qual mês o produto II parou de ser produzido?`,
    supportText: `O gerente de uma fábrica pretende comparar a evolução das vendas de dois produtos similares (I e II). Para isso,
passou a verificar o número de unidades vendidas de cada um desses produtos em cada mês. Os resultados dessa
verificação, para os meses de abril a junho, são apresentados na tabela.
Produto
Vendas
em abril
(unidade)
Vendas
em maio
(unidade)
Vendas
em junho
(unidade)
l 80 90 100
ll 190 170 150
O gerente estava decidido a cessar a produção do produto II no mês seguinte àquele em que as vendas do
produto I superassem as do produto II.
Suponha que a variação na quantidade de unidades vendidas dos produtos I e II se manteve, mês a mês, como
no período representado na tabela.`,
    contentBlocks: [
      { type: 'paragraph', text: `O gerente de uma fábrica pretende comparar a evolução das vendas de dois produtos similares (I e II). Para isso,` },
      { type: 'paragraph', text: `passou a verificar o número de unidades vendidas de cada um desses produtos em cada mês. Os resultados dessa` },
      { type: 'paragraph', text: `verificação, para os meses de abril a junho, são apresentados na tabela.` },
      { type: 'paragraph', text: `Produto` },
      { type: 'paragraph', text: `Vendas` },
      { type: 'paragraph', text: `em abril` },
      { type: 'paragraph', text: `(unidade)` },
      { type: 'paragraph', text: `Vendas` },
      { type: 'paragraph', text: `em maio` },
      { type: 'paragraph', text: `(unidade)` },
      { type: 'paragraph', text: `Vendas` },
      { type: 'paragraph', text: `em junho` },
      { type: 'paragraph', text: `(unidade)` },
      { type: 'paragraph', text: `l 80 90 100` },
      { type: 'paragraph', text: `ll 190 170 150` },
      { type: 'paragraph', text: `O gerente estava decidido a cessar a produção do produto II no mês seguinte àquele em que as vendas do` },
      { type: 'paragraph', text: `produto I superassem as do produto II.` },
      { type: 'paragraph', text: `Suponha que a variação na quantidade de unidades vendidas dos produtos I e II se manteve, mês a mês, como` },
      { type: 'paragraph', text: `no período representado na tabela.` }
    ],
    options: [
      { id: 'A', text: `Junho.` },
      { id: 'B', text: `Julho.` },
      { id: 'C', text: `Agosto.` },
      { id: 'D', text: `Setembro.` },
      { id: 'E', text: `Outubro.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q149',
    questionNumber: 149,
    area: 'mathematics',
    topic: 'Probabilidade',
    prompt: `Qual a probabilidade de o vencedor do sorteio ser um estudante de terceiro ano?`,
    supportText: `No alojamento de uma universidade, há alguns quartos com o padrão superior ao dos demais. Um desses quartos
ficou disponível, e muitos estudantes se candidataram para morar no local. Para escolher quem ficará com o quarto,
um sorteio será realizado. Para esse sorteio, cartões individuais com os nomes de todos os estudantes inscritos serão
depositados em uma urna, sendo que, para cada estudante de primeiro ano, será depositado um único cartão com
seu nome; para cada estudante de segundo ano, dois cartões com seu nome; e, para cada estudante de terceiro ano,
três cartões com seu nome. Foram inscritos 200 estudantes de primeiro ano, 150 de segundo ano e 100 de terceiro
ano. Todos os cartões têm a mesma probabilidade de serem sorteados.`,
    contentBlocks: [
      { type: 'paragraph', text: `No alojamento de uma universidade, há alguns quartos com o padrão superior ao dos demais. Um desses quartos` },
      { type: 'paragraph', text: `ficou disponível, e muitos estudantes se candidataram para morar no local. Para escolher quem ficará com o quarto,` },
      { type: 'paragraph', text: `um sorteio será realizado. Para esse sorteio, cartões individuais com os nomes de todos os estudantes inscritos serão` },
      { type: 'paragraph', text: `depositados em uma urna, sendo que, para cada estudante de primeiro ano, será depositado um único cartão com` },
      { type: 'paragraph', text: `seu nome; para cada estudante de segundo ano, dois cartões com seu nome; e, para cada estudante de terceiro ano,` },
      { type: 'paragraph', text: `três cartões com seu nome. Foram inscritos 200 estudantes de primeiro ano, 150 de segundo ano e 100 de terceiro` },
      { type: 'paragraph', text: `ano. Todos os cartões têm a mesma probabilidade de serem sorteados.` }
    ],
    options: [
      { id: 'A', text: `1 2` },
      { id: 'B', text: `1 3` },
      { id: 'C', text: `1 8` },
      { id: 'D', text: `2 9` },
      { id: 'E', text: `3 8` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q150',
    questionNumber: 150,
    area: 'mathematics',
    topic: 'Estatística',
    prompt: `Qual é a quantidade mínima de água, em litro, que cada morador, em média, deverá economizar por dia, de modo que o reservatório não fique sem água nos próximos 10 dias?`,
    supportText: `A água utilizada pelos 75 moradores de um vilarejo provém de um reservatório de formato cilíndrico circular reto
cujo raio da base mede 5 metros, sempre abastecido no primeiro dia de cada mês por caminhões-pipa. Cada morador
desse vilarejo consome, em média, 200 litros de água por dia.
No mês de junho de um determinado ano, o vilarejo festejou o dia do seu padroeiro e houve um gasto extra de água
nos primeiros 20 dias. Passado esse período, as pessoas verificaram a quantidade de água presente no reservatório
e constataram que o nível da coluna de água estava em 1,5 metro. Decidiram, então, fazer um racionamento de água
durante os 10 dias seguintes. Considere 3 como aproximação para π.`,
    contentBlocks: [
      { type: 'paragraph', text: `A água utilizada pelos 75 moradores de um vilarejo provém de um reservatório de formato cilíndrico circular reto` },
      { type: 'paragraph', text: `cujo raio da base mede 5 metros, sempre abastecido no primeiro dia de cada mês por caminhões-pipa. Cada morador` },
      { type: 'paragraph', text: `desse vilarejo consome, em média, 200 litros de água por dia.` },
      { type: 'paragraph', text: `No mês de junho de um determinado ano, o vilarejo festejou o dia do seu padroeiro e houve um gasto extra de água` },
      { type: 'paragraph', text: `nos primeiros 20 dias. Passado esse período, as pessoas verificaram a quantidade de água presente no reservatório` },
      { type: 'paragraph', text: `e constataram que o nível da coluna de água estava em 1,5 metro. Decidiram, então, fazer um racionamento de água` },
      { type: 'formula', latex: `durante os 10 dias seguintes. Considere 3 como aproximação para π.`, fallbackText: `durante os 10 dias seguintes. Considere 3 como aproximação para π.` }
    ],
    options: [
      { id: 'A', text: `50` },
      { id: 'B', text: `60` },
      { id: 'C', text: `80` },
      { id: 'D', text: `140` },
      { id: 'E', text: `150` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q151',
    questionNumber: 151,
    area: 'mathematics',
    topic: 'Probabilidade',
    prompt: `Em janeiro do ano passado, a direção de uma fábrica abriu uma creche para os filhos de seus funcionários, com 10 salas, cada uma com capacidade para atender 10 crianças a cada ano. As vagas são sorteadas entre os filhos dos funcionários inscritos, enquanto os não contemplados pelo sorteio formam uma lista de espera. No ano passado, a lista de espera teve 400 nomes e, neste ano, esse número cresceu 10%. A direção da fábrica realizou uma pesquisa e constatou que a lista de espera para o próximo ano terá a mesma quantidade de nomes da lista de espera deste ano. Decidiu, então, construir, ao longo desse ano, novas salas para a creche, também com capacidade de atendimento para 10 crianças cada, de modo que o número de nomes na lista de espera no próximo ano seja 25% menor que o deste ano. O número mínimo de salas que deverão ser construídas é`,
    options: [
      { id: 'A', text: `10.` },
      { id: 'B', text: `11.` },
      { id: 'C', text: `13.` },
      { id: 'D', text: `30.` },
      { id: 'E', text: `33.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q155',
    questionNumber: 155,
    area: 'mathematics',
    topic: 'Matemática financeira',
    prompt: `4% da receita obtida pela venda de peixe é repartida igualmente entre os ajudantes. Considerando o tamanho de seu barco, ele pode contratar até 5 ajudantes. Ele sabe que com um ajudante a pesca diária é de 300 kg e que, a partir do segundo ajudante contratado, aumenta-se em 100 kg a quantidade de peixe pescada por ajudante em um dia de trabalho. A quantidade mínima de ajudantes que esse pescador precisa contratar para conseguir o lucro diário pretendido é`,
    supportTitle: `Um pescador tem um custo fixo diário de R$ 900,00`,
    supportText: `com combustível, iscas, manutenção de seu barco e outras
pequenas despesas. Ele vende cada quilograma de peixe por
R$ 5,00. Sua meta é obter um lucro mínimo de R$ 800,00
por dia. Sozinho, ele consegue, ao final de um dia de trabalho,
pescar 180 kg de peixe, o que é suficiente apenas para cobrir o
custo fixo diário. Portanto, precisa contratar ajudantes, pagando
para cada um R$ 250,00 por dia de trabalho. Além desse valor,`,
    contentBlocks: [
      { type: 'paragraph', text: `Um pescador tem um custo fixo diário de R$ 900,00` },
      { type: 'paragraph', text: `com combustível, iscas, manutenção de seu barco e outras` },
      { type: 'paragraph', text: `pequenas despesas. Ele vende cada quilograma de peixe por` },
      { type: 'paragraph', text: `R$ 5,00. Sua meta é obter um lucro mínimo de R$ 800,00` },
      { type: 'paragraph', text: `por dia. Sozinho, ele consegue, ao final de um dia de trabalho,` },
      { type: 'paragraph', text: `pescar 180 kg de peixe, o que é suficiente apenas para cobrir o` },
      { type: 'paragraph', text: `custo fixo diário. Portanto, precisa contratar ajudantes, pagando` },
      { type: 'paragraph', text: `para cada um R$ 250,00 por dia de trabalho. Além desse valor,` }
    ],
    options: [
      { id: 'A', text: `1.` },
      { id: 'B', text: `2.` },
      { id: 'C', text: `3.` },
      { id: 'D', text: `4.` },
      { id: 'E', text: `5.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q156',
    questionNumber: 156,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Quantos dias após iniciado esse método o agricultor deverá aplicar o produto X?`,
    supportTitle: `Um agricultor é informado sobre um método de proteção`,
    supportText: `para sua lavoura que consiste em inserir larvas específicas,
de rápida reprodução. A reprodução dessas larvas faz com
que sua população multiplique-se por 10 a cada 3 dias e,
para evitar eventuais desequilíbrios, é possível cessar essa
reprodução aplicando-se um produto X. O agricultor decide
iniciar esse método com 100 larvas e dispõe de 5 litros do
produto X, cuja aplicação recomendada é de exatamente
1 litro para cada população de 200 000 larvas. A quantidade
total do produto X de que ele dispõe deverá ser aplicada
de uma única vez.`,
    contentBlocks: [
      { type: 'paragraph', text: `Um agricultor é informado sobre um método de proteção` },
      { type: 'paragraph', text: `para sua lavoura que consiste em inserir larvas específicas,` },
      { type: 'paragraph', text: `de rápida reprodução. A reprodução dessas larvas faz com` },
      { type: 'paragraph', text: `que sua população multiplique-se por 10 a cada 3 dias e,` },
      { type: 'paragraph', text: `para evitar eventuais desequilíbrios, é possível cessar essa` },
      { type: 'paragraph', text: `reprodução aplicando-se um produto X. O agricultor decide` },
      { type: 'paragraph', text: `iniciar esse método com 100 larvas e dispõe de 5 litros do` },
      { type: 'paragraph', text: `produto X, cuja aplicação recomendada é de exatamente` },
      { type: 'paragraph', text: `1 litro para cada população de 200 000 larvas. A quantidade` },
      { type: 'paragraph', text: `total do produto X de que ele dispõe deverá ser aplicada` },
      { type: 'paragraph', text: `de uma única vez.` }
    ],
    options: [
      { id: 'A', text: `2` },
      { id: 'B', text: `4` },
      { id: 'C', text: `6` },
      { id: 'D', text: `12` },
      { id: 'E', text: `18` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q157',
    questionNumber: 157,
    area: 'mathematics',
    topic: 'Probabilidade',
    prompt: `Nessas condições, o tipo de senha que apresenta a menor probabilidade de ser descoberta ao acaso, na primeira tentativa, é o`,
    supportTitle: `Ao realizar o cadastro em um aplicativo de investimentos,`,
    supportText: `foi solicitado ao usuário que criasse uma senha, sendo
permitido o uso somente dos seguintes caracteres:
• algarismos de 0 a 9;
• 26 letras minúsculas do alfabeto;
• 26 letras maiúsculas do alfabeto;
• 6 caracteres especiais !, @, #, $, , &.
Três tipos de estruturas para senha foram apresentadas
ao usuário:
• tipo I: formada por quaisquer quatro caracteres
distintos, escolhidos dentre os permitidos;
• tipo II: formada por cinco caracteres distintos,
iniciando por três letras, seguidas por um algarismo
e, ao final, um caractere especial;
• tipo III: formada por seis caracteres distintos, iniciando
por duas letras, seguidas por dois algarismos e, ao
final, dois caracteres especiais.
Considere p1 , p2 e p3 as probabilidades de se
descobrirem ao acaso, na primeira tentativa, as senhas
dos tipos I, II e III, respectivamente.`,
    contentBlocks: [
      { type: 'paragraph', text: `Ao realizar o cadastro em um aplicativo de investimentos,` },
      { type: 'paragraph', text: `foi solicitado ao usuário que criasse uma senha, sendo` },
      { type: 'paragraph', text: `permitido o uso somente dos seguintes caracteres:` },
      { type: 'paragraph', text: `• algarismos de 0 a 9;` },
      { type: 'paragraph', text: `• 26 letras minúsculas do alfabeto;` },
      { type: 'paragraph', text: `• 26 letras maiúsculas do alfabeto;` },
      { type: 'paragraph', text: `• 6 caracteres especiais !, @, #, $, , &.` },
      { type: 'paragraph', text: `Três tipos de estruturas para senha foram apresentadas` },
      { type: 'paragraph', text: `ao usuário:` },
      { type: 'paragraph', text: `• tipo I: formada por quaisquer quatro caracteres` },
      { type: 'paragraph', text: `distintos, escolhidos dentre os permitidos;` },
      { type: 'paragraph', text: `• tipo II: formada por cinco caracteres distintos,` },
      { type: 'paragraph', text: `iniciando por três letras, seguidas por um algarismo` },
      { type: 'paragraph', text: `e, ao final, um caractere especial;` },
      { type: 'paragraph', text: `• tipo III: formada por seis caracteres distintos, iniciando` },
      { type: 'paragraph', text: `por duas letras, seguidas por dois algarismos e, ao` },
      { type: 'paragraph', text: `final, dois caracteres especiais.` },
      { type: 'paragraph', text: `Considere p1 , p2 e p3 as probabilidades de se` },
      { type: 'paragraph', text: `descobrirem ao acaso, na primeira tentativa, as senhas` },
      { type: 'paragraph', text: `dos tipos I, II e III, respectivamente.` }
    ],
    options: [
      { id: 'A', text: `tipo I, pois p1 < p2 < p3.` },
      { id: 'B', text: `tipo I, pois tem menor quantidade de caracteres.` },
      { id: 'C', text: `tipo II, pois tem maior quantidade de letras.` },
      { id: 'D', text: `tipo III, pois p3 < p2 < p1.` },
      { id: 'E', text: `tipo III, pois tem maior quantidade de caracteres.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q158',
    questionNumber: 158,
    area: 'mathematics',
    topic: 'Probabilidade',
    prompt: `Em um colégio público, a admissão no primeiro ano se dá por sorteio. Neste ano há 55 candidatos, cujas inscrições são numeradas de 01 a 55. O sorteio de cada número de inscrição será realizado em etapas, utilizando-se duas urnas. Da primeira urna será sorteada uma bola, dentre bolas numeradas de 0 a 9, que representará o algarismo das unidades do número de inscrição a ser sorteado e, em seguida, da segunda urna, será sorteada uma bola para representar o algarismo das dezenas desse número. Depois do primeiro sorteio, e antes de se sortear o algarismo das dezenas, as bolas que estarão presentes na segunda urna serão apenas aquelas cujos números formam, com o algarismo já sorteado, um número de 01 a 55. As probabilidades de os candidatos de inscrição número 50 e 02 serem sorteados são, respectivamente,`,
    options: [
      { id: 'A', text: `1 50 1 60 e` },
      { id: 'B', text: `1 50 1 50 e` },
      { id: 'C', text: `1 50 1 10 e` },
      { id: 'D', text: `1 55 1 54 e` },
      { id: 'E', text: `1 100 1 100 e` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q160',
    questionNumber: 160,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `No caso analisado, qual seria a classificação do desempenho da empresa?`,
    supportTitle: `Analisando as vendas de uma empresa, o gerente`,
    supportText: `concluiu que o montante diário arrecadado, em milhar de real,
poderia ser calculado pela expressão V x x x     
2
4 10 105,
em que os valores de x representam os dias do mês,
variando de 1 a 30.
Um dos fatores para avaliar o desempenho mensal
da empresa é verificar qual é o menor montante diário V0
arrecadado ao longo do mês e classificar o desempenho
conforme as categorias apresentadas a seguir, em que as
quantidades estão expressas em milhar de real.
• Ótimo: V0 ≥ 24
• Bom: 20 ≤ V0 < 24
• Normal: 10 ≤ V0 < 20
• Ruim: 4 ≤ V0 < 10
• Péssimo: V0 < 4`,
    contentBlocks: [
      { type: 'paragraph', text: `Analisando as vendas de uma empresa, o gerente` },
      { type: 'paragraph', text: `concluiu que o montante diário arrecadado, em milhar de real,` },
      { type: 'paragraph', text: `poderia ser calculado pela expressão V x x x     ` },
      { type: 'paragraph', text: `2` },
      { type: 'paragraph', text: `4 10 105,` },
      { type: 'paragraph', text: `em que os valores de x representam os dias do mês,` },
      { type: 'paragraph', text: `variando de 1 a 30.` },
      { type: 'paragraph', text: `Um dos fatores para avaliar o desempenho mensal` },
      { type: 'formula', latex: `da empresa é verificar qual é o menor montante diário V0`, fallbackText: `da empresa é verificar qual é o menor montante diário V0` },
      { type: 'paragraph', text: `arrecadado ao longo do mês e classificar o desempenho` },
      { type: 'paragraph', text: `conforme as categorias apresentadas a seguir, em que as` },
      { type: 'paragraph', text: `quantidades estão expressas em milhar de real.` },
      { type: 'formula', latex: `• Ótimo: V0 ≥ 24`, fallbackText: `• Ótimo: V0 ≥ 24` },
      { type: 'formula', latex: `• Bom: 20 ≤ V0 < 24`, fallbackText: `• Bom: 20 ≤ V0 < 24` },
      { type: 'formula', latex: `• Normal: 10 ≤ V0 < 20`, fallbackText: `• Normal: 10 ≤ V0 < 20` },
      { type: 'formula', latex: `• Ruim: 4 ≤ V0 < 10`, fallbackText: `• Ruim: 4 ≤ V0 < 10` },
      { type: 'formula', latex: `• Péssimo: V0 < 4`, fallbackText: `• Péssimo: V0 < 4` }
    ],
    options: [
      { id: 'A', text: `Ótimo.` },
      { id: 'B', text: `Bom.` },
      { id: 'C', text: `Normal.` },
      { id: 'D', text: `Ruim.` },
      { id: 'E', text: `Péssimo.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q161',
    questionNumber: 161,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Nessas condições, ao final da primeira hora após a ingestão da quantidade q de álcool, a concentração C dessa substância no sangue é expressa algebricamente por`,
    supportTitle: `Dirigir após ingerir bebidas alcoólicas é uma atitude`,
    supportText: `extremamente perigosa, uma vez que, a partir da primeira
dose, a pessoa já começa a ter perda de sensibilidade
de movimentos e de reflexos. Apesar de a eliminação e
absorção do álcool depender de cada pessoa e de como
o organismo consegue metabolizar a substância, ao final
da primeira hora após a ingestão, a concentração de álcool
(C) no sangue corresponde a aproximadamente 90% da
quantidade (q) de álcool ingerida, e a eliminação total
dessa concentração pode demorar até 12 horas.`,
    sourceCitation: `Disponível em: http://g1.globo.com. Acesso em: 1 dez. 2018 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `Dirigir após ingerir bebidas alcoólicas é uma atitude` },
      { type: 'paragraph', text: `extremamente perigosa, uma vez que, a partir da primeira` },
      { type: 'paragraph', text: `dose, a pessoa já começa a ter perda de sensibilidade` },
      { type: 'paragraph', text: `de movimentos e de reflexos. Apesar de a eliminação e` },
      { type: 'paragraph', text: `absorção do álcool depender de cada pessoa e de como` },
      { type: 'paragraph', text: `o organismo consegue metabolizar a substância, ao final` },
      { type: 'paragraph', text: `da primeira hora após a ingestão, a concentração de álcool` },
      { type: 'paragraph', text: `(C) no sangue corresponde a aproximadamente 90% da` },
      { type: 'paragraph', text: `quantidade (q) de álcool ingerida, e a eliminação total` },
      { type: 'paragraph', text: `dessa concentração pode demorar até 12 horas.` },
      { type: 'citation', text: `Disponível em: http://g1.globo.com. Acesso em: 1 dez. 2018 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `C = 0,9q` },
      { id: 'B', text: `C = 0,1q` },
      { id: 'C', text: `C = 1 − 0,1q` },
      { id: 'D', text: `C = 1 − 0,9q` },
      { id: 'E', text: `C = q − 10` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q163',
    questionNumber: 163,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Quando o som é considerado baixo, ou seja, N = 48 dB ou menos, deve ser utilizada a medida preventiva I. No caso de o som ser moderado, quando N está no intervalo (48 dB, 55 dB), deve ser utilizada a medida preventiva II. Quando o som é moderado alto, que equivale a N no intervalo (55 dB, 80 dB), a medida preventiva a ser usada é a III. Se N estiver no intervalo (80 dB, 115 dB), quando o som é considerado alto, deve ser utilizada a medida preventiva IV. E se o som é considerado muito alto, com N maior que 115 dB, deve-se utilizar a medida preventiva V. Uma nova máquina, com I = 8 × 10−8 W/m2 , foi adquirida e será classificada de acordo com o nível de ruído que produz. Considere 0,3 como aproximação para log10 2. O funcionário que operará a nova máquina deverá adotar a medida preventiva`,
    supportTitle: `A exposição a alguns níveis sonoros pode causar`,
    supportText: `lesões auditivas. Por isso, em uma indústria, são adotadas
medidas preventivas de acordo com a máquina que o
funcionário opera e o nível N de intensidade do som,
medido em decibel (dB), a que o operário é exposto,
sendo N = log10I 10 − log10I 10
0 , I a intensidade do som e
I0 = 10−12 W/m 2.`,
    sourceCitation: `Disponível em: www.sofisica.com.br. Acesso em: 8 jul. 2015 (adaptado).`,
    contentBlocks: [
      { type: 'paragraph', text: `A exposição a alguns níveis sonoros pode causar` },
      { type: 'paragraph', text: `lesões auditivas. Por isso, em uma indústria, são adotadas` },
      { type: 'paragraph', text: `medidas preventivas de acordo com a máquina que o` },
      { type: 'paragraph', text: `funcionário opera e o nível N de intensidade do som,` },
      { type: 'paragraph', text: `medido em decibel (dB), a que o operário é exposto,` },
      { type: 'paragraph', text: `sendo N = log10I 10 − log10I 10` },
      { type: 'paragraph', text: `0 , I a intensidade do som e` },
      { type: 'formula', latex: `I0 = 10−12 W/m 2.`, fallbackText: `I0 = 10−12 W/m 2.` },
      { type: 'citation', text: `Disponível em: www.sofisica.com.br. Acesso em: 8 jul. 2015 (adaptado).` }
    ],
    options: [
      { id: 'A', text: `I.` },
      { id: 'B', text: `II.` },
      { id: 'C', text: `III.` },
      { id: 'D', text: `IV.` },
      { id: 'E', text: `V.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q165',
    questionNumber: 165,
    area: 'mathematics',
    topic: 'Estatística',
    prompt: `A média dos salários dos 100 funcionários dessa empresa, em real, é`,
    supportTitle: `Os 100 funcionários de uma empresa estão`,
    supportText: `distribuídos em dois setores: Produção e Administração.
Os funcionários de um mesmo setor recebem salários
com valores iguais. O quadro apresenta a quantidade de
funcionários por setor e seus respectivos salários.
Setor Quantidade de
funcionários
Salário
(em real)
Produção 75 2 000,00
Administração 25 7 000,00`,
    contentBlocks: [
      { type: 'paragraph', text: `Os 100 funcionários de uma empresa estão` },
      { type: 'paragraph', text: `distribuídos em dois setores: Produção e Administração.` },
      { type: 'paragraph', text: `Os funcionários de um mesmo setor recebem salários` },
      { type: 'paragraph', text: `com valores iguais. O quadro apresenta a quantidade de` },
      { type: 'paragraph', text: `funcionários por setor e seus respectivos salários.` },
      { type: 'paragraph', text: `Setor Quantidade de` },
      { type: 'paragraph', text: `funcionários` },
      { type: 'paragraph', text: `Salário` },
      { type: 'paragraph', text: `(em real)` },
      { type: 'paragraph', text: `Produção 75 2 000,00` },
      { type: 'paragraph', text: `Administração 25 7 000,00` }
    ],
    options: [
      { id: 'A', text: `2 000,00.` },
      { id: 'B', text: `2 500,00.` },
      { id: 'C', text: `3 250,00.` },
      { id: 'D', text: `4 500,00.` },
      { id: 'E', text: `9 000,00.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q166',
    questionNumber: 166,
    area: 'mathematics',
    topic: 'Probabilidade',
    prompt: `Qual é o número mínimo de bolinhas brancas que o gerente deve adicionar à urna B?`,
    supportTitle: `Visando atrair mais clientes, o gerente de uma loja`,
    supportText: `anunciou uma promoção em que cada cliente que realizar
uma compra pode ganhar um voucher para ser usado
em sua próxima compra. Para ganhar seu voucher,
o cliente precisa retirar, ao acaso, uma bolinha de dentro
de cada uma das duas urnas A e B disponibilizadas pelo
gerente, nas quais há apenas bolinhas pretas e brancas.
Atualmente, a probabilidade de se escolher, ao acaso,
uma bolinha preta na urna A é igual a 20% e a probabilidade
de se escolher uma bolinha preta na urna B é 25%.
Ganha o voucher o cliente que retirar duas bolinhas pretas,
uma de cada urna.
Com o passar dos dias, o gerente percebeu que, para a
promoção ser viável aos negócios, era preciso alterar
a probabilidade de acerto do cliente sem alterar a regra
da promoção. Para isso, resolveu alterar a quantidade de
bolinhas brancas na urna B de forma que a probabilidade
de um cliente ganhar o voucher passasse a ser menor ou
igual a 1%. Sabe-se que a urna B tem 4 bolinhas pretas e
que, em ambas as urnas, todas as bolinhas têm a mesma
probabilidade de serem retiradas.`,
    contentBlocks: [
      { type: 'paragraph', text: `Visando atrair mais clientes, o gerente de uma loja` },
      { type: 'paragraph', text: `anunciou uma promoção em que cada cliente que realizar` },
      { type: 'paragraph', text: `uma compra pode ganhar um voucher para ser usado` },
      { type: 'paragraph', text: `em sua próxima compra. Para ganhar seu voucher,` },
      { type: 'paragraph', text: `o cliente precisa retirar, ao acaso, uma bolinha de dentro` },
      { type: 'paragraph', text: `de cada uma das duas urnas A e B disponibilizadas pelo` },
      { type: 'paragraph', text: `gerente, nas quais há apenas bolinhas pretas e brancas.` },
      { type: 'paragraph', text: `Atualmente, a probabilidade de se escolher, ao acaso,` },
      { type: 'paragraph', text: `uma bolinha preta na urna A é igual a 20% e a probabilidade` },
      { type: 'paragraph', text: `de se escolher uma bolinha preta na urna B é 25%.` },
      { type: 'paragraph', text: `Ganha o voucher o cliente que retirar duas bolinhas pretas,` },
      { type: 'paragraph', text: `uma de cada urna.` },
      { type: 'paragraph', text: `Com o passar dos dias, o gerente percebeu que, para a` },
      { type: 'paragraph', text: `promoção ser viável aos negócios, era preciso alterar` },
      { type: 'paragraph', text: `a probabilidade de acerto do cliente sem alterar a regra` },
      { type: 'paragraph', text: `da promoção. Para isso, resolveu alterar a quantidade de` },
      { type: 'paragraph', text: `bolinhas brancas na urna B de forma que a probabilidade` },
      { type: 'paragraph', text: `de um cliente ganhar o voucher passasse a ser menor ou` },
      { type: 'paragraph', text: `igual a 1%. Sabe-se que a urna B tem 4 bolinhas pretas e` },
      { type: 'paragraph', text: `que, em ambas as urnas, todas as bolinhas têm a mesma` },
      { type: 'paragraph', text: `probabilidade de serem retiradas.` }
    ],
    options: [
      { id: 'A', text: `20` },
      { id: 'B', text: `60` },
      { id: 'C', text: `64` },
      { id: 'D', text: `68` },
      { id: 'E', text: `80` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q169',
    questionNumber: 169,
    area: 'mathematics',
    topic: 'Estatística',
    prompt: `No início de qual desses meses o produtor deverá plantar esse tipo de semente?`,
    supportTitle: `Um tipo de semente necessita de bastante água nos`,
    supportText: `dois primeiros meses após o plantio. Um produtor pretende
estabelecer o melhor momento para o plantio desse tipo de
semente, nos meses de outubro a março. Após consultar
a previsão do índice mensal de precipitação de chuva
(ImPC) da região onde ocorrerá o plantio, para o período
chuvoso de 2020 - 2021, ele obteve os seguintes dados:
• outubro/2020: ImPC = 250 mm;
• novembro/2020: ImPC = 150 mm;
• dezembro/2020: ImPC = 200 mm;
• janeiro/2021: ImPC = 450 mm;
• fevereiro/2021: ImPC = 100 mm;
• março/2021: ImPC = 200 mm.
Com base nessas previsões, ele precisa escolher
dois meses consecutivos em que a média mensal de
precipitação seja a maior possível.`,
    contentBlocks: [
      { type: 'paragraph', text: `Um tipo de semente necessita de bastante água nos` },
      { type: 'paragraph', text: `dois primeiros meses após o plantio. Um produtor pretende` },
      { type: 'paragraph', text: `estabelecer o melhor momento para o plantio desse tipo de` },
      { type: 'paragraph', text: `semente, nos meses de outubro a março. Após consultar` },
      { type: 'paragraph', text: `a previsão do índice mensal de precipitação de chuva` },
      { type: 'paragraph', text: `(ImPC) da região onde ocorrerá o plantio, para o período` },
      { type: 'paragraph', text: `chuvoso de 2020 - 2021, ele obteve os seguintes dados:` },
      { type: 'formula', latex: `• outubro/2020: ImPC = 250 mm;`, fallbackText: `• outubro/2020: ImPC = 250 mm;` },
      { type: 'formula', latex: `• novembro/2020: ImPC = 150 mm;`, fallbackText: `• novembro/2020: ImPC = 150 mm;` },
      { type: 'formula', latex: `• dezembro/2020: ImPC = 200 mm;`, fallbackText: `• dezembro/2020: ImPC = 200 mm;` },
      { type: 'formula', latex: `• janeiro/2021: ImPC = 450 mm;`, fallbackText: `• janeiro/2021: ImPC = 450 mm;` },
      { type: 'formula', latex: `• fevereiro/2021: ImPC = 100 mm;`, fallbackText: `• fevereiro/2021: ImPC = 100 mm;` },
      { type: 'formula', latex: `• março/2021: ImPC = 200 mm.`, fallbackText: `• março/2021: ImPC = 200 mm.` },
      { type: 'paragraph', text: `Com base nessas previsões, ele precisa escolher` },
      { type: 'paragraph', text: `dois meses consecutivos em que a média mensal de` },
      { type: 'paragraph', text: `precipitação seja a maior possível.` }
    ],
    options: [
      { id: 'A', text: `Outubro.` },
      { id: 'B', text: `Novembro.` },
      { id: 'C', text: `Dezembro.` },
      { id: 'D', text: `Janeiro.` },
      { id: 'E', text: `Fevereiro.` }
    ],
    correctAnswerId: 'C',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q170',
    questionNumber: 170,
    area: 'mathematics',
    topic: 'Matemática financeira',
    prompt: `à vista e divide esse novo valor por 3. A primeira parcela deve ser paga no ato da compra, e as duas últimas, em 30 e 60 dias após a compra. Um cliente da loja decidiu comprar, de forma financiada, um produto cujo valor à vista é R$ 1 500,00. Utilize 5,29 como aproximação para 28 . A taxa mensal de juros compostos praticada nesse financiamento é de`,
    supportTitle: `Uma loja vende seus produtos de duas formas:`,
    supportText: `à vista ou financiado em três parcelas mensais iguais.
Para definir o valor dessas parcelas nas vendas
financiadas, a loja aumenta em 20% o valor do produto`,
    contentBlocks: [
      { type: 'paragraph', text: `Uma loja vende seus produtos de duas formas:` },
      { type: 'paragraph', text: `à vista ou financiado em três parcelas mensais iguais.` },
      { type: 'paragraph', text: `Para definir o valor dessas parcelas nas vendas` },
      { type: 'paragraph', text: `financiadas, a loja aumenta em 20% o valor do produto` }
    ],
    options: [
      { id: 'A', text: `6,7%` },
      { id: 'B', text: `10%` },
      { id: 'C', text: `20%` },
      { id: 'D', text: `21,5%` },
      { id: 'E', text: `23,3%` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q171',
    questionNumber: 171,
    area: 'mathematics',
    topic: 'Geometria',
    prompt: `A expressão que representa o preço y em função do volume x, em metro cúbico, é`,
    supportTitle: `Para concretar a laje de sua residência, uma pessoa`,
    supportText: `contratou uma construtora. Tal empresa informa que o
preço y do concreto bombeado é composto de duas
partes: uma fixa, chamada de taxa de bombeamento,
e uma variável, que depende do volume x de concreto
utilizado. Sabe-se que a taxa de bombeamento custa
R$ 500,00 e que o metro cúbico do concreto bombeado
é de R$ 250,00.`,
    contentBlocks: [
      { type: 'paragraph', text: `Para concretar a laje de sua residência, uma pessoa` },
      { type: 'paragraph', text: `contratou uma construtora. Tal empresa informa que o` },
      { type: 'paragraph', text: `preço y do concreto bombeado é composto de duas` },
      { type: 'paragraph', text: `partes: uma fixa, chamada de taxa de bombeamento,` },
      { type: 'paragraph', text: `e uma variável, que depende do volume x de concreto` },
      { type: 'paragraph', text: `utilizado. Sabe-se que a taxa de bombeamento custa` },
      { type: 'paragraph', text: `R$ 500,00 e que o metro cúbico do concreto bombeado` },
      { type: 'paragraph', text: `é de R$ 250,00.` }
    ],
    options: [
      { id: 'A', text: `y = 250x` },
      { id: 'B', text: `y = 500x` },
      { id: 'C', text: `y = 750x` },
      { id: 'D', text: `y = 250x + 500` },
      { id: 'E', text: `y = 500x + 250` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q173',
    questionNumber: 173,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Um supermercado conta com cinco caixas disponíveis para pagamento. Foram instaladas telas que apresentam o tempo médio gasto por cada caixa para iniciar e finalizar o atendimento de cada cliente, e o número de pessoas presentes na fila de cada caixa em tempo real. Um cliente, na hora de passar sua compra, sabendo que cada um dos cinco caixas iniciará um novo atendimento naquele momento, pretende gastar o menor tempo possível de espera na fila. Ele observa que as telas apresentavam as informações a seguir. • Caixa I: atendimento 12 minutos, 5 pessoas na fila. • Caixa II: atendimento 6 minutos, 9 pessoas na fila. • Caixa III: atendimento 5 minutos, 6 pessoas na fila. • Caixa IV: atendimento 15 minutos, 2 pessoas na fila. • Caixa V: atendimento 9 minutos, 3 pessoas na fila. Para alcançar seu objetivo, o cliente deverá escolher o caixa`,
    options: [
      { id: 'A', text: `I.` },
      { id: 'B', text: `II.` },
      { id: 'C', text: `III.` },
      { id: 'D', text: `IV.` },
      { id: 'E', text: `V.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Day2Question({
    externalId: 'ENEM-2023-D2-C5-Q180',
    questionNumber: 180,
    area: 'mathematics',
    topic: 'Aritmética',
    prompt: `Qual o preço, em real, de uma cartela de tíquetes vermelhos?`,
    supportText: `O metrô de um município oferece dois tipos de tíquetes com colorações diferentes, azul e vermelha, sendo vendidos
em cartelas, cada qual com nove tíquetes da mesma cor e mesmo valor unitário. Duas cartelas de tíquetes azuis e
uma cartela de tíquetes vermelhos são vendidas por R$ 32,40. Sabe-se que o preço de um tíquete azul menos o preço
de um tíquete vermelho é igual ao preço de um tíquete vermelho mais cinco centavos.`,
    contentBlocks: [
      { type: 'paragraph', text: `O metrô de um município oferece dois tipos de tíquetes com colorações diferentes, azul e vermelha, sendo vendidos` },
      { type: 'paragraph', text: `em cartelas, cada qual com nove tíquetes da mesma cor e mesmo valor unitário. Duas cartelas de tíquetes azuis e` },
      { type: 'paragraph', text: `uma cartela de tíquetes vermelhos são vendidas por R$ 32,40. Sabe-se que o preço de um tíquete azul menos o preço` },
      { type: 'paragraph', text: `de um tíquete vermelho é igual ao preço de um tíquete vermelho mais cinco centavos.` }
    ],
    options: [
      { id: 'A', text: `4,68` },
      { id: 'B', text: `6,30` },
      { id: 'C', text: `9,30` },
      { id: 'D', text: `10,50` },
      { id: 'E', text: `10,65` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
];
