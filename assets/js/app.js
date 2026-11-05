import { deleteRecord, getAllRecords, saveRecord } from './db.js';
import { renderActivities, renderCatalog, renderPlants, renderTasks } from './modules/UI.js';

const activityDialog = document.querySelector('#activity-dialog');
const activityForm = document.querySelector('#activity-form');
const plantDialog = document.querySelector('#plant-dialog');
const plantForm = document.querySelector('#plant-form');
const accountDialog = document.querySelector('#account-dialog');
const accountForm = document.querySelector('#account-form');
const loginDialog = document.querySelector('#login-dialog');
const loginForm = document.querySelector('#login-form');
const activityList = document.querySelector('#activity-list');
const dashboardActivities = document.querySelector('#dashboard-activities');
const taskList = document.querySelector('#task-list');
const plantsGrid = document.querySelector('#plants-grid');
const catalogGrid = document.querySelector('#catalog-grid');
const catalogSearch = document.querySelector('#catalog-search');
const catalogCategory = document.querySelector('#catalog-category');
const catalogLocation = document.querySelector('#catalog-location');
const statusMessage = document.querySelector('#connection-status');
const views = [...document.querySelectorAll('.view')];
const demoGardener = { id: 'gardener-demo', name: 'Jardineira de Teste', role: 'Responsável de jardim', accountType: 'demo' };
let catalogProducts = [];

const samplePlants = [
  { id: 'demo-plant-a', label: 'Orquídea', interest: 'Rega moderada e luz indireta', progress: 76, color: 'mint' },
  { id: 'demo-plant-b', label: 'Lavanda', interest: 'Sol directo e drenagem leve', progress: 84, color: 'peach' },
  { id: 'demo-plant-c', label: 'Suculenta', interest: 'Humidade baixa e exposição solar', progress: 61, color: 'yellow' }
];

const sampleProducts = [
  { id: 'product-rose', name: 'Roseira', scientificName: 'Rosa spp.', category: 'Floração', location: 'Exterior', description: 'Arbusto florido com muitas variedades e cores.', light: 'Sol direto, idealmente várias horas por dia.', water: 'Regar junto ao solo quando a superfície começar a secar; evitar encharcar.', soil: 'Fértil e bem drenado.', size: 'Varia muito conforme a variedade e a poda.', flowering: 'Primavera ao outono, dependendo da variedade e do clima.', pets: 'Sem toxicidade conhecida; os espinhos podem magoar.', keywords: 'rosa roseira jardim arbusto flor', symbol: '🌹', color: 'rose' },
  { id: 'product-orchid', name: 'Orquídea borboleta', scientificName: 'Phalaenopsis spp.', category: 'Floração', location: 'Interior', description: 'Orquídea popular que floresce em ambiente luminoso e protegido.', light: 'Luz abundante indireta; evitar sol forte nas folhas.', water: 'Regar quando as raízes estiverem prateadas e o substrato quase seco; deixar escorrer.', soil: 'Substrato arejado próprio para orquídeas, geralmente à base de casca.', size: 'Tamanho compacto a médio; varia com a cultivar.', flowering: 'Pode florescer durante vários meses; a época varia.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'orquídea phalaenopsis interior flor', symbol: '🌸', color: 'orchid' },
  { id: 'product-lavender', name: 'Lavanda', scientificName: 'Lavandula angustifolia', category: 'Aromáticas', location: 'Exterior', description: 'Planta aromática mediterrânica que aprecia sol e pouca humidade nas raízes.', light: 'Sol direto.', water: 'Pouca água depois de estabelecida; deixar o solo secar entre regas.', soil: 'Leve, pobre a moderadamente fértil e muito bem drenado.', size: 'Arbusto baixo; tamanho depende da variedade e da poda.', flowering: 'Primavera e verão, dependendo do clima.', pets: 'Evitar ingestão por animais; confirmar a espécie e a variedade.', keywords: 'lavanda alfazema aromática perfume', symbol: '💐', color: 'lavender' },
  { id: 'product-succulent', name: 'Aloe vera', scientificName: 'Aloe vera', category: 'Suculentas', location: 'Interior', description: 'Suculenta de folhas carnudas que precisa de boa luz e pouca água.', light: 'Luz intensa; adaptar gradualmente se passar para sol direto.', water: 'Regar apenas quando o substrato estiver seco; nunca deixar água acumulada.', soil: 'Mistura para cactos e suculentas, muito bem drenada.', size: 'Forma rosetas; pode crescer bastante com o tempo.', flowering: 'Pode produzir haste floral em condições favoráveis.', pets: 'Tóxica para cães e gatos se ingerida.', keywords: 'aloe babosa suculenta cacto seca', symbol: '🪴', color: 'succulent' },
  { id: 'product-sunflower', name: 'Girassol', scientificName: 'Helianthus annuus', category: 'Floração', location: 'Exterior', description: 'Anual de floração vistosa que cresce melhor ao ar livre.', light: 'Sol direto durante a maior parte do dia.', water: 'Regar regularmente, sobretudo enquanto cresce e em períodos secos.', soil: 'Fértil, profundo e bem drenado.', size: 'Pode atingir desde menos de um metro até vários metros, conforme a variedade.', flowering: 'Verão ao início do outono.', pets: 'Geralmente considerado não tóxico para cães e gatos.', keywords: 'girassol helianthus flor anual', symbol: '🌻', color: 'sunflower' },
  { id: 'product-monstera', name: 'Costela-de-adão', scientificName: 'Monstera deliciosa', category: 'Folhagem', location: 'Interior', description: 'Tropical de folhas grandes; beneficia de espaço para crescer e de suporte.', light: 'Luz indireta intensa; tolera meia-sombra.', water: 'Regar quando os primeiros centímetros do substrato estiverem secos.', soil: 'Rico em matéria orgânica e bem drenado.', size: 'Pode ficar grande em interior; precisa de espaço e suporte.', flowering: 'Raramente floresce dentro de casa.', pets: 'Tóxica se ingerida por cães e gatos.', keywords: 'monstera costela de adão folhagem tropical', symbol: '🌿', color: 'monstera' },
  { id: 'product-peace-lily', name: 'Lírio-da-paz', scientificName: 'Spathiphyllum wallisii', category: 'Folhagem', location: 'Interior', description: 'Planta de folhagem verde com flores claras, adequada a luz filtrada.', light: 'Luz indireta média; evitar sol direto.', water: 'Manter o substrato ligeiramente húmido, sem encharcar.', soil: 'Substrato rico e bem drenado.', size: 'Porte médio, conforme a variedade e o vaso.', flowering: 'Pode florir várias vezes em condições adequadas.', pets: 'Pode causar irritação se ingerido por pessoas ou animais.', keywords: 'lírio paz espatifilo spathiphyllum interior', symbol: '🤍', color: 'orchid' },
  { id: 'product-jiboia', name: 'Jiboia', scientificName: 'Epipremnum aureum', category: 'Folhagem', location: 'Interior', description: 'Trepadeira resistente, indicada para vasos suspensos ou com tutor.', light: 'Luz indireta; adapta-se a meia-sombra.', water: 'Regar quando a parte superior do substrato secar.', soil: 'Leve e bem drenado.', size: 'Ramos podem crescer vários metros se não forem podados.', flowering: 'Não costuma florescer em interior.', pets: 'Tóxica se ingerida por cães e gatos.', keywords: 'jiboia pothos trepadeira epipremnum', symbol: '🌱', color: 'monstera' },
  { id: 'product-sansevieria', name: 'Espada-de-são-jorge', scientificName: 'Dracaena trifasciata', category: 'Suculentas', location: 'Interior', description: 'Planta de folhas verticais e baixa necessidade de rega.', light: 'Luz indireta; tolera pouca luz, mas cresce melhor com mais luminosidade.', water: 'Deixar o substrato secar completamente entre regas.', soil: 'Muito bem drenado, próprio para suculentas.', size: 'Varia com a variedade; folhas podem ultrapassar um metro.', flowering: 'Raramente floresce em interior.', pets: 'Tóxica se ingerida por cães e gatos.', keywords: 'espada são jorge língua sogra sansevieria dracaena', symbol: '🌿', color: 'succulent' },
  { id: 'product-rosemary', name: 'Alecrim', scientificName: 'Salvia rosmarinus', category: 'Aromáticas', location: 'Exterior', description: 'Erva aromática mediterrânica, útil na cozinha e amiga do sol.', light: 'Sol direto.', water: 'Regar moderadamente; deixar o solo secar parcialmente entre regas.', soil: 'Leve e bem drenado.', size: 'Arbusto perene; tamanho controlado com poda.', flowering: 'Pode florir em diferentes épocas, frequentemente na primavera.', pets: 'Usado como erva culinária; evitar ingestão de grandes quantidades.', keywords: 'alecrim rosmarinus erva aromática culinária', symbol: '🌿', color: 'lavender' },
  { id: 'product-hydrangea', name: 'Hortênsia', scientificName: 'Hydrangea macrophylla', category: 'Floração', location: 'Exterior', description: 'Arbusto ornamental de flores em grandes inflorescências.', light: 'Meia-sombra; proteger do sol forte da tarde.', water: 'Manter humidade regular, sem encharcar; precisa de mais água em tempo quente.', soil: 'Rico em matéria orgânica e bem drenado; o pH pode influenciar a cor.', size: 'Arbusto de porte médio, variável com a variedade.', flowering: 'Primavera e verão, conforme o clima.', pets: 'Tóxica se ingerida por pessoas ou animais.', keywords: 'hortênsia hydrangea arbusto flores', symbol: '🪻', color: 'orchid' },
  { id: 'product-tomato', name: 'Tomateiro', scientificName: 'Solanum lycopersicum', category: 'Horta', location: 'Exterior', description: 'Planta de horta que produz melhor com bastante sol e apoio para os ramos.', light: 'Sol direto, idealmente várias horas por dia.', water: 'Regar regularmente junto ao solo, sem alternar entre secura extrema e encharcamento.', soil: 'Fértil, rico em matéria orgânica e bem drenado.', size: 'Porte variável; muitas variedades precisam de tutor.', flowering: 'Floresce e frutifica na estação quente.', pets: 'Folhas e caules são tóxicos se ingeridos; o fruto maduro é comestível.', keywords: 'tomate tomateiro horta hortaliça', symbol: '🍅', color: 'rose' },
  { id: 'product-rubber-plant', name: 'Figueira-borracha', scientificName: 'Ficus elastica', category: 'Folhagem', location: 'Interior', description: 'Planta tropical de folhas espessas e brilhantes.', light: 'Luz indireta intensa; adaptar gradualmente ao sol suave.', water: 'Regar quando a camada superior do substrato secar.', soil: 'Fértil e bem drenado.', size: 'Pode tornar-se uma árvore de interior; controlar com poda.', flowering: 'Raramente floresce em interior.', pets: 'Seiva irritante e tóxica se ingerida por animais.', keywords: 'ficus borracha árvore planta interior', symbol: '🌿', color: 'monstera' },
  { id: 'product-fiddle-leaf', name: 'Figueira-lira', scientificName: 'Ficus lyrata', category: 'Folhagem', location: 'Interior', description: 'Ficus ornamental de folhas grandes, sensível a mudanças frequentes de local.', light: 'Luz indireta intensa.', water: 'Regar quando alguns centímetros superiores do solo secarem.', soil: 'Rico e bem drenado.', size: 'Pode crescer bastante dentro de casa.', flowering: 'Raramente floresce em interior.', pets: 'Tóxica se ingerida por cães e gatos.', keywords: 'ficus lyrata figueira lira folha grande', symbol: '🌱', color: 'monstera' },
  { id: 'product-zz', name: 'Zamioculca', scientificName: 'Zamioculcas zamiifolia', category: 'Folhagem', location: 'Interior', description: 'Planta resistente de crescimento lento e rizomas que armazenam água.', light: 'Luz indireta; tolera pouca luz.', water: 'Deixar o substrato secar entre regas; evitar excesso de água.', soil: 'Solto e bem drenado.', size: 'Porte médio, crescimento lento.', flowering: 'Raramente floresce em interior.', pets: 'Irritante e tóxica se mastigada ou ingerida.', keywords: 'zamioculca zz zamioculcas resistente', symbol: '🌿', color: 'succulent' },
  { id: 'product-aglaonema', name: 'Aglaonema', scientificName: 'Aglaonema commutatum', category: 'Folhagem', location: 'Interior', description: 'Planta tropical com folhas decorativas, em várias tonalidades.', light: 'Luz indireta média; proteger do sol direto.', water: 'Regar quando a superfície do substrato começar a secar.', soil: 'Fértil, leve e bem drenado.', size: 'Porte compacto a médio.', flowering: 'Pode produzir flores discretas em condições favoráveis.', pets: 'Tóxica se ingerida por cães e gatos.', keywords: 'aglaonema folhagem colorida chinesa evergreen', symbol: '🍃', color: 'monstera' },
  { id: 'product-calathea', name: 'Calateia', scientificName: 'Goeppertia spp.', category: 'Folhagem', location: 'Interior', description: 'Planta tropical conhecida pelos padrões decorativos das folhas.', light: 'Luz indireta média; evitar sol direto.', water: 'Manter o solo ligeiramente húmido, sem encharcar.', soil: 'Rico em matéria orgânica e bem drenado.', size: 'Porte compacto a médio.', flowering: 'A floração depende da espécie e é pouco comum em casa.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'calathea calateia maranta prayer plant folhas', symbol: '🍃', color: 'orchid' },
  { id: 'product-dracaena', name: 'Dracena-de-madagáscar', scientificName: 'Dracaena marginata', category: 'Folhagem', location: 'Interior', description: 'Planta de caule esguio e folhas estreitas, adequada a espaços luminosos.', light: 'Luz indireta; tolera meia-sombra.', water: 'Deixar secar parcialmente o substrato entre regas.', soil: 'Leve e bem drenado.', size: 'Pode atingir grande altura em interior.', flowering: 'Raramente floresce dentro de casa.', pets: 'Tóxica para cães e gatos se ingerida.', keywords: 'dracena marginata dragoeiro madagascar', symbol: '🌿', color: 'monstera' },
  { id: 'product-areca', name: 'Palmeira-areca', scientificName: 'Dypsis lutescens', category: 'Folhagem', location: 'Interior', description: 'Palmeira tropical de vários caules, usada em espaços luminosos.', light: 'Luz indireta intensa; evitar sol forte nas folhas.', water: 'Manter humidade ligeira e deixar escorrer o excesso.', soil: 'Fértil e bem drenado.', size: 'Pode atingir porte elevado em interior.', flowering: 'Raramente floresce em casa.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'areca palmeira dypsis bambu', symbol: '🌴', color: 'monstera' },
  { id: 'product-boston-fern', name: 'Feto-de-boston', scientificName: 'Nephrolepis exaltata', category: 'Folhagem', location: 'Interior', description: 'Feto de frondes arqueadas que prefere ambientes húmidos.', light: 'Luz indireta, sem sol forte.', water: 'Manter o substrato húmido, mas não encharcado.', soil: 'Rico em matéria orgânica e com boa drenagem.', size: 'Frondes compridas e pendentes.', flowering: 'Não produz flores.', pets: 'Geralmente considerado não tóxico para cães e gatos.', keywords: 'feto samambaia nephrolepis boston humidade', symbol: '🌿', color: 'monstera' },
  { id: 'product-african-violet', name: 'Violeta-africana', scientificName: 'Streptocarpus ionanthus', category: 'Floração', location: 'Interior', description: 'Planta compacta de flores coloridas, popular para interiores luminosos.', light: 'Luz indireta intensa.', water: 'Regar o substrato sem molhar as folhas; deixar escorrer.', soil: 'Leve e arejado, próprio para violetas.', size: 'Pequeno e compacto.', flowering: 'Pode florir várias vezes ao ano em boas condições.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'violeta africana saintpaulia flor interior', symbol: '💜', color: 'orchid' },
  { id: 'product-anthurium', name: 'Antúrio', scientificName: 'Anthurium andraeanum', category: 'Floração', location: 'Interior', description: 'Planta tropical com flores duradouras e folhas brilhantes.', light: 'Luz indireta intensa.', water: 'Regar quando a superfície do substrato secar.', soil: 'Muito arejado e bem drenado.', size: 'Porte médio.', flowering: 'Pode florescer durante grande parte do ano em condições favoráveis.', pets: 'Tóxico se ingerido; pode irritar a boca e a pele.', keywords: 'anturio anthurium flor vermelha flamingo', symbol: '🌺', color: 'rose' },
  { id: 'product-cyclamen', name: 'Ciclame', scientificName: 'Cyclamen persicum', category: 'Floração', location: 'Interior', description: 'Planta de floração ornamental que prefere temperaturas frescas.', light: 'Luz intensa indireta; evitar calor excessivo.', water: 'Regar pela base ou junto ao bordo, sem encharcar o tubérculo.', soil: 'Fértil e bem drenado.', size: 'Compacto.', flowering: 'Sobretudo no outono e inverno em clima ameno.', pets: 'Tubérculo tóxico se ingerido, especialmente para animais.', keywords: 'ciclame cyclamen flor inverno', symbol: '🌸', color: 'orchid' },
  { id: 'product-geranium', name: 'Gerânio', scientificName: 'Pelargonium × hortorum', category: 'Floração', location: 'Exterior', description: 'Planta florida comum em vasos e varandas soalheiras.', light: 'Sol direto ou luz muito intensa.', water: 'Regar quando a superfície do solo secar; reduzir no frio.', soil: 'Fértil e bem drenado.', size: 'Porte baixo a médio, conforme a variedade.', flowering: 'Primavera ao outono.', pets: 'Pode ser tóxico para cães e gatos se ingerido.', keywords: 'gerânio pelargonium varanda flor', symbol: '🌺', color: 'rose' },
  { id: 'product-petunia', name: 'Petúnia', scientificName: 'Petunia × atkinsiana', category: 'Floração', location: 'Exterior', description: 'Flor de estação quente, adequada a canteiros e vasos suspensos.', light: 'Sol direto, com alguma sombra em calor extremo.', water: 'Regar regularmente, sem deixar o vaso encharcado.', soil: 'Fértil e bem drenado.', size: 'Baixa ou pendente, conforme a variedade.', flowering: 'Primavera ao outono.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'petunia flor varanda cesta', symbol: '🌸', color: 'lavender' },
  { id: 'product-marigold', name: 'Cravo-túnico', scientificName: 'Tagetes patula', category: 'Floração', location: 'Exterior', description: 'Flor anual resistente, usada em canteiros e vasos soalheiros.', light: 'Sol direto.', water: 'Regar quando a superfície do solo começar a secar.', soil: 'Comum, fértil e bem drenado.', size: 'Baixo a médio, conforme a variedade.', flowering: 'Primavera ao outono.', pets: 'Pode causar irritação gastrointestinal se ingerido por animais.', keywords: 'tagete cravo túnico marigold flor anual', symbol: '🌼', color: 'sunflower' },
  { id: 'product-daisy', name: 'Margarida', scientificName: 'Leucanthemum vulgare', category: 'Floração', location: 'Exterior', description: 'Planta perene de flores brancas, adequada a jardins soalheiros.', light: 'Sol direto ou meia-sombra luminosa.', water: 'Regar durante períodos secos, sem encharcar.', soil: 'Bem drenado e moderadamente fértil.', size: 'Porte médio; varia com a espécie.', flowering: 'Primavera e verão.', pets: 'Algumas margaridas podem causar desconforto se ingeridas; identificar a espécie.', keywords: 'margarida leucanthemum flor branca', symbol: '🌼', color: 'sunflower' },
  { id: 'product-tulip', name: 'Tulipa', scientificName: 'Tulipa spp.', category: 'Floração', location: 'Exterior', description: 'Bolbosa de floração primaveril, plantada normalmente no outono.', light: 'Sol ou meia-sombra luminosa.', water: 'Regar moderadamente durante o crescimento; evitar solo encharcado.', soil: 'Fértil e muito bem drenado.', size: 'Porte baixo a médio.', flowering: 'Primavera.', pets: 'Bolbos e outras partes podem ser tóxicos se ingeridos.', keywords: 'tulipa tulip bolbo primavera flor', symbol: '🌷', color: 'rose' },
  { id: 'product-daffodil', name: 'Narciso', scientificName: 'Narcissus spp.', category: 'Floração', location: 'Exterior', description: 'Bolbosa resistente que anuncia a primavera com flores vistosas.', light: 'Sol ou meia-sombra.', water: 'Humidade moderada durante crescimento; deixar a folhagem secar após floração.', soil: 'Bem drenado.', size: 'Porte baixo a médio.', flowering: 'Final do inverno e primavera.', pets: 'Todas as partes, sobretudo o bolbo, são tóxicas se ingeridas.', keywords: 'narciso narcissus daffodil bolbo primavera', symbol: '🌼', color: 'sunflower' },
  { id: 'product-basil', name: 'Manjericão', scientificName: 'Ocimum basilicum', category: 'Aromáticas', location: 'Interior', description: 'Erva aromática culinária que pode crescer em vaso dentro ou fora de casa.', light: 'Luz intensa e algumas horas de sol suave.', water: 'Manter ligeiramente húmido; não deixar secar por completo.', soil: 'Fértil e bem drenado.', size: 'Erva anual de porte compacto a médio.', flowering: 'Floresce no verão; colher folhas antes da floração para prolongar a produção.', pets: 'Usado em culinária; evitar ingestão de grandes quantidades por animais.', keywords: 'manjericão basilico basil erva cozinha', symbol: '🌿', color: 'lavender' },
  { id: 'product-mint', name: 'Hortelã', scientificName: 'Mentha spicata', category: 'Aromáticas', location: 'Exterior', description: 'Erva aromática vigorosa; é melhor cultivá-la em vaso para limitar a expansão.', light: 'Sol suave ou meia-sombra.', water: 'Manter o solo húmido, sem encharcar.', soil: 'Fértil e húmido, com boa drenagem.', size: 'Erva rasteira que se espalha rapidamente.', flowering: 'Verão.', pets: 'Em pequenas quantidades é usada como erva; algumas variedades ou óleos concentrados podem ser nocivos.', keywords: 'hortelã menta mentha erva chá', symbol: '🌿', color: 'lavender' },
  { id: 'product-parsley', name: 'Salsa', scientificName: 'Petroselinum crispum', category: 'Aromáticas', location: 'Exterior', description: 'Erva culinária fácil de cultivar em canteiros ou vasos.', light: 'Sol suave ou meia-sombra.', water: 'Regar para manter humidade regular, sem encharcar.', soil: 'Fértil e bem drenado.', size: 'Erva compacta; pode crescer mais antes de florescer.', flowering: 'Normalmente no segundo ano de cultivo.', pets: 'Usada em culinária; grandes quantidades podem ser prejudiciais a animais.', keywords: 'salsa parsley petroselinum erva cozinha', symbol: '🌿', color: 'lavender' },
  { id: 'product-thyme', name: 'Tomilho', scientificName: 'Thymus vulgaris', category: 'Aromáticas', location: 'Exterior', description: 'Erva aromática mediterrânica perene, adequada a vasos e canteiros.', light: 'Sol direto.', water: 'Regar pouco depois de estabelecido; deixar o solo secar entre regas.', soil: 'Leve e muito bem drenado.', size: 'Baixo e compacto.', flowering: 'Primavera e verão.', pets: 'Usado como tempero; evitar ingestão de grandes quantidades ou óleo essencial.', keywords: 'tomilho thyme thymus erva aromática', symbol: '🌿', color: 'lavender' },
  { id: 'product-oregano', name: 'Orégãos', scientificName: 'Origanum vulgare', category: 'Aromáticas', location: 'Exterior', description: 'Erva perene aromática, resistente e útil na cozinha.', light: 'Sol direto.', water: 'Regar moderadamente e deixar a superfície secar entre regas.', soil: 'Bem drenado, sem excesso de fertilizante.', size: 'Baixo a médio; espalha-se com o tempo.', flowering: 'Verão.', pets: 'Pode ser nocivo para cães e gatos em grandes quantidades.', keywords: 'oregãos oregano origanum tempero erva', symbol: '🌿', color: 'lavender' },
  { id: 'product-strawberry', name: 'Morangueiro', scientificName: 'Fragaria × ananassa', category: 'Horta', location: 'Exterior', description: 'Planta de fruto que também pode ser cultivada em vasos e floreiras.', light: 'Sol direto, com proteção do calor extremo.', water: 'Manter humidade regular sem molhar excessivamente os frutos.', soil: 'Fértil e bem drenado.', size: 'Baixo e rasteiro; produz estolhos.', flowering: 'Floresce na primavera e pode frutificar até ao verão.', pets: 'Frutos maduros são comestíveis; folhas não substituem alimentação animal adequada.', keywords: 'morango morangueiro fragaria fruto horta', symbol: '🍓', color: 'rose' },
  { id: 'product-pepper', name: 'Pimenteiro', scientificName: 'Capsicum annuum', category: 'Horta', location: 'Exterior', description: 'Planta de horta de estação quente, com frutos doces ou picantes conforme a variedade.', light: 'Sol direto, várias horas por dia.', water: 'Regar regularmente sem encharcar; evitar secura prolongada durante a frutificação.', soil: 'Fértil, quente e bem drenado.', size: 'Porte compacto a médio; pode precisar de tutor.', flowering: 'Floresce e frutifica na estação quente.', pets: 'Folhas e caules não são comestíveis; frutos picantes podem irritar.', keywords: 'pimento pimenta capsicum malagueta horta', symbol: '🫑', color: 'rose' },
  { id: 'product-lettuce', name: 'Alface', scientificName: 'Lactuca sativa', category: 'Horta', location: 'Exterior', description: 'Hortícola de ciclo rápido, adequada a canteiros e vasos fundos.', light: 'Sol suave ou meia-sombra, especialmente em tempo quente.', water: 'Manter o solo uniformemente húmido.', soil: 'Fértil, fresco e bem drenado.', size: 'Baixo; depende da variedade.', flowering: 'Pode espigar e florir com calor ou no fim do ciclo.', pets: 'Folhas são comestíveis; lavar antes de consumir.', keywords: 'alface lettuce lactuca salada horta', symbol: '🥬', color: 'lavender' },
  { id: 'product-cucumber', name: 'Pepineiro', scientificName: 'Cucumis sativus', category: 'Horta', location: 'Exterior', description: 'Trepadeira de horta que pode crescer no chão ou com suporte.', light: 'Sol direto.', water: 'Regar regularmente junto ao solo, mantendo humidade constante.', soil: 'Fértil, quente e bem drenado.', size: 'Ramos compridos; usar espaço ou tutor.', flowering: 'Floresce e frutifica no verão.', pets: 'Fruto maduro é comestível; folhas e caule não são alimento.', keywords: 'pepino pepineiro cucumis horta trepadeira', symbol: '🥒', color: 'lavender' },
  { id: 'product-lemon', name: 'Limoeiro', scientificName: 'Citrus limon', category: 'Horta', location: 'Exterior', description: 'Citrino que pode crescer em vaso; em climas frios precisa de proteção.', light: 'Sol direto e local abrigado.', water: 'Regar quando a superfície do substrato começar a secar; evitar encharcar.', soil: 'Substrato para citrinos, fértil e drenante.', size: 'Árvore pequena a média; em vaso mantém-se mais compacto.', flowering: 'Pode florir em diferentes épocas em clima ameno.', pets: 'Frutos são comestíveis; folhas e casca podem causar desconforto a animais.', keywords: 'limão limoeiro citrus citrino árvore fruto', symbol: '🍋', color: 'sunflower' },
  { id: 'product-fig', name: 'Figueira', scientificName: 'Ficus carica', category: 'Horta', location: 'Exterior', description: 'Árvore de fruto mediterrânica, resistente depois de estabelecida.', light: 'Sol direto.', water: 'Regar durante a instalação e períodos secos; evitar encharcamento.', soil: 'Bem drenado; tolera solos variados.', size: 'Árvore ou arbusto que pode ficar grande; aceita poda.', flowering: 'Os figos desenvolvem-se conforme a variedade e o clima.', pets: 'Seiva pode irritar a pele; figos maduros são comestíveis.', keywords: 'figueira figo ficus carica árvore fruto', symbol: '🟣', color: 'lavender' },
  { id: 'product-cactus', name: 'Cacto-de-natal', scientificName: 'Schlumbergera truncata', category: 'Suculentas', location: 'Interior', description: 'Cacto epífito de floração colorida, diferente dos cactos do deserto.', light: 'Luz indireta intensa; evitar sol forte da tarde.', water: 'Regar quando a superfície começar a secar; não deixar o vaso em água.', soil: 'Leve, arejado e bem drenado.', size: 'Ramos pendentes; adequado a vasos suspensos.', flowering: 'Outono e inverno, conforme a duração da noite e a variedade.', pets: 'Geralmente considerado não tóxico para cães e gatos.', keywords: 'cacto natal schlumbergera epífito flor inverno', symbol: '🌵', color: 'succulent' },
  { id: 'product-echeveria', name: 'Echevéria', scientificName: 'Echeveria elegans', category: 'Suculentas', location: 'Exterior', description: 'Suculenta em roseta que também pode viver em interior muito luminoso.', light: 'Sol suave ou luz muito intensa; aclimatar gradualmente.', water: 'Regar apenas quando o substrato estiver seco; não molhar o centro da roseta.', soil: 'Mistura mineral para suculentas, muito bem drenada.', size: 'Pequena roseta; pode formar novas rosetas.', flowering: 'Pode produzir hastes florais na primavera ou verão.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'echeveria echevéria roseta suculenta pedra', symbol: '🪴', color: 'succulent' },
  { id: 'product-jade', name: 'Planta-jade', scientificName: 'Crassula ovata', category: 'Suculentas', location: 'Interior', description: 'Suculenta de crescimento lento que pode formar um pequeno arbusto.', light: 'Luz muito intensa; tolera algum sol direto após aclimatação.', water: 'Regar quando o substrato estiver seco.', soil: 'Mistura para suculentas, bem drenada.', size: 'Arbustiva; pode viver muitos anos e crescer bastante.', flowering: 'Pode florir no inverno em plantas adultas.', pets: 'Tóxica para cães e gatos se ingerida.', keywords: 'jade crassula ovata árvore dinheiro suculenta', symbol: '🌱', color: 'succulent' },
  { id: 'product-opuntia', name: 'Figueira-da-índia', scientificName: 'Opuntia ficus-indica', category: 'Suculentas', location: 'Exterior', description: 'Cato de segmentos achatados, adequado a locais quentes e secos.', light: 'Sol direto.', water: 'Muito pouca água; deixar o solo secar completamente entre regas.', soil: 'Muito arenoso e drenante.', size: 'Pode tornar-se grande e arbustivo.', flowering: 'Primavera e verão em condições quentes.', pets: 'Espinhos e gloquídeos podem ferir; frutos só devem ser consumidos após limpeza segura.', keywords: 'opuntia figueira india cato fruto palmeta', symbol: '🌵', color: 'succulent' },
  { id: 'product-azalea', name: 'Azálea', scientificName: 'Rhododendron simsii', category: 'Floração', location: 'Exterior', description: 'Arbusto de floração abundante, preferindo locais frescos e protegidos.', light: 'Meia-sombra luminosa; proteger do sol forte.', water: 'Manter humidade regular com água pouco calcária, sem encharcar.', soil: 'Ácido, rico em matéria orgânica e drenante.', size: 'Arbusto pequeno a médio, conforme a variedade.', flowering: 'Inverno e primavera em muitas variedades.', pets: 'Todas as partes são tóxicas se ingeridas por pessoas ou animais.', keywords: 'azaleia azalea rododendro arbusto ácido flor', symbol: '🌺', color: 'rose' },
  { id: 'product-camellia', name: 'Cameleira', scientificName: 'Camellia japonica', category: 'Floração', location: 'Exterior', description: 'Arbusto perene de flores ornamentais, adequado a jardins abrigados.', light: 'Meia-sombra; proteger do sol quente da tarde e de ventos secos.', water: 'Regar para manter humidade uniforme, sem água parada.', soil: 'Ácido, rico em matéria orgânica e bem drenado.', size: 'Arbusto médio, pode crescer lentamente durante muitos anos.', flowering: 'Outono ao início da primavera, conforme a variedade.', pets: 'Geralmente considerada não tóxica para cães e gatos.', keywords: 'cameleira camélia camellia jardim flores', symbol: '🌺', color: 'rose' }
];

function dateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const sampleActivities = [
  { id: 'demo-activity-1', title: 'Rega dos canteiros', area: 'Cuidados diários', date: dateOffset(0), time: '08:30', group: 'Jardim exterior' },
  { id: 'demo-activity-2', title: 'Adubação de rosas', area: 'Nutrição e solo', date: dateOffset(1), time: '11:00', group: 'Área de flores' },
  { id: 'demo-activity-3', title: 'Podas da horta', area: 'Manutenção', date: dateOffset(2), time: '09:15', group: 'Zona de ervas' }
];

const sampleTasks = [
  { id: 'demo-task-1', title: 'Verificar humidade do vaso da orquídea', done: false },
  { id: 'demo-task-2', title: 'Recolher folhas secas da lavanda', done: false },
  { id: 'demo-task-3', title: 'Preparar a mistura de fertilizante', done: true }
];

async function seedStore(store, records) {
  const existing = await getAllRecords(store);
  if (existing.length === 0) await Promise.all(records.map(record => saveRecord(store, record)));
}

async function refreshDashboard() {
  const [activities, tasks, plants, products] = await Promise.all([
    getAllRecords('activities'),
    getAllRecords('tasks'),
    getAllRecords('plants'),
    getAllRecords('catalog')
  ]);
  catalogProducts = products;
  const orderedActivities = activities.sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`));
  renderActivities(activityList, orderedActivities);
  renderActivities(dashboardActivities, orderedActivities.slice(0, 3));
  renderTasks(taskList, tasks);
  renderPlants(plantsGrid, plants);
  renderCatalog(catalogGrid, products, catalogSearch.value, catalogCategory.value, catalogLocation.value);
  document.querySelector('#activity-count').textContent = String(activities.length);
  document.querySelector('#plants-count').textContent = String(plants.length);
  document.querySelector('#task-count').textContent = String(tasks.filter(task => !task.done).length);
}

function setView(name) {
  views.forEach(view => { view.hidden = view.id !== `view-${name}`; });
  document.querySelectorAll('[data-view-target]').forEach(button => {
    const active = button.dataset.viewTarget === name;
    button.classList.toggle('is-active', active);
    if (!button.classList.contains('nav-item')) return;
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-view-target]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewTarget)));
catalogSearch.addEventListener('input', () => {
  renderCatalog(catalogGrid, catalogProducts, catalogSearch.value, catalogCategory.value);
});
catalogCategory.addEventListener('change', () => {
  renderCatalog(catalogGrid, catalogProducts, catalogSearch.value, catalogCategory.value, catalogLocation.value);
});
catalogLocation.addEventListener('change', () => {
  renderCatalog(catalogGrid, catalogProducts, catalogSearch.value, catalogCategory.value, catalogLocation.value);
});

document.querySelectorAll('[data-open-activity]').forEach(button => {
  button.addEventListener('click', () => {
    activityForm.reset();
    activityForm.elements.date.value = dateOffset(0);
    activityDialog.showModal();
    activityForm.elements.title.focus();
  });
});

document.querySelectorAll('[data-open-plant]').forEach(button => button.addEventListener('click', () => {
  plantForm.reset();
  plantForm.elements.health.value = '100';
  plantDialog.showModal();
  plantForm.elements.name.focus();
}));

document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => activityDialog.close()));
document.querySelectorAll('[data-close-plant]').forEach(button => button.addEventListener('click', () => plantDialog.close()));
document.querySelectorAll('[data-close-account]').forEach(button => button.addEventListener('click', () => accountDialog.close()));
document.querySelectorAll('[data-close-login]').forEach(button => button.addEventListener('click', () => loginDialog.close()));
document.querySelectorAll('[data-open-account]').forEach(button => button.addEventListener('click', () => {
  accountForm.reset();
  accountDialog.showModal();
}));
document.querySelectorAll('[data-open-login]').forEach(button => button.addEventListener('click', () => {
  loginForm.reset();
  loginDialog.showModal();
}));

accountForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const name = formData.get('name').trim();
  const role = formData.get('role').trim() || 'Gestor de jardim';
  const email = formData.get('email').trim();

  const account = {
    id: `account-${crypto.randomUUID()}`,
    name,
    role,
    email,
    accountType: 'custom'
  };

  await saveRecord('educators', account);
  document.querySelector('#account-name').textContent = account.name;
  document.querySelector('#account-role').textContent = 'Conta pessoal';
  document.querySelector('#educator-name').textContent = account.name;
  accountDialog.close();
  statusMessage.textContent = 'Conta criada com sucesso';
});

plantForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(plantForm);
  const plants = await getAllRecords('plants');
  const colors = ['mint', 'peach', 'yellow'];
  await saveRecord('plants', {
    id: `plant-${crypto.randomUUID()}`,
    label: String(formData.get('name')).trim(),
    interest: String(formData.get('care')).trim(),
    progress: Number(formData.get('health')),
    color: colors[plants.length % colors.length]
  });
  plantDialog.close();
  await refreshDashboard();
  statusMessage.textContent = 'Planta guardada neste dispositivo';
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const educators = await getAllRecords('educators');
  const match = educators.find(item => String(item.email || '').trim().toLowerCase() === email);

  if (!match) {
    statusMessage.textContent = 'Conta não encontrada. Cria uma conta primeiro.';
    loginDialog.close();
    return;
  }

  document.querySelector('#account-name').textContent = match.name;
  document.querySelector('#account-role').textContent = match.role || 'Conta pessoal';
  document.querySelector('#educator-name').textContent = match.name;
  loginDialog.close();
  statusMessage.textContent = `Bem-vindo(a), ${match.name}`;
});

activityForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(activityForm);
  await saveRecord('activities', {
    id: `activity-${crypto.randomUUID()}`,
    title: formData.get('title').trim(),
    area: formData.get('area'),
    date: formData.get('date'),
    time: formData.get('time'),
    group: formData.get('group').trim() || 'Jardim'
  });
  activityDialog.close();
  await refreshDashboard();
  statusMessage.textContent = 'Atividade guardada neste dispositivo';
});

document.addEventListener('click', async event => {
  const deleteButton = event.target.closest('[data-delete-activity]');
  if (!deleteButton) return;
  await deleteRecord('activities', deleteButton.dataset.deleteActivity);
  await refreshDashboard();
  statusMessage.textContent = 'Atividade removida';
});

taskList.addEventListener('change', async event => {
  const checkbox = event.target.closest('[data-task-id]');
  if (!checkbox) return;
  await saveRecord('tasks', { id: checkbox.dataset.taskId, title: checkbox.dataset.taskTitle, done: checkbox.checked });
  await refreshDashboard();
});

document.querySelector('#today-date').textContent = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
window.addEventListener('online', () => { statusMessage.textContent = 'Ligação disponível · dados guardados neste dispositivo'; });
window.addEventListener('offline', () => { statusMessage.textContent = 'Sem ligação · podes continuar a trabalhar'; });

try {
  await seedStore('educators', [demoGardener]);
  await seedStore('activities', sampleActivities);
  await seedStore('tasks', sampleTasks);
  await seedStore('plants', samplePlants);
  await Promise.all(sampleProducts.map(product => saveRecord('catalog', product)));
  const educators = await getAllRecords('educators');
  const educator = educators.find(item => item.id === demoGardener.id) || educators[0] || demoGardener;
  document.querySelector('#account-name').textContent = educator.name;
  document.querySelector('#account-role').textContent = educator.accountType === 'demo' ? 'Perfil de demonstração' : (educator.role || 'Conta pessoal');
  document.querySelector('#educator-name').textContent = educator.name;
  await refreshDashboard();

  if (educator.accountType === 'demo') {
    window.setTimeout(() => {
      if (accountDialog && !accountDialog.open) {
        accountDialog.showModal();
      }
    }, 250);
  }
} catch (error) {
  statusMessage.textContent = 'Não foi possível abrir o armazenamento local';
  console.error('Erro ao carregar a FloriApp:', error);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Não foi possível registar o Service Worker:', error);
    });
  });
}
