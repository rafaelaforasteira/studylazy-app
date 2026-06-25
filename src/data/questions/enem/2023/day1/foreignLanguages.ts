import { buildEnem2023Question } from './buildQuestion';

export const foreignLanguageQuestions: ReturnType<typeof buildEnem2023Question>[] = [
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ING-01',
    questionNumber: 1,
    languageTrack: 'english',
    area: 'languages',
    topic: 'Interpretação de texto em língua inglesa',
    prompt: `Esse cartaz de campanha sugere que`,
    supportTitle: `The average american tosses 300 pounds of food`,
    supportText: `each year, making food the number one contributor to
America’s landfills. Eat your leftovers and keep your
perishables in the fridge – the Earth is counting on it.`,
    sourceCitation: `Disponível em: https://mir-s3-cdn-cf.behance.net. Acesso em: 29 out. 2021 (adaptado).`,
    options: [
      { id: 'A', text: `os lixões precisam de ampliação.` },
      { id: 'B', text: `o desperdício degrada o ambiente.` },
      { id: 'C', text: `os mercados doam alimentos perecíveis.` },
      { id: 'D', text: `a desnutrição compromete o raciocínio.` },
      { id: 'E', text: `as residências carecem de refrigeradores.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ING-02',
    questionNumber: 2,
    languageTrack: 'english',
    area: 'languages',
    topic: 'Interpretação de texto em língua inglesa',
    prompt: `Nesse poema, a expressão “No man is an island ” ressalta o(a)`,
    supportTitle: `No man is an island,`,
    supportText: `Entire of itself;
Every man is a piece of the continent,
A part of the main.
[...]
Any man’s death diminishes me,
Because I am involved in mankind.`,
    sourceCitation: `DONNE, J. The Works of John Donne. Londres: John W. Parker, 1839 (fragmento).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `medo da morte.` },
      { id: 'B', text: `ideia de conexão.` },
      { id: 'C', text: `conceito de solidão.` },
      { id: 'D', text: `risco de devastação.` },
      { id: 'E', text: `necessidade de empatia.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ING-03',
    questionNumber: 3,
    languageTrack: 'english',
    area: 'languages',
    topic: 'Interpretação de texto em língua inglesa',
    prompt: `Ao retratar a trajetória de refugiados, o poema recorre à imagem de viagem marítima para destacar o(a)`,
    supportTitle: `Things We Carry on the Sea`,
    supportText: `We carry tears in our eyes: good-bye father, good-bye
[mother
We carry soil in small bags: may home never fade in our
[hearts
We carry carnage of mining, droughts, floods, genocides
We carry dust of our families and neighbors incinerated
[in mushroom clouds
We carry our islands sinking under the sea
We carry our hands, feet, bones, hearts and best minds
[for a new life
We carry diplomas: medicine, engineer, nurse,
[education, math, poetry, even if they mean
[nothing to the other shore
We carry railroads, plantations, laundromats,
[bodegas, taco trucks, farms, factories, nursing
[homes, hospitals, schools, temples... built on
[our ancestors’ backs
We carry old homes along the spine, new dreams in our
[chests
We carry yesterday, today and tomorrow
We’re orphans of the wars forced upon us
We’re refugees of the sea rising from industrial wastes
And we carry our mother tongues
[...]
As we drift... in our rubber boats... from shore... to shore...
[to shore...`,
    sourceCitation: `PING, W. Disponível em: https://poets.org. Acesso em: 1 jun. 2023 (fragmento).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `risco de choques culturais.` },
      { id: 'B', text: `impacto do ensino de história.` },
      { id: 'C', text: `importância da luta ambiental.` },
      { id: 'D', text: `existência de experiências plurais.` },
      { id: 'E', text: `necessidade de capacitação profissional.` }
    ],
    correctAnswerId: 'D',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ING-04',
    questionNumber: 4,
    languageTrack: 'english',
    area: 'languages',
    topic: 'Interpretação de texto em língua inglesa',
    prompt: `Nesse poema de Tato Laviera, o eu lírico destaca uma`,
    supportTitle: `Spanglish`,
    supportText: `pues estoy creando Spanglish
bi-cultural systems
scientific lexicographical
inter-textual integrations
two expressions
existentially wired
two dominant languages
continentally abrazándose
in colloquial combate
imperio spanglish emerges
sobre territorio bi-lingual
las novelas mexicanas
mixing with radiorocknroll
immigrant/migrant
nasal mispronouncements
hip-hop, street salsa, spanish pop
standard english classroom
with computer technicalities
spanglish is literally perfect`,
    sourceCitation: `LAVIERA, T. Benedición: The Complete Poetry of Tato Laviera. Houston: Arte Público Press, 2014 (fragmento).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `convergência linguístico-cultural.` },
      { id: 'B', text: `característica histórico-cultural.` },
      { id: 'C', text: `tendência estilístico-literária.` },
      { id: 'D', text: `discriminação cultural.` },
      { id: 'E', text: `censura musical.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ESP-02',
    questionNumber: 2,
    languageTrack: 'spanish',
    area: 'languages',
    topic: 'Interpretação de texto em língua espanhola',
    prompt: `Acesso em: 25 out. 2021. Para enfatizar características e atitudes que reforçam a identidade da mulher negra, o poema da escritora costarriquenha apresenta`,
    supportTitle: `Me niego rotundamente`,
    supportText: `A negar mi voz,
Mi sangre y mi piel.
Y me niego rotundamente
A dejar de ser yo,
A dejar de sentirme bien
Cuando miro mi rostro en el espejo
Con mi boca
Rotundamente grande,
Y mi nariz
Rotundamente hermosa,
Y mis dientes
Rotundamente blancos,
Y mi piel valientemente negra.
Y me niego categóricamente
A dejar de hablar
Mi lengua, mi acento y mi historia.
Y me niego absolutamente
A ser parte de los que callan,
De los que temen,
De los que lloran.
Porque me acepto
Rotundamente libre,
Rotundamente negra,
Rotundamente hermosa.`,
    sourceCitation: `CAMPBELL BARR, S. Disponível em: https://negracubanateniaqueser.com.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `advérbios como “rotundamente” e “categóricamente”.` },
      { id: 'B', text: `verbos reflexivos como “me niego” e “me acepto”.` },
      { id: 'C', text: `adjetivos como “grande” e “hermosa”.` },
      { id: 'D', text: `substantivos como “sangre” e “piel”.` },
      { id: 'E', text: `adjetivos possessivos como “mi” e “mis”.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ESP-03',
    questionNumber: 3,
    languageTrack: 'spanish',
    area: 'languages',
    topic: 'Interpretação de texto em língua espanhola',
    prompt: `Nesse poema, o eu poético enaltece a`,
    supportTitle: `“Caramelos” en sus suelos`,
    supportText: `Las tierras de España, tu vista enamoran;
sus gentes; te amistan; ¿“cocinas”?, ¡“te molan”!
¿El plato común?, ¡pues «tortilla/patatas»!;
en bares, figones, o tascas, ¡las «tapas»!;
“sabor nacional”, ¡el «gazpacho», sus «vinos»,
«sangría», y «jamón» de sabrosos cochinos!
(Cual “sellos”, te grabas sus «Típicos Platos»;
¡sabrás por dó pasas, por sólo tu olfato!,
¡si en cada lugar, un sabor peculiar,
“al paso” cautiva tu buen paladar!).
¡Son más que “recetas”!, ¡será “alegoría”!,
¡será “identidad”! (¡hay “reserva” en su «Guía»!);
son platos allende un “timón conductor”,
¡son mar, ríos, sierras!, ¡son valles, son flor!,
¡y aportan “Conventos” a gastronomía,
sus «dulces»! (sabor “celestial”, ¡de ambrosía!).`,
    sourceCitation: `QUIROZ Y LÓPEZ, M. Disponível em: https://pt.calameo.com. Acesso em: 25 out. 2021.`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `característica amistosa do povo espanhol.` },
      { id: 'B', text: `beleza das paisagens naturais da Espanha.` },
      { id: 'C', text: `variedade de pratos na gastronomia espanhola.` },
      { id: 'D', text: `relação entre os sentidos do paladar e do olfato na gastronomia.` },
      { id: 'E', text: `gastronomia como representação da identidade cultural de um povo.` }
    ],
    correctAnswerId: 'E',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ESP-04',
    questionNumber: 4,
    languageTrack: 'spanish',
    area: 'languages',
    topic: 'Interpretação de texto em língua espanhola',
    prompt: `Nesse texto, a expressão “cortina de humo” revela que o manipulador`,
    supportTitle: `Técnicas de manipulación y el resultado`,
    supportText: `Manipular es sembrar en la conciencia y en la mente
de la gente ideas, actitudes, conceptos y aspiraciones
— incluso falsas e inmorales — que sirvan a los objetivos
de sus manipuladores.
Manipular es una de las primeras cosas que
aprendemos en la vida. A muy temprana edad, los bebés
descubren el poder del llanto, el berrinche, los pataleos,
la risa o alguna “gracia” como recursos para demandar
atención, exigir comida, pedir ayuda o simplemente
mantener ocupada a la gente. Nuestras actitudes de
adultos reflejan lo mucho o poco que algunos maduraron,
procesaron y rebasaron ese periodo.
Para que exista un manipulador, debe haber una
base de ciudadanos indefensos, dóciles, desinformados.
El manipulador es celoso, a veces casi paranoico;
no admite cuestionamientos ni quiere que nadie ocupe
su espacio, sabe que su vigencia depende de presencia
controladora. Todos los días, hay que marcar la línea de
discurso, incidir en el debate. El ridículo vale la pena si
con ello se logra una cortina de humo.`,
    sourceCitation: `Disponível em: www.forbes.com.mx. Acesso em: 7 out. 2021 (adaptado).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `amadurece tardiamente.` },
      { id: 'B', text: `busca mascarar a verdade.` },
      { id: 'C', text: `rejeita questionamentos alheios.` },
      { id: 'D', text: `aproxima-se de pessoas indefesas.` },
      { id: 'E', text: `faz-se presente de forma controladora.` }
    ],
    correctAnswerId: 'B',
    verified: true
  }),
  buildEnem2023Question({
    externalId: 'ENEM-2023-D1-C1-ESP-05',
    questionNumber: 5,
    languageTrack: 'spanish',
    area: 'languages',
    topic: 'Interpretação de texto em língua espanhola',
    prompt: `A letra da canção Que quede claro, da banda cubana Orishas, revela o(a)`,
    supportTitle: `Que quede claro`,
    supportText: `Cómo es posible que se cierren
tantas bocas, tantos ojos,
tantas puertas, muchas mentes ante un
acto xenofóbico sin precedentes.
Presidentes, ministros, cancilleres,
autoridades, responsables.
¿Quién pagará el daño causado a familiares?
Por un loco del estrada sin modales. [...]
Se alejó de aquel lugar donde su color era
mucho más que su color, era su raza.
Persiguiendo un sueño que desapareció,
que se fusionó y terminó en una pesadilla. [...]
Déjame que te cuente esta historia
que sucedió en el metro de Barcelona,
cuando aquella mañana la injusticia
y xenofobia se juntaron de la mano,
protagonizando una de las más feas escenas de racismo.
En aquel vagón viajaba un ángel de color diferente,
en su camino se interpuso aquel inconsciente,
que aún sabiendo lo que hacía,
seguía hablando con su gente.
Le dio al ángel dos patadas en su cara,
se rió de ella sin cambiar la mirada.
Y aún anda suelto, aún anda suelto...`,
    sourceCitation: `ORISHAS. In: Cosita buena. Delaware: Suerte Publishing LLC, 2008 (fragmento).`,
    contentFormat: 'verse',
    options: [
      { id: 'A', text: `indignação diante do desrespeito à diversidade.` },
      { id: 'B', text: `violência característica das grandes metrópoles.` },
      { id: 'C', text: `preconceito da sociedade com relação ao misticismo.` },
      { id: 'D', text: `descuido da população com os sonhos dos imigrantes.` },
      { id: 'E', text: `falta de segurança existente no transporte público urbano.` }
    ],
    correctAnswerId: 'A',
    verified: true
  }),
];
