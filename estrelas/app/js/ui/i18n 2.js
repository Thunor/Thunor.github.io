//
//  i18n.js
//  Estrelas (web)
//
//  The app's translations (from the macOS app's Localizable.xcstrings, plus strings only the web app uses) and the
//  language setting. Like the macOS app, strings without a translation stay in English.
//

import * as Settings from './settings.js';

const translations = {
    "%.1f×": {
        "de": "%.1f×",
        "es": "x%.1f",
        "fr": "%.1f×",
        "pt": "%.1f×"
    },
    "Add Sample Sector": {
        "de": "Beispielsektor hinzufügen",
        "es": "Añadir sector de ejemplo",
        "fr": "Ajouter un secteur d’exemple",
        "pt": "Adicionar Setor de Exemplo"
    },
    "Az %.1f": {
        "de": "Az %.1f",
        "es": "Az %.1f",
        "fr": "Az %.1f",
        "pt": "Az %.1f"
    },
    "Cancel": {
        "de": "Abbrechen",
        "es": "Cancelar",
        "fr": "Annuler",
        "pt": "Cancelar"
    },
    "Choose": {
        "de": "Auswählen",
        "es": "Elegir",
        "fr": "Choisir",
        "pt": "Escolher"
    },
    "Choose a universe folder (one containing starfield.json)": {
        "de": "Universumsordner auswählen (einen Ordner mit starfield.json)",
        "es": "Elige una carpeta de universo (una que contenga starfield.json)",
        "fr": "Choisissez un dossier d’univers (contenant starfield.json).",
        "pt": "Escolha uma pasta de universo (que contenha starfield.json)"
    },
    "Choose a universe folder (one containing starfield.json), or a .zip of one.": {
        "de": "Wähle einen Universum-Ordner (mit einer starfield.json) oder ein .zip davon.",
        "es": "Elige una carpeta de universo (que contenga starfield.json), o un .zip de una.",
        "fr": "Choisissez un dossier d’univers (contenant starfield.json), ou un .zip d’un tel dossier.",
        "pt": "Escolha uma pasta de universo (com um starfield.json), ou um .zip de uma."
    },
    "Choose…": {
        "de": "Auswählen …",
        "es": "Elegir…",
        "fr": "Choisir…",
        "pt": "Escolher…"
    },
    "Choosing a folder needs Chrome, Edge or another Chromium browser.": {
        "de": "Zum Auswählen eines Ordners brauchst du Chrome, Edge oder einen anderen Chromium-Browser.",
        "es": "Para eleger una carpeta se necesita Chrome, Edge u otro navegador Chromium.",
        "fr": "Choisir un dossier nécessite Chrome, Edge ou un autre navigateur Chromium.",
        "pt": "Escolher uma pasta requer o Chrome, o Edge ou outro navegador Chromium."
    },
    "Clear": {
        "de": "Entfernen",
        "es": "Borrar",
        "fr": "Effacer",
        "pt": "Limpar"
    },
    "Close": {
        "de": "Schließen",
        "es": "Cerrar",
        "fr": "Fermer",
        "pt": "Fechar"
    },
    "Cloud layers over the globes of planets with atmospheres.": {
        "de": "Wolkenschichten über den Globen von Planeten mit Atmosphäre.",
        "es": "Capas de nubes sobre los globos de los planetas con atmósfera.",
        "fr": "Couches nuageuses au-dessus des globes des planètes dotées d’une atmosphère.",
        "pt": "Camadas de nuvens sobre os globos dos planetas com atmosfera."
    },
    "Copying files… %lld of %lld": {
        "de": "Dateien werden kopiert … %lld von %lld",
        "es": "Copiando archivos… %lld de %lld",
        "fr": "Copie des fichiers… %lld sur %lld",
        "pt": "A copiar ficheiros… %lld de %lld"
    },
    "Couldn't create a new universe": {
        "de": "Neues Universum konnte nicht erstellt werden",
        "es": "No se ha podido crear un nuevo universo",
        "fr": "Impossible de créer un nouvel univers",
        "pt": "Não foi possível criar um novo universo"
    },
    "Couldn't delete the universe": {
        "de": "Universum konnte nicht gelöscht werden",
        "es": "No se ha podido eliminar el universo",
        "fr": "Impossible de supprimer l’univers",
        "pt": "Não foi possível apagar o universo"
    },
    "Couldn't open the universe": {
        "de": "Universum konnte nicht geöffnet werden",
        "es": "No se ha podido abrir el universo",
        "fr": "Impossible d’ouvrir l’univers",
        "pt": "Não foi possível abrir o universo"
    },
    "Couldn't rename the universe": {
        "de": "Universum konnte nicht umbenannt werden",
        "es": "No se ha podido cambiar el nombre del universo",
        "fr": "Impossible de renommer l’univers",
        "pt": "Não foi possível renomear o universo"
    },
    "Couldn't save the universe": {
        "de": "Universum konnte nicht gesichert werden",
        "es": "No se ha podido guardar el universo",
        "fr": "Impossible d’enregistrer l’univers",
        "pt": "Não foi possível salvar o universo"
    },
    "Create": {
        "de": "Erstellen",
        "es": "Crear",
        "fr": "Créer",
        "pt": "Criar"
    },
    "Created %@": {
        "de": "Erstellt am %@",
        "es": "Creado el %@",
        "fr": "Créé le %@",
        "pt": "Criado em %@"
    },
    "Currently open": {
        "de": "Geöffnet",
        "es": "Abierto",
        "fr": "Ouvert",
        "pt": "Aberto"
    },
    "Delete": {
        "de": "Löschen",
        "es": "Eliminar",
        "fr": "Supprimer",
        "pt": "Apagar"
    },
    "Delete “%@”?": {
        "de": "„%@“ löschen?",
        "es": "¿Eliminar “%@”?",
        "fr": "Supprimer « %@ » ?",
        "pt": "Apagar “%@”?"
    },
    "Done": {
        "de": "Fertig",
        "es": "OK",
        "fr": "OK",
        "pt": "OK"
    },
    "Downloaded “%@”. Unzip it to get a folder the macOS app can open.": {
        "de": "„%@“ wurde geladen. Entpacke es, um einen Ordner zu erhalten, den die macOS-App öffnen kann.",
        "es": "Se descargó “%@”. Descomprímelo para obtener una carpeta que la app de macOS pueda abrir.",
        "fr": "« %@ » téléchargé. Décompressez-le pour obtenir un dossier que l’app macOS peut ouvrir.",
        "pt": "“%@” descarregado. Descomprima-o para obter uma pasta que a app para macOS consegue abrir."
    },
    "Drawing surface map…": {
        "de": "Oberflächenkarte wird gezeichnet …",
        "es": "Dibujando mapa de superficie…",
        "fr": "Tracé de la carte de surface…",
        "pt": "Desenhando mapa da superfície…"
    },
    "Drawing…": {
        "de": "Wird gezeichnet …",
        "es": "Dibujando…",
        "fr": "Dessin…",
        "pt": "A desenhar…"
    },
    "El %.1f": {
        "de": "El %.1f",
        "es": "El %.1f",
        "fr": "Él %.1f",
        "pt": "El %.1f"
    },
    "File": {
        "de": "Ablage",
        "es": "Archivo",
        "fr": "Fichier",
        "pt": "Ficheiro"
    },
    "Generating star field…": {
        "de": "Sternfeld wird erzeugt …",
        "es": "Generando el campo estelar…",
        "fr": "Génération du champ d’étoiles…",
        "pt": "A gerar o campo estelar…"
    },
    "How the panels and controls over the star map are drawn.": {
        "de": "Wie die Bedienfelder und Steuerelemente über der Sternkarte gezeichnet werden.",
        "es": "Cómo se dibujan los paneles y controles sobre el mapa estelar.",
        "fr": "Comment sont dessinés les panneaux et commandes au-dessus de la carte stellaire.",
        "pt": "Como são desenhados os painéis e controlos sobre o mapa estelar."
    },
    "Interface style": {
        "de": "Darstellungsstil",
        "es": "Estilo de la interfaz",
        "fr": "Style de l’interface",
        "pt": "Estilo da interface"
    },
    "Language": {
        "de": "Sprache",
        "es": "Idioma",
        "fr": "Langue",
        "pt": "Idioma"
    },
    "Load Block": {
        "de": "Block laden",
        "es": "Cargar bloque",
        "fr": "Charger le bloc",
        "pt": "Carregar Bloco"
    },
    "Loading universe…": {
        "de": "Universum wird geladen …",
        "es": "Cargando el universo…",
        "fr": "Chargement de l’univers…",
        "pt": "A carregar o universo…"
    },
    "Manage Universes…": {
        "de": "Universen verwalten …",
        "es": "Gestionar universos…",
        "fr": "Gérer les univers…",
        "pt": "Gerenciar Universos…"
    },
    "Menus update after you relaunch the app.": {
        "de": "Menüs werden nach einem Neustart der App aktualisiert.",
        "es": "Los menús se actualizan al volver a abrir la app.",
        "fr": "Les menus sont mis à jour après la réouverture de l’app.",
        "pt": "Os menus se atualizam depois que você reabre o app."
    },
    "Move to Trash": {
        "de": "In den Papierkorb legen",
        "es": "Trasladar a la Papelera",
        "fr": "Placer dans la corbeille",
        "pt": "Mover para o Lixo"
    },
    "Name": {
        "de": "Name",
        "es": "Nombre",
        "fr": "Nom",
        "pt": "Nome"
    },
    "New Universe": {
        "de": "Neues Universum",
        "es": "Nuevo universo",
        "fr": "Nouvel univers",
        "pt": "Novo Universo"
    },
    "New Universe…": {
        "de": "Neues Universum …",
        "es": "Nuevo universo…",
        "fr": "Nouvel univers…",
        "pt": "Novo Universo…"
    },
    "No planetary survey": {
        "de": "Keine planetare Vermessung",
        "es": "Sin estudio planetario",
        "fr": "Aucun relevé planétaire",
        "pt": "Nenhum levantamento planetário"
    },
    "No target selected": {
        "de": "Kein Ziel ausgewählt",
        "es": "Ningún objetivo seleccionado",
        "fr": "Aucune cible sélectionnée",
        "pt": "Nenhum alvo selecionado"
    },
    "No universe": {
        "de": "Kein Universum",
        "es": "Ningún universo",
        "fr": "Aucun univers",
        "pt": "Nenhum universo"
    },
    "Not open": {
        "de": "Nicht geöffnet",
        "es": "No abierto",
        "fr": "Non ouvert",
        "pt": "Não aberto"
    },
    "Not set": {
        "de": "Nicht festgelegt",
        "es": "Sin definir",
        "fr": "Non défini",
        "pt": "Não definida"
    },
    "OK": {
        "de": "OK",
        "es": "OK",
        "fr": "OK",
        "pt": "OK"
    },
    "Open": {
        "de": "Öffnen",
        "es": "Abrir",
        "fr": "Ouvrir",
        "pt": "Abrir"
    },
    "Open Universe": {
        "de": "Universum öffnen",
        "es": "Abrir universo",
        "fr": "Ouvrir un univers",
        "pt": "Abrir Universo"
    },
    "Open Universe…": {
        "de": "Universum öffnen …",
        "es": "Abrir universo…",
        "fr": "Ouvrir un univers…",
        "pt": "Abrir Universo…"
    },
    "Open a .zip…": {
        "de": ".zip öffnen …",
        "es": "Abrir un .zip…",
        "fr": "Ouvrir un .zip…",
        "pt": "Abrir um .zip…"
    },
    "Open a folder…": {
        "de": "Ordner öffnen …",
        "es": "Abrir una carpeta…",
        "fr": "Ouvrir un dossier…",
        "pt": "Abrir uma pasta…"
    },
    "Paused while viewing a planet": {
        "de": "Pausiert während der Planetenansicht",
        "es": "En pausa mientras se ve un planeta",
        "fr": "En pause pendant l’observation d’une planète",
        "pt": "Pausado durante a visualização de um planeta"
    },
    "Pinch or use the buttons to zoom; scroll to pan": {
        "de": "Zum Zoomen auf-/zuziehen oder Tasten verwenden; zum Verschieben scrollen",
        "es": "Pellizca o usa los botones para hacer zoom; desplázate para mover la vista",
        "fr": "Pincez ou utilisez les boutons pour zoomer ; faites défiler pour vous déplacer.",
        "pt": "Use o gesto de pinça ou os botões para aplicar zoom; role para mover"
    },
    "Random seed": {
        "de": "Zufälligen Startwert wählen",
        "es": "Semilla aleatoria",
        "fr": "Graine aléatoire",
        "pt": "Semente aleatória"
    },
    "Real time": {
        "de": "Echtzeit",
        "es": "Tiempo real",
        "fr": "Temps réel",
        "pt": "Tempo Real"
    },
    "Rename": {
        "de": "Umbenennen",
        "es": "Renombrar",
        "fr": "Renommer",
        "pt": "Mudar o nome"
    },
    "Save": {
        "de": "Sichern",
        "es": "Guardar",
        "fr": "Enregistrer",
        "pt": "Salvar"
    },
    "Save As…": {
        "de": "Sichern unter …",
        "es": "Guardar como…",
        "fr": "Enregistrer sous…",
        "pt": "Salvar Como…"
    },
    "Save Block": {
        "de": "Block sichern",
        "es": "Guardar bloque",
        "fr": "Enregistrer le bloc",
        "pt": "Salvar Bloco"
    },
    "Save Universe As…": {
        "de": "Universum sichern unter …",
        "es": "Guardar universo como…",
        "fr": "Enregistrer l’univers sous…",
        "pt": "Salvar Universo Como…"
    },
    "Save a copy of this universe as a folder other apps can read": {
        "de": "Kopie dieses Universums als Ordner sichern, den andere Apps lesen können",
        "es": "Guarda una copia de este universo como una carpeta que otras apps puedan leer",
        "fr": "Enregistrez une copie de cet univers sous forme de dossier lisible par d’autres apps.",
        "pt": "Salve uma cópia deste universo como uma pasta que outros apps possam ler"
    },
    "Saved “%@” to %@.": {
        "de": "„%@“ wurde in %@ gesichert.",
        "es": "“%@” se guardó en %@.",
        "fr": "« %@ » enregistré dans %@.",
        "pt": "“%@” guardado em %@."
    },
    "Sectors: %lld": {
        "de": "Sektoren: %lld",
        "es": "Sectores: %lld",
        "fr": "Secteurs : %lld",
        "pt": "Setores: %lld"
    },
    "Seed": {
        "de": "Startwert",
        "es": "Semilla",
        "fr": "Graine",
        "pt": "Semente"
    },
    "Seed %@": {
        "de": "Startwert %@",
        "es": "Semilla %@",
        "fr": "Graine %@",
        "pt": "Semente %@"
    },
    "Settings": {
        "de": "Einstellungen",
        "es": "Ajustes",
        "fr": "Réglages",
        "pt": "Definições"
    },
    "Settings…": {
        "de": "Einstellungen …",
        "es": "Ajustes…",
        "fr": "Réglages…",
        "pt": "Definições…"
    },
    "Show clouds": {
        "de": "Wolken anzeigen",
        "es": "Mostrar nubes",
        "fr": "Afficher les nuages",
        "pt": "Mostrar nuvens"
    },
    "Show full details": {
        "de": "Alle Details anzeigen",
        "es": "Mostrar todos los detalles",
        "fr": "Afficher tous les détails",
        "pt": "Mostrar todos os detalhes"
    },
    "Simulation time": {
        "de": "Simulationszeit",
        "es": "Tiempo de simulación",
        "fr": "Temps de simulation",
        "pt": "Tempo de simulação"
    },
    "Slow down, or run faster backwards": {
        "de": "Verlangsamen oder rückwärts beschleunigen",
        "es": "Ralentizar o retroceder más rápido",
        "fr": "Ralentir, ou accélérer le retour en arrière",
        "pt": "Desacelerar ou retroceder mais rápido"
    },
    "Speed up, or run slower backwards": {
        "de": "Beschleunigen oder rückwärts verlangsamen",
        "es": "Acelerar o retroceder más despacio",
        "fr": "Accélérer, ou ralentir le retour en arrière",
        "pt": "Acelerar ou retroceder mais devagar"
    },
    "Surface map": {
        "de": "Oberflächenkarte",
        "es": "Mapa de superficie",
        "fr": "Carte de surface",
        "pt": "Mapa da Superfície"
    },
    "System Default": {
        "de": "Systemstandard",
        "es": "Predeterminado del sistema",
        "fr": "Langue du système",
        "pt": "Padrão do Sistema"
    },
    "Systems: %lld": {
        "de": "Systeme: %lld",
        "es": "Sistemas: %lld",
        "fr": "Systèmes : %lld",
        "pt": "Sistemas: %lld"
    },
    "The same seed always generates the same star field.": {
        "de": "Derselbe Startwert erzeugt immer dasselbe Sternenfeld.",
        "es": "La misma semilla siempre genera el mismo campo de estrellas.",
        "fr": "Une même graine génère toujours le même champ d’étoiles.",
        "pt": "A mesma semente sempre gera o mesmo campo estelar."
    },
    "The seed must be a whole number from 0 to %@.": {
        "de": "Der Startwert muss eine ganze Zahl von 0 bis %@ sein.",
        "es": "La semilla debe ser un número entero entre 0 y %@.",
        "fr": "La graine doit être un nombre entier compris entre 0 et %@.",
        "pt": "A semente deve ser um número inteiro de 0 a %@."
    },
    "The universe couldn't be shown.": {
        "de": "Das Universum konnte nicht angezeigt werden.",
        "es": "No se pudo mostrar el universo.",
        "fr": "L’univers n’a pas pu être affiché.",
        "pt": "Não foi possível mostrar o universo."
    },
    "The universe’s folder, with its star field and surface maps, goes to the Trash.": {
        "de": "Der Ordner des Universums wird mit seinem Sternenfeld und den Oberflächenkarten in den Papierkorb gelegt.",
        "es": "La carpeta del universo, con el campo de estrellas y los mapas de superficie, se trasladará a la Papelera.",
        "fr": "Le dossier de l’univers, avec son champ d’étoiles et ses cartes de surface, sera placé dans la corbeille.",
        "pt": "A pasta do universo, com o campo estelar e os mapas da superfície, será movida para o Lixo."
    },
    "The universe’s folder, with its star field and surface maps, is deleted from this browser.": {
        "de": "Der Ordner des Universums mit Sternfeld und Oberflächenkarten wird aus diesem Browser gelöscht.",
        "es": "La carpeta del universo, con su campo estelar y sus mapas de superficie, se elimina de este navegador.",
        "fr": "Le dossier de l’univers, avec son champ d’étoiles et ses cartes de surface, est supprimé de ce navigateur.",
        "pt": "A pasta do universo, com o campo estelar e os mapas de superfície, é apagada deste navegador."
    },
    "This browser can’t keep universes, so they’ll be lost when the page closes. Save them with Save Universe As….": {
        "de": "Dieser Browser kann keine Universen behalten; sie gehen beim Schließen der Seite verloren. Sichere sie mit „Universum sichern unter …“.",
        "es": "Este navegador no puede conservar universos, así que se perderán al cerrar la página. Guárdalos con Guardar universo como….",
        "fr": "Ce navigateur ne peut pas conserver les univers : ils seront perdus à la fermeture de la page. Enregistrez-les avec Enregistrer l’univers sous….",
        "pt": "Este navegador não consegue guardar universos, por isso perdem-se ao fechar a página. Guarde-os com Guardar universo como…."
    },
    "This browser doesn't support WebGL 2, which the star map needs.": {
        "de": "Dieser Browser unterstützt kein WebGL 2, das die Sternkarte braucht.",
        "es": "Este navegador no admite WebGL 2, que el mapa estelar necesita.",
        "fr": "Ce navigateur ne prend pas en charge WebGL 2, nécessaire à la carte stellaire.",
        "pt": "Este navegador não suporta WebGL 2, necessário para o mapa estelar."
    },
    "Universe": {
        "de": "Universum",
        "es": "Universo",
        "fr": "Univers",
        "pt": "Universo"
    },
    "Universe %lld": {
        "de": "Universum %lld",
        "es": "Universo %lld",
        "fr": "Univers %lld",
        "pt": "Universo %lld"
    },
    "Universes": {
        "de": "Universen",
        "es": "Universos",
        "fr": "Univers",
        "pt": "Universos"
    },
    "Universes are kept in this browser. Use Save Universe As… to share one with the macOS app.": {
        "de": "Universen werden in diesem Browser aufbewahrt. Mit „Universum sichern unter …“ teilst du eines mit der macOS-App.",
        "es": "Los universos se guardan en este navegador. Usa Guardar universo como… para compartir uno con la app de macOS.",
        "fr": "Les univers sont conservés dans ce navigateur. Utilisez Enregistrer l’univers sous… pour en partager un avec l’app macOS.",
        "pt": "Os universos ficam guardados neste navegador. Use Guardar universo como… para partilhar um com a app para macOS."
    },
    "Universes folder": {
        "de": "Universen-Ordner",
        "es": "Carpeta de universos",
        "fr": "Dossier des univers",
        "pt": "Pasta de universos"
    },
    "Use File ▸ New Universe to create one.": {
        "de": "Wähle „Ablage“ ▸ „Neues Universum“, um eines zu erstellen.",
        "es": "Usa Archivo ▸ Nuevo universo para crear uno.",
        "fr": "Choisissez Fichier ▸ Nouvel univers pour en créer un.",
        "pt": "Use Arquivo ▸ Novo Universo para criar um."
    },
    "Use File ▸ New Universe… to create one.": {
        "de": "Wähle „Ablage“ ▸ „Neues Universum …“, um eines zu erstellen.",
        "es": "Usa Archivo ▸ Nuevo universo… para crear uno.",
        "fr": "Choisissez Fichier ▸ Nouvel univers… pour en créer un.",
        "pt": "Use Arquivo ▸ Novo Universo… para criar um."
    },
    "Where universes are saved, unless you pick another folder when saving.": {
        "de": "Wo Universen gesichert werden, außer du wählst beim Sichern einen anderen Ordner.",
        "es": "Dónde se guardan los universos, salvo que elijas otra carpeta al guardar.",
        "fr": "Où les univers sont enregistrés, sauf si vous choisissez un autre dossier lors de l’enregistrement.",
        "pt": "Onde os universos são guardados, a menos que escolha outra pasta ao guardar."
    },
    "Whole system": {
        "de": "Gesamtes System",
        "es": "Sistema completo",
        "fr": "Système entier",
        "pt": "Sistema Inteiro"
    },
    "World data": {
        "de": "Weltdaten",
        "es": "Datos del mundo",
        "fr": "Données du monde",
        "pt": "Dados do mundo"
    },
    "Zoom %.2f": {
        "de": "Zoom %.2f",
        "es": "Zoom %.2f",
        "fr": "Zoom %.2f",
        "pt": "Zoom %.2f"
    },
    "Zoom in": {
        "de": "Vergrößern",
        "es": "Acercar",
        "fr": "Zoom avant",
        "pt": "Ampliar"
    },
    "Zoom out": {
        "de": "Verkleinern",
        "es": "Alejar",
        "fr": "Zoom arrière",
        "pt": "Reduzir"
    },
    "“%@” already exists in that folder. Replace it?": {
        "de": "„%@“ ist in diesem Ordner bereits vorhanden. Ersetzen?",
        "es": "“%@” ya existe en esa carpeta. ¿Reemplazarlo?",
        "fr": "« %@ » existe déjà dans ce dossier. Le remplacer ?",
        "pt": "“%@” já existe nessa pasta. Substituir?"
    },
    "“%@” doesn't contain a readable starfield.json.": {
        "de": "„%@“ enthält keine lesbare starfield.json.",
        "es": "“%@” no contiene un archivo starfield.json legible.",
        "fr": "« %@ » ne contient aucun fichier starfield.json lisible.",
        "pt": "“%@” não contém um arquivo starfield.json legível."
    },
    "%@ %@%, other faiths %@%, unaffiliated %@%": {
        "de": "%@ %@ %, andere Religionen %@ %, konfessionslos %@ %",
        "es": "%@ %@%, otras religiones %@%, sin religión %@%",
        "fr": "%@ %@ %, autres religions %@ %, sans religion %@ %",
        "pt": "%@ %@%, outras religiões %@%, sem religião %@%"
    },
    "%@ (confederal)": {
        "de": "%@ (konföderal)",
        "es": "%@ (confederal)",
        "fr": "%@ (confédéral)",
        "pt": "%@ (confederal)"
    },
    "%@ (federal)": {
        "de": "%@ (föderal)",
        "es": "%@ (federal)",
        "fr": "%@ (fédéral)",
        "pt": "%@ (federal)"
    },
    "%@ a week": {
        "de": "%@ pro Woche",
        "es": "%@ por semana",
        "fr": "%@ par semaine",
        "pt": "%@ por semana"
    },
    "%@ cells": {
        "de": "%@ Zellen",
        "es": "%@ celdas",
        "fr": "%@ cellules",
        "pt": "%@ células"
    },
    "%@ m above sea level": {
        "de": "%@ m über dem Meeresspiegel",
        "es": "%@ m sobre el nivel del mar",
        "fr": "%@ m au-dessus du niveau de la mer",
        "pt": "%@ m acima do nível do mar"
    },
    "%@ m above the lowest point": {
        "de": "%@ m über dem tiefsten Punkt",
        "es": "%@ m sobre el punto más bajo",
        "fr": "%@ m au-dessus du point le plus bas",
        "pt": "%@ m acima do ponto mais baixo"
    },
    "%@ m below sea level": {
        "de": "%@ m unter dem Meeresspiegel",
        "es": "%@ m bajo el nivel del mar",
        "fr": "%@ m sous le niveau de la mer",
        "pt": "%@ m abaixo do nível do mar"
    },
    "%@ provinces": {
        "de": "%@ Provinzen",
        "es": "%@ provincias",
        "fr": "%@ provinces",
        "pt": "%@ províncias"
    },
    "%@ years": {
        "de": "%@ Jahre",
        "es": "%@ años",
        "fr": "%@ ans",
        "pt": "%@ anos"
    },
    "%@ years of age for voluntary service; no conscription": {
        "de": "ab %@ Jahren freiwilliger Dienst; keine Wehrpflicht",
        "es": "%@ años para el servicio voluntario; sin servicio obligatorio",
        "fr": "%@ ans pour le service volontaire ; pas de conscription",
        "pt": "%@ anos para serviço voluntário; sem alistamento obrigatório"
    },
    "%@ years of age; universal": {
        "de": "ab %@ Jahren; allgemein",
        "es": "%@ años; universal",
        "fr": "%@ ans ; universel",
        "pt": "%@ anos; universal"
    },
    "%@% of GDP (%@)": {
        "de": "%@ % des BIP (%@)",
        "es": "%@% del PIB (%@)",
        "fr": "%@ % du PIB (%@)",
        "pt": "%@% do PIB (%@)"
    },
    "%@% urban": {
        "de": "%@ % städtisch",
        "es": "%@% urbana",
        "fr": "%@ % urbaine",
        "pt": "%@% urbana"
    },
    "%@, sharing the world": {
        "de": "%@, die sich die Welt teilen",
        "es": "%@, que comparten el mundo",
        "fr": "%@, qui se partagent le monde",
        "pt": "%@, que dividem o mundo"
    },
    "%@–%@ years of age for compulsory service; %@-year obligation": {
        "de": "%@–%@ Jahre für den Pflichtdienst; %@ Jahr(e) Dienstzeit",
        "es": "%@–%@ años para el servicio obligatorio; %@ año(s) de servicio",
        "fr": "%@–%@ ans pour le service obligatoire ; %@ an(s) de service",
        "pt": "%@–%@ anos para serviço obrigatório; %@ ano(s) de serviço"
    },
    "About Estrelas": {
        "de": "Über Estrelas",
        "es": "Acerca de Estrelas",
        "fr": "À propos d’Estrelas",
        "pt": "Sobre o Estrelas"
    },
    "About Estrelas Player": {
        "de": "Über Estrelas Player",
        "es": "Acerca de Estrelas Player",
        "fr": "À propos d’Estrelas Player",
        "pt": "Sobre o Estrelas Player"
    },
    "Absolute monarchy": {
        "de": "Absolute Monarchie",
        "es": "Monarquía absoluta",
        "fr": "Monarchie absolue",
        "pt": "Monarquia absoluta"
    },
    "Active personnel": {
        "de": "Aktives Personal",
        "es": "Personal activo",
        "fr": "Effectifs actifs",
        "pt": "Efetivo ativo"
    },
    "Active volcano": {
        "de": "Aktiver Vulkan",
        "es": "Volcán activo",
        "fr": "Volcan actif",
        "pt": "Vulcão ativo"
    },
    "Administrative divisions": {
        "de": "Verwaltungsgliederung",
        "es": "Divisiones administrativas",
        "fr": "Divisions administratives",
        "pt": "Divisões administrativas"
    },
    "Air Force": {
        "de": "Luftwaffe",
        "es": "Fuerza Aérea",
        "fr": "Armée de l’air",
        "pt": "Força Aérea"
    },
    "Area": {
        "de": "Fläche",
        "es": "Superficie",
        "fr": "Superficie",
        "pt": "Área"
    },
    "Armed forces": {
        "de": "Streitkräfte",
        "es": "Fuerzas armadas",
        "fr": "Forces armées",
        "pt": "Forças armadas"
    },
    "Armed insurgency": {
        "de": "Bewaffneter Aufstand",
        "es": "Insurgencia armada",
        "fr": "Insurrection armée",
        "pt": "Insurgência armada"
    },
    "At sea level": {
        "de": "Auf Meereshöhe",
        "es": "Al nivel del mar",
        "fr": "Au niveau de la mer",
        "pt": "No nível do mar"
    },
    "At the lowest point": {
        "de": "Am tiefsten Punkt",
        "es": "En el punto más bajo",
        "fr": "Au point le plus bas",
        "pt": "No ponto mais baixo"
    },
    "Authoritarian dictatorship": {
        "de": "Autoritäre Diktatur",
        "es": "Dictadura autoritaria",
        "fr": "Dictature autoritaire",
        "pt": "Ditadura autoritária"
    },
    "Banned for civilians": {
        "de": "Für Zivilisten verboten",
        "es": "Prohibidas para civiles",
        "fr": "Interdites aux civils",
        "pt": "Proibidas para civis"
    },
    "Bare ground": {
        "de": "Kahler Boden",
        "es": "Suelo desnudo",
        "fr": "Sol nu",
        "pt": "Solo exposto"
    },
    "Below poverty line": {
        "de": "Unter der Armutsgrenze",
        "es": "Bajo el umbral de pobreza",
        "fr": "Sous le seuil de pauvreté",
        "pt": "Abaixo da linha de pobreza"
    },
    "Caldera": {
        "de": "Caldera",
        "es": "Caldera",
        "fr": "Caldeira",
        "pt": "Caldeira"
    },
    "Capital punishment": {
        "de": "Todesstrafe",
        "es": "Pena de muerte",
        "fr": "Peine de mort",
        "pt": "Pena de morte"
    },
    "Civil unrest": {
        "de": "Unruhen",
        "es": "Disturbios civiles",
        "fr": "Troubles civils",
        "pt": "Agitação civil"
    },
    "Civil war": {
        "de": "Bürgerkrieg",
        "es": "Guerra civil",
        "fr": "Guerre civile",
        "pt": "Guerra civil"
    },
    "Civilian firearms": {
        "de": "Zivile Schusswaffen",
        "es": "Armas de fuego civiles",
        "fr": "Armes à feu civiles",
        "pt": "Armas de fogo civis"
    },
    "Climate": {
        "de": "Klima",
        "es": "Clima",
        "fr": "Climat",
        "pt": "Clima"
    },
    "Coast": {
        "de": "Küste",
        "es": "Costa",
        "fr": "Côte",
        "pt": "Litoral"
    },
    "Cold desert": {
        "de": "Kältewüste",
        "es": "Desierto frío",
        "fr": "Désert froid",
        "pt": "Deserto frio"
    },
    "Corporate administration under charter": {
        "de": "Konzernverwaltung mit Freibrief",
        "es": "Administración corporativa bajo carta",
        "fr": "Administration d’entreprise sous charte",
        "pt": "Administração corporativa sob concessão"
    },
    "Dependency of the system’s main world": {
        "de": "Abhängiges Gebiet der Hauptwelt des Systems",
        "es": "Dependencia del mundo principal del sistema",
        "fr": "Dépendance du monde principal du système",
        "pt": "Dependência do mundo principal do sistema"
    },
    "Dependency status": {
        "de": "Abhängigkeitsstatus",
        "es": "Estatus de dependencia",
        "fr": "Statut de dépendance",
        "pt": "Situação de dependência"
    },
    "Dependent territory": {
        "de": "Abhängiges Gebiet",
        "es": "Territorio dependiente",
        "fr": "Territoire dépendant",
        "pt": "Território dependente"
    },
    "Direct democracy": {
        "de": "Direkte Demokratie",
        "es": "Democracia directa",
        "fr": "Démocratie directe",
        "pt": "Democracia direta"
    },
    "Drawing surface map at %@…": {
        "de": "Oberflächenkarte wird mit %@ gezeichnet…",
        "es": "Dibujando el mapa de superficie a %@…",
        "fr": "Dessin de la carte de surface en %@…",
        "pt": "Desenhando o mapa da superfície em %@…"
    },
    "Economy": {
        "de": "Wirtschaft",
        "es": "Economía",
        "fr": "Économie",
        "pt": "Economia"
    },
    "Elections": {
        "de": "Wahlen",
        "es": "Elecciones",
        "fr": "Élections",
        "pt": "Eleições"
    },
    "Established for": {
        "de": "Gegründet für",
        "es": "Establecido para",
        "fr": "Établi pour",
        "pt": "Estabelecido para"
    },
    "Ethnic groups": {
        "de": "Ethnische Gruppen",
        "es": "Grupos étnicos",
        "fr": "Groupes ethniques",
        "pt": "Grupos étnicos"
    },
    "Exports": {
        "de": "Exporte",
        "es": "Exportaciones",
        "fr": "Exportations",
        "pt": "Exportações"
    },
    "Free and fair": {
        "de": "Frei und fair",
        "es": "Libres y justas",
        "fr": "Libres et équitables",
        "pt": "Livres e justas"
    },
    "Free to use. You may share unmodified copies, but not sell or modify the app. Anything you make with it is yours.": {
        "de": "Kostenlos nutzbar. Unveränderte Kopien dürfen weitergegeben, die App aber weder verkauft noch verändert werden. Alles, was du damit erstellst, gehört dir.",
        "es": "Uso gratuito. Puedes compartir copias sin modificar, pero no vender ni modificar la app. Todo lo que crees con ella es tuyo.",
        "fr": "Utilisation gratuite. Vous pouvez partager des copies non modifiées, mais pas vendre ni modifier l’app. Tout ce que vous créez avec elle vous appartient.",
        "pt": "Uso gratuito. Você pode compartilhar cópias não modificadas, mas não vender nem modificar o app. Tudo o que você criar com ele é seu."
    },
    "Free, with limits on civil liberties": {
        "de": "Frei, mit eingeschränkten Bürgerrechten",
        "es": "Libres, con límites a las libertades civiles",
        "fr": "Libres, avec des libertés civiles limitées",
        "pt": "Livres, com limites às liberdades civis"
    },
    "Frozen lake": {
        "de": "Zugefrorener See",
        "es": "Lago helado",
        "fr": "Lac gelé",
        "pt": "Lago congelado"
    },
    "GDP by sector": {
        "de": "BIP nach Sektor",
        "es": "PIB por sector",
        "fr": "PIB par secteur",
        "pt": "PIB por setor"
    },
    "Geography": {
        "de": "Geografie",
        "es": "Geografía",
        "fr": "Géographie",
        "pt": "Geografia"
    },
    "Gini index": {
        "de": "Gini-Index",
        "es": "Índice de Gini",
        "fr": "Indice de Gini",
        "pt": "Índice de Gini"
    },
    "Globe resolution": {
        "de": "Globusauflösung",
        "es": "Resolución del globo",
        "fr": "Résolution du globe",
        "pt": "Resolução do globo"
    },
    "Government": {
        "de": "Regierung",
        "es": "Gobierno",
        "fr": "Gouvernement",
        "pt": "Governo"
    },
    "Government type": {
        "de": "Regierungsform",
        "es": "Tipo de gobierno",
        "fr": "Type de gouvernement",
        "pt": "Tipo de governo"
    },
    "Grassland": {
        "de": "Grasland",
        "es": "Pradera",
        "fr": "Prairie",
        "pt": "Campos"
    },
    "Ground Forces": {
        "de": "Landstreitkräfte",
        "es": "Fuerzas Terrestres",
        "fr": "Forces terrestres",
        "pt": "Forças Terrestres"
    },
    "Heavily restricted": {
        "de": "Stark eingeschränkt",
        "es": "Muy restringidas",
        "fr": "Fortement restreintes",
        "pt": "Fortemente restritas"
    },
    "Held, but neither free nor fair": {
        "de": "Abgehalten, aber weder frei noch fair",
        "es": "Celebradas, pero ni libres ni justas",
        "fr": "Organisées, mais ni libres ni équitables",
        "pt": "Realizadas, mas nem livres nem justas"
    },
    "How finely surface maps are drawn. Finer ones show more detail but take longer to draw. Every resolution is saved with the universe once drawn. Also on the surface map.": {
        "de": "Wie fein Oberflächenkarten gezeichnet werden. Feinere zeigen mehr Details, brauchen aber länger. Jede Auflösung wird nach dem Zeichnen mit dem Universum gespeichert. Auch auf der Oberflächenkarte.",
        "es": "Con qué detalle se dibujan los mapas de superficie. Los más finos muestran más detalle, pero tardan más en dibujarse. Cada resolución se guarda con el universo una vez dibujada. También en el mapa de superficie.",
        "fr": "La finesse des cartes de surface. Les plus fines montrent plus de détails mais prennent plus de temps. Chaque résolution est enregistrée avec l’univers une fois dessinée. Aussi sur la carte de surface.",
        "pt": "O nível de detalhe dos mapas de superfície. Os mais finos mostram mais detalhes, mas demoram mais para desenhar. Cada resolução é salva com o universo depois de desenhada. Também no mapa da superfície."
    },
    "How finely the globe of the world you zoom to is drawn. Also in the planetary view's side panel.": {
        "de": "Wie fein der Globus der herangezoomten Welt gezeichnet wird. Auch in der Seitenleiste der Planetenansicht.",
        "es": "Con qué detalle se dibuja el globo del mundo al que te acercas. También en el panel lateral de la vista planetaria.",
        "fr": "La finesse du globe du monde sur lequel vous zoomez. Aussi dans le panneau latéral de la vue planétaire.",
        "pt": "O nível de detalhe do globo do mundo que você amplia. Também no painel lateral da vista planetária."
    },
    "How finely the globe of the world zoomed to is drawn. Each resolution is saved with the universe the first time it's drawn, so it shows straight away after that.": {
        "de": "Wie fein der Globus der herangezoomten Welt gezeichnet wird. Jede Auflösung wird beim ersten Zeichnen mit dem Universum gespeichert und erscheint danach sofort.",
        "es": "Con qué detalle se dibuja el globo del mundo ampliado. Cada resolución se guarda con el universo la primera vez que se dibuja y después aparece al instante.",
        "fr": "La finesse du globe du monde agrandi. Chaque résolution est enregistrée avec l’univers la première fois qu’elle est dessinée, puis s’affiche aussitôt.",
        "pt": "O nível de detalhe do globo do mundo ampliado. Cada resolução é salva com o universo na primeira vez que é desenhada, e depois aparece na hora."
    },
    "How finely this surface map is drawn. Each resolution is saved with the universe the first time it's drawn, so it opens straight away after that.": {
        "de": "Wie fein diese Oberflächenkarte gezeichnet wird. Jede Auflösung wird beim ersten Zeichnen mit dem Universum gespeichert und öffnet sich danach sofort.",
        "es": "Con qué detalle se dibuja este mapa de superficie. Cada resolución se guarda con el universo la primera vez que se dibuja y después se abre al instante.",
        "fr": "La finesse de cette carte de surface. Chaque résolution est enregistrée avec l’univers la première fois qu’elle est dessinée, puis s’ouvre aussitôt.",
        "pt": "O nível de detalhe deste mapa de superfície. Cada resolução é salva com o universo na primeira vez que é desenhada, e depois abre na hora."
    },
    "Ice crust": {
        "de": "Eiskruste",
        "es": "Corteza de hielo",
        "fr": "Croûte de glace",
        "pt": "Crosta de gelo"
    },
    "Imports": {
        "de": "Importe",
        "es": "Importaciones",
        "fr": "Importations",
        "pt": "Importações"
    },
    "Includes three.js, © three.js authors, under the MIT licence.": {
        "de": "Enthält three.js, © three.js-Autoren, unter der MIT-Lizenz.",
        "es": "Incluye three.js, © autores de three.js, bajo la licencia MIT.",
        "fr": "Comprend three.js, © auteurs de three.js, sous licence MIT.",
        "pt": "Inclui three.js, © autores do three.js, sob a licença MIT."
    },
    "Independent": {
        "de": "Unabhängig",
        "es": "Independiente",
        "fr": "Indépendant",
        "pt": "Independente"
    },
    "Industries": {
        "de": "Industrien",
        "es": "Industrias",
        "fr": "Industries",
        "pt": "Indústrias"
    },
    "Inflation rate": {
        "de": "Inflationsrate",
        "es": "Tasa de inflación",
        "fr": "Taux d’inflation",
        "pt": "Taxa de inflação"
    },
    "Introduction": {
        "de": "Einleitung",
        "es": "Introducción",
        "fr": "Introduction",
        "pt": "Introdução"
    },
    "Judiciary": {
        "de": "Justiz",
        "es": "Poder judicial",
        "fr": "Justice",
        "pt": "Judiciário"
    },
    "Labour force": {
        "de": "Erwerbsbevölkerung",
        "es": "Población activa",
        "fr": "Population active",
        "pt": "Força de trabalho"
    },
    "Lake": {
        "de": "See",
        "es": "Lago",
        "fr": "Lac",
        "pt": "Lago"
    },
    "Languages": {
        "de": "Sprachen",
        "es": "Idiomas",
        "fr": "Langues",
        "pt": "Idiomas"
    },
    "Lava lake": {
        "de": "Lavasee",
        "es": "Lago de lava",
        "fr": "Lac de lave",
        "pt": "Lago de lava"
    },
    "Lava sea": {
        "de": "Lavameer",
        "es": "Mar de lava",
        "fr": "Mer de lave",
        "pt": "Mar de lava"
    },
    "Legal system": {
        "de": "Rechtssystem",
        "es": "Sistema jurídico",
        "fr": "Système juridique",
        "pt": "Sistema jurídico"
    },
    "Licence and registration required": {
        "de": "Waffenschein und Registrierung nötig",
        "es": "Licencia y registro obligatorios",
        "fr": "Permis et enregistrement obligatoires",
        "pt": "Licença e registro obrigatórios"
    },
    "Licence…": {
        "de": "Lizenz…",
        "es": "Licencia…",
        "fr": "Licence…",
        "pt": "Licença…"
    },
    "Life expectancy": {
        "de": "Lebenserwartung",
        "es": "Esperanza de vida",
        "fr": "Espérance de vie",
        "pt": "Expectativa de vida"
    },
    "Literacy": {
        "de": "Alphabetisierung",
        "es": "Alfabetización",
        "fr": "Alphabétisation",
        "pt": "Alfabetização"
    },
    "Major urban areas": {
        "de": "Größte Ballungsräume",
        "es": "Principales áreas urbanas",
        "fr": "Principales zones urbaines",
        "pt": "Principais áreas urbanas"
    },
    "Marsh": {
        "de": "Sumpf",
        "es": "Pantano",
        "fr": "Marais",
        "pt": "Pântano"
    },
    "Media": {
        "de": "Medien",
        "es": "Medios",
        "fr": "Médias",
        "pt": "Imprensa"
    },
    "Median age": {
        "de": "Medianalter",
        "es": "Edad mediana",
        "fr": "Âge médian",
        "pt": "Idade mediana"
    },
    "Military and security": {
        "de": "Militär und Sicherheit",
        "es": "Ejército y seguridad",
        "fr": "Armée et sécurité",
        "pt": "Forças armadas e segurança"
    },
    "Military junta": {
        "de": "Militärjunta",
        "es": "Junta militar",
        "fr": "Junte militaire",
        "pt": "Junta militar"
    },
    "Military service": {
        "de": "Wehrdienst",
        "es": "Servicio militar",
        "fr": "Service militaire",
        "pt": "Serviço militar"
    },
    "Military spending": {
        "de": "Militärausgaben",
        "es": "Gasto militar",
        "fr": "Dépenses militaires",
        "pt": "Gastos militares"
    },
    "Mostly permitted": {
        "de": "Weitgehend erlaubt",
        "es": "Permitidas en general",
        "fr": "Généralement autorisées",
        "pt": "Permitidas em geral"
    },
    "Mountains": {
        "de": "Gebirge",
        "es": "Montañas",
        "fr": "Montagnes",
        "pt": "Montanhas"
    },
    "National Militia": {
        "de": "Nationalmiliz",
        "es": "Milicia Nacional",
        "fr": "Milice nationale",
        "pt": "Milícia Nacional"
    },
    "Natural hazards": {
        "de": "Naturgefahren",
        "es": "Riesgos naturales",
        "fr": "Risques naturels",
        "pt": "Riscos naturais"
    },
    "Natural resources": {
        "de": "Bodenschätze",
        "es": "Recursos naturales",
        "fr": "Ressources naturelles",
        "pt": "Recursos naturais"
    },
    "Naval Forces": {
        "de": "Seestreitkräfte",
        "es": "Fuerzas Navales",
        "fr": "Forces navales",
        "pt": "Forças Navais"
    },
    "No central government": {
        "de": "Keine Zentralregierung",
        "es": "Sin gobierno central",
        "fr": "Pas de gouvernement central",
        "pt": "Sem governo central"
    },
    "No restrictions": {
        "de": "Keine Einschränkungen",
        "es": "Sin restricciones",
        "fr": "Aucune restriction",
        "pt": "Sem restrições"
    },
    "None": {
        "de": "Keine",
        "es": "Ninguno",
        "fr": "Aucun",
        "pt": "Nenhum"
    },
    "None (uninhabited)": {
        "de": "Keine (unbewohnt)",
        "es": "Ninguna (deshabitado)",
        "fr": "Aucune (inhabité)",
        "pt": "Nenhuma (desabitado)"
    },
    "None held": {
        "de": "Keine",
        "es": "No se celebran",
        "fr": "Aucune",
        "pt": "Não realizadas"
    },
    "Ocean": {
        "de": "Ozean",
        "es": "Océano",
        "fr": "Océan",
        "pt": "Oceano"
    },
    "Oligarchic republic": {
        "de": "Oligarchische Republik",
        "es": "República oligárquica",
        "fr": "République oligarchique",
        "pt": "República oligárquica"
    },
    "One-party state": {
        "de": "Einparteienstaat",
        "es": "Estado de partido único",
        "fr": "État à parti unique",
        "pt": "Estado de partido único"
    },
    "Orbital station": {
        "de": "Orbitalstation",
        "es": "Estación orbital",
        "fr": "Station orbitale",
        "pt": "Estação orbital"
    },
    "Other installations": {
        "de": "Weitere Einrichtungen",
        "es": "Otras instalaciones",
        "fr": "Autres installations",
        "pt": "Outras instalações"
    },
    "Parliamentary constitutional monarchy": {
        "de": "Parlamentarische konstitutionelle Monarchie",
        "es": "Monarquía constitucional parlamentaria",
        "fr": "Monarchie constitutionnelle parlementaire",
        "pt": "Monarquia constitucional parlamentarista"
    },
    "Parliamentary republic": {
        "de": "Parlamentarische Republik",
        "es": "República parlamentaria",
        "fr": "République parlementaire",
        "pt": "República parlamentarista"
    },
    "People and society": {
        "de": "Bevölkerung und Gesellschaft",
        "es": "Población y sociedad",
        "fr": "Population et société",
        "pt": "População e sociedade"
    },
    "Population": {
        "de": "Bevölkerung",
        "es": "Población",
        "fr": "Population",
        "pt": "População"
    },
    "Population growth": {
        "de": "Bevölkerungswachstum",
        "es": "Crecimiento demográfico",
        "fr": "Croissance démographique",
        "pt": "Crescimento populacional"
    },
    "Presidential republic": {
        "de": "Präsidialrepublik",
        "es": "República presidencialista",
        "fr": "République présidentielle",
        "pt": "República presidencialista"
    },
    "Real GDP (PPP)": {
        "de": "Reales BIP (KKP)",
        "es": "PIB real (PPA)",
        "fr": "PIB réel (PPA)",
        "pt": "PIB real (PPC)"
    },
    "Real GDP growth rate": {
        "de": "Reales BIP-Wachstum",
        "es": "Crecimiento del PIB real",
        "fr": "Croissance du PIB réel",
        "pt": "Crescimento do PIB real"
    },
    "Real GDP per capita": {
        "de": "Reales BIP pro Kopf",
        "es": "PIB real per cápita",
        "fr": "PIB réel par habitant",
        "pt": "PIB real per capita"
    },
    "Religions": {
        "de": "Religionen",
        "es": "Religiones",
        "fr": "Religions",
        "pt": "Religiões"
    },
    "Resolution": {
        "de": "Auflösung",
        "es": "Resolución",
        "fr": "Résolution",
        "pt": "Resolução"
    },
    "Resolution %@": {
        "de": "Auflösung %@",
        "es": "Resolución %@",
        "fr": "Résolution %@",
        "pt": "Resolução %@"
    },
    "Savanna": {
        "de": "Savanne",
        "es": "Sabana",
        "fr": "Savane",
        "pt": "Savana"
    },
    "Scorched rock": {
        "de": "Versengter Fels",
        "es": "Roca calcinada",
        "fr": "Roche calcinée",
        "pt": "Rocha calcinada"
    },
    "Sea ice": {
        "de": "Meereis",
        "es": "Hielo marino",
        "fr": "Banquise",
        "pt": "Gelo marinho"
    },
    "Security situation": {
        "de": "Sicherheitslage",
        "es": "Situación de seguridad",
        "fr": "Situation sécuritaire",
        "pt": "Situação de segurança"
    },
    "Ship arrivals": {
        "de": "Schiffsankünfte",
        "es": "Llegadas de naves",
        "fr": "Arrivées de vaisseaux",
        "pt": "Chegadas de naves"
    },
    "Shrubland": {
        "de": "Buschland",
        "es": "Matorral",
        "fr": "Maquis",
        "pt": "Matagal"
    },
    "Snow and ice": {
        "de": "Schnee und Eis",
        "es": "Nieve y hielo",
        "fr": "Neige et glace",
        "pt": "Neve e gelo"
    },
    "Society": {
        "de": "Gesellschaft",
        "es": "Sociedad",
        "fr": "Société",
        "pt": "Sociedade"
    },
    "Sovereign states": {
        "de": "Souveräne Staaten",
        "es": "Estados soberanos",
        "fr": "États souverains",
        "pt": "Estados soberanos"
    },
    "Space Force": {
        "de": "Weltraumstreitkräfte",
        "es": "Fuerza Espacial",
        "fr": "Force spatiale",
        "pt": "Força Espacial"
    },
    "Spaceports": {
        "de": "Raumhäfen",
        "es": "Puertos espaciales",
        "fr": "Astroports",
        "pt": "Espaçoportos"
    },
    "Stable": {
        "de": "Stabil",
        "es": "Estable",
        "fr": "Stable",
        "pt": "Estável"
    },
    "Subtropical desert": {
        "de": "Subtropische Wüste",
        "es": "Desierto subtropical",
        "fr": "Désert subtropical",
        "pt": "Deserto subtropical"
    },
    "Suffrage": {
        "de": "Wahlrecht",
        "es": "Sufragio",
        "fr": "Suffrage",
        "pt": "Sufrágio"
    },
    "Taiga": {
        "de": "Taiga",
        "es": "Taiga",
        "fr": "Taïga",
        "pt": "Taiga"
    },
    "Technocratic council": {
        "de": "Technokratischer Rat",
        "es": "Consejo tecnocrático",
        "fr": "Conseil technocratique",
        "pt": "Conselho tecnocrático"
    },
    "Technology base": {
        "de": "Technologiestand",
        "es": "Base tecnológica",
        "fr": "Niveau technologique",
        "pt": "Base tecnológica"
    },
    "Temperate desert": {
        "de": "Gemäßigte Wüste",
        "es": "Desierto templado",
        "fr": "Désert tempéré",
        "pt": "Deserto temperado"
    },
    "Temperate forest": {
        "de": "Gemäßigter Wald",
        "es": "Bosque templado",
        "fr": "Forêt tempérée",
        "pt": "Floresta temperada"
    },
    "Temperate rainforest": {
        "de": "Gemäßigter Regenwald",
        "es": "Bosque lluvioso templado",
        "fr": "Forêt pluviale tempérée",
        "pt": "Floresta pluvial temperada"
    },
    "Theocratic state": {
        "de": "Theokratischer Staat",
        "es": "Estado teocrático",
        "fr": "État théocratique",
        "pt": "Estado teocrático"
    },
    "Transportation": {
        "de": "Verkehr",
        "es": "Transporte",
        "fr": "Transports",
        "pt": "Transportes"
    },
    "Travel advisory": {
        "de": "Reisewarnung",
        "es": "Aviso de viaje",
        "fr": "Conseil aux voyageurs",
        "pt": "Alerta de viagem"
    },
    "Tribal chiefdoms": {
        "de": "Stammesfürstentümer",
        "es": "Jefaturas tribales",
        "fr": "Chefferies tribales",
        "pt": "Chefias tribais"
    },
    "Tropical rainforest": {
        "de": "Tropischer Regenwald",
        "es": "Selva tropical",
        "fr": "Forêt tropicale humide",
        "pt": "Floresta tropical úmida"
    },
    "Tropical seasonal forest": {
        "de": "Tropischer Saisonwald",
        "es": "Bosque tropical estacional",
        "fr": "Forêt tropicale saisonnière",
        "pt": "Floresta tropical sazonal"
    },
    "Tundra": {
        "de": "Tundra",
        "es": "Tundra",
        "fr": "Toundra",
        "pt": "Tundra"
    },
    "Unemployment rate": {
        "de": "Arbeitslosenquote",
        "es": "Tasa de desempleo",
        "fr": "Taux de chômage",
        "pt": "Taxa de desemprego"
    },
    "Urbanisation": {
        "de": "Verstädterung",
        "es": "Urbanización",
        "fr": "Urbanisation",
        "pt": "Urbanização"
    },
    "Volcano": {
        "de": "Vulkan",
        "es": "Volcán",
        "fr": "Volcan",
        "pt": "Vulcão"
    },
    "abolished": {
        "de": "abgeschafft",
        "es": "abolida",
        "fr": "abolie",
        "pt": "abolida"
    },
    "agriculture": {
        "de": "Landwirtschaft",
        "es": "agricultura",
        "fr": "agriculture",
        "pt": "agricultura"
    },
    "agriculture %@, industry %@, services %@": {
        "de": "Landwirtschaft %@, Industrie %@, Dienstleistungen %@",
        "es": "agricultura %@, industria %@, servicios %@",
        "fr": "agriculture %@, industrie %@, services %@",
        "pt": "agricultura %@, indústria %@, serviços %@"
    },
    "airless": {
        "de": "luftlos",
        "es": "sin aire",
        "fr": "sans air",
        "pt": "sem ar"
    },
    "approximately %@": {
        "de": "etwa %@",
        "es": "aproximadamente %@",
        "fr": "environ %@",
        "pt": "aproximadamente %@"
    },
    "arable land": {
        "de": "Ackerland",
        "es": "tierras cultivables",
        "fr": "terres arables",
        "pt": "terras aráveis"
    },
    "asteroid mining": {
        "de": "Asteroidenbergbau",
        "es": "minería de asteroides",
        "fr": "exploitation minière des astéroïdes",
        "pt": "mineração de asteroides"
    },
    "banking": {
        "de": "Bankwesen",
        "es": "banca",
        "fr": "banque",
        "pt": "bancos"
    },
    "bauxite": {
        "de": "Bauxit",
        "es": "bauxita",
        "fr": "bauxite",
        "pt": "bauxita"
    },
    "chemicals": {
        "de": "Chemie",
        "es": "productos químicos",
        "fr": "produits chimiques",
        "pt": "produtos químicos"
    },
    "civil law system": {
        "de": "kontinentaleuropäisches Recht",
        "es": "sistema de derecho civil",
        "fr": "système de droit civil",
        "pt": "sistema de direito civil"
    },
    "civil law, overridden by military decree": {
        "de": "Zivilrecht, durch Militärdekrete außer Kraft gesetzt",
        "es": "derecho civil, anulado por decretos militares",
        "fr": "droit civil, supplanté par des décrets militaires",
        "pt": "direito civil, sobreposto por decretos militares"
    },
    "cobalt": {
        "de": "Kobalt",
        "es": "cobalto",
        "fr": "cobalt",
        "pt": "cobalto"
    },
    "cold": {
        "de": "kalt",
        "es": "frío",
        "fr": "froid",
        "pt": "frio"
    },
    "common law system": {
        "de": "Common Law",
        "es": "sistema de derecho anglosajón",
        "fr": "système de common law",
        "pt": "sistema de common law"
    },
    "copper": {
        "de": "Kupfer",
        "es": "cobre",
        "fr": "cuivre",
        "pt": "cobre"
    },
    "corporate charter and company regulations": {
        "de": "Konzernfreibrief und Unternehmensvorschriften",
        "es": "carta corporativa y reglamentos de la empresa",
        "fr": "charte d’entreprise et règlements de la compagnie",
        "pt": "carta corporativa e regulamentos da empresa"
    },
    "corrosive atmosphere": {
        "de": "ätzende Atmosphäre",
        "es": "atmósfera corrosiva",
        "fr": "atmosphère corrosive",
        "pt": "atmosfera corrosiva"
    },
    "customary law": {
        "de": "Gewohnheitsrecht",
        "es": "derecho consuetudinario",
        "fr": "droit coutumier",
        "pt": "direito consuetudinário"
    },
    "dense air": {
        "de": "dichte Luft",
        "es": "aire denso",
        "fr": "air dense",
        "pt": "ar denso"
    },
    "earthquakes": {
        "de": "Erdbeben",
        "es": "terremotos",
        "fr": "séismes",
        "pt": "terremotos"
    },
    "extreme cold": {
        "de": "extreme Kälte",
        "es": "frío extremo",
        "fr": "froid extrême",
        "pt": "frio extremo"
    },
    "extreme heat": {
        "de": "extreme Hitze",
        "es": "calor extremo",
        "fr": "chaleur extrême",
        "pt": "calor extremo"
    },
    "financial services": {
        "de": "Finanzdienstleistungen",
        "es": "servicios financieros",
        "fr": "services financiers",
        "pt": "serviços financeiros"
    },
    "fish": {
        "de": "Fisch",
        "es": "pesca",
        "fr": "poisson",
        "pt": "peixes"
    },
    "fishing": {
        "de": "Fischerei",
        "es": "pesca",
        "fr": "pêche",
        "pt": "pesca"
    },
    "food processing": {
        "de": "Lebensmittelverarbeitung",
        "es": "procesamiento de alimentos",
        "fr": "agroalimentaire",
        "pt": "processamento de alimentos"
    },
    "foodstuffs": {
        "de": "Lebensmittel",
        "es": "alimentos",
        "fr": "denrées alimentaires",
        "pt": "alimentos"
    },
    "free press": {
        "de": "freie Presse",
        "es": "prensa libre",
        "fr": "presse libre",
        "pt": "imprensa livre"
    },
    "frozen": {
        "de": "gefroren",
        "es": "helado",
        "fr": "glacé",
        "pt": "congelado"
    },
    "fusion power plants": {
        "de": "Fusionskraftwerke",
        "es": "centrales de fusión",
        "fr": "centrales à fusion",
        "pt": "usinas de fusão"
    },
    "gold": {
        "de": "Gold",
        "es": "oro",
        "fr": "or",
        "pt": "ouro"
    },
    "handicrafts": {
        "de": "Handwerk",
        "es": "artesanía",
        "fr": "artisanat",
        "pt": "artesanato"
    },
    "health care": {
        "de": "Gesundheitswesen",
        "es": "sanidad",
        "fr": "santé",
        "pt": "saúde"
    },
    "high technology": {
        "de": "Hochtechnologie",
        "es": "alta tecnología",
        "fr": "haute technologie",
        "pt": "alta tecnologia"
    },
    "homogeneous": {
        "de": "homogen",
        "es": "homogéneo",
        "fr": "homogène",
        "pt": "homogêneo"
    },
    "hospitality": {
        "de": "Gastgewerbe",
        "es": "hostelería",
        "fr": "hôtellerie",
        "pt": "hotelaria"
    },
    "hot": {
        "de": "heiß",
        "es": "cálido",
        "fr": "chaud",
        "pt": "quente"
    },
    "hydrocarbons": {
        "de": "Kohlenwasserstoffe",
        "es": "hidrocarburos",
        "fr": "hydrocarbures",
        "pt": "hidrocarbonetos"
    },
    "hydropower": {
        "de": "Wasserkraft",
        "es": "energía hidroeléctrica",
        "fr": "hydroélectricité",
        "pt": "energia hidrelétrica"
    },
    "independent": {
        "de": "unabhängig",
        "es": "independiente",
        "fr": "indépendante",
        "pt": "independente"
    },
    "insurance": {
        "de": "Versicherungen",
        "es": "seguros",
        "fr": "assurance",
        "pt": "seguros"
    },
    "iron ore": {
        "de": "Eisenerz",
        "es": "mineral de hierro",
        "fr": "minerai de fer",
        "pt": "minério de ferro"
    },
    "largely independent": {
        "de": "weitgehend unabhängig",
        "es": "mayormente independiente",
        "fr": "largement indépendante",
        "pt": "majoritariamente independente"
    },
    "largest city %@; %@ cities of a million or more": {
        "de": "größte Stadt %@; %@ Millionenstädte",
        "es": "ciudad más grande %@; %@ ciudades de un millón o más",
        "fr": "plus grande ville %@ ; %@ villes d’un million d’habitants ou plus",
        "pt": "maior cidade %@; %@ cidades com um milhão ou mais"
    },
    "largest settlement %@": {
        "de": "größte Siedlung %@",
        "es": "mayor asentamiento %@",
        "fr": "plus grande localité %@",
        "pt": "maior povoado %@"
    },
    "lithium": {
        "de": "Lithium",
        "es": "litio",
        "fr": "lithium",
        "pt": "lítio"
    },
    "logistics": {
        "de": "Logistik",
        "es": "logística",
        "fr": "logistique",
        "pt": "logística"
    },
    "machinery": {
        "de": "Maschinenbau",
        "es": "maquinaria",
        "fr": "machines",
        "pt": "máquinas"
    },
    "majority faith": {
        "de": "Mehrheitsreligion",
        "es": "religión mayoritaria",
        "fr": "religion majoritaire",
        "pt": "religião majoritária"
    },
    "majority group %@%, %@ minority groups %@%": {
        "de": "Mehrheitsgruppe %@ %, %@ Minderheiten %@ %",
        "es": "grupo mayoritario %@%, %@ grupos minoritarios %@%",
        "fr": "groupe majoritaire %@ %, %@ groupes minoritaires %@ %",
        "pt": "grupo majoritário %@%, %@ grupos minoritários %@%"
    },
    "majority group %@%, one minority group %@%": {
        "de": "Mehrheitsgruppe %@ %, eine Minderheit %@ %",
        "es": "grupo mayoritario %@%, un grupo minoritario %@%",
        "fr": "groupe majoritaire %@ %, un groupe minoritaire %@ %",
        "pt": "grupo majoritário %@%, um grupo minoritário %@%"
    },
    "manufactured goods": {
        "de": "Industriegüter",
        "es": "productos manufacturados",
        "fr": "produits manufacturés",
        "pt": "produtos manufaturados"
    },
    "metals and ores": {
        "de": "Metalle und Erze",
        "es": "metales y minerales",
        "fr": "métaux et minerais",
        "pt": "metais e minérios"
    },
    "military base": {
        "de": "Militärbasis",
        "es": "base militar",
        "fr": "base militaire",
        "pt": "base militar"
    },
    "mining": {
        "de": "Bergbau",
        "es": "minería",
        "fr": "exploitation minière",
        "pt": "mineração"
    },
    "mixed legal system": {
        "de": "gemischtes Rechtssystem",
        "es": "sistema jurídico mixto",
        "fr": "système juridique mixte",
        "pt": "sistema jurídico misto"
    },
    "nickel": {
        "de": "Nickel",
        "es": "níquel",
        "fr": "nickel",
        "pt": "níquel"
    },
    "nickel-iron": {
        "de": "Nickeleisen",
        "es": "ferroníquel",
        "fr": "ferronickel",
        "pt": "ferro-níquel"
    },
    "no standing forces; a volunteer militia": {
        "de": "keine stehenden Truppen; eine Freiwilligenmiliz",
        "es": "sin fuerzas permanentes; una milicia voluntaria",
        "fr": "pas de forces permanentes ; une milice de volontaires",
        "pt": "sem forças permanentes; uma milícia voluntária"
    },
    "no written language": {
        "de": "keine Schriftsprache",
        "es": "sin lengua escrita",
        "fr": "pas de langue écrite",
        "pt": "sem língua escrita"
    },
    "none": {
        "de": "keine",
        "es": "ninguno",
        "fr": "aucun",
        "pt": "nenhum"
    },
    "one common language (official)": {
        "de": "eine gemeinsame Sprache (Amtssprache)",
        "es": "una lengua común (oficial)",
        "fr": "une langue commune (officielle)",
        "pt": "uma língua comum (oficial)"
    },
    "one common language (official), %@ regional languages": {
        "de": "eine gemeinsame Sprache (Amtssprache), %@ Regionalsprachen",
        "es": "una lengua común (oficial), %@ lenguas regionales",
        "fr": "une langue commune (officielle), %@ langues régionales",
        "pt": "uma língua comum (oficial), %@ línguas regionais"
    },
    "one common language (official), one regional language": {
        "de": "eine gemeinsame Sprache (Amtssprache), eine Regionalsprache",
        "es": "una lengua común (oficial), una lengua regional",
        "fr": "une langue commune (officielle), une langue régionale",
        "pt": "uma língua comum (oficial), uma língua regional"
    },
    "ore refining": {
        "de": "Erzverhüttung",
        "es": "refinado de minerales",
        "fr": "raffinage de minerais",
        "pt": "refino de minérios"
    },
    "partly free": {
        "de": "teilweise frei",
        "es": "parcialmente libre",
        "fr": "partiellement libre",
        "pt": "parcialmente livre"
    },
    "platinum-group metals": {
        "de": "Platinmetalle",
        "es": "metales del grupo del platino",
        "fr": "métaux du groupe du platine",
        "pt": "metais do grupo da platina"
    },
    "rare earth elements": {
        "de": "Seltene Erden",
        "es": "tierras raras",
        "fr": "terres rares",
        "pt": "terras raras"
    },
    "religious law": {
        "de": "religiöses Recht",
        "es": "derecho religioso",
        "fr": "droit religieux",
        "pt": "direito religioso"
    },
    "research station": {
        "de": "Forschungsstation",
        "es": "estación de investigación",
        "fr": "station de recherche",
        "pt": "estação de pesquisa"
    },
    "restricted": {
        "de": "eingeschränkt",
        "es": "restringida",
        "fr": "restreinte",
        "pt": "restrita"
    },
    "retail": {
        "de": "Einzelhandel",
        "es": "comercio minorista",
        "fr": "commerce de détail",
        "pt": "varejo"
    },
    "retained": {
        "de": "beibehalten",
        "es": "vigente",
        "fr": "maintenue",
        "pt": "mantida"
    },
    "scientific research": {
        "de": "wissenschaftliche Forschung",
        "es": "investigación científica",
        "fr": "recherche scientifique",
        "pt": "pesquisa científica"
    },
    "scorching": {
        "de": "glühend heiß",
        "es": "abrasador",
        "fr": "brûlant",
        "pt": "escaldante"
    },
    "seafood": {
        "de": "Meeresfrüchte",
        "es": "mariscos",
        "fr": "produits de la mer",
        "pt": "frutos do mar"
    },
    "severe storms": {
        "de": "schwere Stürme",
        "es": "tormentas fuertes",
        "fr": "violentes tempêtes",
        "pt": "tempestades severas"
    },
    "shipbuilding": {
        "de": "Schiffbau",
        "es": "construcción naval",
        "fr": "construction navale",
        "pt": "construção naval"
    },
    "silver": {
        "de": "Silber",
        "es": "plata",
        "fr": "argent",
        "pt": "prata"
    },
    "solar radiation": {
        "de": "Sonnenstrahlung",
        "es": "radiación solar",
        "fr": "rayonnement solaire",
        "pt": "radiação solar"
    },
    "spacecraft components": {
        "de": "Raumschiffkomponenten",
        "es": "componentes de naves espaciales",
        "fr": "composants de vaisseaux spatiaux",
        "pt": "componentes de naves espaciais"
    },
    "state religion": {
        "de": "Staatsreligion",
        "es": "religión oficial",
        "fr": "religion d’État",
        "pt": "religião oficial"
    },
    "state-controlled": {
        "de": "staatlich kontrolliert",
        "es": "controlados por el Estado",
        "fr": "contrôlés par l’État",
        "pt": "controlada pelo Estado"
    },
    "subject to political pressure": {
        "de": "politischem Druck ausgesetzt",
        "es": "sujeto a presión política",
        "fr": "soumise à des pressions politiques",
        "pt": "sujeito a pressão política"
    },
    "subordinate to the government": {
        "de": "der Regierung unterstellt",
        "es": "subordinado al gobierno",
        "fr": "subordonnée au gouvernement",
        "pt": "subordinado ao governo"
    },
    "subsistence farming": {
        "de": "Subsistenzlandwirtschaft",
        "es": "agricultura de subsistencia",
        "fr": "agriculture de subsistance",
        "pt": "agricultura de subsistência"
    },
    "technical data and pharmaceuticals": {
        "de": "technische Daten und Arzneimittel",
        "es": "datos técnicos y fármacos",
        "fr": "données techniques et produits pharmaceutiques",
        "pt": "dados técnicos e fármacos"
    },
    "temperate": {
        "de": "gemäßigt",
        "es": "templado",
        "fr": "tempéré",
        "pt": "temperado"
    },
    "the laws of the governing power": {
        "de": "die Gesetze der Verwaltungsmacht",
        "es": "las leyes de la potencia gobernante",
        "fr": "les lois de la puissance administrante",
        "pt": "as leis da potência governante"
    },
    "thin air": {
        "de": "dünne Luft",
        "es": "aire tenue",
        "fr": "air raréfié",
        "pt": "ar rarefeito"
    },
    "timber": {
        "de": "Holz",
        "es": "madera",
        "fr": "bois",
        "pt": "madeira"
    },
    "titanium": {
        "de": "Titan",
        "es": "titanio",
        "fr": "titane",
        "pt": "titânio"
    },
    "total: %@ km²; land: %@ km²; water: %@ km²": {
        "de": "gesamt: %@ km²; Land: %@ km²; Wasser: %@ km²",
        "es": "total: %@ km²; tierra: %@ km²; agua: %@ km²",
        "fr": "totale : %@ km² ; terres : %@ km² ; eaux : %@ km²",
        "pt": "total: %@ km²; terra: %@ km²; água: %@ km²"
    },
    "tourism": {
        "de": "Tourismus",
        "es": "turismo",
        "fr": "tourisme",
        "pt": "turismo"
    },
    "toxic air": {
        "de": "giftige Luft",
        "es": "aire tóxico",
        "fr": "air toxique",
        "pt": "ar tóxico"
    },
    "uranium": {
        "de": "Uran",
        "es": "uranio",
        "fr": "uranium",
        "pt": "urânio"
    },
    "vacuum": {
        "de": "Vakuum",
        "es": "vacío",
        "fr": "vide",
        "pt": "vácuo"
    },
    "vehicles": {
        "de": "Fahrzeuge",
        "es": "vehículos",
        "fr": "véhicules",
        "pt": "veículos"
    },
    "water": {
        "de": "Wasser",
        "es": "agua",
        "fr": "eau",
        "pt": "água"
    },
    "water ice": {
        "de": "Wassereis",
        "es": "hielo de agua",
        "fr": "glace d’eau",
        "pt": "gelo de água"
    },
    "yes": {
        "de": "ja",
        "es": "sí",
        "fr": "oui",
        "pt": "sim"
    },
    "%.1f billion": {
        "de": "%.1f Milliarden",
        "es": "%.1f mil millones",
        "fr": "%.1f milliards",
        "pt": "%.1f bilhões"
    },
    "%.1f million": {
        "de": "%.1f Millionen",
        "es": "%.1f millones",
        "fr": "%.1f millions",
        "pt": "%.1f milhões"
    },
    "%.1f trillion": {
        "de": "%.1f Billionen",
        "es": "%.1f billones",
        "fr": "%.1f billions",
        "pt": "%.1f trilhões"
    },
    "Atomic": {
        "de": "Atomzeitalter",
        "es": "Atómica",
        "fr": "Atomique",
        "pt": "Atômica"
    },
    "Bronze and iron age": {
        "de": "Bronze- und Eisenzeit",
        "es": "Edad del Bronce y del Hierro",
        "fr": "Âges du bronze et du fer",
        "pt": "Idade do Bronze e do Ferro"
    },
    "Colony": {
        "de": "Kolonie",
        "es": "Colonia",
        "fr": "Colonie",
        "pt": "Colônia"
    },
    "Early modern": {
        "de": "Frühe Neuzeit",
        "es": "Edad Moderna temprana",
        "fr": "Début de l’époque moderne",
        "pt": "Início da Idade Moderna"
    },
    "Electrical": {
        "de": "Elektrisches Zeitalter",
        "es": "Eléctrica",
        "fr": "Électrique",
        "pt": "Elétrica"
    },
    "Essential travel only": {
        "de": "Nur notwendige Reisen",
        "es": "Solo viajes esenciales",
        "fr": "Voyages essentiels uniquement",
        "pt": "Somente viagens essenciais"
    },
    "Farming": {
        "de": "Landwirtschaft",
        "es": "Agricultura",
        "fr": "Agriculture",
        "pt": "Agricultura"
    },
    "Free port": {
        "de": "Freihafen",
        "es": "Puerto franco",
        "fr": "Port franc",
        "pt": "Porto livre"
    },
    "Hub spaceport": {
        "de": "Drehkreuz-Raumhafen",
        "es": "Puerto espacial principal",
        "fr": "Astroport principal",
        "pt": "Espaçoporto central"
    },
    "Industrial": {
        "de": "Industriezeitalter",
        "es": "Industrial",
        "fr": "Industriel",
        "pt": "Industrial"
    },
    "Information": {
        "de": "Informationszeitalter",
        "es": "Información",
        "fr": "Information",
        "pt": "Informação"
    },
    "International spaceport": {
        "de": "Internationaler Raumhafen",
        "es": "Puerto espacial internacional",
        "fr": "Astroport international",
        "pt": "Espaçoporto internacional"
    },
    "Interplanetary": {
        "de": "Interplanetar",
        "es": "Interplanetaria",
        "fr": "Interplanétaire",
        "pt": "Interplanetária"
    },
    "Interstellar": {
        "de": "Interstellar",
        "es": "Interestelar",
        "fr": "Interstellaire",
        "pt": "Interestelar"
    },
    "Landing field": {
        "de": "Landefeld",
        "es": "Campo de aterrizaje",
        "fr": "Terrain d’atterrissage",
        "pt": "Campo de pouso"
    },
    "Medieval": {
        "de": "Mittelalter",
        "es": "Medieval",
        "fr": "Médiéval",
        "pt": "Medieval"
    },
    "Military": {
        "de": "Militär",
        "es": "Militar",
        "fr": "Militaire",
        "pt": "Militar"
    },
    "Mining": {
        "de": "Bergbau",
        "es": "Minería",
        "fr": "Exploitation minière",
        "pt": "Mineração"
    },
    "No travel": {
        "de": "Keine Reisen",
        "es": "No viajar",
        "fr": "Aucun voyage",
        "pt": "Não viajar"
    },
    "Penal": {
        "de": "Strafkolonie",
        "es": "Penal",
        "fr": "Pénitentiaire",
        "pt": "Penal"
    },
    "Regional spaceport": {
        "de": "Regionaler Raumhafen",
        "es": "Puerto espacial regional",
        "fr": "Astroport régional",
        "pt": "Espaçoporto regional"
    },
    "Research": {
        "de": "Forschung",
        "es": "Investigación",
        "fr": "Recherche",
        "pt": "Pesquisa"
    },
    "Stone age": {
        "de": "Steinzeit",
        "es": "Edad de Piedra",
        "fr": "Âge de pierre",
        "pt": "Idade da Pedra"
    },
    "%@%": {
        "de": "%@ %",
        "es": "%@ %",
        "fr": "%@ %",
        "pt": "%@%"
    },
    "%.1f days": {
        "de": "%.1f Tage",
        "es": "%.1f días",
        "fr": "%.1f jours",
        "pt": "%.1f dias"
    },
    "%.1f hours": {
        "de": "%.1f Stunden",
        "es": "%.1f horas",
        "fr": "%.1f heures",
        "pt": "%.1f horas"
    },
    "%.1f years": {
        "de": "%.1f Jahre",
        "es": "%.1f años",
        "fr": "%.1f ans",
        "pt": "%.1f anos"
    },
    "%@ %@ globe": {
        "de": "%@ %@ Globus",
        "es": "Globo de %@ %@",
        "fr": "Globe %@ %@",
        "pt": "Globo %@ %@"
    },
    "%@ %@ surface map": {
        "de": "%@ %@ Oberflächenkarte",
        "es": "Mapa de superficie de %@ %@",
        "fr": "Carte de surface %@ %@",
        "pt": "Mapa da superfície %@ %@"
    },
    "%@ %@ world map": {
        "de": "%@ %@ Weltkarte",
        "es": "Mapa del mundo %@ %@",
        "fr": "Carte du monde %@ %@",
        "pt": "Mapa-múndi %@ %@"
    },
    "%@ city map": {
        "de": "Stadtkarte %@",
        "es": "Mapa de %@",
        "fr": "Plan de ville de %@",
        "pt": "Mapa da cidade %@"
    },
    "%@ km": {
        "de": "%@ km",
        "es": "%@ km",
        "fr": "%@ km",
        "pt": "%@ km"
    },
    "%@ methane rain": {
        "de": "%@er Methanregen",
        "es": "Lluvia de metano %@",
        "fr": "Pluie de méthane %@",
        "pt": "Chuva de metano %@"
    },
    "%@ methane snow": {
        "de": "%@er Methanschnee",
        "es": "Nevada de metano %@",
        "fr": "Neige de méthane %@",
        "pt": "Neve de metano %@"
    },
    "%@ notes": {
        "de": "Notizen zu %@",
        "es": "Notas de %@",
        "fr": "Notes sur %@",
        "pt": "Notas de %@"
    },
    "%@ rain": {
        "de": "%@er Regen",
        "es": "Lluvia %@",
        "fr": "Pluie %@",
        "pt": "Chuva %@"
    },
    "%@ sleet": {
        "de": "%@er Schneeregen",
        "es": "Aguanieve %@",
        "fr": "Neige fondue %@",
        "pt": "Chuva com neve %@"
    },
    "%@ snow": {
        "de": "%@er Schnee",
        "es": "Nevada %@",
        "fr": "Neige %@",
        "pt": "Neve %@"
    },
    "%@ × Earth's": {
        "de": "%@ × Erde",
        "es": "%@ × la de la Tierra",
        "fr": "%@ × celle de la Terre",
        "pt": "%@ × a da Terra"
    },
    "%lld added": {
        "de": "%lld hinzugefügt",
        "es": "%lld añadidos",
        "fr": "%lld ajoutés",
        "pt": "%lld adicionados"
    },
    "%lld differences": {
        "de": "%lld Unterschiede",
        "es": "%lld diferencias",
        "fr": "%lld différences",
        "pt": "%lld diferenças"
    },
    "%lld hops": {
        "de": "%lld Sprünge",
        "es": "%lld saltos",
        "fr": "%lld sauts",
        "pt": "%lld saltos"
    },
    "%lld moons": {
        "de": "%lld Monde",
        "es": "%lld lunas",
        "fr": "%lld lunes",
        "pt": "%lld luas"
    },
    "%lld notes": {
        "de": "%lld Notizen",
        "es": "%lld notas",
        "fr": "%lld notes",
        "pt": "%lld notas"
    },
    "%lld on": {
        "de": "%lld an",
        "es": "%lld activos",
        "fr": "%lld actifs",
        "pt": "%lld ativos"
    },
    "%lld removed": {
        "de": "%lld entfernt",
        "es": "%lld eliminados",
        "fr": "%lld supprimés",
        "pt": "%lld removidos"
    },
    "%lld rings": {
        "de": "%lld Ringe",
        "es": "%lld anillos",
        "fr": "%lld anneaux",
        "pt": "%lld anéis"
    },
    "%lld rocky, %lld giant, %lld belts": {
        "de": "%lld Gestein, %lld Riesen, %lld Gürtel",
        "es": "%lld rocosos, %lld gigantes, %lld cinturones",
        "fr": "%lld rocheuses, %lld géantes, %lld ceintures",
        "pt": "%lld rochosos, %lld gigantes, %lld cinturões"
    },
    "%lld universes": {
        "de": "%lld Universen",
        "es": "%lld universos",
        "fr": "%lld univers",
        "pt": "%lld universos"
    },
    "%lld worlds changed": {
        "de": "%lld Welten geändert",
        "es": "%lld mundos cambiados",
        "fr": "%lld mondes modifiés",
        "pt": "%lld mundos alterados"
    },
    "%lld worlds · %@": {
        "de": "%lld Welten · %@",
        "es": "%lld mundos · %@",
        "fr": "%lld mondes · %@",
        "pt": "%lld mundos · %@"
    },
    ", contaminated": {
        "de": ", verseucht",
        "es": ", contaminada",
        "fr": ", contaminé",
        "pt": ", contaminada"
    },
    "1 day/s": {
        "de": "1 Tag/s",
        "es": "1 día/s",
        "fr": "1 j/s",
        "pt": "1 dia/s"
    },
    "1 hop": {
        "de": "1 Sprung",
        "es": "1 salto",
        "fr": "1 saut",
        "pt": "1 salto"
    },
    "1 hr/s": {
        "de": "1 Std./s",
        "es": "1 h/s",
        "fr": "1 h/s",
        "pt": "1 h/s"
    },
    "1 min/s": {
        "de": "1 min/s",
        "es": "1 min/s",
        "fr": "1 min/s",
        "pt": "1 min/s"
    },
    "1 wk/s": {
        "de": "1 Wo./s",
        "es": "1 sem/s",
        "fr": "1 sem/s",
        "pt": "1 sem/s"
    },
    "1 yr/s": {
        "de": "1 J./s",
        "es": "1 año/s",
        "fr": "1 an/s",
        "pt": "1 ano/s"
    },
    "30 days/s": {
        "de": "30 Tage/s",
        "es": "30 días/s",
        "fr": "30 j/s",
        "pt": "30 dias/s"
    },
    "3D City Map…": {
        "de": "3D-Stadtkarte …",
        "es": "Mapa 3D de la ciudad…",
        "fr": "Plan de ville 3D…",
        "pt": "Mapa 3D da Cidade…"
    },
    "3D globe": {
        "de": "3D-Globus",
        "es": "Globo 3D",
        "fr": "Globe 3D",
        "pt": "Globo 3D"
    },
    "3D star field": {
        "de": "3D-Sternfeld",
        "es": "Campo estelar en 3D",
        "fr": "Champ d’étoiles 3D",
        "pt": "Campo estelar 3D"
    },
    "A cleared landing site, no services": {
        "de": "Ein geräumter Landeplatz, keine Dienste",
        "es": "Una zona de aterrizaje despejada, sin servicios",
        "fr": "Un site d’atterrissage dégagé, sans services",
        "pt": "Uma área de pouso desobstruída, sem serviços"
    },
    "A cold cloud of dust that hides the stars behind it": {
        "de": "Eine kalte Staubwolke, die die Sterne dahinter verbirgt",
        "es": "Una nube fría de polvo que oculta las estrellas que hay detrás",
        "fr": "Un nuage froid de poussière qui cache les étoiles derrière lui",
        "pt": "Uma nuvem fria de poeira que oculta as estrelas por trás dela"
    },
    "A few clouds": {
        "de": "Ein paar Wolken",
        "es": "Algunas nubes",
        "fr": "Quelques nuages",
        "pt": "Poucas nuvens"
    },
    "A shell of gas blown off by a dying star, lit by the white dwarf it left": {
        "de": "Eine von einem sterbenden Stern abgestoßene Gashülle, beleuchtet vom Weißen Zwerg, den er hinterließ",
        "es": "Una envoltura de gas expulsada por una estrella moribunda, iluminada por la enana blanca que dejó",
        "fr": "Une coquille de gaz expulsée par une étoile mourante, éclairée par la naine blanche qu’elle a laissée",
        "pt": "Uma casca de gás expelida por uma estrela moribunda, iluminada pela anã branca que ela deixou"
    },
    "A universe generated from a seed, explored in three dimensions": {
        "de": "Ein aus einem Startwert erzeugtes Universum, in drei Dimensionen erkundet",
        "es": "Un universo generado a partir de una semilla, explorado en tres dimensiones",
        "fr": "Un univers généré à partir d’une graine, exploré en trois dimensions",
        "pt": "Um universo gerado a partir de uma semente, explorado em três dimensões"
    },
    "Add": {
        "de": "Hinzufügen",
        "es": "Añadir",
        "fr": "Ajouter",
        "pt": "Adicionar"
    },
    "Add Sectors": {
        "de": "Sektoren hinzufügen",
        "es": "Añadir sectores",
        "fr": "Ajouter des secteurs",
        "pt": "Adicionar Setores"
    },
    "Add Sectors…": {
        "de": "Sektoren hinzufügen …",
        "es": "Añadir sectores…",
        "fr": "Ajouter des secteurs…",
        "pt": "Adicionar Setores…"
    },
    "Add a note": {
        "de": "Notiz hinzufügen",
        "es": "Añadir una nota",
        "fr": "Ajouter une note",
        "pt": "Adicionar uma nota"
    },
    "Add more of TravellerMap's sectors, such as this one's neighbours": {
        "de": "Weitere Sektoren von TravellerMap hinzufügen, etwa die Nachbarn dieses Sektors",
        "es": "Añade más sectores de TravellerMap, como los vecinos de este",
        "fr": "Ajouter d’autres secteurs de TravellerMap, comme les voisins de celui-ci",
        "pt": "Adicionar mais setores do TravellerMap, como os vizinhos deste"
    },
    "Add place": {
        "de": "Ort hinzufügen",
        "es": "Añadir lugar",
        "fr": "Ajouter un lieu",
        "pt": "Adicionar lugar"
    },
    "Add this system to the end of the route": {
        "de": "Dieses System am Ende der Route hinzufügen",
        "es": "Añade este sistema al final de la ruta",
        "fr": "Ajouter ce système à la fin de l’itinéraire",
        "pt": "Adicionar este sistema ao fim da rota"
    },
    "Add to route": {
        "de": "Zur Route hinzufügen",
        "es": "Añadir a la ruta",
        "fr": "Ajouter à l’itinéraire",
        "pt": "Adicionar à rota"
    },
    "Added": {
        "de": "Hinzugefügt",
        "es": "Añadido",
        "fr": "Ajouté",
        "pt": "Adicionados"
    },
    "Administered territory": {
        "de": "Verwaltetes Gebiet",
        "es": "Territorio administrado",
        "fr": "Territoire administré",
        "pt": "Território administrado"
    },
    "Advanced": {
        "de": "Fortgeschritten",
        "es": "Avanzada",
        "fr": "Avancé",
        "pt": "Avançada"
    },
    "Advisory": {
        "de": "Warnung",
        "es": "Aviso",
        "fr": "Conseil",
        "pt": "Alerta"
    },
    "Age": {
        "de": "Alter",
        "es": "Edad",
        "fr": "Âge",
        "pt": "Idade"
    },
    "Agriculture": {
        "de": "Landwirtschaft",
        "es": "Agricultura",
        "fr": "Agriculture",
        "pt": "Agricultura"
    },
    "Air force": {
        "de": "Luftwaffe",
        "es": "Fuerza aérea",
        "fr": "Armée de l’air",
        "pt": "Força aérea"
    },
    "All the notes on this system, to read or save as a PDF": {
        "de": "Alle Notizen zu diesem System, zum Lesen oder Sichern als PDF",
        "es": "Todas las notas de este sistema, para leer o guardar como PDF",
        "fr": "Toutes les notes sur ce système, à lire ou à enregistrer en PDF",
        "pt": "Todas as notas deste sistema, para ler ou salvar como PDF"
    },
    "All the notes on this world, its moons and places, to read or save as a PDF": {
        "de": "Alle Notizen zu dieser Welt, ihren Monden und Orten, zum Lesen oder Sichern als PDF",
        "es": "Todas las notas de este mundo, sus lunas y lugares, para leer o guardar como PDF",
        "fr": "Toutes les notes sur ce monde, ses lunes et ses lieux, à lire ou à enregistrer en PDF",
        "pt": "Todas as notas deste mundo, de suas luas e lugares, para ler ou salvar como PDF"
    },
    "Allegiance": {
        "de": "Zugehörigkeit",
        "es": "Lealtad",
        "fr": "Allégeance",
        "pt": "Lealdade"
    },
    "Am star": {
        "de": "Am-Stern",
        "es": "Estrella Am",
        "fr": "Étoile Am",
        "pt": "Estrela Am"
    },
    "Amber": {
        "de": "Gelb",
        "es": "Ámbar",
        "fr": "Ambre",
        "pt": "Âmbar"
    },
    "Anomaly": {
        "de": "Anomalie",
        "es": "Anomalía",
        "fr": "Anomalie",
        "pt": "Anomalia"
    },
    "Ap star": {
        "de": "Ap-Stern",
        "es": "Estrella Ap",
        "fr": "Étoile Ap",
        "pt": "Estrela Ap"
    },
    "Architecture": {
        "de": "Architektur",
        "es": "Arquitectura",
        "fr": "Architecture",
        "pt": "Arquitetura"
    },
    "Arg. of periapsis": {
        "de": "Arg. der Periapsis",
        "es": "Arg. del periastro",
        "fr": "Arg. du périastre",
        "pt": "Arg. do periastro"
    },
    "Arid": {
        "de": "Trocken",
        "es": "Árido",
        "fr": "Aride",
        "pt": "Árido"
    },
    "Armed conflict": {
        "de": "Bewaffneter Konflikt",
        "es": "Conflicto armado",
        "fr": "Conflit armé",
        "pt": "Conflito armado"
    },
    "Army": {
        "de": "Heer",
        "es": "Ejército",
        "fr": "Armée de terre",
        "pt": "Exército"
    },
    "Asteroid belt": {
        "de": "Asteroidengürtel",
        "es": "Cinturón de asteroides",
        "fr": "Ceinture d’astéroïdes",
        "pt": "Cinturão de asteroides"
    },
    "Asteroid belts": {
        "de": "Asteroidengürtel",
        "es": "Cinturones de asteroides",
        "fr": "Ceintures d’astéroïdes",
        "pt": "Cinturões de asteroides"
    },
    "At": {
        "de": "Bei",
        "es": "En",
        "fr": "À",
        "pt": "Em"
    },
    "At peace": {
        "de": "Friedlich",
        "es": "En paz",
        "fr": "En paix",
        "pt": "Em paz"
    },
    "Atmosphere": {
        "de": "Atmosphäre",
        "es": "Atmósfera",
        "fr": "Atmosphère",
        "pt": "Atmosfera"
    },
    "Automatic": {
        "de": "Automatisch",
        "es": "Automático",
        "fr": "Automatique",
        "pt": "Automático"
    },
    "Automatic choices follow each place's climate, terrain and technology. A settlement can set its own in its editor.": {
        "de": "Automatisch folgt Klima, Gelände und Technologie jedes Ortes. Eine Siedlung kann es in ihrem Editor selbst festlegen.",
        "es": "Las opciones automáticas siguen el clima, el terreno y la tecnología de cada lugar. Un asentamiento puede definir las suyas en su editor.",
        "fr": "Les choix automatiques suivent le climat, le terrain et la technologie de chaque lieu. Une localité peut définir les siens dans son éditeur.",
        "pt": "As escolhas automáticas seguem o clima, o terreno e a tecnologia de cada lugar. Um assentamento pode definir as suas no próprio editor."
    },
    "Average": {
        "de": "Mittel",
        "es": "Media",
        "fr": "Moyenne",
        "pt": "Média"
    },
    "Axial tilt": {
        "de": "Achsneigung",
        "es": "Inclinación axial",
        "fr": "Inclinaison axiale",
        "pt": "Inclinação axial"
    },
    "Balanced": {
        "de": "Ausgewogen",
        "es": "Equilibrado",
        "fr": "Équilibré",
        "pt": "Equilibrado"
    },
    "Base": {
        "de": "Basis",
        "es": "Base",
        "fr": "Base",
        "pt": "Base"
    },
    "Bases": {
        "de": "Basen",
        "es": "Bases",
        "fr": "Bases",
        "pt": "Bases"
    },
    "Be star": {
        "de": "Be-Stern",
        "es": "Estrella Be",
        "fr": "Étoile Be",
        "pt": "Estrela Be"
    },
    "Belt": {
        "de": "Gürtel",
        "es": "Cinturón",
        "fr": "Ceinture",
        "pt": "Cinturão"
    },
    "Bio zone": {
        "de": "Biozone",
        "es": "Zona habitable",
        "fr": "Zone de vie",
        "pt": "Zona bio"
    },
    "Black hole": {
        "de": "Schwarzes Loch",
        "es": "Agujero negro",
        "fr": "Trou noir",
        "pt": "Buraco negro"
    },
    "Blue straggler": {
        "de": "Blauer Nachzügler",
        "es": "Rezagada azul",
        "fr": "Traînarde bleue",
        "pt": "Retardatária azul"
    },
    "Blue supergiant": {
        "de": "Blauer Überriese",
        "es": "Supergigante azul",
        "fr": "Supergéante bleue",
        "pt": "Supergigante azul"
    },
    "Bp star": {
        "de": "Bp-Stern",
        "es": "Estrella Bp",
        "fr": "Étoile Bp",
        "pt": "Estrela Bp"
    },
    "Breathable": {
        "de": "Atembar",
        "es": "Respirable",
        "fr": "Respirable",
        "pt": "Respirável"
    },
    "Bright giant": {
        "de": "Heller Riese",
        "es": "Gigante luminosa",
        "fr": "Géante lumineuse",
        "pt": "Gigante brilhante"
    },
    "Buildings": {
        "de": "Gebäude",
        "es": "Edificios",
        "fr": "Bâtiments",
        "pt": "Edifícios"
    },
    "Buildings %@  ·  Roads %@ km  ·  Parks %@  ·  Bridges %@  ·  Trees %@": {
        "de": "Gebäude %@  ·  Straßen %@ km  ·  Parks %@  ·  Brücken %@  ·  Bäume %@",
        "es": "Edificios %@  ·  Calles %@ km  ·  Parques %@  ·  Puentes %@  ·  Árboles %@",
        "fr": "Bâtiments %@  ·  Routes %@ km  ·  Parcs %@  ·  Ponts %@  ·  Arbres %@",
        "pt": "Edifícios %@  ·  Ruas %@ km  ·  Parques %@  ·  Pontes %@  ·  Árvores %@"
    },
    "Calm": {
        "de": "Windstill",
        "es": "En calma",
        "fr": "Calme",
        "pt": "Calmaria"
    },
    "Canyon": {
        "de": "Schlucht",
        "es": "Cañón",
        "fr": "Canyon",
        "pt": "Cânion"
    },
    "Capital": {
        "de": "Hauptstadt",
        "es": "Capital",
        "fr": "Capitale",
        "pt": "Capital"
    },
    "Carbon Wolf–Rayet star": {
        "de": "Kohlenstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de carbono",
        "fr": "Étoile Wolf–Rayet carbonée",
        "pt": "Estrela Wolf–Rayet de carbono"
    },
    "Carbon dioxide": {
        "de": "Kohlendioxid",
        "es": "Dióxido de carbono",
        "fr": "Dioxyde de carbone",
        "pt": "Dióxido de carbono"
    },
    "Carbon dioxide, sulfuric clouds": {
        "de": "Kohlendioxid, Schwefelwolken",
        "es": "Dióxido de carbono, nubes sulfúricas",
        "fr": "Dioxyde de carbone, nuages sulfuriques",
        "pt": "Dióxido de carbono, nuvens sulfúricas"
    },
    "Carbon star": {
        "de": "Kohlenstoffstern",
        "es": "Estrella de carbono",
        "fr": "Étoile carbonée",
        "pt": "Estrela de carbono"
    },
    "Carbon white dwarf": {
        "de": "Kohlenstoff-Weißer Zwerg",
        "es": "Enana blanca de carbono",
        "fr": "Naine blanche à carbone",
        "pt": "Anã branca de carbono"
    },
    "Carbon-13 star": {
        "de": "Kohlenstoff-13-Stern",
        "es": "Estrella de carbono 13",
        "fr": "Étoile au carbone 13",
        "pt": "Estrela de carbono-13"
    },
    "Cave": {
        "de": "Höhle",
        "es": "Cueva",
        "fr": "Grotte",
        "pt": "Caverna"
    },
    "Centre the view on this system": {
        "de": "Ansicht auf dieses System zentrieren",
        "es": "Centra la vista en este sistema",
        "fr": "Centrer la vue sur ce système",
        "pt": "Centralizar a vista neste sistema"
    },
    "Cepheid variable": {
        "de": "Cepheiden-Veränderlicher",
        "es": "Variable cefeida",
        "fr": "Céphéide",
        "pt": "Variável cefeida"
    },
    "Changed": {
        "de": "Geändert",
        "es": "Cambiado",
        "fr": "Modifié",
        "pt": "Alterados"
    },
    "Changes to %@": {
        "de": "Änderungen an %@",
        "es": "Cambios en %@",
        "fr": "Modifications de %@",
        "pt": "Alterações em %@"
    },
    "Chartered company": {
        "de": "Konzessionierte Gesellschaft",
        "es": "Compañía con carta",
        "fr": "Compagnie à charte",
        "pt": "Companhia concessionária"
    },
    "Chiefdom": {
        "de": "Häuptlingstum",
        "es": "Jefatura",
        "fr": "Chefferie",
        "pt": "Chefatura"
    },
    "Choose a map": {
        "de": "Wähle eine Karte",
        "es": "Elige un mapa",
        "fr": "Choisissez une carte",
        "pt": "Escolha um mapa"
    },
    "Choose one or more sectors.": {
        "de": "Wähle einen oder mehrere Sektoren.",
        "es": "Elige uno o más sectores.",
        "fr": "Choisissez un ou plusieurs secteurs.",
        "pt": "Escolha um ou mais setores."
    },
    "City": {
        "de": "Stadt",
        "es": "Ciudad",
        "fr": "Ville",
        "pt": "Cidade"
    },
    "City map": {
        "de": "Stadtkarte",
        "es": "Mapa de la ciudad",
        "fr": "Plan de ville",
        "pt": "Mapa da cidade"
    },
    "Civilians may not own weapons": {
        "de": "Zivilisten dürfen keine Waffen besitzen",
        "es": "Los civiles no pueden poseer armas",
        "fr": "Les civils ne peuvent pas posséder d’armes",
        "pt": "Civis não podem possuir armas"
    },
    "Class": {
        "de": "Klasse",
        "es": "Clase",
        "fr": "Classe",
        "pt": "Classe"
    },
    "Classic": {
        "de": "Klassisch",
        "es": "Clásico",
        "fr": "Classique",
        "pt": "Clássico"
    },
    "Clear route": {
        "de": "Route löschen",
        "es": "Borrar ruta",
        "fr": "Effacer l’itinéraire",
        "pt": "Limpar rota"
    },
    "Click the map to mark a city, town or other place there": {
        "de": "Klicke auf die Karte, um dort eine Stadt, einen Ort oder etwas anderes zu markieren",
        "es": "Haz clic en el mapa para marcar allí una ciudad, un pueblo u otro lugar",
        "fr": "Cliquez sur la carte pour y marquer une ville, un village ou un autre lieu",
        "pt": "Clique no mapa para marcar ali uma cidade, vila ou outro lugar"
    },
    "Click the map to place a city, town or other place": {
        "de": "Klicke auf die Karte, um eine Stadt, einen Ort oder etwas anderes zu platzieren",
        "es": "Haz clic en el mapa para colocar una ciudad, un pueblo u otro lugar",
        "fr": "Cliquez sur la carte pour placer une ville, un village ou un autre lieu",
        "pt": "Clique no mapa para colocar uma cidade, vila ou outro lugar"
    },
    "Climate & biomes": {
        "de": "Klima & Biome",
        "es": "Clima y biomas",
        "fr": "Climat et biomes",
        "pt": "Clima e biomas"
    },
    "Climate & biomes gives worlds with seas oceans, lakes, rivers and biomes from their temperature and moisture. Polygon map builds them after Amit Patel's polygonal map generation: land rising from the coast to the mountains, rivers running down to the sea, and biomes from height, latitude and nearness to fresh water. Applies to planetary systems opened afterwards.": {
        "de": "„Klima & Biome“ erzeugt Welten mit Meeren, Ozeanen, Seen, Flüssen und Biomen aus Temperatur und Feuchtigkeit. „Polygonkarte“ baut sie nach Amit Patels polygonaler Kartenerzeugung: Land, das von der Küste zu den Bergen ansteigt, Flüsse, die zum Meer hinabfließen, und Biome nach Höhe, Breite und Nähe zu Süßwasser. Gilt für danach geöffnete Planetensysteme.",
        "es": "Clima y biomas da a los mundos con mares océanos, lagos, ríos y biomas según su temperatura y humedad. Mapa poligonal los construye según la generación de mapas poligonales de Amit Patel: tierra que asciende de la costa a las montañas, ríos que bajan hasta el mar y biomas según la altura, la latitud y la cercanía al agua dulce. Se aplica a los sistemas planetarios que se abran después.",
        "fr": "Climat et biomes donne aux mondes des mers, océans, lacs, rivières et biomes selon leur température et leur humidité. Carte polygonale les construit d’après la génération de cartes polygonales d’Amit Patel : terres s’élevant de la côte jusqu’aux montagnes, rivières descendant vers la mer, et biomes selon l’altitude, la latitude et la proximité de l’eau douce. S’applique aux systèmes planétaires ouverts ensuite.",
        "pt": "Clima e biomas gera mundos com mares, oceanos, lagos, rios e biomas a partir da temperatura e da umidade. Mapa poligonal os constrói segundo a geração de mapas poligonais de Amit Patel: terra subindo do litoral às montanhas, rios descendo até o mar e biomas a partir da altitude, da latitude e da proximidade de água doce. Vale para os sistemas planetários abertos depois."
    },
    "Closed autocracy": {
        "de": "Geschlossene Autokratie",
        "es": "Autocracia cerrada",
        "fr": "Autocratie fermée",
        "pt": "Autocracia fechada"
    },
    "Cloud cover": {
        "de": "Bewölkung",
        "es": "Nubosidad",
        "fr": "Couverture nuageuse",
        "pt": "Cobertura de nuvens"
    },
    "Cloud layers over the globes of planets with atmospheres": {
        "de": "Wolkenschichten über den Globen von Planeten mit Atmosphäre",
        "es": "Capas de nubes sobre los globos de los planetas con atmósfera",
        "fr": "Couches nuageuses au-dessus des globes des planètes dotées d’une atmosphère",
        "pt": "Camadas de nuvens sobre os globos dos planetas com atmosfera"
    },
    "Cold": {
        "de": "Kalt",
        "es": "Frío",
        "fr": "Froid",
        "pt": "Frio"
    },
    "Confederal": {
        "de": "Konföderal",
        "es": "Confederal",
        "fr": "Confédéral",
        "pt": "Confederal"
    },
    "Constitutional monarchy": {
        "de": "Konstitutionelle Monarchie",
        "es": "Monarquía constitucional",
        "fr": "Monarchie constitutionnelle",
        "pt": "Monarquia constitucional"
    },
    "Continue route": {
        "de": "Route fortsetzen",
        "es": "Continuar ruta",
        "fr": "Poursuivre l’itinéraire",
        "pt": "Continuar rota"
    },
    "Copied": {
        "de": "Kopiert",
        "es": "Copiado",
        "fr": "Copié",
        "pt": "Copiado"
    },
    "Copy": {
        "de": "Kopieren",
        "es": "Copiar",
        "fr": "Copier",
        "pt": "Copiar"
    },
    "Copy all of this information to the clipboard as text": {
        "de": "Alle diese Angaben als Text in die Zwischenablage kopieren",
        "es": "Copia toda esta información al portapapeles como texto",
        "fr": "Copier toutes ces informations dans le presse-papiers sous forme de texte",
        "pt": "Copiar todas estas informações para a área de transferência como texto"
    },
    "Couldn't create the universe: %@": {
        "de": "Universum konnte nicht erstellt werden: %@",
        "es": "No se ha podido crear el universo: %@",
        "fr": "Impossible de créer l’univers : %@",
        "pt": "Não foi possível criar o universo: %@"
    },
    "Couldn't export the city map": {
        "de": "Stadtkarte konnte nicht exportiert werden",
        "es": "No se ha podido exportar el mapa de la ciudad",
        "fr": "Impossible d’exporter le plan de ville",
        "pt": "Não foi possível exportar o mapa da cidade"
    },
    "Couldn't export the globe": {
        "de": "Globus konnte nicht exportiert werden",
        "es": "No se ha podido exportar el globo",
        "fr": "Impossible d’exporter le globe",
        "pt": "Não foi possível exportar o globo"
    },
    "Couldn't export the map": {
        "de": "Karte konnte nicht exportiert werden",
        "es": "No se ha podido exportar el mapa",
        "fr": "Impossible d’exporter la carte",
        "pt": "Não foi possível exportar o mapa"
    },
    "Couldn't export the universe": {
        "de": "Universum konnte nicht exportiert werden",
        "es": "No se ha podido exportar el universo",
        "fr": "Impossible d’exporter l’univers",
        "pt": "Não foi possível exportar o universo"
    },
    "Couldn't place settlements": {
        "de": "Siedlungen konnten nicht platziert werden",
        "es": "No se han podido colocar los asentamientos",
        "fr": "Impossible de placer les localités",
        "pt": "Não foi possível posicionar os assentamentos"
    },
    "Couldn't reach TravellerMap": {
        "de": "TravellerMap nicht erreichbar",
        "es": "No se ha podido conectar con TravellerMap",
        "fr": "Impossible de joindre TravellerMap",
        "pt": "Não foi possível acessar o TravellerMap"
    },
    "Couldn't update the universe: %@": {
        "de": "Universum konnte nicht aktualisiert werden: %@",
        "es": "No se ha podido actualizar el universo: %@",
        "fr": "Impossible de mettre à jour l’univers : %@",
        "pt": "Não foi possível atualizar o universo: %@"
    },
    "Crater": {
        "de": "Krater",
        "es": "Cráter",
        "fr": "Cratère",
        "pt": "Cratera"
    },
    "Customs, repair yards, routes across the system": {
        "de": "Zoll, Reparaturwerften, Verbindungen im ganzen System",
        "es": "Aduanas, talleres de reparación, rutas por todo el sistema",
        "fr": "Douanes, chantiers de réparation, lignes dans tout le système",
        "pt": "Alfândega, estaleiros de reparo, rotas por todo o sistema"
    },
    "Cyclone": {
        "de": "Zyklon",
        "es": "Ciclón",
        "fr": "Cyclone",
        "pt": "Ciclone"
    },
    "Dark nebula": {
        "de": "Dunkelwolke",
        "es": "Nebulosa oscura",
        "fr": "Nébuleuse obscure",
        "pt": "Nebulosa escura"
    },
    "Data Versions": {
        "de": "Datenversionen",
        "es": "Versiones de datos",
        "fr": "Versions des données",
        "pt": "Versões dos Dados"
    },
    "Data Versions…": {
        "de": "Datenversionen …",
        "es": "Versiones de datos…",
        "fr": "Versions des données…",
        "pt": "Versões dos Dados…"
    },
    "Data © TravellerMap.com": {
        "de": "Daten © TravellerMap.com",
        "es": "Datos © TravellerMap.com",
        "fr": "Données © TravellerMap.com",
        "pt": "Dados © TravellerMap.com"
    },
    "Dawn or dusk": {
        "de": "Morgen- oder Abenddämmerung",
        "es": "Amanecer o atardecer",
        "fr": "Aube ou crépuscule",
        "pt": "Alvorada ou crepúsculo"
    },
    "Day": {
        "de": "Tag",
        "es": "Día",
        "fr": "Jour",
        "pt": "Dia"
    },
    "Delete Note": {
        "de": "Notiz löschen",
        "es": "Eliminar nota",
        "fr": "Supprimer la note",
        "pt": "Apagar Nota"
    },
    "Delete Place": {
        "de": "Ort löschen",
        "es": "Eliminar lugar",
        "fr": "Supprimer le lieu",
        "pt": "Apagar Lugar"
    },
    "Desert": {
        "de": "Wüste",
        "es": "Desierto",
        "fr": "Désert",
        "pt": "Deserto"
    },
    "Designation": {
        "de": "Bezeichnung",
        "es": "Designación",
        "fr": "Désignation",
        "pt": "Designação"
    },
    "Details changed": {
        "de": "Details geändert",
        "es": "Detalles cambiados",
        "fr": "Détails modifiés",
        "pt": "Detalhes alterados"
    },
    "Digital networks, satellites, crewed orbital flight": {
        "de": "Digitale Netze, Satelliten, bemannte Orbitalflüge",
        "es": "Redes digitales, satélites, vuelos orbitales tripulados",
        "fr": "Réseaux numériques, satellites, vols orbitaux habités",
        "pt": "Redes digitais, satélites, voo orbital tripulado"
    },
    "Dismiss": {
        "de": "Schließen",
        "es": "Descartar",
        "fr": "Ignorer",
        "pt": "Dispensar"
    },
    "Distance from star": {
        "de": "Abstand zum Stern",
        "es": "Distancia a la estrella",
        "fr": "Distance à l’étoile",
        "pt": "Distância da estrela"
    },
    "Double-click to set the year": {
        "de": "Doppelklicken, um das Jahr festzulegen",
        "es": "Haz doble clic para fijar el año",
        "fr": "Double-cliquez pour définir l’année",
        "pt": "Clique duas vezes para definir o ano"
    },
    "Downloaded “%@”.": {
        "de": "„%@“ wurde geladen.",
        "es": "Se descargó “%@”.",
        "fr": "« %@ » téléchargé.",
        "pt": "“%@” baixado."
    },
    "Drag to orbit; shift-drag to pan; scroll or pinch to zoom": {
        "de": "Ziehen zum Kreisen; mit Umschalttaste ziehen zum Verschieben; scrollen oder auf-/zuziehen zum Zoomen",
        "es": "Arrastra para orbitar; arrastra con Mayús para desplazar; desplázate o pellizca para hacer zoom",
        "fr": "Faites glisser pour tourner ; Maj-glisser pour vous déplacer ; faites défiler ou pincez pour zoomer",
        "pt": "Arraste para orbitar; shift-arraste para mover; role ou use pinça para zoom"
    },
    "Draw moons like planets": {
        "de": "Monde wie Planeten zeichnen",
        "es": "Dibujar lunas como planetas",
        "fr": "Dessiner les lunes comme des planètes",
        "pt": "Desenhar luas como planetas"
    },
    "Draw precipitation radar or temperature over the globe, kept up to date as time runs": {
        "de": "Niederschlagsradar oder Temperatur über dem Globus zeichnen, laufend aktualisiert",
        "es": "Dibuja el radar de precipitación o la temperatura sobre el globo, actualizados a medida que pasa el tiempo",
        "fr": "Afficher le radar de précipitations ou la température sur le globe, mis à jour à mesure que le temps s’écoule",
        "pt": "Desenhar radar de precipitação ou temperatura sobre o globo, atualizado conforme o tempo passa"
    },
    "Draw the Imperium's express boat routes on the chart, and other states' communication routes dashed": {
        "de": "Die Expressboot-Routen des Imperiums auf der Karte zeichnen und die Kommunikationsrouten anderer Staaten gestrichelt",
        "es": "Dibuja en la carta las rutas de los botes exprés del Imperio, y con trazos discontinuos las rutas de comunicación de otros estados",
        "fr": "Dessiner sur la carte les routes des express boats de l’Imperium, et en pointillés les routes de communication des autres États",
        "pt": "Desenhar no mapa as rotas dos barcos expressos do Imperium, e as rotas de comunicação de outros estados tracejadas"
    },
    "Draw the path each planet, moon and companion star follows round its orbit, and the green habitable zones": {
        "de": "Die Bahn jedes Planeten, Mondes und Begleitsterns zeichnen sowie die grünen habitablen Zonen",
        "es": "Dibuja la trayectoria que sigue cada planeta, luna y estrella compañera en su órbita, y las zonas habitables verdes",
        "fr": "Dessiner la trajectoire de chaque planète, lune et étoile compagnon sur son orbite, et les zones habitables en vert",
        "pt": "Desenhar o caminho que cada planeta, lua e estrela companheira percorre em sua órbita, e as zonas habitáveis verdes"
    },
    "Draw the rings the stars of multiple systems follow round each other": {
        "de": "Die Bahnen zeichnen, auf denen die Sterne von Mehrfachsystemen einander umkreisen",
        "es": "Dibuja los anillos que siguen las estrellas de los sistemas múltiples alrededor unas de otras",
        "fr": "Dessiner les anneaux que suivent les étoiles des systèmes multiples les unes autour des autres",
        "pt": "Desenhar os anéis que as estrelas de sistemas múltiplos percorrem umas em torno das outras"
    },
    "Draw the star field's nebulae: star-forming clouds, dark clouds, dust lit by nearby stars, and the shells and wrecks of dying stars": {
        "de": "Die Nebel des Sternfelds zeichnen: Sternentstehungswolken, Dunkelwolken, von nahen Sternen beleuchteter Staub und die Hüllen und Trümmer sterbender Sterne",
        "es": "Dibuja las nebulosas del campo estelar: nubes de formación estelar, nubes oscuras, polvo iluminado por estrellas cercanas y las envolturas y restos de estrellas moribundas",
        "fr": "Dessiner les nébuleuses du champ d’étoiles : nuages de formation d’étoiles, nuages sombres, poussière éclairée par des étoiles proches, et coquilles et vestiges d’étoiles mourantes",
        "pt": "Desenhar as nebulosas do campo estelar: nuvens formadoras de estrelas, nuvens escuras, poeira iluminada por estrelas próximas e as cascas e destroços de estrelas moribundas"
    },
    "Draw the stars at twice their size, so they're easier to see": {
        "de": "Sterne doppelt so groß zeichnen, damit sie leichter zu sehen sind",
        "es": "Dibuja las estrellas al doble de su tamaño para que se vean mejor",
        "fr": "Dessiner les étoiles à deux fois leur taille, pour mieux les voir",
        "pt": "Desenhar as estrelas com o dobro do tamanho, para vê-las melhor"
    },
    "Dust lit blue by the light of a nearby star": {
        "de": "Staub, blau beleuchtet vom Licht eines nahen Sterns",
        "es": "Polvo iluminado de azul por la luz de una estrella cercana",
        "fr": "Poussière éclairée en bleu par la lumière d’une étoile proche",
        "pt": "Poeira iluminada de azul pela luz de uma estrela próxima"
    },
    "E": {
        "de": "O",
        "es": "E",
        "fr": "E",
        "pt": "L"
    },
    "Each version of TravellerMap's data the universe has fetched. Using another redoes only the systems of the worlds it differs in.": {
        "de": "Jede Version der TravellerMap-Daten, die das Universum geladen hat. Eine andere zu nutzen erzeugt nur die Systeme der Welten neu, in denen sie sich unterscheidet.",
        "es": "Cada versión de los datos de TravellerMap que ha descargado el universo. Usar otra rehace solo los sistemas de los mundos en que difiere.",
        "fr": "Chaque version des données de TravellerMap récupérée par l’univers. En utiliser une autre ne refait que les systèmes des mondes qui diffèrent.",
        "pt": "Cada versão dos dados do TravellerMap que o universo baixou. Usar outra refaz só os sistemas dos mundos em que ela difere."
    },
    "Early carbon star": {
        "de": "Früher Kohlenstoffstern",
        "es": "Estrella de carbono temprana",
        "fr": "Étoile carbonée précoce",
        "pt": "Estrela de carbono precoce"
    },
    "Eccentric": {
        "de": "Exzentrisch",
        "es": "Excéntrico",
        "fr": "Excentrique",
        "pt": "Excêntrica"
    },
    "Eccentricity": {
        "de": "Exzentrizität",
        "es": "Excentricidad",
        "fr": "Excentricité",
        "pt": "Excentricidade"
    },
    "Eclectic": {
        "de": "Eklektisch",
        "es": "Ecléctico",
        "fr": "Éclectique",
        "pt": "Eclético"
    },
    "Edit": {
        "de": "Bearbeiten",
        "es": "Editar",
        "fr": "Modifier",
        "pt": "Editar"
    },
    "Edit world data": {
        "de": "Weltdaten bearbeiten",
        "es": "Editar datos del mundo",
        "fr": "Modifier les données du monde",
        "pt": "Editar dados do mundo"
    },
    "Electoral autocracy": {
        "de": "Wahlautokratie",
        "es": "Autocracia electoral",
        "fr": "Autocratie électorale",
        "pt": "Autocracia eleitoral"
    },
    "Electoral democracy": {
        "de": "Wahldemokratie",
        "es": "Democracia electoral",
        "fr": "Démocratie électorale",
        "pt": "Democracia eleitoral"
    },
    "Electricity, radio, motor vehicles, flight": {
        "de": "Elektrizität, Funk, Kraftfahrzeuge, Luftfahrt",
        "es": "Electricidad, radio, vehículos a motor, aviación",
        "fr": "Électricité, radio, véhicules à moteur, aviation",
        "pt": "Eletricidade, rádio, veículos motorizados, aviação"
    },
    "Emission nebula": {
        "de": "Emissionsnebel",
        "es": "Nebulosa de emisión",
        "fr": "Nébuleuse en émission",
        "pt": "Nebulosa de emissão"
    },
    "End route": {
        "de": "Route beenden",
        "es": "Terminar ruta",
        "fr": "Terminer l’itinéraire",
        "pt": "Encerrar rota"
    },
    "Endless day": {
        "de": "Ewiger Tag",
        "es": "Día perpetuo",
        "fr": "Jour sans fin",
        "pt": "Dia sem fim"
    },
    "Endless night": {
        "de": "Ewige Nacht",
        "es": "Noche perpetua",
        "fr": "Nuit sans fin",
        "pt": "Noite sem fim"
    },
    "Enlarge stars 200%": {
        "de": "Sterne 200 % vergrößern",
        "es": "Agrandar estrellas 200%",
        "fr": "Agrandir les étoiles à 200 %",
        "pt": "Ampliar estrelas 200%"
    },
    "Environment": {
        "de": "Umwelt",
        "es": "Entorno",
        "fr": "Environnement",
        "pt": "Ambiente"
    },
    "Essential only": {
        "de": "Nur notwendige",
        "es": "Solo esenciales",
        "fr": "Essentiels uniquement",
        "pt": "Só essenciais"
    },
    "Estrelas": {
        "de": "Estrelas",
        "es": "Estrelas",
        "fr": "Estrelas",
        "pt": "Estrelas"
    },
    "Event horizon": {
        "de": "Ereignishorizont",
        "es": "Horizonte de sucesos",
        "fr": "Horizon des événements",
        "pt": "Horizonte de eventos"
    },
    "Export": {
        "de": "Exportieren",
        "es": "Exportar",
        "fr": "Exporter",
        "pt": "Exportar"
    },
    "Export a top-down map of the city as an image or PDF": {
        "de": "Eine Draufsicht der Stadt als Bild oder PDF exportieren",
        "es": "Exporta un mapa cenital de la ciudad como imagen o PDF",
        "fr": "Exporter un plan vu du dessus de la ville en image ou en PDF",
        "pt": "Exportar um mapa visto de cima da cidade como imagem ou PDF"
    },
    "Export for Players…": {
        "de": "Für Spieler exportieren …",
        "es": "Exportar para jugadores…",
        "fr": "Exporter pour les joueurs…",
        "pt": "Exportar para Jogadores…"
    },
    "Export map": {
        "de": "Karte exportieren",
        "es": "Exportar mapa",
        "fr": "Exporter le plan",
        "pt": "Exportar mapa"
    },
    "Export the map, with its grid and places, as an image or PDF": {
        "de": "Die Karte mit Gitter und Orten als Bild oder PDF exportieren",
        "es": "Exporta el mapa, con su cuadrícula y lugares, como imagen o PDF",
        "fr": "Exporter la carte, avec sa grille et ses lieux, en image ou en PDF",
        "pt": "Exportar o mapa, com sua grade e lugares, como imagem ou PDF"
    },
    "Exported “%@” for players.": {
        "de": "„%@“ für Spieler exportiert.",
        "es": "Se exportó “%@” para los jugadores.",
        "fr": "« %@ » exporté pour les joueurs.",
        "pt": "“%@” exportado para jogadores."
    },
    "Exporting…": {
        "de": "Wird exportiert …",
        "es": "Exportando…",
        "fr": "Exportation…",
        "pt": "Exportando…"
    },
    "Featureless white dwarf": {
        "de": "Merkmalsloser Weißer Zwerg",
        "es": "Enana blanca sin líneas",
        "fr": "Naine blanche sans raies",
        "pt": "Anã branca sem linhas espectrais"
    },
    "Federal": {
        "de": "Föderal",
        "es": "Federal",
        "fr": "Fédéral",
        "pt": "Federal"
    },
    "Fetched %@. Taking the new version redoes only the systems of the worlds whose data changed; everything else stays as it is.": {
        "de": "Geladen am %@. Die neue Version erzeugt nur die Systeme der Welten neu, deren Daten sich geändert haben; alles andere bleibt, wie es ist.",
        "es": "Descargado el %@. Adoptar la nueva versión rehace solo los sistemas de los mundos cuyos datos cambiaron; todo lo demás queda igual.",
        "fr": "Récupéré le %@. Adopter la nouvelle version ne refait que les systèmes des mondes dont les données ont changé ; tout le reste demeure tel quel.",
        "pt": "Baixado em %@. Adotar a nova versão refaz só os sistemas dos mundos cujos dados mudaram; todo o resto fica como está."
    },
    "Fetching %@…": {
        "de": "%@ wird geladen …",
        "es": "Descargando %@…",
        "fr": "Récupération de %@…",
        "pt": "Baixando %@…"
    },
    "Field": {
        "de": "Feld",
        "es": "Campo",
        "fr": "Terrain",
        "pt": "Campo"
    },
    "File ▸ Switch Map Type… brings you back here.": {
        "de": "„Ablage“ ▸ „Kartentyp wechseln …“ bringt dich hierher zurück.",
        "es": "Archivo ▸ Cambiar tipo de mapa… te trae de vuelta aquí.",
        "fr": "Fichier ▸ Changer de type de carte… vous ramène ici.",
        "pt": "Arquivo ▸ Mudar Tipo de Mapa… traz você de volta aqui."
    },
    "Filters": {
        "de": "Filter",
        "es": "Filtros",
        "fr": "Filtres",
        "pt": "Filtros"
    },
    "Finance": {
        "de": "Finanzen",
        "es": "Finanzas",
        "fr": "Finance",
        "pt": "Finanças"
    },
    "Firearms need a licence and registration": {
        "de": "Schusswaffen brauchen Waffenschein und Registrierung",
        "es": "Las armas de fuego requieren licencia y registro",
        "fr": "Les armes à feu exigent un permis et un enregistrement",
        "pt": "Armas de fogo exigem licença e registro"
    },
    "Fishing and shipping": {
        "de": "Fischerei und Schifffahrt",
        "es": "Pesca y transporte marítimo",
        "fr": "Pêche et transport maritime",
        "pt": "Pesca e navegação"
    },
    "Flare star": {
        "de": "Flare-Stern",
        "es": "Estrella fulgurante",
        "fr": "Étoile à éruptions",
        "pt": "Estrela fulgurante"
    },
    "Flat roofs, thick pale walls, shaded courtyards and narrow lanes": {
        "de": "Flachdächer, dicke helle Mauern, schattige Innenhöfe und enge Gassen",
        "es": "Tejados planos, gruesos muros claros, patios sombreados y callejuelas estrechas",
        "fr": "Toits plats, murs épais et clairs, cours ombragées et ruelles étroites",
        "pt": "Telhados planos, paredes grossas e claras, pátios sombreados e vielas estreitas"
    },
    "Fly to %@": {
        "de": "Zu %@ fliegen",
        "es": "Volar a %@",
        "fr": "Voler vers %@",
        "pt": "Voar até %@"
    },
    "Forest": {
        "de": "Wald",
        "es": "Bosque",
        "fr": "Forêt",
        "pt": "Floresta"
    },
    "Forget the port and installations set here, and go back to the generated ones": {
        "de": "Hier gesetzten Hafen und Einrichtungen verwerfen und zu den generierten zurückkehren",
        "es": "Olvida el puerto y las instalaciones definidos aquí y vuelve a los generados",
        "fr": "Oublier le port et les installations définis ici, et revenir aux valeurs générées",
        "pt": "Esquecer o porto e as instalações definidos aqui e voltar aos gerados"
    },
    "Forget the world data set here, and go back to the generated values": {
        "de": "Hier gesetzte Weltdaten verwerfen und zu den generierten Werten zurückkehren",
        "es": "Olvida los datos del mundo definidos aquí y vuelve a los valores generados",
        "fr": "Oublier les données du monde définies ici, et revenir aux valeurs générées",
        "pt": "Esquecer os dados do mundo definidos aqui e voltar aos valores gerados"
    },
    "From the climate, fading as technology lets builders build alike anywhere": {
        "de": "Nach dem Klima, abnehmend, je mehr die Technik überall gleiches Bauen erlaubt",
        "es": "Según el clima, cada vez menos a medida que la tecnología permite construir igual en cualquier lugar",
        "fr": "Selon le climat, s’estompant à mesure que la technologie permet de bâtir partout de la même façon",
        "pt": "Pelo clima, esmaecendo à medida que a tecnologia permite construir igual em qualquer lugar"
    },
    "From your GM, %@": {
        "de": "Von deinem SL, %@",
        "es": "De tu DJ, %@",
        "fr": "De votre MJ, %@",
        "pt": "Do seu mestre, %@"
    },
    "Frozen": {
        "de": "Gefroren",
        "es": "Helado",
        "fr": "Glacé",
        "pt": "Congelado"
    },
    "Fuel, maintenance, a few scheduled routes": {
        "de": "Treibstoff, Wartung, einige Linienverbindungen",
        "es": "Combustible, mantenimiento, algunas rutas regulares",
        "fr": "Carburant, entretien, quelques lignes régulières",
        "pt": "Combustível, manutenção, algumas rotas regulares"
    },
    "Fusion power, routine travel between planets": {
        "de": "Fusionskraft, regelmäßige Reisen zwischen Planeten",
        "es": "Energía de fusión, viajes rutinarios entre planetas",
        "fr": "Énergie de fusion, voyages interplanétaires courants",
        "pt": "Energia de fusão, viagens rotineiras entre planetas"
    },
    "GM only": {
        "de": "Nur SL",
        "es": "Solo DJ",
        "fr": "MJ uniquement",
        "pt": "Só o mestre"
    },
    "Gas giant": {
        "de": "Gasriese",
        "es": "Gigante gaseoso",
        "fr": "Géante gazeuse",
        "pt": "Gigante gasoso"
    },
    "Gas giants": {
        "de": "Gasriesen",
        "es": "Gigantes gaseosos",
        "fr": "Géantes gazeuses",
        "pt": "Gigantes gasosos"
    },
    "Generate a random name": {
        "de": "Zufälligen Namen erzeugen",
        "es": "Generar un nombre aleatorio",
        "fr": "Générer un nom aléatoire",
        "pt": "Gerar um nome aleatório"
    },
    "Generating star systems…": {
        "de": "Sternsysteme werden erzeugt …",
        "es": "Generando sistemas estelares…",
        "fr": "Génération des systèmes stellaires…",
        "pt": "Gerando sistemas estelares…"
    },
    "Giant": {
        "de": "Riese",
        "es": "Gigante",
        "fr": "Géante",
        "pt": "Gigante"
    },
    "Gives every rocky and icy moon a surface generated the way a planet's is, with its own globe, clouds, weather and surface map, rather than one of a few shared moon textures. Gas giants' large moons are always drawn this way. Small moons get a coarser globe until you zoom to them. Applies to planetary systems opened afterwards.": {
        "de": "Gibt jedem Gesteins- und Eismond eine Oberfläche, die wie die eines Planeten erzeugt wird, mit eigenem Globus, Wolken, Wetter und Oberflächenkarte statt einer von wenigen gemeinsamen Mondtexturen. Große Monde von Gasriesen werden immer so gezeichnet. Kleine Monde erhalten einen gröberen Globus, bis du an sie heranzoomst. Gilt für danach geöffnete Planetensysteme.",
        "es": "Da a cada luna rocosa o helada una superficie generada como la de un planeta, con su propio globo, nubes, clima y mapa de superficie, en lugar de una de unas pocas texturas lunares compartidas. Las lunas grandes de los gigantes gaseosos siempre se dibujan así. Las lunas pequeñas tienen un globo más tosco hasta que te acercas a ellas. Se aplica a los sistemas planetarios que se abran después.",
        "fr": "Donne à chaque lune rocheuse ou glacée une surface générée comme celle d’une planète, avec son propre globe, ses nuages, sa météo et sa carte de surface, plutôt qu’une des quelques textures de lune partagées. Les grandes lunes des géantes gazeuses sont toujours dessinées ainsi. Les petites lunes ont un globe plus grossier jusqu’à ce que vous zoomiez dessus. S’applique aux systèmes planétaires ouverts ensuite.",
        "pt": "Dá a cada lua rochosa e gelada uma superfície gerada como a de um planeta, com globo, nuvens, clima e mapa da superfície próprios, em vez de uma das poucas texturas de lua compartilhadas. As grandes luas dos gigantes gasosos são sempre desenhadas assim. Luas pequenas recebem um globo mais grosseiro até você ampliar nelas. Vale para os sistemas planetários abertos depois."
    },
    "Glacier": {
        "de": "Gletscher",
        "es": "Glaciar",
        "fr": "Glacier",
        "pt": "Geleira"
    },
    "Globe resolution:": {
        "de": "Globusauflösung:",
        "es": "Resolución del globo:",
        "fr": "Résolution du globe :",
        "pt": "Resolução do globo:"
    },
    "Globe: %@": {
        "de": "Globus: %@",
        "es": "Globo: %@",
        "fr": "Globe : %@",
        "pt": "Globo: %@"
    },
    "Globe: Off": {
        "de": "Globus: Aus",
        "es": "Globo: desactivado",
        "fr": "Globe : aucun",
        "pt": "Globo: Desligado"
    },
    "Glowing hydrogen where young, hot stars are being born": {
        "de": "Leuchtender Wasserstoff, wo junge, heiße Sterne entstehen",
        "es": "Hidrógeno brillante donde nacen estrellas jóvenes y calientes",
        "fr": "Hydrogène luminescent où naissent de jeunes étoiles chaudes",
        "pt": "Hidrogênio brilhante onde nascem estrelas jovens e quentes"
    },
    "Go back to the layout before this one": {
        "de": "Zum Layout vor diesem zurückkehren",
        "es": "Vuelve a la disposición anterior a esta",
        "fr": "Revenir à la disposition précédente",
        "pt": "Voltar à disposição anterior a esta"
    },
    "Grand plan": {
        "de": "Großer Plan",
        "es": "Gran plan",
        "fr": "Grand plan",
        "pt": "Plano monumental"
    },
    "Gravity": {
        "de": "Schwerkraft",
        "es": "Gravedad",
        "fr": "Gravité",
        "pt": "Gravidade"
    },
    "Grid": {
        "de": "Raster",
        "es": "Cuadrícula",
        "fr": "Quadrillage",
        "pt": "Grade"
    },
    "Habitable": {
        "de": "Bewohnbar",
        "es": "Habitable",
        "fr": "Habitables",
        "pt": "Habitável"
    },
    "Habitable zone": {
        "de": "Habitable Zone",
        "es": "Zona habitable",
        "fr": "Zone habitable",
        "pt": "Zona habitável"
    },
    "Heavy": {
        "de": "Stark",
        "es": "fuerte",
        "fr": "forte",
        "pt": "forte"
    },
    "Helium white dwarf": {
        "de": "Helium-Weißer Zwerg",
        "es": "Enana blanca de helio",
        "fr": "Naine blanche à hélium",
        "pt": "Anã branca de hélio"
    },
    "Herbig Ae/Be star": {
        "de": "Herbig-Ae/Be-Stern",
        "es": "Estrella Herbig Ae/Be",
        "fr": "Étoile de Herbig Ae/Be",
        "pt": "Estrela Herbig Ae/Be"
    },
    "Hex map": {
        "de": "Hexkarte",
        "es": "Mapa hexagonal",
        "fr": "Carte hexagonale",
        "pt": "Mapa hexagonal"
    },
    "Hide the filters": {
        "de": "Filter ausblenden",
        "es": "Ocultar los filtros",
        "fr": "Masquer les filtres",
        "pt": "Ocultar os filtros"
    },
    "Hide the side panel": {
        "de": "Seitenleiste ausblenden",
        "es": "Ocultar el panel lateral",
        "fr": "Masquer le panneau latéral",
        "pt": "Ocultar o painel lateral"
    },
    "Hops": {
        "de": "Sprünge",
        "es": "Saltos",
        "fr": "Sauts",
        "pt": "Saltos"
    },
    "Hops of up to %lld parsecs": {
        "de": "Sprünge bis %lld Parsec",
        "es": "Saltos de hasta %lld pársecs",
        "fr": "Sauts de %lld parsecs au plus",
        "pt": "Saltos de até %lld parsecs"
    },
    "Hot": {
        "de": "Heiß",
        "es": "Cálido",
        "fr": "Chaud",
        "pt": "Quente"
    },
    "Hot helium white dwarf": {
        "de": "Heißer Helium-Weißer Zwerg",
        "es": "Enana blanca caliente de helio",
        "fr": "Naine blanche chaude à hélium",
        "pt": "Anã branca de hélio quente"
    },
    "Hot subdwarf": {
        "de": "Heißer Unterzwerg",
        "es": "Subenana caliente",
        "fr": "Sous-naine chaude",
        "pt": "Subanã quente"
    },
    "How alike the buildings are: one material and roofline throughout, or every building its own": {
        "de": "Wie ähnlich die Gebäude sind: ein Material und eine Dachform überall oder jedes Gebäude anders",
        "es": "Cuánto se parecen los edificios: un mismo material y tejado en todos, o cada edificio a su manera",
        "fr": "Degré de ressemblance des bâtiments : un seul matériau et une seule ligne de toits partout, ou chaque bâtiment différent",
        "pt": "Quão parecidos são os edifícios: um só material e telhado em tudo, ou cada edifício do seu jeito"
    },
    "How this world's cities are built": {
        "de": "Wie die Städte dieser Welt gebaut sind",
        "es": "Cómo se construyen las ciudades de este mundo",
        "fr": "Comment les villes de ce monde sont bâties",
        "pt": "Como as cidades deste mundo são construídas"
    },
    "Hub": {
        "de": "Drehkreuz",
        "es": "Principal",
        "fr": "Principal",
        "pt": "Central"
    },
    "Hydrogen white dwarf": {
        "de": "Wasserstoff-Weißer Zwerg",
        "es": "Enana blanca de hidrógeno",
        "fr": "Naine blanche à hydrogène",
        "pt": "Anã branca de hidrogênio"
    },
    "Hydrogen–helium": {
        "de": "Wasserstoff–Helium",
        "es": "Hidrógeno–helio",
        "fr": "Hydrogène–hélium",
        "pt": "Hidrogênio–hélio"
    },
    "Hypergiant": {
        "de": "Hyperriese",
        "es": "Hipergigante",
        "fr": "Hypergéante",
        "pt": "Hipergigante"
    },
    "Ice giant": {
        "de": "Eisriese",
        "es": "Gigante helado",
        "fr": "Géante de glace",
        "pt": "Gigante de gelo"
    },
    "Icosahedral Map": {
        "de": "Ikosaederkarte",
        "es": "Mapa icosaédrico",
        "fr": "Carte icosaédrique",
        "pt": "Mapa Icosaédrico"
    },
    "In the eye of a tropical cyclone": {
        "de": "Im Auge eines tropischen Wirbelsturms",
        "es": "En el ojo de un ciclón tropical",
        "fr": "Dans l’œil d’un cyclone tropical",
        "pt": "No olho de um ciclone tropical"
    },
    "In use": {
        "de": "In Verwendung",
        "es": "En uso",
        "fr": "Utilisée",
        "pt": "Em uso"
    },
    "Inclination": {
        "de": "Bahnneigung",
        "es": "Inclinación",
        "fr": "Inclinaison",
        "pt": "Inclinação"
    },
    "Inclined": {
        "de": "Geneigt",
        "es": "Inclinado",
        "fr": "Inclinée",
        "pt": "Inclinada"
    },
    "Include world data below the map (PDF)": {
        "de": "Weltdaten unter der Karte einfügen (PDF)",
        "es": "Incluir los datos del mundo bajo el mapa (PDF)",
        "fr": "Inclure les données du monde sous la carte (PDF)",
        "pt": "Incluir dados do mundo abaixo do mapa (PDF)"
    },
    "Inner limit": {
        "de": "Innere Grenze",
        "es": "Límite interior",
        "fr": "Limite intérieure",
        "pt": "Limite interno"
    },
    "Intl": {
        "de": "Intl.",
        "es": "Intl.",
        "fr": "Intl",
        "pt": "Intl"
    },
    "Island": {
        "de": "Insel",
        "es": "Isla",
        "fr": "Île",
        "pt": "Ilha"
    },
    "Ix Ex Cx": {
        "de": "Ix Ex Cx",
        "es": "Ix Ex Cx",
        "fr": "Ix Ex Cx",
        "pt": "Ix Ex Cx"
    },
    "JPEG Image…": {
        "de": "JPEG-Bild …",
        "es": "Imagen JPEG…",
        "fr": "Image JPEG…",
        "pt": "Imagem JPEG…"
    },
    "Jupiter-like gas giant": {
        "de": "Jupiterartiger Gasriese",
        "es": "Gigante gaseoso tipo Júpiter",
        "fr": "Géante gazeuse de type Jupiter",
        "pt": "Gigante gasoso tipo Júpiter"
    },
    "Keep Mine": {
        "de": "Meine behalten",
        "es": "Conservar la mía",
        "fr": "Garder la mienne",
        "pt": "Manter a Minha"
    },
    "Kind": {
        "de": "Art",
        "es": "Categoría",
        "fr": "Genre",
        "pt": "Categoria"
    },
    "L dwarf (brown dwarf)": {
        "de": "L-Zwerg (Brauner Zwerg)",
        "es": "Enana L (enana marrón)",
        "fr": "Naine L (naine brune)",
        "pt": "Anã L (anã marrom)"
    },
    "Landing pad": {
        "de": "Landeplatz",
        "es": "Plataforma de aterrizaje",
        "fr": "Aire d’atterrissage",
        "pt": "Plataforma de pouso"
    },
    "Landmark": {
        "de": "Wahrzeichen",
        "es": "Lugar de interés",
        "fr": "Site remarquable",
        "pt": "Marco"
    },
    "Lay the system out again: TravellerMap's world stays as listed, and everything generated round it is drawn afresh": {
        "de": "Das System neu anlegen: Die Welt von TravellerMap bleibt wie gelistet, alles darum herum Erzeugte wird neu gezogen",
        "es": "Vuelve a disponer el sistema: el mundo de TravellerMap queda como figura, y todo lo generado a su alrededor se crea de nuevo",
        "fr": "Redisposer le système : le monde de TravellerMap reste tel qu’indiqué, et tout ce qui est généré autour est refait",
        "pt": "Redispor o sistema: o mundo do TravellerMap fica como listado, e tudo o que foi gerado em torno dele é sorteado de novo"
    },
    "Lay this system out again?": {
        "de": "Dieses System neu anlegen?",
        "es": "¿Volver a disponer este sistema?",
        "fr": "Redisposer ce système ?",
        "pt": "Redispor este sistema?"
    },
    "Laying out %@…": {
        "de": "%@ wird angelegt …",
        "es": "Trazando %@…",
        "fr": "Tracé de %@…",
        "pt": "Traçando %@…"
    },
    "Layout %lld": {
        "de": "Layout %lld",
        "es": "Disposición %lld",
        "fr": "Disposition %lld",
        "pt": "Disposição %lld"
    },
    "Leading trojan": {
        "de": "Vorauseilender Trojaner",
        "es": "Troyano delantero",
        "fr": "Troyen avant",
        "pt": "Troiano à frente"
    },
    "Liberal democracy": {
        "de": "Liberale Demokratie",
        "es": "Democracia liberal",
        "fr": "Démocratie libérale",
        "pt": "Democracia liberal"
    },
    "Licensed": {
        "de": "Lizenziert",
        "es": "Con licencia",
        "fr": "Sous licence",
        "pt": "Com licença"
    },
    "Light": {
        "de": "Leicht",
        "es": "ligera",
        "fr": "faible",
        "pt": "fraca"
    },
    "Light walls, broad low roofs with deep eaves, lush planting": {
        "de": "Helle Wände, breite flache Dächer mit tiefem Überstand, üppige Bepflanzung",
        "es": "Muros claros, tejados amplios y bajos con aleros profundos, vegetación exuberante",
        "fr": "Murs clairs, larges toits bas aux avant-toits profonds, végétation luxuriante",
        "pt": "Paredes claras, telhados largos e baixos com beirais fundos, vegetação exuberante"
    },
    "Loading sectors…": {
        "de": "Sektoren werden geladen …",
        "es": "Cargando sectores…",
        "fr": "Chargement des secteurs…",
        "pt": "Carregando setores…"
    },
    "Location": {
        "de": "Lage",
        "es": "Ubicación",
        "fr": "Emplacement",
        "pt": "Localização"
    },
    "Long. asc. node": {
        "de": "Länge aufst. Knoten",
        "es": "Long. nodo asc.",
        "fr": "Long. du nœud asc.",
        "pt": "Long. nodo asc."
    },
    "Longest hop": {
        "de": "Längster Sprung",
        "es": "Salto más largo",
        "fr": "Plus long saut",
        "pt": "Maior salto"
    },
    "Looking for world maps…": {
        "de": "Weltkarten werden gesucht …",
        "es": "Buscando mapas del mundo…",
        "fr": "Recherche des cartes des mondes…",
        "pt": "Procurando mapas dos mundos…"
    },
    "Loop at the north pole": {
        "de": "Öse am Nordpol",
        "es": "Argolla en el polo norte",
        "fr": "Anneau au pôle nord",
        "pt": "Argola no polo norte"
    },
    "Luminosity": {
        "de": "Leuchtkraft",
        "es": "Luminosidad",
        "fr": "Luminosité",
        "pt": "Luminosidade"
    },
    "MS-type star": {
        "de": "MS-Stern",
        "es": "Estrella de tipo MS",
        "fr": "Étoile de type MS",
        "pt": "Estrela tipo MS"
    },
    "Magnetar": {
        "de": "Magnetar",
        "es": "Magnetar",
        "fr": "Magnétar",
        "pt": "Magnetar"
    },
    "Main-sequence star": {
        "de": "Hauptreihenstern",
        "es": "Estrella de la secuencia principal",
        "fr": "Étoile de la séquence principale",
        "pt": "Estrela da sequência principal"
    },
    "Manufacturing": {
        "de": "Industrie",
        "es": "Manufactura",
        "fr": "Industrie manufacturière",
        "pt": "Indústria"
    },
    "Markdown: **bold**, *italic*, # headings, - lists, > quotes, `code`": {
        "de": "Markdown: **fett**, *kursiv*, # Überschriften, - Listen, > Zitate, `Code`",
        "es": "Markdown: **negrita**, *cursiva*, # títulos, - listas, > citas, `código`",
        "fr": "Markdown : **gras**, *italique*, # titres, - listes, > citations, `code`",
        "pt": "Markdown: **negrito**, *itálico*, # títulos, - listas, > citações, `código`"
    },
    "Mass": {
        "de": "Masse",
        "es": "Masa",
        "fr": "Masse",
        "pt": "Massa"
    },
    "Metal-polluted white dwarf": {
        "de": "Metallverunreinigter Weißer Zwerg",
        "es": "Enana blanca contaminada por metales",
        "fr": "Naine blanche polluée par des métaux",
        "pt": "Anã branca poluída por metais"
    },
    "Metalworking, writing, early cities": {
        "de": "Metallverarbeitung, Schrift, frühe Städte",
        "es": "Metalurgia, escritura, primeras ciudades",
        "fr": "Métallurgie, écriture, premières villes",
        "pt": "Metalurgia, escrita, primeiras cidades"
    },
    "Milieu": {
        "de": "Milieu",
        "es": "Milieu",
        "fr": "Milieu",
        "pt": "Milieu"
    },
    "Military base": {
        "de": "Militärbasis",
        "es": "Base militar",
        "fr": "Base militaire",
        "pt": "Base militar"
    },
    "Militia": {
        "de": "Miliz",
        "es": "Milicia",
        "fr": "Milice",
        "pt": "Milícia"
    },
    "Mira variable": {
        "de": "Mira-Veränderlicher",
        "es": "Variable Mira",
        "fr": "Variable de type Mira",
        "pt": "Variável Mira"
    },
    "Moderate": {
        "de": "Mäßig",
        "es": "moderada",
        "fr": "modérée",
        "pt": "moderada"
    },
    "Modern": {
        "de": "Modern",
        "es": "Moderna",
        "fr": "Moderne",
        "pt": "Moderna"
    },
    "Monument": {
        "de": "Denkmal",
        "es": "Monumento",
        "fr": "Monument",
        "pt": "Monumento"
    },
    "Moon": {
        "de": "Mond",
        "es": "Luna",
        "fr": "Lune",
        "pt": "Lua"
    },
    "Moon data": {
        "de": "Monddaten",
        "es": "Datos de la luna",
        "fr": "Données de la lune",
        "pt": "Dados da lua"
    },
    "Moon of %@": {
        "de": "Mond von %@",
        "es": "Luna de %@",
        "fr": "Lune de %@",
        "pt": "Lua de %@"
    },
    "Moons": {
        "de": "Monde",
        "es": "Lunas",
        "fr": "Lunes",
        "pt": "Luas"
    },
    "Most firearms banned; hunting arms by permit only": {
        "de": "Die meisten Schusswaffen verboten; Jagdwaffen nur mit Genehmigung",
        "es": "La mayoría de las armas de fuego prohibidas; armas de caza solo con permiso",
        "fr": "La plupart des armes à feu interdites ; armes de chasse sur permis uniquement",
        "pt": "Maioria das armas de fogo proibida; armas de caça só com autorização"
    },
    "Most weapons legal; explosives and heavy arms banned": {
        "de": "Die meisten Waffen legal; Sprengstoffe und schwere Waffen verboten",
        "es": "La mayoría de las armas son legales; explosivos y armas pesadas prohibidos",
        "fr": "La plupart des armes légales ; explosifs et armes lourdes interdits",
        "pt": "Maioria das armas legal; explosivos e armas pesadas proibidos"
    },
    "Mostly cloudy": {
        "de": "Überwiegend bewölkt",
        "es": "Mayormente nublado",
        "fr": "Plutôt nuageux",
        "pt": "Predominantemente nublado"
    },
    "Mount": {
        "de": "Halterung",
        "es": "Soporte",
        "fr": "Fixation",
        "pt": "Suporte"
    },
    "Mount:": {
        "de": "Halterung:",
        "es": "Soporte:",
        "fr": "Fixation :",
        "pt": "Suporte:"
    },
    "Mountain": {
        "de": "Berg",
        "es": "Montaña",
        "fr": "Montagne",
        "pt": "Montanha"
    },
    "N": {
        "de": "N",
        "es": "N",
        "fr": "N",
        "pt": "N"
    },
    "NE": {
        "de": "NO",
        "es": "NE",
        "fr": "NE",
        "pt": "NE"
    },
    "NW": {
        "de": "NW",
        "es": "NO",
        "fr": "NO",
        "pt": "NO"
    },
    "Navy": {
        "de": "Marine",
        "es": "Armada",
        "fr": "Marine",
        "pt": "Marinha"
    },
    "Nebulae": {
        "de": "Nebel",
        "es": "Nebulosas",
        "fr": "Nébuleuses",
        "pt": "Nebulosas"
    },
    "Neighbouring sectors are listed first.": {
        "de": "Benachbarte Sektoren stehen oben.",
        "es": "Los sectores vecinos aparecen primero.",
        "fr": "Les secteurs voisins sont listés en premier.",
        "pt": "Setores vizinhos aparecem primeiro."
    },
    "Neutron star": {
        "de": "Neutronenstern",
        "es": "Estrella de neutrones",
        "fr": "Étoile à neutrons",
        "pt": "Estrela de nêutrons"
    },
    "New Traveller Universe": {
        "de": "Neues Traveller-Universum",
        "es": "Nuevo universo de Traveller",
        "fr": "Nouvel univers Traveller",
        "pt": "Novo Universo Traveller"
    },
    "New ones are placed in their stead. Ports, bases, outposts and landmarks are kept.": {
        "de": "An ihrer Stelle werden neue platziert. Häfen, Basen, Außenposten und Wahrzeichen bleiben erhalten.",
        "es": "Se colocan otros nuevos en su lugar. Se conservan los puertos, bases, puestos avanzados y lugares de interés.",
        "fr": "De nouveaux sont placés à leur place. Les ports, bases, avant-postes et sites remarquables sont conservés.",
        "pt": "Novas são posicionadas no lugar delas. Portos, bases, postos avançados e marcos são mantidos."
    },
    "New place": {
        "de": "Neuer Ort",
        "es": "Nuevo lugar",
        "fr": "Nouveau lieu",
        "pt": "Novo lugar"
    },
    "Night": {
        "de": "Nacht",
        "es": "Noche",
        "fr": "Nuit",
        "pt": "Noite"
    },
    "Night sides": {
        "de": "Nachtseiten",
        "es": "Lados nocturnos",
        "fr": "Faces nocturnes",
        "pt": "Lados noturnos"
    },
    "Nitrogen": {
        "de": "Stickstoff",
        "es": "Nitrógeno",
        "fr": "Azote",
        "pt": "Nitrogênio"
    },
    "Nitrogen Wolf–Rayet star": {
        "de": "Stickstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de nitrógeno",
        "fr": "Étoile Wolf–Rayet azotée",
        "pt": "Estrela Wolf–Rayet de nitrogênio"
    },
    "Nitrogen–methane": {
        "de": "Stickstoff–Methan",
        "es": "Nitrógeno–metano",
        "fr": "Azote–méthane",
        "pt": "Nitrogênio–metano"
    },
    "Nitrogen–oxygen": {
        "de": "Stickstoff–Sauerstoff",
        "es": "Nitrógeno–oxígeno",
        "fr": "Azote–oxygène",
        "pt": "Nitrogênio–oxigênio"
    },
    "No": {
        "de": "Nein",
        "es": "No",
        "fr": "Non",
        "pt": "Não"
    },
    "No cyclones": {
        "de": "Keine Zyklone",
        "es": "Sin ciclones",
        "fr": "Aucun cyclone",
        "pt": "Sem ciclones"
    },
    "No laws on owning or carrying weapons": {
        "de": "Keine Gesetze zu Besitz oder Tragen von Waffen",
        "es": "Sin leyes sobre la posesión o el porte de armas",
        "fr": "Aucune loi sur la détention ou le port d’armes",
        "pt": "Sem leis sobre posse ou porte de armas"
    },
    "No notes yet": {
        "de": "Noch keine Notizen",
        "es": "Aún no hay notas",
        "fr": "Aucune note",
        "pt": "Nenhuma nota ainda"
    },
    "No notes yet. Add notes with the note buttons beside stars, worlds, moons and places.": {
        "de": "Noch keine Notizen. Füge Notizen mit den Notiztasten neben Sternen, Welten, Monden und Orten hinzu.",
        "es": "Aún no hay notas. Añade notas con los botones de nota junto a estrellas, mundos, lunas y lugares.",
        "fr": "Aucune note. Ajoutez des notes avec les boutons de note à côté des étoiles, mondes, lunes et lieux.",
        "pt": "Nenhuma nota ainda. Adicione notas com os botões de nota ao lado de estrelas, mundos, luas e lugares."
    },
    "No port": {
        "de": "Kein Hafen",
        "es": "Sin puerto",
        "fr": "Aucun port",
        "pt": "Sem porto"
    },
    "No systems found": {
        "de": "Keine Systeme gefunden",
        "es": "No se encontraron sistemas",
        "fr": "Aucun système trouvé",
        "pt": "Nenhum sistema encontrado"
    },
    "No weather: too little air": {
        "de": "Kein Wetter: zu wenig Luft",
        "es": "Sin meteorología: muy poco aire",
        "fr": "Pas de météo : trop peu d’air",
        "pt": "Sem clima: ar escasso demais"
    },
    "No: sealed suit": {
        "de": "Nein: geschlossener Anzug",
        "es": "No: traje sellado",
        "fr": "Non : combinaison étanche",
        "pt": "Não: traje selado"
    },
    "No: vacuum suit": {
        "de": "Nein: Vakuumanzug",
        "es": "No: traje de vacío",
        "fr": "Non : combinaison spatiale",
        "pt": "Não: traje de vácuo"
    },
    "Notes": {
        "de": "Notizen",
        "es": "Notas",
        "fr": "Notes",
        "pt": "Notas"
    },
    "Notes (shared with players)": {
        "de": "Notizen (mit Spielern geteilt)",
        "es": "Notas (compartidas con los jugadores)",
        "fr": "Notes (partagées avec les joueurs)",
        "pt": "Notas (compartilhadas com jogadores)"
    },
    "Notes, places, ports and data you've set on this system's worlds are kept under the worlds' designations, which may now belong to other worlds or none.": {
        "de": "Notizen, Orte, Häfen und Daten, die du auf den Welten dieses Systems gesetzt hast, bleiben unter den Bezeichnungen der Welten erhalten, die jetzt zu anderen oder keinen Welten gehören können.",
        "es": "Las notas, lugares, puertos y datos que has definido en los mundos de este sistema se conservan bajo las designaciones de los mundos, que ahora pueden pertenecer a otros mundos o a ninguno.",
        "fr": "Les notes, lieux, ports et données définis sur les mondes de ce système sont conservés sous leurs désignations, qui peuvent désormais appartenir à d’autres mondes ou à aucun.",
        "pt": "Notas, lugares, portos e dados que você definiu nos mundos deste sistema ficam guardados sob as designações dos mundos, que agora podem pertencer a outros mundos ou a nenhum."
    },
    "Nuclear power, jet aircraft, early computers": {
        "de": "Kernkraft, Düsenflugzeuge, frühe Computer",
        "es": "Energía nuclear, aviones a reacción, primeras computadoras",
        "fr": "Énergie nucléaire, avions à réaction, premiers ordinateurs",
        "pt": "Energia nuclear, aviões a jato, primeiros computadores"
    },
    "OBJ Model…": {
        "de": "OBJ-Modell …",
        "es": "Modelo OBJ…",
        "fr": "Modèle OBJ…",
        "pt": "Modelo OBJ…"
    },
    "Oligarchy": {
        "de": "Oligarchie",
        "es": "Oligarquía",
        "fr": "Oligarchie",
        "pt": "Oligarquia"
    },
    "On globe": {
        "de": "Auf Globus",
        "es": "En el globo",
        "fr": "Sur le globe",
        "pt": "No globo"
    },
    "Open System": {
        "de": "System öffnen",
        "es": "Abrir sistema",
        "fr": "Ouvrir le système",
        "pt": "Abrir Sistema"
    },
    "Open a universe your GM sent you with Open Universe…, or drop its file on the page.": {
        "de": "Öffne ein Universum von deinem SL mit „Universum öffnen …“ oder zieh seine Datei auf die Seite.",
        "es": "Abre un universo que te envió tu DJ con Abrir universo…, o suelta su archivo en la página.",
        "fr": "Ouvrez un univers envoyé par votre MJ avec Ouvrir un univers…, ou déposez son fichier sur la page.",
        "pt": "Abra um universo que seu mestre enviou com Abrir Universo…, ou solte o arquivo dele na página."
    },
    "Open a universe your GM sent you; a newer copy of one you have replaces it": {
        "de": "Ein Universum von deinem SL öffnen; eine neuere Kopie ersetzt deine vorhandene",
        "es": "Abre un universo que te envió tu DJ; una copia más reciente de uno que ya tienes lo reemplaza",
        "fr": "Ouvrir un univers envoyé par votre MJ ; une copie plus récente d’un univers existant le remplace",
        "pt": "Abra um universo que seu mestre enviou; uma cópia mais recente de um que você já tem o substitui"
    },
    "Orbit": {
        "de": "Umlaufbahn",
        "es": "Órbita",
        "fr": "Orbite",
        "pt": "Órbita"
    },
    "Orbital elements": {
        "de": "Bahnelemente",
        "es": "Elementos orbitales",
        "fr": "Éléments orbitaux",
        "pt": "Elementos orbitais"
    },
    "Orbits": {
        "de": "Umkreist",
        "es": "Orbita",
        "fr": "Orbite autour de",
        "pt": "Órbitas"
    },
    "Organic": {
        "de": "Organisch",
        "es": "Orgánico",
        "fr": "Organique",
        "pt": "Orgânico"
    },
    "Other": {
        "de": "Sonstiges",
        "es": "Otro",
        "fr": "Autre",
        "pt": "Outro"
    },
    "Out of reach at %lld pc": {
        "de": "Außer Reichweite bei %lld pc",
        "es": "Fuera de alcance a %lld pc",
        "fr": "Hors de portée à %lld pc",
        "pt": "Fora de alcance a %lld pc"
    },
    "Outline: contour lines and coastlines only, for printing": {
        "de": "Umriss: nur Höhenlinien und Küsten, zum Drucken",
        "es": "Contorno: solo curvas de nivel y costas, para imprimir",
        "fr": "Contours : courbes de niveau et côtes uniquement, pour l’impression",
        "pt": "Contorno: só curvas de nível e litorais, para impressão"
    },
    "Outpost": {
        "de": "Außenposten",
        "es": "Puesto avanzado",
        "fr": "Avant-poste",
        "pt": "Posto avançado"
    },
    "Overcast": {
        "de": "Bedeckt",
        "es": "Cubierto",
        "fr": "Couvert",
        "pt": "Encoberto"
    },
    "Oxygen Wolf–Rayet star": {
        "de": "Sauerstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de oxígeno",
        "fr": "Étoile Wolf–Rayet oxygénée",
        "pt": "Estrela Wolf–Rayet de oxigênio"
    },
    "PDF Document…": {
        "de": "PDF-Dokument …",
        "es": "Documento PDF…",
        "fr": "Document PDF…",
        "pt": "Documento PDF…"
    },
    "PNG Image…": {
        "de": "PNG-Bild …",
        "es": "Imagen PNG…",
        "fr": "Image PNG…",
        "pt": "Imagem PNG…"
    },
    "Partly cloudy": {
        "de": "Teilweise bewölkt",
        "es": "Parcialmente nublado",
        "fr": "Partiellement nuageux",
        "pt": "Parcialmente nublado"
    },
    "Period": {
        "de": "Umlaufzeit",
        "es": "Período",
        "fr": "Période",
        "pt": "Período"
    },
    "Permissive": {
        "de": "Freizügig",
        "es": "Permisivo",
        "fr": "Permissif",
        "pt": "Permissivo"
    },
    "Personalist dictatorship": {
        "de": "Personalistische Diktatur",
        "es": "Dictadura personalista",
        "fr": "Dictature personnelle",
        "pt": "Ditadura personalista"
    },
    "Pinch or use the buttons to zoom; scroll to pan; click a place to edit it": {
        "de": "Zum Zoomen auf-/zuziehen oder Tasten verwenden; zum Verschieben scrollen; zum Bearbeiten auf einen Ort klicken",
        "es": "Pellizca o usa los botones para hacer zoom; desplázate para mover la vista; haz clic en un lugar para editarlo",
        "fr": "Pincez ou utilisez les boutons pour zoomer ; faites défiler pour vous déplacer ; cliquez sur un lieu pour le modifier",
        "pt": "Use o gesto de pinça ou os botões para zoom; role para mover; clique em um lugar para editá-lo"
    },
    "Pitched tile and slate roofs, brick, stone and render": {
        "de": "Ziegel- und Schiefer-Steildächer, Backstein, Naturstein und Putz",
        "es": "Tejados inclinados de teja y pizarra, ladrillo, piedra y revoque",
        "fr": "Toits pentus de tuile et d’ardoise, brique, pierre et enduit",
        "pt": "Telhados inclinados de telha e ardósia, tijolo, pedra e reboco"
    },
    "Place Settlements": {
        "de": "Siedlungen platzieren",
        "es": "Colocar asentamientos",
        "fr": "Placer les localités",
        "pt": "Posicionar Assentamentos"
    },
    "Place the world's capital, its cities and its towns and villages where people would settle, and choose how its cities are built": {
        "de": "Hauptstadt, Städte, Kleinstädte und Dörfer dort platzieren, wo Menschen siedeln würden, und wählen, wie die Städte gebaut sind",
        "es": "Coloca la capital del mundo, sus ciudades, pueblos y aldeas donde la gente se asentaría, y elige cómo se construyen sus ciudades",
        "fr": "Placer la capitale du monde, ses villes, bourgs et villages là où les gens s’installeraient, et choisir comment ses villes sont bâties",
        "pt": "Posiciona a capital do mundo, suas cidades, vilas e aldeias onde as pessoas se assentariam, e escolhe como as cidades são construídas"
    },
    "Places": {
        "de": "Orte",
        "es": "Lugares",
        "fr": "Lieux",
        "pt": "Lugares"
    },
    "Plain": {
        "de": "Ebene",
        "es": "Llanura",
        "fr": "Plaine",
        "pt": "Planície"
    },
    "Planet": {
        "de": "Planet",
        "es": "Planeta",
        "fr": "Planète",
        "pt": "Planeta"
    },
    "Planet surfaces": {
        "de": "Planetenoberflächen",
        "es": "Superficies planetarias",
        "fr": "Surfaces planétaires",
        "pt": "Superfícies planetárias"
    },
    "Planet's star(s)": {
        "de": "Stern(e) des Planeten",
        "es": "Estrella(s) del planeta",
        "fr": "Étoile(s) de la planète",
        "pt": "Estrela(s) do planeta"
    },
    "Planetary nebula": {
        "de": "Planetarischer Nebel",
        "es": "Nebulosa planetaria",
        "fr": "Nébuleuse planétaire",
        "pt": "Nebulosa planetária"
    },
    "Planetary system": {
        "de": "Planetensystem",
        "es": "Sistema planetario",
        "fr": "Système planétaire",
        "pt": "Sistema planetário"
    },
    "Planets": {
        "de": "Planeten",
        "es": "Planetas",
        "fr": "Planètes",
        "pt": "Planetas"
    },
    "Planning…": {
        "de": "Wird geplant …",
        "es": "Planificando…",
        "fr": "Planification…",
        "pt": "Planejando…"
    },
    "Polygon map": {
        "de": "Polygonkarte",
        "es": "Mapa poligonal",
        "fr": "Carte polygonale",
        "pt": "Mapa poligonal"
    },
    "Pop. %@": {
        "de": "Einw. %@",
        "es": "Pob. %@",
        "fr": "Pop. %@",
        "pt": "Pop. %@"
    },
    "Port": {
        "de": "Hafen",
        "es": "Puerto",
        "fr": "Port",
        "pt": "Porto"
    },
    "Port and installations": {
        "de": "Hafen und Einrichtungen",
        "es": "Puerto e instalaciones",
        "fr": "Port et installations",
        "pt": "Porto e instalações"
    },
    "Position": {
        "de": "Position",
        "es": "Posición",
        "fr": "Position",
        "pt": "Posição"
    },
    "Pre-industrial": {
        "de": "Vorindustriell",
        "es": "Preindustrial",
        "fr": "Préindustriel",
        "pt": "Pré-industrial"
    },
    "Pressure": {
        "de": "Druck",
        "es": "Presión",
        "fr": "Pression",
        "pt": "Pressão"
    },
    "Preview": {
        "de": "Vorschau",
        "es": "Vista previa",
        "fr": "Aperçu",
        "pt": "Prévia"
    },
    "Previous Layout": {
        "de": "Vorheriges Layout",
        "es": "Disposición anterior",
        "fr": "Disposition précédente",
        "pt": "Disposição Anterior"
    },
    "Primary": {
        "de": "Hauptstern",
        "es": "Primaria",
        "fr": "Primaire",
        "pt": "Primária"
    },
    "Principal world": {
        "de": "Hauptwelt",
        "es": "Mundo principal",
        "fr": "Monde principal",
        "pt": "Mundo principal"
    },
    "Print or Save PDF…": {
        "de": "Drucken oder als PDF sichern …",
        "es": "Imprimir o guardar PDF…",
        "fr": "Imprimer ou enregistrer en PDF…",
        "pt": "Imprimir ou Salvar PDF…"
    },
    "Printing, gunpowder, ocean sailing ships": {
        "de": "Buchdruck, Schießpulver, Hochseesegelschiffe",
        "es": "Imprenta, pólvora, veleros oceánicos",
        "fr": "Imprimerie, poudre à canon, navires de haute mer",
        "pt": "Imprensa, pólvora, navios oceânicos à vela"
    },
    "Prograde": {
        "de": "Rechtläufig",
        "es": "Prógrado",
        "fr": "Prograde",
        "pt": "Progrado"
    },
    "Prohibited": {
        "de": "Verboten",
        "es": "Prohibido",
        "fr": "Interdit",
        "pt": "Proibido"
    },
    "Protostar": {
        "de": "Protostern",
        "es": "Protoestrella",
        "fr": "Protoétoile",
        "pt": "Protoestrela"
    },
    "Pulsar": {
        "de": "Pulsar",
        "es": "Púlsar",
        "fr": "Pulsar",
        "pt": "Pulsar"
    },
    "Put the advisory its worlds' conditions suggest on the system: %@": {
        "de": "Die von den Bedingungen seiner Welten nahegelegte Warnung auf das System setzen: %@",
        "es": "Asigna al sistema el aviso que sugieren las condiciones de sus mundos: %@",
        "fr": "Appliquer au système le conseil que suggèrent les conditions de ses mondes : %@",
        "pt": "Aplicar ao sistema o alerta que as condições de seus mundos sugerem: %@"
    },
    "Put this advisory on the system: %@": {
        "de": "Diese Reisewarnung auf das System setzen: %@",
        "es": "Asigna este aviso al sistema: %@",
        "fr": "Appliquer ce conseil au système : %@",
        "pt": "Aplicar este alerta ao sistema: %@"
    },
    "RR Lyrae variable": {
        "de": "RR-Lyrae-Veränderlicher",
        "es": "Variable RR Lyrae",
        "fr": "Variable RR Lyrae",
        "pt": "Variável RR Lyrae"
    },
    "Radar": {
        "de": "Radar",
        "es": "Radar",
        "fr": "Radar",
        "pt": "Radar"
    },
    "Radial": {
        "de": "Radial",
        "es": "Radial",
        "fr": "Radial",
        "pt": "Radial"
    },
    "Radius": {
        "de": "Radius",
        "es": "Radio",
        "fr": "Rayon",
        "pt": "Raio"
    },
    "Raining or snowing on": {
        "de": "Regen oder Schnee auf",
        "es": "Llueve o nieva en",
        "fr": "Pluie ou neige sur",
        "pt": "Chovendo ou nevando em"
    },
    "Random Name": {
        "de": "Zufallsname",
        "es": "Nombre aleatorio",
        "fr": "Nom aléatoire",
        "pt": "Nome Aleatório"
    },
    "Range": {
        "de": "Spanne",
        "es": "Rango",
        "fr": "Plage",
        "pt": "Faixa"
    },
    "Reading world maps…": {
        "de": "Weltkarten werden gelesen …",
        "es": "Leyendo mapas del mundo…",
        "fr": "Lecture des cartes des mondes…",
        "pt": "Lendo mapas dos mundos…"
    },
    "Rectangular Map": {
        "de": "Rechteckige Karte",
        "es": "Mapa rectangular",
        "fr": "Carte rectangulaire",
        "pt": "Mapa Retangular"
    },
    "Red": {
        "de": "Rot",
        "es": "Roja",
        "fr": "Rouge",
        "pt": "Vermelha"
    },
    "Red dwarf": {
        "de": "Roter Zwerg",
        "es": "Enana roja",
        "fr": "Naine rouge",
        "pt": "Anã vermelha"
    },
    "Red giant": {
        "de": "Roter Riese",
        "es": "Gigante roja",
        "fr": "Géante rouge",
        "pt": "Gigante vermelha"
    },
    "Red supergiant": {
        "de": "Roter Überriese",
        "es": "Supergigante roja",
        "fr": "Supergéante rouge",
        "pt": "Supergigante vermelha"
    },
    "Reflection nebula": {
        "de": "Reflexionsnebel",
        "es": "Nebulosa de reflexión",
        "fr": "Nébuleuse par réflexion",
        "pt": "Nebulosa de reflexão"
    },
    "Regenerate": {
        "de": "Neu erzeugen",
        "es": "Regenerar",
        "fr": "Régénérer",
        "pt": "Regenerar"
    },
    "Regional": {
        "de": "Regional",
        "es": "Regional",
        "fr": "Régional",
        "pt": "Regional"
    },
    "Remarks": {
        "de": "Anmerkungen",
        "es": "Observaciones",
        "fr": "Remarques",
        "pt": "Observações"
    },
    "Remove this waypoint": {
        "de": "Diesen Wegpunkt entfernen",
        "es": "Quitar este punto de paso",
        "fr": "Retirer cette étape",
        "pt": "Remover este ponto de passagem"
    },
    "Removed": {
        "de": "Entfernt",
        "es": "Eliminado",
        "fr": "Supprimé",
        "pt": "Removidos"
    },
    "Rename %@": {
        "de": "%@ umbenennen",
        "es": "Renombrar %@",
        "fr": "Renommer : %@",
        "pt": "Renomear %@"
    },
    "Rename…": {
        "de": "Umbenennen …",
        "es": "Renombrar…",
        "fr": "Renommer…",
        "pt": "Renomear…"
    },
    "Replace": {
        "de": "Ersetzen",
        "es": "Reemplazar",
        "fr": "Remplacer",
        "pt": "Substituir"
    },
    "Replace the cities, towns and villages on the map?": {
        "de": "Städte, Kleinstädte und Dörfer auf der Karte ersetzen?",
        "es": "¿Reemplazar las ciudades, pueblos y aldeas del mapa?",
        "fr": "Remplacer les villes, bourgs et villages de la carte ?",
        "pt": "Substituir as cidades, vilas e aldeias do mapa?"
    },
    "Research station": {
        "de": "Forschungsstation",
        "es": "Estación de investigación",
        "fr": "Station de recherche",
        "pt": "Estação de pesquisa"
    },
    "Reset view": {
        "de": "Ansicht zurücksetzen",
        "es": "Restablecer vista",
        "fr": "Réinitialiser la vue",
        "pt": "Redefinir vista"
    },
    "Resonance": {
        "de": "Resonanz",
        "es": "Resonancia",
        "fr": "Résonance",
        "pt": "Ressonância"
    },
    "Restrictive": {
        "de": "Restriktiv",
        "es": "Restrictivo",
        "fr": "Restrictif",
        "pt": "Restritivo"
    },
    "Retrograde": {
        "de": "Rückläufig",
        "es": "Retrógrado",
        "fr": "Rétrograde",
        "pt": "Retrógrado"
    },
    "Retry": {
        "de": "Erneut versuchen",
        "es": "Reintentar",
        "fr": "Réessayer",
        "pt": "Tentar de novo"
    },
    "Reverse real time": {
        "de": "Echtzeit rückwärts",
        "es": "Tiempo real inverso",
        "fr": "Temps réel inversé",
        "pt": "Tempo real reverso"
    },
    "Review…": {
        "de": "Prüfen …",
        "es": "Revisar…",
        "fr": "Examiner…",
        "pt": "Revisar…"
    },
    "Right-click to rename": {
        "de": "Rechtsklick zum Umbenennen",
        "es": "Clic derecho para renombrar",
        "fr": "Clic droit pour renommer",
        "pt": "Clique com o botão direito para renomear"
    },
    "Ring the systems with notes on them, their stars, their worlds or the places on them": {
        "de": "Systeme mit Notizen markieren – zum System, seinen Sternen, Welten oder deren Orten",
        "es": "Rodea con un anillo los sistemas que tienen notas en ellos, en sus estrellas, en sus mundos o en sus lugares",
        "fr": "Entourer les systèmes portant des notes, sur eux, leurs étoiles, leurs mondes ou leurs lieux",
        "pt": "Circular os sistemas com notas neles, em suas estrelas, seus mundos ou seus lugares"
    },
    "Rings": {
        "de": "Ringe",
        "es": "Anillos",
        "fr": "Anneaux",
        "pt": "Anéis"
    },
    "River": {
        "de": "Fluss",
        "es": "Río",
        "fr": "Rivière",
        "pt": "Rio"
    },
    "Rotation": {
        "de": "Rotation",
        "es": "Rotación",
        "fr": "Rotation",
        "pt": "Rotação"
    },
    "Route": {
        "de": "Route",
        "es": "Ruta",
        "fr": "Itinéraire",
        "pt": "Rota"
    },
    "Ruins": {
        "de": "Ruinen",
        "es": "Ruinas",
        "fr": "Ruines",
        "pt": "Ruínas"
    },
    "Run at real time": {
        "de": "In Echtzeit laufen",
        "es": "Avanzar en tiempo real",
        "fr": "Passer en temps réel",
        "pt": "Rodar em tempo real"
    },
    "S": {
        "de": "S",
        "es": "S",
        "fr": "S",
        "pt": "S"
    },
    "S-type star": {
        "de": "S-Stern",
        "es": "Estrella de tipo S",
        "fr": "Étoile de type S",
        "pt": "Estrela tipo S"
    },
    "SC-type star": {
        "de": "SC-Stern",
        "es": "Estrella de tipo SC",
        "fr": "Étoile de type SC",
        "pt": "Estrela tipo SC"
    },
    "SE": {
        "de": "SO",
        "es": "SE",
        "fr": "SE",
        "pt": "SE"
    },
    "STL Model for 3D Printing…": {
        "de": "STL-Modell für 3D-Druck …",
        "es": "Modelo STL para impresión 3D…",
        "fr": "Modèle STL pour impression 3D…",
        "pt": "Modelo STL para Impressão 3D…"
    },
    "SW": {
        "de": "SW",
        "es": "SO",
        "fr": "SO",
        "pt": "SO"
    },
    "Saturn-like gas giant": {
        "de": "Saturnartiger Gasriese",
        "es": "Gigante gaseoso tipo Saturno",
        "fr": "Géante gazeuse de type Saturne",
        "pt": "Gigante gasoso tipo Saturno"
    },
    "Save the open universe as one file to send players, with only the notes you've shared": {
        "de": "Das offene Universum als eine Datei für die Spieler sichern, nur mit den geteilten Notizen",
        "es": "Guarda el universo abierto como un solo archivo para enviar a los jugadores, solo con las notas que has compartido",
        "fr": "Enregistrer l’univers ouvert en un seul fichier à envoyer aux joueurs, avec uniquement les notes partagées",
        "pt": "Salve o universo aberto como um único arquivo para enviar aos jogadores, só com as notas que você compartilhou"
    },
    "Saving…": {
        "de": "Wird gesichert …",
        "es": "Guardando…",
        "fr": "Enregistrement…",
        "pt": "Salvando…"
    },
    "Scorching": {
        "de": "Glühend heiß",
        "es": "Abrasador",
        "fr": "Brûlant",
        "pt": "Escaldante"
    },
    "Sea": {
        "de": "Meer",
        "es": "Mar",
        "fr": "Mer",
        "pt": "Mar"
    },
    "Search sectors": {
        "de": "Sektoren suchen",
        "es": "Buscar sectores",
        "fr": "Rechercher des secteurs",
        "pt": "Buscar setores"
    },
    "Search systems": {
        "de": "Systeme suchen",
        "es": "Buscar sistemas",
        "fr": "Rechercher des systèmes",
        "pt": "Buscar sistemas"
    },
    "Sector data © TravellerMap.com and its contributors. Traveller is a registered trademark of Far Future Enterprises.": {
        "de": "Sektordaten © TravellerMap.com und Mitwirkende. Traveller ist eine eingetragene Marke von Far Future Enterprises.",
        "es": "Datos de sector © TravellerMap.com y sus colaboradores. Traveller es una marca registrada de Far Future Enterprises.",
        "fr": "Données de secteur © TravellerMap.com et ses contributeurs. Traveller est une marque déposée de Far Future Enterprises.",
        "pt": "Dados dos setores © TravellerMap.com e seus colaboradores. Traveller é uma marca registrada da Far Future Enterprises."
    },
    "Sectors and subsectors from TravellerMap.com, every system filled in": {
        "de": "Sektoren und Subsektoren von TravellerMap.com, jedes System ausgefüllt",
        "es": "Sectores y subsectores de TravellerMap.com, con cada sistema completo",
        "fr": "Secteurs et sous-secteurs de TravellerMap.com, chaque système complété",
        "pt": "Setores e subsetores do TravellerMap.com, com cada sistema completo"
    },
    "Select another system and add it to the route": {
        "de": "Wähle ein weiteres System und füge es zur Route hinzu",
        "es": "Selecciona otro sistema y añádelo a la ruta",
        "fr": "Sélectionnez un autre système et ajoutez-le à l’itinéraire",
        "pt": "Selecione outro sistema e adicione-o à rota"
    },
    "Semi-major axis": {
        "de": "Große Halbachse",
        "es": "Semieje mayor",
        "fr": "Demi-grand axe",
        "pt": "Semieixo maior"
    },
    "Separation": {
        "de": "Abstand",
        "es": "Separación",
        "fr": "Séparation",
        "pt": "Separação"
    },
    "Services": {
        "de": "Dienstleistungen",
        "es": "Servicios",
        "fr": "Services",
        "pt": "Serviços"
    },
    "Settle": {
        "de": "Besiedeln",
        "es": "Poblar",
        "fr": "Peupler",
        "pt": "Povoar"
    },
    "Shade the side of each planet and moon facing away from its star": {
        "de": "Die vom Stern abgewandte Seite jedes Planeten und Mondes abdunkeln",
        "es": "Sombrea el lado de cada planeta y luna opuesto a su estrella",
        "fr": "Ombrer la face de chaque planète et lune opposée à son étoile",
        "pt": "Sombrear o lado de cada planeta e lua voltado para longe de sua estrela"
    },
    "Share with players": {
        "de": "Mit Spielern teilen",
        "es": "Compartir con los jugadores",
        "fr": "Partager avec les joueurs",
        "pt": "Compartilhar com jogadores"
    },
    "Shared notes go out with universes exported for players; others stay yours alone": {
        "de": "Geteilte Notizen gehen mit Universen, die für Spieler exportiert werden; andere bleiben nur bei dir",
        "es": "Las notas compartidas se incluyen en los universos exportados para jugadores; las demás son solo tuyas",
        "fr": "Les notes partagées accompagnent les univers exportés pour les joueurs ; les autres restent à vous seul",
        "pt": "Notas compartilhadas vão junto com universos exportados para jogadores; as outras ficam só com você"
    },
    "Shared with players": {
        "de": "Mit Spielern geteilt",
        "es": "Compartida con los jugadores",
        "fr": "Partagée avec les joueurs",
        "pt": "Compartilhada com jogadores"
    },
    "Shipyards and heavy traffic": {
        "de": "Werften und dichter Verkehr",
        "es": "Astilleros y tráfico intenso",
        "fr": "Chantiers navals et trafic intense",
        "pt": "Estaleiros e tráfego intenso"
    },
    "Show TravellerMap's map of the world": {
        "de": "TravellerMaps Karte der Welt zeigen",
        "es": "Muestra el mapa del mundo de TravellerMap",
        "fr": "Afficher la carte du monde de TravellerMap",
        "pt": "Mostrar o mapa do mundo do TravellerMap"
    },
    "Show every sector": {
        "de": "Alle Sektoren zeigen",
        "es": "Mostrar todos los sectores",
        "fr": "Afficher tous les secteurs",
        "pt": "Mostrar todos os setores"
    },
    "Show orbits": {
        "de": "Bahnen anzeigen",
        "es": "Mostrar órbitas",
        "fr": "Afficher les orbites",
        "pt": "Mostrar órbitas"
    },
    "Show the filters, which ring the systems that match them": {
        "de": "Filter einblenden, die passende Systeme mit Ringen markieren",
        "es": "Muestra los filtros, que rodean con un anillo los sistemas que coinciden",
        "fr": "Afficher les filtres, qui entourent les systèmes correspondants",
        "pt": "Mostrar os filtros, que circulam os sistemas correspondentes"
    },
    "Show the side panel": {
        "de": "Seitenleiste einblenden",
        "es": "Mostrar el panel lateral",
        "fr": "Afficher le panneau latéral",
        "pt": "Mostrar o painel lateral"
    },
    "Show the systems in reach of the last waypoint again": {
        "de": "Die Systeme in Reichweite des letzten Wegpunkts wieder anzeigen",
        "es": "Vuelve a mostrar los sistemas al alcance del último punto de paso",
        "fr": "Afficher à nouveau les systèmes à portée de la dernière étape",
        "pt": "Mostrar de novo os sistemas ao alcance do último ponto de passagem"
    },
    "Show travel advisories": {
        "de": "Reisewarnungen anzeigen",
        "es": "Mostrar avisos de viaje",
        "fr": "Afficher les conseils aux voyageurs",
        "pt": "Mostrar alertas de viagem"
    },
    "Showers": {
        "de": "Schauer",
        "es": "Chubascos",
        "fr": "Averses",
        "pt": "Pancadas de chuva"
    },
    "Size": {
        "de": "Größe",
        "es": "Tamaño",
        "fr": "Taille",
        "pt": "Tamanho"
    },
    "Small": {
        "de": "Klein",
        "es": "Pequeño",
        "fr": "Petit",
        "pt": "Pequeno"
    },
    "Space force": {
        "de": "Weltraumstreitkräfte",
        "es": "Fuerza espacial",
        "fr": "Force spatiale",
        "pt": "Força espacial"
    },
    "Spaceport": {
        "de": "Raumhafen",
        "es": "Puerto espacial",
        "fr": "Astroport",
        "pt": "Espaçoporto"
    },
    "Spin": {
        "de": "Drehsinn",
        "es": "Sentido",
        "fr": "Sens de rotation",
        "pt": "Sentido"
    },
    "Stand at the south pole": {
        "de": "Stand am Südpol",
        "es": "Base en el polo sur",
        "fr": "Socle au pôle sud",
        "pt": "Base no polo sul"
    },
    "Standard": {
        "de": "Standard",
        "es": "Estándar",
        "fr": "Standard",
        "pt": "Padrão"
    },
    "Star": {
        "de": "Stern",
        "es": "Estrella",
        "fr": "Étoile",
        "pt": "Estrela"
    },
    "Star %@": {
        "de": "Stern %@",
        "es": "Estrella %@",
        "fr": "Étoile %@",
        "pt": "Estrela %@"
    },
    "Star ID": {
        "de": "Stern-ID",
        "es": "ID de estrella",
        "fr": "ID de l’étoile",
        "pt": "ID da estrela"
    },
    "Star map": {
        "de": "Sternkarte",
        "es": "Mapa estelar",
        "fr": "Carte stellaire",
        "pt": "Mapa estelar"
    },
    "Star orbits": {
        "de": "Sternbahnen",
        "es": "Órbitas estelares",
        "fr": "Orbites stellaires",
        "pt": "Órbitas estelares"
    },
    "Star period": {
        "de": "Sternumlaufzeit",
        "es": "Período estelar",
        "fr": "Période stellaire",
        "pt": "Período estelar"
    },
    "Star systems shown": {
        "de": "Angezeigte Sternsysteme",
        "es": "Sistemas estelares mostrados",
        "fr": "Systèmes stellaires affichés",
        "pt": "Sistemas estelares exibidos"
    },
    "Starlight": {
        "de": "Sternlicht",
        "es": "Luz estelar",
        "fr": "Lumière stellaire",
        "pt": "Luz estelar"
    },
    "Starport": {
        "de": "Raumhafen",
        "es": "Puerto estelar",
        "fr": "Astroport",
        "pt": "Espaçoporto"
    },
    "Stars": {
        "de": "Sterne",
        "es": "Estrellas",
        "fr": "Étoiles",
        "pt": "Estrelas"
    },
    "Starting…": {
        "de": "Wird gestartet …",
        "es": "Iniciando…",
        "fr": "Démarrage…",
        "pt": "Iniciando…"
    },
    "Stateless": {
        "de": "Staatenlos",
        "es": "Sin Estado",
        "fr": "Sans État",
        "pt": "Sem Estado"
    },
    "Steam power, railways, factories": {
        "de": "Dampfkraft, Eisenbahnen, Fabriken",
        "es": "Máquina de vapor, ferrocarriles, fábricas",
        "fr": "Vapeur, chemins de fer, usines",
        "pt": "Máquina a vapor, ferrovias, fábricas"
    },
    "Steep roofs, dark timber and stone, conifers": {
        "de": "Steile Dächer, dunkles Holz und Stein, Nadelbäume",
        "es": "Tejados empinados, madera oscura y piedra, coníferas",
        "fr": "Toits raides, bois sombre et pierre, conifères",
        "pt": "Telhados íngremes, madeira escura e pedra, coníferas"
    },
    "Stellar cartography": {
        "de": "Sternkartografie",
        "es": "Cartografía estelar",
        "fr": "Cartographie stellaire",
        "pt": "Cartografia estelar"
    },
    "Stellar data": {
        "de": "Sterndaten",
        "es": "Datos estelares",
        "fr": "Données stellaires",
        "pt": "Dados estelares"
    },
    "Stellar remnant": {
        "de": "Sternüberrest",
        "es": "Remanente estelar",
        "fr": "Résidu stellaire",
        "pt": "Remanescente estelar"
    },
    "Stone tools, foraging and early farming": {
        "de": "Steinwerkzeuge, Sammeln und früher Ackerbau",
        "es": "Herramientas de piedra, recolección y agricultura primitiva",
        "fr": "Outils de pierre, cueillette et premières cultures",
        "pt": "Ferramentas de pedra, coleta e agricultura primitiva"
    },
    "Stop showing the systems in reach of the last waypoint": {
        "de": "Die Systeme in Reichweite des letzten Wegpunkts nicht mehr anzeigen",
        "es": "Deja de mostrar los sistemas al alcance del último punto de paso",
        "fr": "Ne plus afficher les systèmes à portée de la dernière étape",
        "pt": "Parar de mostrar os sistemas ao alcance do último ponto de passagem"
    },
    "Stopped": {
        "de": "Angehalten",
        "es": "Detenido",
        "fr": "Arrêté",
        "pt": "Parado"
    },
    "Storm": {
        "de": "Sturm",
        "es": "Tormenta",
        "fr": "Tempête",
        "pt": "Tempestade"
    },
    "Storms": {
        "de": "Stürme",
        "es": "Tormentas",
        "fr": "Tempêtes",
        "pt": "Tempestades"
    },
    "Street Layout": {
        "de": "Straßennetz",
        "es": "Trazado urbano",
        "fr": "Tracé des rues",
        "pt": "Traçado das Ruas"
    },
    "Strongest wind": {
        "de": "Stärkster Wind",
        "es": "Viento más fuerte",
        "fr": "Vent le plus fort",
        "pt": "Vento mais forte"
    },
    "Sub-Neptune": {
        "de": "Sub-Neptun",
        "es": "Subneptuno",
        "fr": "Sous-Neptune",
        "pt": "Subnetuno"
    },
    "Subdwarf": {
        "de": "Unterzwerg",
        "es": "Subenana",
        "fr": "Sous-naine",
        "pt": "Subanã"
    },
    "Subgiant": {
        "de": "Unterriese",
        "es": "Subgigante",
        "fr": "Sous-géante",
        "pt": "Subgigante"
    },
    "Subsector names changed too.": {
        "de": "Auch Subsektornamen wurden geändert.",
        "es": "También cambiaron nombres de subsector.",
        "fr": "Les noms de sous-secteurs ont aussi changé.",
        "pt": "Os nomes dos subsetores também mudaram."
    },
    "Subsistence": {
        "de": "Subsistenz",
        "es": "Subsistencia",
        "fr": "Subsistance",
        "pt": "Subsistência"
    },
    "Suggested: %@": {
        "de": "Vorgeschlagen: %@",
        "es": "Sugerido: %@",
        "fr": "Suggéré : %@",
        "pt": "Sugerido: %@"
    },
    "Sulfuric acid rain, evaporating before it lands": {
        "de": "Schwefelsäureregen, der vor dem Aufprall verdunstet",
        "es": "Lluvia de ácido sulfúrico que se evapora antes de llegar al suelo",
        "fr": "Pluie d’acide sulfurique, qui s’évapore avant de toucher le sol",
        "pt": "Chuva de ácido sulfúrico, que evapora antes de chegar ao solo"
    },
    "Sunny": {
        "de": "Sonnig",
        "es": "Soleado",
        "fr": "Ensoleillé",
        "pt": "Ensolarado"
    },
    "Super-Jupiter": {
        "de": "Super-Jupiter",
        "es": "Superjúpiter",
        "fr": "Super-Jupiter",
        "pt": "Superjúpiter"
    },
    "Supergiant": {
        "de": "Überriese",
        "es": "Supergigante",
        "fr": "Supergéante",
        "pt": "Supergigante"
    },
    "Supernova remnant": {
        "de": "Supernovaüberrest",
        "es": "Remanente de supernova",
        "fr": "Rémanent de supernova",
        "pt": "Remanescente de supernova"
    },
    "Surface resolution": {
        "de": "Oberflächenauflösung",
        "es": "Resolución de superficie",
        "fr": "Résolution des surfaces",
        "pt": "Resolução da superfície"
    },
    "Surface water": {
        "de": "Oberflächenwasser",
        "es": "Agua superficial",
        "fr": "Eau de surface",
        "pt": "Água superficial"
    },
    "Switch Map Type…": {
        "de": "Kartentyp wechseln …",
        "es": "Cambiar tipo de mapa…",
        "fr": "Changer de type de carte…",
        "pt": "Mudar Tipo de Mapa…"
    },
    "System": {
        "de": "System",
        "es": "Sistema",
        "fr": "Système",
        "pt": "Sistema"
    },
    "System ID": {
        "de": "System-ID",
        "es": "ID de sistema",
        "fr": "ID du système",
        "pt": "ID do sistema"
    },
    "T Tauri star": {
        "de": "T-Tauri-Stern",
        "es": "Estrella T Tauri",
        "fr": "Étoile T Tauri",
        "pt": "Estrela T Tauri"
    },
    "T dwarf (brown dwarf)": {
        "de": "T-Zwerg (Brauner Zwerg)",
        "es": "Enana T (enana marrón)",
        "fr": "Naine T (naine brune)",
        "pt": "Anã T (anã marrom)"
    },
    "Take any travel advisory off the system": {
        "de": "Jede Reisewarnung vom System entfernen",
        "es": "Quita cualquier aviso de viaje del sistema",
        "fr": "Retirer tout conseil aux voyageurs du système",
        "pt": "Remover qualquer alerta de viagem do sistema"
    },
    "Target": {
        "de": "Ziel",
        "es": "Objetivo",
        "fr": "Cible",
        "pt": "Alvo"
    },
    "Tech level": {
        "de": "Techstufe",
        "es": "Nivel tecnológico",
        "fr": "Niveau technologique",
        "pt": "Nível tecnológico"
    },
    "Technocracy": {
        "de": "Technokratie",
        "es": "Tecnocracia",
        "fr": "Technocratie",
        "pt": "Tecnocracia"
    },
    "Temperate": {
        "de": "Gemäßigt",
        "es": "Templado",
        "fr": "Tempéré",
        "pt": "Temperado"
    },
    "Temperature": {
        "de": "Temperatur",
        "es": "Temperatura",
        "fr": "Température",
        "pt": "Temperatura"
    },
    "Terminator": {
        "de": "Terminator",
        "es": "Terminador",
        "fr": "Terminateur",
        "pt": "Terminador"
    },
    "Terrestrial planet": {
        "de": "Gesteinsplanet",
        "es": "Planeta terrestre",
        "fr": "Planète tellurique",
        "pt": "Planeta terrestre"
    },
    "The Essential travel only and No travel filters and their rings, the Advisory buttons in the side panel, and the advisory a world's conditions suggest. Turn off for campaigns that don't use them; advisories already set are kept.": {
        "de": "Die Filter „Nur notwendige Reisen“ und „Keine Reisen“ mit ihren Ringen, die Warnungstasten in der Seitenleiste und die Warnung, die die Bedingungen einer Welt nahelegen. Für Kampagnen ohne Reisewarnungen ausschalten; bereits gesetzte Warnungen bleiben erhalten.",
        "es": "Los filtros Solo viajes esenciales y No viajar y sus anillos, los botones de Aviso del panel lateral y el aviso que sugieren las condiciones de un mundo. Desactívalo en campañas que no los usen; los avisos ya asignados se conservan.",
        "fr": "Les filtres Voyages essentiels uniquement et Aucun voyage et leurs anneaux, les boutons Conseil du panneau latéral, et le conseil que suggèrent les conditions d’un monde. Désactivez-les pour les campagnes qui ne s’en servent pas ; les conseils déjà définis sont conservés.",
        "pt": "Os filtros Somente viagens essenciais e Não viajar e seus anéis, os botões de Alerta no painel lateral e o alerta que as condições de um mundo sugerem. Desative em campanhas que não os usam; os alertas já definidos são mantidos."
    },
    "The chosen sectors have no worlds listed": {
        "de": "Die gewählten Sektoren enthalten keine Welten",
        "es": "Los sectores elegidos no tienen mundos listados",
        "fr": "Aucun monde n’est listé dans les secteurs choisis",
        "pt": "Os setores escolhidos não têm mundos listados"
    },
    "The expanding wreck of a supernova": {
        "de": "Die sich ausdehnenden Trümmer einer Supernova",
        "es": "Los restos en expansión de una supernova",
        "fr": "Les vestiges en expansion d’une supernova",
        "pt": "Os destroços em expansão de uma supernova"
    },
    "The globe couldn't be drawn.": {
        "de": "Der Globus konnte nicht gezeichnet werden.",
        "es": "No se pudo dibujar el globo.",
        "fr": "Le globe n’a pas pu être dessiné.",
        "pt": "Não foi possível desenhar o globo."
    },
    "The map couldn't be drawn for export.": {
        "de": "Die Karte konnte für den Export nicht gezeichnet werden.",
        "es": "No se pudo dibujar el mapa para exportarlo.",
        "fr": "La carte n’a pas pu être dessinée pour l’export.",
        "pt": "Não foi possível desenhar o mapa para exportação."
    },
    "The map couldn't be read.": {
        "de": "Die Karte konnte nicht gelesen werden.",
        "es": "No se pudo leer el mapa.",
        "fr": "La carte n’a pas pu être lue.",
        "pt": "Não foi possível ler o mapa."
    },
    "The new name shows wherever the app shows this %@. Leave it empty for the generated name.": {
        "de": "Der neue Name erscheint überall, wo die App dies zeigt (%@). Leer lassen für den generierten Namen.",
        "es": "El nuevo nombre aparece dondequiera que la app muestre este elemento (%@). Déjalo vacío para usar el nombre generado.",
        "fr": "Le nouveau nom s’affiche partout où l’app montre cet objet (%@). Laissez vide pour le nom généré.",
        "pt": "O novo nome aparece onde quer que o app mostre este(a) %@. Deixe vazio para usar o nome gerado."
    },
    "The sectors' worlds, routes and world maps, as TravellerMap lists them.": {
        "de": "Die Welten, Routen und Weltkarten der Sektoren, wie TravellerMap sie listet.",
        "es": "Los mundos, rutas y mapas del mundo de los sectores, tal como los lista TravellerMap.",
        "fr": "Les mondes, routes et cartes des mondes des secteurs, tels que TravellerMap les liste.",
        "pt": "Os mundos, rotas e mapas dos mundos dos setores, como o TravellerMap os lista."
    },
    "The seed generates everything TravellerMap doesn't list: the rest of each system and the details of its people.": {
        "de": "Der Startwert erzeugt alles, was TravellerMap nicht listet: den Rest jedes Systems und die Details seiner Bewohner.",
        "es": "La semilla genera todo lo que TravellerMap no lista: el resto de cada sistema y los detalles de su población.",
        "fr": "La graine génère tout ce que TravellerMap ne liste pas : le reste de chaque système et les détails de ses habitants.",
        "pt": "A semente gera tudo o que o TravellerMap não lista: o resto de cada sistema e os detalhes de seus povos."
    },
    "The shared universe every player has": {
        "de": "Das gemeinsame Universum aller Spieler",
        "es": "El universo compartido que tiene cada jugador",
        "fr": "L’univers partagé que tous les joueurs possèdent",
        "pt": "O universo compartilhado que todo jogador tem"
    },
    "The star field draws this many systems nearest the view, and brings in others as you fly with W and S. Fewer is faster.": {
        "de": "Das Sternfeld zeigt so viele Systeme nahe der Ansicht und lädt weitere nach, während du mit W und S fliegst. Weniger ist schneller.",
        "es": "El campo estelar dibuja esta cantidad de sistemas más cercanos a la vista y añade otros mientras vuelas con W y S. Menos es más rápido.",
        "fr": "Le champ d’étoiles affiche ce nombre de systèmes les plus proches de la vue, et en charge d’autres à mesure que vous volez avec W et S. Moins, c’est plus rapide.",
        "pt": "O campo estelar desenha esta quantidade de sistemas mais próximos da vista e carrega outros conforme você voa com W e S. Menos é mais rápido."
    },
    "The universe's TravellerMap data couldn't be read": {
        "de": "Die TravellerMap-Daten des Universums konnten nicht gelesen werden",
        "es": "No se pudieron leer los datos de TravellerMap del universo",
        "fr": "Les données TravellerMap de l’univers n’ont pas pu être lues",
        "pt": "Não foi possível ler os dados do TravellerMap do universo"
    },
    "The versions of TravellerMap's data this universe has fetched, and which is in use": {
        "de": "Die Versionen der TravellerMap-Daten, die dieses Universum geladen hat, und welche verwendet wird",
        "es": "Las versiones de los datos de TravellerMap que ha descargado este universo, y cuál está en uso",
        "fr": "Les versions des données de TravellerMap récupérées par cet univers, et celle utilisée",
        "pt": "As versões dos dados do TravellerMap que este universo baixou, e qual está em uso"
    },
    "The weather all over this world now: precipitation radar and temperature maps, with its winds and storms": {
        "de": "Das aktuelle Wetter auf der ganzen Welt: Niederschlagsradar und Temperaturkarten, mit Winden und Stürmen",
        "es": "El tiempo en todo este mundo ahora: radar de precipitación y mapas de temperatura, con sus vientos y tormentas",
        "fr": "La météo actuelle sur tout ce monde : radar de précipitations et cartes de température, avec ses vents et ses tempêtes",
        "pt": "O tempo agora em todo este mundo: radar de precipitação e mapas de temperatura, com seus ventos e tempestades"
    },
    "Theocracy": {
        "de": "Theokratie",
        "es": "Teocracia",
        "fr": "Théocratie",
        "pt": "Teocracia"
    },
    "There are no shared notes here.": {
        "de": "Hier gibt es keine geteilten Notizen.",
        "es": "Aquí no hay notas compartidas.",
        "fr": "Il n’y a aucune note partagée ici.",
        "pt": "Não há notas compartilhadas aqui."
    },
    "Thunderstorms": {
        "de": "Gewitter",
        "es": "Tormentas eléctricas",
        "fr": "Orages",
        "pt": "Trovoadas"
    },
    "Tidal lock": {
        "de": "Gebundene Rotation",
        "es": "Acoplamiento de marea",
        "fr": "Rotation synchrone",
        "pt": "Acoplamento de maré"
    },
    "To %@": {
        "de": "Zu %@",
        "es": "Con %@",
        "fr": "Avec %@",
        "pt": "Com %@"
    },
    "To its planet": {
        "de": "Zum Planeten",
        "es": "Con su planeta",
        "fr": "Avec sa planète",
        "pt": "Com seu planeta"
    },
    "To its star, 1:1": {
        "de": "Zum Stern, 1:1",
        "es": "Con su estrella, 1:1",
        "fr": "Avec son étoile, 1:1",
        "pt": "Com sua estrela, 1:1"
    },
    "To its star, 3:2 resonance": {
        "de": "Zum Stern, 3:2-Resonanz",
        "es": "Con su estrella, resonancia 3:2",
        "fr": "Avec son étoile, résonance 3:2",
        "pt": "Com sua estrela, ressonância 3:2"
    },
    "Top view": {
        "de": "Draufsicht",
        "es": "Vista cenital",
        "fr": "Vue du dessus",
        "pt": "Vista superior"
    },
    "Total": {
        "de": "Gesamt",
        "es": "Total",
        "fr": "Total",
        "pt": "Total"
    },
    "Tourism": {
        "de": "Tourismus",
        "es": "Turismo",
        "fr": "Tourisme",
        "pt": "Turismo"
    },
    "Town": {
        "de": "Kleinstadt",
        "es": "Pueblo",
        "fr": "Bourg",
        "pt": "Vila"
    },
    "Trace": {
        "de": "Spuren",
        "es": "Trazas",
        "fr": "Traces",
        "pt": "Vestígios"
    },
    "Trailing trojan": {
        "de": "Nachfolgender Trojaner",
        "es": "Troyano trasero",
        "fr": "Troyen arrière",
        "pt": "Troiano atrás"
    },
    "Travel between the stars": {
        "de": "Reisen zwischen den Sternen",
        "es": "Viajes entre las estrellas",
        "fr": "Voyages entre les étoiles",
        "pt": "Viagens entre as estrelas"
    },
    "Traveller hex maps": {
        "de": "Traveller-Hexkarten",
        "es": "Mapas hexagonales de Traveller",
        "fr": "Cartes hexagonales Traveller",
        "pt": "Mapas hexagonais de Traveller"
    },
    "TravellerMap answered %lld for %@": {
        "de": "TravellerMap antwortete %lld für %@",
        "es": "TravellerMap respondió %lld para %@",
        "fr": "TravellerMap a répondu %lld pour %@",
        "pt": "O TravellerMap respondeu %lld para %@"
    },
    "TravellerMap has updated %@": {
        "de": "TravellerMap hat %@ aktualisiert",
        "es": "TravellerMap ha actualizado %@",
        "fr": "TravellerMap a mis à jour %@",
        "pt": "O TravellerMap atualizou %@"
    },
    "Tropical": {
        "de": "Tropisch",
        "es": "Tropical",
        "fr": "Tropical",
        "pt": "Tropical"
    },
    "Tropical cyclone, category %lld": {
        "de": "Tropischer Wirbelsturm, Kategorie %lld",
        "es": "Ciclón tropical, categoría %lld",
        "fr": "Cyclone tropical, catégorie %lld",
        "pt": "Ciclone tropical, categoria %lld"
    },
    "Tropical storm": {
        "de": "Tropischer Sturm",
        "es": "Tormenta tropical",
        "fr": "Tempête tropicale",
        "pt": "Tempestade tropical"
    },
    "True anomaly": {
        "de": "Wahre Anomalie",
        "es": "Anomalía verdadera",
        "fr": "Anomalie vraie",
        "pt": "Anomalia verdadeira"
    },
    "Try Again": {
        "de": "Erneut versuchen",
        "es": "Reintentar",
        "fr": "Réessayer",
        "pt": "Tentar de Novo"
    },
    "Twilight": {
        "de": "Dämmerung",
        "es": "Crepúsculo",
        "fr": "Crépuscule",
        "pt": "Crepúsculo"
    },
    "Type": {
        "de": "Typ",
        "es": "Tipo",
        "fr": "Type",
        "pt": "Tipo"
    },
    "Uniform": {
        "de": "Einheitlich",
        "es": "Uniforme",
        "fr": "Uniforme",
        "pt": "Uniforme"
    },
    "Unitary": {
        "de": "Unitarisch",
        "es": "Unitario",
        "fr": "Unitaire",
        "pt": "Unitário"
    },
    "Universe for players": {
        "de": "Universum für Spieler",
        "es": "Universo para jugadores",
        "fr": "Univers pour les joueurs",
        "pt": "Universo para jogadores"
    },
    "Unnamed": {
        "de": "Unbenannt",
        "es": "Sin nombre",
        "fr": "Sans nom",
        "pt": "Sem nome"
    },
    "Unrestricted": {
        "de": "Unbeschränkt",
        "es": "Sin restricciones",
        "fr": "Sans restriction",
        "pt": "Irrestrito"
    },
    "Unsettled": {
        "de": "Unbeständig",
        "es": "Inestable",
        "fr": "Instable",
        "pt": "Instável"
    },
    "Updating star field…": {
        "de": "Sternfeld wird aktualisiert …",
        "es": "Actualizando el campo estelar…",
        "fr": "Mise à jour du champ d’étoiles…",
        "pt": "Atualizando o campo estelar…"
    },
    "Updating the universe…": {
        "de": "Universum wird aktualisiert …",
        "es": "Actualizando el universo…",
        "fr": "Mise à jour de l’univers…",
        "pt": "Atualizando o universo…"
    },
    "Use": {
        "de": "Nutzen",
        "es": "Usar",
        "fr": "Utiliser",
        "pt": "Usar"
    },
    "Use Generated Name": {
        "de": "Generierten Namen verwenden",
        "es": "Usar nombre generado",
        "fr": "Utiliser le nom généré",
        "pt": "Usar Nome Gerado"
    },
    "Use New": {
        "de": "Neue nutzen",
        "es": "Usar la nueva",
        "fr": "Utiliser la nouvelle",
        "pt": "Usar a Nova"
    },
    "Use generated values": {
        "de": "Generierte Werte nutzen",
        "es": "Usar valores generados",
        "fr": "Valeurs générées",
        "pt": "Usar valores gerados"
    },
    "Use suggested": {
        "de": "Vorschlag nutzen",
        "es": "Usar sugerido",
        "fr": "Appliquer",
        "pt": "Usar sugerido"
    },
    "Variable": {
        "de": "Veränderlich",
        "es": "Variable",
        "fr": "Variable",
        "pt": "Variável"
    },
    "Village": {
        "de": "Dorf",
        "es": "Aldea",
        "fr": "Village",
        "pt": "Aldeia"
    },
    "W": {
        "de": "W",
        "es": "O",
        "fr": "O",
        "pt": "O"
    },
    "W / S fly toward / away from the pointer · ⇧ faster": {
        "de": "W / S zum Zeiger hin / davon weg fliegen · ⇧ schneller",
        "es": "W / S vuelan hacia / desde el puntero · ⇧ más rápido",
        "fr": "W / S : avancer / reculer vers le pointeur · ⇧ plus vite",
        "pt": "W / S voa em direção a / para longe do ponteiro · ⇧ mais rápido"
    },
    "War": {
        "de": "Krieg",
        "es": "Guerra",
        "fr": "Guerre",
        "pt": "Guerra"
    },
    "Water": {
        "de": "Wasser",
        "es": "Agua",
        "fr": "Eau",
        "pt": "Água"
    },
    "Water and wind mills, castles, guilds": {
        "de": "Wasser- und Windmühlen, Burgen, Zünfte",
        "es": "Molinos de agua y de viento, castillos, gremios",
        "fr": "Moulins à eau et à vent, châteaux, guildes",
        "pt": "Moinhos de água e de vento, castelos, guildas"
    },
    "Waterfall": {
        "de": "Wasserfall",
        "es": "Cascada",
        "fr": "Cascade",
        "pt": "Cachoeira"
    },
    "Waypoints": {
        "de": "Wegpunkte",
        "es": "Puntos de paso",
        "fr": "Étapes",
        "pt": "Pontos de passagem"
    },
    "Weather": {
        "de": "Wetter",
        "es": "Meteorología",
        "fr": "Météo",
        "pt": "Tempo"
    },
    "White dwarf": {
        "de": "Weißer Zwerg",
        "es": "Enana blanca",
        "fr": "Naine blanche",
        "pt": "Anã branca"
    },
    "Wind %lld km/h from the %@": {
        "de": "Wind %lld km/h aus %@",
        "es": "Viento de %lld km/h del %@",
        "fr": "Vent de %lld km/h venant du %@",
        "pt": "Vento de %lld km/h de %@"
    },
    "With a filter mask": {
        "de": "Mit Filtermaske",
        "es": "Con máscara filtrante",
        "fr": "Avec un masque filtrant",
        "pt": "Com máscara filtrante"
    },
    "Wolf–Rayet star": {
        "de": "Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet",
        "fr": "Étoile Wolf–Rayet",
        "pt": "Estrela Wolf–Rayet"
    },
    "World Map": {
        "de": "Weltkarte",
        "es": "Mapa del mundo",
        "fr": "Carte du monde",
        "pt": "Mapa do Mundo"
    },
    "World map © TravellerMap.com and its contributors": {
        "de": "Weltkarte © TravellerMap.com und Mitwirkende",
        "es": "Mapa del mundo © TravellerMap.com y sus colaboradores",
        "fr": "Carte du monde © TravellerMap.com et ses contributeurs",
        "pt": "Mapa do mundo © TravellerMap.com e seus colaboradores"
    },
    "World's style": {
        "de": "Stil der Welt",
        "es": "Estilo del mundo",
        "fr": "Style du monde",
        "pt": "Estilo do mundo"
    },
    "Worlds": {
        "de": "Welten",
        "es": "Mundos",
        "fr": "Mondes",
        "pt": "Mundos"
    },
    "Xboat routes  %lld": {
        "de": "Xboat-Routen  %lld",
        "es": "Rutas Xboat  %lld",
        "fr": "Routes Xboat  %lld",
        "pt": "Rotas Xboat  %lld"
    },
    "Y dwarf (brown dwarf)": {
        "de": "Y-Zwerg (Brauner Zwerg)",
        "es": "Enana Y (enana marrón)",
        "fr": "Naine Y (naine brune)",
        "pt": "Anã Y (anã marrom)"
    },
    "Year": {
        "de": "Jahr",
        "es": "Año",
        "fr": "Année",
        "pt": "Ano"
    },
    "Yes": {
        "de": "Ja",
        "es": "Sí",
        "fr": "Oui",
        "pt": "Sim"
    },
    "Zone": {
        "de": "Zone",
        "es": "Zona",
        "fr": "Zone",
        "pt": "Zona"
    },
    "Zoom to the selected world's subsector": {
        "de": "Auf den Subsektor der gewählten Welt zoomen",
        "es": "Acercar al subsector del mundo seleccionado",
        "fr": "Zoomer sur le sous-secteur du monde sélectionné",
        "pt": "Ampliar até o subsetor do mundo selecionado"
    },
    "cells": {
        "de": "Zellen",
        "es": "celdas",
        "fr": "cellules",
        "pt": "células"
    },
    "companion": {
        "de": "Begleiter",
        "es": "compañera",
        "fr": "compagnon",
        "pt": "companheira"
    },
    "ice": {
        "de": "Eis",
        "es": "hielo",
        "fr": "glace",
        "pt": "gelo"
    },
    "km across": {
        "de": "km Durchmesser",
        "es": "km de diámetro",
        "fr": "km de diamètre",
        "pt": "km de diâmetro"
    },
    "ly across": {
        "de": "Lj Durchmesser",
        "es": "ly de diámetro",
        "fr": "al de diamètre",
        "pt": "ly de diâmetro"
    },
    "minor changes": {
        "de": "kleine Änderungen",
        "es": "cambios menores",
        "fr": "modifications mineures",
        "pt": "pequenas alterações"
    },
    "ocean": {
        "de": "Ozean",
        "es": "océano",
        "fr": "océan",
        "pt": "oceano"
    },
    "primary": {
        "de": "Hauptstern",
        "es": "primaria",
        "fr": "primaire",
        "pt": "primária"
    },
    "secondary": {
        "de": "Sekundärstern",
        "es": "secundaria",
        "fr": "secondaire",
        "pt": "secundária"
    },
    "subsector names changed": {
        "de": "Subsektornamen geändert",
        "es": "nombres de subsector cambiados",
        "fr": "noms de sous-secteurs modifiés",
        "pt": "nomes de subsetores alterados"
    },
    "to": {
        "de": "bis",
        "es": "a",
        "fr": "à",
        "pt": "a"
    },
    "was %@": {
        "de": "war %@",
        "es": "antes %@",
        "fr": "auparavant %@",
        "pt": "era %@"
    },
    "largest group %@%, one other group %@%": {
        "de": "größte Gruppe %@ %, eine weitere Gruppe %@ %",
        "es": "grupo más numeroso %@%, otro grupo %@%",
        "fr": "groupe le plus nombreux %@ %, un autre groupe %@ %",
        "pt": "maior grupo %@%, outro grupo %@%"
    },
    "largest group %@%, %@ other groups %@%": {
        "de": "größte Gruppe %@ %, %@ weitere Gruppen %@ %",
        "es": "grupo más numeroso %@%, %@ otros grupos %@%",
        "fr": "groupe le plus nombreux %@ %, %@ autres groupes %@ %",
        "pt": "maior grupo %@%, %@ outros grupos %@%"
    }
};

export const languages = [
    { code: '', name: null },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
];

/** The language in use: the setting, or the browser's language when the setting follows the system */
export function currentLanguage() {
    const chosen = Settings.get('appLanguage');
    if (chosen) return chosen;
    for (const preferred of navigator.languages ?? [navigator.language]) {
        const code = preferred.slice(0, 2).toLowerCase();
        if (['en', 'pt', 'es', 'de', 'fr'].includes(code)) return code;
    }
    return 'en';
}

/** The locale for dates and numbers: the chosen language, or the browser's */
export function locale() {
    const candidate = Settings.get('appLanguage') || navigator.language || 'en';
    try {
        return Intl.getCanonicalLocales(candidate.split('@')[0])[0] ?? 'en';
    } catch {
        return 'en';
    }
}

/** A translated string, with %@, %lld and %.nf replaced by the arguments in order */
export function t(key, ...args) {
    const language = currentLanguage();
    const text = (language !== 'en' && translations[key]?.[language]) || key;
    let index = 0;
    return text.replace(/%(?:(\d+)\$)?(@|lld|d|\.(\d)f)/g, (match, position, kind, digits) => {
        const value = args[position ? Number(position) - 1 : index++];
        if (digits !== undefined) return Number(value).toLocaleString(locale(), { minimumFractionDigits: Number(digits), maximumFractionDigits: Number(digits), useGrouping: false });
        if (kind === 'lld' || kind === 'd') return String(value);
        return String(value);
    });
}
