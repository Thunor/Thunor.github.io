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
        "cs": "%.1f×",
        "da": "%.1f×",
        "de": "%.1f×",
        "es": "x%.1f",
        "fr": "%.1f×",
        "pt": "%.1f×",
        "sv": "%.1f×"
    },
    "AU": {
        "cs": "au",
        "da": "AE",
        "de": "AE",
        "es": "ua",
        "fr": "ua",
        "pt": "UA",
        "sv": "AE"
    },
    "Accretion": {
        "cs": "Akrece",
        "da": "Akkretion",
        "de": "Akkretion",
        "es": "Acreción",
        "fr": "Accrétion",
        "pt": "Acreção",
        "sv": "Ackretion"
    },
    "Add Sample Sector": {
        "cs": "Přidat ukázkový sektor",
        "da": "Tilføj eksempelsektor",
        "de": "Beispielsektor hinzufügen",
        "es": "Añadir sector de ejemplo",
        "fr": "Ajouter un secteur d’exemple",
        "pt": "Adicionar Setor de Exemplo",
        "sv": "Lägg till exempelsektor"
    },
    "Az %.1f": {
        "cs": "Az %.1f",
        "da": "Az %.1f",
        "de": "Az %.1f",
        "es": "Az %.1f",
        "fr": "Az %.1f",
        "pt": "Az %.1f",
        "sv": "Az %.1f"
    },
    "Cancel": {
        "cs": "Zrušit",
        "da": "Annuller",
        "de": "Abbrechen",
        "es": "Cancelar",
        "fr": "Annuler",
        "pt": "Cancelar",
        "sv": "Avbryt"
    },
    "Choose": {
        "cs": "Vybrat",
        "da": "Vælg",
        "de": "Auswählen",
        "es": "Elegir",
        "fr": "Choisir",
        "pt": "Escolher",
        "sv": "Välj"
    },
    "Choose a universe folder (one containing starfield.json)": {
        "cs": "Vyberte složku vesmíru (obsahující starfield.json)",
        "da": "Vælg en universmappe (en, der indeholder starfield.json)",
        "de": "Universumsordner auswählen (einen Ordner mit starfield.json)",
        "es": "Elige una carpeta de universo (una que contenga starfield.json)",
        "fr": "Choisissez un dossier d’univers (contenant starfield.json).",
        "pt": "Escolha uma pasta de universo (que contenha starfield.json)",
        "sv": "Välj en universummapp (en som innehåller starfield.json)"
    },
    "Choose a universe folder (one containing starfield.json), or a .zip of one.": {
        "cs": "Vyberte složku vesmíru (obsahující starfield.json) nebo její .zip.",
        "da": "Vælg en universmappe (en, der indeholder starfield.json), eller en .zip af en.",
        "de": "Wähle einen Universum-Ordner (mit einer starfield.json) oder ein .zip davon.",
        "es": "Elige una carpeta de universo (que contenga starfield.json), o un .zip de una.",
        "fr": "Choisissez un dossier d’univers (contenant starfield.json), ou un .zip d’un tel dossier.",
        "pt": "Escolha uma pasta de universo (com um starfield.json), ou um .zip de uma.",
        "sv": "Välj en universummapp (en som innehåller starfield.json), eller en .zip av en."
    },
    "Choose…": {
        "cs": "Vybrat…",
        "da": "Vælg…",
        "de": "Auswählen …",
        "es": "Elegir…",
        "fr": "Choisir…",
        "pt": "Escolher…",
        "sv": "Välj…"
    },
    "Choosing a folder needs Chrome, Edge or another Chromium browser.": {
        "cs": "K výběru složky je potřeba Chrome, Edge nebo jiný prohlížeč založený na Chromiu.",
        "da": "For at vælge en mappe skal du bruge Chrome, Edge eller en anden Chromium-browser.",
        "de": "Zum Auswählen eines Ordners brauchst du Chrome, Edge oder einen anderen Chromium-Browser.",
        "es": "Para eleger una carpeta se necesita Chrome, Edge u otro navegador Chromium.",
        "fr": "Choisir un dossier nécessite Chrome, Edge ou un autre navigateur Chromium.",
        "pt": "Escolher uma pasta requer o Chrome, o Edge ou outro navegador Chromium.",
        "sv": "För att välja en mapp behövs Chrome, Edge eller en annan Chromium-webbläsare."
    },
    "Clear": {
        "cs": "Vymazat",
        "da": "Ryd",
        "de": "Entfernen",
        "es": "Borrar",
        "fr": "Effacer",
        "pt": "Limpar",
        "sv": "Rensa"
    },
    "Close": {
        "cs": "Zavřít",
        "da": "Luk",
        "de": "Schließen",
        "es": "Cerrar",
        "fr": "Fermer",
        "pt": "Fechar",
        "sv": "Stäng"
    },
    "Cloud layers over the globes of planets with atmospheres.": {
        "cs": "Vrstvy mraků nad glóby planet s atmosférou.",
        "da": "Skylag over globusserne for planeter med atmosfære.",
        "de": "Wolkenschichten über den Globen von Planeten mit Atmosphäre.",
        "es": "Capas de nubes sobre los globos de los planetas con atmósfera.",
        "fr": "Couches nuageuses au-dessus des globes des planètes dotées d’une atmosphère.",
        "pt": "Camadas de nuvens sobre os globos dos planetas com atmosfera.",
        "sv": "Molnlager över globerna för planeter med atmosfär."
    },
    "Copying files… %lld of %lld": {
        "cs": "Kopírování souborů… %lld z %lld",
        "da": "Kopierer filer… %lld af %lld",
        "de": "Dateien werden kopiert … %lld von %lld",
        "es": "Copiando archivos… %lld de %lld",
        "fr": "Copie des fichiers… %lld sur %lld",
        "pt": "A copiar ficheiros… %lld de %lld",
        "sv": "Kopierar filer… %lld av %lld"
    },
    "Couldn't create a new universe": {
        "cs": "Nový vesmír se nepodařilo vytvořit",
        "da": "Kunne ikke oprette et nyt univers",
        "de": "Neues Universum konnte nicht erstellt werden",
        "es": "No se ha podido crear un nuevo universo",
        "fr": "Impossible de créer un nouvel univers",
        "pt": "Não foi possível criar um novo universo",
        "sv": "Det gick inte att skapa ett nytt universum"
    },
    "Couldn't delete the universe": {
        "cs": "Vesmír se nepodařilo smazat",
        "da": "Kunne ikke slette universet",
        "de": "Universum konnte nicht gelöscht werden",
        "es": "No se ha podido eliminar el universo",
        "fr": "Impossible de supprimer l’univers",
        "pt": "Não foi possível apagar o universo",
        "sv": "Det gick inte att radera universumet"
    },
    "Couldn't open the universe": {
        "cs": "Vesmír se nepodařilo otevřít",
        "da": "Kunne ikke åbne universet",
        "de": "Universum konnte nicht geöffnet werden",
        "es": "No se ha podido abrir el universo",
        "fr": "Impossible d’ouvrir l’univers",
        "pt": "Não foi possível abrir o universo",
        "sv": "Det gick inte att öppna universumet"
    },
    "Couldn't rename the universe": {
        "cs": "Vesmír se nepodařilo přejmenovat",
        "da": "Kunne ikke omdøbe universet",
        "de": "Universum konnte nicht umbenannt werden",
        "es": "No se ha podido cambiar el nombre del universo",
        "fr": "Impossible de renommer l’univers",
        "pt": "Não foi possível renomear o universo",
        "sv": "Det gick inte att byta namn på universumet"
    },
    "Couldn't save the universe": {
        "cs": "Vesmír se nepodařilo uložit",
        "da": "Kunne ikke gemme universet",
        "de": "Universum konnte nicht gesichert werden",
        "es": "No se ha podido guardar el universo",
        "fr": "Impossible d’enregistrer l’univers",
        "pt": "Não foi possível salvar o universo",
        "sv": "Det gick inte att spara universumet"
    },
    "Create": {
        "cs": "Vytvořit",
        "da": "Opret",
        "de": "Erstellen",
        "es": "Crear",
        "fr": "Créer",
        "pt": "Criar",
        "sv": "Skapa"
    },
    "Created %@": {
        "cs": "Vytvořeno %@",
        "da": "Oprettet %@",
        "de": "Erstellt am %@",
        "es": "Creado el %@",
        "fr": "Créé le %@",
        "pt": "Criado em %@",
        "sv": "Skapat %@"
    },
    "Currently open": {
        "cs": "Právě otevřený",
        "da": "Åben nu",
        "de": "Geöffnet",
        "es": "Abierto",
        "fr": "Ouvert",
        "pt": "Aberto",
        "sv": "Öppet nu"
    },
    "Delete": {
        "cs": "Smazat",
        "da": "Slet",
        "de": "Löschen",
        "es": "Eliminar",
        "fr": "Supprimer",
        "pt": "Apagar",
        "sv": "Radera"
    },
    "Delete “%@”?": {
        "cs": "Smazat „%@“?",
        "da": "Slet “%@”?",
        "de": "„%@“ löschen?",
        "es": "¿Eliminar “%@”?",
        "fr": "Supprimer « %@ » ?",
        "pt": "Apagar “%@”?",
        "sv": "Radera ”%@”?"
    },
    "Done": {
        "cs": "Hotovo",
        "da": "Færdig",
        "de": "Fertig",
        "es": "OK",
        "fr": "OK",
        "pt": "OK",
        "sv": "Klar"
    },
    "Downloaded “%@”. Unzip it to get a folder the macOS app can open.": {
        "cs": "Staženo „%@“. Rozbalte jej a získáte složku, kterou aplikace pro macOS otevře.",
        "da": "Hentede “%@”. Pak den ud for at få en mappe, som macOS-appen kan åbne.",
        "de": "„%@“ wurde geladen. Entpacke es, um einen Ordner zu erhalten, den die macOS-App öffnen kann.",
        "es": "Se descargó “%@”. Descomprímelo para obtener una carpeta que la app de macOS pueda abrir.",
        "fr": "« %@ » téléchargé. Décompressez-le pour obtenir un dossier que l’app macOS peut ouvrir.",
        "pt": "“%@” descarregado. Descomprima-o para obter uma pasta que a app para macOS consegue abrir.",
        "sv": "Hämtade ”%@”. Packa upp den för att få en mapp som macOS-appen kan öppna."
    },
    "Drawing surface map…": {
        "cs": "Kreslí se mapa povrchu…",
        "da": "Tegner overfladekort…",
        "de": "Oberflächenkarte wird gezeichnet …",
        "es": "Dibujando mapa de superficie…",
        "fr": "Tracé de la carte de surface…",
        "pt": "Desenhando mapa da superfície…",
        "sv": "Ritar ytkarta…"
    },
    "Drawing…": {
        "cs": "Kreslí se…",
        "da": "Tegner…",
        "de": "Wird gezeichnet …",
        "es": "Dibujando…",
        "fr": "Dessin…",
        "pt": "A desenhar…",
        "sv": "Ritar…"
    },
    "El %.1f": {
        "cs": "El %.1f",
        "da": "El %.1f",
        "de": "El %.1f",
        "es": "El %.1f",
        "fr": "Él %.1f",
        "pt": "El %.1f",
        "sv": "El %.1f"
    },
    "Exoplanet statistics": {
        "cs": "Statistika exoplanet",
        "da": "Exoplanetstatistik",
        "de": "Exoplaneten-Statistik",
        "es": "Estadísticas de exoplanetas",
        "fr": "Statistiques d’exoplanètes",
        "pt": "Estatísticas de exoplanetas",
        "sv": "Exoplanetstatistik"
    },
    "Exoplanet statistics draws each system's planets from what surveys have found round real stars. Accretion forms them as Stephen Dole's simulation did: protoplanets sweeping up a disc of dust and gas until none is left, the larger ones pulling in gas to become giants. Applies to star systems generated afterwards.": {
        "cs": "Statistika exoplanet bere planety každé soustavy z toho, co přehlídky našly u skutečných hvězd. Akrece je vytváří jako simulace Stephena Dolea: protoplanety vymetají disk prachu a plynu, dokud nic nezbude, a ty větší přitahují plyn a stávají se obry. Platí pro hvězdné soustavy vygenerované poté.",
        "da": "Exoplanetstatistik henter hvert systems planeter fra det, undersøgelser har fundet omkring virkelige stjerner. Akkretion danner dem, som Stephen Doles simulering gjorde: protoplaneter, der fejer en skive af støv og gas, til intet er tilbage, mens de største trækker gas til sig og bliver til kæmper. Gælder for stjernesystemer, der genereres bagefter.",
        "de": "„Exoplaneten-Statistik“ wählt die Planeten jedes Systems nach dem, was Durchmusterungen um echte Sterne gefunden haben. „Akkretion“ lässt sie entstehen wie in Stephen Doles Simulation: Protoplaneten fegen eine Scheibe aus Staub und Gas leer, bis nichts mehr übrig ist, und die größeren ziehen Gas an und werden zu Riesen. Gilt für danach erzeugte Sternsysteme.",
        "es": "Estadísticas de exoplanetas toma los planetas de cada sistema de lo que los sondeos han encontrado alrededor de estrellas reales. Acreción los forma como lo hacía la simulación de Stephen Dole: protoplanetas que barren un disco de polvo y gas hasta que no queda nada, y los mayores atraen gas y se convierten en gigantes. Se aplica a los sistemas estelares generados después.",
        "fr": "Statistiques d’exoplanètes tire les planètes de chaque système de ce que les relevés ont trouvé autour des étoiles réelles. Accrétion les forme comme le faisait la simulation de Stephen Dole : des protoplanètes balaient un disque de poussière et de gaz jusqu’à ce qu’il n’en reste rien, les plus grosses attirant du gaz pour devenir des géantes. S’applique aux systèmes stellaires générés ensuite.",
        "pt": "Estatísticas de exoplanetas tira os planetas de cada sistema do que os levantamentos encontraram em torno de estrelas reais. Acreção os forma como a simulação de Stephen Dole: protoplanetas varrendo um disco de poeira e gás até não sobrar nada, os maiores atraindo gás e virando gigantes. Aplica-se aos sistemas estelares gerados depois.",
        "sv": "Exoplanetstatistik hämtar varje systems planeter från det som kartläggningar har hittat kring verkliga stjärnor. Ackretion bildar dem så som Stephen Doles simulering gjorde: protoplaneter som sveper upp en skiva av stoft och gas tills inget finns kvar, där de större drar till sig gas och blir jättar. Gäller stjärnsystem som genereras efteråt."
    },
    "File": {
        "cs": "Soubor",
        "da": "Arkiv",
        "de": "Ablage",
        "es": "Archivo",
        "fr": "Fichier",
        "pt": "Ficheiro",
        "sv": "Arkiv"
    },
    "Generating star field…": {
        "cs": "Generuje se hvězdné pole…",
        "da": "Genererer stjernefelt…",
        "de": "Sternfeld wird erzeugt …",
        "es": "Generando el campo estelar…",
        "fr": "Génération du champ d’étoiles…",
        "pt": "A gerar o campo estelar…",
        "sv": "Genererar stjärnfält…"
    },
    "Gyr": {
        "cs": "mld. let",
        "da": "mia. år",
        "de": "Mrd. J.",
        "es": "Ga",
        "fr": "Ga",
        "pt": "Ga",
        "sv": "md år"
    },
    "How the panels and controls over the star map are drawn.": {
        "cs": "Jak se kreslí panely a ovládací prvky nad hvězdnou mapou.",
        "da": "Hvordan panelerne og betjeningselementerne over stjernekortet tegnes.",
        "de": "Wie die Bedienfelder und Steuerelemente über der Sternkarte gezeichnet werden.",
        "es": "Cómo se dibujan los paneles y controles sobre el mapa estelar.",
        "fr": "Comment sont dessinés les panneaux et commandes au-dessus de la carte stellaire.",
        "pt": "Como são desenhados os painéis e controlos sobre o mapa estelar.",
        "sv": "Hur panelerna och reglagen över stjärnkartan ritas."
    },
    "Interface style": {
        "cs": "Styl rozhraní",
        "da": "Grænsefladestil",
        "de": "Darstellungsstil",
        "es": "Estilo de la interfaz",
        "fr": "Style de l’interface",
        "pt": "Estilo da interface",
        "sv": "Gränssnittsstil"
    },
    "Language": {
        "cs": "Jazyk",
        "da": "Sprog",
        "de": "Sprache",
        "es": "Idioma",
        "fr": "Langue",
        "pt": "Idioma",
        "sv": "Språk"
    },
    "Load Block": {
        "cs": "Načíst blok",
        "da": "Indlæs blok",
        "de": "Block laden",
        "es": "Cargar bloque",
        "fr": "Charger le bloc",
        "pt": "Carregar Bloco",
        "sv": "Läs in block"
    },
    "Loading universe…": {
        "cs": "Načítá se vesmír…",
        "da": "Indlæser univers…",
        "de": "Universum wird geladen …",
        "es": "Cargando el universo…",
        "fr": "Chargement de l’univers…",
        "pt": "A carregar o universo…",
        "sv": "Läser in universum…"
    },
    "Manage Universes…": {
        "cs": "Spravovat vesmíry…",
        "da": "Administrér universer…",
        "de": "Universen verwalten …",
        "es": "Gestionar universos…",
        "fr": "Gérer les univers…",
        "pt": "Gerenciar Universos…",
        "sv": "Hantera universum…"
    },
    "Menus update after you relaunch the app.": {
        "cs": "Nabídky se aktualizují po opětovném spuštění aplikace.",
        "da": "Menuerne opdateres, når du genstarter appen.",
        "de": "Menüs werden nach einem Neustart der App aktualisiert.",
        "es": "Los menús se actualizan al volver a abrir la app.",
        "fr": "Les menus sont mis à jour après la réouverture de l’app.",
        "pt": "Os menus se atualizam depois que você reabre o app.",
        "sv": "Menyerna uppdateras när du startar om appen."
    },
    "Move to Trash": {
        "cs": "Přesunout do koše",
        "da": "Flyt til papirkurven",
        "de": "In den Papierkorb legen",
        "es": "Trasladar a la Papelera",
        "fr": "Placer dans la corbeille",
        "pt": "Mover para o Lixo",
        "sv": "Flytta till papperskorgen"
    },
    "Name": {
        "cs": "Název",
        "da": "Navn",
        "de": "Name",
        "es": "Nombre",
        "fr": "Nom",
        "pt": "Nome",
        "sv": "Namn"
    },
    "New Universe": {
        "cs": "Nový vesmír",
        "da": "Nyt univers",
        "de": "Neues Universum",
        "es": "Nuevo universo",
        "fr": "Nouvel univers",
        "pt": "Novo Universo",
        "sv": "Nytt universum"
    },
    "New Universe…": {
        "cs": "Nový vesmír…",
        "da": "Nyt univers…",
        "de": "Neues Universum …",
        "es": "Nuevo universo…",
        "fr": "Nouvel univers…",
        "pt": "Novo Universo…",
        "sv": "Nytt universum…"
    },
    "No planetary survey": {
        "cs": "Žádný planetární průzkum",
        "da": "Ingen planetopmåling",
        "de": "Keine planetare Vermessung",
        "es": "Sin estudio planetario",
        "fr": "Aucun relevé planétaire",
        "pt": "Nenhum levantamento planetário",
        "sv": "Ingen planetkartläggning"
    },
    "No target selected": {
        "cs": "Není vybrán cíl",
        "da": "Intet mål valgt",
        "de": "Kein Ziel ausgewählt",
        "es": "Ningún objetivo seleccionado",
        "fr": "Aucune cible sélectionnée",
        "pt": "Nenhum alvo selecionado",
        "sv": "Inget mål valt"
    },
    "No universe": {
        "cs": "Žádný vesmír",
        "da": "Intet univers",
        "de": "Kein Universum",
        "es": "Ningún universo",
        "fr": "Aucun univers",
        "pt": "Nenhum universo",
        "sv": "Inget universum"
    },
    "Not open": {
        "cs": "Neotevřeno",
        "da": "Ikke åben",
        "de": "Nicht geöffnet",
        "es": "No abierto",
        "fr": "Non ouvert",
        "pt": "Não aberto",
        "sv": "Inte öppet"
    },
    "Not set": {
        "cs": "Nenastaveno",
        "da": "Ikke angivet",
        "de": "Nicht festgelegt",
        "es": "Sin definir",
        "fr": "Non défini",
        "pt": "Não definida",
        "sv": "Inte angiven"
    },
    "OK": {
        "cs": "OK",
        "da": "OK",
        "de": "OK",
        "es": "OK",
        "fr": "OK",
        "pt": "OK",
        "sv": "OK"
    },
    "Open": {
        "cs": "Otevřít",
        "da": "Åbn",
        "de": "Öffnen",
        "es": "Abrir",
        "fr": "Ouvrir",
        "pt": "Abrir",
        "sv": "Öppna"
    },
    "Open Universe": {
        "cs": "Otevřít vesmír",
        "da": "Åbn univers",
        "de": "Universum öffnen",
        "es": "Abrir universo",
        "fr": "Ouvrir un univers",
        "pt": "Abrir Universo",
        "sv": "Öppna universum"
    },
    "Open Universe…": {
        "cs": "Otevřít vesmír…",
        "da": "Åbn univers…",
        "de": "Universum öffnen …",
        "es": "Abrir universo…",
        "fr": "Ouvrir un univers…",
        "pt": "Abrir Universo…",
        "sv": "Öppna universum…"
    },
    "Open a .zip…": {
        "cs": "Otevřít .zip…",
        "da": "Åbn en .zip…",
        "de": ".zip öffnen …",
        "es": "Abrir un .zip…",
        "fr": "Ouvrir un .zip…",
        "pt": "Abrir um .zip…",
        "sv": "Öppna en .zip…"
    },
    "Open a folder…": {
        "cs": "Otevřít složku…",
        "da": "Åbn en mappe…",
        "de": "Ordner öffnen …",
        "es": "Abrir una carpeta…",
        "fr": "Ouvrir un dossier…",
        "pt": "Abrir uma pasta…",
        "sv": "Öppna en mapp…"
    },
    "Paused while viewing a planet": {
        "cs": "Pozastaveno při prohlížení planety",
        "da": "Sat på pause, mens en planet vises",
        "de": "Pausiert während der Planetenansicht",
        "es": "En pausa mientras se ve un planeta",
        "fr": "En pause pendant l’observation d’une planète",
        "pt": "Pausado durante a visualização de um planeta",
        "sv": "Pausad medan en planet visas"
    },
    "Pinch or use the buttons to zoom; scroll to pan": {
        "cs": "Přibližujte sevřením nebo tlačítky; posouvejte posunem",
        "da": "Knib eller brug knapperne for at zoome; rul for at panorere",
        "de": "Zum Zoomen auf-/zuziehen oder Tasten verwenden; zum Verschieben scrollen",
        "es": "Pellizca o usa los botones para hacer zoom; desplázate para mover la vista",
        "fr": "Pincez ou utilisez les boutons pour zoomer ; faites défiler pour vous déplacer.",
        "pt": "Use o gesto de pinça ou os botões para aplicar zoom; role para mover",
        "sv": "Nyp eller använd knapparna för att zooma; skrolla för att panorera"
    },
    "Planet formation": {
        "cs": "Vznik planet",
        "da": "Planetdannelse",
        "de": "Planetenentstehung",
        "es": "Formación de planetas",
        "fr": "Formation des planètes",
        "pt": "Formação de planetas",
        "sv": "Planetbildning"
    },
    "Random seed": {
        "cs": "Náhodné semínko",
        "da": "Tilfældigt frø",
        "de": "Zufälligen Startwert wählen",
        "es": "Semilla aleatoria",
        "fr": "Graine aléatoire",
        "pt": "Semente aleatória",
        "sv": "Slumpat frö"
    },
    "Real time": {
        "cs": "Reálný čas",
        "da": "Realtid",
        "de": "Echtzeit",
        "es": "Tiempo real",
        "fr": "Temps réel",
        "pt": "Tempo Real",
        "sv": "Realtid"
    },
    "Rename": {
        "cs": "Přejmenovat",
        "da": "Omdøb",
        "de": "Umbenennen",
        "es": "Renombrar",
        "fr": "Renommer",
        "pt": "Mudar o nome",
        "sv": "Byt namn"
    },
    "Save": {
        "cs": "Uložit",
        "da": "Gem",
        "de": "Sichern",
        "es": "Guardar",
        "fr": "Enregistrer",
        "pt": "Salvar",
        "sv": "Spara"
    },
    "Save As…": {
        "cs": "Uložit jako…",
        "da": "Gem som…",
        "de": "Sichern unter …",
        "es": "Guardar como…",
        "fr": "Enregistrer sous…",
        "pt": "Salvar Como…",
        "sv": "Spara som…"
    },
    "Save Block": {
        "cs": "Uložit blok",
        "da": "Gem blok",
        "de": "Block sichern",
        "es": "Guardar bloque",
        "fr": "Enregistrer le bloc",
        "pt": "Salvar Bloco",
        "sv": "Spara block"
    },
    "Save Universe As…": {
        "cs": "Uložit vesmír jako…",
        "da": "Gem univers som…",
        "de": "Universum sichern unter …",
        "es": "Guardar universo como…",
        "fr": "Enregistrer l’univers sous…",
        "pt": "Salvar Universo Como…",
        "sv": "Spara universum som…"
    },
    "Save a copy of this universe as a folder other apps can read": {
        "cs": "Uložit kopii tohoto vesmíru jako složku, kterou přečtou jiné aplikace",
        "da": "Gem en kopi af dette univers som en mappe, andre apps kan læse",
        "de": "Kopie dieses Universums als Ordner sichern, den andere Apps lesen können",
        "es": "Guarda una copia de este universo como una carpeta que otras apps puedan leer",
        "fr": "Enregistrez une copie de cet univers sous forme de dossier lisible par d’autres apps.",
        "pt": "Salve uma cópia deste universo como uma pasta que outros apps possam ler",
        "sv": "Spara en kopia av det här universumet som en mapp som andra appar kan läsa"
    },
    "Saved “%@” to %@.": {
        "cs": "„%@“ uloženo do %@.",
        "da": "Gemte “%@” i %@.",
        "de": "„%@“ wurde in %@ gesichert.",
        "es": "“%@” se guardó en %@.",
        "fr": "« %@ » enregistré dans %@.",
        "pt": "“%@” guardado em %@.",
        "sv": "Sparade ”%@” i %@."
    },
    "Sectors: %lld": {
        "cs": "Sektory: %lld",
        "da": "Sektorer: %lld",
        "de": "Sektoren: %lld",
        "es": "Sectores: %lld",
        "fr": "Secteurs : %lld",
        "pt": "Setores: %lld",
        "sv": "Sektorer: %lld"
    },
    "Seed": {
        "cs": "Semínko",
        "da": "Frø",
        "de": "Startwert",
        "es": "Semilla",
        "fr": "Graine",
        "pt": "Semente",
        "sv": "Frö"
    },
    "Seed %@": {
        "cs": "Semínko %@",
        "da": "Frø %@",
        "de": "Startwert %@",
        "es": "Semilla %@",
        "fr": "Graine %@",
        "pt": "Semente %@",
        "sv": "Frö %@"
    },
    "Settings": {
        "cs": "Nastavení",
        "da": "Indstillinger",
        "de": "Einstellungen",
        "es": "Ajustes",
        "fr": "Réglages",
        "pt": "Definições",
        "sv": "Inställningar"
    },
    "Settings…": {
        "cs": "Nastavení…",
        "da": "Indstillinger…",
        "de": "Einstellungen …",
        "es": "Ajustes…",
        "fr": "Réglages…",
        "pt": "Definições…",
        "sv": "Inställningar…"
    },
    "Show clouds": {
        "cs": "Zobrazit mraky",
        "da": "Vis skyer",
        "de": "Wolken anzeigen",
        "es": "Mostrar nubes",
        "fr": "Afficher les nuages",
        "pt": "Mostrar nuvens",
        "sv": "Visa moln"
    },
    "Show full details": {
        "cs": "Všechny podrobnosti",
        "da": "Vis alle detaljer",
        "de": "Alle Details anzeigen",
        "es": "Mostrar todos los detalles",
        "fr": "Afficher tous les détails",
        "pt": "Mostrar todos os detalhes",
        "sv": "Visa alla detaljer"
    },
    "Simulation time": {
        "cs": "Čas simulace",
        "da": "Simuleringstid",
        "de": "Simulationszeit",
        "es": "Tiempo de simulación",
        "fr": "Temps de simulation",
        "pt": "Tempo de simulação",
        "sv": "Simuleringstid"
    },
    "Slow down, or run faster backwards": {
        "cs": "Zpomalit, nebo zrychlit pozpátku",
        "da": "Sæt farten ned, eller kør hurtigere baglæns",
        "de": "Verlangsamen oder rückwärts beschleunigen",
        "es": "Ralentizar o retroceder más rápido",
        "fr": "Ralentir, ou accélérer le retour en arrière",
        "pt": "Desacelerar ou retroceder mais rápido",
        "sv": "Sakta ner, eller kör snabbare baklänges"
    },
    "Speed up, or run slower backwards": {
        "cs": "Zrychlit, nebo zpomalit pozpátku",
        "da": "Sæt farten op, eller kør langsommere baglæns",
        "de": "Beschleunigen oder rückwärts verlangsamen",
        "es": "Acelerar o retroceder más despacio",
        "fr": "Accélérer, ou ralentir le retour en arrière",
        "pt": "Acelerar ou retroceder mais devagar",
        "sv": "Öka farten, eller kör långsammare baklänges"
    },
    "Surface map": {
        "cs": "Mapa povrchu",
        "da": "Overfladekort",
        "de": "Oberflächenkarte",
        "es": "Mapa de superficie",
        "fr": "Carte de surface",
        "pt": "Mapa da Superfície",
        "sv": "Ytkarta"
    },
    "System Default": {
        "cs": "Podle systému",
        "da": "Systemstandard",
        "de": "Systemstandard",
        "es": "Predeterminado del sistema",
        "fr": "Langue du système",
        "pt": "Padrão do Sistema",
        "sv": "Systemets standard"
    },
    "Systems: %lld": {
        "cs": "Soustavy: %lld",
        "da": "Systemer: %lld",
        "de": "Systeme: %lld",
        "es": "Sistemas: %lld",
        "fr": "Systèmes : %lld",
        "pt": "Sistemas: %lld",
        "sv": "System: %lld"
    },
    "The same seed always generates the same star field.": {
        "cs": "Stejné semínko vždy vygeneruje stejné hvězdné pole.",
        "da": "Det samme frø genererer altid det samme stjernefelt.",
        "de": "Derselbe Startwert erzeugt immer dasselbe Sternenfeld.",
        "es": "La misma semilla siempre genera el mismo campo de estrellas.",
        "fr": "Une même graine génère toujours le même champ d’étoiles.",
        "pt": "A mesma semente sempre gera o mesmo campo estelar.",
        "sv": "Samma frö genererar alltid samma stjärnfält."
    },
    "The seed must be a whole number from 0 to %@.": {
        "cs": "Semínko musí být celé číslo od 0 do %@.",
        "da": "Frøet skal være et heltal fra 0 til %@.",
        "de": "Der Startwert muss eine ganze Zahl von 0 bis %@ sein.",
        "es": "La semilla debe ser un número entero entre 0 y %@.",
        "fr": "La graine doit être un nombre entier compris entre 0 et %@.",
        "pt": "A semente deve ser um número inteiro de 0 a %@.",
        "sv": "Fröet måste vara ett heltal från 0 till %@."
    },
    "The universe couldn't be shown.": {
        "cs": "Vesmír se nepodařilo zobrazit.",
        "da": "Universet kunne ikke vises.",
        "de": "Das Universum konnte nicht angezeigt werden.",
        "es": "No se pudo mostrar el universo.",
        "fr": "L’univers n’a pas pu être affiché.",
        "pt": "Não foi possível mostrar o universo.",
        "sv": "Universumet kunde inte visas."
    },
    "The universe’s folder, with its star field and surface maps, goes to the Trash.": {
        "cs": "Složka vesmíru s hvězdným polem a mapami povrchu se přesune do koše.",
        "da": "Universets mappe med dets stjernefelt og overfladekort flyttes til papirkurven.",
        "de": "Der Ordner des Universums wird mit seinem Sternenfeld und den Oberflächenkarten in den Papierkorb gelegt.",
        "es": "La carpeta del universo, con el campo de estrellas y los mapas de superficie, se trasladará a la Papelera.",
        "fr": "Le dossier de l’univers, avec son champ d’étoiles et ses cartes de surface, sera placé dans la corbeille.",
        "pt": "A pasta do universo, com o campo estelar e os mapas da superfície, será movida para o Lixo.",
        "sv": "Universumets mapp, med dess stjärnfält och ytkartor, flyttas till papperskorgen."
    },
    "The universe’s folder, with its star field and surface maps, is deleted from this browser.": {
        "cs": "Složka vesmíru s hvězdným polem a mapami povrchu se z tohoto prohlížeče smaže.",
        "da": "Universets mappe med dets stjernefelt og overfladekort slettes fra denne browser.",
        "de": "Der Ordner des Universums mit Sternfeld und Oberflächenkarten wird aus diesem Browser gelöscht.",
        "es": "La carpeta del universo, con su campo estelar y sus mapas de superficie, se elimina de este navegador.",
        "fr": "Le dossier de l’univers, avec son champ d’étoiles et ses cartes de surface, est supprimé de ce navigateur.",
        "pt": "A pasta do universo, com o campo estelar e os mapas de superfície, é apagada deste navegador.",
        "sv": "Universumets mapp, med dess stjärnfält och ytkartor, raderas från den här webbläsaren."
    },
    "This browser can’t keep universes, so they’ll be lost when the page closes. Save them with Save Universe As….": {
        "cs": "Tento prohlížeč neumí vesmíry uchovat, takže se po zavření stránky ztratí. Uložte je pomocí Uložit vesmír jako….",
        "da": "Denne browser kan ikke gemme universer, så de går tabt, når siden lukkes. Gem dem med Gem univers som….",
        "de": "Dieser Browser kann keine Universen behalten; sie gehen beim Schließen der Seite verloren. Sichere sie mit „Universum sichern unter …“.",
        "es": "Este navegador no puede conservar universos, así que se perderán al cerrar la página. Guárdalos con Guardar universo como….",
        "fr": "Ce navigateur ne peut pas conserver les univers : ils seront perdus à la fermeture de la page. Enregistrez-les avec Enregistrer l’univers sous….",
        "pt": "Este navegador não consegue guardar universos, por isso perdem-se ao fechar a página. Guarde-os com Guardar universo como….",
        "sv": "Den här webbläsaren kan inte behålla universum, så de försvinner när sidan stängs. Spara dem med Spara universum som…."
    },
    "This browser doesn't support WebGL 2, which the star map needs.": {
        "cs": "Tento prohlížeč nepodporuje WebGL 2, které hvězdná mapa potřebuje.",
        "da": "Denne browser understøtter ikke WebGL 2, som stjernekortet kræver.",
        "de": "Dieser Browser unterstützt kein WebGL 2, das die Sternkarte braucht.",
        "es": "Este navegador no admite WebGL 2, que el mapa estelar necesita.",
        "fr": "Ce navigateur ne prend pas en charge WebGL 2, nécessaire à la carte stellaire.",
        "pt": "Este navegador não suporta WebGL 2, necessário para o mapa estelar.",
        "sv": "Den här webbläsaren stöder inte WebGL 2, som stjärnkartan behöver."
    },
    "Universe": {
        "cs": "Vesmír",
        "da": "Univers",
        "de": "Universum",
        "es": "Universo",
        "fr": "Univers",
        "pt": "Universo",
        "sv": "Universum"
    },
    "Universe %lld": {
        "cs": "Vesmír %lld",
        "da": "Univers %lld",
        "de": "Universum %lld",
        "es": "Universo %lld",
        "fr": "Univers %lld",
        "pt": "Universo %lld",
        "sv": "Universum %lld"
    },
    "Universes": {
        "cs": "Vesmíry",
        "da": "Universer",
        "de": "Universen",
        "es": "Universos",
        "fr": "Univers",
        "pt": "Universos",
        "sv": "Universum"
    },
    "Universes are kept in this browser. Use Save Universe As… to share one with the macOS app.": {
        "cs": "Vesmíry se uchovávají v tomto prohlížeči. Pomocí Uložit vesmír jako… je můžete sdílet s aplikací pro macOS.",
        "da": "Universer gemmes i denne browser. Brug Gem univers som… for at dele et med macOS-appen.",
        "de": "Universen werden in diesem Browser aufbewahrt. Mit „Universum sichern unter …“ teilst du eines mit der macOS-App.",
        "es": "Los universos se guardan en este navegador. Usa Guardar universo como… para compartir uno con la app de macOS.",
        "fr": "Les univers sont conservés dans ce navigateur. Utilisez Enregistrer l’univers sous… pour en partager un avec l’app macOS.",
        "pt": "Os universos ficam guardados neste navegador. Use Guardar universo como… para partilhar um com a app para macOS.",
        "sv": "Universum sparas i den här webbläsaren. Använd Spara universum som… för att dela ett med macOS-appen."
    },
    "Universes folder": {
        "cs": "Složka vesmírů",
        "da": "Universmappe",
        "de": "Universen-Ordner",
        "es": "Carpeta de universos",
        "fr": "Dossier des univers",
        "pt": "Pasta de universos",
        "sv": "Universummapp"
    },
    "Use File ▸ New Universe to create one.": {
        "cs": "Nový vytvoříte pomocí Soubor ▸ Nový vesmír.",
        "da": "Brug Arkiv ▸ Nyt univers for at oprette et.",
        "de": "Wähle „Ablage“ ▸ „Neues Universum“, um eines zu erstellen.",
        "es": "Usa Archivo ▸ Nuevo universo para crear uno.",
        "fr": "Choisissez Fichier ▸ Nouvel univers pour en créer un.",
        "pt": "Use Arquivo ▸ Novo Universo para criar um.",
        "sv": "Använd Arkiv ▸ Nytt universum för att skapa ett."
    },
    "Use File ▸ New Universe… to create one.": {
        "cs": "Nový vytvoříte pomocí Soubor ▸ Nový vesmír….",
        "da": "Brug Arkiv ▸ Nyt univers… for at oprette et.",
        "de": "Wähle „Ablage“ ▸ „Neues Universum …“, um eines zu erstellen.",
        "es": "Usa Archivo ▸ Nuevo universo… para crear uno.",
        "fr": "Choisissez Fichier ▸ Nouvel univers… pour en créer un.",
        "pt": "Use Arquivo ▸ Novo Universo… para criar um.",
        "sv": "Använd Arkiv ▸ Nytt universum… för att skapa ett."
    },
    "Where universes are saved, unless you pick another folder when saving.": {
        "cs": "Kam se ukládají vesmíry, pokud při ukládání nezvolíte jinou složku.",
        "da": "Hvor universer gemmes, medmindre du vælger en anden mappe, når du gemmer.",
        "de": "Wo Universen gesichert werden, außer du wählst beim Sichern einen anderen Ordner.",
        "es": "Dónde se guardan los universos, salvo que elijas otra carpeta al guardar.",
        "fr": "Où les univers sont enregistrés, sauf si vous choisissez un autre dossier lors de l’enregistrement.",
        "pt": "Onde os universos são guardados, a menos que escolha outra pasta ao guardar.",
        "sv": "Där universum sparas, om du inte väljer en annan mapp när du sparar."
    },
    "Whole system": {
        "cs": "Celá soustava",
        "da": "Hele systemet",
        "de": "Gesamtes System",
        "es": "Sistema completo",
        "fr": "Système entier",
        "pt": "Sistema Inteiro",
        "sv": "Hela systemet"
    },
    "World data": {
        "cs": "Data světa",
        "da": "Verdensdata",
        "de": "Weltdaten",
        "es": "Datos del mundo",
        "fr": "Données du monde",
        "pt": "Dados do mundo",
        "sv": "Världsdata"
    },
    "Zoom %.2f": {
        "cs": "Zoom %.2f",
        "da": "Zoom %.2f",
        "de": "Zoom %.2f",
        "es": "Zoom %.2f",
        "fr": "Zoom %.2f",
        "pt": "Zoom %.2f",
        "sv": "Zoom %.2f"
    },
    "Zoom in": {
        "cs": "Přiblížit",
        "da": "Zoom ind",
        "de": "Vergrößern",
        "es": "Acercar",
        "fr": "Zoom avant",
        "pt": "Ampliar",
        "sv": "Zooma in"
    },
    "Zoom out": {
        "cs": "Oddálit",
        "da": "Zoom ud",
        "de": "Verkleinern",
        "es": "Alejar",
        "fr": "Zoom arrière",
        "pt": "Reduzir",
        "sv": "Zooma ut"
    },
    "yr": {
        "cs": "r.",
        "da": "år",
        "de": "J.",
        "es": "años",
        "fr": "ans",
        "pt": "anos",
        "sv": "år"
    },
    "“%@” already exists in that folder. Replace it?": {
        "cs": "„%@“ v této složce již existuje. Nahradit?",
        "da": "“%@” findes allerede i den mappe. Vil du erstatte den?",
        "de": "„%@“ ist in diesem Ordner bereits vorhanden. Ersetzen?",
        "es": "“%@” ya existe en esa carpeta. ¿Reemplazarlo?",
        "fr": "« %@ » existe déjà dans ce dossier. Le remplacer ?",
        "pt": "“%@” já existe nessa pasta. Substituir?",
        "sv": "”%@” finns redan i den mappen. Vill du ersätta den?"
    },
    "“%@” doesn't contain a readable starfield.json.": {
        "cs": "„%@“ neobsahuje čitelný soubor starfield.json.",
        "da": "“%@” indeholder ikke en læsbar starfield.json.",
        "de": "„%@“ enthält keine lesbare starfield.json.",
        "es": "“%@” no contiene un archivo starfield.json legible.",
        "fr": "« %@ » ne contient aucun fichier starfield.json lisible.",
        "pt": "“%@” não contém um arquivo starfield.json legível.",
        "sv": "”%@” innehåller ingen läsbar starfield.json."
    },
    "%@ %@%, other faiths %@%, unaffiliated %@%": {
        "cs": "%@ %@%, jiná vyznání %@%, bez vyznání %@%",
        "da": "%@ %@%, andre trosretninger %@%, uden tilknytning %@%",
        "de": "%@ %@ %, andere Religionen %@ %, konfessionslos %@ %",
        "es": "%@ %@%, otras religiones %@%, sin religión %@%",
        "fr": "%@ %@ %, autres religions %@ %, sans religion %@ %",
        "pt": "%@ %@%, outras religiões %@%, sem religião %@%",
        "sv": "%@ %@%, andra trosinriktningar %@%, ej anslutna %@%"
    },
    "%@ (confederal)": {
        "cs": "%@ (konfederální)",
        "da": "%@ (konføderal)",
        "de": "%@ (konföderal)",
        "es": "%@ (confederal)",
        "fr": "%@ (confédéral)",
        "pt": "%@ (confederal)",
        "sv": "%@ (konfederal)"
    },
    "%@ (federal)": {
        "cs": "%@ (federální)",
        "da": "%@ (føderal)",
        "de": "%@ (föderal)",
        "es": "%@ (federal)",
        "fr": "%@ (fédéral)",
        "pt": "%@ (federal)",
        "sv": "%@ (federal)"
    },
    "%@ a week": {
        "cs": "%@ týdně",
        "da": "%@ om ugen",
        "de": "%@ pro Woche",
        "es": "%@ por semana",
        "fr": "%@ par semaine",
        "pt": "%@ por semana",
        "sv": "%@ i veckan"
    },
    "%@ cells": {
        "cs": "Buňky: %@",
        "da": "%@ celler",
        "de": "%@ Zellen",
        "es": "%@ celdas",
        "fr": "%@ cellules",
        "pt": "%@ células",
        "sv": "%@ celler"
    },
    "%@ m above sea level": {
        "cs": "%@ m nad mořem",
        "da": "%@ m over havet",
        "de": "%@ m über dem Meeresspiegel",
        "es": "%@ m sobre el nivel del mar",
        "fr": "%@ m au-dessus du niveau de la mer",
        "pt": "%@ m acima do nível do mar",
        "sv": "%@ m över havet"
    },
    "%@ m above the lowest point": {
        "cs": "%@ m nad nejnižším bodem",
        "da": "%@ m over det laveste punkt",
        "de": "%@ m über dem tiefsten Punkt",
        "es": "%@ m sobre el punto más bajo",
        "fr": "%@ m au-dessus du point le plus bas",
        "pt": "%@ m acima do ponto mais baixo",
        "sv": "%@ m över den lägsta punkten"
    },
    "%@ m below sea level": {
        "cs": "%@ m pod hladinou moře",
        "da": "%@ m under havet",
        "de": "%@ m unter dem Meeresspiegel",
        "es": "%@ m bajo el nivel del mar",
        "fr": "%@ m sous le niveau de la mer",
        "pt": "%@ m abaixo do nível do mar",
        "sv": "%@ m under havet"
    },
    "%@ provinces": {
        "cs": "Provincie: %@",
        "da": "%@ provinser",
        "de": "%@ Provinzen",
        "es": "%@ provincias",
        "fr": "%@ provinces",
        "pt": "%@ províncias",
        "sv": "%@ provinser"
    },
    "%@ years": {
        "cs": "%@ let",
        "da": "%@ år",
        "de": "%@ Jahre",
        "es": "%@ años",
        "fr": "%@ ans",
        "pt": "%@ anos",
        "sv": "%@ år"
    },
    "%@ years of age for voluntary service; no conscription": {
        "cs": "%@ let pro dobrovolnou službu; bez branné povinnosti",
        "da": "%@ år for frivillig tjeneste; ingen værnepligt",
        "de": "ab %@ Jahren freiwilliger Dienst; keine Wehrpflicht",
        "es": "%@ años para el servicio voluntario; sin servicio obligatorio",
        "fr": "%@ ans pour le service volontaire ; pas de conscription",
        "pt": "%@ anos para serviço voluntário; sem alistamento obrigatório",
        "sv": "%@ år för frivillig tjänst; ingen värnplikt"
    },
    "%@ years of age; universal": {
        "cs": "%@ let; všeobecná",
        "da": "%@ år; almindelig",
        "de": "ab %@ Jahren; allgemein",
        "es": "%@ años; universal",
        "fr": "%@ ans ; universel",
        "pt": "%@ anos; universal",
        "sv": "%@ år; allmän"
    },
    "%@% of GDP (%@)": {
        "cs": "%@% HDP (%@)",
        "da": "%@% af BNP (%@)",
        "de": "%@ % des BIP (%@)",
        "es": "%@% del PIB (%@)",
        "fr": "%@ % du PIB (%@)",
        "pt": "%@% do PIB (%@)",
        "sv": "%@% av BNP (%@)"
    },
    "%@% urban": {
        "cs": "%@% ve městech",
        "da": "%@% i byer",
        "de": "%@ % städtisch",
        "es": "%@% urbana",
        "fr": "%@ % urbaine",
        "pt": "%@% urbana",
        "sv": "%@% i städer"
    },
    "%@, sharing the world": {
        "cs": "%@, sdílející svět",
        "da": "%@, der deler verdenen",
        "de": "%@, die sich die Welt teilen",
        "es": "%@, que comparten el mundo",
        "fr": "%@, qui se partagent le monde",
        "pt": "%@, que dividem o mundo",
        "sv": "%@, som delar världen"
    },
    "%@–%@ years of age for compulsory service; %@-year obligation": {
        "cs": "%@–%@ let pro povinnou službu; povinnost %@ roky",
        "da": "%@–%@ år for pligtig tjeneste; %@ års tjenestepligt",
        "de": "%@–%@ Jahre für den Pflichtdienst; %@ Jahr(e) Dienstzeit",
        "es": "%@–%@ años para el servicio obligatorio; %@ año(s) de servicio",
        "fr": "%@–%@ ans pour le service obligatoire ; %@ an(s) de service",
        "pt": "%@–%@ anos para serviço obrigatório; %@ ano(s) de serviço",
        "sv": "%@–%@ år för obligatorisk tjänst; %@ års tjänsteplikt"
    },
    "About Estrelas": {
        "cs": "O aplikaci Estrelas",
        "da": "Om Estrelas",
        "de": "Über Estrelas",
        "es": "Acerca de Estrelas",
        "fr": "À propos d’Estrelas",
        "pt": "Sobre o Estrelas",
        "sv": "Om Estrelas"
    },
    "About Estrelas Player": {
        "cs": "O aplikaci Estrelas Player",
        "da": "Om Estrelas Player",
        "de": "Über Estrelas Player",
        "es": "Acerca de Estrelas Player",
        "fr": "À propos d’Estrelas Player",
        "pt": "Sobre o Estrelas Player",
        "sv": "Om Estrelas Player"
    },
    "Absolute monarchy": {
        "cs": "Absolutní monarchie",
        "da": "Enevælde",
        "de": "Absolute Monarchie",
        "es": "Monarquía absoluta",
        "fr": "Monarchie absolue",
        "pt": "Monarquia absoluta",
        "sv": "Absolut monarki"
    },
    "Active personnel": {
        "cs": "Aktivní personál",
        "da": "Aktivt personel",
        "de": "Aktives Personal",
        "es": "Personal activo",
        "fr": "Effectifs actifs",
        "pt": "Efetivo ativo",
        "sv": "Aktiv personal"
    },
    "Active volcano": {
        "cs": "Činná sopka",
        "da": "Aktiv vulkan",
        "de": "Aktiver Vulkan",
        "es": "Volcán activo",
        "fr": "Volcan actif",
        "pt": "Vulcão ativo",
        "sv": "Aktiv vulkan"
    },
    "Administrative divisions": {
        "cs": "Správní členění",
        "da": "Administrative inddelinger",
        "de": "Verwaltungsgliederung",
        "es": "Divisiones administrativas",
        "fr": "Divisions administratives",
        "pt": "Divisões administrativas",
        "sv": "Administrativ indelning"
    },
    "Air Force": {
        "cs": "Letectvo",
        "da": "Flyvevåben",
        "de": "Luftwaffe",
        "es": "Fuerza Aérea",
        "fr": "Armée de l’air",
        "pt": "Força Aérea",
        "sv": "Flygvapen"
    },
    "Area": {
        "cs": "Rozloha",
        "da": "Areal",
        "de": "Fläche",
        "es": "Superficie",
        "fr": "Superficie",
        "pt": "Área",
        "sv": "Yta"
    },
    "Armed forces": {
        "cs": "Ozbrojené síly",
        "da": "Væbnede styrker",
        "de": "Streitkräfte",
        "es": "Fuerzas armadas",
        "fr": "Forces armées",
        "pt": "Forças armadas",
        "sv": "Väpnade styrkor"
    },
    "Armed insurgency": {
        "cs": "Ozbrojené povstání",
        "da": "Væbnet oprør",
        "de": "Bewaffneter Aufstand",
        "es": "Insurgencia armada",
        "fr": "Insurrection armée",
        "pt": "Insurgência armada",
        "sv": "Väpnat uppror"
    },
    "At sea level": {
        "cs": "Na úrovni moře",
        "da": "Ved havets overflade",
        "de": "Auf Meereshöhe",
        "es": "Al nivel del mar",
        "fr": "Au niveau de la mer",
        "pt": "No nível do mar",
        "sv": "Vid havsytan"
    },
    "At the lowest point": {
        "cs": "V nejnižším bodě",
        "da": "Ved det laveste punkt",
        "de": "Am tiefsten Punkt",
        "es": "En el punto más bajo",
        "fr": "Au point le plus bas",
        "pt": "No ponto mais baixo",
        "sv": "Vid den lägsta punkten"
    },
    "Authoritarian dictatorship": {
        "cs": "Autoritářská diktatura",
        "da": "Autoritært diktatur",
        "de": "Autoritäre Diktatur",
        "es": "Dictadura autoritaria",
        "fr": "Dictature autoritaire",
        "pt": "Ditadura autoritária",
        "sv": "Auktoritär diktatur"
    },
    "Banned for civilians": {
        "cs": "Zakázáno civilistům",
        "da": "Forbudt for civile",
        "de": "Für Zivilisten verboten",
        "es": "Prohibidas para civiles",
        "fr": "Interdites aux civils",
        "pt": "Proibidas para civis",
        "sv": "Förbjudet för civila"
    },
    "Bare ground": {
        "cs": "Holá půda",
        "da": "Bar jord",
        "de": "Kahler Boden",
        "es": "Suelo desnudo",
        "fr": "Sol nu",
        "pt": "Solo exposto",
        "sv": "Bar mark"
    },
    "Below poverty line": {
        "cs": "Pod hranicí chudoby",
        "da": "Under fattigdomsgrænsen",
        "de": "Unter der Armutsgrenze",
        "es": "Bajo el umbral de pobreza",
        "fr": "Sous le seuil de pauvreté",
        "pt": "Abaixo da linha de pobreza",
        "sv": "Under fattigdomsgränsen"
    },
    "Caldera": {
        "cs": "Kaldera",
        "da": "Kaldera",
        "de": "Caldera",
        "es": "Caldera",
        "fr": "Caldeira",
        "pt": "Caldeira",
        "sv": "Kaldera"
    },
    "Capital punishment": {
        "cs": "Trest smrti",
        "da": "Dødsstraf",
        "de": "Todesstrafe",
        "es": "Pena de muerte",
        "fr": "Peine de mort",
        "pt": "Pena de morte",
        "sv": "Dödsstraff"
    },
    "Civil unrest": {
        "cs": "Nepokoje",
        "da": "Uroligheder",
        "de": "Unruhen",
        "es": "Disturbios civiles",
        "fr": "Troubles civils",
        "pt": "Agitação civil",
        "sv": "Oroligheter"
    },
    "Civil war": {
        "cs": "Občanská válka",
        "da": "Borgerkrig",
        "de": "Bürgerkrieg",
        "es": "Guerra civil",
        "fr": "Guerre civile",
        "pt": "Guerra civil",
        "sv": "Inbördeskrig"
    },
    "Civilian firearms": {
        "cs": "Civilní střelné zbraně",
        "da": "Civile skydevåben",
        "de": "Zivile Schusswaffen",
        "es": "Armas de fuego civiles",
        "fr": "Armes à feu civiles",
        "pt": "Armas de fogo civis",
        "sv": "Civila skjutvapen"
    },
    "Climate": {
        "cs": "Podnebí",
        "da": "Klima",
        "de": "Klima",
        "es": "Clima",
        "fr": "Climat",
        "pt": "Clima",
        "sv": "Klimat"
    },
    "Coast": {
        "cs": "Pobřeží",
        "da": "Kyst",
        "de": "Küste",
        "es": "Costa",
        "fr": "Côte",
        "pt": "Litoral",
        "sv": "Kust"
    },
    "Cold desert": {
        "cs": "Studená poušť",
        "da": "Kold ørken",
        "de": "Kältewüste",
        "es": "Desierto frío",
        "fr": "Désert froid",
        "pt": "Deserto frio",
        "sv": "Kall öken"
    },
    "Corporate administration under charter": {
        "cs": "Správa korporací na základě výsady",
        "da": "Koncernstyre under kongeligt privilegium",
        "de": "Konzernverwaltung mit Freibrief",
        "es": "Administración corporativa bajo carta",
        "fr": "Administration d’entreprise sous charte",
        "pt": "Administração corporativa sob concessão",
        "sv": "Koncernförvaltning under privilegiebrev"
    },
    "Dependency of the system’s main world": {
        "cs": "Závislé území hlavního světa soustavy",
        "da": "Afhængigt område under systemets hovedverden",
        "de": "Abhängiges Gebiet der Hauptwelt des Systems",
        "es": "Dependencia del mundo principal del sistema",
        "fr": "Dépendance du monde principal du système",
        "pt": "Dependência do mundo principal do sistema",
        "sv": "Beroende område under systemets huvudvärld"
    },
    "Dependency status": {
        "cs": "Závislost",
        "da": "Afhængighedsstatus",
        "de": "Abhängigkeitsstatus",
        "es": "Estatus de dependencia",
        "fr": "Statut de dépendance",
        "pt": "Situação de dependência",
        "sv": "Beroendestatus"
    },
    "Dependent territory": {
        "cs": "Závislé území",
        "da": "Afhængigt område",
        "de": "Abhängiges Gebiet",
        "es": "Territorio dependiente",
        "fr": "Territoire dépendant",
        "pt": "Território dependente",
        "sv": "Beroende område"
    },
    "Direct democracy": {
        "cs": "Přímá demokracie",
        "da": "Direkte demokrati",
        "de": "Direkte Demokratie",
        "es": "Democracia directa",
        "fr": "Démocratie directe",
        "pt": "Democracia direta",
        "sv": "Direktdemokrati"
    },
    "Drawing surface map at %@…": {
        "cs": "Kreslí se mapa povrchu v rozlišení %@…",
        "da": "Tegner overfladekort ved %@…",
        "de": "Oberflächenkarte wird mit %@ gezeichnet…",
        "es": "Dibujando el mapa de superficie a %@…",
        "fr": "Dessin de la carte de surface en %@…",
        "pt": "Desenhando o mapa da superfície em %@…",
        "sv": "Ritar ytkarta i %@…"
    },
    "Economy": {
        "cs": "Ekonomika",
        "da": "Økonomi",
        "de": "Wirtschaft",
        "es": "Economía",
        "fr": "Économie",
        "pt": "Economia",
        "sv": "Ekonomi"
    },
    "Elections": {
        "cs": "Volby",
        "da": "Valg",
        "de": "Wahlen",
        "es": "Elecciones",
        "fr": "Élections",
        "pt": "Eleições",
        "sv": "Val"
    },
    "Established for": {
        "cs": "Založeno před",
        "da": "Grundlagt for",
        "de": "Gegründet für",
        "es": "Establecido para",
        "fr": "Établi pour",
        "pt": "Estabelecido para",
        "sv": "Grundat för"
    },
    "Ethnic groups": {
        "cs": "Etnické skupiny",
        "da": "Etniske grupper",
        "de": "Ethnische Gruppen",
        "es": "Grupos étnicos",
        "fr": "Groupes ethniques",
        "pt": "Grupos étnicos",
        "sv": "Etniska grupper"
    },
    "Exports": {
        "cs": "Vývoz",
        "da": "Eksport",
        "de": "Exporte",
        "es": "Exportaciones",
        "fr": "Exportations",
        "pt": "Exportações",
        "sv": "Export"
    },
    "Free and fair": {
        "cs": "Svobodné a férové",
        "da": "Frie og retfærdige",
        "de": "Frei und fair",
        "es": "Libres y justas",
        "fr": "Libres et équitables",
        "pt": "Livres e justas",
        "sv": "Fria och rättvisa"
    },
    "Free to use. You may share unmodified copies, but not sell or modify the app. Anything you make with it is yours.": {
        "cs": "Zdarma k použití. Neupravené kopie smíte sdílet, aplikaci však nesmíte prodávat ani upravovat. Vše, co s ní vytvoříte, patří vám.",
        "da": "Gratis at bruge. Du må dele uændrede kopier, men ikke sælge eller ændre appen. Alt, hvad du laver med den, er dit.",
        "de": "Kostenlos nutzbar. Unveränderte Kopien dürfen weitergegeben, die App aber weder verkauft noch verändert werden. Alles, was du damit erstellst, gehört dir.",
        "es": "Uso gratuito. Puedes compartir copias sin modificar, pero no vender ni modificar la app. Todo lo que crees con ella es tuyo.",
        "fr": "Utilisation gratuite. Vous pouvez partager des copies non modifiées, mais pas vendre ni modifier l’app. Tout ce que vous créez avec elle vous appartient.",
        "pt": "Uso gratuito. Você pode compartilhar cópias não modificadas, mas não vender nem modificar o app. Tudo o que você criar com ele é seu.",
        "sv": "Gratis att använda. Du får dela oförändrade kopior, men inte sälja eller ändra appen. Allt du skapar med den är ditt."
    },
    "Free, with limits on civil liberties": {
        "cs": "Svobodný, s omezenými občanskými právy",
        "da": "Frit, med begrænsninger af borgerrettighederne",
        "de": "Frei, mit eingeschränkten Bürgerrechten",
        "es": "Libres, con límites a las libertades civiles",
        "fr": "Libres, avec des libertés civiles limitées",
        "pt": "Livres, com limites às liberdades civis",
        "sv": "Fritt, med begränsade medborgerliga fri- och rättigheter"
    },
    "Frozen lake": {
        "cs": "Zamrzlé jezero",
        "da": "Frossen sø",
        "de": "Zugefrorener See",
        "es": "Lago helado",
        "fr": "Lac gelé",
        "pt": "Lago congelado",
        "sv": "Frusen sjö"
    },
    "GDP by sector": {
        "cs": "HDP dle odvětví",
        "da": "BNP efter sektor",
        "de": "BIP nach Sektor",
        "es": "PIB por sector",
        "fr": "PIB par secteur",
        "pt": "PIB por setor",
        "sv": "BNP per sektor"
    },
    "Geography": {
        "cs": "Zeměpis",
        "da": "Geografi",
        "de": "Geografie",
        "es": "Geografía",
        "fr": "Géographie",
        "pt": "Geografia",
        "sv": "Geografi"
    },
    "Gini index": {
        "cs": "Giniho index",
        "da": "Gini-indeks",
        "de": "Gini-Index",
        "es": "Índice de Gini",
        "fr": "Indice de Gini",
        "pt": "Índice de Gini",
        "sv": "Giniindex"
    },
    "Globe resolution": {
        "cs": "Rozlišení glóbu",
        "da": "Globusopløsning",
        "de": "Globusauflösung",
        "es": "Resolución del globo",
        "fr": "Résolution du globe",
        "pt": "Resolução do globo",
        "sv": "Globupplösning"
    },
    "Government": {
        "cs": "Vláda",
        "da": "Regering",
        "de": "Regierung",
        "es": "Gobierno",
        "fr": "Gouvernement",
        "pt": "Governo",
        "sv": "Regering"
    },
    "Government type": {
        "cs": "Typ vlády",
        "da": "Styreform",
        "de": "Regierungsform",
        "es": "Tipo de gobierno",
        "fr": "Type de gouvernement",
        "pt": "Tipo de governo",
        "sv": "Styrelseform"
    },
    "Grassland": {
        "cs": "Step",
        "da": "Græsland",
        "de": "Grasland",
        "es": "Pradera",
        "fr": "Prairie",
        "pt": "Campos",
        "sv": "Gräsmark"
    },
    "Ground Forces": {
        "cs": "Pozemní síly",
        "da": "Landstyrker",
        "de": "Landstreitkräfte",
        "es": "Fuerzas Terrestres",
        "fr": "Forces terrestres",
        "pt": "Forças Terrestres",
        "sv": "Markstridskrafter"
    },
    "Heavily restricted": {
        "cs": "Silně omezeno",
        "da": "Stærkt begrænset",
        "de": "Stark eingeschränkt",
        "es": "Muy restringidas",
        "fr": "Fortement restreintes",
        "pt": "Fortemente restritas",
        "sv": "Kraftigt begränsat"
    },
    "Held, but neither free nor fair": {
        "cs": "Konají se, ale nesvobodně",
        "da": "Afholdt, men hverken frie eller retfærdige",
        "de": "Abgehalten, aber weder frei noch fair",
        "es": "Celebradas, pero ni libres ni justas",
        "fr": "Organisées, mais ni libres ni équitables",
        "pt": "Realizadas, mas nem livres nem justas",
        "sv": "Hålls, men varken fria eller rättvisa"
    },
    "How finely surface maps are drawn. Finer ones show more detail but take longer to draw. Every resolution is saved with the universe once drawn. Also on the surface map.": {
        "cs": "Jak jemně se kreslí mapy povrchu. Jemnější ukazují více podrobností, ale kreslí se déle. Každé rozlišení se po prvním vykreslení uloží s vesmírem. Také na mapě povrchu.",
        "da": "Hvor fint overfladekort tegnes. Finere viser flere detaljer, men tager længere tid at tegne. Hver opløsning gemmes med universet, når den først er tegnet. Også på overfladekortet.",
        "de": "Wie fein Oberflächenkarten gezeichnet werden. Feinere zeigen mehr Details, brauchen aber länger. Jede Auflösung wird nach dem Zeichnen mit dem Universum gespeichert. Auch auf der Oberflächenkarte.",
        "es": "Con qué detalle se dibujan los mapas de superficie. Los más finos muestran más detalle, pero tardan más en dibujarse. Cada resolución se guarda con el universo una vez dibujada. También en el mapa de superficie.",
        "fr": "La finesse des cartes de surface. Les plus fines montrent plus de détails mais prennent plus de temps. Chaque résolution est enregistrée avec l’univers une fois dessinée. Aussi sur la carte de surface.",
        "pt": "O nível de detalhe dos mapas de superfície. Os mais finos mostram mais detalhes, mas demoram mais para desenhar. Cada resolução é salva com o universo depois de desenhada. Também no mapa da superfície.",
        "sv": "Hur fint ytkartor ritas. Finare visar fler detaljer men tar längre tid att rita. Varje upplösning sparas med universumet när den väl har ritats. Även på ytkartan."
    },
    "How finely the globe of the world you zoom to is drawn. Also in the planetary view's side panel.": {
        "cs": "Jak jemně se kreslí glóbus přiblíženého světa. Také v bočním panelu planetárního zobrazení.",
        "da": "Hvor fint globussen for den verden, du zoomer ind på, tegnes. Også i planetvisningens sidepanel.",
        "de": "Wie fein der Globus der herangezoomten Welt gezeichnet wird. Auch in der Seitenleiste der Planetenansicht.",
        "es": "Con qué detalle se dibuja el globo del mundo al que te acercas. También en el panel lateral de la vista planetaria.",
        "fr": "La finesse du globe du monde sur lequel vous zoomez. Aussi dans le panneau latéral de la vue planétaire.",
        "pt": "O nível de detalhe do globo do mundo que você amplia. Também no painel lateral da vista planetária.",
        "sv": "Hur fint globen för världen du zoomar in på ritas. Även i planetvyns sidopanel."
    },
    "How finely the globe of the world zoomed to is drawn. Each resolution is saved with the universe the first time it's drawn, so it shows straight away after that.": {
        "cs": "Jak jemně se kreslí glóbus přiblíženého světa. Každé rozlišení se při prvním vykreslení uloží s vesmírem, takže se potom zobrazí hned.",
        "da": "Hvor fint globussen for den verden, der er zoomet ind på, tegnes. Hver opløsning gemmes med universet første gang, den tegnes, så den vises med det samme derefter.",
        "de": "Wie fein der Globus der herangezoomten Welt gezeichnet wird. Jede Auflösung wird beim ersten Zeichnen mit dem Universum gespeichert und erscheint danach sofort.",
        "es": "Con qué detalle se dibuja el globo del mundo ampliado. Cada resolución se guarda con el universo la primera vez que se dibuja y después aparece al instante.",
        "fr": "La finesse du globe du monde agrandi. Chaque résolution est enregistrée avec l’univers la première fois qu’elle est dessinée, puis s’affiche aussitôt.",
        "pt": "O nível de detalhe do globo do mundo ampliado. Cada resolução é salva com o universo na primeira vez que é desenhada, e depois aparece na hora.",
        "sv": "Hur fint globen för den inzoomade världen ritas. Varje upplösning sparas med universumet första gången den ritas, så den visas direkt efter det."
    },
    "How finely this surface map is drawn. Each resolution is saved with the universe the first time it's drawn, so it opens straight away after that.": {
        "cs": "Jak jemně se kreslí tato mapa povrchu. Každé rozlišení se při prvním vykreslení uloží s vesmírem, takže se potom otevře hned.",
        "da": "Hvor fint dette overfladekort tegnes. Hver opløsning gemmes med universet første gang, den tegnes, så den åbner med det samme derefter.",
        "de": "Wie fein diese Oberflächenkarte gezeichnet wird. Jede Auflösung wird beim ersten Zeichnen mit dem Universum gespeichert und öffnet sich danach sofort.",
        "es": "Con qué detalle se dibuja este mapa de superficie. Cada resolución se guarda con el universo la primera vez que se dibuja y después se abre al instante.",
        "fr": "La finesse de cette carte de surface. Chaque résolution est enregistrée avec l’univers la première fois qu’elle est dessinée, puis s’ouvre aussitôt.",
        "pt": "O nível de detalhe deste mapa de superfície. Cada resolução é salva com o universo na primeira vez que é desenhada, e depois abre na hora.",
        "sv": "Hur fint den här ytkartan ritas. Varje upplösning sparas med universumet första gången den ritas, så den öppnas direkt efter det."
    },
    "Ice crust": {
        "cs": "Ledová kůra",
        "da": "Isskorpe",
        "de": "Eiskruste",
        "es": "Corteza de hielo",
        "fr": "Croûte de glace",
        "pt": "Crosta de gelo",
        "sv": "Isskorpa"
    },
    "Imports": {
        "cs": "Dovoz",
        "da": "Import",
        "de": "Importe",
        "es": "Importaciones",
        "fr": "Importations",
        "pt": "Importações",
        "sv": "Import"
    },
    "Includes three.js, © three.js authors, under the MIT licence.": {
        "cs": "Obsahuje three.js, © autoři three.js, pod licencí MIT.",
        "da": "Indeholder three.js, © three.js-forfatterne, under MIT-licensen.",
        "de": "Enthält three.js, © three.js-Autoren, unter der MIT-Lizenz.",
        "es": "Incluye three.js, © autores de three.js, bajo la licencia MIT.",
        "fr": "Comprend three.js, © auteurs de three.js, sous licence MIT.",
        "pt": "Inclui three.js, © autores do three.js, sob a licença MIT.",
        "sv": "Innehåller three.js, © three.js-upphovspersonerna, under MIT-licensen."
    },
    "Independent": {
        "cs": "Nezávislý",
        "da": "Uafhængig",
        "de": "Unabhängig",
        "es": "Independiente",
        "fr": "Indépendant",
        "pt": "Independente",
        "sv": "Självständig"
    },
    "Industries": {
        "cs": "Odvětví",
        "da": "Erhverv",
        "de": "Industrien",
        "es": "Industrias",
        "fr": "Industries",
        "pt": "Indústrias",
        "sv": "Näringar"
    },
    "Inflation rate": {
        "cs": "Míra inflace",
        "da": "Inflationsrate",
        "de": "Inflationsrate",
        "es": "Tasa de inflación",
        "fr": "Taux d’inflation",
        "pt": "Taxa de inflação",
        "sv": "Inflationstakt"
    },
    "Introduction": {
        "cs": "Úvod",
        "da": "Introduktion",
        "de": "Einleitung",
        "es": "Introducción",
        "fr": "Introduction",
        "pt": "Introdução",
        "sv": "Inledning"
    },
    "Judiciary": {
        "cs": "Soudnictví",
        "da": "Domstole",
        "de": "Justiz",
        "es": "Poder judicial",
        "fr": "Justice",
        "pt": "Judiciário",
        "sv": "Rättsväsende"
    },
    "Labour force": {
        "cs": "Pracovní síla",
        "da": "Arbejdsstyrke",
        "de": "Erwerbsbevölkerung",
        "es": "Población activa",
        "fr": "Population active",
        "pt": "Força de trabalho",
        "sv": "Arbetskraft"
    },
    "Lake": {
        "cs": "Jezero",
        "da": "Sø",
        "de": "See",
        "es": "Lago",
        "fr": "Lac",
        "pt": "Lago",
        "sv": "Sjö"
    },
    "Languages": {
        "cs": "Jazyky",
        "da": "Sprog",
        "de": "Sprachen",
        "es": "Idiomas",
        "fr": "Langues",
        "pt": "Idiomas",
        "sv": "Språk"
    },
    "Lava lake": {
        "cs": "Lávové jezero",
        "da": "Lavasø",
        "de": "Lavasee",
        "es": "Lago de lava",
        "fr": "Lac de lave",
        "pt": "Lago de lava",
        "sv": "Lavasjö"
    },
    "Lava sea": {
        "cs": "Lávové moře",
        "da": "Lavahav",
        "de": "Lavameer",
        "es": "Mar de lava",
        "fr": "Mer de lave",
        "pt": "Mar de lava",
        "sv": "Lavahav"
    },
    "Legal system": {
        "cs": "Právní systém",
        "da": "Retssystem",
        "de": "Rechtssystem",
        "es": "Sistema jurídico",
        "fr": "Système juridique",
        "pt": "Sistema jurídico",
        "sv": "Rättssystem"
    },
    "Licence and registration required": {
        "cs": "Nutný zbrojní průkaz a registrace",
        "da": "Tilladelse og registrering påkrævet",
        "de": "Waffenschein und Registrierung nötig",
        "es": "Licencia y registro obligatorios",
        "fr": "Permis et enregistrement obligatoires",
        "pt": "Licença e registro obrigatórios",
        "sv": "Licens och registrering krävs"
    },
    "Licence…": {
        "cs": "Licence…",
        "da": "Licens…",
        "de": "Lizenz…",
        "es": "Licencia…",
        "fr": "Licence…",
        "pt": "Licença…",
        "sv": "Licens…"
    },
    "Life expectancy": {
        "cs": "Délka života",
        "da": "Forventet levetid",
        "de": "Lebenserwartung",
        "es": "Esperanza de vida",
        "fr": "Espérance de vie",
        "pt": "Expectativa de vida",
        "sv": "Förväntad livslängd"
    },
    "Literacy": {
        "cs": "Gramotnost",
        "da": "Læsefærdighed",
        "de": "Alphabetisierung",
        "es": "Alfabetización",
        "fr": "Alphabétisation",
        "pt": "Alfabetização",
        "sv": "Läskunnighet"
    },
    "Major urban areas": {
        "cs": "Největší městské oblasti",
        "da": "Største byområder",
        "de": "Größte Ballungsräume",
        "es": "Principales áreas urbanas",
        "fr": "Principales zones urbaines",
        "pt": "Principais áreas urbanas",
        "sv": "Största tätorter"
    },
    "Marsh": {
        "cs": "Bažina",
        "da": "Sump",
        "de": "Sumpf",
        "es": "Pantano",
        "fr": "Marais",
        "pt": "Pântano",
        "sv": "Träsk"
    },
    "Media": {
        "cs": "Média",
        "da": "Medier",
        "de": "Medien",
        "es": "Medios",
        "fr": "Médias",
        "pt": "Imprensa",
        "sv": "Medier"
    },
    "Median age": {
        "cs": "Mediánový věk",
        "da": "Medianalder",
        "de": "Medianalter",
        "es": "Edad mediana",
        "fr": "Âge médian",
        "pt": "Idade mediana",
        "sv": "Medianålder"
    },
    "Military and security": {
        "cs": "Armáda a bezpečnost",
        "da": "Militær og sikkerhed",
        "de": "Militär und Sicherheit",
        "es": "Ejército y seguridad",
        "fr": "Armée et sécurité",
        "pt": "Forças armadas e segurança",
        "sv": "Militär och säkerhet"
    },
    "Military junta": {
        "cs": "Vojenská junta",
        "da": "Militærjunta",
        "de": "Militärjunta",
        "es": "Junta militar",
        "fr": "Junte militaire",
        "pt": "Junta militar",
        "sv": "Militärjunta"
    },
    "Military service": {
        "cs": "Vojenská služba",
        "da": "Militærtjeneste",
        "de": "Wehrdienst",
        "es": "Servicio militar",
        "fr": "Service militaire",
        "pt": "Serviço militar",
        "sv": "Militärtjänst"
    },
    "Military spending": {
        "cs": "Vojenské výdaje",
        "da": "Militærudgifter",
        "de": "Militärausgaben",
        "es": "Gasto militar",
        "fr": "Dépenses militaires",
        "pt": "Gastos militares",
        "sv": "Militärutgifter"
    },
    "Mostly permitted": {
        "cs": "Většinou povoleno",
        "da": "For det meste tilladt",
        "de": "Weitgehend erlaubt",
        "es": "Permitidas en general",
        "fr": "Généralement autorisées",
        "pt": "Permitidas em geral",
        "sv": "Mestadels tillåtet"
    },
    "Mountains": {
        "cs": "Hory",
        "da": "Bjerge",
        "de": "Gebirge",
        "es": "Montañas",
        "fr": "Montagnes",
        "pt": "Montanhas",
        "sv": "Berg"
    },
    "National Militia": {
        "cs": "Národní milice",
        "da": "Nationalmilits",
        "de": "Nationalmiliz",
        "es": "Milicia Nacional",
        "fr": "Milice nationale",
        "pt": "Milícia Nacional",
        "sv": "Nationell milis"
    },
    "Natural hazards": {
        "cs": "Přírodní rizika",
        "da": "Naturfarer",
        "de": "Naturgefahren",
        "es": "Riesgos naturales",
        "fr": "Risques naturels",
        "pt": "Riscos naturais",
        "sv": "Naturrisker"
    },
    "Natural resources": {
        "cs": "Přírodní zdroje",
        "da": "Naturressourcer",
        "de": "Bodenschätze",
        "es": "Recursos naturales",
        "fr": "Ressources naturelles",
        "pt": "Recursos naturais",
        "sv": "Naturresurser"
    },
    "Naval Forces": {
        "cs": "Námořní síly",
        "da": "Flådestyrker",
        "de": "Seestreitkräfte",
        "es": "Fuerzas Navales",
        "fr": "Forces navales",
        "pt": "Forças Navais",
        "sv": "Marinstridskrafter"
    },
    "No central government": {
        "cs": "Žádná ústřední vláda",
        "da": "Ingen centralregering",
        "de": "Keine Zentralregierung",
        "es": "Sin gobierno central",
        "fr": "Pas de gouvernement central",
        "pt": "Sem governo central",
        "sv": "Ingen centralregering"
    },
    "No restrictions": {
        "cs": "Bez omezení",
        "da": "Ingen begrænsninger",
        "de": "Keine Einschränkungen",
        "es": "Sin restricciones",
        "fr": "Aucune restriction",
        "pt": "Sem restrições",
        "sv": "Inga begränsningar"
    },
    "None": {
        "cs": "Žádná",
        "da": "Ingen",
        "de": "Keine",
        "es": "Ninguno",
        "fr": "Aucun",
        "pt": "Nenhum",
        "sv": "Ingen"
    },
    "None (uninhabited)": {
        "cs": "Žádná (neobydleno)",
        "da": "Ingen (ubeboet)",
        "de": "Keine (unbewohnt)",
        "es": "Ninguna (deshabitado)",
        "fr": "Aucune (inhabité)",
        "pt": "Nenhuma (desabitado)",
        "sv": "Ingen (obebodd)"
    },
    "None held": {
        "cs": "Nekonají se",
        "da": "Ingen afholdt",
        "de": "Keine",
        "es": "No se celebran",
        "fr": "Aucune",
        "pt": "Não realizadas",
        "sv": "Inga hålls"
    },
    "Ocean": {
        "cs": "Oceán",
        "da": "Ocean",
        "de": "Ozean",
        "es": "Océano",
        "fr": "Océan",
        "pt": "Oceano",
        "sv": "Ocean"
    },
    "Oligarchic republic": {
        "cs": "Oligarchická republika",
        "da": "Oligarkisk republik",
        "de": "Oligarchische Republik",
        "es": "República oligárquica",
        "fr": "République oligarchique",
        "pt": "República oligárquica",
        "sv": "Oligarkisk republik"
    },
    "One-party state": {
        "cs": "Stát jedné strany",
        "da": "Etpartistat",
        "de": "Einparteienstaat",
        "es": "Estado de partido único",
        "fr": "État à parti unique",
        "pt": "Estado de partido único",
        "sv": "Enpartistat"
    },
    "Orbital station": {
        "cs": "Orbitální stanice",
        "da": "Rumstation i kredsløb",
        "de": "Orbitalstation",
        "es": "Estación orbital",
        "fr": "Station orbitale",
        "pt": "Estação orbital",
        "sv": "Omloppsstation"
    },
    "Other installations": {
        "cs": "Další zařízení",
        "da": "Andre anlæg",
        "de": "Weitere Einrichtungen",
        "es": "Otras instalaciones",
        "fr": "Autres installations",
        "pt": "Outras instalações",
        "sv": "Andra anläggningar"
    },
    "Parliamentary constitutional monarchy": {
        "cs": "Parlamentní konstituční monarchie",
        "da": "Parlamentarisk konstitutionelt monarki",
        "de": "Parlamentarische konstitutionelle Monarchie",
        "es": "Monarquía constitucional parlamentaria",
        "fr": "Monarchie constitutionnelle parlementaire",
        "pt": "Monarquia constitucional parlamentarista",
        "sv": "Parlamentarisk konstitutionell monarki"
    },
    "Parliamentary republic": {
        "cs": "Parlamentní republika",
        "da": "Parlamentarisk republik",
        "de": "Parlamentarische Republik",
        "es": "República parlamentaria",
        "fr": "République parlementaire",
        "pt": "República parlamentarista",
        "sv": "Parlamentarisk republik"
    },
    "People and society": {
        "cs": "Obyvatelstvo a společnost",
        "da": "Befolkning og samfund",
        "de": "Bevölkerung und Gesellschaft",
        "es": "Población y sociedad",
        "fr": "Population et société",
        "pt": "População e sociedade",
        "sv": "Befolkning och samhälle"
    },
    "Population": {
        "cs": "Populace",
        "da": "Befolkning",
        "de": "Bevölkerung",
        "es": "Población",
        "fr": "Population",
        "pt": "População",
        "sv": "Befolkning"
    },
    "Population growth": {
        "cs": "Růst populace",
        "da": "Befolkningstilvækst",
        "de": "Bevölkerungswachstum",
        "es": "Crecimiento demográfico",
        "fr": "Croissance démographique",
        "pt": "Crescimento populacional",
        "sv": "Befolkningstillväxt"
    },
    "Presidential republic": {
        "cs": "Prezidentská republika",
        "da": "Præsidentiel republik",
        "de": "Präsidialrepublik",
        "es": "República presidencialista",
        "fr": "République présidentielle",
        "pt": "República presidencialista",
        "sv": "Presidentrepublik"
    },
    "Real GDP (PPP)": {
        "cs": "Reálný HDP (PPP)",
        "da": "Reelt BNP (KKP)",
        "de": "Reales BIP (KKP)",
        "es": "PIB real (PPA)",
        "fr": "PIB réel (PPA)",
        "pt": "PIB real (PPC)",
        "sv": "Real BNP (KKP)"
    },
    "Real GDP growth rate": {
        "cs": "Růst reálného HDP",
        "da": "Real BNP-vækst",
        "de": "Reales BIP-Wachstum",
        "es": "Crecimiento del PIB real",
        "fr": "Croissance du PIB réel",
        "pt": "Crescimento do PIB real",
        "sv": "Real BNP-tillväxt"
    },
    "Real GDP per capita": {
        "cs": "Reálný HDP na hlavu",
        "da": "Reelt BNP pr. indbygger",
        "de": "Reales BIP pro Kopf",
        "es": "PIB real per cápita",
        "fr": "PIB réel par habitant",
        "pt": "PIB real per capita",
        "sv": "Real BNP per capita"
    },
    "Religions": {
        "cs": "Náboženství",
        "da": "Religioner",
        "de": "Religionen",
        "es": "Religiones",
        "fr": "Religions",
        "pt": "Religiões",
        "sv": "Religioner"
    },
    "Resolution": {
        "cs": "Rozlišení",
        "da": "Opløsning",
        "de": "Auflösung",
        "es": "Resolución",
        "fr": "Résolution",
        "pt": "Resolução",
        "sv": "Upplösning"
    },
    "Resolution %@": {
        "cs": "Rozlišení %@",
        "da": "Opløsning %@",
        "de": "Auflösung %@",
        "es": "Resolución %@",
        "fr": "Résolution %@",
        "pt": "Resolução %@",
        "sv": "Upplösning %@"
    },
    "Savanna": {
        "cs": "Savana",
        "da": "Savanne",
        "de": "Savanne",
        "es": "Sabana",
        "fr": "Savane",
        "pt": "Savana",
        "sv": "Savann"
    },
    "Scorched rock": {
        "cs": "Spálená skála",
        "da": "Svedet klippe",
        "de": "Versengter Fels",
        "es": "Roca calcinada",
        "fr": "Roche calcinée",
        "pt": "Rocha calcinada",
        "sv": "Förbränd sten"
    },
    "Sea ice": {
        "cs": "Mořský led",
        "da": "Havis",
        "de": "Meereis",
        "es": "Hielo marino",
        "fr": "Banquise",
        "pt": "Gelo marinho",
        "sv": "Havsis"
    },
    "Security situation": {
        "cs": "Bezpečnostní situace",
        "da": "Sikkerhedssituation",
        "de": "Sicherheitslage",
        "es": "Situación de seguridad",
        "fr": "Situation sécuritaire",
        "pt": "Situação de segurança",
        "sv": "Säkerhetsläge"
    },
    "Ship arrivals": {
        "cs": "Přílety lodí",
        "da": "Skibsankomster",
        "de": "Schiffsankünfte",
        "es": "Llegadas de naves",
        "fr": "Arrivées de vaisseaux",
        "pt": "Chegadas de naves",
        "sv": "Fartygsankomster"
    },
    "Shrubland": {
        "cs": "Křoviny",
        "da": "Krat",
        "de": "Buschland",
        "es": "Matorral",
        "fr": "Maquis",
        "pt": "Matagal",
        "sv": "Buskmark"
    },
    "Snow and ice": {
        "cs": "Sníh a led",
        "da": "Sne og is",
        "de": "Schnee und Eis",
        "es": "Nieve y hielo",
        "fr": "Neige et glace",
        "pt": "Neve e gelo",
        "sv": "Snö och is"
    },
    "Society": {
        "cs": "Společnost",
        "da": "Samfund",
        "de": "Gesellschaft",
        "es": "Sociedad",
        "fr": "Société",
        "pt": "Sociedade",
        "sv": "Samhälle"
    },
    "Sovereign states": {
        "cs": "Suverénní státy",
        "da": "Suveræne stater",
        "de": "Souveräne Staaten",
        "es": "Estados soberanos",
        "fr": "États souverains",
        "pt": "Estados soberanos",
        "sv": "Suveräna stater"
    },
    "Space Force": {
        "cs": "Vesmírné síly",
        "da": "Rumstyrker",
        "de": "Weltraumstreitkräfte",
        "es": "Fuerza Espacial",
        "fr": "Force spatiale",
        "pt": "Força Espacial",
        "sv": "Rymdstridskrafter"
    },
    "Spaceports": {
        "cs": "Kosmodromy",
        "da": "Rumhavne",
        "de": "Raumhäfen",
        "es": "Puertos espaciales",
        "fr": "Astroports",
        "pt": "Espaçoportos",
        "sv": "Rymdhamnar"
    },
    "Stable": {
        "cs": "Stabilní",
        "da": "Stabil",
        "de": "Stabil",
        "es": "Estable",
        "fr": "Stable",
        "pt": "Estável",
        "sv": "Stabil"
    },
    "Subtropical desert": {
        "cs": "Subtropická poušť",
        "da": "Subtropisk ørken",
        "de": "Subtropische Wüste",
        "es": "Desierto subtropical",
        "fr": "Désert subtropical",
        "pt": "Deserto subtropical",
        "sv": "Subtropisk öken"
    },
    "Suffrage": {
        "cs": "Hlasování",
        "da": "Valgret",
        "de": "Wahlrecht",
        "es": "Sufragio",
        "fr": "Suffrage",
        "pt": "Sufrágio",
        "sv": "Rösträtt"
    },
    "Taiga": {
        "cs": "Tajga",
        "da": "Taiga",
        "de": "Taiga",
        "es": "Taiga",
        "fr": "Taïga",
        "pt": "Taiga",
        "sv": "Tajga"
    },
    "Technocratic council": {
        "cs": "Technokratická rada",
        "da": "Teknokratisk råd",
        "de": "Technokratischer Rat",
        "es": "Consejo tecnocrático",
        "fr": "Conseil technocratique",
        "pt": "Conselho tecnocrático",
        "sv": "Teknokratiskt råd"
    },
    "Technology base": {
        "cs": "Úroveň technologie",
        "da": "Teknologisk grundlag",
        "de": "Technologiestand",
        "es": "Base tecnológica",
        "fr": "Niveau technologique",
        "pt": "Base tecnológica",
        "sv": "Teknikbas"
    },
    "Temperate desert": {
        "cs": "Mírná poušť",
        "da": "Tempereret ørken",
        "de": "Gemäßigte Wüste",
        "es": "Desierto templado",
        "fr": "Désert tempéré",
        "pt": "Deserto temperado",
        "sv": "Tempererad öken"
    },
    "Temperate forest": {
        "cs": "Mírný les",
        "da": "Tempereret skov",
        "de": "Gemäßigter Wald",
        "es": "Bosque templado",
        "fr": "Forêt tempérée",
        "pt": "Floresta temperada",
        "sv": "Tempererad skog"
    },
    "Temperate rainforest": {
        "cs": "Mírný deštný les",
        "da": "Tempereret regnskov",
        "de": "Gemäßigter Regenwald",
        "es": "Bosque lluvioso templado",
        "fr": "Forêt pluviale tempérée",
        "pt": "Floresta pluvial temperada",
        "sv": "Tempererad regnskog"
    },
    "Theocratic state": {
        "cs": "Teokratický stát",
        "da": "Teokratisk stat",
        "de": "Theokratischer Staat",
        "es": "Estado teocrático",
        "fr": "État théocratique",
        "pt": "Estado teocrático",
        "sv": "Teokratisk stat"
    },
    "Transportation": {
        "cs": "Doprava",
        "da": "Transport",
        "de": "Verkehr",
        "es": "Transporte",
        "fr": "Transports",
        "pt": "Transportes",
        "sv": "Transport"
    },
    "Travel advisory": {
        "cs": "Cestovní doporučení",
        "da": "Rejsevejledning",
        "de": "Reisewarnung",
        "es": "Aviso de viaje",
        "fr": "Conseil aux voyageurs",
        "pt": "Alerta de viagem",
        "sv": "Reseråd"
    },
    "Tribal chiefdoms": {
        "cs": "Kmenová náčelnictví",
        "da": "Stammehøvdingedømmer",
        "de": "Stammesfürstentümer",
        "es": "Jefaturas tribales",
        "fr": "Chefferies tribales",
        "pt": "Chefias tribais",
        "sv": "Stamhövdingadömen"
    },
    "Tropical rainforest": {
        "cs": "Tropický deštný les",
        "da": "Tropisk regnskov",
        "de": "Tropischer Regenwald",
        "es": "Selva tropical",
        "fr": "Forêt tropicale humide",
        "pt": "Floresta tropical úmida",
        "sv": "Tropisk regnskog"
    },
    "Tropical seasonal forest": {
        "cs": "Tropický sezónní les",
        "da": "Tropisk sæsonskov",
        "de": "Tropischer Saisonwald",
        "es": "Bosque tropical estacional",
        "fr": "Forêt tropicale saisonnière",
        "pt": "Floresta tropical sazonal",
        "sv": "Tropisk säsongsskog"
    },
    "Tundra": {
        "cs": "Tundra",
        "da": "Tundra",
        "de": "Tundra",
        "es": "Tundra",
        "fr": "Toundra",
        "pt": "Tundra",
        "sv": "Tundra"
    },
    "Unemployment rate": {
        "cs": "Nezaměstnanost",
        "da": "Arbejdsløshed",
        "de": "Arbeitslosenquote",
        "es": "Tasa de desempleo",
        "fr": "Taux de chômage",
        "pt": "Taxa de desemprego",
        "sv": "Arbetslöshet"
    },
    "Urbanisation": {
        "cs": "Urbanizace",
        "da": "Urbanisering",
        "de": "Verstädterung",
        "es": "Urbanización",
        "fr": "Urbanisation",
        "pt": "Urbanização",
        "sv": "Urbanisering"
    },
    "Volcano": {
        "cs": "Sopka",
        "da": "Vulkan",
        "de": "Vulkan",
        "es": "Volcán",
        "fr": "Volcan",
        "pt": "Vulcão",
        "sv": "Vulkan"
    },
    "abolished": {
        "cs": "zrušen",
        "da": "afskaffet",
        "de": "abgeschafft",
        "es": "abolida",
        "fr": "abolie",
        "pt": "abolida",
        "sv": "avskaffat"
    },
    "agriculture": {
        "cs": "zemědělství",
        "da": "landbrug",
        "de": "Landwirtschaft",
        "es": "agricultura",
        "fr": "agriculture",
        "pt": "agricultura",
        "sv": "jordbruk"
    },
    "agriculture %@, industry %@, services %@": {
        "cs": "zemědělství %@, průmysl %@, služby %@",
        "da": "landbrug %@, industri %@, service %@",
        "de": "Landwirtschaft %@, Industrie %@, Dienstleistungen %@",
        "es": "agricultura %@, industria %@, servicios %@",
        "fr": "agriculture %@, industrie %@, services %@",
        "pt": "agricultura %@, indústria %@, serviços %@",
        "sv": "jordbruk %@, industri %@, tjänster %@"
    },
    "airless": {
        "cs": "bez vzduchu",
        "da": "uden luft",
        "de": "luftlos",
        "es": "sin aire",
        "fr": "sans air",
        "pt": "sem ar",
        "sv": "luftlös"
    },
    "approximately %@": {
        "cs": "přibližně %@",
        "da": "cirka %@",
        "de": "etwa %@",
        "es": "aproximadamente %@",
        "fr": "environ %@",
        "pt": "aproximadamente %@",
        "sv": "cirka %@"
    },
    "arable land": {
        "cs": "orná půda",
        "da": "agerjord",
        "de": "Ackerland",
        "es": "tierras cultivables",
        "fr": "terres arables",
        "pt": "terras aráveis",
        "sv": "åkermark"
    },
    "asteroid mining": {
        "cs": "těžba asteroidů",
        "da": "asteroideminedrift",
        "de": "Asteroidenbergbau",
        "es": "minería de asteroides",
        "fr": "exploitation minière des astéroïdes",
        "pt": "mineração de asteroides",
        "sv": "asteroidgruvdrift"
    },
    "banking": {
        "cs": "bankovnictví",
        "da": "bankvirksomhed",
        "de": "Bankwesen",
        "es": "banca",
        "fr": "banque",
        "pt": "bancos",
        "sv": "bankväsende"
    },
    "bauxite": {
        "cs": "bauxit",
        "da": "bauxit",
        "de": "Bauxit",
        "es": "bauxita",
        "fr": "bauxite",
        "pt": "bauxita",
        "sv": "bauxit"
    },
    "chemicals": {
        "cs": "chemikálie",
        "da": "kemikalier",
        "de": "Chemie",
        "es": "productos químicos",
        "fr": "produits chimiques",
        "pt": "produtos químicos",
        "sv": "kemikalier"
    },
    "civil law system": {
        "cs": "kontinentální právní systém",
        "da": "civilretligt system",
        "de": "kontinentaleuropäisches Recht",
        "es": "sistema de derecho civil",
        "fr": "système de droit civil",
        "pt": "sistema de direito civil",
        "sv": "civilrättsligt system"
    },
    "civil law, overridden by military decree": {
        "cs": "občanské právo, přebité vojenskými dekrety",
        "da": "civilret, tilsidesat af militærdekreter",
        "de": "Zivilrecht, durch Militärdekrete außer Kraft gesetzt",
        "es": "derecho civil, anulado por decretos militares",
        "fr": "droit civil, supplanté par des décrets militaires",
        "pt": "direito civil, sobreposto por decretos militares",
        "sv": "civilrätt, åsidosatt av militära dekret"
    },
    "cobalt": {
        "cs": "kobalt",
        "da": "kobolt",
        "de": "Kobalt",
        "es": "cobalto",
        "fr": "cobalt",
        "pt": "cobalto",
        "sv": "kobolt"
    },
    "cold": {
        "cs": "chladný",
        "da": "kold",
        "de": "kalt",
        "es": "frío",
        "fr": "froid",
        "pt": "frio",
        "sv": "kall"
    },
    "common law system": {
        "cs": "systém common law",
        "da": "common law-system",
        "de": "Common Law",
        "es": "sistema de derecho anglosajón",
        "fr": "système de common law",
        "pt": "sistema de common law",
        "sv": "common law-system"
    },
    "copper": {
        "cs": "měď",
        "da": "kobber",
        "de": "Kupfer",
        "es": "cobre",
        "fr": "cuivre",
        "pt": "cobre",
        "sv": "koppar"
    },
    "corporate charter and company regulations": {
        "cs": "výsada korporace a firemní předpisy",
        "da": "selskabsprivilegium og virksomhedsregler",
        "de": "Konzernfreibrief und Unternehmensvorschriften",
        "es": "carta corporativa y reglamentos de la empresa",
        "fr": "charte d’entreprise et règlements de la compagnie",
        "pt": "carta corporativa e regulamentos da empresa",
        "sv": "bolagsprivilegium och företagsföreskrifter"
    },
    "corrosive atmosphere": {
        "cs": "žíravá atmosféra",
        "da": "ætsende atmosfære",
        "de": "ätzende Atmosphäre",
        "es": "atmósfera corrosiva",
        "fr": "atmosphère corrosive",
        "pt": "atmosfera corrosiva",
        "sv": "frätande atmosfär"
    },
    "customary law": {
        "cs": "zvykové právo",
        "da": "sædvaneret",
        "de": "Gewohnheitsrecht",
        "es": "derecho consuetudinario",
        "fr": "droit coutumier",
        "pt": "direito consuetudinário",
        "sv": "sedvanerätt"
    },
    "dense air": {
        "cs": "hustý vzduch",
        "da": "tæt luft",
        "de": "dichte Luft",
        "es": "aire denso",
        "fr": "air dense",
        "pt": "ar denso",
        "sv": "tät luft"
    },
    "earthquakes": {
        "cs": "zemětřesení",
        "da": "jordskælv",
        "de": "Erdbeben",
        "es": "terremotos",
        "fr": "séismes",
        "pt": "terremotos",
        "sv": "jordbävningar"
    },
    "extreme cold": {
        "cs": "extrémní chlad",
        "da": "ekstrem kulde",
        "de": "extreme Kälte",
        "es": "frío extremo",
        "fr": "froid extrême",
        "pt": "frio extremo",
        "sv": "extrem kyla"
    },
    "extreme heat": {
        "cs": "extrémní horko",
        "da": "ekstrem varme",
        "de": "extreme Hitze",
        "es": "calor extremo",
        "fr": "chaleur extrême",
        "pt": "calor extremo",
        "sv": "extrem hetta"
    },
    "financial services": {
        "cs": "finanční služby",
        "da": "finansielle tjenester",
        "de": "Finanzdienstleistungen",
        "es": "servicios financieros",
        "fr": "services financiers",
        "pt": "serviços financeiros",
        "sv": "finansiella tjänster"
    },
    "fish": {
        "cs": "ryby",
        "da": "fisk",
        "de": "Fisch",
        "es": "pesca",
        "fr": "poisson",
        "pt": "peixes",
        "sv": "fisk"
    },
    "fishing": {
        "cs": "rybolov",
        "da": "fiskeri",
        "de": "Fischerei",
        "es": "pesca",
        "fr": "pêche",
        "pt": "pesca",
        "sv": "fiske"
    },
    "food processing": {
        "cs": "zpracování potravin",
        "da": "fødevareforarbejdning",
        "de": "Lebensmittelverarbeitung",
        "es": "procesamiento de alimentos",
        "fr": "agroalimentaire",
        "pt": "processamento de alimentos",
        "sv": "livsmedelsförädling"
    },
    "foodstuffs": {
        "cs": "potraviny",
        "da": "fødevarer",
        "de": "Lebensmittel",
        "es": "alimentos",
        "fr": "denrées alimentaires",
        "pt": "alimentos",
        "sv": "livsmedel"
    },
    "free press": {
        "cs": "svobodný tisk",
        "da": "fri presse",
        "de": "freie Presse",
        "es": "prensa libre",
        "fr": "presse libre",
        "pt": "imprensa livre",
        "sv": "fri press"
    },
    "frozen": {
        "cs": "zmrzlý",
        "da": "frossen",
        "de": "gefroren",
        "es": "helado",
        "fr": "glacé",
        "pt": "congelado",
        "sv": "frusen"
    },
    "fusion power plants": {
        "cs": "fúzní elektrárny",
        "da": "fusionskraftværker",
        "de": "Fusionskraftwerke",
        "es": "centrales de fusión",
        "fr": "centrales à fusion",
        "pt": "usinas de fusão",
        "sv": "fusionskraftverk"
    },
    "gold": {
        "cs": "zlato",
        "da": "guld",
        "de": "Gold",
        "es": "oro",
        "fr": "or",
        "pt": "ouro",
        "sv": "guld"
    },
    "handicrafts": {
        "cs": "řemesla",
        "da": "håndværk",
        "de": "Handwerk",
        "es": "artesanía",
        "fr": "artisanat",
        "pt": "artesanato",
        "sv": "hantverk"
    },
    "health care": {
        "cs": "zdravotnictví",
        "da": "sundhedsvæsen",
        "de": "Gesundheitswesen",
        "es": "sanidad",
        "fr": "santé",
        "pt": "saúde",
        "sv": "hälso- och sjukvård"
    },
    "high technology": {
        "cs": "high-tech",
        "da": "højteknologi",
        "de": "Hochtechnologie",
        "es": "alta tecnología",
        "fr": "haute technologie",
        "pt": "alta tecnologia",
        "sv": "högteknologi"
    },
    "homogeneous": {
        "cs": "homogenní",
        "da": "homogen",
        "de": "homogen",
        "es": "homogéneo",
        "fr": "homogène",
        "pt": "homogêneo",
        "sv": "homogen"
    },
    "hospitality": {
        "cs": "pohostinství",
        "da": "hotel og restauration",
        "de": "Gastgewerbe",
        "es": "hostelería",
        "fr": "hôtellerie",
        "pt": "hotelaria",
        "sv": "hotell och restaurang"
    },
    "hot": {
        "cs": "horký",
        "da": "varm",
        "de": "heiß",
        "es": "cálido",
        "fr": "chaud",
        "pt": "quente",
        "sv": "varm"
    },
    "hydrocarbons": {
        "cs": "uhlovodíky",
        "da": "kulbrinter",
        "de": "Kohlenwasserstoffe",
        "es": "hidrocarburos",
        "fr": "hydrocarbures",
        "pt": "hidrocarbonetos",
        "sv": "kolväten"
    },
    "hydropower": {
        "cs": "vodní energie",
        "da": "vandkraft",
        "de": "Wasserkraft",
        "es": "energía hidroeléctrica",
        "fr": "hydroélectricité",
        "pt": "energia hidrelétrica",
        "sv": "vattenkraft"
    },
    "independent": {
        "cs": "nezávislé",
        "da": "uafhængig",
        "de": "unabhängig",
        "es": "independiente",
        "fr": "indépendante",
        "pt": "independente",
        "sv": "oberoende"
    },
    "insurance": {
        "cs": "pojišťovnictví",
        "da": "forsikring",
        "de": "Versicherungen",
        "es": "seguros",
        "fr": "assurance",
        "pt": "seguros",
        "sv": "försäkring"
    },
    "iron ore": {
        "cs": "železná ruda",
        "da": "jernmalm",
        "de": "Eisenerz",
        "es": "mineral de hierro",
        "fr": "minerai de fer",
        "pt": "minério de ferro",
        "sv": "järnmalm"
    },
    "largely independent": {
        "cs": "převážně nezávislé",
        "da": "stort set uafhængig",
        "de": "weitgehend unabhängig",
        "es": "mayormente independiente",
        "fr": "largement indépendante",
        "pt": "majoritariamente independente",
        "sv": "i stort sett oberoende"
    },
    "largest city %@; %@ cities of a million or more": {
        "cs": "největší město %@; města s milionem a více obyvatel: %@",
        "da": "største by %@; %@ byer med en million eller flere",
        "de": "größte Stadt %@; %@ Millionenstädte",
        "es": "ciudad más grande %@; %@ ciudades de un millón o más",
        "fr": "plus grande ville %@ ; %@ villes d’un million d’habitants ou plus",
        "pt": "maior cidade %@; %@ cidades com um milhão ou mais",
        "sv": "största stad %@; %@ städer med en miljon eller fler"
    },
    "largest settlement %@": {
        "cs": "největší sídlo %@",
        "da": "største bebyggelse %@",
        "de": "größte Siedlung %@",
        "es": "mayor asentamiento %@",
        "fr": "plus grande localité %@",
        "pt": "maior povoado %@",
        "sv": "största bosättning %@"
    },
    "lithium": {
        "cs": "lithium",
        "da": "lithium",
        "de": "Lithium",
        "es": "litio",
        "fr": "lithium",
        "pt": "lítio",
        "sv": "litium"
    },
    "logistics": {
        "cs": "logistika",
        "da": "logistik",
        "de": "Logistik",
        "es": "logística",
        "fr": "logistique",
        "pt": "logística",
        "sv": "logistik"
    },
    "machinery": {
        "cs": "stroje",
        "da": "maskiner",
        "de": "Maschinenbau",
        "es": "maquinaria",
        "fr": "machines",
        "pt": "máquinas",
        "sv": "maskiner"
    },
    "majority faith": {
        "cs": "většinová víra",
        "da": "majoritetstro",
        "de": "Mehrheitsreligion",
        "es": "religión mayoritaria",
        "fr": "religion majoritaire",
        "pt": "religião majoritária",
        "sv": "majoritetsreligion"
    },
    "majority group %@%, %@ minority groups %@%": {
        "cs": "většinová skupina %@ %, menšiny (%@) %@ %",
        "da": "majoritetsgruppe %@%, %@ minoritetsgrupper %@%",
        "de": "Mehrheitsgruppe %@ %, %@ Minderheiten %@ %",
        "es": "grupo mayoritario %@%, %@ grupos minoritarios %@%",
        "fr": "groupe majoritaire %@ %, %@ groupes minoritaires %@ %",
        "pt": "grupo majoritário %@%, %@ grupos minoritários %@%",
        "sv": "majoritetsgrupp %@ %, %@ minoritetsgrupper %@ %"
    },
    "majority group %@%, one minority group %@%": {
        "cs": "většinová skupina %@ %, jedna menšina %@ %",
        "da": "majoritetsgruppe %@%, én minoritetsgruppe %@%",
        "de": "Mehrheitsgruppe %@ %, eine Minderheit %@ %",
        "es": "grupo mayoritario %@%, un grupo minoritario %@%",
        "fr": "groupe majoritaire %@ %, un groupe minoritaire %@ %",
        "pt": "grupo majoritário %@%, um grupo minoritário %@%",
        "sv": "majoritetsgrupp %@ %, en minoritetsgrupp %@ %"
    },
    "manufactured goods": {
        "cs": "průmyslové zboží",
        "da": "industrivarer",
        "de": "Industriegüter",
        "es": "productos manufacturados",
        "fr": "produits manufacturés",
        "pt": "produtos manufaturados",
        "sv": "industrivaror"
    },
    "metals and ores": {
        "cs": "kovy a rudy",
        "da": "metaller og malme",
        "de": "Metalle und Erze",
        "es": "metales y minerales",
        "fr": "métaux et minerais",
        "pt": "metais e minérios",
        "sv": "metaller och malmer"
    },
    "military base": {
        "cs": "vojenská základna",
        "da": "militærbase",
        "de": "Militärbasis",
        "es": "base militar",
        "fr": "base militaire",
        "pt": "base militar",
        "sv": "militärbas"
    },
    "mining": {
        "cs": "těžba",
        "da": "minedrift",
        "de": "Bergbau",
        "es": "minería",
        "fr": "exploitation minière",
        "pt": "mineração",
        "sv": "gruvdrift"
    },
    "mixed legal system": {
        "cs": "smíšený právní systém",
        "da": "blandet retssystem",
        "de": "gemischtes Rechtssystem",
        "es": "sistema jurídico mixto",
        "fr": "système juridique mixte",
        "pt": "sistema jurídico misto",
        "sv": "blandat rättssystem"
    },
    "nickel": {
        "cs": "nikl",
        "da": "nikkel",
        "de": "Nickel",
        "es": "níquel",
        "fr": "nickel",
        "pt": "níquel",
        "sv": "nickel"
    },
    "nickel-iron": {
        "cs": "Ni-Fe",
        "da": "nikkeljern",
        "de": "Nickeleisen",
        "es": "ferroníquel",
        "fr": "ferronickel",
        "pt": "ferro-níquel",
        "sv": "nickeljärn"
    },
    "no standing forces; a volunteer militia": {
        "cs": "žádná stálá armáda; dobrovolná domobrana",
        "da": "ingen stående styrker; en frivillig milits",
        "de": "keine stehenden Truppen; eine Freiwilligenmiliz",
        "es": "sin fuerzas permanentes; una milicia voluntaria",
        "fr": "pas de forces permanentes ; une milice de volontaires",
        "pt": "sem forças permanentes; uma milícia voluntária",
        "sv": "inga stående styrkor; en frivillig milis"
    },
    "no written language": {
        "cs": "žádný psaný jazyk",
        "da": "intet skriftsprog",
        "de": "keine Schriftsprache",
        "es": "sin lengua escrita",
        "fr": "pas de langue écrite",
        "pt": "sem língua escrita",
        "sv": "inget skriftspråk"
    },
    "none": {
        "cs": "žádné",
        "da": "ingen",
        "de": "keine",
        "es": "ninguno",
        "fr": "aucun",
        "pt": "nenhum",
        "sv": "ingen"
    },
    "one common language (official)": {
        "cs": "jeden společný jazyk (úřední)",
        "da": "ét fælles sprog (officielt)",
        "de": "eine gemeinsame Sprache (Amtssprache)",
        "es": "una lengua común (oficial)",
        "fr": "une langue commune (officielle)",
        "pt": "uma língua comum (oficial)",
        "sv": "ett gemensamt språk (officiellt)"
    },
    "one common language (official), %@ regional languages": {
        "cs": "jeden společný jazyk (úřední), regionální jazyky: %@",
        "da": "ét fælles sprog (officielt), %@ regionale sprog",
        "de": "eine gemeinsame Sprache (Amtssprache), %@ Regionalsprachen",
        "es": "una lengua común (oficial), %@ lenguas regionales",
        "fr": "une langue commune (officielle), %@ langues régionales",
        "pt": "uma língua comum (oficial), %@ línguas regionais",
        "sv": "ett gemensamt språk (officiellt), %@ regionala språk"
    },
    "one common language (official), one regional language": {
        "cs": "jeden společný jazyk (úřední), jeden regionální jazyk",
        "da": "ét fælles sprog (officielt), ét regionalt sprog",
        "de": "eine gemeinsame Sprache (Amtssprache), eine Regionalsprache",
        "es": "una lengua común (oficial), una lengua regional",
        "fr": "une langue commune (officielle), une langue régionale",
        "pt": "uma língua comum (oficial), uma língua regional",
        "sv": "ett gemensamt språk (officiellt), ett regionalt språk"
    },
    "ore refining": {
        "cs": "zpracování rud",
        "da": "malmraffinering",
        "de": "Erzverhüttung",
        "es": "refinado de minerales",
        "fr": "raffinage de minerais",
        "pt": "refino de minérios",
        "sv": "malmförädling"
    },
    "partly free": {
        "cs": "částečně svobodné",
        "da": "delvist fri",
        "de": "teilweise frei",
        "es": "parcialmente libre",
        "fr": "partiellement libre",
        "pt": "parcialmente livre",
        "sv": "delvis fri"
    },
    "platinum-group metals": {
        "cs": "platinové kovy",
        "da": "platingruppemetaller",
        "de": "Platinmetalle",
        "es": "metales del grupo del platino",
        "fr": "métaux du groupe du platine",
        "pt": "metais do grupo da platina",
        "sv": "platinagruppmetaller"
    },
    "rare earth elements": {
        "cs": "prvky vzácných zemin",
        "da": "sjældne jordarter",
        "de": "Seltene Erden",
        "es": "tierras raras",
        "fr": "terres rares",
        "pt": "terras raras",
        "sv": "sällsynta jordartsmetaller"
    },
    "religious law": {
        "cs": "náboženské právo",
        "da": "religiøs lov",
        "de": "religiöses Recht",
        "es": "derecho religioso",
        "fr": "droit religieux",
        "pt": "direito religioso",
        "sv": "religiös lag"
    },
    "research station": {
        "cs": "výzkumná stanice",
        "da": "forskningsstation",
        "de": "Forschungsstation",
        "es": "estación de investigación",
        "fr": "station de recherche",
        "pt": "estação de pesquisa",
        "sv": "forskningsstation"
    },
    "restricted": {
        "cs": "omezené",
        "da": "begrænset",
        "de": "eingeschränkt",
        "es": "restringida",
        "fr": "restreinte",
        "pt": "restrita",
        "sv": "begränsad"
    },
    "retail": {
        "cs": "maloobchod",
        "da": "detailhandel",
        "de": "Einzelhandel",
        "es": "comercio minorista",
        "fr": "commerce de détail",
        "pt": "varejo",
        "sv": "detaljhandel"
    },
    "retained": {
        "cs": "zachován",
        "da": "bevaret",
        "de": "beibehalten",
        "es": "vigente",
        "fr": "maintenue",
        "pt": "mantida",
        "sv": "kvar"
    },
    "scientific research": {
        "cs": "vědecký výzkum",
        "da": "videnskabelig forskning",
        "de": "wissenschaftliche Forschung",
        "es": "investigación científica",
        "fr": "recherche scientifique",
        "pt": "pesquisa científica",
        "sv": "vetenskaplig forskning"
    },
    "scorching": {
        "cs": "rozpálený",
        "da": "brændende hed",
        "de": "glühend heiß",
        "es": "abrasador",
        "fr": "brûlant",
        "pt": "escaldante",
        "sv": "glödhet"
    },
    "seafood": {
        "cs": "plody moře",
        "da": "fisk og skaldyr",
        "de": "Meeresfrüchte",
        "es": "mariscos",
        "fr": "produits de la mer",
        "pt": "frutos do mar",
        "sv": "fisk och skaldjur"
    },
    "severe storms": {
        "cs": "silné bouře",
        "da": "kraftige storme",
        "de": "schwere Stürme",
        "es": "tormentas fuertes",
        "fr": "violentes tempêtes",
        "pt": "tempestades severas",
        "sv": "kraftiga stormar"
    },
    "shipbuilding": {
        "cs": "stavba lodí",
        "da": "skibsbygning",
        "de": "Schiffbau",
        "es": "construcción naval",
        "fr": "construction navale",
        "pt": "construção naval",
        "sv": "skeppsbyggnad"
    },
    "silver": {
        "cs": "stříbro",
        "da": "sølv",
        "de": "Silber",
        "es": "plata",
        "fr": "argent",
        "pt": "prata",
        "sv": "silver"
    },
    "solar radiation": {
        "cs": "sluneční záření",
        "da": "solstråling",
        "de": "Sonnenstrahlung",
        "es": "radiación solar",
        "fr": "rayonnement solaire",
        "pt": "radiação solar",
        "sv": "solstrålning"
    },
    "spacecraft components": {
        "cs": "součásti kosmických lodí",
        "da": "rumfartøjskomponenter",
        "de": "Raumschiffkomponenten",
        "es": "componentes de naves espaciales",
        "fr": "composants de vaisseaux spatiaux",
        "pt": "componentes de naves espaciais",
        "sv": "rymdfarkostkomponenter"
    },
    "state religion": {
        "cs": "státní víra",
        "da": "statsreligion",
        "de": "Staatsreligion",
        "es": "religión oficial",
        "fr": "religion d’État",
        "pt": "religião oficial",
        "sv": "statsreligion"
    },
    "state-controlled": {
        "cs": "pod kontrolou státu",
        "da": "statskontrolleret",
        "de": "staatlich kontrolliert",
        "es": "controlados por el Estado",
        "fr": "contrôlés par l’État",
        "pt": "controlada pelo Estado",
        "sv": "statskontrollerad"
    },
    "subject to political pressure": {
        "cs": "pod politickým tlakem",
        "da": "udsat for politisk pres",
        "de": "politischem Druck ausgesetzt",
        "es": "sujeto a presión política",
        "fr": "soumise à des pressions politiques",
        "pt": "sujeito a pressão política",
        "sv": "utsatt för politiska påtryckningar"
    },
    "subordinate to the government": {
        "cs": "podřízené vládě",
        "da": "underlagt regeringen",
        "de": "der Regierung unterstellt",
        "es": "subordinado al gobierno",
        "fr": "subordonnée au gouvernement",
        "pt": "subordinado ao governo",
        "sv": "underordnad regeringen"
    },
    "subsistence farming": {
        "cs": "samozásobitelství",
        "da": "selvforsyningslandbrug",
        "de": "Subsistenzlandwirtschaft",
        "es": "agricultura de subsistencia",
        "fr": "agriculture de subsistance",
        "pt": "agricultura de subsistência",
        "sv": "självhushållsjordbruk"
    },
    "technical data and pharmaceuticals": {
        "cs": "technická data a léčiva",
        "da": "tekniske data og lægemidler",
        "de": "technische Daten und Arzneimittel",
        "es": "datos técnicos y fármacos",
        "fr": "données techniques et produits pharmaceutiques",
        "pt": "dados técnicos e fármacos",
        "sv": "tekniska data och läkemedel"
    },
    "temperate": {
        "cs": "mírný",
        "da": "tempereret",
        "de": "gemäßigt",
        "es": "templado",
        "fr": "tempéré",
        "pt": "temperado",
        "sv": "tempererad"
    },
    "the laws of the governing power": {
        "cs": "zákony vládnoucí moci",
        "da": "den styrende magts love",
        "de": "die Gesetze der Verwaltungsmacht",
        "es": "las leyes de la potencia gobernante",
        "fr": "les lois de la puissance administrante",
        "pt": "as leis da potência governante",
        "sv": "den styrande maktens lagar"
    },
    "thin air": {
        "cs": "řídký vzduch",
        "da": "tynd luft",
        "de": "dünne Luft",
        "es": "aire tenue",
        "fr": "air raréfié",
        "pt": "ar rarefeito",
        "sv": "tunn luft"
    },
    "timber": {
        "cs": "dřevo",
        "da": "tømmer",
        "de": "Holz",
        "es": "madera",
        "fr": "bois",
        "pt": "madeira",
        "sv": "timmer"
    },
    "titanium": {
        "cs": "titan",
        "da": "titan",
        "de": "Titan",
        "es": "titanio",
        "fr": "titane",
        "pt": "titânio",
        "sv": "titan"
    },
    "total: %@ km²; land: %@ km²; water: %@ km²": {
        "cs": "celkem: %@ km²; souš: %@ km²; voda: %@ km²",
        "da": "i alt: %@ km²; land: %@ km²; vand: %@ km²",
        "de": "gesamt: %@ km²; Land: %@ km²; Wasser: %@ km²",
        "es": "total: %@ km²; tierra: %@ km²; agua: %@ km²",
        "fr": "totale : %@ km² ; terres : %@ km² ; eaux : %@ km²",
        "pt": "total: %@ km²; terra: %@ km²; água: %@ km²",
        "sv": "totalt: %@ km²; land: %@ km²; vatten: %@ km²"
    },
    "tourism": {
        "cs": "turistika",
        "da": "turisme",
        "de": "Tourismus",
        "es": "turismo",
        "fr": "tourisme",
        "pt": "turismo",
        "sv": "turism"
    },
    "toxic air": {
        "cs": "jedovatý vzduch",
        "da": "giftig luft",
        "de": "giftige Luft",
        "es": "aire tóxico",
        "fr": "air toxique",
        "pt": "ar tóxico",
        "sv": "giftig luft"
    },
    "uranium": {
        "cs": "uran",
        "da": "uran",
        "de": "Uran",
        "es": "uranio",
        "fr": "uranium",
        "pt": "urânio",
        "sv": "uran"
    },
    "vacuum": {
        "cs": "vakuum",
        "da": "vakuum",
        "de": "Vakuum",
        "es": "vacío",
        "fr": "vide",
        "pt": "vácuo",
        "sv": "vakuum"
    },
    "vehicles": {
        "cs": "vozidla",
        "da": "køretøjer",
        "de": "Fahrzeuge",
        "es": "vehículos",
        "fr": "véhicules",
        "pt": "veículos",
        "sv": "fordon"
    },
    "water": {
        "cs": "voda",
        "da": "vand",
        "de": "Wasser",
        "es": "agua",
        "fr": "eau",
        "pt": "água",
        "sv": "vatten"
    },
    "water ice": {
        "cs": "vodní led",
        "da": "vandis",
        "de": "Wassereis",
        "es": "hielo de agua",
        "fr": "glace d’eau",
        "pt": "gelo de água",
        "sv": "vattenis"
    },
    "yes": {
        "cs": "ano",
        "da": "ja",
        "de": "ja",
        "es": "sí",
        "fr": "oui",
        "pt": "sim",
        "sv": "ja"
    },
    "%.1f billion": {
        "cs": "%.1f miliardy",
        "da": "%.1f milliarder",
        "de": "%.1f Milliarden",
        "es": "%.1f mil millones",
        "fr": "%.1f milliards",
        "pt": "%.1f bilhões",
        "sv": "%.1f miljarder"
    },
    "%.1f million": {
        "cs": "%.1f milionu",
        "da": "%.1f millioner",
        "de": "%.1f Millionen",
        "es": "%.1f millones",
        "fr": "%.1f millions",
        "pt": "%.1f milhões",
        "sv": "%.1f miljoner"
    },
    "%.1f trillion": {
        "cs": "%.1f bilionu",
        "da": "%.1f billioner",
        "de": "%.1f Billionen",
        "es": "%.1f billones",
        "fr": "%.1f billions",
        "pt": "%.1f trilhões",
        "sv": "%.1f biljoner"
    },
    "Atomic": {
        "cs": "Atomový věk",
        "da": "Atomalder",
        "de": "Atomzeitalter",
        "es": "Atómica",
        "fr": "Atomique",
        "pt": "Atômica",
        "sv": "Atomålder"
    },
    "Bronze and iron age": {
        "cs": "Doba bronzová a železná",
        "da": "Bronze- og jernalder",
        "de": "Bronze- und Eisenzeit",
        "es": "Edad del Bronce y del Hierro",
        "fr": "Âges du bronze et du fer",
        "pt": "Idade do Bronze e do Ferro",
        "sv": "Brons- och järnålder"
    },
    "Colony": {
        "cs": "Kolonie",
        "da": "Koloni",
        "de": "Kolonie",
        "es": "Colonia",
        "fr": "Colonie",
        "pt": "Colônia",
        "sv": "Koloni"
    },
    "Early modern": {
        "cs": "Raný novověk",
        "da": "Tidlig moderne",
        "de": "Frühe Neuzeit",
        "es": "Edad Moderna temprana",
        "fr": "Début de l’époque moderne",
        "pt": "Início da Idade Moderna",
        "sv": "Tidigmodern"
    },
    "Electrical": {
        "cs": "Elektrický věk",
        "da": "Elektrisk alder",
        "de": "Elektrisches Zeitalter",
        "es": "Eléctrica",
        "fr": "Électrique",
        "pt": "Elétrica",
        "sv": "Elektrisk ålder"
    },
    "Essential travel only": {
        "cs": "Jen nezbytné cesty",
        "da": "Kun nødvendige rejser",
        "de": "Nur notwendige Reisen",
        "es": "Solo viajes esenciales",
        "fr": "Voyages essentiels uniquement",
        "pt": "Somente viagens essenciais",
        "sv": "Endast nödvändiga resor"
    },
    "Farming": {
        "cs": "Zemědělství",
        "da": "Landbrug",
        "de": "Landwirtschaft",
        "es": "Agricultura",
        "fr": "Agriculture",
        "pt": "Agricultura",
        "sv": "Jordbruk"
    },
    "Free port": {
        "cs": "Volný přístav",
        "da": "Frihavn",
        "de": "Freihafen",
        "es": "Puerto franco",
        "fr": "Port franc",
        "pt": "Porto livre",
        "sv": "Frihamn"
    },
    "Hub spaceport": {
        "cs": "Uzlový kosmodrom",
        "da": "Rumhavn som knudepunkt",
        "de": "Drehkreuz-Raumhafen",
        "es": "Puerto espacial principal",
        "fr": "Astroport principal",
        "pt": "Espaçoporto central",
        "sv": "Rymdhamn som knutpunkt"
    },
    "Industrial": {
        "cs": "Průmyslový věk",
        "da": "Industriel",
        "de": "Industriezeitalter",
        "es": "Industrial",
        "fr": "Industriel",
        "pt": "Industrial",
        "sv": "Industriell"
    },
    "Information": {
        "cs": "Informační věk",
        "da": "Informationsalder",
        "de": "Informationszeitalter",
        "es": "Información",
        "fr": "Information",
        "pt": "Informação",
        "sv": "Informationsålder"
    },
    "International spaceport": {
        "cs": "Mezinárodní kosmodrom",
        "da": "International rumhavn",
        "de": "Internationaler Raumhafen",
        "es": "Puerto espacial internacional",
        "fr": "Astroport international",
        "pt": "Espaçoporto internacional",
        "sv": "Internationell rymdhamn"
    },
    "Interplanetary": {
        "cs": "Meziplanetární",
        "da": "Interplanetarisk",
        "de": "Interplanetar",
        "es": "Interplanetaria",
        "fr": "Interplanétaire",
        "pt": "Interplanetária",
        "sv": "Interplanetär"
    },
    "Interstellar": {
        "cs": "Mezihvězdný",
        "da": "Interstellar",
        "de": "Interstellar",
        "es": "Interestelar",
        "fr": "Interstellaire",
        "pt": "Interestelar",
        "sv": "Interstellär"
    },
    "Landing field": {
        "cs": "Přistávací plocha",
        "da": "Landingsfelt",
        "de": "Landefeld",
        "es": "Campo de aterrizaje",
        "fr": "Terrain d’atterrissage",
        "pt": "Campo de pouso",
        "sv": "Landningsfält"
    },
    "Medieval": {
        "cs": "Středověk",
        "da": "Middelalder",
        "de": "Mittelalter",
        "es": "Medieval",
        "fr": "Médiéval",
        "pt": "Medieval",
        "sv": "Medeltid"
    },
    "Military": {
        "cs": "Armáda",
        "da": "Militær",
        "de": "Militär",
        "es": "Militar",
        "fr": "Militaire",
        "pt": "Militar",
        "sv": "Militär"
    },
    "Mining": {
        "cs": "Těžba",
        "da": "Minedrift",
        "de": "Bergbau",
        "es": "Minería",
        "fr": "Exploitation minière",
        "pt": "Mineração",
        "sv": "Gruvdrift"
    },
    "No travel": {
        "cs": "Žádné cesty",
        "da": "Ingen rejser",
        "de": "Keine Reisen",
        "es": "No viajar",
        "fr": "Aucun voyage",
        "pt": "Não viajar",
        "sv": "Inga resor"
    },
    "Penal": {
        "cs": "Trestanecký",
        "da": "Straffekoloni",
        "de": "Strafkolonie",
        "es": "Penal",
        "fr": "Pénitentiaire",
        "pt": "Penal",
        "sv": "Straffkoloni"
    },
    "Regional spaceport": {
        "cs": "Regionální kosmodrom",
        "da": "Regional rumhavn",
        "de": "Regionaler Raumhafen",
        "es": "Puerto espacial regional",
        "fr": "Astroport régional",
        "pt": "Espaçoporto regional",
        "sv": "Regional rymdhamn"
    },
    "Research": {
        "cs": "Výzkum",
        "da": "Forskning",
        "de": "Forschung",
        "es": "Investigación",
        "fr": "Recherche",
        "pt": "Pesquisa",
        "sv": "Forskning"
    },
    "Stone age": {
        "cs": "Doba kamenná",
        "da": "Stenalder",
        "de": "Steinzeit",
        "es": "Edad de Piedra",
        "fr": "Âge de pierre",
        "pt": "Idade da Pedra",
        "sv": "Stenålder"
    },
    "%@%": {
        "cs": "%@%",
        "da": "%@%",
        "de": "%@ %",
        "es": "%@ %",
        "fr": "%@ %",
        "pt": "%@%",
        "sv": "%@%"
    },
    "%.1f days": {
        "cs": "%.1f dne",
        "da": "%.1f dage",
        "de": "%.1f Tage",
        "es": "%.1f días",
        "fr": "%.1f jours",
        "pt": "%.1f dias",
        "sv": "%.1f dagar"
    },
    "%.1f hours": {
        "cs": "%.1f hodiny",
        "da": "%.1f timer",
        "de": "%.1f Stunden",
        "es": "%.1f horas",
        "fr": "%.1f heures",
        "pt": "%.1f horas",
        "sv": "%.1f timmar"
    },
    "%.1f years": {
        "cs": "%.1f roku",
        "da": "%.1f år",
        "de": "%.1f Jahre",
        "es": "%.1f años",
        "fr": "%.1f ans",
        "pt": "%.1f anos",
        "sv": "%.1f år"
    },
    "%@ %@ globe": {
        "cs": "%@ %@ glóbus",
        "da": "%@ %@ globus",
        "de": "%@ %@ Globus",
        "es": "Globo de %@ %@",
        "fr": "Globe %@ %@",
        "pt": "Globo %@ %@",
        "sv": "%@ %@ glob"
    },
    "%@ %@ surface map": {
        "cs": "%@ %@ mapa povrchu",
        "da": "%@ %@ overfladekort",
        "de": "%@ %@ Oberflächenkarte",
        "es": "Mapa de superficie de %@ %@",
        "fr": "Carte de surface %@ %@",
        "pt": "Mapa da superfície %@ %@",
        "sv": "%@ %@ ytkarta"
    },
    "%@ %@ world map": {
        "cs": "%@ %@ mapa světa",
        "da": "%@ %@ verdenskort",
        "de": "%@ %@ Weltkarte",
        "es": "Mapa del mundo %@ %@",
        "fr": "Carte du monde %@ %@",
        "pt": "Mapa-múndi %@ %@",
        "sv": "%@ %@ världskarta"
    },
    "%@ city map": {
        "cs": "%@ mapa města",
        "da": "%@ bykort",
        "de": "Stadtkarte %@",
        "es": "Mapa de %@",
        "fr": "Plan de ville de %@",
        "pt": "Mapa da cidade %@",
        "sv": "%@ stadskarta"
    },
    "%@ km": {
        "cs": "%@ km",
        "da": "%@ km",
        "de": "%@ km",
        "es": "%@ km",
        "fr": "%@ km",
        "pt": "%@ km",
        "sv": "%@ km"
    },
    "%@ methane rain": {
        "cs": "%@ metanový déšť",
        "da": "%@ metanregn",
        "de": "%@er Methanregen",
        "es": "Lluvia de metano %@",
        "fr": "Pluie de méthane %@",
        "pt": "Chuva de metano %@",
        "sv": "%@ metanregn"
    },
    "%@ methane snow": {
        "cs": "%@ metanový sníh",
        "da": "%@ metansne",
        "de": "%@er Methanschnee",
        "es": "Nevada de metano %@",
        "fr": "Neige de méthane %@",
        "pt": "Neve de metano %@",
        "sv": "%@ metansnö"
    },
    "%@ notes": {
        "cs": "Poznámky: %@",
        "da": "%@ noter",
        "de": "Notizen zu %@",
        "es": "Notas de %@",
        "fr": "Notes sur %@",
        "pt": "Notas de %@",
        "sv": "%@ anteckningar"
    },
    "%@ rain": {
        "cs": "%@ déšť",
        "da": "%@ regn",
        "de": "%@er Regen",
        "es": "Lluvia %@",
        "fr": "Pluie %@",
        "pt": "Chuva %@",
        "sv": "%@ regn"
    },
    "%@ sleet": {
        "cs": "%@ plískanice",
        "da": "%@ slud",
        "de": "%@er Schneeregen",
        "es": "Aguanieve %@",
        "fr": "Neige fondue %@",
        "pt": "Chuva com neve %@",
        "sv": "%@ snöblandat regn"
    },
    "%@ snow": {
        "cs": "%@ sníh",
        "da": "%@ sne",
        "de": "%@er Schnee",
        "es": "Nevada %@",
        "fr": "Neige %@",
        "pt": "Neve %@",
        "sv": "%@ snö"
    },
    "%@ × Earth's": {
        "cs": "%@ × Země",
        "da": "%@ × Jordens",
        "de": "%@ × Erde",
        "es": "%@ × la de la Tierra",
        "fr": "%@ × celle de la Terre",
        "pt": "%@ × a da Terra",
        "sv": "%@ × jordens"
    },
    "%lld added": {
        "cs": "Přidáno: %lld",
        "da": "%lld tilføjet",
        "de": "%lld hinzugefügt",
        "es": "%lld añadidos",
        "fr": "%lld ajoutés",
        "pt": "%lld adicionados",
        "sv": "%lld tillagda"
    },
    "%lld differences": {
        "cs": "Rozdíly: %lld",
        "da": "%lld forskelle",
        "de": "%lld Unterschiede",
        "es": "%lld diferencias",
        "fr": "%lld différences",
        "pt": "%lld diferenças",
        "sv": "%lld skillnader"
    },
    "%lld hops": {
        "cs": "Skoky: %lld",
        "da": "%lld hop",
        "de": "%lld Sprünge",
        "es": "%lld saltos",
        "fr": "%lld sauts",
        "pt": "%lld saltos",
        "sv": "%lld hopp"
    },
    "%lld moons": {
        "cs": "Měsíce: %lld",
        "da": "%lld måner",
        "de": "%lld Monde",
        "es": "%lld lunas",
        "fr": "%lld lunes",
        "pt": "%lld luas",
        "sv": "%lld månar"
    },
    "%lld notes": {
        "cs": "Poznámky: %lld",
        "da": "%lld noter",
        "de": "%lld Notizen",
        "es": "%lld notas",
        "fr": "%lld notes",
        "pt": "%lld notas",
        "sv": "%lld anteckningar"
    },
    "%lld on": {
        "cs": "%lld zap.",
        "da": "%lld til",
        "de": "%lld an",
        "es": "%lld activos",
        "fr": "%lld actifs",
        "pt": "%lld ativos",
        "sv": "%lld på"
    },
    "%lld removed": {
        "cs": "Odebráno: %lld",
        "da": "%lld fjernet",
        "de": "%lld entfernt",
        "es": "%lld eliminados",
        "fr": "%lld supprimés",
        "pt": "%lld removidos",
        "sv": "%lld borttagna"
    },
    "%lld rings": {
        "cs": "Prstence: %lld",
        "da": "%lld ringe",
        "de": "%lld Ringe",
        "es": "%lld anillos",
        "fr": "%lld anneaux",
        "pt": "%lld anéis",
        "sv": "%lld ringar"
    },
    "%lld rocky, %lld giant, %lld belts": {
        "cs": "kamenné: %lld, obři: %lld, pásy: %lld",
        "da": "%lld klippeplaneter, %lld kæmper, %lld bælter",
        "de": "%lld Gestein, %lld Riesen, %lld Gürtel",
        "es": "%lld rocosos, %lld gigantes, %lld cinturones",
        "fr": "%lld rocheuses, %lld géantes, %lld ceintures",
        "pt": "%lld rochosos, %lld gigantes, %lld cinturões",
        "sv": "%lld steniga, %lld jättar, %lld bälten"
    },
    "%lld universes": {
        "cs": "Vesmíry: %lld",
        "da": "%lld universer",
        "de": "%lld Universen",
        "es": "%lld universos",
        "fr": "%lld univers",
        "pt": "%lld universos",
        "sv": "%lld universum"
    },
    "%lld worlds changed": {
        "cs": "Změněné světy: %lld",
        "da": "%lld verdener ændret",
        "de": "%lld Welten geändert",
        "es": "%lld mundos cambiados",
        "fr": "%lld mondes modifiés",
        "pt": "%lld mundos alterados",
        "sv": "%lld världar ändrade"
    },
    "%lld worlds · %@": {
        "cs": "Světy: %lld · %@",
        "da": "%lld verdener · %@",
        "de": "%lld Welten · %@",
        "es": "%lld mundos · %@",
        "fr": "%lld mondes · %@",
        "pt": "%lld mundos · %@",
        "sv": "%lld världar · %@"
    },
    ", contaminated": {
        "cs": ", znečištěná",
        "da": ", forurenet",
        "de": ", verseucht",
        "es": ", contaminada",
        "fr": ", contaminé",
        "pt": ", contaminada",
        "sv": ", förorenad"
    },
    "1 day/s": {
        "cs": "1 den/s",
        "da": "1 dag/s",
        "de": "1 Tag/s",
        "es": "1 día/s",
        "fr": "1 j/s",
        "pt": "1 dia/s",
        "sv": "1 dag/s"
    },
    "1 hop": {
        "cs": "1 skok",
        "da": "1 hop",
        "de": "1 Sprung",
        "es": "1 salto",
        "fr": "1 saut",
        "pt": "1 salto",
        "sv": "1 hopp"
    },
    "1 hr/s": {
        "cs": "1 h/s",
        "da": "1 t/s",
        "de": "1 Std./s",
        "es": "1 h/s",
        "fr": "1 h/s",
        "pt": "1 h/s",
        "sv": "1 h/s"
    },
    "1 min/s": {
        "cs": "1 min/s",
        "da": "1 min/s",
        "de": "1 min/s",
        "es": "1 min/s",
        "fr": "1 min/s",
        "pt": "1 min/s",
        "sv": "1 min/s"
    },
    "1 wk/s": {
        "cs": "1 týd/s",
        "da": "1 uge/s",
        "de": "1 Wo./s",
        "es": "1 sem/s",
        "fr": "1 sem/s",
        "pt": "1 sem/s",
        "sv": "1 v/s"
    },
    "1 yr/s": {
        "cs": "1 rok/s",
        "da": "1 år/s",
        "de": "1 J./s",
        "es": "1 año/s",
        "fr": "1 an/s",
        "pt": "1 ano/s",
        "sv": "1 år/s"
    },
    "30 days/s": {
        "cs": "30 dní/s",
        "da": "30 dage/s",
        "de": "30 Tage/s",
        "es": "30 días/s",
        "fr": "30 j/s",
        "pt": "30 dias/s",
        "sv": "30 dagar/s"
    },
    "3D City Map…": {
        "cs": "3D mapa města…",
        "da": "3D-bykort…",
        "de": "3D-Stadtkarte …",
        "es": "Mapa 3D de la ciudad…",
        "fr": "Plan de ville 3D…",
        "pt": "Mapa 3D da Cidade…",
        "sv": "3D-stadskarta…"
    },
    "3D globe": {
        "cs": "3D glóbus",
        "da": "3D-globus",
        "de": "3D-Globus",
        "es": "Globo 3D",
        "fr": "Globe 3D",
        "pt": "Globo 3D",
        "sv": "3D-glob"
    },
    "3D star field": {
        "cs": "3D hvězdné pole",
        "da": "3D-stjernefelt",
        "de": "3D-Sternfeld",
        "es": "Campo estelar en 3D",
        "fr": "Champ d’étoiles 3D",
        "pt": "Campo estelar 3D",
        "sv": "3D-stjärnfält"
    },
    "A cleared landing site, no services": {
        "cs": "Vyčištěné přistávací místo bez služeb",
        "da": "Et ryddet landingssted uden faciliteter",
        "de": "Ein geräumter Landeplatz, keine Dienste",
        "es": "Una zona de aterrizaje despejada, sin servicios",
        "fr": "Un site d’atterrissage dégagé, sans services",
        "pt": "Uma área de pouso desobstruída, sem serviços",
        "sv": "En röjd landningsplats utan service"
    },
    "A cold cloud of dust that hides the stars behind it": {
        "cs": "Chladný oblak prachu, který skrývá hvězdy za sebou",
        "da": "En kold sky af støv, der skjuler stjernerne bag den",
        "de": "Eine kalte Staubwolke, die die Sterne dahinter verbirgt",
        "es": "Una nube fría de polvo que oculta las estrellas que hay detrás",
        "fr": "Un nuage froid de poussière qui cache les étoiles derrière lui",
        "pt": "Uma nuvem fria de poeira que oculta as estrelas por trás dela",
        "sv": "Ett kallt moln av stoft som döljer stjärnorna bakom det"
    },
    "A few clouds": {
        "cs": "Několik mraků",
        "da": "Få skyer",
        "de": "Ein paar Wolken",
        "es": "Algunas nubes",
        "fr": "Quelques nuages",
        "pt": "Poucas nuvens",
        "sv": "Några moln"
    },
    "A shell of gas blown off by a dying star, lit by the white dwarf it left": {
        "cs": "Obal plynu odvržený umírající hvězdou, osvětlený bílým trpaslíkem, kterého po sobě zanechala",
        "da": "En skal af gas, som en døende stjerne har blæst af, oplyst af den hvide dværg, den efterlod",
        "de": "Eine von einem sterbenden Stern abgestoßene Gashülle, beleuchtet vom Weißen Zwerg, den er hinterließ",
        "es": "Una envoltura de gas expulsada por una estrella moribunda, iluminada por la enana blanca que dejó",
        "fr": "Une coquille de gaz expulsée par une étoile mourante, éclairée par la naine blanche qu’elle a laissée",
        "pt": "Uma casca de gás expelida por uma estrela moribunda, iluminada pela anã branca que ela deixou",
        "sv": "Ett skal av gas som en döende stjärna blåst av sig, upplyst av den vita dvärg den lämnade efter sig"
    },
    "A universe generated from a seed, explored in three dimensions": {
        "cs": "Vesmír vygenerovaný ze semínka, prozkoumávaný ve třech rozměrech",
        "da": "Et univers genereret ud fra et frø, udforsket i tre dimensioner",
        "de": "Ein aus einem Startwert erzeugtes Universum, in drei Dimensionen erkundet",
        "es": "Un universo generado a partir de una semilla, explorado en tres dimensiones",
        "fr": "Un univers généré à partir d’une graine, exploré en trois dimensions",
        "pt": "Um universo gerado a partir de uma semente, explorado em três dimensões",
        "sv": "Ett universum genererat från ett frö, utforskat i tre dimensioner"
    },
    "Add": {
        "cs": "Přidat",
        "da": "Tilføj",
        "de": "Hinzufügen",
        "es": "Añadir",
        "fr": "Ajouter",
        "pt": "Adicionar",
        "sv": "Lägg till"
    },
    "Add Sectors": {
        "cs": "Přidat sektory",
        "da": "Tilføj sektorer",
        "de": "Sektoren hinzufügen",
        "es": "Añadir sectores",
        "fr": "Ajouter des secteurs",
        "pt": "Adicionar Setores",
        "sv": "Lägg till sektorer"
    },
    "Add Sectors…": {
        "cs": "Přidat sektory…",
        "da": "Tilføj sektorer…",
        "de": "Sektoren hinzufügen …",
        "es": "Añadir sectores…",
        "fr": "Ajouter des secteurs…",
        "pt": "Adicionar Setores…",
        "sv": "Lägg till sektorer…"
    },
    "Add a note": {
        "cs": "Přidat poznámku",
        "da": "Tilføj en note",
        "de": "Notiz hinzufügen",
        "es": "Añadir una nota",
        "fr": "Ajouter une note",
        "pt": "Adicionar uma nota",
        "sv": "Lägg till en anteckning"
    },
    "Add more of TravellerMap's sectors, such as this one's neighbours": {
        "cs": "Přidat další sektory z TravellerMap, například sousedy tohoto sektoru",
        "da": "Tilføj flere af TravellerMaps sektorer, f.eks. denne sektors naboer",
        "de": "Weitere Sektoren von TravellerMap hinzufügen, etwa die Nachbarn dieses Sektors",
        "es": "Añade más sectores de TravellerMap, como los vecinos de este",
        "fr": "Ajouter d’autres secteurs de TravellerMap, comme les voisins de celui-ci",
        "pt": "Adicionar mais setores do TravellerMap, como os vizinhos deste",
        "sv": "Lägg till fler av TravellerMaps sektorer, till exempel den här sektorns grannar"
    },
    "Add place": {
        "cs": "Přidat místo",
        "da": "Tilføj sted",
        "de": "Ort hinzufügen",
        "es": "Añadir lugar",
        "fr": "Ajouter un lieu",
        "pt": "Adicionar lugar",
        "sv": "Lägg till plats"
    },
    "Add this system to the end of the route": {
        "cs": "Přidat tento systém na konec trasy",
        "da": "Tilføj dette system til slutningen af ruten",
        "de": "Dieses System am Ende der Route hinzufügen",
        "es": "Añade este sistema al final de la ruta",
        "fr": "Ajouter ce système à la fin de l’itinéraire",
        "pt": "Adicionar este sistema ao fim da rota",
        "sv": "Lägg till det här systemet i slutet av rutten"
    },
    "Add to route": {
        "cs": "Přidat do trasy",
        "da": "Tilføj til rute",
        "de": "Zur Route hinzufügen",
        "es": "Añadir a la ruta",
        "fr": "Ajouter à l’itinéraire",
        "pt": "Adicionar à rota",
        "sv": "Lägg till i rutt"
    },
    "Added": {
        "cs": "Přidáno",
        "da": "Tilføjet",
        "de": "Hinzugefügt",
        "es": "Añadido",
        "fr": "Ajouté",
        "pt": "Adicionados",
        "sv": "Tillagd"
    },
    "Administered territory": {
        "cs": "Spravované území",
        "da": "Administreret territorium",
        "de": "Verwaltetes Gebiet",
        "es": "Territorio administrado",
        "fr": "Territoire administré",
        "pt": "Território administrado",
        "sv": "Förvaltat territorium"
    },
    "Advanced": {
        "cs": "Pokročilé",
        "da": "Avanceret",
        "de": "Fortgeschritten",
        "es": "Avanzada",
        "fr": "Avancé",
        "pt": "Avançada",
        "sv": "Avancerat"
    },
    "Advisory": {
        "cs": "Varování",
        "da": "Rejsevejledning",
        "de": "Warnung",
        "es": "Aviso",
        "fr": "Conseil",
        "pt": "Alerta",
        "sv": "Reseråd"
    },
    "Age": {
        "cs": "Stáří",
        "da": "Alder",
        "de": "Alter",
        "es": "Edad",
        "fr": "Âge",
        "pt": "Idade",
        "sv": "Ålder"
    },
    "Agriculture": {
        "cs": "Zemědělství",
        "da": "Landbrug",
        "de": "Landwirtschaft",
        "es": "Agricultura",
        "fr": "Agriculture",
        "pt": "Agricultura",
        "sv": "Jordbruk"
    },
    "Air force": {
        "cs": "Letectvo",
        "da": "Flyvevåben",
        "de": "Luftwaffe",
        "es": "Fuerza aérea",
        "fr": "Armée de l’air",
        "pt": "Força aérea",
        "sv": "Flygvapen"
    },
    "All the notes on this system, to read or save as a PDF": {
        "cs": "Všechny poznámky k tomuto systému, ke čtení nebo uložení jako PDF",
        "da": "Alle noter om dette system, til at læse eller gemme som PDF",
        "de": "Alle Notizen zu diesem System, zum Lesen oder Sichern als PDF",
        "es": "Todas las notas de este sistema, para leer o guardar como PDF",
        "fr": "Toutes les notes sur ce système, à lire ou à enregistrer en PDF",
        "pt": "Todas as notas deste sistema, para ler ou salvar como PDF",
        "sv": "Alla anteckningar om det här systemet, att läsa eller spara som PDF"
    },
    "All the notes on this world, its moons and places, to read or save as a PDF": {
        "cs": "Všechny poznámky k tomuto světu, jeho měsícům a místům, ke čtení nebo uložení jako PDF",
        "da": "Alle noter om denne verden, dens måner og steder, til at læse eller gemme som PDF",
        "de": "Alle Notizen zu dieser Welt, ihren Monden und Orten, zum Lesen oder Sichern als PDF",
        "es": "Todas las notas de este mundo, sus lunas y lugares, para leer o guardar como PDF",
        "fr": "Toutes les notes sur ce monde, ses lunes et ses lieux, à lire ou à enregistrer en PDF",
        "pt": "Todas as notas deste mundo, de suas luas e lugares, para ler ou salvar como PDF",
        "sv": "Alla anteckningar om den här världen, dess månar och platser, att läsa eller spara som PDF"
    },
    "Allegiance": {
        "cs": "Příslušnost",
        "da": "Tilhørsforhold",
        "de": "Zugehörigkeit",
        "es": "Lealtad",
        "fr": "Allégeance",
        "pt": "Lealdade",
        "sv": "Tillhörighet"
    },
    "Am star": {
        "cs": "Hvězda Am",
        "da": "Am-stjerne",
        "de": "Am-Stern",
        "es": "Estrella Am",
        "fr": "Étoile Am",
        "pt": "Estrela Am",
        "sv": "Am-stjärna"
    },
    "Amber": {
        "cs": "Žlutá",
        "da": "Gul",
        "de": "Gelb",
        "es": "Ámbar",
        "fr": "Ambre",
        "pt": "Âmbar",
        "sv": "Gul"
    },
    "Anomaly": {
        "cs": "Anomálie",
        "da": "Anomali",
        "de": "Anomalie",
        "es": "Anomalía",
        "fr": "Anomalie",
        "pt": "Anomalia",
        "sv": "Anomali"
    },
    "Ap star": {
        "cs": "Hvězda Ap",
        "da": "Ap-stjerne",
        "de": "Ap-Stern",
        "es": "Estrella Ap",
        "fr": "Étoile Ap",
        "pt": "Estrela Ap",
        "sv": "Ap-stjärna"
    },
    "Architecture": {
        "cs": "Architektura",
        "da": "Arkitektur",
        "de": "Architektur",
        "es": "Arquitectura",
        "fr": "Architecture",
        "pt": "Arquitetura",
        "sv": "Arkitektur"
    },
    "Arg. of periapsis": {
        "cs": "Arg. pericentra",
        "da": "Periapsisargument",
        "de": "Arg. der Periapsis",
        "es": "Arg. del periastro",
        "fr": "Arg. du périastre",
        "pt": "Arg. do periastro",
        "sv": "Periapsisargument"
    },
    "Arid": {
        "cs": "Suché",
        "da": "Tør",
        "de": "Trocken",
        "es": "Árido",
        "fr": "Aride",
        "pt": "Árido",
        "sv": "Torr"
    },
    "Armed conflict": {
        "cs": "Ozbrojený konflikt",
        "da": "Væbnet konflikt",
        "de": "Bewaffneter Konflikt",
        "es": "Conflicto armado",
        "fr": "Conflit armé",
        "pt": "Conflito armado",
        "sv": "Väpnad konflikt"
    },
    "Army": {
        "cs": "Pozemní vojsko",
        "da": "Hær",
        "de": "Heer",
        "es": "Ejército",
        "fr": "Armée de terre",
        "pt": "Exército",
        "sv": "Armé"
    },
    "Asteroid belt": {
        "cs": "Pás asteroidů",
        "da": "Asteroidebælte",
        "de": "Asteroidengürtel",
        "es": "Cinturón de asteroides",
        "fr": "Ceinture d’astéroïdes",
        "pt": "Cinturão de asteroides",
        "sv": "Asteroidbälte"
    },
    "Asteroid belts": {
        "cs": "Pásy asteroidů",
        "da": "Asteroidebælter",
        "de": "Asteroidengürtel",
        "es": "Cinturones de asteroides",
        "fr": "Ceintures d’astéroïdes",
        "pt": "Cinturões de asteroides",
        "sv": "Asteroidbälten"
    },
    "At": {
        "cs": "U",
        "da": "Ved",
        "de": "Bei",
        "es": "En",
        "fr": "À",
        "pt": "Em",
        "sv": "Vid"
    },
    "At peace": {
        "cs": "V míru",
        "da": "I fred",
        "de": "Friedlich",
        "es": "En paz",
        "fr": "En paix",
        "pt": "Em paz",
        "sv": "I fred"
    },
    "Atmosphere": {
        "cs": "Atmosféra",
        "da": "Atmosfære",
        "de": "Atmosphäre",
        "es": "Atmósfera",
        "fr": "Atmosphère",
        "pt": "Atmosfera",
        "sv": "Atmosfär"
    },
    "Automatic": {
        "cs": "Automaticky",
        "da": "Automatisk",
        "de": "Automatisch",
        "es": "Automático",
        "fr": "Automatique",
        "pt": "Automático",
        "sv": "Automatiskt"
    },
    "Automatic choices follow each place's climate, terrain and technology. A settlement can set its own in its editor.": {
        "cs": "Automatická volba se řídí podnebím, terénem a technologií každého místa. Sídlo si může nastavit vlastní ve svém editoru.",
        "da": "Automatiske valg følger hvert steds klima, terræn og teknologi. En bebyggelse kan vælge sit eget i sin editor.",
        "de": "Automatisch folgt Klima, Gelände und Technologie jedes Ortes. Eine Siedlung kann es in ihrem Editor selbst festlegen.",
        "es": "Las opciones automáticas siguen el clima, el terreno y la tecnología de cada lugar. Un asentamiento puede definir las suyas en su editor.",
        "fr": "Les choix automatiques suivent le climat, le terrain et la technologie de chaque lieu. Une localité peut définir les siens dans son éditeur.",
        "pt": "As escolhas automáticas seguem o clima, o terreno e a tecnologia de cada lugar. Um assentamento pode definir as suas no próprio editor.",
        "sv": "Automatiska val följer varje plats klimat, terräng och teknik. En bosättning kan välja sitt eget i sin redigerare."
    },
    "Average": {
        "cs": "Průměrné",
        "da": "Middel",
        "de": "Mittel",
        "es": "Media",
        "fr": "Moyenne",
        "pt": "Média",
        "sv": "Medel"
    },
    "Axial tilt": {
        "cs": "Sklon osy",
        "da": "Aksehældning",
        "de": "Achsneigung",
        "es": "Inclinación axial",
        "fr": "Inclinaison axiale",
        "pt": "Inclinação axial",
        "sv": "Axellutning"
    },
    "Balanced": {
        "cs": "Vyvážené",
        "da": "Afbalanceret",
        "de": "Ausgewogen",
        "es": "Equilibrado",
        "fr": "Équilibré",
        "pt": "Equilibrado",
        "sv": "Balanserad"
    },
    "Base": {
        "cs": "Základna",
        "da": "Base",
        "de": "Basis",
        "es": "Base",
        "fr": "Base",
        "pt": "Base",
        "sv": "Bas"
    },
    "Bases": {
        "cs": "Základny",
        "da": "Baser",
        "de": "Basen",
        "es": "Bases",
        "fr": "Bases",
        "pt": "Bases",
        "sv": "Baser"
    },
    "Be star": {
        "cs": "Hvězda Be",
        "da": "Be-stjerne",
        "de": "Be-Stern",
        "es": "Estrella Be",
        "fr": "Étoile Be",
        "pt": "Estrela Be",
        "sv": "Be-stjärna"
    },
    "Belt": {
        "cs": "Pás",
        "da": "Bælte",
        "de": "Gürtel",
        "es": "Cinturón",
        "fr": "Ceinture",
        "pt": "Cinturão",
        "sv": "Bälte"
    },
    "Bio zone": {
        "cs": "Biozóna",
        "da": "Biozone",
        "de": "Biozone",
        "es": "Zona habitable",
        "fr": "Zone de vie",
        "pt": "Zona bio",
        "sv": "Biozon"
    },
    "Black hole": {
        "cs": "Černá díra",
        "da": "Sort hul",
        "de": "Schwarzes Loch",
        "es": "Agujero negro",
        "fr": "Trou noir",
        "pt": "Buraco negro",
        "sv": "Svart hål"
    },
    "Blue straggler": {
        "cs": "Modrý opozdilec",
        "da": "Blå efternøler",
        "de": "Blauer Nachzügler",
        "es": "Rezagada azul",
        "fr": "Traînarde bleue",
        "pt": "Retardatária azul",
        "sv": "Blå eftersläntrare"
    },
    "Blue supergiant": {
        "cs": "Modrý veleobr",
        "da": "Blå superkæmpe",
        "de": "Blauer Überriese",
        "es": "Supergigante azul",
        "fr": "Supergéante bleue",
        "pt": "Supergigante azul",
        "sv": "Blå superjätte"
    },
    "Bp star": {
        "cs": "Hvězda Bp",
        "da": "Bp-stjerne",
        "de": "Bp-Stern",
        "es": "Estrella Bp",
        "fr": "Étoile Bp",
        "pt": "Estrela Bp",
        "sv": "Bp-stjärna"
    },
    "Breathable": {
        "cs": "Dýchatelná",
        "da": "Kan indåndes",
        "de": "Atembar",
        "es": "Respirable",
        "fr": "Respirable",
        "pt": "Respirável",
        "sv": "Andningsbar"
    },
    "Bright giant": {
        "cs": "Jasný obr",
        "da": "Lys kæmpe",
        "de": "Heller Riese",
        "es": "Gigante luminosa",
        "fr": "Géante lumineuse",
        "pt": "Gigante brilhante",
        "sv": "Ljusstark jätte"
    },
    "Buildings": {
        "cs": "Budovy",
        "da": "Bygninger",
        "de": "Gebäude",
        "es": "Edificios",
        "fr": "Bâtiments",
        "pt": "Edifícios",
        "sv": "Byggnader"
    },
    "Buildings %@  ·  Roads %@ km  ·  Parks %@  ·  Bridges %@  ·  Trees %@": {
        "cs": "Budovy %@  ·  Silnice %@ km  ·  Parky %@  ·  Mosty %@  ·  Stromy %@",
        "da": "Bygninger %@  ·  Veje %@ km  ·  Parker %@  ·  Broer %@  ·  Træer %@",
        "de": "Gebäude %@  ·  Straßen %@ km  ·  Parks %@  ·  Brücken %@  ·  Bäume %@",
        "es": "Edificios %@  ·  Calles %@ km  ·  Parques %@  ·  Puentes %@  ·  Árboles %@",
        "fr": "Bâtiments %@  ·  Routes %@ km  ·  Parcs %@  ·  Ponts %@  ·  Arbres %@",
        "pt": "Edifícios %@  ·  Ruas %@ km  ·  Parques %@  ·  Pontes %@  ·  Árvores %@",
        "sv": "Byggnader %@  ·  Vägar %@ km  ·  Parker %@  ·  Broar %@  ·  Träd %@"
    },
    "Calm": {
        "cs": "Bezvětří",
        "da": "Vindstille",
        "de": "Windstill",
        "es": "En calma",
        "fr": "Calme",
        "pt": "Calmaria",
        "sv": "Vindstilla"
    },
    "Canyon": {
        "cs": "Kaňon",
        "da": "Kløft",
        "de": "Schlucht",
        "es": "Cañón",
        "fr": "Canyon",
        "pt": "Cânion",
        "sv": "Kanjon"
    },
    "Capital": {
        "cs": "Hlavní město",
        "da": "Hovedstad",
        "de": "Hauptstadt",
        "es": "Capital",
        "fr": "Capitale",
        "pt": "Capital",
        "sv": "Huvudstad"
    },
    "Carbon Wolf–Rayet star": {
        "cs": "Uhlíková Wolf–Rayet",
        "da": "Kulstof-Wolf–Rayet-stjerne",
        "de": "Kohlenstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de carbono",
        "fr": "Étoile Wolf–Rayet carbonée",
        "pt": "Estrela Wolf–Rayet de carbono",
        "sv": "Kol-Wolf–Rayet-stjärna"
    },
    "Carbon dioxide": {
        "cs": "Oxid uhličitý",
        "da": "Kuldioxid",
        "de": "Kohlendioxid",
        "es": "Dióxido de carbono",
        "fr": "Dioxyde de carbone",
        "pt": "Dióxido de carbono",
        "sv": "Koldioxid"
    },
    "Carbon dioxide, sulfuric clouds": {
        "cs": "Oxid uhličitý, mraky kyseliny sírové",
        "da": "Kuldioxid, svovlsyreskyer",
        "de": "Kohlendioxid, Schwefelwolken",
        "es": "Dióxido de carbono, nubes sulfúricas",
        "fr": "Dioxyde de carbone, nuages sulfuriques",
        "pt": "Dióxido de carbono, nuvens sulfúricas",
        "sv": "Koldioxid, svavelsyramoln"
    },
    "Carbon star": {
        "cs": "Uhlíková hvězda",
        "da": "Kulstofstjerne",
        "de": "Kohlenstoffstern",
        "es": "Estrella de carbono",
        "fr": "Étoile carbonée",
        "pt": "Estrela de carbono",
        "sv": "Kolstjärna"
    },
    "Carbon white dwarf": {
        "cs": "Uhlíkový bílý trpaslík",
        "da": "Hvid kulstofdværg",
        "de": "Kohlenstoff-Weißer Zwerg",
        "es": "Enana blanca de carbono",
        "fr": "Naine blanche à carbone",
        "pt": "Anã branca de carbono",
        "sv": "Vit koldvärg"
    },
    "Carbon-13 star": {
        "cs": "Hvězda s uhlíkem 13",
        "da": "Kulstof-13-stjerne",
        "de": "Kohlenstoff-13-Stern",
        "es": "Estrella de carbono 13",
        "fr": "Étoile au carbone 13",
        "pt": "Estrela de carbono-13",
        "sv": "Kol-13-stjärna"
    },
    "Cave": {
        "cs": "Jeskyně",
        "da": "Hule",
        "de": "Höhle",
        "es": "Cueva",
        "fr": "Grotte",
        "pt": "Caverna",
        "sv": "Grotta"
    },
    "Centre the view on this system": {
        "cs": "Vystředit zobrazení na tento systém",
        "da": "Centrer visningen på dette system",
        "de": "Ansicht auf dieses System zentrieren",
        "es": "Centra la vista en este sistema",
        "fr": "Centrer la vue sur ce système",
        "pt": "Centralizar a vista neste sistema",
        "sv": "Centrera vyn på det här systemet"
    },
    "Cepheid variable": {
        "cs": "Cefeida",
        "da": "Cepheide-variabel",
        "de": "Cepheiden-Veränderlicher",
        "es": "Variable cefeida",
        "fr": "Céphéide",
        "pt": "Variável cefeida",
        "sv": "Cepheidvariabel"
    },
    "Changed": {
        "cs": "Změněno",
        "da": "Ændret",
        "de": "Geändert",
        "es": "Cambiado",
        "fr": "Modifié",
        "pt": "Alterados",
        "sv": "Ändrad"
    },
    "Changes to %@": {
        "cs": "Změny v %@",
        "da": "Ændringer af %@",
        "de": "Änderungen an %@",
        "es": "Cambios en %@",
        "fr": "Modifications de %@",
        "pt": "Alterações em %@",
        "sv": "Ändringar av %@"
    },
    "Chartered company": {
        "cs": "Koncesovaná společnost",
        "da": "Chartret selskab",
        "de": "Konzessionierte Gesellschaft",
        "es": "Compañía con carta",
        "fr": "Compagnie à charte",
        "pt": "Companhia concessionária",
        "sv": "Privilegierat handelskompani"
    },
    "Chiefdom": {
        "cs": "Náčelnictví",
        "da": "Høvdingedømme",
        "de": "Häuptlingstum",
        "es": "Jefatura",
        "fr": "Chefferie",
        "pt": "Chefatura",
        "sv": "Hövdingadöme"
    },
    "Choose a map": {
        "cs": "Vyberte mapu",
        "da": "Vælg et kort",
        "de": "Wähle eine Karte",
        "es": "Elige un mapa",
        "fr": "Choisissez une carte",
        "pt": "Escolha um mapa",
        "sv": "Välj en karta"
    },
    "Choose one or more sectors.": {
        "cs": "Vyberte jeden nebo více sektorů.",
        "da": "Vælg en eller flere sektorer.",
        "de": "Wähle einen oder mehrere Sektoren.",
        "es": "Elige uno o más sectores.",
        "fr": "Choisissez un ou plusieurs secteurs.",
        "pt": "Escolha um ou mais setores.",
        "sv": "Välj en eller flera sektorer."
    },
    "City": {
        "cs": "Město",
        "da": "By",
        "de": "Stadt",
        "es": "Ciudad",
        "fr": "Ville",
        "pt": "Cidade",
        "sv": "Stad"
    },
    "City map": {
        "cs": "Mapa města",
        "da": "Bykort",
        "de": "Stadtkarte",
        "es": "Mapa de la ciudad",
        "fr": "Plan de ville",
        "pt": "Mapa da cidade",
        "sv": "Stadskarta"
    },
    "Civilians may not own weapons": {
        "cs": "Civilisté nesmějí vlastnit zbraně",
        "da": "Civile må ikke eje våben",
        "de": "Zivilisten dürfen keine Waffen besitzen",
        "es": "Los civiles no pueden poseer armas",
        "fr": "Les civils ne peuvent pas posséder d’armes",
        "pt": "Civis não podem possuir armas",
        "sv": "Civila får inte äga vapen"
    },
    "Class": {
        "cs": "Třída",
        "da": "Klasse",
        "de": "Klasse",
        "es": "Clase",
        "fr": "Classe",
        "pt": "Classe",
        "sv": "Klass"
    },
    "Classic": {
        "cs": "Klasický",
        "da": "Klassisk",
        "de": "Klassisch",
        "es": "Clásico",
        "fr": "Classique",
        "pt": "Clássico",
        "sv": "Klassisk"
    },
    "Clear route": {
        "cs": "Vymazat trasu",
        "da": "Ryd rute",
        "de": "Route löschen",
        "es": "Borrar ruta",
        "fr": "Effacer l’itinéraire",
        "pt": "Limpar rota",
        "sv": "Rensa rutt"
    },
    "Click the map to mark a city, town or other place there": {
        "cs": "Klikněte do mapy a označte tam město, obec nebo jiné místo",
        "da": "Klik på kortet for at markere en by eller et andet sted der",
        "de": "Klicke auf die Karte, um dort eine Stadt, einen Ort oder etwas anderes zu markieren",
        "es": "Haz clic en el mapa para marcar allí una ciudad, un pueblo u otro lugar",
        "fr": "Cliquez sur la carte pour y marquer une ville, un village ou un autre lieu",
        "pt": "Clique no mapa para marcar ali uma cidade, vila ou outro lugar",
        "sv": "Klicka på kartan för att markera en stad, ort eller annan plats där"
    },
    "Click the map to place a city, town or other place": {
        "cs": "Klikněte do mapy a umístěte město, obec nebo jiné místo",
        "da": "Klik på kortet for at placere en by eller et andet sted",
        "de": "Klicke auf die Karte, um eine Stadt, einen Ort oder etwas anderes zu platzieren",
        "es": "Haz clic en el mapa para colocar una ciudad, un pueblo u otro lugar",
        "fr": "Cliquez sur la carte pour placer une ville, un village ou un autre lieu",
        "pt": "Clique no mapa para colocar uma cidade, vila ou outro lugar",
        "sv": "Klicka på kartan för att placera en stad, ort eller annan plats"
    },
    "Climate & biomes": {
        "cs": "Podnebí a biomy",
        "da": "Klima og biomer",
        "de": "Klima & Biome",
        "es": "Clima y biomas",
        "fr": "Climat et biomes",
        "pt": "Clima e biomas",
        "sv": "Klimat och biom"
    },
    "Climate & biomes gives worlds with seas oceans, lakes, rivers and biomes from their temperature and moisture. Polygon map builds them after Amit Patel's polygonal map generation: land rising from the coast to the mountains, rivers running down to the sea, and biomes from height, latitude and nearness to fresh water. Applies to planetary systems opened afterwards.": {
        "cs": "Podnebí a biomy dává světům s moři oceány, jezera, řeky a biomy podle jejich teploty a vlhkosti. Polygonová mapa je staví podle polygonálního generování map Amita Patela: země stoupající od pobřeží k horám, řeky stékající k moři a biomy podle výšky, zeměpisné šířky a blízkosti sladké vody. Platí pro planetární soustavy otevřené poté.",
        "da": "Klima og biomer giver verdener med have oceaner, søer, floder og biomer ud fra deres temperatur og fugtighed. Polygonkort bygger dem efter Amit Patels polygonale kortgenerering: land, der stiger fra kysten mod bjergene, floder, der løber ned mod havet, og biomer ud fra højde, breddegrad og nærhed til ferskvand. Gælder for planetsystemer, der åbnes bagefter.",
        "de": "„Klima & Biome“ erzeugt Welten mit Meeren, Ozeanen, Seen, Flüssen und Biomen aus Temperatur und Feuchtigkeit. „Polygonkarte“ baut sie nach Amit Patels polygonaler Kartenerzeugung: Land, das von der Küste zu den Bergen ansteigt, Flüsse, die zum Meer hinabfließen, und Biome nach Höhe, Breite und Nähe zu Süßwasser. Gilt für danach geöffnete Planetensysteme.",
        "es": "Clima y biomas da a los mundos con mares océanos, lagos, ríos y biomas según su temperatura y humedad. Mapa poligonal los construye según la generación de mapas poligonales de Amit Patel: tierra que asciende de la costa a las montañas, ríos que bajan hasta el mar y biomas según la altura, la latitud y la cercanía al agua dulce. Se aplica a los sistemas planetarios que se abran después.",
        "fr": "Climat et biomes donne aux mondes des mers, océans, lacs, rivières et biomes selon leur température et leur humidité. Carte polygonale les construit d’après la génération de cartes polygonales d’Amit Patel : terres s’élevant de la côte jusqu’aux montagnes, rivières descendant vers la mer, et biomes selon l’altitude, la latitude et la proximité de l’eau douce. S’applique aux systèmes planétaires ouverts ensuite.",
        "pt": "Clima e biomas gera mundos com mares, oceanos, lagos, rios e biomas a partir da temperatura e da umidade. Mapa poligonal os constrói segundo a geração de mapas poligonais de Amit Patel: terra subindo do litoral às montanhas, rios descendo até o mar e biomas a partir da altitude, da latitude e da proximidade de água doce. Vale para os sistemas planetários abertos depois.",
        "sv": "Klimat och biom ger världar med hav oceaner, sjöar, floder och biom utifrån temperatur och fuktighet. Polygonkarta bygger dem enligt Amit Patels polygonala kartgenerering: land som stiger från kusten mot bergen, floder som rinner ner mot havet och biom utifrån höjd, latitud och närhet till sötvatten. Gäller planetsystem som öppnas efteråt."
    },
    "Closed autocracy": {
        "cs": "Uzavřená autokracie",
        "da": "Lukket autokrati",
        "de": "Geschlossene Autokratie",
        "es": "Autocracia cerrada",
        "fr": "Autocratie fermée",
        "pt": "Autocracia fechada",
        "sv": "Sluten autokrati"
    },
    "Cloud cover": {
        "cs": "Oblačnost",
        "da": "Skydække",
        "de": "Bewölkung",
        "es": "Nubosidad",
        "fr": "Couverture nuageuse",
        "pt": "Cobertura de nuvens",
        "sv": "Molntäcke"
    },
    "Cloud layers over the globes of planets with atmospheres": {
        "cs": "Vrstvy mraků nad glóby planet s atmosférou",
        "da": "Skylag over globusserne for planeter med atmosfære",
        "de": "Wolkenschichten über den Globen von Planeten mit Atmosphäre",
        "es": "Capas de nubes sobre los globos de los planetas con atmósfera",
        "fr": "Couches nuageuses au-dessus des globes des planètes dotées d’une atmosphère",
        "pt": "Camadas de nuvens sobre os globos dos planetas com atmosfera",
        "sv": "Molnlager över globerna för planeter med atmosfär"
    },
    "Cold": {
        "cs": "Chladné",
        "da": "Kold",
        "de": "Kalt",
        "es": "Frío",
        "fr": "Froid",
        "pt": "Frio",
        "sv": "Kall"
    },
    "Confederal": {
        "cs": "Konfederální",
        "da": "Konføderal",
        "de": "Konföderal",
        "es": "Confederal",
        "fr": "Confédéral",
        "pt": "Confederal",
        "sv": "Konfederal"
    },
    "Constitutional monarchy": {
        "cs": "Konstituční monarchie",
        "da": "Konstitutionelt monarki",
        "de": "Konstitutionelle Monarchie",
        "es": "Monarquía constitucional",
        "fr": "Monarchie constitutionnelle",
        "pt": "Monarquia constitucional",
        "sv": "Konstitutionell monarki"
    },
    "Continue route": {
        "cs": "Pokračovat",
        "da": "Fortsæt rute",
        "de": "Route fortsetzen",
        "es": "Continuar ruta",
        "fr": "Poursuivre l’itinéraire",
        "pt": "Continuar rota",
        "sv": "Fortsätt rutt"
    },
    "Copied": {
        "cs": "Hotovo",
        "da": "Kopieret",
        "de": "Kopiert",
        "es": "Copiado",
        "fr": "Copié",
        "pt": "Copiado",
        "sv": "Kopierat"
    },
    "Copy": {
        "cs": "Kopírovat",
        "da": "Kopiér",
        "de": "Kopieren",
        "es": "Copiar",
        "fr": "Copier",
        "pt": "Copiar",
        "sv": "Kopiera"
    },
    "Copy all of this information to the clipboard as text": {
        "cs": "Zkopírovat všechny tyto údaje do schránky jako text",
        "da": "Kopiér alle disse oplysninger til udklipsholderen som tekst",
        "de": "Alle diese Angaben als Text in die Zwischenablage kopieren",
        "es": "Copia toda esta información al portapapeles como texto",
        "fr": "Copier toutes ces informations dans le presse-papiers sous forme de texte",
        "pt": "Copiar todas estas informações para a área de transferência como texto",
        "sv": "Kopiera all den här informationen till urklipp som text"
    },
    "Couldn't create the universe: %@": {
        "cs": "Vesmír se nepodařilo vytvořit: %@",
        "da": "Kunne ikke oprette universet: %@",
        "de": "Universum konnte nicht erstellt werden: %@",
        "es": "No se ha podido crear el universo: %@",
        "fr": "Impossible de créer l’univers : %@",
        "pt": "Não foi possível criar o universo: %@",
        "sv": "Det gick inte att skapa universumet: %@"
    },
    "Couldn't export the city map": {
        "cs": "Mapu města se nepodařilo exportovat",
        "da": "Kunne ikke eksportere bykortet",
        "de": "Stadtkarte konnte nicht exportiert werden",
        "es": "No se ha podido exportar el mapa de la ciudad",
        "fr": "Impossible d’exporter le plan de ville",
        "pt": "Não foi possível exportar o mapa da cidade",
        "sv": "Det gick inte att exportera stadskartan"
    },
    "Couldn't export the globe": {
        "cs": "Glóbus se nepodařilo exportovat",
        "da": "Kunne ikke eksportere globussen",
        "de": "Globus konnte nicht exportiert werden",
        "es": "No se ha podido exportar el globo",
        "fr": "Impossible d’exporter le globe",
        "pt": "Não foi possível exportar o globo",
        "sv": "Det gick inte att exportera globen"
    },
    "Couldn't export the map": {
        "cs": "Mapu se nepodařilo exportovat",
        "da": "Kunne ikke eksportere kortet",
        "de": "Karte konnte nicht exportiert werden",
        "es": "No se ha podido exportar el mapa",
        "fr": "Impossible d’exporter la carte",
        "pt": "Não foi possível exportar o mapa",
        "sv": "Det gick inte att exportera kartan"
    },
    "Couldn't export the universe": {
        "cs": "Vesmír se nepodařilo exportovat",
        "da": "Kunne ikke eksportere universet",
        "de": "Universum konnte nicht exportiert werden",
        "es": "No se ha podido exportar el universo",
        "fr": "Impossible d’exporter l’univers",
        "pt": "Não foi possível exportar o universo",
        "sv": "Det gick inte att exportera universumet"
    },
    "Couldn't place settlements": {
        "cs": "Sídla se nepodařilo umístit",
        "da": "Kunne ikke placere bebyggelser",
        "de": "Siedlungen konnten nicht platziert werden",
        "es": "No se han podido colocar los asentamientos",
        "fr": "Impossible de placer les localités",
        "pt": "Não foi possível posicionar os assentamentos",
        "sv": "Det gick inte att placera bosättningar"
    },
    "Couldn't reach TravellerMap": {
        "cs": "TravellerMap není dostupný",
        "da": "Kunne ikke nå TravellerMap",
        "de": "TravellerMap nicht erreichbar",
        "es": "No se ha podido conectar con TravellerMap",
        "fr": "Impossible de joindre TravellerMap",
        "pt": "Não foi possível acessar o TravellerMap",
        "sv": "Det gick inte att nå TravellerMap"
    },
    "Couldn't update the universe: %@": {
        "cs": "Vesmír se nepodařilo aktualizovat: %@",
        "da": "Kunne ikke opdatere universet: %@",
        "de": "Universum konnte nicht aktualisiert werden: %@",
        "es": "No se ha podido actualizar el universo: %@",
        "fr": "Impossible de mettre à jour l’univers : %@",
        "pt": "Não foi possível atualizar o universo: %@",
        "sv": "Det gick inte att uppdatera universumet: %@"
    },
    "Crater": {
        "cs": "Kráter",
        "da": "Krater",
        "de": "Krater",
        "es": "Cráter",
        "fr": "Cratère",
        "pt": "Cratera",
        "sv": "Krater"
    },
    "Customs, repair yards, routes across the system": {
        "cs": "Clo, opravárenské loděnice, spoje napříč soustavou",
        "da": "Told, reparationsværfter, ruter på tværs af systemet",
        "de": "Zoll, Reparaturwerften, Verbindungen im ganzen System",
        "es": "Aduanas, talleres de reparación, rutas por todo el sistema",
        "fr": "Douanes, chantiers de réparation, lignes dans tout le système",
        "pt": "Alfândega, estaleiros de reparo, rotas por todo o sistema",
        "sv": "Tull, reparationsvarv, rutter genom hela systemet"
    },
    "Cyclone": {
        "cs": "Cyklóna",
        "da": "Cyklon",
        "de": "Zyklon",
        "es": "Ciclón",
        "fr": "Cyclone",
        "pt": "Ciclone",
        "sv": "Cyklon"
    },
    "Dark nebula": {
        "cs": "Temná mlhovina",
        "da": "Mørk tåge",
        "de": "Dunkelwolke",
        "es": "Nebulosa oscura",
        "fr": "Nébuleuse obscure",
        "pt": "Nebulosa escura",
        "sv": "Mörk nebulosa"
    },
    "Data Versions": {
        "cs": "Verze dat",
        "da": "Dataversioner",
        "de": "Datenversionen",
        "es": "Versiones de datos",
        "fr": "Versions des données",
        "pt": "Versões dos Dados",
        "sv": "Dataversioner"
    },
    "Data Versions…": {
        "cs": "Verze dat…",
        "da": "Dataversioner…",
        "de": "Datenversionen …",
        "es": "Versiones de datos…",
        "fr": "Versions des données…",
        "pt": "Versões dos Dados…",
        "sv": "Dataversioner…"
    },
    "Data © TravellerMap.com": {
        "cs": "Data © TravellerMap.com",
        "da": "Data © TravellerMap.com",
        "de": "Daten © TravellerMap.com",
        "es": "Datos © TravellerMap.com",
        "fr": "Données © TravellerMap.com",
        "pt": "Dados © TravellerMap.com",
        "sv": "Data © TravellerMap.com"
    },
    "Dawn or dusk": {
        "cs": "Svítání nebo soumrak",
        "da": "Daggry eller skumring",
        "de": "Morgen- oder Abenddämmerung",
        "es": "Amanecer o atardecer",
        "fr": "Aube ou crépuscule",
        "pt": "Alvorada ou crepúsculo",
        "sv": "Gryning eller skymning"
    },
    "Day": {
        "cs": "Den",
        "da": "Dag",
        "de": "Tag",
        "es": "Día",
        "fr": "Jour",
        "pt": "Dia",
        "sv": "Dag"
    },
    "Delete Note": {
        "cs": "Smazat poznámku",
        "da": "Slet note",
        "de": "Notiz löschen",
        "es": "Eliminar nota",
        "fr": "Supprimer la note",
        "pt": "Apagar Nota",
        "sv": "Radera anteckning"
    },
    "Delete Place": {
        "cs": "Smazat místo",
        "da": "Slet sted",
        "de": "Ort löschen",
        "es": "Eliminar lugar",
        "fr": "Supprimer le lieu",
        "pt": "Apagar Lugar",
        "sv": "Radera plats"
    },
    "Desert": {
        "cs": "Poušť",
        "da": "Ørken",
        "de": "Wüste",
        "es": "Desierto",
        "fr": "Désert",
        "pt": "Deserto",
        "sv": "Öken"
    },
    "Designation": {
        "cs": "Označení",
        "da": "Betegnelse",
        "de": "Bezeichnung",
        "es": "Designación",
        "fr": "Désignation",
        "pt": "Designação",
        "sv": "Beteckning"
    },
    "Details changed": {
        "cs": "Podrobnosti změněny",
        "da": "Detaljer ændret",
        "de": "Details geändert",
        "es": "Detalles cambiados",
        "fr": "Détails modifiés",
        "pt": "Detalhes alterados",
        "sv": "Detaljer ändrade"
    },
    "Digital networks, satellites, crewed orbital flight": {
        "cs": "Digitální sítě, satelity, pilotované orbitální lety",
        "da": "Digitale netværk, satellitter, bemandet rumfart i kredsløb",
        "de": "Digitale Netze, Satelliten, bemannte Orbitalflüge",
        "es": "Redes digitales, satélites, vuelos orbitales tripulados",
        "fr": "Réseaux numériques, satellites, vols orbitaux habités",
        "pt": "Redes digitais, satélites, voo orbital tripulado",
        "sv": "Digitala nätverk, satelliter, bemannade omloppsfärder"
    },
    "Dismiss": {
        "cs": "Zavřít",
        "da": "Afvis",
        "de": "Schließen",
        "es": "Descartar",
        "fr": "Ignorer",
        "pt": "Dispensar",
        "sv": "Stäng"
    },
    "Distance from star": {
        "cs": "Vzdálenost od hvězdy",
        "da": "Afstand fra stjernen",
        "de": "Abstand zum Stern",
        "es": "Distancia a la estrella",
        "fr": "Distance à l’étoile",
        "pt": "Distância da estrela",
        "sv": "Avstånd från stjärnan"
    },
    "Double-click to set the year": {
        "cs": "Poklepáním nastavíte rok",
        "da": "Dobbeltklik for at angive året",
        "de": "Doppelklicken, um das Jahr festzulegen",
        "es": "Haz doble clic para fijar el año",
        "fr": "Double-cliquez pour définir l’année",
        "pt": "Clique duas vezes para definir o ano",
        "sv": "Dubbelklicka för att ange året"
    },
    "Downloaded “%@”.": {
        "cs": "Staženo „%@“.",
        "da": "Hentede “%@”.",
        "de": "„%@“ wurde geladen.",
        "es": "Se descargó “%@”.",
        "fr": "« %@ » téléchargé.",
        "pt": "“%@” baixado.",
        "sv": "Hämtade ”%@”."
    },
    "Drag to orbit; shift-drag to pan; scroll or pinch to zoom": {
        "cs": "Tažením obíháte; tažením se Shiftem posouváte; posunem nebo sevřením přibližujete",
        "da": "Træk for at kredse; skift-træk for at panorere; rul eller knib for at zoome",
        "de": "Ziehen zum Kreisen; mit Umschalttaste ziehen zum Verschieben; scrollen oder auf-/zuziehen zum Zoomen",
        "es": "Arrastra para orbitar; arrastra con Mayús para desplazar; desplázate o pellizca para hacer zoom",
        "fr": "Faites glisser pour tourner ; Maj-glisser pour vous déplacer ; faites défiler ou pincez pour zoomer",
        "pt": "Arraste para orbitar; shift-arraste para mover; role ou use pinça para zoom",
        "sv": "Dra för att kretsa; skift-dra för att panorera; skrolla eller nyp för att zooma"
    },
    "Draw moons like planets": {
        "cs": "Měsíce jako planety",
        "da": "Tegn måner som planeter",
        "de": "Monde wie Planeten zeichnen",
        "es": "Dibujar lunas como planetas",
        "fr": "Dessiner les lunes comme des planètes",
        "pt": "Desenhar luas como planetas",
        "sv": "Rita månar som planeter"
    },
    "Draw precipitation radar or temperature over the globe, kept up to date as time runs": {
        "cs": "Kreslit srážkový radar nebo teplotu nad glóbem, průběžně aktualizované s plynutím času",
        "da": "Tegn nedbørsradar eller temperatur over globussen, opdateret mens tiden løber",
        "de": "Niederschlagsradar oder Temperatur über dem Globus zeichnen, laufend aktualisiert",
        "es": "Dibuja el radar de precipitación o la temperatura sobre el globo, actualizados a medida que pasa el tiempo",
        "fr": "Afficher le radar de précipitations ou la température sur le globe, mis à jour à mesure que le temps s’écoule",
        "pt": "Desenhar radar de precipitação ou temperatura sobre o globo, atualizado conforme o tempo passa",
        "sv": "Rita nederbördsradar eller temperatur över globen, uppdaterad medan tiden går"
    },
    "Draw the Imperium's express boat routes on the chart, and other states' communication routes dashed": {
        "cs": "Kreslit do mapy trasy expresních lodí Impéria a komunikační trasy jiných států čárkovaně",
        "da": "Tegn Imperiets ekspresbådsruter på kortet, og andre staters kommunikationsruter stiplet",
        "de": "Die Expressboot-Routen des Imperiums auf der Karte zeichnen und die Kommunikationsrouten anderer Staaten gestrichelt",
        "es": "Dibuja en la carta las rutas de los botes exprés del Imperio, y con trazos discontinuos las rutas de comunicación de otros estados",
        "fr": "Dessiner sur la carte les routes des express boats de l’Imperium, et en pointillés les routes de communication des autres États",
        "pt": "Desenhar no mapa as rotas dos barcos expressos do Imperium, e as rotas de comunicação de outros estados tracejadas",
        "sv": "Rita Imperiets expressbåtsrutter på kartan, och andra staters kommunikationsrutter streckade"
    },
    "Draw the path each planet, moon and companion star follows round its orbit, and the green habitable zones": {
        "cs": "Kreslit dráhu každé planety, měsíce a průvodní hvězdy a zelené obyvatelné zóny",
        "da": "Tegn den bane, hver planet, måne og ledsagerstjerne følger, og de grønne beboelige zoner",
        "de": "Die Bahn jedes Planeten, Mondes und Begleitsterns zeichnen sowie die grünen habitablen Zonen",
        "es": "Dibuja la trayectoria que sigue cada planeta, luna y estrella compañera en su órbita, y las zonas habitables verdes",
        "fr": "Dessiner la trajectoire de chaque planète, lune et étoile compagnon sur son orbite, et les zones habitables en vert",
        "pt": "Desenhar o caminho que cada planeta, lua e estrela companheira percorre em sua órbita, e as zonas habitáveis verdes",
        "sv": "Rita banan varje planet, måne och följeslagarstjärna följer, och de gröna beboeliga zonerna"
    },
    "Draw the rings the stars of multiple systems follow round each other": {
        "cs": "Kreslit kružnice, po kterých obíhají hvězdy vícenásobných soustav kolem sebe",
        "da": "Tegn de ringe, som stjernerne i multiple systemer følger om hinanden",
        "de": "Die Bahnen zeichnen, auf denen die Sterne von Mehrfachsystemen einander umkreisen",
        "es": "Dibuja los anillos que siguen las estrellas de los sistemas múltiples alrededor unas de otras",
        "fr": "Dessiner les anneaux que suivent les étoiles des systèmes multiples les unes autour des autres",
        "pt": "Desenhar os anéis que as estrelas de sistemas múltiplos percorrem umas em torno das outras",
        "sv": "Rita ringarna som stjärnorna i multipelsystem följer runt varandra"
    },
    "Draw the star field's nebulae: star-forming clouds, dark clouds, dust lit by nearby stars, and the shells and wrecks of dying stars": {
        "cs": "Kreslit mlhoviny hvězdného pole: oblaka, kde vznikají hvězdy, temná oblaka, prach osvětlený blízkými hvězdami a obaly a trosky umírajících hvězd",
        "da": "Tegn stjernefeltets tåger: stjernedannende skyer, mørke skyer, støv oplyst af nærliggende stjerner og skallerne og vragene af døende stjerner",
        "de": "Die Nebel des Sternfelds zeichnen: Sternentstehungswolken, Dunkelwolken, von nahen Sternen beleuchteter Staub und die Hüllen und Trümmer sterbender Sterne",
        "es": "Dibuja las nebulosas del campo estelar: nubes de formación estelar, nubes oscuras, polvo iluminado por estrellas cercanas y las envolturas y restos de estrellas moribundas",
        "fr": "Dessiner les nébuleuses du champ d’étoiles : nuages de formation d’étoiles, nuages sombres, poussière éclairée par des étoiles proches, et coquilles et vestiges d’étoiles mourantes",
        "pt": "Desenhar as nebulosas do campo estelar: nuvens formadoras de estrelas, nuvens escuras, poeira iluminada por estrelas próximas e as cascas e destroços de estrelas moribundas",
        "sv": "Rita stjärnfältets nebulosor: stjärnbildande moln, mörka moln, stoft upplyst av närliggande stjärnor och skalen och vraken av döende stjärnor"
    },
    "Draw the stars at twice their size, so they're easier to see": {
        "cs": "Kreslit hvězdy dvojnásobně velké, aby byly lépe vidět",
        "da": "Tegn stjernerne i dobbelt størrelse, så de er lettere at se",
        "de": "Sterne doppelt so groß zeichnen, damit sie leichter zu sehen sind",
        "es": "Dibuja las estrellas al doble de su tamaño para que se vean mejor",
        "fr": "Dessiner les étoiles à deux fois leur taille, pour mieux les voir",
        "pt": "Desenhar as estrelas com o dobro do tamanho, para vê-las melhor",
        "sv": "Rita stjärnorna i dubbel storlek så att de syns lättare"
    },
    "Dust lit blue by the light of a nearby star": {
        "cs": "Prach modře osvětlený světlem blízké hvězdy",
        "da": "Støv oplyst blåt af lyset fra en nærliggende stjerne",
        "de": "Staub, blau beleuchtet vom Licht eines nahen Sterns",
        "es": "Polvo iluminado de azul por la luz de una estrella cercana",
        "fr": "Poussière éclairée en bleu par la lumière d’une étoile proche",
        "pt": "Poeira iluminada de azul pela luz de uma estrela próxima",
        "sv": "Stoft upplyst i blått av ljuset från en närliggande stjärna"
    },
    "E": {
        "cs": "V",
        "da": "Ø",
        "de": "O",
        "es": "E",
        "fr": "E",
        "pt": "L",
        "sv": "Ö"
    },
    "Each version of TravellerMap's data the universe has fetched. Using another redoes only the systems of the worlds it differs in.": {
        "cs": "Každá verze dat TravellerMap, kterou vesmír stáhl. Použití jiné znovu vytvoří jen soustavy světů, ve kterých se liší.",
        "da": "Hver version af TravellerMaps data, som universet har hentet. Brug af en anden genskaber kun systemerne for de verdener, den adskiller sig i.",
        "de": "Jede Version der TravellerMap-Daten, die das Universum geladen hat. Eine andere zu nutzen erzeugt nur die Systeme der Welten neu, in denen sie sich unterscheidet.",
        "es": "Cada versión de los datos de TravellerMap que ha descargado el universo. Usar otra rehace solo los sistemas de los mundos en que difiere.",
        "fr": "Chaque version des données de TravellerMap récupérée par l’univers. En utiliser une autre ne refait que les systèmes des mondes qui diffèrent.",
        "pt": "Cada versão dos dados do TravellerMap que o universo baixou. Usar outra refaz só os sistemas dos mundos em que ela difere.",
        "sv": "Varje version av TravellerMaps data som universumet har hämtat. Att använda en annan gör bara om systemen för de världar den skiljer sig i."
    },
    "Early carbon star": {
        "cs": "Raná uhlíková hvězda",
        "da": "Tidlig kulstofstjerne",
        "de": "Früher Kohlenstoffstern",
        "es": "Estrella de carbono temprana",
        "fr": "Étoile carbonée précoce",
        "pt": "Estrela de carbono precoce",
        "sv": "Tidig kolstjärna"
    },
    "Eccentric": {
        "cs": "Výstředná",
        "da": "Excentrisk",
        "de": "Exzentrisch",
        "es": "Excéntrico",
        "fr": "Excentrique",
        "pt": "Excêntrica",
        "sv": "Excentrisk"
    },
    "Eccentricity": {
        "cs": "Výstřednost",
        "da": "Excentricitet",
        "de": "Exzentrizität",
        "es": "Excentricidad",
        "fr": "Excentricité",
        "pt": "Excentricidade",
        "sv": "Excentricitet"
    },
    "Eclectic": {
        "cs": "Eklektický",
        "da": "Eklektisk",
        "de": "Eklektisch",
        "es": "Ecléctico",
        "fr": "Éclectique",
        "pt": "Eclético",
        "sv": "Eklektisk"
    },
    "Edit": {
        "cs": "Upravit",
        "da": "Redigér",
        "de": "Bearbeiten",
        "es": "Editar",
        "fr": "Modifier",
        "pt": "Editar",
        "sv": "Redigera"
    },
    "Edit world data": {
        "cs": "Upravit data světa",
        "da": "Redigér verdensdata",
        "de": "Weltdaten bearbeiten",
        "es": "Editar datos del mundo",
        "fr": "Modifier les données du monde",
        "pt": "Editar dados do mundo",
        "sv": "Redigera världsdata"
    },
    "Electoral autocracy": {
        "cs": "Volební autokracie",
        "da": "Valgautokrati",
        "de": "Wahlautokratie",
        "es": "Autocracia electoral",
        "fr": "Autocratie électorale",
        "pt": "Autocracia eleitoral",
        "sv": "Valautokrati"
    },
    "Electoral democracy": {
        "cs": "Volební demokracie",
        "da": "Valgdemokrati",
        "de": "Wahldemokratie",
        "es": "Democracia electoral",
        "fr": "Démocratie électorale",
        "pt": "Democracia eleitoral",
        "sv": "Valdemokrati"
    },
    "Electricity, radio, motor vehicles, flight": {
        "cs": "Elektřina, rádio, motorová vozidla, letectví",
        "da": "Elektricitet, radio, motorkøretøjer, luftfart",
        "de": "Elektrizität, Funk, Kraftfahrzeuge, Luftfahrt",
        "es": "Electricidad, radio, vehículos a motor, aviación",
        "fr": "Électricité, radio, véhicules à moteur, aviation",
        "pt": "Eletricidade, rádio, veículos motorizados, aviação",
        "sv": "Elektricitet, radio, motorfordon, flyg"
    },
    "Emission nebula": {
        "cs": "Emisní mlhovina",
        "da": "Emissionståge",
        "de": "Emissionsnebel",
        "es": "Nebulosa de emisión",
        "fr": "Nébuleuse en émission",
        "pt": "Nebulosa de emissão",
        "sv": "Emissionsnebulosa"
    },
    "End route": {
        "cs": "Ukončit trasu",
        "da": "Afslut rute",
        "de": "Route beenden",
        "es": "Terminar ruta",
        "fr": "Terminer l’itinéraire",
        "pt": "Encerrar rota",
        "sv": "Avsluta rutt"
    },
    "Endless day": {
        "cs": "Nekonečný den",
        "da": "Endeløs dag",
        "de": "Ewiger Tag",
        "es": "Día perpetuo",
        "fr": "Jour sans fin",
        "pt": "Dia sem fim",
        "sv": "Ändlös dag"
    },
    "Endless night": {
        "cs": "Nekonečná noc",
        "da": "Endeløs nat",
        "de": "Ewige Nacht",
        "es": "Noche perpetua",
        "fr": "Nuit sans fin",
        "pt": "Noite sem fim",
        "sv": "Ändlös natt"
    },
    "Enlarge stars 200%": {
        "cs": "Zvětšit hvězdy na 200 %",
        "da": "Forstør stjerner 200%",
        "de": "Sterne 200 % vergrößern",
        "es": "Agrandar estrellas 200%",
        "fr": "Agrandir les étoiles à 200 %",
        "pt": "Ampliar estrelas 200%",
        "sv": "Förstora stjärnor 200 %"
    },
    "Environment": {
        "cs": "Prostředí",
        "da": "Miljø",
        "de": "Umwelt",
        "es": "Entorno",
        "fr": "Environnement",
        "pt": "Ambiente",
        "sv": "Miljö"
    },
    "Essential only": {
        "cs": "Jen nezbytné",
        "da": "Kun nødvendig",
        "de": "Nur notwendige",
        "es": "Solo esenciales",
        "fr": "Essentiels uniquement",
        "pt": "Só essenciais",
        "sv": "Endast nödvändiga"
    },
    "Estrelas": {
        "cs": "Estrelas",
        "da": "Estrelas",
        "de": "Estrelas",
        "es": "Estrelas",
        "fr": "Estrelas",
        "pt": "Estrelas",
        "sv": "Estrelas"
    },
    "Event horizon": {
        "cs": "Horizont událostí",
        "da": "Begivenhedshorisont",
        "de": "Ereignishorizont",
        "es": "Horizonte de sucesos",
        "fr": "Horizon des événements",
        "pt": "Horizonte de eventos",
        "sv": "Händelsehorisont"
    },
    "Export": {
        "cs": "Exportovat",
        "da": "Eksportér",
        "de": "Exportieren",
        "es": "Exportar",
        "fr": "Exporter",
        "pt": "Exportar",
        "sv": "Exportera"
    },
    "Export a top-down map of the city as an image or PDF": {
        "cs": "Exportovat mapu města shora jako obrázek nebo PDF",
        "da": "Eksportér et kort over byen set ovenfra som billede eller PDF",
        "de": "Eine Draufsicht der Stadt als Bild oder PDF exportieren",
        "es": "Exporta un mapa cenital de la ciudad como imagen o PDF",
        "fr": "Exporter un plan vu du dessus de la ville en image ou en PDF",
        "pt": "Exportar um mapa visto de cima da cidade como imagem ou PDF",
        "sv": "Exportera en karta över staden ovanifrån som bild eller PDF"
    },
    "Export for Players…": {
        "cs": "Exportovat pro hráče…",
        "da": "Eksportér til spillere…",
        "de": "Für Spieler exportieren …",
        "es": "Exportar para jugadores…",
        "fr": "Exporter pour les joueurs…",
        "pt": "Exportar para Jogadores…",
        "sv": "Exportera för spelare…"
    },
    "Export map": {
        "cs": "Exportovat mapu",
        "da": "Eksportér kort",
        "de": "Karte exportieren",
        "es": "Exportar mapa",
        "fr": "Exporter le plan",
        "pt": "Exportar mapa",
        "sv": "Exportera karta"
    },
    "Export the map, with its grid and places, as an image or PDF": {
        "cs": "Exportovat mapu s mřížkou a místy jako obrázek nebo PDF",
        "da": "Eksportér kortet med gitter og steder som billede eller PDF",
        "de": "Die Karte mit Gitter und Orten als Bild oder PDF exportieren",
        "es": "Exporta el mapa, con su cuadrícula y lugares, como imagen o PDF",
        "fr": "Exporter la carte, avec sa grille et ses lieux, en image ou en PDF",
        "pt": "Exportar o mapa, com sua grade e lugares, como imagem ou PDF",
        "sv": "Exportera kartan med rutnät och platser som bild eller PDF"
    },
    "Exported “%@” for players.": {
        "cs": "„%@“ exportováno pro hráče.",
        "da": "Eksporterede “%@” til spillere.",
        "de": "„%@“ für Spieler exportiert.",
        "es": "Se exportó “%@” para los jugadores.",
        "fr": "« %@ » exporté pour les joueurs.",
        "pt": "“%@” exportado para jogadores.",
        "sv": "Exporterade ”%@” för spelare."
    },
    "Exporting…": {
        "cs": "Exportuje se…",
        "da": "Eksporterer…",
        "de": "Wird exportiert …",
        "es": "Exportando…",
        "fr": "Exportation…",
        "pt": "Exportando…",
        "sv": "Exporterar…"
    },
    "Featureless white dwarf": {
        "cs": "Bílý trpaslík bez čar",
        "da": "Karakterløs hvid dværg",
        "de": "Merkmalsloser Weißer Zwerg",
        "es": "Enana blanca sin líneas",
        "fr": "Naine blanche sans raies",
        "pt": "Anã branca sem linhas espectrais",
        "sv": "Särdragslös vit dvärg"
    },
    "Federal": {
        "cs": "Federální",
        "da": "Føderal",
        "de": "Föderal",
        "es": "Federal",
        "fr": "Fédéral",
        "pt": "Federal",
        "sv": "Federal"
    },
    "Fetched %@. Taking the new version redoes only the systems of the worlds whose data changed; everything else stays as it is.": {
        "cs": "Staženo %@. Nová verze znovu vytvoří jen soustavy světů, jejichž data se změnila; vše ostatní zůstane, jak je.",
        "da": "Hentet %@. Den nye version genskaber kun systemerne for de verdener, hvis data er ændret; alt andet forbliver, som det er.",
        "de": "Geladen am %@. Die neue Version erzeugt nur die Systeme der Welten neu, deren Daten sich geändert haben; alles andere bleibt, wie es ist.",
        "es": "Descargado el %@. Adoptar la nueva versión rehace solo los sistemas de los mundos cuyos datos cambiaron; todo lo demás queda igual.",
        "fr": "Récupéré le %@. Adopter la nouvelle version ne refait que les systèmes des mondes dont les données ont changé ; tout le reste demeure tel quel.",
        "pt": "Baixado em %@. Adotar a nova versão refaz só os sistemas dos mundos cujos dados mudaram; todo o resto fica como está.",
        "sv": "Hämtad %@. Den nya versionen gör bara om systemen för de världar vars data har ändrats; allt annat förblir som det är."
    },
    "Fetching %@…": {
        "cs": "Stahuje se %@…",
        "da": "Henter %@…",
        "de": "%@ wird geladen …",
        "es": "Descargando %@…",
        "fr": "Récupération de %@…",
        "pt": "Baixando %@…",
        "sv": "Hämtar %@…"
    },
    "Field": {
        "cs": "Pole",
        "da": "Felt",
        "de": "Feld",
        "es": "Campo",
        "fr": "Terrain",
        "pt": "Campo",
        "sv": "Fält"
    },
    "File ▸ Switch Map Type… brings you back here.": {
        "cs": "Soubor ▸ Přepnout typ mapy… vás sem vrátí.",
        "da": "Arkiv ▸ Skift korttype… bringer dig tilbage hertil.",
        "de": "„Ablage“ ▸ „Kartentyp wechseln …“ bringt dich hierher zurück.",
        "es": "Archivo ▸ Cambiar tipo de mapa… te trae de vuelta aquí.",
        "fr": "Fichier ▸ Changer de type de carte… vous ramène ici.",
        "pt": "Arquivo ▸ Mudar Tipo de Mapa… traz você de volta aqui.",
        "sv": "Arkiv ▸ Byt karttyp… tar dig tillbaka hit."
    },
    "Filters": {
        "cs": "Filtry",
        "da": "Filtre",
        "de": "Filter",
        "es": "Filtros",
        "fr": "Filtres",
        "pt": "Filtros",
        "sv": "Filter"
    },
    "Finance": {
        "cs": "Finance",
        "da": "Finans",
        "de": "Finanzen",
        "es": "Finanzas",
        "fr": "Finance",
        "pt": "Finanças",
        "sv": "Finans"
    },
    "Firearms need a licence and registration": {
        "cs": "Střelné zbraně vyžadují zbrojní průkaz a registraci",
        "da": "Skydevåben kræver tilladelse og registrering",
        "de": "Schusswaffen brauchen Waffenschein und Registrierung",
        "es": "Las armas de fuego requieren licencia y registro",
        "fr": "Les armes à feu exigent un permis et un enregistrement",
        "pt": "Armas de fogo exigem licença e registro",
        "sv": "Skjutvapen kräver licens och registrering"
    },
    "Fishing and shipping": {
        "cs": "Rybolov a lodní doprava",
        "da": "Fiskeri og skibsfart",
        "de": "Fischerei und Schifffahrt",
        "es": "Pesca y transporte marítimo",
        "fr": "Pêche et transport maritime",
        "pt": "Pesca e navegação",
        "sv": "Fiske och sjöfart"
    },
    "Flare star": {
        "cs": "Eruptivní hvězda",
        "da": "Flarestjerne",
        "de": "Flare-Stern",
        "es": "Estrella fulgurante",
        "fr": "Étoile à éruptions",
        "pt": "Estrela fulgurante",
        "sv": "Flarestjärna"
    },
    "Flat roofs, thick pale walls, shaded courtyards and narrow lanes": {
        "cs": "Ploché střechy, silné světlé zdi, stinná nádvoří a úzké uličky",
        "da": "Flade tage, tykke lyse mure, skyggefulde gårde og smalle stræder",
        "de": "Flachdächer, dicke helle Mauern, schattige Innenhöfe und enge Gassen",
        "es": "Tejados planos, gruesos muros claros, patios sombreados y callejuelas estrechas",
        "fr": "Toits plats, murs épais et clairs, cours ombragées et ruelles étroites",
        "pt": "Telhados planos, paredes grossas e claras, pátios sombreados e vielas estreitas",
        "sv": "Platta tak, tjocka ljusa murar, skuggiga gårdar och smala gränder"
    },
    "Fly to %@": {
        "cs": "Letět k %@",
        "da": "Flyv til %@",
        "de": "Zu %@ fliegen",
        "es": "Volar a %@",
        "fr": "Voler vers %@",
        "pt": "Voar até %@",
        "sv": "Flyg till %@"
    },
    "Forest": {
        "cs": "Les",
        "da": "Skov",
        "de": "Wald",
        "es": "Bosque",
        "fr": "Forêt",
        "pt": "Floresta",
        "sv": "Skog"
    },
    "Forget the port and installations set here, and go back to the generated ones": {
        "cs": "Zahodit zde nastavený přístav a zařízení a vrátit se k vygenerovaným",
        "da": "Glem havnen og anlæggene, der er sat her, og gå tilbage til de genererede",
        "de": "Hier gesetzten Hafen und Einrichtungen verwerfen und zu den generierten zurückkehren",
        "es": "Olvida el puerto y las instalaciones definidos aquí y vuelve a los generados",
        "fr": "Oublier le port et les installations définis ici, et revenir aux valeurs générées",
        "pt": "Esquecer o porto e as instalações definidos aqui e voltar aos gerados",
        "sv": "Glöm hamnen och anläggningarna som har satts här och gå tillbaka till de genererade"
    },
    "Forget the world data set here, and go back to the generated values": {
        "cs": "Zahodit zde nastavená data světa a vrátit se k vygenerovaným hodnotám",
        "da": "Glem verdensdataene, der er sat her, og gå tilbage til de genererede værdier",
        "de": "Hier gesetzte Weltdaten verwerfen und zu den generierten Werten zurückkehren",
        "es": "Olvida los datos del mundo definidos aquí y vuelve a los valores generados",
        "fr": "Oublier les données du monde définies ici, et revenir aux valeurs générées",
        "pt": "Esquecer os dados do mundo definidos aqui e voltar aos valores gerados",
        "sv": "Glöm världsdata som har satts här och gå tillbaka till de genererade värdena"
    },
    "From the climate, fading as technology lets builders build alike anywhere": {
        "cs": "Podle podnebí, slábnoucí s tím, jak technologie dovoluje stavět všude stejně",
        "da": "Ud fra klimaet, aftagende efterhånden som teknologien lader bygherrer bygge ens overalt",
        "de": "Nach dem Klima, abnehmend, je mehr die Technik überall gleiches Bauen erlaubt",
        "es": "Según el clima, cada vez menos a medida que la tecnología permite construir igual en cualquier lugar",
        "fr": "Selon le climat, s’estompant à mesure que la technologie permet de bâtir partout de la même façon",
        "pt": "Pelo clima, esmaecendo à medida que a tecnologia permite construir igual em qualquer lugar",
        "sv": "Utifrån klimatet, avtagande i takt med att tekniken låter byggare bygga lika överallt"
    },
    "From your GM, %@": {
        "cs": "Od vašeho PJ, %@",
        "da": "Fra din spilleder, %@",
        "de": "Von deinem SL, %@",
        "es": "De tu DJ, %@",
        "fr": "De votre MJ, %@",
        "pt": "Do seu mestre, %@",
        "sv": "Från din spelledare, %@"
    },
    "Frozen": {
        "cs": "Zamrzlé",
        "da": "Frossen",
        "de": "Gefroren",
        "es": "Helado",
        "fr": "Glacé",
        "pt": "Congelado",
        "sv": "Frusen"
    },
    "Fuel, maintenance, a few scheduled routes": {
        "cs": "Palivo, údržba, několik pravidelných spojů",
        "da": "Brændstof, vedligeholdelse, nogle få faste ruter",
        "de": "Treibstoff, Wartung, einige Linienverbindungen",
        "es": "Combustible, mantenimiento, algunas rutas regulares",
        "fr": "Carburant, entretien, quelques lignes régulières",
        "pt": "Combustível, manutenção, algumas rotas regulares",
        "sv": "Bränsle, underhåll, några reguljära rutter"
    },
    "Fusion power, routine travel between planets": {
        "cs": "Fúzní energie, běžné cesty mezi planetami",
        "da": "Fusionskraft, rutinemæssige rejser mellem planeter",
        "de": "Fusionskraft, regelmäßige Reisen zwischen Planeten",
        "es": "Energía de fusión, viajes rutinarios entre planetas",
        "fr": "Énergie de fusion, voyages interplanétaires courants",
        "pt": "Energia de fusão, viagens rotineiras entre planetas",
        "sv": "Fusionskraft, rutinmässiga resor mellan planeter"
    },
    "GM only": {
        "cs": "Jen PJ",
        "da": "Kun spilleder",
        "de": "Nur SL",
        "es": "Solo DJ",
        "fr": "MJ uniquement",
        "pt": "Só o mestre",
        "sv": "Endast spelledare"
    },
    "Gas giant": {
        "cs": "Plynný obr",
        "da": "Gaskæmpe",
        "de": "Gasriese",
        "es": "Gigante gaseoso",
        "fr": "Géante gazeuse",
        "pt": "Gigante gasoso",
        "sv": "Gasjätte"
    },
    "Gas giants": {
        "cs": "Plynní obři",
        "da": "Gaskæmper",
        "de": "Gasriesen",
        "es": "Gigantes gaseosos",
        "fr": "Géantes gazeuses",
        "pt": "Gigantes gasosos",
        "sv": "Gasjättar"
    },
    "Generate a random name": {
        "cs": "Vygenerovat náhodné jméno",
        "da": "Generér et tilfældigt navn",
        "de": "Zufälligen Namen erzeugen",
        "es": "Generar un nombre aleatorio",
        "fr": "Générer un nom aléatoire",
        "pt": "Gerar um nome aleatório",
        "sv": "Generera ett slumpmässigt namn"
    },
    "Generating star systems…": {
        "cs": "Generují se hvězdné soustavy…",
        "da": "Genererer stjernesystemer…",
        "de": "Sternsysteme werden erzeugt …",
        "es": "Generando sistemas estelares…",
        "fr": "Génération des systèmes stellaires…",
        "pt": "Gerando sistemas estelares…",
        "sv": "Genererar stjärnsystem…"
    },
    "Giant": {
        "cs": "Obr",
        "da": "Kæmpe",
        "de": "Riese",
        "es": "Gigante",
        "fr": "Géante",
        "pt": "Gigante",
        "sv": "Jätte"
    },
    "Gives every rocky and icy moon a surface generated the way a planet's is, with its own globe, clouds, weather and surface map, rather than one of a few shared moon textures. Gas giants' large moons are always drawn this way. Small moons get a coarser globe until you zoom to them. Applies to planetary systems opened afterwards.": {
        "cs": "Dá každému kamennému a ledovému měsíci povrch generovaný jako u planety, s vlastním glóbem, mraky, počasím a mapou povrchu namísto jedné z několika společných textur měsíců. Velké měsíce plynných obrů se kreslí takto vždy. Malé měsíce mají hrubší glóbus, dokud k nim nepřiblížíte. Platí pro planetární soustavy otevřené poté.",
        "da": "Giver hver klippe- og ismåne en overflade, der genereres som en planets, med egen globus, skyer, vejr og overfladekort i stedet for en af nogle få fælles måneteksturer. Gaskæmpers store måner tegnes altid sådan. Små måner får en grovere globus, til du zoomer ind på dem. Gælder for planetsystemer, der åbnes bagefter.",
        "de": "Gibt jedem Gesteins- und Eismond eine Oberfläche, die wie die eines Planeten erzeugt wird, mit eigenem Globus, Wolken, Wetter und Oberflächenkarte statt einer von wenigen gemeinsamen Mondtexturen. Große Monde von Gasriesen werden immer so gezeichnet. Kleine Monde erhalten einen gröberen Globus, bis du an sie heranzoomst. Gilt für danach geöffnete Planetensysteme.",
        "es": "Da a cada luna rocosa o helada una superficie generada como la de un planeta, con su propio globo, nubes, clima y mapa de superficie, en lugar de una de unas pocas texturas lunares compartidas. Las lunas grandes de los gigantes gaseosos siempre se dibujan así. Las lunas pequeñas tienen un globo más tosco hasta que te acercas a ellas. Se aplica a los sistemas planetarios que se abran después.",
        "fr": "Donne à chaque lune rocheuse ou glacée une surface générée comme celle d’une planète, avec son propre globe, ses nuages, sa météo et sa carte de surface, plutôt qu’une des quelques textures de lune partagées. Les grandes lunes des géantes gazeuses sont toujours dessinées ainsi. Les petites lunes ont un globe plus grossier jusqu’à ce que vous zoomiez dessus. S’applique aux systèmes planétaires ouverts ensuite.",
        "pt": "Dá a cada lua rochosa e gelada uma superfície gerada como a de um planeta, com globo, nuvens, clima e mapa da superfície próprios, em vez de uma das poucas texturas de lua compartilhadas. As grandes luas dos gigantes gasosos são sempre desenhadas assim. Luas pequenas recebem um globo mais grosseiro até você ampliar nelas. Vale para os sistemas planetários abertos depois.",
        "sv": "Ger varje sten- och ismåne en yta som genereras som en planets, med egen glob, moln, väder och ytkarta i stället för en av några få gemensamma måntexturer. Gasjättars stora månar ritas alltid så. Små månar får en grövre glob tills du zoomar in på dem. Gäller planetsystem som öppnas efteråt."
    },
    "Glacier": {
        "cs": "Ledovec",
        "da": "Gletsjer",
        "de": "Gletscher",
        "es": "Glaciar",
        "fr": "Glacier",
        "pt": "Geleira",
        "sv": "Glaciär"
    },
    "Globe resolution:": {
        "cs": "Rozlišení glóbu:",
        "da": "Globusopløsning:",
        "de": "Globusauflösung:",
        "es": "Resolución del globo:",
        "fr": "Résolution du globe :",
        "pt": "Resolução do globo:",
        "sv": "Globupplösning:"
    },
    "Weather: %@": {
        "cs": "Počasí: %@",
        "da": "Vejr: %@",
        "de": "Wetter: %@",
        "es": "Clima: %@",
        "fr": "Météo : %@",
        "pt": "Clima: %@",
        "sv": "Väder: %@"
    },
    "Weather: Off": {
        "cs": "Počasí: vyp.",
        "da": "Vejr: Fra",
        "de": "Wetter: Aus",
        "es": "Clima: desactivado",
        "fr": "Météo : aucune",
        "pt": "Clima: Desligado",
        "sv": "Väder: Av"
    },
    "Glowing hydrogen where young, hot stars are being born": {
        "cs": "Zářící vodík, kde se rodí mladé horké hvězdy",
        "da": "Glødende brint, hvor unge, varme stjerner fødes",
        "de": "Leuchtender Wasserstoff, wo junge, heiße Sterne entstehen",
        "es": "Hidrógeno brillante donde nacen estrellas jóvenes y calientes",
        "fr": "Hydrogène luminescent où naissent de jeunes étoiles chaudes",
        "pt": "Hidrogênio brilhante onde nascem estrelas jovens e quentes",
        "sv": "Glödande väte där unga, heta stjärnor föds"
    },
    "Go back to the layout before this one": {
        "cs": "Vrátit se k předchozímu rozvržení",
        "da": "Gå tilbage til layoutet før dette",
        "de": "Zum Layout vor diesem zurückkehren",
        "es": "Vuelve a la disposición anterior a esta",
        "fr": "Revenir à la disposition précédente",
        "pt": "Voltar à disposição anterior a esta",
        "sv": "Gå tillbaka till layouten före den här"
    },
    "Grand plan": {
        "cs": "Velkolepý plán",
        "da": "Storslået plan",
        "de": "Großer Plan",
        "es": "Gran plan",
        "fr": "Grand plan",
        "pt": "Plano monumental",
        "sv": "Storslagen plan"
    },
    "Gravity": {
        "cs": "Gravitace",
        "da": "Tyngdekraft",
        "de": "Schwerkraft",
        "es": "Gravedad",
        "fr": "Gravité",
        "pt": "Gravidade",
        "sv": "Gravitation"
    },
    "Grid": {
        "cs": "Mřížka",
        "da": "Gitter",
        "de": "Raster",
        "es": "Cuadrícula",
        "fr": "Quadrillage",
        "pt": "Grade",
        "sv": "Rutnät"
    },
    "Habitable": {
        "cs": "Obyvatelný",
        "da": "Beboelig",
        "de": "Bewohnbar",
        "es": "Habitable",
        "fr": "Habitables",
        "pt": "Habitável",
        "sv": "Beboelig"
    },
    "Habitable zone": {
        "cs": "Obyvatelná zóna",
        "da": "Beboelig zone",
        "de": "Habitable Zone",
        "es": "Zona habitable",
        "fr": "Zone habitable",
        "pt": "Zona habitável",
        "sv": "Beboelig zon"
    },
    "Heavy": {
        "cs": "Silné",
        "da": "Kraftig",
        "de": "Stark",
        "es": "fuerte",
        "fr": "forte",
        "pt": "forte",
        "sv": "Kraftig"
    },
    "Helium white dwarf": {
        "cs": "Heliový bílý trpaslík",
        "da": "Hvid heliumdværg",
        "de": "Helium-Weißer Zwerg",
        "es": "Enana blanca de helio",
        "fr": "Naine blanche à hélium",
        "pt": "Anã branca de hélio",
        "sv": "Vit heliumdvärg"
    },
    "Herbig Ae/Be star": {
        "cs": "Hvězda Herbig Ae/Be",
        "da": "Herbig Ae/Be-stjerne",
        "de": "Herbig-Ae/Be-Stern",
        "es": "Estrella Herbig Ae/Be",
        "fr": "Étoile de Herbig Ae/Be",
        "pt": "Estrela Herbig Ae/Be",
        "sv": "Herbig Ae/Be-stjärna"
    },
    "Hex map": {
        "cs": "Hexová mapa",
        "da": "Hexkort",
        "de": "Hexkarte",
        "es": "Mapa hexagonal",
        "fr": "Carte hexagonale",
        "pt": "Mapa hexagonal",
        "sv": "Hexkarta"
    },
    "Hide the filters": {
        "cs": "Skrýt filtry",
        "da": "Skjul filtrene",
        "de": "Filter ausblenden",
        "es": "Ocultar los filtros",
        "fr": "Masquer les filtres",
        "pt": "Ocultar os filtros",
        "sv": "Dölj filtren"
    },
    "Hide the side panel": {
        "cs": "Skrýt panel",
        "da": "Skjul sidepanelet",
        "de": "Seitenleiste ausblenden",
        "es": "Ocultar el panel lateral",
        "fr": "Masquer le panneau latéral",
        "pt": "Ocultar o painel lateral",
        "sv": "Dölj sidopanelen"
    },
    "Hops": {
        "cs": "Skoky",
        "da": "Hop",
        "de": "Sprünge",
        "es": "Saltos",
        "fr": "Sauts",
        "pt": "Saltos",
        "sv": "Hopp"
    },
    "Hops of up to %lld parsecs": {
        "cs": "Skoky až %lld parseků",
        "da": "Hop på op til %lld parsec",
        "de": "Sprünge bis %lld Parsec",
        "es": "Saltos de hasta %lld pársecs",
        "fr": "Sauts de %lld parsecs au plus",
        "pt": "Saltos de até %lld parsecs",
        "sv": "Hopp på upp till %lld parsec"
    },
    "Hot": {
        "cs": "Horké",
        "da": "Varm",
        "de": "Heiß",
        "es": "Cálido",
        "fr": "Chaud",
        "pt": "Quente",
        "sv": "Varm"
    },
    "Hot helium white dwarf": {
        "cs": "Horký heliový bílý trpaslík",
        "da": "Varm hvid heliumdværg",
        "de": "Heißer Helium-Weißer Zwerg",
        "es": "Enana blanca caliente de helio",
        "fr": "Naine blanche chaude à hélium",
        "pt": "Anã branca de hélio quente",
        "sv": "Het vit heliumdvärg"
    },
    "Hot subdwarf": {
        "cs": "Horký podtrpaslík",
        "da": "Varm underdværg",
        "de": "Heißer Unterzwerg",
        "es": "Subenana caliente",
        "fr": "Sous-naine chaude",
        "pt": "Subanã quente",
        "sv": "Het underdvärg"
    },
    "How alike the buildings are: one material and roofline throughout, or every building its own": {
        "cs": "Jak jsou si budovy podobné: jeden materiál a tvar střechy všude, nebo každá budova jiná",
        "da": "Hvor ens bygningerne er: ét materiale og én taglinje overalt, eller hver bygning sin egen",
        "de": "Wie ähnlich die Gebäude sind: ein Material und eine Dachform überall oder jedes Gebäude anders",
        "es": "Cuánto se parecen los edificios: un mismo material y tejado en todos, o cada edificio a su manera",
        "fr": "Degré de ressemblance des bâtiments : un seul matériau et une seule ligne de toits partout, ou chaque bâtiment différent",
        "pt": "Quão parecidos são os edifícios: um só material e telhado em tudo, ou cada edifício do seu jeito",
        "sv": "Hur lika byggnaderna är: ett material och en taklinje överallt, eller varje byggnad sin egen"
    },
    "How this world's cities are built": {
        "cs": "Jak jsou postavena města tohoto světa",
        "da": "Hvordan denne verdens byer er bygget",
        "de": "Wie die Städte dieser Welt gebaut sind",
        "es": "Cómo se construyen las ciudades de este mundo",
        "fr": "Comment les villes de ce monde sont bâties",
        "pt": "Como as cidades deste mundo são construídas",
        "sv": "Hur den här världens städer är byggda"
    },
    "Hub": {
        "cs": "Uzel",
        "da": "Knudepunkt",
        "de": "Drehkreuz",
        "es": "Principal",
        "fr": "Principal",
        "pt": "Central",
        "sv": "Knutpunkt"
    },
    "Hydrogen white dwarf": {
        "cs": "Vodíkový bílý trpaslík",
        "da": "Hvid brintdværg",
        "de": "Wasserstoff-Weißer Zwerg",
        "es": "Enana blanca de hidrógeno",
        "fr": "Naine blanche à hydrogène",
        "pt": "Anã branca de hidrogênio",
        "sv": "Vit vätedvärg"
    },
    "Hydrogen–helium": {
        "cs": "Vodík–helium",
        "da": "Brint–helium",
        "de": "Wasserstoff–Helium",
        "es": "Hidrógeno–helio",
        "fr": "Hydrogène–hélium",
        "pt": "Hidrogênio–hélio",
        "sv": "Väte–helium"
    },
    "Hypergiant": {
        "cs": "Hyperobr",
        "da": "Hyperkæmpe",
        "de": "Hyperriese",
        "es": "Hipergigante",
        "fr": "Hypergéante",
        "pt": "Hipergigante",
        "sv": "Hyperjätte"
    },
    "Ice giant": {
        "cs": "Ledový obr",
        "da": "Iskæmpe",
        "de": "Eisriese",
        "es": "Gigante helado",
        "fr": "Géante de glace",
        "pt": "Gigante de gelo",
        "sv": "Isjätte"
    },
    "Icosahedral Map": {
        "cs": "Dvacetistěnná mapa",
        "da": "Ikosaederkort",
        "de": "Ikosaederkarte",
        "es": "Mapa icosaédrico",
        "fr": "Carte icosaédrique",
        "pt": "Mapa Icosaédrico",
        "sv": "Ikosaederkarta"
    },
    "In the eye of a tropical cyclone": {
        "cs": "V oku tropické cyklóny",
        "da": "I øjet af en tropisk cyklon",
        "de": "Im Auge eines tropischen Wirbelsturms",
        "es": "En el ojo de un ciclón tropical",
        "fr": "Dans l’œil d’un cyclone tropical",
        "pt": "No olho de um ciclone tropical",
        "sv": "I ögat på en tropisk cyklon"
    },
    "In use": {
        "cs": "Používá se",
        "da": "I brug",
        "de": "In Verwendung",
        "es": "En uso",
        "fr": "Utilisée",
        "pt": "Em uso",
        "sv": "Används"
    },
    "Inclination": {
        "cs": "Sklon dráhy",
        "da": "Inklination",
        "de": "Bahnneigung",
        "es": "Inclinación",
        "fr": "Inclinaison",
        "pt": "Inclinação",
        "sv": "Inklination"
    },
    "Inclined": {
        "cs": "Skloněná",
        "da": "Hældende",
        "de": "Geneigt",
        "es": "Inclinado",
        "fr": "Inclinée",
        "pt": "Inclinada",
        "sv": "Lutande"
    },
    "Include world data below the map (PDF)": {
        "cs": "Zahrnout data světa pod mapu (PDF)",
        "da": "Medtag verdensdata under kortet (PDF)",
        "de": "Weltdaten unter der Karte einfügen (PDF)",
        "es": "Incluir los datos del mundo bajo el mapa (PDF)",
        "fr": "Inclure les données du monde sous la carte (PDF)",
        "pt": "Incluir dados do mundo abaixo do mapa (PDF)",
        "sv": "Ta med världsdata under kartan (PDF)"
    },
    "Inner limit": {
        "cs": "Vnitřní mez",
        "da": "Indre grænse",
        "de": "Innere Grenze",
        "es": "Límite interior",
        "fr": "Limite intérieure",
        "pt": "Limite interno",
        "sv": "Inre gräns"
    },
    "Intl": {
        "cs": "Mez.",
        "da": "Intl.",
        "de": "Intl.",
        "es": "Intl.",
        "fr": "Intl",
        "pt": "Intl",
        "sv": "Intl."
    },
    "Island": {
        "cs": "Ostrov",
        "da": "Ø",
        "de": "Insel",
        "es": "Isla",
        "fr": "Île",
        "pt": "Ilha",
        "sv": "Ö"
    },
    "Ix Ex Cx": {
        "cs": "Ix Ex Cx",
        "da": "Ix Ex Cx",
        "de": "Ix Ex Cx",
        "es": "Ix Ex Cx",
        "fr": "Ix Ex Cx",
        "pt": "Ix Ex Cx",
        "sv": "Ix Ex Cx"
    },
    "JPEG Image…": {
        "cs": "Obrázek JPEG…",
        "da": "JPEG-billede…",
        "de": "JPEG-Bild …",
        "es": "Imagen JPEG…",
        "fr": "Image JPEG…",
        "pt": "Imagem JPEG…",
        "sv": "JPEG-bild…"
    },
    "Jupiter-like gas giant": {
        "cs": "Plynný obr podobný Jupiteru",
        "da": "Jupiterlignende gaskæmpe",
        "de": "Jupiterartiger Gasriese",
        "es": "Gigante gaseoso tipo Júpiter",
        "fr": "Géante gazeuse de type Jupiter",
        "pt": "Gigante gasoso tipo Júpiter",
        "sv": "Jupiterliknande gasjätte"
    },
    "Keep Mine": {
        "cs": "Ponechat moji",
        "da": "Behold min",
        "de": "Meine behalten",
        "es": "Conservar la mía",
        "fr": "Garder la mienne",
        "pt": "Manter a Minha",
        "sv": "Behåll min"
    },
    "Kind": {
        "cs": "Druh",
        "da": "Type",
        "de": "Art",
        "es": "Categoría",
        "fr": "Genre",
        "pt": "Categoria",
        "sv": "Typ"
    },
    "L dwarf (brown dwarf)": {
        "cs": "Trpaslík L (hnědý)",
        "da": "L-dværg (brun dværg)",
        "de": "L-Zwerg (Brauner Zwerg)",
        "es": "Enana L (enana marrón)",
        "fr": "Naine L (naine brune)",
        "pt": "Anã L (anã marrom)",
        "sv": "L-dvärg (brun dvärg)"
    },
    "Landing pad": {
        "cs": "Přistávací plošina",
        "da": "Landingsplads",
        "de": "Landeplatz",
        "es": "Plataforma de aterrizaje",
        "fr": "Aire d’atterrissage",
        "pt": "Plataforma de pouso",
        "sv": "Landningsplatta"
    },
    "Landmark": {
        "cs": "Orientační bod",
        "da": "Vartegn",
        "de": "Wahrzeichen",
        "es": "Lugar de interés",
        "fr": "Site remarquable",
        "pt": "Marco",
        "sv": "Landmärke"
    },
    "Lay the system out again: TravellerMap's world stays as listed, and everything generated round it is drawn afresh": {
        "cs": "Rozvrhnout soustavu znovu: svět z TravellerMap zůstane podle seznamu a vše vygenerované kolem něj se vytvoří znovu",
        "da": "Læg systemet ud igen: TravellerMaps verden forbliver som opført, og alt genereret omkring den tegnes på ny",
        "de": "Das System neu anlegen: Die Welt von TravellerMap bleibt wie gelistet, alles darum herum Erzeugte wird neu gezogen",
        "es": "Vuelve a disponer el sistema: el mundo de TravellerMap queda como figura, y todo lo generado a su alrededor se crea de nuevo",
        "fr": "Redisposer le système : le monde de TravellerMap reste tel qu’indiqué, et tout ce qui est généré autour est refait",
        "pt": "Redispor o sistema: o mundo do TravellerMap fica como listado, e tudo o que foi gerado em torno dele é sorteado de novo",
        "sv": "Lägg ut systemet igen: TravellerMaps värld förblir som listad, och allt genererat runt den ritas på nytt"
    },
    "Lay this system out again?": {
        "cs": "Rozvrhnout tuto soustavu znovu?",
        "da": "Læg dette system ud igen?",
        "de": "Dieses System neu anlegen?",
        "es": "¿Volver a disponer este sistema?",
        "fr": "Redisposer ce système ?",
        "pt": "Redispor este sistema?",
        "sv": "Lägga ut det här systemet igen?"
    },
    "Laying out %@…": {
        "cs": "Rozvrhuje se %@…",
        "da": "Lægger %@ ud…",
        "de": "%@ wird angelegt …",
        "es": "Trazando %@…",
        "fr": "Tracé de %@…",
        "pt": "Traçando %@…",
        "sv": "Lägger ut %@…"
    },
    "Layout %lld": {
        "cs": "Rozvržení %lld",
        "da": "Layout %lld",
        "de": "Layout %lld",
        "es": "Disposición %lld",
        "fr": "Disposition %lld",
        "pt": "Disposição %lld",
        "sv": "Layout %lld"
    },
    "Leading trojan": {
        "cs": "Předbíhající trojan",
        "da": "Forreste trojaner",
        "de": "Vorauseilender Trojaner",
        "es": "Troyano delantero",
        "fr": "Troyen avant",
        "pt": "Troiano à frente",
        "sv": "Främre trojan"
    },
    "Liberal democracy": {
        "cs": "Liberální demokracie",
        "da": "Liberalt demokrati",
        "de": "Liberale Demokratie",
        "es": "Democracia liberal",
        "fr": "Démocratie libérale",
        "pt": "Democracia liberal",
        "sv": "Liberal demokrati"
    },
    "Licensed": {
        "cs": "Na povolení",
        "da": "Med tilladelse",
        "de": "Lizenziert",
        "es": "Con licencia",
        "fr": "Sous licence",
        "pt": "Com licença",
        "sv": "Licensierat"
    },
    "Light": {
        "cs": "Slabé",
        "da": "Let",
        "de": "Leicht",
        "es": "ligera",
        "fr": "faible",
        "pt": "fraca",
        "sv": "Lätt"
    },
    "Light walls, broad low roofs with deep eaves, lush planting": {
        "cs": "Světlé zdi, široké nízké střechy s hlubokými přesahy, bujná zeleň",
        "da": "Lyse vægge, brede lave tage med dybe udhæng, frodig beplantning",
        "de": "Helle Wände, breite flache Dächer mit tiefem Überstand, üppige Bepflanzung",
        "es": "Muros claros, tejados amplios y bajos con aleros profundos, vegetación exuberante",
        "fr": "Murs clairs, larges toits bas aux avant-toits profonds, végétation luxuriante",
        "pt": "Paredes claras, telhados largos e baixos com beirais fundos, vegetação exuberante",
        "sv": "Ljusa väggar, breda låga tak med djupa takutsprång, frodig grönska"
    },
    "Loading sectors…": {
        "cs": "Načítají se sektory…",
        "da": "Indlæser sektorer…",
        "de": "Sektoren werden geladen …",
        "es": "Cargando sectores…",
        "fr": "Chargement des secteurs…",
        "pt": "Carregando setores…",
        "sv": "Läser in sektorer…"
    },
    "Location": {
        "cs": "Poloha",
        "da": "Placering",
        "de": "Lage",
        "es": "Ubicación",
        "fr": "Emplacement",
        "pt": "Localização",
        "sv": "Läge"
    },
    "Long. asc. node": {
        "cs": "Délka vzest. uzlu",
        "da": "Opst. knudes længde",
        "de": "Länge aufst. Knoten",
        "es": "Long. nodo asc.",
        "fr": "Long. du nœud asc.",
        "pt": "Long. nodo asc.",
        "sv": "Upst. nodens longitud"
    },
    "Longest hop": {
        "cs": "Nejdelší skok",
        "da": "Længste hop",
        "de": "Längster Sprung",
        "es": "Salto más largo",
        "fr": "Plus long saut",
        "pt": "Maior salto",
        "sv": "Längsta hopp"
    },
    "Looking for world maps…": {
        "cs": "Hledají se mapy světů…",
        "da": "Leder efter verdenskort…",
        "de": "Weltkarten werden gesucht …",
        "es": "Buscando mapas del mundo…",
        "fr": "Recherche des cartes des mondes…",
        "pt": "Procurando mapas dos mundos…",
        "sv": "Letar efter världskartor…"
    },
    "Loop at the north pole": {
        "cs": "Očko na severním pólu",
        "da": "Øje ved nordpolen",
        "de": "Öse am Nordpol",
        "es": "Argolla en el polo norte",
        "fr": "Anneau au pôle nord",
        "pt": "Argola no polo norte",
        "sv": "Ögla vid nordpolen"
    },
    "Luminosity": {
        "cs": "Zářivý výkon",
        "da": "Lysstyrke",
        "de": "Leuchtkraft",
        "es": "Luminosidad",
        "fr": "Luminosité",
        "pt": "Luminosidade",
        "sv": "Luminositet"
    },
    "MS-type star": {
        "cs": "Hvězda typu MS",
        "da": "MS-stjerne",
        "de": "MS-Stern",
        "es": "Estrella de tipo MS",
        "fr": "Étoile de type MS",
        "pt": "Estrela tipo MS",
        "sv": "MS-stjärna"
    },
    "Magnetar": {
        "cs": "Magnetar",
        "da": "Magnetar",
        "de": "Magnetar",
        "es": "Magnetar",
        "fr": "Magnétar",
        "pt": "Magnetar",
        "sv": "Magnetar"
    },
    "Main-sequence star": {
        "cs": "Hvězda hlavní posloupnosti",
        "da": "Hovedseriestjerne",
        "de": "Hauptreihenstern",
        "es": "Estrella de la secuencia principal",
        "fr": "Étoile de la séquence principale",
        "pt": "Estrela da sequência principal",
        "sv": "Huvudseriestjärna"
    },
    "Manufacturing": {
        "cs": "Zpracovatelský průmysl",
        "da": "Fremstilling",
        "de": "Industrie",
        "es": "Manufactura",
        "fr": "Industrie manufacturière",
        "pt": "Indústria",
        "sv": "Tillverkning"
    },
    "Markdown: **bold**, *italic*, # headings, - lists, > quotes, `code`": {
        "cs": "Markdown: **tučně**, *kurzívou*, # nadpisy, - seznamy, > citace, `kód`",
        "da": "Markdown: **fed**, *kursiv*, # overskrifter, - lister, > citater, `kode`",
        "de": "Markdown: **fett**, *kursiv*, # Überschriften, - Listen, > Zitate, `Code`",
        "es": "Markdown: **negrita**, *cursiva*, # títulos, - listas, > citas, `código`",
        "fr": "Markdown : **gras**, *italique*, # titres, - listes, > citations, `code`",
        "pt": "Markdown: **negrito**, *itálico*, # títulos, - listas, > citações, `código`",
        "sv": "Markdown: **fet**, *kursiv*, # rubriker, - listor, > citat, `kod`"
    },
    "Mass": {
        "cs": "Hmotnost",
        "da": "Masse",
        "de": "Masse",
        "es": "Masa",
        "fr": "Masse",
        "pt": "Massa",
        "sv": "Massa"
    },
    "Metal-polluted white dwarf": {
        "cs": "Kovy znečištěný bílý trpaslík",
        "da": "Metalforurenet hvid dværg",
        "de": "Metallverunreinigter Weißer Zwerg",
        "es": "Enana blanca contaminada por metales",
        "fr": "Naine blanche polluée par des métaux",
        "pt": "Anã branca poluída por metais",
        "sv": "Metallförorenad vit dvärg"
    },
    "Metalworking, writing, early cities": {
        "cs": "Zpracování kovů, písmo, první města",
        "da": "Metalbearbejdning, skrift, tidlige byer",
        "de": "Metallverarbeitung, Schrift, frühe Städte",
        "es": "Metalurgia, escritura, primeras ciudades",
        "fr": "Métallurgie, écriture, premières villes",
        "pt": "Metalurgia, escrita, primeiras cidades",
        "sv": "Metallbearbetning, skrift, tidiga städer"
    },
    "Milieu": {
        "cs": "Milieu",
        "da": "Milieu",
        "de": "Milieu",
        "es": "Milieu",
        "fr": "Milieu",
        "pt": "Milieu",
        "sv": "Miljö"
    },
    "Military base": {
        "cs": "Vojenská základna",
        "da": "Militærbase",
        "de": "Militärbasis",
        "es": "Base militar",
        "fr": "Base militaire",
        "pt": "Base militar",
        "sv": "Militärbas"
    },
    "Militia": {
        "cs": "Milice",
        "da": "Milits",
        "de": "Miliz",
        "es": "Milicia",
        "fr": "Milice",
        "pt": "Milícia",
        "sv": "Milis"
    },
    "Mira variable": {
        "cs": "Proměnná typu Mira",
        "da": "Mira-variabel",
        "de": "Mira-Veränderlicher",
        "es": "Variable Mira",
        "fr": "Variable de type Mira",
        "pt": "Variável Mira",
        "sv": "Miravariabel"
    },
    "Moderate": {
        "cs": "Mírné",
        "da": "Moderat",
        "de": "Mäßig",
        "es": "moderada",
        "fr": "modérée",
        "pt": "moderada",
        "sv": "Måttlig"
    },
    "Modern": {
        "cs": "Moderní",
        "da": "Moderne",
        "de": "Modern",
        "es": "Moderna",
        "fr": "Moderne",
        "pt": "Moderna",
        "sv": "Modern"
    },
    "Monument": {
        "cs": "Památník",
        "da": "Monument",
        "de": "Denkmal",
        "es": "Monumento",
        "fr": "Monument",
        "pt": "Monumento",
        "sv": "Monument"
    },
    "Moon": {
        "cs": "Měsíc",
        "da": "Måne",
        "de": "Mond",
        "es": "Luna",
        "fr": "Lune",
        "pt": "Lua",
        "sv": "Måne"
    },
    "Moon data": {
        "cs": "Data měsíce",
        "da": "Månedata",
        "de": "Monddaten",
        "es": "Datos de la luna",
        "fr": "Données de la lune",
        "pt": "Dados da lua",
        "sv": "Måndata"
    },
    "Moon of %@": {
        "cs": "Měsíc %@",
        "da": "Måne af %@",
        "de": "Mond von %@",
        "es": "Luna de %@",
        "fr": "Lune de %@",
        "pt": "Lua de %@",
        "sv": "Måne till %@"
    },
    "Moons": {
        "cs": "Měsíce",
        "da": "Måner",
        "de": "Monde",
        "es": "Lunas",
        "fr": "Lunes",
        "pt": "Luas",
        "sv": "Månar"
    },
    "Most firearms banned; hunting arms by permit only": {
        "cs": "Většina střelných zbraní zakázána; lovecké zbraně jen na povolení",
        "da": "De fleste skydevåben forbudt; jagtvåben kun med tilladelse",
        "de": "Die meisten Schusswaffen verboten; Jagdwaffen nur mit Genehmigung",
        "es": "La mayoría de las armas de fuego prohibidas; armas de caza solo con permiso",
        "fr": "La plupart des armes à feu interdites ; armes de chasse sur permis uniquement",
        "pt": "Maioria das armas de fogo proibida; armas de caça só com autorização",
        "sv": "De flesta skjutvapen förbjudna; jaktvapen endast med tillstånd"
    },
    "Most weapons legal; explosives and heavy arms banned": {
        "cs": "Většina zbraní legální; výbušniny a těžké zbraně zakázány",
        "da": "De fleste våben lovlige; sprængstoffer og tunge våben forbudt",
        "de": "Die meisten Waffen legal; Sprengstoffe und schwere Waffen verboten",
        "es": "La mayoría de las armas son legales; explosivos y armas pesadas prohibidos",
        "fr": "La plupart des armes légales ; explosifs et armes lourdes interdits",
        "pt": "Maioria das armas legal; explosivos e armas pesadas proibidos",
        "sv": "De flesta vapen lagliga; sprängämnen och tunga vapen förbjudna"
    },
    "Mostly cloudy": {
        "cs": "Převážně oblačno",
        "da": "Overvejende skyet",
        "de": "Überwiegend bewölkt",
        "es": "Mayormente nublado",
        "fr": "Plutôt nuageux",
        "pt": "Predominantemente nublado",
        "sv": "Mestadels molnigt"
    },
    "Mount": {
        "cs": "Držák",
        "da": "Holder",
        "de": "Halterung",
        "es": "Soporte",
        "fr": "Fixation",
        "pt": "Suporte",
        "sv": "Fäste"
    },
    "Mount:": {
        "cs": "Držák:",
        "da": "Holder:",
        "de": "Halterung:",
        "es": "Soporte:",
        "fr": "Fixation :",
        "pt": "Suporte:",
        "sv": "Fäste:"
    },
    "Mountain": {
        "cs": "Hora",
        "da": "Bjerg",
        "de": "Berg",
        "es": "Montaña",
        "fr": "Montagne",
        "pt": "Montanha",
        "sv": "Berg"
    },
    "N": {
        "cs": "S",
        "da": "N",
        "de": "N",
        "es": "N",
        "fr": "N",
        "pt": "N",
        "sv": "N"
    },
    "NE": {
        "cs": "SV",
        "da": "NØ",
        "de": "NO",
        "es": "NE",
        "fr": "NE",
        "pt": "NE",
        "sv": "NO"
    },
    "NW": {
        "cs": "SZ",
        "da": "NV",
        "de": "NW",
        "es": "NO",
        "fr": "NO",
        "pt": "NO",
        "sv": "NV"
    },
    "Navy": {
        "cs": "Loďstvo",
        "da": "Flåde",
        "de": "Marine",
        "es": "Armada",
        "fr": "Marine",
        "pt": "Marinha",
        "sv": "Flotta"
    },
    "Nebulae": {
        "cs": "Mlhoviny",
        "da": "Tåger",
        "de": "Nebel",
        "es": "Nebulosas",
        "fr": "Nébuleuses",
        "pt": "Nebulosas",
        "sv": "Nebulosor"
    },
    "Neighbouring sectors are listed first.": {
        "cs": "Sousední sektory jsou uvedeny nahoře.",
        "da": "Nabosektorer vises først.",
        "de": "Benachbarte Sektoren stehen oben.",
        "es": "Los sectores vecinos aparecen primero.",
        "fr": "Les secteurs voisins sont listés en premier.",
        "pt": "Setores vizinhos aparecem primeiro.",
        "sv": "Grannsektorer visas först."
    },
    "Neutron star": {
        "cs": "Neutronová hvězda",
        "da": "Neutronstjerne",
        "de": "Neutronenstern",
        "es": "Estrella de neutrones",
        "fr": "Étoile à neutrons",
        "pt": "Estrela de nêutrons",
        "sv": "Neutronstjärna"
    },
    "New Traveller Universe": {
        "cs": "Nový vesmír Traveller",
        "da": "Nyt Traveller-univers",
        "de": "Neues Traveller-Universum",
        "es": "Nuevo universo de Traveller",
        "fr": "Nouvel univers Traveller",
        "pt": "Novo Universo Traveller",
        "sv": "Nytt Traveller-universum"
    },
    "New ones are placed in their stead. Ports, bases, outposts and landmarks are kept.": {
        "cs": "Na jejich místo se umístí nová. Přístavy, základny, stanoviště a orientační body zůstanou.",
        "da": "Nye placeres i stedet. Havne, baser, forposter og vartegn beholdes.",
        "de": "An ihrer Stelle werden neue platziert. Häfen, Basen, Außenposten und Wahrzeichen bleiben erhalten.",
        "es": "Se colocan otros nuevos en su lugar. Se conservan los puertos, bases, puestos avanzados y lugares de interés.",
        "fr": "De nouveaux sont placés à leur place. Les ports, bases, avant-postes et sites remarquables sont conservés.",
        "pt": "Novas são posicionadas no lugar delas. Portos, bases, postos avançados e marcos são mantidos.",
        "sv": "Nya placeras i deras ställe. Hamnar, baser, utposter och landmärken behålls."
    },
    "New place": {
        "cs": "Nové místo",
        "da": "Nyt sted",
        "de": "Neuer Ort",
        "es": "Nuevo lugar",
        "fr": "Nouveau lieu",
        "pt": "Novo lugar",
        "sv": "Ny plats"
    },
    "Night": {
        "cs": "Noc",
        "da": "Nat",
        "de": "Nacht",
        "es": "Noche",
        "fr": "Nuit",
        "pt": "Noite",
        "sv": "Natt"
    },
    "Night sides": {
        "cs": "Noční strany",
        "da": "Natsider",
        "de": "Nachtseiten",
        "es": "Lados nocturnos",
        "fr": "Faces nocturnes",
        "pt": "Lados noturnos",
        "sv": "Nattsidor"
    },
    "Nitrogen": {
        "cs": "Dusík",
        "da": "Kvælstof",
        "de": "Stickstoff",
        "es": "Nitrógeno",
        "fr": "Azote",
        "pt": "Nitrogênio",
        "sv": "Kväve"
    },
    "Nitrogen Wolf–Rayet star": {
        "cs": "Dusíková Wolf–Rayet",
        "da": "Kvælstof-Wolf–Rayet-stjerne",
        "de": "Stickstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de nitrógeno",
        "fr": "Étoile Wolf–Rayet azotée",
        "pt": "Estrela Wolf–Rayet de nitrogênio",
        "sv": "Kväve-Wolf–Rayet-stjärna"
    },
    "Nitrogen–methane": {
        "cs": "Dusík–metan",
        "da": "Kvælstof–metan",
        "de": "Stickstoff–Methan",
        "es": "Nitrógeno–metano",
        "fr": "Azote–méthane",
        "pt": "Nitrogênio–metano",
        "sv": "Kväve–metan"
    },
    "Nitrogen–oxygen": {
        "cs": "Dusík–kyslík",
        "da": "Kvælstof–ilt",
        "de": "Stickstoff–Sauerstoff",
        "es": "Nitrógeno–oxígeno",
        "fr": "Azote–oxygène",
        "pt": "Nitrogênio–oxigênio",
        "sv": "Kväve–syre"
    },
    "No": {
        "cs": "Ne",
        "da": "Nej",
        "de": "Nein",
        "es": "No",
        "fr": "Non",
        "pt": "Não",
        "sv": "Nej"
    },
    "No cyclones": {
        "cs": "Žádné cyklóny",
        "da": "Ingen cykloner",
        "de": "Keine Zyklone",
        "es": "Sin ciclones",
        "fr": "Aucun cyclone",
        "pt": "Sem ciclones",
        "sv": "Inga cykloner"
    },
    "No laws on owning or carrying weapons": {
        "cs": "Žádné zákony o vlastnění či nošení zbraní",
        "da": "Ingen love om at eje eller bære våben",
        "de": "Keine Gesetze zu Besitz oder Tragen von Waffen",
        "es": "Sin leyes sobre la posesión o el porte de armas",
        "fr": "Aucune loi sur la détention ou le port d’armes",
        "pt": "Sem leis sobre posse ou porte de armas",
        "sv": "Inga lagar om att äga eller bära vapen"
    },
    "No notes yet": {
        "cs": "Bez poznámek",
        "da": "Ingen noter endnu",
        "de": "Noch keine Notizen",
        "es": "Aún no hay notas",
        "fr": "Aucune note",
        "pt": "Nenhuma nota ainda",
        "sv": "Inga anteckningar än"
    },
    "No notes yet. Add notes with the note buttons beside stars, worlds, moons and places.": {
        "cs": "Zatím žádné poznámky. Přidejte je tlačítky poznámek vedle hvězd, světů, měsíců a míst.",
        "da": "Ingen noter endnu. Tilføj noter med noteknapperne ved siden af stjerner, verdener, måner og steder.",
        "de": "Noch keine Notizen. Füge Notizen mit den Notiztasten neben Sternen, Welten, Monden und Orten hinzu.",
        "es": "Aún no hay notas. Añade notas con los botones de nota junto a estrellas, mundos, lunas y lugares.",
        "fr": "Aucune note. Ajoutez des notes avec les boutons de note à côté des étoiles, mondes, lunes et lieux.",
        "pt": "Nenhuma nota ainda. Adicione notas com os botões de nota ao lado de estrelas, mundos, luas e lugares.",
        "sv": "Inga anteckningar än. Lägg till anteckningar med anteckningsknapparna bredvid stjärnor, världar, månar och platser."
    },
    "No port": {
        "cs": "Bez přístavu",
        "da": "Ingen havn",
        "de": "Kein Hafen",
        "es": "Sin puerto",
        "fr": "Aucun port",
        "pt": "Sem porto",
        "sv": "Ingen hamn"
    },
    "No systems found": {
        "cs": "Nenalezeny žádné soustavy",
        "da": "Ingen systemer fundet",
        "de": "Keine Systeme gefunden",
        "es": "No se encontraron sistemas",
        "fr": "Aucun système trouvé",
        "pt": "Nenhum sistema encontrado",
        "sv": "Inga system hittades"
    },
    "No weather: too little air": {
        "cs": "Bez počasí: málo vzduchu",
        "da": "Intet vejr: for lidt luft",
        "de": "Kein Wetter: zu wenig Luft",
        "es": "Sin meteorología: muy poco aire",
        "fr": "Pas de météo : trop peu d’air",
        "pt": "Sem clima: ar escasso demais",
        "sv": "Inget väder: för lite luft"
    },
    "No: sealed suit": {
        "cs": "Ne: uzavřený oděv",
        "da": "Nej: lukket dragt",
        "de": "Nein: geschlossener Anzug",
        "es": "No: traje sellado",
        "fr": "Non : combinaison étanche",
        "pt": "Não: traje selado",
        "sv": "Nej: sluten dräkt"
    },
    "No: vacuum suit": {
        "cs": "Ne: skafandr",
        "da": "Nej: rumdragt",
        "de": "Nein: Vakuumanzug",
        "es": "No: traje de vacío",
        "fr": "Non : combinaison spatiale",
        "pt": "Não: traje de vácuo",
        "sv": "Nej: rymddräkt"
    },
    "Notes": {
        "cs": "Poznámky",
        "da": "Noter",
        "de": "Notizen",
        "es": "Notas",
        "fr": "Notes",
        "pt": "Notas",
        "sv": "Anteckningar"
    },
    "Notes (shared with players)": {
        "cs": "Poznámky (sdílené s hráči)",
        "da": "Noter (delt med spillere)",
        "de": "Notizen (mit Spielern geteilt)",
        "es": "Notas (compartidas con los jugadores)",
        "fr": "Notes (partagées avec les joueurs)",
        "pt": "Notas (compartilhadas com jogadores)",
        "sv": "Anteckningar (delade med spelare)"
    },
    "Notes, places, ports and data you've set on this system's worlds are kept under the worlds' designations, which may now belong to other worlds or none.": {
        "cs": "Poznámky, místa, přístavy a data, které jste nastavili na světech této soustavy, zůstanou pod označeními světů, která teď mohou patřit jiným světům nebo žádnému.",
        "da": "Noter, steder, havne og data, du har angivet på dette systems verdener, beholdes under verdenernes betegnelser, som nu kan tilhøre andre verdener eller ingen.",
        "de": "Notizen, Orte, Häfen und Daten, die du auf den Welten dieses Systems gesetzt hast, bleiben unter den Bezeichnungen der Welten erhalten, die jetzt zu anderen oder keinen Welten gehören können.",
        "es": "Las notas, lugares, puertos y datos que has definido en los mundos de este sistema se conservan bajo las designaciones de los mundos, que ahora pueden pertenecer a otros mundos o a ninguno.",
        "fr": "Les notes, lieux, ports et données définis sur les mondes de ce système sont conservés sous leurs désignations, qui peuvent désormais appartenir à d’autres mondes ou à aucun.",
        "pt": "Notas, lugares, portos e dados que você definiu nos mundos deste sistema ficam guardados sob as designações dos mundos, que agora podem pertencer a outros mundos ou a nenhum.",
        "sv": "Anteckningar, platser, hamnar och data du har angett på systemets världar behålls under världarnas beteckningar, som nu kan tillhöra andra världar eller ingen."
    },
    "Nuclear power, jet aircraft, early computers": {
        "cs": "Jaderná energie, proudová letadla, první počítače",
        "da": "Atomkraft, jetfly, tidlige computere",
        "de": "Kernkraft, Düsenflugzeuge, frühe Computer",
        "es": "Energía nuclear, aviones a reacción, primeras computadoras",
        "fr": "Énergie nucléaire, avions à réaction, premiers ordinateurs",
        "pt": "Energia nuclear, aviões a jato, primeiros computadores",
        "sv": "Kärnkraft, jetflygplan, tidiga datorer"
    },
    "OBJ Model…": {
        "cs": "Model OBJ…",
        "da": "OBJ-model…",
        "de": "OBJ-Modell …",
        "es": "Modelo OBJ…",
        "fr": "Modèle OBJ…",
        "pt": "Modelo OBJ…",
        "sv": "OBJ-modell…"
    },
    "Oligarchy": {
        "cs": "Oligarchie",
        "da": "Oligarki",
        "de": "Oligarchie",
        "es": "Oligarquía",
        "fr": "Oligarchie",
        "pt": "Oligarquia",
        "sv": "Oligarki"
    },
    "On globe": {
        "cs": "Na glóbu",
        "da": "På globus",
        "de": "Auf Globus",
        "es": "En el globo",
        "fr": "Sur le globe",
        "pt": "No globo",
        "sv": "På globen"
    },
    "Open System": {
        "cs": "Otevřít soustavu",
        "da": "Åbn system",
        "de": "System öffnen",
        "es": "Abrir sistema",
        "fr": "Ouvrir le système",
        "pt": "Abrir Sistema",
        "sv": "Öppna system"
    },
    "Open a universe your GM sent you with Open Universe…, or drop its file on the page.": {
        "cs": "Otevřete vesmír, který vám poslal váš PJ, pomocí Otevřít vesmír…, nebo přetáhněte jeho soubor na stránku.",
        "da": "Åbn et univers, din spilleder har sendt dig, med Åbn univers…, eller slip dets fil på siden.",
        "de": "Öffne ein Universum von deinem SL mit „Universum öffnen …“ oder zieh seine Datei auf die Seite.",
        "es": "Abre un universo que te envió tu DJ con Abrir universo…, o suelta su archivo en la página.",
        "fr": "Ouvrez un univers envoyé par votre MJ avec Ouvrir un univers…, ou déposez son fichier sur la page.",
        "pt": "Abra um universo que seu mestre enviou com Abrir Universo…, ou solte o arquivo dele na página.",
        "sv": "Öppna ett universum som din spelledare har skickat med Öppna universum…, eller släpp dess fil på sidan."
    },
    "Open a universe your GM sent you; a newer copy of one you have replaces it": {
        "cs": "Otevřít vesmír, který vám poslal váš PJ; novější kopie nahradí ten, který máte",
        "da": "Åbn et univers, din spilleder har sendt dig; en nyere kopi af et, du har, erstatter det",
        "de": "Ein Universum von deinem SL öffnen; eine neuere Kopie ersetzt deine vorhandene",
        "es": "Abre un universo que te envió tu DJ; una copia más reciente de uno que ya tienes lo reemplaza",
        "fr": "Ouvrir un univers envoyé par votre MJ ; une copie plus récente d’un univers existant le remplace",
        "pt": "Abra um universo que seu mestre enviou; uma cópia mais recente de um que você já tem o substitui",
        "sv": "Öppna ett universum som din spelledare har skickat; en nyare kopia av ett du har ersätter det"
    },
    "Orbit": {
        "cs": "Dráha",
        "da": "Bane",
        "de": "Umlaufbahn",
        "es": "Órbita",
        "fr": "Orbite",
        "pt": "Órbita",
        "sv": "Bana"
    },
    "Orbital elements": {
        "cs": "Dráhové elementy",
        "da": "Baneelementer",
        "de": "Bahnelemente",
        "es": "Elementos orbitales",
        "fr": "Éléments orbitaux",
        "pt": "Elementos orbitais",
        "sv": "Banelement"
    },
    "Orbits": {
        "cs": "Obíhá",
        "da": "Kredser om",
        "de": "Umkreist",
        "es": "Orbita",
        "fr": "Orbite autour de",
        "pt": "Órbitas",
        "sv": "Kretsar kring"
    },
    "Organic": {
        "cs": "Organické",
        "da": "Organisk",
        "de": "Organisch",
        "es": "Orgánico",
        "fr": "Organique",
        "pt": "Orgânico",
        "sv": "Organisk"
    },
    "Other": {
        "cs": "Ostatní",
        "da": "Andet",
        "de": "Sonstiges",
        "es": "Otro",
        "fr": "Autre",
        "pt": "Outro",
        "sv": "Övrigt"
    },
    "Out of reach at %lld pc": {
        "cs": "Mimo dosah při %lld pc",
        "da": "Uden for rækkevidde ved %lld pc",
        "de": "Außer Reichweite bei %lld pc",
        "es": "Fuera de alcance a %lld pc",
        "fr": "Hors de portée à %lld pc",
        "pt": "Fora de alcance a %lld pc",
        "sv": "Utom räckhåll vid %lld pc"
    },
    "Outline: contour lines and coastlines only, for printing": {
        "cs": "Obrys: jen vrstevnice a pobřeží, pro tisk",
        "da": "Omrids: kun højdekurver og kystlinjer, til udskrivning",
        "de": "Umriss: nur Höhenlinien und Küsten, zum Drucken",
        "es": "Contorno: solo curvas de nivel y costas, para imprimir",
        "fr": "Contours : courbes de niveau et côtes uniquement, pour l’impression",
        "pt": "Contorno: só curvas de nível e litorais, para impressão",
        "sv": "Kontur: bara höjdkurvor och kustlinjer, för utskrift"
    },
    "Outpost": {
        "cs": "Stanoviště",
        "da": "Forpost",
        "de": "Außenposten",
        "es": "Puesto avanzado",
        "fr": "Avant-poste",
        "pt": "Posto avançado",
        "sv": "Utpost"
    },
    "Overcast": {
        "cs": "Zataženo",
        "da": "Overskyet",
        "de": "Bedeckt",
        "es": "Cubierto",
        "fr": "Couvert",
        "pt": "Encoberto",
        "sv": "Mulet"
    },
    "Oxygen Wolf–Rayet star": {
        "cs": "Kyslíková Wolf–Rayet",
        "da": "Ilt-Wolf–Rayet-stjerne",
        "de": "Sauerstoff-Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet de oxígeno",
        "fr": "Étoile Wolf–Rayet oxygénée",
        "pt": "Estrela Wolf–Rayet de oxigênio",
        "sv": "Syre-Wolf–Rayet-stjärna"
    },
    "PDF Document…": {
        "cs": "Dokument PDF…",
        "da": "PDF-dokument…",
        "de": "PDF-Dokument …",
        "es": "Documento PDF…",
        "fr": "Document PDF…",
        "pt": "Documento PDF…",
        "sv": "PDF-dokument…"
    },
    "PNG Image…": {
        "cs": "Obrázek PNG…",
        "da": "PNG-billede…",
        "de": "PNG-Bild …",
        "es": "Imagen PNG…",
        "fr": "Image PNG…",
        "pt": "Imagem PNG…",
        "sv": "PNG-bild…"
    },
    "Partly cloudy": {
        "cs": "Polojasno",
        "da": "Delvis skyet",
        "de": "Teilweise bewölkt",
        "es": "Parcialmente nublado",
        "fr": "Partiellement nuageux",
        "pt": "Parcialmente nublado",
        "sv": "Delvis molnigt"
    },
    "Period": {
        "cs": "Perioda",
        "da": "Omløbstid",
        "de": "Umlaufzeit",
        "es": "Período",
        "fr": "Période",
        "pt": "Período",
        "sv": "Omloppstid"
    },
    "Permissive": {
        "cs": "Volné",
        "da": "Tilladende",
        "de": "Freizügig",
        "es": "Permisivo",
        "fr": "Permissif",
        "pt": "Permissivo",
        "sv": "Tillåtande"
    },
    "Personalist dictatorship": {
        "cs": "Personalistická diktatura",
        "da": "Personalistisk diktatur",
        "de": "Personalistische Diktatur",
        "es": "Dictadura personalista",
        "fr": "Dictature personnelle",
        "pt": "Ditadura personalista",
        "sv": "Personalistisk diktatur"
    },
    "Pinch or use the buttons to zoom; scroll to pan; click a place to edit it": {
        "cs": "Přibližujte sevřením nebo tlačítky; posouvejte posunem; kliknutím na místo jej upravíte",
        "da": "Knib eller brug knapperne for at zoome; rul for at panorere; klik på et sted for at redigere det",
        "de": "Zum Zoomen auf-/zuziehen oder Tasten verwenden; zum Verschieben scrollen; zum Bearbeiten auf einen Ort klicken",
        "es": "Pellizca o usa los botones para hacer zoom; desplázate para mover la vista; haz clic en un lugar para editarlo",
        "fr": "Pincez ou utilisez les boutons pour zoomer ; faites défiler pour vous déplacer ; cliquez sur un lieu pour le modifier",
        "pt": "Use o gesto de pinça ou os botões para zoom; role para mover; clique em um lugar para editá-lo",
        "sv": "Nyp eller använd knapparna för att zooma; skrolla för att panorera; klicka på en plats för att redigera den"
    },
    "Pitched tile and slate roofs, brick, stone and render": {
        "cs": "Strmé taškové a břidlicové střechy, cihla, kámen a omítka",
        "da": "Stejle tegl- og skifertage, mursten, natursten og puds",
        "de": "Ziegel- und Schiefer-Steildächer, Backstein, Naturstein und Putz",
        "es": "Tejados inclinados de teja y pizarra, ladrillo, piedra y revoque",
        "fr": "Toits pentus de tuile et d’ardoise, brique, pierre et enduit",
        "pt": "Telhados inclinados de telha e ardósia, tijolo, pedra e reboco",
        "sv": "Branta tegel- och skiffertak, tegel, natursten och puts"
    },
    "Place Settlements": {
        "cs": "Umístit sídla",
        "da": "Placér bebyggelser",
        "de": "Siedlungen platzieren",
        "es": "Colocar asentamientos",
        "fr": "Placer les localités",
        "pt": "Posicionar Assentamentos",
        "sv": "Placera bosättningar"
    },
    "Place the world's capital, its cities and its towns and villages where people would settle, and choose how its cities are built": {
        "cs": "Umístit hlavní město světa, jeho města, městečka a vesnice tam, kde by se lidé usadili, a zvolit, jak jsou jeho města postavena",
        "da": "Placér verdenens hovedstad, dens byer og dens småbyer og landsbyer, hvor folk ville slå sig ned, og vælg, hvordan dens byer er bygget",
        "de": "Hauptstadt, Städte, Kleinstädte und Dörfer dort platzieren, wo Menschen siedeln würden, und wählen, wie die Städte gebaut sind",
        "es": "Coloca la capital del mundo, sus ciudades, pueblos y aldeas donde la gente se asentaría, y elige cómo se construyen sus ciudades",
        "fr": "Placer la capitale du monde, ses villes, bourgs et villages là où les gens s’installeraient, et choisir comment ses villes sont bâties",
        "pt": "Posiciona a capital do mundo, suas cidades, vilas e aldeias onde as pessoas se assentariam, e escolhe como as cidades são construídas",
        "sv": "Placera världens huvudstad, dess städer och dess orter och byar där människor skulle bosätta sig, och välj hur dess städer är byggda"
    },
    "Places": {
        "cs": "Místa",
        "da": "Steder",
        "de": "Orte",
        "es": "Lugares",
        "fr": "Lieux",
        "pt": "Lugares",
        "sv": "Platser"
    },
    "Plain": {
        "cs": "Pláň",
        "da": "Slette",
        "de": "Ebene",
        "es": "Llanura",
        "fr": "Plaine",
        "pt": "Planície",
        "sv": "Slätt"
    },
    "Planet": {
        "cs": "Planeta",
        "da": "Planet",
        "de": "Planet",
        "es": "Planeta",
        "fr": "Planète",
        "pt": "Planeta",
        "sv": "Planet"
    },
    "Planet surfaces": {
        "cs": "Povrchy planet",
        "da": "Planetoverflader",
        "de": "Planetenoberflächen",
        "es": "Superficies planetarias",
        "fr": "Surfaces planétaires",
        "pt": "Superfícies planetárias",
        "sv": "Planetytor"
    },
    "Planet's star(s)": {
        "cs": "Hvězda (hvězdy) planety",
        "da": "Planetens stjerne(r)",
        "de": "Stern(e) des Planeten",
        "es": "Estrella(s) del planeta",
        "fr": "Étoile(s) de la planète",
        "pt": "Estrela(s) do planeta",
        "sv": "Planetens stjärna/stjärnor"
    },
    "Planetary nebula": {
        "cs": "Planetární mlhovina",
        "da": "Planetarisk tåge",
        "de": "Planetarischer Nebel",
        "es": "Nebulosa planetaria",
        "fr": "Nébuleuse planétaire",
        "pt": "Nebulosa planetária",
        "sv": "Planetarisk nebulosa"
    },
    "Planetary system": {
        "cs": "Planetární soustava",
        "da": "Planetsystem",
        "de": "Planetensystem",
        "es": "Sistema planetario",
        "fr": "Système planétaire",
        "pt": "Sistema planetário",
        "sv": "Planetsystem"
    },
    "Planets": {
        "cs": "Planety",
        "da": "Planeter",
        "de": "Planeten",
        "es": "Planetas",
        "fr": "Planètes",
        "pt": "Planetas",
        "sv": "Planeter"
    },
    "Planning…": {
        "cs": "Plánuje se…",
        "da": "Planlægger…",
        "de": "Wird geplant …",
        "es": "Planificando…",
        "fr": "Planification…",
        "pt": "Planejando…",
        "sv": "Planerar…"
    },
    "Polygon map": {
        "cs": "Polygonová mapa",
        "da": "Polygonkort",
        "de": "Polygonkarte",
        "es": "Mapa poligonal",
        "fr": "Carte polygonale",
        "pt": "Mapa poligonal",
        "sv": "Polygonkarta"
    },
    "Pop. %@": {
        "cs": "Obyv. %@",
        "da": "Indb. %@",
        "de": "Einw. %@",
        "es": "Pob. %@",
        "fr": "Pop. %@",
        "pt": "Pop. %@",
        "sv": "Inv. %@"
    },
    "Port": {
        "cs": "Přístav",
        "da": "Havn",
        "de": "Hafen",
        "es": "Puerto",
        "fr": "Port",
        "pt": "Porto",
        "sv": "Hamn"
    },
    "Port and installations": {
        "cs": "Přístav a zařízení",
        "da": "Havn og anlæg",
        "de": "Hafen und Einrichtungen",
        "es": "Puerto e instalaciones",
        "fr": "Port et installations",
        "pt": "Porto e instalações",
        "sv": "Hamn och anläggningar"
    },
    "Position": {
        "cs": "Poloha",
        "da": "Position",
        "de": "Position",
        "es": "Posición",
        "fr": "Position",
        "pt": "Posição",
        "sv": "Position"
    },
    "Pre-industrial": {
        "cs": "Předprůmyslový",
        "da": "Førindustriel",
        "de": "Vorindustriell",
        "es": "Preindustrial",
        "fr": "Préindustriel",
        "pt": "Pré-industrial",
        "sv": "Förindustriell"
    },
    "Pressure": {
        "cs": "Tlak",
        "da": "Tryk",
        "de": "Druck",
        "es": "Presión",
        "fr": "Pression",
        "pt": "Pressão",
        "sv": "Tryck"
    },
    "Preview": {
        "cs": "Náhled",
        "da": "Forhåndsvisning",
        "de": "Vorschau",
        "es": "Vista previa",
        "fr": "Aperçu",
        "pt": "Prévia",
        "sv": "Förhandsvisning"
    },
    "Previous Layout": {
        "cs": "Předchozí rozvržení",
        "da": "Forrige layout",
        "de": "Vorheriges Layout",
        "es": "Disposición anterior",
        "fr": "Disposition précédente",
        "pt": "Disposição Anterior",
        "sv": "Föregående layout"
    },
    "Primary": {
        "cs": "Hlavní",
        "da": "Primærstjerne",
        "de": "Hauptstern",
        "es": "Primaria",
        "fr": "Primaire",
        "pt": "Primária",
        "sv": "Primärstjärna"
    },
    "Principal world": {
        "cs": "Hlavní svět",
        "da": "Hovedverden",
        "de": "Hauptwelt",
        "es": "Mundo principal",
        "fr": "Monde principal",
        "pt": "Mundo principal",
        "sv": "Huvudvärld"
    },
    "Print or Save PDF…": {
        "cs": "Tisk nebo uložit PDF…",
        "da": "Udskriv eller gem PDF…",
        "de": "Drucken oder als PDF sichern …",
        "es": "Imprimir o guardar PDF…",
        "fr": "Imprimer ou enregistrer en PDF…",
        "pt": "Imprimir ou Salvar PDF…",
        "sv": "Skriv ut eller spara PDF…"
    },
    "Printing, gunpowder, ocean sailing ships": {
        "cs": "Knihtisk, střelný prach, zaoceánské plachetnice",
        "da": "Bogtryk, krudt, oceangående sejlskibe",
        "de": "Buchdruck, Schießpulver, Hochseesegelschiffe",
        "es": "Imprenta, pólvora, veleros oceánicos",
        "fr": "Imprimerie, poudre à canon, navires de haute mer",
        "pt": "Imprensa, pólvora, navios oceânicos à vela",
        "sv": "Boktryck, krut, oceangående segelfartyg"
    },
    "Prograde": {
        "cs": "Přímý",
        "da": "Prograd",
        "de": "Rechtläufig",
        "es": "Prógrado",
        "fr": "Prograde",
        "pt": "Progrado",
        "sv": "Prograd"
    },
    "Prohibited": {
        "cs": "Zakázáno",
        "da": "Forbudt",
        "de": "Verboten",
        "es": "Prohibido",
        "fr": "Interdit",
        "pt": "Proibido",
        "sv": "Förbjudet"
    },
    "Protostar": {
        "cs": "Protohvězda",
        "da": "Protostjerne",
        "de": "Protostern",
        "es": "Protoestrella",
        "fr": "Protoétoile",
        "pt": "Protoestrela",
        "sv": "Protostjärna"
    },
    "Pulsar": {
        "cs": "Pulzar",
        "da": "Pulsar",
        "de": "Pulsar",
        "es": "Púlsar",
        "fr": "Pulsar",
        "pt": "Pulsar",
        "sv": "Pulsar"
    },
    "Put the advisory its worlds' conditions suggest on the system: %@": {
        "cs": "Přiřadit soustavě doporučení, které naznačují podmínky jejích světů: %@",
        "da": "Sæt den rejsevejledning, som verdenernes forhold tilsiger, på systemet: %@",
        "de": "Die von den Bedingungen seiner Welten nahegelegte Warnung auf das System setzen: %@",
        "es": "Asigna al sistema el aviso que sugieren las condiciones de sus mundos: %@",
        "fr": "Appliquer au système le conseil que suggèrent les conditions de ses mondes : %@",
        "pt": "Aplicar ao sistema o alerta que as condições de seus mundos sugerem: %@",
        "sv": "Sätt de reseråd som världarnas förhållanden föreslår på systemet: %@"
    },
    "Put this advisory on the system: %@": {
        "cs": "Přiřadit soustavě toto doporučení: %@",
        "da": "Sæt denne rejsevejledning på systemet: %@",
        "de": "Diese Reisewarnung auf das System setzen: %@",
        "es": "Asigna este aviso al sistema: %@",
        "fr": "Appliquer ce conseil au système : %@",
        "pt": "Aplicar este alerta ao sistema: %@",
        "sv": "Sätt det här reserådet på systemet: %@"
    },
    "RR Lyrae variable": {
        "cs": "Proměnná typu RR Lyrae",
        "da": "RR Lyrae-variabel",
        "de": "RR-Lyrae-Veränderlicher",
        "es": "Variable RR Lyrae",
        "fr": "Variable RR Lyrae",
        "pt": "Variável RR Lyrae",
        "sv": "RR Lyrae-variabel"
    },
    "Radar": {
        "cs": "Radar",
        "da": "Radar",
        "de": "Radar",
        "es": "Radar",
        "fr": "Radar",
        "pt": "Radar",
        "sv": "Radar"
    },
    "Radial": {
        "cs": "Radiální",
        "da": "Radial",
        "de": "Radial",
        "es": "Radial",
        "fr": "Radial",
        "pt": "Radial",
        "sv": "Radiell"
    },
    "Radius": {
        "cs": "Poloměr",
        "da": "Radius",
        "de": "Radius",
        "es": "Radio",
        "fr": "Rayon",
        "pt": "Raio",
        "sv": "Radie"
    },
    "Raining or snowing on": {
        "cs": "Prší nebo sněží na",
        "da": "Regn eller sne over",
        "de": "Regen oder Schnee auf",
        "es": "Llueve o nieva en",
        "fr": "Pluie ou neige sur",
        "pt": "Chovendo ou nevando em",
        "sv": "Regn eller snö över"
    },
    "Random Name": {
        "cs": "Náhodné jméno",
        "da": "Tilfældigt navn",
        "de": "Zufallsname",
        "es": "Nombre aleatorio",
        "fr": "Nom aléatoire",
        "pt": "Nome Aleatório",
        "sv": "Slumpat namn"
    },
    "Range": {
        "cs": "Dosah",
        "da": "Rækkevidde",
        "de": "Spanne",
        "es": "Rango",
        "fr": "Plage",
        "pt": "Faixa",
        "sv": "Räckvidd"
    },
    "Reading world maps…": {
        "cs": "Čtou se mapy světů…",
        "da": "Læser verdenskort…",
        "de": "Weltkarten werden gelesen …",
        "es": "Leyendo mapas del mundo…",
        "fr": "Lecture des cartes des mondes…",
        "pt": "Lendo mapas dos mundos…",
        "sv": "Läser världskartor…"
    },
    "Rectangular Map": {
        "cs": "Obdélníková mapa",
        "da": "Rektangulært kort",
        "de": "Rechteckige Karte",
        "es": "Mapa rectangular",
        "fr": "Carte rectangulaire",
        "pt": "Mapa Retangular",
        "sv": "Rektangulär karta"
    },
    "Red": {
        "cs": "Červená",
        "da": "Rød",
        "de": "Rot",
        "es": "Roja",
        "fr": "Rouge",
        "pt": "Vermelha",
        "sv": "Röd"
    },
    "Red dwarf": {
        "cs": "Rudý trpaslík",
        "da": "Rød dværg",
        "de": "Roter Zwerg",
        "es": "Enana roja",
        "fr": "Naine rouge",
        "pt": "Anã vermelha",
        "sv": "Röd dvärg"
    },
    "Red giant": {
        "cs": "Červený obr",
        "da": "Rød kæmpe",
        "de": "Roter Riese",
        "es": "Gigante roja",
        "fr": "Géante rouge",
        "pt": "Gigante vermelha",
        "sv": "Röd jätte"
    },
    "Red supergiant": {
        "cs": "Červený veleobr",
        "da": "Rød superkæmpe",
        "de": "Roter Überriese",
        "es": "Supergigante roja",
        "fr": "Supergéante rouge",
        "pt": "Supergigante vermelha",
        "sv": "Röd superjätte"
    },
    "Reflection nebula": {
        "cs": "Reflexní mlhovina",
        "da": "Refleksionståge",
        "de": "Reflexionsnebel",
        "es": "Nebulosa de reflexión",
        "fr": "Nébuleuse par réflexion",
        "pt": "Nebulosa de reflexão",
        "sv": "Reflexionsnebulosa"
    },
    "Regenerate": {
        "cs": "Přegenerovat",
        "da": "Generér igen",
        "de": "Neu erzeugen",
        "es": "Regenerar",
        "fr": "Régénérer",
        "pt": "Regenerar",
        "sv": "Generera om"
    },
    "Regional": {
        "cs": "Oblastní",
        "da": "Regional",
        "de": "Regional",
        "es": "Regional",
        "fr": "Régional",
        "pt": "Regional",
        "sv": "Regional"
    },
    "Remarks": {
        "cs": "Poznámky",
        "da": "Bemærkninger",
        "de": "Anmerkungen",
        "es": "Observaciones",
        "fr": "Remarques",
        "pt": "Observações",
        "sv": "Anmärkningar"
    },
    "Remove this waypoint": {
        "cs": "Odebrat tento bod trasy",
        "da": "Fjern dette rutepunkt",
        "de": "Diesen Wegpunkt entfernen",
        "es": "Quitar este punto de paso",
        "fr": "Retirer cette étape",
        "pt": "Remover este ponto de passagem",
        "sv": "Ta bort den här vägpunkten"
    },
    "Removed": {
        "cs": "Odebráno",
        "da": "Fjernet",
        "de": "Entfernt",
        "es": "Eliminado",
        "fr": "Supprimé",
        "pt": "Removidos",
        "sv": "Borttagen"
    },
    "Rename %@": {
        "cs": "Přejmenovat %@",
        "da": "Omdøb %@",
        "de": "%@ umbenennen",
        "es": "Renombrar %@",
        "fr": "Renommer : %@",
        "pt": "Renomear %@",
        "sv": "Byt namn på %@"
    },
    "Rename…": {
        "cs": "Přejmenovat…",
        "da": "Omdøb…",
        "de": "Umbenennen …",
        "es": "Renombrar…",
        "fr": "Renommer…",
        "pt": "Renomear…",
        "sv": "Byt namn…"
    },
    "Replace": {
        "cs": "Nahradit",
        "da": "Erstat",
        "de": "Ersetzen",
        "es": "Reemplazar",
        "fr": "Remplacer",
        "pt": "Substituir",
        "sv": "Ersätt"
    },
    "Replace the cities, towns and villages on the map?": {
        "cs": "Nahradit města, městečka a vesnice na mapě?",
        "da": "Erstat byerne, småbyerne og landsbyerne på kortet?",
        "de": "Städte, Kleinstädte und Dörfer auf der Karte ersetzen?",
        "es": "¿Reemplazar las ciudades, pueblos y aldeas del mapa?",
        "fr": "Remplacer les villes, bourgs et villages de la carte ?",
        "pt": "Substituir as cidades, vilas e aldeias do mapa?",
        "sv": "Ersätta städerna, orterna och byarna på kartan?"
    },
    "Research station": {
        "cs": "Výzkumná stanice",
        "da": "Forskningsstation",
        "de": "Forschungsstation",
        "es": "Estación de investigación",
        "fr": "Station de recherche",
        "pt": "Estação de pesquisa",
        "sv": "Forskningsstation"
    },
    "Reset view": {
        "cs": "Obnovit pohled",
        "da": "Nulstil visning",
        "de": "Ansicht zurücksetzen",
        "es": "Restablecer vista",
        "fr": "Réinitialiser la vue",
        "pt": "Redefinir vista",
        "sv": "Återställ vy"
    },
    "Resonance": {
        "cs": "Rezonance",
        "da": "Resonans",
        "de": "Resonanz",
        "es": "Resonancia",
        "fr": "Résonance",
        "pt": "Ressonância",
        "sv": "Resonans"
    },
    "Restrictive": {
        "cs": "Restriktivní",
        "da": "Restriktiv",
        "de": "Restriktiv",
        "es": "Restrictivo",
        "fr": "Restrictif",
        "pt": "Restritivo",
        "sv": "Restriktiv"
    },
    "Retrograde": {
        "cs": "Zpětný",
        "da": "Retrograd",
        "de": "Rückläufig",
        "es": "Retrógrado",
        "fr": "Rétrograde",
        "pt": "Retrógrado",
        "sv": "Retrograd"
    },
    "Retry": {
        "cs": "Zkusit znovu",
        "da": "Prøv igen",
        "de": "Erneut versuchen",
        "es": "Reintentar",
        "fr": "Réessayer",
        "pt": "Tentar de novo",
        "sv": "Försök igen"
    },
    "Reverse real time": {
        "cs": "Reálný čas zpět",
        "da": "Omvendt realtid",
        "de": "Echtzeit rückwärts",
        "es": "Tiempo real inverso",
        "fr": "Temps réel inversé",
        "pt": "Tempo real reverso",
        "sv": "Omvänd realtid"
    },
    "Review…": {
        "cs": "Projít…",
        "da": "Gennemse…",
        "de": "Prüfen …",
        "es": "Revisar…",
        "fr": "Examiner…",
        "pt": "Revisar…",
        "sv": "Granska…"
    },
    "Right-click to rename": {
        "cs": "Klikněte pravým tlačítkem a přejmenujte",
        "da": "Højreklik for at omdøbe",
        "de": "Rechtsklick zum Umbenennen",
        "es": "Clic derecho para renombrar",
        "fr": "Clic droit pour renommer",
        "pt": "Clique com o botão direito para renomear",
        "sv": "Högerklicka för att byta namn"
    },
    "Ring the systems with notes on them, their stars, their worlds or the places on them": {
        "cs": "Označit kroužkem soustavy s poznámkami k nim, jejich hvězdám, světům nebo místům na nich",
        "da": "Sæt ring om systemer med noter om dem, deres stjerner, deres verdener eller stederne på dem",
        "de": "Systeme mit Notizen markieren – zum System, seinen Sternen, Welten oder deren Orten",
        "es": "Rodea con un anillo los sistemas que tienen notas en ellos, en sus estrellas, en sus mundos o en sus lugares",
        "fr": "Entourer les systèmes portant des notes, sur eux, leurs étoiles, leurs mondes ou leurs lieux",
        "pt": "Circular os sistemas com notas neles, em suas estrelas, seus mundos ou seus lugares",
        "sv": "Ringa in system med anteckningar om dem, deras stjärnor, deras världar eller platserna på dem"
    },
    "Rings": {
        "cs": "Prstence",
        "da": "Ringe",
        "de": "Ringe",
        "es": "Anillos",
        "fr": "Anneaux",
        "pt": "Anéis",
        "sv": "Ringar"
    },
    "River": {
        "cs": "Řeka",
        "da": "Flod",
        "de": "Fluss",
        "es": "Río",
        "fr": "Rivière",
        "pt": "Rio",
        "sv": "Flod"
    },
    "Rotation": {
        "cs": "Rotace",
        "da": "Rotation",
        "de": "Rotation",
        "es": "Rotación",
        "fr": "Rotation",
        "pt": "Rotação",
        "sv": "Rotation"
    },
    "Route": {
        "cs": "Trasa",
        "da": "Rute",
        "de": "Route",
        "es": "Ruta",
        "fr": "Itinéraire",
        "pt": "Rota",
        "sv": "Rutt"
    },
    "Ruins": {
        "cs": "Ruiny",
        "da": "Ruiner",
        "de": "Ruinen",
        "es": "Ruinas",
        "fr": "Ruines",
        "pt": "Ruínas",
        "sv": "Ruiner"
    },
    "Run at real time": {
        "cs": "Běžet v reálném čase",
        "da": "Kør i realtid",
        "de": "In Echtzeit laufen",
        "es": "Avanzar en tiempo real",
        "fr": "Passer en temps réel",
        "pt": "Rodar em tempo real",
        "sv": "Kör i realtid"
    },
    "S": {
        "cs": "J",
        "da": "S",
        "de": "S",
        "es": "S",
        "fr": "S",
        "pt": "S",
        "sv": "S"
    },
    "S-type star": {
        "cs": "Hvězda typu S",
        "da": "S-stjerne",
        "de": "S-Stern",
        "es": "Estrella de tipo S",
        "fr": "Étoile de type S",
        "pt": "Estrela tipo S",
        "sv": "S-stjärna"
    },
    "SC-type star": {
        "cs": "Hvězda typu SC",
        "da": "SC-stjerne",
        "de": "SC-Stern",
        "es": "Estrella de tipo SC",
        "fr": "Étoile de type SC",
        "pt": "Estrela tipo SC",
        "sv": "SC-stjärna"
    },
    "SE": {
        "cs": "JV",
        "da": "SØ",
        "de": "SO",
        "es": "SE",
        "fr": "SE",
        "pt": "SE",
        "sv": "SO"
    },
    "STL Model for 3D Printing…": {
        "cs": "Model STL pro 3D tisk…",
        "da": "STL-model til 3D-print…",
        "de": "STL-Modell für 3D-Druck …",
        "es": "Modelo STL para impresión 3D…",
        "fr": "Modèle STL pour impression 3D…",
        "pt": "Modelo STL para Impressão 3D…",
        "sv": "STL-modell för 3D-utskrift…"
    },
    "SW": {
        "cs": "JZ",
        "da": "SV",
        "de": "SW",
        "es": "SO",
        "fr": "SO",
        "pt": "SO",
        "sv": "SV"
    },
    "Saturn-like gas giant": {
        "cs": "Plynný obr podobný Saturnu",
        "da": "Saturnlignende gaskæmpe",
        "de": "Saturnartiger Gasriese",
        "es": "Gigante gaseoso tipo Saturno",
        "fr": "Géante gazeuse de type Saturne",
        "pt": "Gigante gasoso tipo Saturno",
        "sv": "Saturnusliknande gasjätte"
    },
    "Save the open universe as one file to send players, with only the notes you've shared": {
        "cs": "Uložit otevřený vesmír jako jeden soubor pro hráče, jen se sdílenými poznámkami",
        "da": "Gem det åbne univers som én fil til spillerne, med kun de noter, du har delt",
        "de": "Das offene Universum als eine Datei für die Spieler sichern, nur mit den geteilten Notizen",
        "es": "Guarda el universo abierto como un solo archivo para enviar a los jugadores, solo con las notas que has compartido",
        "fr": "Enregistrer l’univers ouvert en un seul fichier à envoyer aux joueurs, avec uniquement les notes partagées",
        "pt": "Salve o universo aberto como um único arquivo para enviar aos jogadores, só com as notas que você compartilhou",
        "sv": "Spara det öppna universumet som en fil att skicka till spelare, med bara de anteckningar du har delat"
    },
    "Saving…": {
        "cs": "Ukládá se…",
        "da": "Gemmer…",
        "de": "Wird gesichert …",
        "es": "Guardando…",
        "fr": "Enregistrement…",
        "pt": "Salvando…",
        "sv": "Sparar…"
    },
    "Scorching": {
        "cs": "Žhavé",
        "da": "Brændende",
        "de": "Glühend heiß",
        "es": "Abrasador",
        "fr": "Brûlant",
        "pt": "Escaldante",
        "sv": "Glödhet"
    },
    "Sea": {
        "cs": "Moře",
        "da": "Hav",
        "de": "Meer",
        "es": "Mar",
        "fr": "Mer",
        "pt": "Mar",
        "sv": "Hav"
    },
    "Search sectors": {
        "cs": "Hledat sektory",
        "da": "Søg i sektorer",
        "de": "Sektoren suchen",
        "es": "Buscar sectores",
        "fr": "Rechercher des secteurs",
        "pt": "Buscar setores",
        "sv": "Sök sektorer"
    },
    "Search systems": {
        "cs": "Hledat soustavy",
        "da": "Søg i systemer",
        "de": "Systeme suchen",
        "es": "Buscar sistemas",
        "fr": "Rechercher des systèmes",
        "pt": "Buscar sistemas",
        "sv": "Sök system"
    },
    "Sector data © TravellerMap.com and its contributors. Traveller is a registered trademark of Far Future Enterprises.": {
        "cs": "Data sektorů © TravellerMap.com a přispěvatelé. Traveller je registrovaná ochranná známka společnosti Far Future Enterprises.",
        "da": "Sektordata © TravellerMap.com og bidragydere. Traveller er et registreret varemærke tilhørende Far Future Enterprises.",
        "de": "Sektordaten © TravellerMap.com und Mitwirkende. Traveller ist eine eingetragene Marke von Far Future Enterprises.",
        "es": "Datos de sector © TravellerMap.com y sus colaboradores. Traveller es una marca registrada de Far Future Enterprises.",
        "fr": "Données de secteur © TravellerMap.com et ses contributeurs. Traveller est une marque déposée de Far Future Enterprises.",
        "pt": "Dados dos setores © TravellerMap.com e seus colaboradores. Traveller é uma marca registrada da Far Future Enterprises.",
        "sv": "Sektordata © TravellerMap.com och dess bidragsgivare. Traveller är ett registrerat varumärke som tillhör Far Future Enterprises."
    },
    "Sectors and subsectors from TravellerMap.com, every system filled in": {
        "cs": "Sektory a podsektory z TravellerMap.com s doplněnou každou soustavou",
        "da": "Sektorer og undersektorer fra TravellerMap.com med hvert system udfyldt",
        "de": "Sektoren und Subsektoren von TravellerMap.com, jedes System ausgefüllt",
        "es": "Sectores y subsectores de TravellerMap.com, con cada sistema completo",
        "fr": "Secteurs et sous-secteurs de TravellerMap.com, chaque système complété",
        "pt": "Setores e subsetores do TravellerMap.com, com cada sistema completo",
        "sv": "Sektorer och undersektorer från TravellerMap.com, varje system ifyllt"
    },
    "Select another system and add it to the route": {
        "cs": "Vyberte další soustavu a přidejte ji do trasy",
        "da": "Vælg et andet system, og føj det til ruten",
        "de": "Wähle ein weiteres System und füge es zur Route hinzu",
        "es": "Selecciona otro sistema y añádelo a la ruta",
        "fr": "Sélectionnez un autre système et ajoutez-le à l’itinéraire",
        "pt": "Selecione outro sistema e adicione-o à rota",
        "sv": "Välj ett annat system och lägg till det i rutten"
    },
    "Semi-major axis": {
        "cs": "Velká poloosa",
        "da": "Halv storakse",
        "de": "Große Halbachse",
        "es": "Semieje mayor",
        "fr": "Demi-grand axe",
        "pt": "Semieixo maior",
        "sv": "Halva storaxeln"
    },
    "Separation": {
        "cs": "Vzdálenost",
        "da": "Afstand",
        "de": "Abstand",
        "es": "Separación",
        "fr": "Séparation",
        "pt": "Separação",
        "sv": "Avstånd"
    },
    "Services": {
        "cs": "Služby",
        "da": "Tjenester",
        "de": "Dienstleistungen",
        "es": "Servicios",
        "fr": "Services",
        "pt": "Serviços",
        "sv": "Tjänster"
    },
    "Settle": {
        "cs": "Osídlit",
        "da": "Bosæt",
        "de": "Besiedeln",
        "es": "Poblar",
        "fr": "Peupler",
        "pt": "Povoar",
        "sv": "Bosätt"
    },
    "Shade the side of each planet and moon facing away from its star": {
        "cs": "Ztmavit stranu každé planety a měsíce odvrácenou od její hvězdy",
        "da": "Skyg siden af hver planet og måne, der vender væk fra dens stjerne",
        "de": "Die vom Stern abgewandte Seite jedes Planeten und Mondes abdunkeln",
        "es": "Sombrea el lado de cada planeta y luna opuesto a su estrella",
        "fr": "Ombrer la face de chaque planète et lune opposée à son étoile",
        "pt": "Sombrear o lado de cada planeta e lua voltado para longe de sua estrela",
        "sv": "Skugga den sida av varje planet och måne som är vänd bort från dess stjärna"
    },
    "Share with players": {
        "cs": "Sdílet s hráči",
        "da": "Del med spillere",
        "de": "Mit Spielern teilen",
        "es": "Compartir con los jugadores",
        "fr": "Partager avec les joueurs",
        "pt": "Compartilhar com jogadores",
        "sv": "Dela med spelare"
    },
    "Shared notes go out with universes exported for players; others stay yours alone": {
        "cs": "Sdílené poznámky odcházejí s vesmíry exportovanými pro hráče; ostatní zůstávají jen vám",
        "da": "Delte noter følger med universer, der eksporteres til spillere; andre forbliver dine alene",
        "de": "Geteilte Notizen gehen mit Universen, die für Spieler exportiert werden; andere bleiben nur bei dir",
        "es": "Las notas compartidas se incluyen en los universos exportados para jugadores; las demás son solo tuyas",
        "fr": "Les notes partagées accompagnent les univers exportés pour les joueurs ; les autres restent à vous seul",
        "pt": "Notas compartilhadas vão junto com universos exportados para jogadores; as outras ficam só com você",
        "sv": "Delade anteckningar följer med universum som exporteras för spelare; andra förblir bara dina"
    },
    "Shared with players": {
        "cs": "Sdíleno s hráči",
        "da": "Delt med spillere",
        "de": "Mit Spielern geteilt",
        "es": "Compartida con los jugadores",
        "fr": "Partagée avec les joueurs",
        "pt": "Compartilhada com jogadores",
        "sv": "Delad med spelare"
    },
    "Shipyards and heavy traffic": {
        "cs": "Loděnice a hustý provoz",
        "da": "Skibsværfter og tæt trafik",
        "de": "Werften und dichter Verkehr",
        "es": "Astilleros y tráfico intenso",
        "fr": "Chantiers navals et trafic intense",
        "pt": "Estaleiros e tráfego intenso",
        "sv": "Varv och tät trafik"
    },
    "Show TravellerMap's map of the world": {
        "cs": "Zobrazit mapu světa z TravellerMap",
        "da": "Vis TravellerMaps kort over verdenen",
        "de": "TravellerMaps Karte der Welt zeigen",
        "es": "Muestra el mapa del mundo de TravellerMap",
        "fr": "Afficher la carte du monde de TravellerMap",
        "pt": "Mostrar o mapa do mundo do TravellerMap",
        "sv": "Visa TravellerMaps karta över världen"
    },
    "Show every sector": {
        "cs": "Zobrazit všechny sektory",
        "da": "Vis alle sektorer",
        "de": "Alle Sektoren zeigen",
        "es": "Mostrar todos los sectores",
        "fr": "Afficher tous les secteurs",
        "pt": "Mostrar todos os setores",
        "sv": "Visa alla sektorer"
    },
    "Show orbits": {
        "cs": "Zobrazit dráhy",
        "da": "Vis baner",
        "de": "Bahnen anzeigen",
        "es": "Mostrar órbitas",
        "fr": "Afficher les orbites",
        "pt": "Mostrar órbitas",
        "sv": "Visa banor"
    },
    "Show the filters, which ring the systems that match them": {
        "cs": "Zobrazit filtry, které kroužkem označí odpovídající soustavy",
        "da": "Vis filtrene, som sætter ring om de systemer, der passer",
        "de": "Filter einblenden, die passende Systeme mit Ringen markieren",
        "es": "Muestra los filtros, que rodean con un anillo los sistemas que coinciden",
        "fr": "Afficher les filtres, qui entourent les systèmes correspondants",
        "pt": "Mostrar os filtros, que circulam os sistemas correspondentes",
        "sv": "Visa filtren, som ringar in de system som matchar"
    },
    "Show the side panel": {
        "cs": "Zobrazit panel",
        "da": "Vis sidepanelet",
        "de": "Seitenleiste einblenden",
        "es": "Mostrar el panel lateral",
        "fr": "Afficher le panneau latéral",
        "pt": "Mostrar o painel lateral",
        "sv": "Visa sidopanelen"
    },
    "Show the systems in reach of the last waypoint again": {
        "cs": "Znovu zobrazit soustavy v dosahu posledního bodu trasy",
        "da": "Vis igen systemerne inden for rækkevidde af det sidste rutepunkt",
        "de": "Die Systeme in Reichweite des letzten Wegpunkts wieder anzeigen",
        "es": "Vuelve a mostrar los sistemas al alcance del último punto de paso",
        "fr": "Afficher à nouveau les systèmes à portée de la dernière étape",
        "pt": "Mostrar de novo os sistemas ao alcance do último ponto de passagem",
        "sv": "Visa systemen inom räckhåll från den sista vägpunkten igen"
    },
    "Show travel advisories": {
        "cs": "Cestovní doporučení",
        "da": "Vis rejsevejledninger",
        "de": "Reisewarnungen anzeigen",
        "es": "Mostrar avisos de viaje",
        "fr": "Afficher les conseils aux voyageurs",
        "pt": "Mostrar alertas de viagem",
        "sv": "Visa reseråd"
    },
    "Showers": {
        "cs": "Přeháňky",
        "da": "Byger",
        "de": "Schauer",
        "es": "Chubascos",
        "fr": "Averses",
        "pt": "Pancadas de chuva",
        "sv": "Skurar"
    },
    "Size": {
        "cs": "Velikost",
        "da": "Størrelse",
        "de": "Größe",
        "es": "Tamaño",
        "fr": "Taille",
        "pt": "Tamanho",
        "sv": "Storlek"
    },
    "Small": {
        "cs": "Malý",
        "da": "Lille",
        "de": "Klein",
        "es": "Pequeño",
        "fr": "Petit",
        "pt": "Pequeno",
        "sv": "Liten"
    },
    "Space force": {
        "cs": "Vesmírné síly",
        "da": "Rumstyrker",
        "de": "Weltraumstreitkräfte",
        "es": "Fuerza espacial",
        "fr": "Force spatiale",
        "pt": "Força espacial",
        "sv": "Rymdstridskrafter"
    },
    "Spaceport": {
        "cs": "Kosmodrom",
        "da": "Rumhavn",
        "de": "Raumhafen",
        "es": "Puerto espacial",
        "fr": "Astroport",
        "pt": "Espaçoporto",
        "sv": "Rymdhamn"
    },
    "Spin": {
        "cs": "Smysl rotace",
        "da": "Omdrejning",
        "de": "Drehsinn",
        "es": "Sentido",
        "fr": "Sens de rotation",
        "pt": "Sentido",
        "sv": "Rotationsriktning"
    },
    "Stand at the south pole": {
        "cs": "Podstavec na jižním pólu",
        "da": "Fod ved sydpolen",
        "de": "Stand am Südpol",
        "es": "Base en el polo sur",
        "fr": "Socle au pôle sud",
        "pt": "Base no polo sul",
        "sv": "Fot vid sydpolen"
    },
    "Standard": {
        "cs": "Běžná",
        "da": "Standard",
        "de": "Standard",
        "es": "Estándar",
        "fr": "Standard",
        "pt": "Padrão",
        "sv": "Standard"
    },
    "Star": {
        "cs": "Hvězda",
        "da": "Stjerne",
        "de": "Stern",
        "es": "Estrella",
        "fr": "Étoile",
        "pt": "Estrela",
        "sv": "Stjärna"
    },
    "Star %@": {
        "cs": "Hvězda %@",
        "da": "Stjerne %@",
        "de": "Stern %@",
        "es": "Estrella %@",
        "fr": "Étoile %@",
        "pt": "Estrela %@",
        "sv": "Stjärna %@"
    },
    "Star ID": {
        "cs": "ID hvězdy",
        "da": "Stjerne-id",
        "de": "Stern-ID",
        "es": "ID de estrella",
        "fr": "ID de l’étoile",
        "pt": "ID da estrela",
        "sv": "Stjärn-id"
    },
    "Star map": {
        "cs": "Hvězdná mapa",
        "da": "Stjernekort",
        "de": "Sternkarte",
        "es": "Mapa estelar",
        "fr": "Carte stellaire",
        "pt": "Mapa estelar",
        "sv": "Stjärnkarta"
    },
    "Star orbits": {
        "cs": "Dráhy hvězd",
        "da": "Stjernebaner",
        "de": "Sternbahnen",
        "es": "Órbitas estelares",
        "fr": "Orbites stellaires",
        "pt": "Órbitas estelares",
        "sv": "Stjärnbanor"
    },
    "Star period": {
        "cs": "Perioda hvězdy",
        "da": "Stjernens omløbstid",
        "de": "Sternumlaufzeit",
        "es": "Período estelar",
        "fr": "Période stellaire",
        "pt": "Período estelar",
        "sv": "Stjärnans omloppstid"
    },
    "Star systems shown": {
        "cs": "Zobrazené soustavy",
        "da": "Viste stjernesystemer",
        "de": "Angezeigte Sternsysteme",
        "es": "Sistemas estelares mostrados",
        "fr": "Systèmes stellaires affichés",
        "pt": "Sistemas estelares exibidos",
        "sv": "Visade stjärnsystem"
    },
    "Starlight": {
        "cs": "Světlo hvězdy",
        "da": "Stjernelys",
        "de": "Sternlicht",
        "es": "Luz estelar",
        "fr": "Lumière stellaire",
        "pt": "Luz estelar",
        "sv": "Stjärnljus"
    },
    "Starport": {
        "cs": "Kosmodrom",
        "da": "Rumhavn",
        "de": "Raumhafen",
        "es": "Puerto estelar",
        "fr": "Astroport",
        "pt": "Espaçoporto",
        "sv": "Rymdhamn"
    },
    "Stars": {
        "cs": "Hvězdy",
        "da": "Stjerner",
        "de": "Sterne",
        "es": "Estrellas",
        "fr": "Étoiles",
        "pt": "Estrelas",
        "sv": "Stjärnor"
    },
    "Starting…": {
        "cs": "Spouští se…",
        "da": "Starter…",
        "de": "Wird gestartet …",
        "es": "Iniciando…",
        "fr": "Démarrage…",
        "pt": "Iniciando…",
        "sv": "Startar…"
    },
    "Stateless": {
        "cs": "Bez státu",
        "da": "Statsløs",
        "de": "Staatenlos",
        "es": "Sin Estado",
        "fr": "Sans État",
        "pt": "Sem Estado",
        "sv": "Statslös"
    },
    "Steam power, railways, factories": {
        "cs": "Pára, železnice, továrny",
        "da": "Dampkraft, jernbaner, fabrikker",
        "de": "Dampfkraft, Eisenbahnen, Fabriken",
        "es": "Máquina de vapor, ferrocarriles, fábricas",
        "fr": "Vapeur, chemins de fer, usines",
        "pt": "Máquina a vapor, ferrovias, fábricas",
        "sv": "Ångkraft, järnvägar, fabriker"
    },
    "Steep roofs, dark timber and stone, conifers": {
        "cs": "Strmé střechy, tmavé dřevo a kámen, jehličnany",
        "da": "Stejle tage, mørkt træ og sten, nåletræer",
        "de": "Steile Dächer, dunkles Holz und Stein, Nadelbäume",
        "es": "Tejados empinados, madera oscura y piedra, coníferas",
        "fr": "Toits raides, bois sombre et pierre, conifères",
        "pt": "Telhados íngremes, madeira escura e pedra, coníferas",
        "sv": "Branta tak, mörkt trä och sten, barrträd"
    },
    "Stellar cartography": {
        "cs": "Hvězdná kartografie",
        "da": "Stjernekartografi",
        "de": "Sternkartografie",
        "es": "Cartografía estelar",
        "fr": "Cartographie stellaire",
        "pt": "Cartografia estelar",
        "sv": "Stjärnkartografi"
    },
    "Stellar data": {
        "cs": "Data hvězd",
        "da": "Stjernedata",
        "de": "Sterndaten",
        "es": "Datos estelares",
        "fr": "Données stellaires",
        "pt": "Dados estelares",
        "sv": "Stjärndata"
    },
    "Stellar remnant": {
        "cs": "Hvězdný pozůstatek",
        "da": "Stjernerest",
        "de": "Sternüberrest",
        "es": "Remanente estelar",
        "fr": "Résidu stellaire",
        "pt": "Remanescente estelar",
        "sv": "Stjärnrest"
    },
    "Stone tools, foraging and early farming": {
        "cs": "Kamenné nástroje, sběr a rané zemědělství",
        "da": "Stenredskaber, indsamling og tidligt landbrug",
        "de": "Steinwerkzeuge, Sammeln und früher Ackerbau",
        "es": "Herramientas de piedra, recolección y agricultura primitiva",
        "fr": "Outils de pierre, cueillette et premières cultures",
        "pt": "Ferramentas de pedra, coleta e agricultura primitiva",
        "sv": "Stenverktyg, insamling och tidigt jordbruk"
    },
    "Stop showing the systems in reach of the last waypoint": {
        "cs": "Přestat zobrazovat soustavy v dosahu posledního bodu trasy",
        "da": "Hold op med at vise systemerne inden for rækkevidde af det sidste rutepunkt",
        "de": "Die Systeme in Reichweite des letzten Wegpunkts nicht mehr anzeigen",
        "es": "Deja de mostrar los sistemas al alcance del último punto de paso",
        "fr": "Ne plus afficher les systèmes à portée de la dernière étape",
        "pt": "Parar de mostrar os sistemas ao alcance do último ponto de passagem",
        "sv": "Sluta visa systemen inom räckhåll från den sista vägpunkten"
    },
    "Stopped": {
        "cs": "Zastaveno",
        "da": "Stoppet",
        "de": "Angehalten",
        "es": "Detenido",
        "fr": "Arrêté",
        "pt": "Parado",
        "sv": "Stoppad"
    },
    "Storm": {
        "cs": "Bouře",
        "da": "Storm",
        "de": "Sturm",
        "es": "Tormenta",
        "fr": "Tempête",
        "pt": "Tempestade",
        "sv": "Storm"
    },
    "Storms": {
        "cs": "Bouře",
        "da": "Storme",
        "de": "Stürme",
        "es": "Tormentas",
        "fr": "Tempêtes",
        "pt": "Tempestades",
        "sv": "Stormar"
    },
    "Street Layout": {
        "cs": "Uliční síť",
        "da": "Gadenet",
        "de": "Straßennetz",
        "es": "Trazado urbano",
        "fr": "Tracé des rues",
        "pt": "Traçado das Ruas",
        "sv": "Gatunät"
    },
    "Strongest wind": {
        "cs": "Nejsilnější vítr",
        "da": "Stærkeste vind",
        "de": "Stärkster Wind",
        "es": "Viento más fuerte",
        "fr": "Vent le plus fort",
        "pt": "Vento mais forte",
        "sv": "Starkaste vind"
    },
    "Sub-Neptune": {
        "cs": "Podneptun",
        "da": "Sub-Neptun",
        "de": "Sub-Neptun",
        "es": "Subneptuno",
        "fr": "Sous-Neptune",
        "pt": "Subnetuno",
        "sv": "Sub-Neptunus"
    },
    "Subdwarf": {
        "cs": "Podtrpaslík",
        "da": "Underdværg",
        "de": "Unterzwerg",
        "es": "Subenana",
        "fr": "Sous-naine",
        "pt": "Subanã",
        "sv": "Underdvärg"
    },
    "Subgiant": {
        "cs": "Podobr",
        "da": "Underkæmpe",
        "de": "Unterriese",
        "es": "Subgigante",
        "fr": "Sous-géante",
        "pt": "Subgigante",
        "sv": "Underjätte"
    },
    "Subsector names changed too.": {
        "cs": "Změnily se i názvy podsektorů.",
        "da": "Undersektornavne er også ændret.",
        "de": "Auch Subsektornamen wurden geändert.",
        "es": "También cambiaron nombres de subsector.",
        "fr": "Les noms de sous-secteurs ont aussi changé.",
        "pt": "Os nomes dos subsetores também mudaram.",
        "sv": "Undersektornamn har också ändrats."
    },
    "Subsistence": {
        "cs": "Soběstačné",
        "da": "Selvforsyning",
        "de": "Subsistenz",
        "es": "Subsistencia",
        "fr": "Subsistance",
        "pt": "Subsistência",
        "sv": "Självhushåll"
    },
    "Suggested: %@": {
        "cs": "Navrhováno: %@",
        "da": "Foreslået: %@",
        "de": "Vorgeschlagen: %@",
        "es": "Sugerido: %@",
        "fr": "Suggéré : %@",
        "pt": "Sugerido: %@",
        "sv": "Föreslaget: %@"
    },
    "Sulfuric acid rain, evaporating before it lands": {
        "cs": "Déšť kyseliny sírové, který se odpaří, než dopadne",
        "da": "Svovlsyreregn, der fordamper, før den lander",
        "de": "Schwefelsäureregen, der vor dem Aufprall verdunstet",
        "es": "Lluvia de ácido sulfúrico que se evapora antes de llegar al suelo",
        "fr": "Pluie d’acide sulfurique, qui s’évapore avant de toucher le sol",
        "pt": "Chuva de ácido sulfúrico, que evapora antes de chegar ao solo",
        "sv": "Svavelsyraregn som avdunstar innan det når marken"
    },
    "Sunny": {
        "cs": "Slunečno",
        "da": "Solrigt",
        "de": "Sonnig",
        "es": "Soleado",
        "fr": "Ensoleillé",
        "pt": "Ensolarado",
        "sv": "Soligt"
    },
    "Super-Jupiter": {
        "cs": "Superjupiter",
        "da": "Super-Jupiter",
        "de": "Super-Jupiter",
        "es": "Superjúpiter",
        "fr": "Super-Jupiter",
        "pt": "Superjúpiter",
        "sv": "Superjupiter"
    },
    "Supergiant": {
        "cs": "Veleobr",
        "da": "Superkæmpe",
        "de": "Überriese",
        "es": "Supergigante",
        "fr": "Supergéante",
        "pt": "Supergigante",
        "sv": "Superjätte"
    },
    "Supernova remnant": {
        "cs": "Pozůstatek supernovy",
        "da": "Supernovarest",
        "de": "Supernovaüberrest",
        "es": "Remanente de supernova",
        "fr": "Rémanent de supernova",
        "pt": "Remanescente de supernova",
        "sv": "Supernovarest"
    },
    "Surface resolution": {
        "cs": "Rozlišení povrchu",
        "da": "Overfladeopløsning",
        "de": "Oberflächenauflösung",
        "es": "Resolución de superficie",
        "fr": "Résolution des surfaces",
        "pt": "Resolução da superfície",
        "sv": "Ytupplösning"
    },
    "Surface water": {
        "cs": "Povrchová voda",
        "da": "Overfladevand",
        "de": "Oberflächenwasser",
        "es": "Agua superficial",
        "fr": "Eau de surface",
        "pt": "Água superficial",
        "sv": "Ytvatten"
    },
    "Switch Map Type…": {
        "cs": "Přepnout typ mapy…",
        "da": "Skift korttype…",
        "de": "Kartentyp wechseln …",
        "es": "Cambiar tipo de mapa…",
        "fr": "Changer de type de carte…",
        "pt": "Mudar Tipo de Mapa…",
        "sv": "Byt karttyp…"
    },
    "System": {
        "cs": "Soustava",
        "da": "System",
        "de": "System",
        "es": "Sistema",
        "fr": "Système",
        "pt": "Sistema",
        "sv": "System"
    },
    "System ID": {
        "cs": "ID soustavy",
        "da": "System-id",
        "de": "System-ID",
        "es": "ID de sistema",
        "fr": "ID du système",
        "pt": "ID do sistema",
        "sv": "System-id"
    },
    "T Tauri star": {
        "cs": "Hvězda T Tauri",
        "da": "T Tauri-stjerne",
        "de": "T-Tauri-Stern",
        "es": "Estrella T Tauri",
        "fr": "Étoile T Tauri",
        "pt": "Estrela T Tauri",
        "sv": "T Tauri-stjärna"
    },
    "T dwarf (brown dwarf)": {
        "cs": "Trpaslík T (hnědý)",
        "da": "T-dværg (brun dværg)",
        "de": "T-Zwerg (Brauner Zwerg)",
        "es": "Enana T (enana marrón)",
        "fr": "Naine T (naine brune)",
        "pt": "Anã T (anã marrom)",
        "sv": "T-dvärg (brun dvärg)"
    },
    "Take any travel advisory off the system": {
        "cs": "Odebrat soustavě cestovní doporučení",
        "da": "Fjern enhver rejsevejledning fra systemet",
        "de": "Jede Reisewarnung vom System entfernen",
        "es": "Quita cualquier aviso de viaje del sistema",
        "fr": "Retirer tout conseil aux voyageurs du système",
        "pt": "Remover qualquer alerta de viagem do sistema",
        "sv": "Ta bort alla reseråd från systemet"
    },
    "Target": {
        "cs": "Cíl",
        "da": "Mål",
        "de": "Ziel",
        "es": "Objetivo",
        "fr": "Cible",
        "pt": "Alvo",
        "sv": "Mål"
    },
    "Tech level": {
        "cs": "Tech. úroveň",
        "da": "Tekniveau",
        "de": "Techstufe",
        "es": "Nivel tecnológico",
        "fr": "Niveau technologique",
        "pt": "Nível tecnológico",
        "sv": "Teknivå"
    },
    "Technocracy": {
        "cs": "Technokracie",
        "da": "Teknokrati",
        "de": "Technokratie",
        "es": "Tecnocracia",
        "fr": "Technocratie",
        "pt": "Tecnocracia",
        "sv": "Teknokrati"
    },
    "Temperate": {
        "cs": "Mírné",
        "da": "Tempereret",
        "de": "Gemäßigt",
        "es": "Templado",
        "fr": "Tempéré",
        "pt": "Temperado",
        "sv": "Tempererad"
    },
    "Temperature": {
        "cs": "Teplota",
        "da": "Temperatur",
        "de": "Temperatur",
        "es": "Temperatura",
        "fr": "Température",
        "pt": "Temperatura",
        "sv": "Temperatur"
    },
    "Terminator": {
        "cs": "Terminátor",
        "da": "Terminator",
        "de": "Terminator",
        "es": "Terminador",
        "fr": "Terminateur",
        "pt": "Terminador",
        "sv": "Terminator"
    },
    "Terrestrial planet": {
        "cs": "Kamenná planeta",
        "da": "Klippeplanet",
        "de": "Gesteinsplanet",
        "es": "Planeta terrestre",
        "fr": "Planète tellurique",
        "pt": "Planeta terrestre",
        "sv": "Stenplanet"
    },
    "The Essential travel only and No travel filters and their rings, the Advisory buttons in the side panel, and the advisory a world's conditions suggest. Turn off for campaigns that don't use them; advisories already set are kept.": {
        "cs": "Filtry Jen nezbytné cesty a Žádné cesty a jejich kroužky, tlačítka doporučení v bočním panelu a doporučení, které naznačují podmínky světa. Vypněte pro kampaně, které je nepoužívají; již nastavená doporučení zůstanou.",
        "da": "Filtrene Kun nødvendige rejser og Ingen rejser og deres ringe, knapperne for rejsevejledning i sidepanelet og den rejsevejledning, som en verdens forhold tilsiger. Slå fra i kampagner, der ikke bruger dem; rejsevejledninger, der allerede er sat, beholdes.",
        "de": "Die Filter „Nur notwendige Reisen“ und „Keine Reisen“ mit ihren Ringen, die Warnungstasten in der Seitenleiste und die Warnung, die die Bedingungen einer Welt nahelegen. Für Kampagnen ohne Reisewarnungen ausschalten; bereits gesetzte Warnungen bleiben erhalten.",
        "es": "Los filtros Solo viajes esenciales y No viajar y sus anillos, los botones de Aviso del panel lateral y el aviso que sugieren las condiciones de un mundo. Desactívalo en campañas que no los usen; los avisos ya asignados se conservan.",
        "fr": "Les filtres Voyages essentiels uniquement et Aucun voyage et leurs anneaux, les boutons Conseil du panneau latéral, et le conseil que suggèrent les conditions d’un monde. Désactivez-les pour les campagnes qui ne s’en servent pas ; les conseils déjà définis sont conservés.",
        "pt": "Os filtros Somente viagens essenciais e Não viajar e seus anéis, os botões de Alerta no painel lateral e o alerta que as condições de um mundo sugerem. Desative em campanhas que não os usam; os alertas já definidos são mantidos.",
        "sv": "Filtren Endast nödvändiga resor och Inga resor och deras ringar, reserådsknapparna i sidopanelen och de reseråd som en världs förhållanden föreslår. Stäng av för kampanjer som inte använder dem; reseråd som redan har satts behålls."
    },
    "The chosen sectors have no worlds listed": {
        "cs": "Vybrané sektory nemají uvedeny žádné světy",
        "da": "De valgte sektorer har ingen verdener opført",
        "de": "Die gewählten Sektoren enthalten keine Welten",
        "es": "Los sectores elegidos no tienen mundos listados",
        "fr": "Aucun monde n’est listé dans les secteurs choisis",
        "pt": "Os setores escolhidos não têm mundos listados",
        "sv": "De valda sektorerna har inga listade världar"
    },
    "The expanding wreck of a supernova": {
        "cs": "Rozpínající se trosky supernovy",
        "da": "Det ekspanderende vrag af en supernova",
        "de": "Die sich ausdehnenden Trümmer einer Supernova",
        "es": "Los restos en expansión de una supernova",
        "fr": "Les vestiges en expansion d’une supernova",
        "pt": "Os destroços em expansão de uma supernova",
        "sv": "Det expanderande vraket av en supernova"
    },
    "The globe couldn't be drawn.": {
        "cs": "Glóbus se nepodařilo vykreslit.",
        "da": "Globussen kunne ikke tegnes.",
        "de": "Der Globus konnte nicht gezeichnet werden.",
        "es": "No se pudo dibujar el globo.",
        "fr": "Le globe n’a pas pu être dessiné.",
        "pt": "Não foi possível desenhar o globo.",
        "sv": "Globen kunde inte ritas."
    },
    "The map couldn't be drawn for export.": {
        "cs": "Mapu se nepodařilo vykreslit pro export.",
        "da": "Kortet kunne ikke tegnes til eksport.",
        "de": "Die Karte konnte für den Export nicht gezeichnet werden.",
        "es": "No se pudo dibujar el mapa para exportarlo.",
        "fr": "La carte n’a pas pu être dessinée pour l’export.",
        "pt": "Não foi possível desenhar o mapa para exportação.",
        "sv": "Kartan kunde inte ritas för export."
    },
    "The map couldn't be read.": {
        "cs": "Mapu se nepodařilo přečíst.",
        "da": "Kortet kunne ikke læses.",
        "de": "Die Karte konnte nicht gelesen werden.",
        "es": "No se pudo leer el mapa.",
        "fr": "La carte n’a pas pu être lue.",
        "pt": "Não foi possível ler o mapa.",
        "sv": "Kartan kunde inte läsas."
    },
    "The new name shows wherever the app shows this %@. Leave it empty for the generated name.": {
        "cs": "Nový název se zobrazí všude, kde aplikace zobrazuje tento objekt (%@). Ponechte prázdné pro vygenerovaný název.",
        "da": "Det nye navn vises overalt, hvor appen viser dette (%@). Lad det stå tomt for at bruge det genererede navn.",
        "de": "Der neue Name erscheint überall, wo die App dies zeigt (%@). Leer lassen für den generierten Namen.",
        "es": "El nuevo nombre aparece dondequiera que la app muestre este elemento (%@). Déjalo vacío para usar el nombre generado.",
        "fr": "Le nouveau nom s’affiche partout où l’app montre cet objet (%@). Laissez vide pour le nom généré.",
        "pt": "O novo nome aparece onde quer que o app mostre este(a) %@. Deixe vazio para usar o nome gerado.",
        "sv": "Det nya namnet visas överallt där appen visar detta (%@). Lämna tomt för det genererade namnet."
    },
    "The sectors' worlds, routes and world maps, as TravellerMap lists them.": {
        "cs": "Světy, trasy a mapy světů sektorů tak, jak je uvádí TravellerMap.",
        "da": "Sektorernes verdener, ruter og verdenskort, som TravellerMap opfører dem.",
        "de": "Die Welten, Routen und Weltkarten der Sektoren, wie TravellerMap sie listet.",
        "es": "Los mundos, rutas y mapas del mundo de los sectores, tal como los lista TravellerMap.",
        "fr": "Les mondes, routes et cartes des mondes des secteurs, tels que TravellerMap les liste.",
        "pt": "Os mundos, rotas e mapas dos mundos dos setores, como o TravellerMap os lista.",
        "sv": "Sektorernas världar, rutter och världskartor, så som TravellerMap listar dem."
    },
    "The seed generates everything TravellerMap doesn't list: the rest of each system and the details of its people.": {
        "cs": "Semínko vygeneruje vše, co TravellerMap neuvádí: zbytek každé soustavy a podrobnosti o jejích obyvatelích.",
        "da": "Frøet genererer alt, hvad TravellerMap ikke opfører: resten af hvert system og detaljerne om dets folk.",
        "de": "Der Startwert erzeugt alles, was TravellerMap nicht listet: den Rest jedes Systems und die Details seiner Bewohner.",
        "es": "La semilla genera todo lo que TravellerMap no lista: el resto de cada sistema y los detalles de su población.",
        "fr": "La graine génère tout ce que TravellerMap ne liste pas : le reste de chaque système et les détails de ses habitants.",
        "pt": "A semente gera tudo o que o TravellerMap não lista: o resto de cada sistema e os detalhes de seus povos.",
        "sv": "Fröet genererar allt som TravellerMap inte listar: resten av varje system och detaljerna om dess folk."
    },
    "The shared universe every player has": {
        "cs": "Společný vesmír, který mají všichni hráči",
        "da": "Det fælles univers, som alle spillere har",
        "de": "Das gemeinsame Universum aller Spieler",
        "es": "El universo compartido que tiene cada jugador",
        "fr": "L’univers partagé que tous les joueurs possèdent",
        "pt": "O universo compartilhado que todo jogador tem",
        "sv": "Det gemensamma universum som alla spelare har"
    },
    "The star field draws this many systems nearest the view, and brings in others as you fly with W and S. Fewer is faster.": {
        "cs": "Hvězdné pole kreslí tolik soustav nejblíže pohledu a další přidává, jak letíte klávesami W a S. Méně je rychlejší.",
        "da": "Stjernefeltet tegner så mange systemer nærmest visningen og henter andre ind, mens du flyver med W og S. Færre er hurtigere.",
        "de": "Das Sternfeld zeigt so viele Systeme nahe der Ansicht und lädt weitere nach, während du mit W und S fliegst. Weniger ist schneller.",
        "es": "El campo estelar dibuja esta cantidad de sistemas más cercanos a la vista y añade otros mientras vuelas con W y S. Menos es más rápido.",
        "fr": "Le champ d’étoiles affiche ce nombre de systèmes les plus proches de la vue, et en charge d’autres à mesure que vous volez avec W et S. Moins, c’est plus rapide.",
        "pt": "O campo estelar desenha esta quantidade de sistemas mais próximos da vista e carrega outros conforme você voa com W e S. Menos é mais rápido.",
        "sv": "Stjärnfältet ritar så många system närmast vyn och hämtar in andra medan du flyger med W och S. Färre är snabbare."
    },
    "The universe's TravellerMap data couldn't be read": {
        "cs": "Data TravellerMap tohoto vesmíru se nepodařilo přečíst",
        "da": "Universets TravellerMap-data kunne ikke læses",
        "de": "Die TravellerMap-Daten des Universums konnten nicht gelesen werden",
        "es": "No se pudieron leer los datos de TravellerMap del universo",
        "fr": "Les données TravellerMap de l’univers n’ont pas pu être lues",
        "pt": "Não foi possível ler os dados do TravellerMap do universo",
        "sv": "Universumets TravellerMap-data kunde inte läsas"
    },
    "The versions of TravellerMap's data this universe has fetched, and which is in use": {
        "cs": "Verze dat TravellerMap, které tento vesmír stáhl, a která se používá",
        "da": "De versioner af TravellerMaps data, som dette univers har hentet, og hvilken der er i brug",
        "de": "Die Versionen der TravellerMap-Daten, die dieses Universum geladen hat, und welche verwendet wird",
        "es": "Las versiones de los datos de TravellerMap que ha descargado este universo, y cuál está en uso",
        "fr": "Les versions des données de TravellerMap récupérées par cet univers, et celle utilisée",
        "pt": "As versões dos dados do TravellerMap que este universo baixou, e qual está em uso",
        "sv": "De versioner av TravellerMaps data som det här universumet har hämtat, och vilken som används"
    },
    "The weather all over this world now: precipitation radar and temperature maps, with its winds and storms": {
        "cs": "Současné počasí na celém tomto světě: srážkový radar a teplotní mapy s větry a bouřemi",
        "da": "Vejret over hele denne verden nu: nedbørsradar og temperaturkort med vinde og storme",
        "de": "Das aktuelle Wetter auf der ganzen Welt: Niederschlagsradar und Temperaturkarten, mit Winden und Stürmen",
        "es": "El tiempo en todo este mundo ahora: radar de precipitación y mapas de temperatura, con sus vientos y tormentas",
        "fr": "La météo actuelle sur tout ce monde : radar de précipitations et cartes de température, avec ses vents et ses tempêtes",
        "pt": "O tempo agora em todo este mundo: radar de precipitação e mapas de temperatura, com seus ventos e tempestades",
        "sv": "Vädret över hela den här världen nu: nederbördsradar och temperaturkartor, med vindar och stormar"
    },
    "Theocracy": {
        "cs": "Teokracie",
        "da": "Teokrati",
        "de": "Theokratie",
        "es": "Teocracia",
        "fr": "Théocratie",
        "pt": "Teocracia",
        "sv": "Teokrati"
    },
    "There are no shared notes here.": {
        "cs": "Nejsou tu žádné sdílené poznámky.",
        "da": "Der er ingen delte noter her.",
        "de": "Hier gibt es keine geteilten Notizen.",
        "es": "Aquí no hay notas compartidas.",
        "fr": "Il n’y a aucune note partagée ici.",
        "pt": "Não há notas compartilhadas aqui.",
        "sv": "Det finns inga delade anteckningar här."
    },
    "Thunderstorms": {
        "cs": "Bouřky",
        "da": "Tordenvejr",
        "de": "Gewitter",
        "es": "Tormentas eléctricas",
        "fr": "Orages",
        "pt": "Trovoadas",
        "sv": "Åskväder"
    },
    "Tidal lock": {
        "cs": "Vázaná rotace",
        "da": "Bunden rotation",
        "de": "Gebundene Rotation",
        "es": "Acoplamiento de marea",
        "fr": "Rotation synchrone",
        "pt": "Acoplamento de maré",
        "sv": "Bunden rotation"
    },
    "To %@": {
        "cs": "Do %@",
        "da": "Til %@",
        "de": "Zu %@",
        "es": "Con %@",
        "fr": "Avec %@",
        "pt": "Com %@",
        "sv": "Till %@"
    },
    "To its planet": {
        "cs": "Ke své planetě",
        "da": "Til sin planet",
        "de": "Zum Planeten",
        "es": "Con su planeta",
        "fr": "Avec sa planète",
        "pt": "Com seu planeta",
        "sv": "Till sin planet"
    },
    "To its star, 1:1": {
        "cs": "Ke své hvězdě, 1:1",
        "da": "Til sin stjerne, 1:1",
        "de": "Zum Stern, 1:1",
        "es": "Con su estrella, 1:1",
        "fr": "Avec son étoile, 1:1",
        "pt": "Com sua estrela, 1:1",
        "sv": "Till sin stjärna, 1:1"
    },
    "To its star, 3:2 resonance": {
        "cs": "Ke své hvězdě, rezonance 3:2",
        "da": "Til sin stjerne, 3:2-resonans",
        "de": "Zum Stern, 3:2-Resonanz",
        "es": "Con su estrella, resonancia 3:2",
        "fr": "Avec son étoile, résonance 3:2",
        "pt": "Com sua estrela, ressonância 3:2",
        "sv": "Till sin stjärna, 3:2-resonans"
    },
    "Top view": {
        "cs": "Pohled shora",
        "da": "Set ovenfra",
        "de": "Draufsicht",
        "es": "Vista cenital",
        "fr": "Vue du dessus",
        "pt": "Vista superior",
        "sv": "Vy ovanifrån"
    },
    "Total": {
        "cs": "Celkem",
        "da": "I alt",
        "de": "Gesamt",
        "es": "Total",
        "fr": "Total",
        "pt": "Total",
        "sv": "Totalt"
    },
    "Tourism": {
        "cs": "Turistika",
        "da": "Turisme",
        "de": "Tourismus",
        "es": "Turismo",
        "fr": "Tourisme",
        "pt": "Turismo",
        "sv": "Turism"
    },
    "Town": {
        "cs": "Městečko",
        "da": "Småby",
        "de": "Kleinstadt",
        "es": "Pueblo",
        "fr": "Bourg",
        "pt": "Vila",
        "sv": "Ort"
    },
    "Trace": {
        "cs": "Stopy",
        "da": "Spor",
        "de": "Spuren",
        "es": "Trazas",
        "fr": "Traces",
        "pt": "Vestígios",
        "sv": "Spår"
    },
    "Trailing trojan": {
        "cs": "Opožďující se trojan",
        "da": "Bagerste trojaner",
        "de": "Nachfolgender Trojaner",
        "es": "Troyano trasero",
        "fr": "Troyen arrière",
        "pt": "Troiano atrás",
        "sv": "Bakre trojan"
    },
    "Travel between the stars": {
        "cs": "Cesty mezi hvězdami",
        "da": "Rejser mellem stjernerne",
        "de": "Reisen zwischen den Sternen",
        "es": "Viajes entre las estrellas",
        "fr": "Voyages entre les étoiles",
        "pt": "Viagens entre as estrelas",
        "sv": "Resor mellan stjärnorna"
    },
    "Traveller hex maps": {
        "cs": "Hexové mapy Traveller",
        "da": "Traveller-hexkort",
        "de": "Traveller-Hexkarten",
        "es": "Mapas hexagonales de Traveller",
        "fr": "Cartes hexagonales Traveller",
        "pt": "Mapas hexagonais de Traveller",
        "sv": "Traveller-hexkartor"
    },
    "TravellerMap answered %lld for %@": {
        "cs": "TravellerMap odpověděl %lld pro %@",
        "da": "TravellerMap svarede %lld for %@",
        "de": "TravellerMap antwortete %lld für %@",
        "es": "TravellerMap respondió %lld para %@",
        "fr": "TravellerMap a répondu %lld pour %@",
        "pt": "O TravellerMap respondeu %lld para %@",
        "sv": "TravellerMap svarade %lld för %@"
    },
    "TravellerMap has updated %@": {
        "cs": "TravellerMap aktualizoval %@",
        "da": "TravellerMap har opdateret %@",
        "de": "TravellerMap hat %@ aktualisiert",
        "es": "TravellerMap ha actualizado %@",
        "fr": "TravellerMap a mis à jour %@",
        "pt": "O TravellerMap atualizou %@",
        "sv": "TravellerMap har uppdaterat %@"
    },
    "Tropical": {
        "cs": "Tropické",
        "da": "Tropisk",
        "de": "Tropisch",
        "es": "Tropical",
        "fr": "Tropical",
        "pt": "Tropical",
        "sv": "Tropisk"
    },
    "Tropical cyclone, category %lld": {
        "cs": "Tropická cyklóna, kategorie %lld",
        "da": "Tropisk cyklon, kategori %lld",
        "de": "Tropischer Wirbelsturm, Kategorie %lld",
        "es": "Ciclón tropical, categoría %lld",
        "fr": "Cyclone tropical, catégorie %lld",
        "pt": "Ciclone tropical, categoria %lld",
        "sv": "Tropisk cyklon, kategori %lld"
    },
    "Tropical storm": {
        "cs": "Tropická bouře",
        "da": "Tropisk storm",
        "de": "Tropischer Sturm",
        "es": "Tormenta tropical",
        "fr": "Tempête tropicale",
        "pt": "Tempestade tropical",
        "sv": "Tropisk storm"
    },
    "True anomaly": {
        "cs": "Pravá anomálie",
        "da": "Sand anomali",
        "de": "Wahre Anomalie",
        "es": "Anomalía verdadera",
        "fr": "Anomalie vraie",
        "pt": "Anomalia verdadeira",
        "sv": "Sann anomali"
    },
    "Try Again": {
        "cs": "Zkusit znovu",
        "da": "Prøv igen",
        "de": "Erneut versuchen",
        "es": "Reintentar",
        "fr": "Réessayer",
        "pt": "Tentar de Novo",
        "sv": "Försök igen"
    },
    "Twilight": {
        "cs": "Šero",
        "da": "Tusmørke",
        "de": "Dämmerung",
        "es": "Crepúsculo",
        "fr": "Crépuscule",
        "pt": "Crepúsculo",
        "sv": "Skymning"
    },
    "Type": {
        "cs": "Typ",
        "da": "Type",
        "de": "Typ",
        "es": "Tipo",
        "fr": "Type",
        "pt": "Tipo",
        "sv": "Typ"
    },
    "Uniform": {
        "cs": "Jednotný",
        "da": "Ensartet",
        "de": "Einheitlich",
        "es": "Uniforme",
        "fr": "Uniforme",
        "pt": "Uniforme",
        "sv": "Enhetlig"
    },
    "Unitary": {
        "cs": "Unitární",
        "da": "Enhedsstat",
        "de": "Unitarisch",
        "es": "Unitario",
        "fr": "Unitaire",
        "pt": "Unitário",
        "sv": "Enhetsstat"
    },
    "Universe for players": {
        "cs": "Vesmír pro hráče",
        "da": "Univers til spillere",
        "de": "Universum für Spieler",
        "es": "Universo para jugadores",
        "fr": "Univers pour les joueurs",
        "pt": "Universo para jogadores",
        "sv": "Universum för spelare"
    },
    "Unnamed": {
        "cs": "Bez názvu",
        "da": "Unavngivet",
        "de": "Unbenannt",
        "es": "Sin nombre",
        "fr": "Sans nom",
        "pt": "Sem nome",
        "sv": "Namnlös"
    },
    "Unrestricted": {
        "cs": "Neomezeno",
        "da": "Ubegrænset",
        "de": "Unbeschränkt",
        "es": "Sin restricciones",
        "fr": "Sans restriction",
        "pt": "Irrestrito",
        "sv": "Obegränsat"
    },
    "Unsettled": {
        "cs": "Nestálé",
        "da": "Ustadigt",
        "de": "Unbeständig",
        "es": "Inestable",
        "fr": "Instable",
        "pt": "Instável",
        "sv": "Ostadigt"
    },
    "Updating star field…": {
        "cs": "Aktualizuje se hvězdné pole…",
        "da": "Opdaterer stjernefelt…",
        "de": "Sternfeld wird aktualisiert …",
        "es": "Actualizando el campo estelar…",
        "fr": "Mise à jour du champ d’étoiles…",
        "pt": "Atualizando o campo estelar…",
        "sv": "Uppdaterar stjärnfält…"
    },
    "Updating the universe…": {
        "cs": "Aktualizuje se vesmír…",
        "da": "Opdaterer universet…",
        "de": "Universum wird aktualisiert …",
        "es": "Actualizando el universo…",
        "fr": "Mise à jour de l’univers…",
        "pt": "Atualizando o universo…",
        "sv": "Uppdaterar universumet…"
    },
    "Use": {
        "cs": "Použít",
        "da": "Brug",
        "de": "Nutzen",
        "es": "Usar",
        "fr": "Utiliser",
        "pt": "Usar",
        "sv": "Använd"
    },
    "Use Generated Name": {
        "cs": "Použít vygenerovaný název",
        "da": "Brug genereret navn",
        "de": "Generierten Namen verwenden",
        "es": "Usar nombre generado",
        "fr": "Utiliser le nom généré",
        "pt": "Usar Nome Gerado",
        "sv": "Använd genererat namn"
    },
    "Use New": {
        "cs": "Použít novou",
        "da": "Brug ny",
        "de": "Neue nutzen",
        "es": "Usar la nueva",
        "fr": "Utiliser la nouvelle",
        "pt": "Usar a Nova",
        "sv": "Använd ny"
    },
    "Use generated values": {
        "cs": "Použít vygenerované",
        "da": "Brug genererede værdier",
        "de": "Generierte Werte nutzen",
        "es": "Usar valores generados",
        "fr": "Valeurs générées",
        "pt": "Usar valores gerados",
        "sv": "Använd genererade värden"
    },
    "Use suggested": {
        "cs": "Použít návrh",
        "da": "Brug forslag",
        "de": "Vorschlag nutzen",
        "es": "Usar sugerido",
        "fr": "Appliquer",
        "pt": "Usar sugerido",
        "sv": "Använd förslag"
    },
    "Variable": {
        "cs": "Proměnlivé",
        "da": "Variabel",
        "de": "Veränderlich",
        "es": "Variable",
        "fr": "Variable",
        "pt": "Variável",
        "sv": "Variabel"
    },
    "Village": {
        "cs": "Vesnice",
        "da": "Landsby",
        "de": "Dorf",
        "es": "Aldea",
        "fr": "Village",
        "pt": "Aldeia",
        "sv": "By"
    },
    "W": {
        "cs": "Z",
        "da": "V",
        "de": "W",
        "es": "O",
        "fr": "O",
        "pt": "O",
        "sv": "V"
    },
    "W / S fly toward / away from the pointer · ⇧ faster": {
        "cs": "W / S let k ukazateli / od něj · ⇧ rychleji",
        "da": "W / S flyv mod / væk fra markøren · ⇧ hurtigere",
        "de": "W / S zum Zeiger hin / davon weg fliegen · ⇧ schneller",
        "es": "W / S vuelan hacia / desde el puntero · ⇧ más rápido",
        "fr": "W / S : avancer / reculer vers le pointeur · ⇧ plus vite",
        "pt": "W / S voa em direção a / para longe do ponteiro · ⇧ mais rápido",
        "sv": "W / S flyg mot / bort från pekaren · ⇧ snabbare"
    },
    "War": {
        "cs": "Válka",
        "da": "Krig",
        "de": "Krieg",
        "es": "Guerra",
        "fr": "Guerre",
        "pt": "Guerra",
        "sv": "Krig"
    },
    "Water": {
        "cs": "Voda",
        "da": "Vand",
        "de": "Wasser",
        "es": "Agua",
        "fr": "Eau",
        "pt": "Água",
        "sv": "Vatten"
    },
    "Water and wind mills, castles, guilds": {
        "cs": "Vodní a větrné mlýny, hrady, cechy",
        "da": "Vand- og vindmøller, borge, lav",
        "de": "Wasser- und Windmühlen, Burgen, Zünfte",
        "es": "Molinos de agua y de viento, castillos, gremios",
        "fr": "Moulins à eau et à vent, châteaux, guildes",
        "pt": "Moinhos de água e de vento, castelos, guildas",
        "sv": "Vatten- och väderkvarnar, borgar, gillen"
    },
    "Waterfall": {
        "cs": "Vodopád",
        "da": "Vandfald",
        "de": "Wasserfall",
        "es": "Cascada",
        "fr": "Cascade",
        "pt": "Cachoeira",
        "sv": "Vattenfall"
    },
    "Waypoints": {
        "cs": "Body trasy",
        "da": "Rutepunkter",
        "de": "Wegpunkte",
        "es": "Puntos de paso",
        "fr": "Étapes",
        "pt": "Pontos de passagem",
        "sv": "Vägpunkter"
    },
    "Weather": {
        "cs": "Počasí",
        "da": "Vejr",
        "de": "Wetter",
        "es": "Meteorología",
        "fr": "Météo",
        "pt": "Tempo",
        "sv": "Väder"
    },
    "White dwarf": {
        "cs": "Bílý trpaslík",
        "da": "Hvid dværg",
        "de": "Weißer Zwerg",
        "es": "Enana blanca",
        "fr": "Naine blanche",
        "pt": "Anã branca",
        "sv": "Vit dvärg"
    },
    "Wind %lld km/h from the %@": {
        "cs": "Vítr %lld km/h od %@",
        "da": "Vind %lld km/t fra %@",
        "de": "Wind %lld km/h aus %@",
        "es": "Viento de %lld km/h del %@",
        "fr": "Vent de %lld km/h venant du %@",
        "pt": "Vento de %lld km/h de %@",
        "sv": "Vind %lld km/h från %@"
    },
    "With a filter mask": {
        "cs": "S filtrační maskou",
        "da": "Med filtermaske",
        "de": "Mit Filtermaske",
        "es": "Con máscara filtrante",
        "fr": "Avec un masque filtrant",
        "pt": "Com máscara filtrante",
        "sv": "Med filtermask"
    },
    "Wolf–Rayet star": {
        "cs": "Hvězda Wolf–Rayet",
        "da": "Wolf–Rayet-stjerne",
        "de": "Wolf–Rayet-Stern",
        "es": "Estrella Wolf–Rayet",
        "fr": "Étoile Wolf–Rayet",
        "pt": "Estrela Wolf–Rayet",
        "sv": "Wolf–Rayet-stjärna"
    },
    "World Map": {
        "cs": "Mapa světa",
        "da": "Verdenskort",
        "de": "Weltkarte",
        "es": "Mapa del mundo",
        "fr": "Carte du monde",
        "pt": "Mapa do Mundo",
        "sv": "Världskarta"
    },
    "World map © TravellerMap.com and its contributors": {
        "cs": "Mapa světa © TravellerMap.com a přispěvatelé",
        "da": "Verdenskort © TravellerMap.com og bidragydere",
        "de": "Weltkarte © TravellerMap.com und Mitwirkende",
        "es": "Mapa del mundo © TravellerMap.com y sus colaboradores",
        "fr": "Carte du monde © TravellerMap.com et ses contributeurs",
        "pt": "Mapa do mundo © TravellerMap.com e seus colaboradores",
        "sv": "Världskarta © TravellerMap.com och dess bidragsgivare"
    },
    "World's style": {
        "cs": "Styl světa",
        "da": "Verdenens stil",
        "de": "Stil der Welt",
        "es": "Estilo del mundo",
        "fr": "Style du monde",
        "pt": "Estilo do mundo",
        "sv": "Världens stil"
    },
    "Worlds": {
        "cs": "Světy",
        "da": "Verdener",
        "de": "Welten",
        "es": "Mundos",
        "fr": "Mondes",
        "pt": "Mundos",
        "sv": "Världar"
    },
    "Xboat routes  %lld": {
        "cs": "Trasy xboatů  %lld",
        "da": "Xboat-ruter  %lld",
        "de": "Xboat-Routen  %lld",
        "es": "Rutas Xboat  %lld",
        "fr": "Routes Xboat  %lld",
        "pt": "Rotas Xboat  %lld",
        "sv": "Xboat-rutter  %lld"
    },
    "Y dwarf (brown dwarf)": {
        "cs": "Trpaslík Y (hnědý)",
        "da": "Y-dværg (brun dværg)",
        "de": "Y-Zwerg (Brauner Zwerg)",
        "es": "Enana Y (enana marrón)",
        "fr": "Naine Y (naine brune)",
        "pt": "Anã Y (anã marrom)",
        "sv": "Y-dvärg (brun dvärg)"
    },
    "Year": {
        "cs": "Rok",
        "da": "År",
        "de": "Jahr",
        "es": "Año",
        "fr": "Année",
        "pt": "Ano",
        "sv": "År"
    },
    "Yes": {
        "cs": "Ano",
        "da": "Ja",
        "de": "Ja",
        "es": "Sí",
        "fr": "Oui",
        "pt": "Sim",
        "sv": "Ja"
    },
    "Zone": {
        "cs": "Zóna",
        "da": "Zone",
        "de": "Zone",
        "es": "Zona",
        "fr": "Zone",
        "pt": "Zona",
        "sv": "Zon"
    },
    "Zoom to the selected world's subsector": {
        "cs": "Přiblížit na podsektor vybraného světa",
        "da": "Zoom ind på den valgte verdens undersektor",
        "de": "Auf den Subsektor der gewählten Welt zoomen",
        "es": "Acercar al subsector del mundo seleccionado",
        "fr": "Zoomer sur le sous-secteur du monde sélectionné",
        "pt": "Ampliar até o subsetor do mundo selecionado",
        "sv": "Zooma in på den valda världens undersektor"
    },
    "cells": {
        "cs": "buňky",
        "da": "celler",
        "de": "Zellen",
        "es": "celdas",
        "fr": "cellules",
        "pt": "células",
        "sv": "celler"
    },
    "companion": {
        "cs": "průvodce",
        "da": "ledsager",
        "de": "Begleiter",
        "es": "compañera",
        "fr": "compagnon",
        "pt": "companheira",
        "sv": "följeslagare"
    },
    "ice": {
        "cs": "led",
        "da": "is",
        "de": "Eis",
        "es": "hielo",
        "fr": "glace",
        "pt": "gelo",
        "sv": "is"
    },
    "km across": {
        "cs": "km v průměru",
        "da": "km i diameter",
        "de": "km Durchmesser",
        "es": "km de diámetro",
        "fr": "km de diamètre",
        "pt": "km de diâmetro",
        "sv": "km i diameter"
    },
    "ly across": {
        "cs": "ly v průměru",
        "da": "lysår i diameter",
        "de": "Lj Durchmesser",
        "es": "ly de diámetro",
        "fr": "al de diamètre",
        "pt": "ly de diâmetro",
        "sv": "ljusår i diameter"
    },
    "minor changes": {
        "cs": "drobné změny",
        "da": "mindre ændringer",
        "de": "kleine Änderungen",
        "es": "cambios menores",
        "fr": "modifications mineures",
        "pt": "pequenas alterações",
        "sv": "mindre ändringar"
    },
    "ocean": {
        "cs": "oceán",
        "da": "ocean",
        "de": "Ozean",
        "es": "océano",
        "fr": "océan",
        "pt": "oceano",
        "sv": "ocean"
    },
    "primary": {
        "cs": "hlavní",
        "da": "primær",
        "de": "Hauptstern",
        "es": "primaria",
        "fr": "primaire",
        "pt": "primária",
        "sv": "primär"
    },
    "secondary": {
        "cs": "vedlejší",
        "da": "sekundær",
        "de": "Sekundärstern",
        "es": "secundaria",
        "fr": "secondaire",
        "pt": "secundária",
        "sv": "sekundär"
    },
    "subsector names changed": {
        "cs": "názvy podsektorů změněny",
        "da": "undersektornavne ændret",
        "de": "Subsektornamen geändert",
        "es": "nombres de subsector cambiados",
        "fr": "noms de sous-secteurs modifiés",
        "pt": "nomes de subsetores alterados",
        "sv": "undersektornamn ändrade"
    },
    "to": {
        "cs": "až",
        "da": "til",
        "de": "bis",
        "es": "a",
        "fr": "à",
        "pt": "a",
        "sv": "till"
    },
    "was %@": {
        "cs": "dříve %@",
        "da": "var %@",
        "de": "war %@",
        "es": "antes %@",
        "fr": "auparavant %@",
        "pt": "era %@",
        "sv": "var %@"
    },
    "largest group %@%, one other group %@%": {
        "cs": "největší skupina %@ %, jedna další skupina %@ %",
        "da": "største gruppe %@%, én anden gruppe %@%",
        "de": "größte Gruppe %@ %, eine weitere Gruppe %@ %",
        "es": "grupo más numeroso %@%, otro grupo %@%",
        "fr": "groupe le plus nombreux %@ %, un autre groupe %@ %",
        "pt": "maior grupo %@%, outro grupo %@%",
        "sv": "största grupp %@ %, en annan grupp %@ %"
    },
    "largest group %@%, %@ other groups %@%": {
        "cs": "největší skupina %@ %, další skupiny (%@) %@ %",
        "da": "største gruppe %@%, %@ andre grupper %@%",
        "de": "größte Gruppe %@ %, %@ weitere Gruppen %@ %",
        "es": "grupo más numeroso %@%, %@ otros grupos %@%",
        "fr": "groupe le plus nombreux %@ %, %@ autres groupes %@ %",
        "pt": "maior grupo %@%, %@ outros grupos %@%",
        "sv": "största grupp %@ %, %@ andra grupper %@ %"
    },
    "Resolving world…": {
        "cs": "Zpřesňuje se svět…",
        "da": "Forfiner verden…",
        "de": "Welt wird verfeinert…",
        "es": "Refinando el mundo…",
        "fr": "Affinage du monde…",
        "pt": "Refinando o mundo…",
        "sv": "Förfinar världen…"
    },
    "Back to the hex map": {
        "cs": "Zpět na hexovou mapu",
        "da": "Tilbage til hexkortet",
        "de": "Zurück zur Hexkarte",
        "es": "Volver al mapa hexagonal",
        "fr": "Retour à la carte hexagonale",
        "pt": "Voltar ao mapa hexagonal",
        "sv": "Tillbaka till hexkartan"
    },
    "Back to the star map": {
        "cs": "Zpět na hvězdnou mapu",
        "da": "Tilbage til stjernekortet",
        "de": "Zurück zur Sternkarte",
        "es": "Volver al mapa estelar",
        "fr": "Retour à la carte stellaire",
        "pt": "Voltar ao mapa estelar",
        "sv": "Tillbaka till stjärnkartan"
    },
    "This device doesn't have enough memory for high-resolution worlds, so worlds are back at 1×.": {
        "cs": "Toto zařízení nemá dost paměti pro světy ve vysokém rozlišení, takže se světy vrátily na 1×.",
        "da": "Denne enhed har ikke hukommelse nok til verdener i høj opløsning, så verdener er tilbage på 1×.",
        "de": "Dieses Gerät hat nicht genug Speicher für hochaufgelöste Welten, daher werden Welten wieder mit 1× angezeigt.",
        "es": "Este dispositivo no tiene suficiente memoria para mundos en alta resolución, así que los mundos vuelven a 1×.",
        "fr": "Cet appareil n’a pas assez de mémoire pour les mondes en haute résolution ; les mondes reviennent donc à 1×.",
        "pt": "Este dispositivo não tem memória suficiente para mundos em alta resolução, por isso os mundos voltaram a 1×.",
        "sv": "Den här enheten har inte tillräckligt med minne för världar i hög upplösning, så världar visas åter i 1×."
    },
    "Minor planet": {
        "cs": "Planetka",
        "da": "Småplanet",
        "de": "Kleinplanet",
        "es": "Planeta menor",
        "fr": "Planète mineure",
        "pt": "Planeta menor",
        "sv": "Småplanet"
    },
    "Under domes": {
        "cs": "Pod kopulemi",
        "da": "Under kupler",
        "de": "Unter Kuppeln",
        "es": "Bajo cúpulas",
        "fr": "Sous des dômes",
        "pt": "Sob cúpulas",
        "sv": "Under kupoler"
    },
    "Pressurized buildings": {
        "cs": "Přetlakové budovy",
        "da": "Bygninger under tryk",
        "de": "Druckgebäude",
        "es": "Edificios presurizados",
        "fr": "Bâtiments pressurisés",
        "pt": "Edifícios pressurizados",
        "sv": "Tryckbyggnader"
    },
    "A few small seas (16–25%)": {
        "cs": "Několik malých moří (16–25 %)",
        "da": "Nogle få små have (16–25%)",
        "de": "Einige kleine Meere (16–25 %)",
        "es": "Unos pocos mares pequeños (16–25 %)",
        "fr": "Quelques petites mers (16–25 %)",
        "pt": "Alguns mares pequenos (16–25%)",
        "sv": "Några små hav (16–25 %)"
    },
    "Agricultural": {
        "cs": "Zemědělský",
        "da": "Landbrug",
        "de": "Agrarwelt",
        "es": "Agrícola",
        "fr": "Agricole",
        "pt": "Agrícola",
        "sv": "Jordbruk"
    },
    "All bladed weapons, stunners": {
        "cs": "Všechny chladné zbraně, omračovače",
        "da": "Alle blankvåben, lammevåben",
        "de": "Alle Klingenwaffen, Betäuber",
        "es": "Todas las armas blancas, aturdidores",
        "fr": "Toutes les armes blanches, étourdisseurs",
        "pt": "Todas as armas brancas, atordoadores",
        "sv": "Alla blankvapen, bedövningsvapen"
    },
    "All firearms except shotguns and stunners": {
        "cs": "Všechny střelné zbraně kromě brokovnic a omračovačů",
        "da": "Alle skydevåben undtagen haglgeværer og lammevåben",
        "de": "Alle Schusswaffen außer Schrotflinten und Betäubern",
        "es": "Todas las armas de fuego salvo escopetas y aturdidores",
        "fr": "Toutes les armes à feu sauf fusils de chasse et étourdisseurs",
        "pt": "Todas as armas de fogo exceto espingardas e atordoadores",
        "sv": "Alla skjutvapen utom hagelgevär och bedövningsvapen"
    },
    "Almost entirely water (96–100%)": {
        "cs": "Téměř jen voda (96–100 %)",
        "da": "Næsten udelukkende vand (96–100%)",
        "de": "Fast nur Wasser (96–100 %)",
        "es": "Casi todo agua (96–100 %)",
        "fr": "Presque entièrement d’eau (96–100 %)",
        "pt": "Quase só água (96–100%)",
        "sv": "Nästan bara vatten (96–100 %)"
    },
    "Any weapons": {
        "cs": "Jakékoli zbraně",
        "da": "Alle våben",
        "de": "Jegliche Waffen",
        "es": "Cualquier arma",
        "fr": "Toutes armes",
        "pt": "Quaisquer armas",
        "sv": "Alla vapen"
    },
    "Asteroid": {
        "cs": "Asteroid",
        "da": "Asteroide",
        "de": "Asteroid",
        "es": "Asteroide",
        "fr": "Astéroïde",
        "pt": "Asteroide",
        "sv": "Asteroid"
    },
    "Asteroid or planetoid belt": {
        "cs": "Pás asteroidů nebo planetek",
        "da": "Asteroide- eller planetoidebælte",
        "de": "Asteroiden- oder Planetoidengürtel",
        "es": "Cinturón de asteroides o planetoides",
        "fr": "Ceinture d’astéroïdes ou de planétoïdes",
        "pt": "Cinturão de asteroides ou planetoides",
        "sv": "Asteroid- eller planetoidbälte"
    },
    "Atm %@": {
        "cs": "Atm %@",
        "da": "Atm %@",
        "de": "Atm %@",
        "es": "Atm %@",
        "fr": "Atm %@",
        "pt": "Atm %@",
        "sv": "Atm %@"
    },
    "Balkanisation": {
        "cs": "Balkanizace",
        "da": "Balkanisering",
        "de": "Balkanisierung",
        "es": "Balcanización",
        "fr": "Balkanisation",
        "pt": "Balcanização",
        "sv": "Balkanisering"
    },
    "Barren": {
        "cs": "Pustý",
        "da": "Ubeboet",
        "de": "Unbewohnt",
        "es": "Yermo",
        "fr": "Stérile",
        "pt": "Estéril",
        "sv": "Obebodd"
    },
    "Billions": {
        "cs": "Miliardy",
        "da": "Milliarder",
        "de": "Milliarden",
        "es": "Miles de millones",
        "fr": "Milliards",
        "pt": "Bilhões",
        "sv": "Miljarder"
    },
    "Captive Government": {
        "cs": "Loutková vláda",
        "da": "Fremmedstyre",
        "de": "Fremdregierung",
        "es": "Gobierno cautivo",
        "fr": "Gouvernement captif",
        "pt": "Governo cativo",
        "sv": "Främmande styre"
    },
    "Charismatic Dictator": {
        "cs": "Charismatický diktátor",
        "da": "Karismatisk diktator",
        "de": "Charismatischer Diktator",
        "es": "Dictador carismático",
        "fr": "Dictateur charismatique",
        "pt": "Ditador carismático",
        "sv": "Karismatisk diktator"
    },
    "Charismatic Oligarchy": {
        "cs": "Charismatická oligarchie",
        "da": "Karismatisk oligarki",
        "de": "Charismatische Oligarchie",
        "es": "Oligarquía carismática",
        "fr": "Oligarchie charismatique",
        "pt": "Oligarquia carismática",
        "sv": "Karismatisk oligarki"
    },
    "Civil Service Bureaucracy": {
        "cs": "Úřednická byrokracie",
        "da": "Embedsmandsbureaukrati",
        "de": "Beamtenbürokratie",
        "es": "Burocracia funcionarial",
        "fr": "Bureaucratie de fonctionnaires",
        "pt": "Burocracia de funcionários",
        "sv": "Ämbetsmannabyråkrati"
    },
    "Company/Corporation": {
        "cs": "Firma/korporace",
        "da": "Firma/koncern",
        "de": "Firma/Konzern",
        "es": "Compañía/Corporación",
        "fr": "Compagnie/Corporation",
        "pt": "Companhia/Corporação",
        "sv": "Företag/koncern"
    },
    "Corrosive": {
        "cs": "Žíravá",
        "da": "Ætsende",
        "de": "Ätzend",
        "es": "Corrosiva",
        "fr": "Corrosive",
        "pt": "Corrosiva",
        "sv": "Frätande"
    },
    "Data sheets and printed world data show only what the Traveller System Reference Document defines: the Universal World Profile's codes, temperature, bases, trade codes and travel zones. Nothing from the World Builder's Handbook, and no physical figures, orbits, rotation or almanac profile. Worlds are generated as before.": {
        "cs": "Datové listy a tištěná data světů ukazují jen to, co definuje Traveller System Reference Document: kódy Universal World Profile, teplotu, základny, obchodní kódy a cestovní zóny. Nic z World Builder's Handbook a žádné fyzikální údaje, oběžné dráhy, rotaci ani almanachový profil. Světy se generují jako dříve.",
        "da": "Datablade og udskrevne verdensdata viser kun det, Traveller System Reference Document definerer: Universal World Profiles koder, temperatur, baser, handelskoder og rejsezoner. Intet fra World Builder's Handbook og ingen fysiske tal, baner, rotation eller almanakprofil. Verdener genereres som før.",
        "de": "Datenblätter und gedruckte Weltdaten zeigen nur, was das Traveller System Reference Document festlegt: die Codes des Universal World Profile, Temperatur, Basen, Handelscodes und Reisezonen. Nichts aus dem World Builder’s Handbook, keine physikalischen Werte, Umlaufbahnen, Rotation oder Almanachprofile. Welten werden wie bisher erzeugt.",
        "es": "Las fichas de datos y los datos impresos del mundo muestran solo lo que define el Traveller System Reference Document: los códigos del Universal World Profile, la temperatura, las bases, los códigos comerciales y las zonas de viaje. Nada del World Builder’s Handbook, ni cifras físicas, órbitas, rotación o perfil de almanaque. Los mundos se generan como antes.",
        "fr": "Les fiches et les données imprimées des mondes ne montrent que ce que définit le Traveller System Reference Document : les codes du Universal World Profile, la température, les bases, les codes commerciaux et les zones de voyage. Rien du World Builder’s Handbook, ni valeurs physiques, orbites, rotation ou profil d’almanach. Les mondes sont générés comme avant.",
        "pt": "As fichas e os dados impressos dos mundos mostram só o que o Traveller System Reference Document define: os códigos do Universal World Profile, a temperatura, as bases, os códigos comerciais e as zonas de viagem. Nada do World Builder’s Handbook, nem valores físicos, órbitas, rotação ou perfil de almanaque. Os mundos são gerados como antes.",
        "sv": "Datablad och utskrivna världsdata visar bara det som Traveller System Reference Document definierar: Universal World Profiles koder, temperatur, baser, handelskoder och resezoner. Inget från World Builder's Handbook och inga fysiska värden, banor, rotation eller almanacksprofil. Världar genereras som tidigare."
    },
    "Dense": {
        "cs": "Hustá",
        "da": "Tæt",
        "de": "Dicht",
        "es": "Densa",
        "fr": "Dense",
        "pt": "Densa",
        "sv": "Tät"
    },
    "Dense, tainted": {
        "cs": "Hustá, znečištěná",
        "da": "Tæt, forurenet",
        "de": "Dicht, verunreinigt",
        "es": "Densa, contaminada",
        "fr": "Dense, viciée",
        "pt": "Densa, contaminada",
        "sv": "Tät, förorenad"
    },
    "Desert world (0–5%)": {
        "cs": "Pouštní svět (0–5 %)",
        "da": "Ørkenverden (0–5%)",
        "de": "Wüstenwelt (0–5 %)",
        "es": "Mundo desértico (0–5 %)",
        "fr": "Monde désertique (0–5 %)",
        "pt": "Mundo desértico (0–5%)",
        "sv": "Ökenvärld (0–5 %)"
    },
    "Dry world (6–15%)": {
        "cs": "Suchý svět (6–15 %)",
        "da": "Tør verden (6–15%)",
        "de": "Trockene Welt (6–15 %)",
        "es": "Mundo seco (6–15 %)",
        "fr": "Monde sec (6–15 %)",
        "pt": "Mundo seco (6–15%)",
        "sv": "Torr värld (6–15 %)"
    },
    "Earth-like world (66–75%)": {
        "cs": "Svět podobný Zemi (66–75 %)",
        "da": "Jordlignende verden (66–75%)",
        "de": "Erdähnliche Welt (66–75 %)",
        "es": "Mundo similar a la Tierra (66–75 %)",
        "fr": "Monde semblable à la Terre (66–75 %)",
        "pt": "Mundo semelhante à Terra (66–75%)",
        "sv": "Jordliknande värld (66–75 %)"
    },
    "Excellent": {
        "cs": "Vynikající",
        "da": "Fremragende",
        "de": "Hervorragend",
        "es": "Excelente",
        "fr": "Excellent",
        "pt": "Excelente",
        "sv": "Utmärkt"
    },
    "Exotic": {
        "cs": "Exotická",
        "da": "Eksotisk",
        "de": "Exotisch",
        "es": "Exótica",
        "fr": "Exotique",
        "pt": "Exótica",
        "sv": "Exotisk"
    },
    "Feudal Technocracy": {
        "cs": "Feudální technokracie",
        "da": "Feudalt teknokrati",
        "de": "Feudale Technokratie",
        "es": "Tecnocracia feudal",
        "fr": "Technocratie féodale",
        "pt": "Tecnocracia feudal",
        "sv": "Feodal teknokrati"
    },
    "Few": {
        "cs": "Málo",
        "da": "Få",
        "de": "Wenige",
        "es": "Unos pocos",
        "fr": "Quelques-uns",
        "pt": "Poucos",
        "sv": "Få"
    },
    "Fluid Oceans": {
        "cs": "Cizí oceány",
        "da": "Fremmede væskeoceaner",
        "de": "Fremdflüssige Ozeane",
        "es": "Océanos de fluidos",
        "fr": "Océans de fluides",
        "pt": "Oceanos de fluidos",
        "sv": "Främmande vätskeoceaner"
    },
    "Frontier": {
        "cs": "Pohraniční",
        "da": "Grænsepost",
        "de": "Grenzposten",
        "es": "Fronterizo",
        "fr": "Frontière",
        "pt": "Fronteiriço",
        "sv": "Gränspost"
    },
    "Garden": {
        "cs": "Zahrada",
        "da": "Haveverden",
        "de": "Gartenwelt",
        "es": "Jardín",
        "fr": "Jardin",
        "pt": "Jardim",
        "sv": "Trädgårdsvärld"
    },
    "Good": {
        "cs": "Dobré",
        "da": "God",
        "de": "Gut",
        "es": "Bueno",
        "fr": "Bon",
        "pt": "Bom",
        "sv": "Bra"
    },
    "Heavy weapons": {
        "cs": "Těžké zbraně",
        "da": "Tunge våben",
        "de": "Schwere Waffen",
        "es": "Armas pesadas",
        "fr": "Armes lourdes",
        "pt": "Armas pesadas",
        "sv": "Tunga vapen"
    },
    "High Population": {
        "cs": "Vysoká populace",
        "da": "Stor befolkning",
        "de": "Hohe Bevölkerung",
        "es": "Población alta",
        "fr": "Population élevée",
        "pt": "População alta",
        "sv": "Stor befolkning"
    },
    "High Tech": {
        "cs": "High-tech",
        "da": "Højteknologi",
        "de": "Hochtechnologie",
        "es": "Alta tecnología",
        "fr": "Haute technologie",
        "pt": "Alta tecnologia",
        "sv": "Högteknologi"
    },
    "Hundreds": {
        "cs": "Stovky",
        "da": "Hundreder",
        "de": "Hunderte",
        "es": "Cientos",
        "fr": "Centaines",
        "pt": "Centenas",
        "sv": "Hundratals"
    },
    "Hundreds of billions": {
        "cs": "Stovky miliard",
        "da": "Hundreder af milliarder",
        "de": "Hunderte Milliarden",
        "es": "Cientos de miles de millones",
        "fr": "Centaines de milliards",
        "pt": "Centenas de bilhões",
        "sv": "Hundratals miljarder"
    },
    "Hundreds of millions": {
        "cs": "Stovky milionů",
        "da": "Hundreder af millioner",
        "de": "Hunderte Millionen",
        "es": "Cientos de millones",
        "fr": "Centaines de millions",
        "pt": "Centenas de milhões",
        "sv": "Hundratals miljoner"
    },
    "Hundreds of thousands": {
        "cs": "Statisíce",
        "da": "Hundredtusinder",
        "de": "Hunderttausende",
        "es": "Cientos de miles",
        "fr": "Centaines de milliers",
        "pt": "Centenas de milhares",
        "sv": "Hundratusentals"
    },
    "Hyd %@": {
        "cs": "Hyd %@",
        "da": "Hyd %@",
        "de": "Hyd %@",
        "es": "Hid %@",
        "fr": "Hyd %@",
        "pt": "Hid %@",
        "sv": "Hyd %@"
    },
    "Hydrographics": {
        "cs": "Hydrografie",
        "da": "Hydrografi",
        "de": "Hydrografie",
        "es": "Hidrografía",
        "fr": "Hydrographie",
        "pt": "Hidrografia",
        "sv": "Hydrografi"
    },
    "Ice-Capped": {
        "cs": "Ledové čepičky",
        "da": "Iskapper",
        "de": "Eiskappen",
        "es": "Casquetes de hielo",
        "fr": "Calottes glaciaires",
        "pt": "Calotas de gelo",
        "sv": "Isklädda poler"
    },
    "Imperial consulate": {
        "cs": "Imperiální konzulát",
        "da": "Kejserligt konsulat",
        "de": "Imperiales Konsulat",
        "es": "Consulado imperial",
        "fr": "Consulat impérial",
        "pt": "Consulado imperial",
        "sv": "Imperiets konsulat"
    },
    "Impersonal Bureaucracy": {
        "cs": "Neosobní byrokracie",
        "da": "Upersonligt bureaukrati",
        "de": "Unpersönliche Bürokratie",
        "es": "Burocracia impersonal",
        "fr": "Bureaucratie impersonnelle",
        "pt": "Burocracia impessoal",
        "sv": "Opersonlig byråkrati"
    },
    "Insidious": {
        "cs": "Zákeřná",
        "da": "Snigende",
        "de": "Heimtückisch",
        "es": "Insidiosa",
        "fr": "Insidieuse",
        "pt": "Insidiosa",
        "sv": "Försåtlig"
    },
    "Large oceans (46–55%)": {
        "cs": "Velké oceány (46–55 %)",
        "da": "Store oceaner (46–55%)",
        "de": "Große Ozeane (46–55 %)",
        "es": "Grandes océanos (46–55 %)",
        "fr": "Grands océans (46–55 %)",
        "pt": "Grandes oceanos (46–55%)",
        "sv": "Stora oceaner (46–55 %)"
    },
    "Large oceans (56–65%)": {
        "cs": "Velké oceány (56–65 %)",
        "da": "Store oceaner (56–65%)",
        "de": "Große Ozeane (56–65 %)",
        "es": "Grandes océanos (56–65 %)",
        "fr": "Grands océans (56–65 %)",
        "pt": "Grandes oceanos (56–65%)",
        "sv": "Stora oceaner (56–65 %)"
    },
    "Law level": {
        "cs": "Úroveň zákonů",
        "da": "Lovniveau",
        "de": "Gesetzesstufe",
        "es": "Nivel de ley",
        "fr": "Niveau de loi",
        "pt": "Nível de lei",
        "sv": "Lagnivå"
    },
    "Light assault weapons and submachine guns": {
        "cs": "Lehké útočné zbraně a samopaly",
        "da": "Lette angrebsvåben og maskinpistoler",
        "de": "Leichte Sturmwaffen und Maschinenpistolen",
        "es": "Armas de asalto ligeras y subfusiles",
        "fr": "Armes d’assaut légères et pistolets-mitrailleurs",
        "pt": "Armas de assalto leves e submetralhadoras",
        "sv": "Lätta automatvapen och kulsprutepistoler"
    },
    "Low": {
        "cs": "Nízká",
        "da": "Lav",
        "de": "Niedrig",
        "es": "Baja",
        "fr": "Basse",
        "pt": "Baixa",
        "sv": "Låg"
    },
    "Low Population": {
        "cs": "Nízká populace",
        "da": "Lille befolkning",
        "de": "Geringe Bevölkerung",
        "es": "Población baja",
        "fr": "Population faible",
        "pt": "População baixa",
        "sv": "Liten befolkning"
    },
    "Low Tech": {
        "cs": "Nízká technologie",
        "da": "Lavteknologi",
        "de": "Niedrige Technologie",
        "es": "Baja tecnología",
        "fr": "Basse technologie",
        "pt": "Baixa tecnologia",
        "sv": "Lågteknologi"
    },
    "Millions": {
        "cs": "Miliony",
        "da": "Millioner",
        "de": "Millionen",
        "es": "Millones",
        "fr": "Millions",
        "pt": "Milhões",
        "sv": "Miljoner"
    },
    "Naval base": {
        "cs": "Námořní základna",
        "da": "Flådebase",
        "de": "Marinebasis",
        "es": "Base naval",
        "fr": "Base navale",
        "pt": "Base naval",
        "sv": "Flottbas"
    },
    "Negligible": {
        "cs": "Zanedbatelné",
        "da": "Ubetydelig",
        "de": "Vernachlässigbar",
        "es": "Insignificante",
        "fr": "Négligeable",
        "pt": "Desprezível",
        "sv": "Försumbar"
    },
    "No starport": {
        "cs": "Žádný kosmodrom",
        "da": "Ingen rumhavn",
        "de": "Kein Raumhafen",
        "es": "Sin espaciopuerto",
        "fr": "Pas de spatioport",
        "pt": "Sem espaçoporto",
        "sv": "Ingen rymdhamn"
    },
    "Non-Agricultural": {
        "cs": "Nezemědělský",
        "da": "Ikke-landbrug",
        "de": "Nicht-agrarisch",
        "es": "No agrícola",
        "fr": "Non agricole",
        "pt": "Não agrícola",
        "sv": "Icke-jordbruk"
    },
    "Non-Charismatic Leader": {
        "cs": "Necharismatický vůdce",
        "da": "Ikke-karismatisk leder",
        "de": "Nicht-charismatischer Führer",
        "es": "Líder no carismático",
        "fr": "Dirigeant non charismatique",
        "pt": "Líder não carismático",
        "sv": "Icke-karismatisk ledare"
    },
    "Non-Industrial": {
        "cs": "Neprůmyslový",
        "da": "Ikke-industriel",
        "de": "Nicht-industriell",
        "es": "No industrial",
        "fr": "Non industriel",
        "pt": "Não industrial",
        "sv": "Icke-industriell"
    },
    "Only a few small islands (86–95%)": {
        "cs": "Jen několik malých ostrovů (86–95 %)",
        "da": "Kun nogle få små øer (86–95%)",
        "de": "Nur wenige kleine Inseln (86–95 %)",
        "es": "Solo unas pocas islas pequeñas (86–95 %)",
        "fr": "Seulement quelques petites îles (86–95 %)",
        "pt": "Só algumas ilhas pequenas (86–95%)",
        "sv": "Bara några små öar (86–95 %)"
    },
    "Participating Democracy": {
        "cs": "Participativní demokracie",
        "da": "Deltagende demokrati",
        "de": "Direkte Demokratie",
        "es": "Democracia participativa",
        "fr": "Démocratie participative",
        "pt": "Democracia participativa",
        "sv": "Deltagande demokrati"
    },
    "Personal concealable weapons": {
        "cs": "Osobní skryté zbraně",
        "da": "Personlige våben, der kan skjules",
        "de": "Verdeckt tragbare Waffen",
        "es": "Armas personales ocultables",
        "fr": "Armes personnelles dissimulables",
        "pt": "Armas pessoais ocultáveis",
        "sv": "Personliga vapen som kan döljas"
    },
    "Pirate base": {
        "cs": "Pirátská základna",
        "da": "Piratbase",
        "de": "Piratenbasis",
        "es": "Base pirata",
        "fr": "Base pirate",
        "pt": "Base pirata",
        "sv": "Piratbas"
    },
    "Poison gas, explosives, undetectable weapons, weapons of mass destruction": {
        "cs": "Bojové plyny, výbušniny, nezjistitelné zbraně, zbraně hromadného ničení",
        "da": "Giftgas, sprængstoffer, våben der ikke kan opdages, masseødelæggelsesvåben",
        "de": "Giftgas, Sprengstoff, nicht aufspürbare Waffen, Massenvernichtungswaffen",
        "es": "Gas venenoso, explosivos, armas indetectables, armas de destrucción masiva",
        "fr": "Gaz toxiques, explosifs, armes indétectables, armes de destruction massive",
        "pt": "Gás venenoso, explosivos, armas indetectáveis, armas de destruição em massa",
        "sv": "Giftgas, sprängämnen, vapen som inte kan upptäckas, massförstörelsevapen"
    },
    "Poor": {
        "cs": "Špatné",
        "da": "Dårlig",
        "de": "Arm",
        "es": "Pobre",
        "fr": "Pauvre",
        "pt": "Pobre",
        "sv": "Dålig"
    },
    "Portable energy weapons": {
        "cs": "Přenosné energetické zbraně",
        "da": "Bærbare energivåben",
        "de": "Tragbare Energiewaffen",
        "es": "Armas de energía portátiles",
        "fr": "Armes à énergie portatives",
        "pt": "Armas de energia portáteis",
        "sv": "Bärbara energivapen"
    },
    "Religious Dictatorship": {
        "cs": "Náboženská diktatura",
        "da": "Religiøst diktatur",
        "de": "Religiöse Diktatur",
        "es": "Dictadura religiosa",
        "fr": "Dictature religieuse",
        "pt": "Ditadura religiosa",
        "sv": "Religiös diktatur"
    },
    "Representative Democracy": {
        "cs": "Zastupitelská demokracie",
        "da": "Repræsentativt demokrati",
        "de": "Repräsentative Demokratie",
        "es": "Democracia representativa",
        "fr": "Démocratie représentative",
        "pt": "Democracia representativa",
        "sv": "Representativ demokrati"
    },
    "Research base": {
        "cs": "Výzkumná základna",
        "da": "Forskningsbase",
        "de": "Forschungsbasis",
        "es": "Base de investigación",
        "fr": "Base de recherche",
        "pt": "Base de pesquisa",
        "sv": "Forskningsbas"
    },
    "Rich": {
        "cs": "Bohaté",
        "da": "Rig",
        "de": "Reich",
        "es": "Rico",
        "fr": "Riche",
        "pt": "Rico",
        "sv": "Rik"
    },
    "Roasting": {
        "cs": "Rozpálené",
        "da": "Brændende hed",
        "de": "Glühend heiß",
        "es": "Abrasador",
        "fr": "Brûlant",
        "pt": "Escaldante",
        "sv": "Brännhet"
    },
    "Routine": {
        "cs": "Běžný",
        "da": "Rutine",
        "de": "Gewöhnlich",
        "es": "Rutinario",
        "fr": "Ordinaire",
        "pt": "Rotineiro",
        "sv": "Rutin"
    },
    "Scout base": {
        "cs": "Průzkumná základna",
        "da": "Spejderbase",
        "de": "Scoutbasis",
        "es": "Base de exploradores",
        "fr": "Base d’éclaireurs",
        "pt": "Base de exploradores",
        "sv": "Spaningsbas"
    },
    "Self-Perpetuating Oligarchy": {
        "cs": "Samoobnovná oligarchie",
        "da": "Selvopretholdende oligarki",
        "de": "Selbsterhaltende Oligarchie",
        "es": "Oligarquía autoperpetuada",
        "fr": "Oligarchie auto-perpétuée",
        "pt": "Oligarquia autoperpetuada",
        "sv": "Självbevarande oligarki"
    },
    "Shotguns": {
        "cs": "Brokovnice",
        "da": "Haglgeværer",
        "de": "Schrotflinten",
        "es": "Escopetas",
        "fr": "Fusils de chasse",
        "pt": "Espingardas",
        "sv": "Hagelgevär"
    },
    "Size %@": {
        "cs": "Velikost %@",
        "da": "Størrelse %@",
        "de": "Größe %@",
        "es": "Tamaño %@",
        "fr": "Taille %@",
        "pt": "Tamanho %@",
        "sv": "Storlek %@"
    },
    "Small seas and oceans (26–35%)": {
        "cs": "Malá moře a oceány (26–35 %)",
        "da": "Små have og oceaner (26–35%)",
        "de": "Kleine Meere und Ozeane (26–35 %)",
        "es": "Mares y océanos pequeños (26–35 %)",
        "fr": "Petites mers et océans (26–35 %)",
        "pt": "Mares e oceanos pequenos (26–35%)",
        "sv": "Små hav och oceaner (26–35 %)"
    },
    "Standard, tainted": {
        "cs": "Běžná, znečištěná",
        "da": "Standard, forurenet",
        "de": "Normal, verunreinigt",
        "es": "Estándar, contaminada",
        "fr": "Standard, viciée",
        "pt": "Padrão, contaminada",
        "sv": "Standard, förorenad"
    },
    "Surface gravity": {
        "cs": "Povrchová gravitace",
        "da": "Tyngdekraft ved overfladen",
        "de": "Oberflächenschwerkraft",
        "es": "Gravedad superficial",
        "fr": "Gravité de surface",
        "pt": "Gravidade à superfície",
        "sv": "Ytgravitation"
    },
    "TAS hostel": {
        "cs": "Ubytovna TAS",
        "da": "TAS-herberg",
        "de": "TAS-Herberge",
        "es": "Albergue de la TAS",
        "fr": "Auberge TAS",
        "pt": "Albergue da TAS",
        "sv": "TAS-härbärge"
    },
    "Tens of billions": {
        "cs": "Desítky miliard",
        "da": "Titals milliarder",
        "de": "Zehn Milliarden und mehr",
        "es": "Decenas de miles de millones",
        "fr": "Dizaines de milliards",
        "pt": "Dezenas de bilhões",
        "sv": "Tiotals miljarder"
    },
    "Tens of millions": {
        "cs": "Desítky milionů",
        "da": "Titals millioner",
        "de": "Zehnmillionen",
        "es": "Decenas de millones",
        "fr": "Dizaines de millions",
        "pt": "Dezenas de milhões",
        "sv": "Tiotals miljoner"
    },
    "Tens of thousands": {
        "cs": "Desetitisíce",
        "da": "Titusinder",
        "de": "Zehntausende",
        "es": "Decenas de miles",
        "fr": "Dizaines de milliers",
        "pt": "Dezenas de milhares",
        "sv": "Tiotusentals"
    },
    "Thin": {
        "cs": "Řídká",
        "da": "Tynd",
        "de": "Dünn",
        "es": "Tenue",
        "fr": "Ténue",
        "pt": "Rarefeita",
        "sv": "Tunn"
    },
    "Thin, tainted": {
        "cs": "Řídká, znečištěná",
        "da": "Tynd, forurenet",
        "de": "Dünn, verunreinigt",
        "es": "Tenue, contaminada",
        "fr": "Ténue, viciée",
        "pt": "Rarefeita, contaminada",
        "sv": "Tunn, förorenad"
    },
    "Thousands": {
        "cs": "Tisíce",
        "da": "Tusinder",
        "de": "Tausende",
        "es": "Miles",
        "fr": "Milliers",
        "pt": "Milhares",
        "sv": "Tusentals"
    },
    "Trade codes": {
        "cs": "Obchodní kódy",
        "da": "Handelskoder",
        "de": "Handelscodes",
        "es": "Códigos comerciales",
        "fr": "Codes commerciaux",
        "pt": "Códigos comerciais",
        "sv": "Handelskoder"
    },
    "Travel zone": {
        "cs": "Cestovní zóna",
        "da": "Rejsezone",
        "de": "Reisezone",
        "es": "Zona de viaje",
        "fr": "Zone de voyage",
        "pt": "Zona de viagem",
        "sv": "Resezon"
    },
    "Traveller SRD compatible world data": {
        "cs": "Data světů kompatibilní s Traveller SRD",
        "da": "Verdensdata kompatible med Traveller SRD",
        "de": "Traveller-SRD-kompatible Weltdaten",
        "es": "Datos de mundos compatibles con el SRD de Traveller",
        "fr": "Données de mondes compatibles avec le SRD de Traveller",
        "pt": "Dados de mundos compatíveis com o SRD de Traveller",
        "sv": "Världsdata kompatibla med Traveller SRD"
    },
    "Trillions": {
        "cs": "Biliony",
        "da": "Billioner",
        "de": "Billionen",
        "es": "Billones",
        "fr": "Billions",
        "pt": "Trilhões",
        "sv": "Biljoner"
    },
    "UWP": {
        "cs": "UWP",
        "da": "UWP",
        "de": "UWP",
        "es": "UWP",
        "fr": "UWP",
        "pt": "UWP",
        "sv": "UWP"
    },
    "Universal World Profile": {
        "cs": "Universal World Profile",
        "da": "Universal World Profile",
        "de": "Universal World Profile",
        "es": "Universal World Profile",
        "fr": "Universal World Profile",
        "pt": "Universal World Profile",
        "sv": "Universal World Profile"
    },
    "Unusual": {
        "cs": "Neobvyklé",
        "da": "Usædvanlig",
        "de": "Ungewöhnlich",
        "es": "Inusual",
        "fr": "Inhabituelle",
        "pt": "Incomum",
        "sv": "Ovanlig"
    },
    "Vacuum": {
        "cs": "Vakuum",
        "da": "Vakuum",
        "de": "Vakuum",
        "es": "Vacío",
        "fr": "Vide",
        "pt": "Vácuo",
        "sv": "Vakuum"
    },
    "Very dense": {
        "cs": "Velmi hustá",
        "da": "Meget tæt",
        "de": "Sehr dicht",
        "es": "Muy densa",
        "fr": "Très dense",
        "pt": "Muito densa",
        "sv": "Mycket tät"
    },
    "Very thin": {
        "cs": "Velmi řídká",
        "da": "Meget tynd",
        "de": "Sehr dünn",
        "es": "Muy tenue",
        "fr": "Très ténue",
        "pt": "Muito rarefeita",
        "sv": "Mycket tunn"
    },
    "Very thin, tainted": {
        "cs": "Velmi řídká, znečištěná",
        "da": "Meget tynd, forurenet",
        "de": "Sehr dünn, verunreinigt",
        "es": "Muy tenue, contaminada",
        "fr": "Très ténue, viciée",
        "pt": "Muito rarefeita, contaminada",
        "sv": "Mycket tunn, förorenad"
    },
    "Water World": {
        "cs": "Vodní svět",
        "da": "Vandverden",
        "de": "Wasserwelt",
        "es": "Mundo acuático",
        "fr": "Monde aquatique",
        "pt": "Mundo aquático",
        "sv": "Vattenvärld"
    },
    "Water world (76–85%)": {
        "cs": "Vodní svět (76–85 %)",
        "da": "Vandverden (76–85%)",
        "de": "Wasserwelt (76–85 %)",
        "es": "Mundo acuático (76–85 %)",
        "fr": "Monde aquatique (76–85 %)",
        "pt": "Mundo aquático (76–85%)",
        "sv": "Vattenvärld (76–85 %)"
    },
    "Wet world (36–45%)": {
        "cs": "Vlhký svět (36–45 %)",
        "da": "Våd verden (36–45%)",
        "de": "Feuchte Welt (36–45 %)",
        "es": "Mundo húmedo (36–45 %)",
        "fr": "Monde humide (36–45 %)",
        "pt": "Mundo úmido (36–45%)",
        "sv": "Blöt värld (36–45 %)"
    },
    "Estrelas Data": {
        "cs": "Data Estrelas",
        "da": "Estrelas-data",
        "de": "Estrelas-Daten",
        "es": "Datos de Estrelas",
        "fr": "Données Estrelas",
        "pt": "Dados do Estrelas",
        "sv": "Estrelas-data"
    },
    "SRD Data": {
        "cs": "Data SRD",
        "da": "SRD-data",
        "de": "SRD-Daten",
        "es": "Datos del SRD",
        "fr": "Données SRD",
        "pt": "Dados do SRD",
        "sv": "SRD-data"
    },
    "Show Estrelas's own world data: physical figures, orbit, rotation and the almanac profile": {
        "cs": "Zobrazit vlastní data světů Estrelas: fyzikální údaje, oběžnou dráhu, rotaci a almanachový profil",
        "da": "Vis Estrelas' egne verdensdata: fysiske tal, bane, rotation og almanakprofil",
        "de": "Die eigenen Weltdaten von Estrelas zeigen: physikalische Werte, Umlaufbahn, Rotation und Almanachprofil",
        "es": "Mostrar los datos propios de Estrelas: cifras físicas, órbita, rotación y perfil de almanaque",
        "fr": "Afficher les données propres à Estrelas : valeurs physiques, orbite, rotation et profil d’almanach",
        "pt": "Mostrar os dados próprios do Estrelas: valores físicos, órbita, rotação e perfil de almanaque",
        "sv": "Visa Estrelas egna världsdata: fysiska värden, bana, rotation och almanacksprofil"
    },
    "Show only the Traveller SRD's values: the Universal World Profile, trade codes, bases and travel zone": {
        "cs": "Zobrazit jen hodnoty z Traveller SRD: Universal World Profile, obchodní kódy, základny a cestovní zónu",
        "da": "Vis kun Traveller SRD's værdier: Universal World Profile, handelskoder, baser og rejsezone",
        "de": "Nur die Werte des Traveller-SRD zeigen: Universal World Profile, Handelscodes, Basen und Reisezone",
        "es": "Mostrar solo los valores del SRD de Traveller: Universal World Profile, códigos comerciales, bases y zona de viaje",
        "fr": "N’afficher que les valeurs du SRD de Traveller : Universal World Profile, codes commerciaux, bases et zone de voyage",
        "pt": "Mostrar só os valores do SRD de Traveller: Universal World Profile, códigos comerciais, bases e zona de viagem",
        "sv": "Visa bara Traveller SRD:s värden: Universal World Profile, handelskoder, baser och resezon"
    },
    "Under 800 km": {
        "cs": "Pod 800 km",
        "da": "Under 800 km",
        "de": "Unter 800 km",
        "es": "Menos de 800 km",
        "fr": "Moins de 800 km",
        "pt": "Menos de 800 km",
        "sv": "Under 800 km"
    },
    "Both": {
        "cs": "Obojí",
        "da": "Begge",
        "de": "Beides",
        "es": "Ambos",
        "fr": "Les deux",
        "pt": "Ambos",
        "sv": "Båda"
    },
    "Traveller SRD": {
        "cs": "Traveller SRD",
        "da": "Traveller SRD",
        "de": "Traveller-SRD",
        "es": "SRD de Traveller",
        "fr": "SRD de Traveller",
        "pt": "SRD de Traveller",
        "sv": "Traveller SRD"
    },
    "World data on Traveller hex maps": {
        "cs": "Data světů na hexových mapách Traveller",
        "da": "Verdensdata på Traveller-hexkort",
        "de": "Weltdaten auf Traveller-Hexkarten",
        "es": "Datos de mundos en mapas hexagonales de Traveller",
        "fr": "Données des mondes sur les cartes hexagonales Traveller",
        "pt": "Dados de mundos nos mapas hexagonais de Traveller",
        "sv": "Världsdata på Traveller-hexkartor"
    },
    "World data on 3D star fields": {
        "cs": "Data světů na 3D hvězdných polích",
        "da": "Verdensdata på 3D-stjernefelter",
        "de": "Weltdaten auf 3D-Sternfeldern",
        "es": "Datos de mundos en campos estelares 3D",
        "fr": "Données des mondes sur les champs d’étoiles 3D",
        "pt": "Dados de mundos nos campos estelares 3D",
        "sv": "Världsdata på 3D-stjärnfält"
    },
    "Estrelas's own world data: physical figures, orbit, rotation and the almanac profile": {
        "cs": "Vlastní data světů Estrelas: fyzikální údaje, oběžná dráha, rotace a almanachový profil",
        "da": "Estrelas' egne verdensdata: fysiske tal, bane, rotation og almanakprofil",
        "de": "Die eigenen Weltdaten von Estrelas: physikalische Werte, Umlaufbahn, Rotation und Almanachprofil",
        "es": "Los datos propios de Estrelas: cifras físicas, órbita, rotación y perfil de almanaque",
        "fr": "Les données propres à Estrelas : valeurs physiques, orbite, rotation et profil d’almanach",
        "pt": "Os dados próprios do Estrelas: valores físicos, órbita, rotação e perfil de almanaque",
        "sv": "Estrelas egna världsdata: fysiska värden, bana, rotation och almanacksprofil"
    },
    "Only the Traveller SRD's values: the Universal World Profile, trade codes, bases and travel zone": {
        "cs": "Jen hodnoty z Traveller SRD: Universal World Profile, obchodní kódy, základny a cestovní zóna",
        "da": "Kun Traveller SRD's værdier: Universal World Profile, handelskoder, baser og rejsezone",
        "de": "Nur die Werte des Traveller-SRD: Universal World Profile, Handelscodes, Basen und Reisezone",
        "es": "Solo los valores del SRD de Traveller: Universal World Profile, códigos comerciales, bases y zona de viaje",
        "fr": "Uniquement les valeurs du SRD de Traveller : Universal World Profile, codes commerciaux, bases et zone de voyage",
        "pt": "Só os valores do SRD de Traveller: Universal World Profile, códigos comerciais, bases e zona de viagem",
        "sv": "Bara Traveller SRD:s värden: Universal World Profile, handelskoder, baser och resezon"
    },
    "Estrelas's world data with the Traveller SRD's values alongside": {
        "cs": "Data světů Estrelas s hodnotami z Traveller SRD vedle nich",
        "da": "Estrelas' verdensdata med Traveller SRD's værdier ved siden af",
        "de": "Die Weltdaten von Estrelas mit den Werten des Traveller-SRD daneben",
        "es": "Los datos de Estrelas junto a los valores del SRD de Traveller",
        "fr": "Les données d’Estrelas accompagnées des valeurs du SRD de Traveller",
        "pt": "Os dados do Estrelas acompanhados dos valores do SRD de Traveller",
        "sv": "Estrelas världsdata med Traveller SRD:s värden bredvid"
    },
    "SRD Data shows only what the Traveller System Reference Document defines: the Universal World Profile's codes, temperature, bases, trade codes and travel zones. Nothing from the World Builder's Handbook, and no physical figures, orbits, rotation or almanac profile. Both shows the SRD's values alongside Estrelas's. Worlds are generated the same either way. Also on each world's data sheet.": {
        "cs": "Data SRD ukazují jen to, co definuje Traveller System Reference Document: kódy Universal World Profile, teplotu, základny, obchodní kódy a cestovní zóny. Nic z World Builder's Handbook a žádné fyzikální údaje, oběžné dráhy, rotaci ani almanachový profil. Obojí ukazuje hodnoty SRD vedle hodnot Estrelas. Světy se generují stejně v obou případech. Také na datovém listu každého světa.",
        "da": "SRD-data viser kun det, Traveller System Reference Document definerer: Universal World Profiles koder, temperatur, baser, handelskoder og rejsezoner. Intet fra World Builder's Handbook og ingen fysiske tal, baner, rotation eller almanakprofil. Begge viser SRD's værdier ved siden af Estrelas'. Verdener genereres ens uanset valg. Også på hver verdens datablad.",
        "de": "SRD-Daten zeigen nur, was das Traveller System Reference Document festlegt: die Codes des Universal World Profile, Temperatur, Basen, Handelscodes und Reisezonen. Nichts aus dem World Builder’s Handbook, keine physikalischen Werte, Umlaufbahnen, Rotation oder Almanachprofile. Beides zeigt die SRD-Werte neben denen von Estrelas. Welten werden in jedem Fall gleich erzeugt. Auch im Datenblatt jeder Welt.",
        "es": "Datos del SRD muestra solo lo que define el Traveller System Reference Document: los códigos del Universal World Profile, la temperatura, las bases, los códigos comerciales y las zonas de viaje. Nada del World Builder’s Handbook, ni cifras físicas, órbitas, rotación o perfil de almanaque. Ambos muestra los valores del SRD junto a los de Estrelas. Los mundos se generan igual en todos los casos. También en la ficha de cada mundo.",
        "fr": "Données SRD n’affiche que ce que définit le Traveller System Reference Document : les codes du Universal World Profile, la température, les bases, les codes commerciaux et les zones de voyage. Rien du World Builder’s Handbook, ni valeurs physiques, orbites, rotation ou profil d’almanach. Les deux affiche les valeurs du SRD à côté de celles d’Estrelas. Les mondes sont générés de la même façon dans tous les cas. Aussi sur la fiche de chaque monde.",
        "pt": "Dados do SRD mostra só o que o Traveller System Reference Document define: os códigos do Universal World Profile, a temperatura, as bases, os códigos comerciais e as zonas de viagem. Nada do World Builder’s Handbook, nem valores físicos, órbitas, rotação ou perfil de almanaque. Ambos mostra os valores do SRD ao lado dos do Estrelas. Os mundos são gerados da mesma forma em qualquer caso. Também na ficha de cada mundo.",
        "sv": "SRD-data visar bara det som Traveller System Reference Document definierar: Universal World Profiles koder, temperatur, baser, handelskoder och resezoner. Inget från World Builder's Handbook och inga fysiska värden, banor, rotation eller almanacksprofil. Båda visar SRD:s värden bredvid Estrelas. Världar genereras likadant i båda fallen. Även på varje världs datablad."
    },
    "Build %@": {
        "cs": "Sestavení %@",
        "da": "Build %@",
        "de": "Build %@",
        "es": "Compilación %@",
        "fr": "Build %@",
        "pt": "Build %@",
        "sv": "Bygge %@"
    },
    "A crystal found only on this world. It %@, and %@.": {
        "cs": "Krystal, který se vyskytuje jen na tomto světě. Tento krystal %@ a %@.",
        "da": "En krystal, der kun findes på denne verden. Den %@, og %@.",
        "de": "Ein Kristall, den es nur auf dieser Welt gibt. Er %@ und %@.",
        "es": "Un cristal que solo existe en este mundo. %@, y %@.",
        "fr": "Un cristal qu’on ne trouve que sur ce monde. Il %@, et %@.",
        "pt": "Um cristal que só existe neste mundo. %@, e %@.",
        "sv": "En kristall som bara finns på den här världen. Den %@, och %@."
    },
    "Aluminium": {
        "cs": "Hliník",
        "da": "Aluminium",
        "de": "Aluminium",
        "es": "Aluminio",
        "fr": "Aluminium",
        "pt": "Alumínio",
        "sv": "Aluminium"
    },
    "Amethyst and agate": {
        "cs": "Ametyst a achát",
        "da": "Ametyst og agat",
        "de": "Amethyst und Achat",
        "es": "Amatista y ágata",
        "fr": "Améthyste et agate",
        "pt": "Ametista e ágata",
        "sv": "Ametist och agat"
    },
    "Amethyst and agate geodes in the flood basalts of a volcanic plain": {
        "cs": "Ametystové a achátové geody v příkrovových čedičích vulkanické pláně",
        "da": "Ametyst- og agatgeoder i plateaubasalten på en vulkansk slette",
        "de": "Amethyst- und Achatgeoden in den Flutbasalten einer Vulkanebene",
        "es": "Geodas de amatista y ágata en los basaltos de una llanura volcánica",
        "fr": "Géodes d’améthyste et d’agate dans les basaltes d’une plaine volcanique",
        "pt": "Geodos de ametista e ágata nos basaltos de uma planície vulcânica",
        "sv": "Ametist- och agatgeoder i platåbasalten på en vulkanisk slätt"
    },
    "Banded iron formations in the ancient rock of a continental interior": {
        "cs": "Páskované železné rudy ve prastarých horninách vnitrozemí kontinentu",
        "da": "Båndede jernformationer i den ældgamle bjergart i et kontinents indre",
        "de": "Bändererze im uralten Gestein eines Kontinentinneren",
        "es": "Formaciones de hierro bandeado en la roca antigua del interior de un continente",
        "fr": "Formations de fer rubané dans la roche ancienne de l’intérieur d’un continent",
        "pt": "Formações ferríferas bandadas na rocha antiga do interior de um continente",
        "sv": "Bandade järnformationer i det urgamla berget i en kontinents inre"
    },
    "Bauxite, weathered out of the rock under hot, wet tropical forest": {
        "cs": "Bauxit vyvětralý z horniny pod horkým, vlhkým tropickým lesem",
        "da": "Bauxit, forvitret ud af klippen under varm, fugtig tropisk skov",
        "de": "Bauxit, unter heißem, feuchtem Tropenwald aus dem Gestein verwittert",
        "es": "Bauxita, formada por la meteorización de la roca bajo una selva tropical cálida y húmeda",
        "fr": "Bauxite, née de l’altération de la roche sous une forêt tropicale chaude et humide",
        "pt": "Bauxita, formada pela alteração da rocha sob floresta tropical quente e húmida",
        "sv": "Bauxit, vittrad ur berget under varm, fuktig tropisk skog"
    },
    "Coal": {
        "cs": "Uhlí",
        "da": "Kul",
        "de": "Kohle",
        "es": "Carbón",
        "fr": "Charbon",
        "pt": "Carvão",
        "sv": "Kol"
    },
    "Coal seams from swamp forests buried in a lowland basin": {
        "cs": "Uhelné sloje z bažinných lesů pohřbených v nížinné pánvi",
        "da": "Kullag fra sumpskove begravet i et lavlandsbassin",
        "de": "Kohleflöze aus Sumpfwäldern, begraben in einem Tieflandbecken",
        "es": "Vetas de carbón de bosques pantanosos enterrados en una cuenca baja",
        "fr": "Veines de charbon issues de forêts marécageuses enfouies dans un bassin de plaine",
        "pt": "Camadas de carvão de florestas pantanosas soterradas numa bacia de planície",
        "sv": "Kolflöts från sumpskogar begravda i en låglandsbassäng"
    },
    "Copper": {
        "cs": "Měď",
        "da": "Kobber",
        "de": "Kupfer",
        "es": "Cobre",
        "fr": "Cuivre",
        "pt": "Cobre",
        "sv": "Koppar"
    },
    "Crystals": {
        "cs": "Krystaly",
        "da": "Krystaller",
        "de": "Kristalle",
        "es": "Cristales",
        "fr": "Cristaux",
        "pt": "Cristais",
        "sv": "Kristaller"
    },
    "Diamond": {
        "cs": "Diamant",
        "da": "Diamant",
        "de": "Diamant",
        "es": "Diamante",
        "fr": "Diamant",
        "pt": "Diamante",
        "sv": "Diamant"
    },
    "Diamonds in kimberlite pipes, brought up from deep in the mantle through ancient continental rock": {
        "cs": "Diamanty v kimberlitových komínech, vynesené z hlubin pláště skrz prastarou kontinentální horninu",
        "da": "Diamanter i kimberlitrør, bragt op fra dybt i kappen gennem ældgammel kontinental bjergart",
        "de": "Diamanten in Kimberlitschloten, aus der Tiefe des Mantels durch uraltes Kontinentalgestein emporgebracht",
        "es": "Diamantes en chimeneas de kimberlita, subidos desde lo profundo del manto a través de roca continental antigua",
        "fr": "Diamants dans des cheminées de kimberlite, remontés des profondeurs du manteau à travers la roche continentale ancienne",
        "pt": "Diamantes em chaminés de kimberlito, trazidos das profundezas do manto através de rocha continental antiga",
        "sv": "Diamanter i kimberlitrör, uppförda från djupt i manteln genom urgammalt kontinentalt berg"
    },
    "Emerald": {
        "cs": "Smaragd",
        "da": "Smaragd",
        "de": "Smaragd",
        "es": "Esmeralda",
        "fr": "Émeraude",
        "pt": "Esmeralda",
        "sv": "Smaragd"
    },
    "Emeralds in schist and pegmatite veins high in a mountain range": {
        "cs": "Smaragdy v břidlicových a pegmatitových žilách vysoko v pohoří",
        "da": "Smaragder i skifer- og pegmatitårer højt oppe i en bjergkæde",
        "de": "Smaragde in Schiefer- und Pegmatitadern hoch in einem Gebirge",
        "es": "Esmeraldas en vetas de esquisto y pegmatita en lo alto de una cordillera",
        "fr": "Émeraudes dans des filons de schiste et de pegmatite en haute montagne",
        "pt": "Esmeraldas em veios de xisto e pegmatito no alto de uma cordilheira",
        "sv": "Smaragder i skiffer- och pegmatitgångar högt uppe i en bergskedja"
    },
    "Garnet": {
        "cs": "Granát",
        "da": "Granat",
        "de": "Granat",
        "es": "Granate",
        "fr": "Grenat",
        "pt": "Granada",
        "sv": "Granat"
    },
    "Garnets in metamorphic rock through the roots of old mountains": {
        "cs": "Granáty v metamorfovaných horninách v kořenech starých pohoří",
        "da": "Granater i metamorf bjergart i rødderne af gamle bjerge",
        "de": "Granate in metamorphem Gestein in den Wurzeln alter Gebirge",
        "es": "Granates en roca metamórfica en las raíces de montañas antiguas",
        "fr": "Grenats dans la roche métamorphique des racines de vieilles montagnes",
        "pt": "Granadas em rocha metamórfica nas raízes de montanhas antigas",
        "sv": "Granater i metamorft berg i rötterna av gamla berg"
    },
    "Gemstones": {
        "cs": "Drahokamy",
        "da": "Ædelsten",
        "de": "Edelsteine",
        "es": "Piedras preciosas",
        "fr": "Pierres précieuses",
        "pt": "Pedras preciosas",
        "sv": "Ädelstenar"
    },
    "Gold": {
        "cs": "Zlato",
        "da": "Guld",
        "de": "Gold",
        "es": "Oro",
        "fr": "Or",
        "pt": "Ouro",
        "sv": "Guld"
    },
    "Gold in quartz veins through folded mountains, and epithermal veins round old volcanoes": {
        "cs": "Zlato v křemenných žilách ve vrásných pohořích a v epitermálních žilách kolem starých sopek",
        "da": "Guld i kvartsårer gennem foldebjerge og epitermale årer omkring gamle vulkaner",
        "de": "Gold in Quarzgängen durch Faltengebirge und in epithermalen Gängen um alte Vulkane",
        "es": "Oro en vetas de cuarzo de montañas plegadas y en vetas epitermales alrededor de volcanes antiguos",
        "fr": "Or dans des filons de quartz des montagnes plissées, et dans des filons épithermaux autour de vieux volcans",
        "pt": "Ouro em veios de quartzo de montanhas dobradas e em veios epitermais em torno de vulcões antigos",
        "sv": "Guld i kvartsgångar genom veckberg och epitermala gångar kring gamla vulkaner"
    },
    "Iron": {
        "cs": "Železo",
        "da": "Jern",
        "de": "Eisen",
        "es": "Hierro",
        "fr": "Fer",
        "pt": "Ferro",
        "sv": "Järn"
    },
    "Jade": {
        "cs": "Nefrit",
        "da": "Jade",
        "de": "Jade",
        "es": "Jade",
        "fr": "Jade",
        "pt": "Jade",
        "sv": "Jade"
    },
    "Jade in a belt of sea-floor rock thrust up along a coastal mountain range": {
        "cs": "Nefrit v pásu horniny mořského dna vyvrásněné podél pobřežního pohoří",
        "da": "Jade i et bælte af havbundsbjergart skubbet op langs en kystbjergkæde",
        "de": "Jade in einem Gürtel aus emporgeschobenem Meeresbodengestein entlang eines Küstengebirges",
        "es": "Jade en un cinturón de roca del fondo marino levantada a lo largo de una cordillera costera",
        "fr": "Jade dans une ceinture de roche du plancher océanique soulevée le long d’une chaîne côtière",
        "pt": "Jade numa faixa de rocha do fundo do mar erguida ao longo de uma cordilheira costeira",
        "sv": "Jade i ett bälte av havsbottenberg uppskjutet längs en kustbergskedja"
    },
    "Large": {
        "cs": "Velký",
        "da": "Stor",
        "de": "Groß",
        "es": "Grande",
        "fr": "Grand",
        "pt": "Grande",
        "sv": "Stor"
    },
    "Lead and zinc": {
        "cs": "Olovo a zinek",
        "da": "Bly og zink",
        "de": "Blei und Zink",
        "es": "Plomo y zinc",
        "fr": "Plomb et zinc",
        "pt": "Chumbo e zinco",
        "sv": "Bly och zink"
    },
    "Lead and zinc in the limestones of a sedimentary basin": {
        "cs": "Olovo a zinek ve vápencích sedimentární pánve",
        "da": "Bly og zink i kalkstenene i et sedimentært bassin",
        "de": "Blei und Zink in den Kalksteinen eines Sedimentbeckens",
        "es": "Plomo y zinc en las calizas de una cuenca sedimentaria",
        "fr": "Plomb et zinc dans les calcaires d’un bassin sédimentaire",
        "pt": "Chumbo e zinco nos calcários de uma bacia sedimentar",
        "sv": "Bly och zink i kalkstenarna i en sedimentär bassäng"
    },
    "Lithium": {
        "cs": "Lithium",
        "da": "Lithium",
        "de": "Lithium",
        "es": "Litio",
        "fr": "Lithium",
        "pt": "Lítio",
        "sv": "Litium"
    },
    "Lithium brines beneath a salt flat on a high, dry plateau, and lithium pegmatites": {
        "cs": "Lithné solanky pod solnou plání na vysoké suché náhorní plošině a lithné pegmatity",
        "da": "Lithiumsaltlage under en saltslette på et højt, tørt plateau, og lithiumpegmatitter",
        "de": "Lithiumsolen unter einer Salzpfanne auf einem hohen, trockenen Plateau, und Lithiumpegmatite",
        "es": "Salmueras de litio bajo un salar en una meseta alta y seca, y pegmatitas de litio",
        "fr": "Saumures de lithium sous un salar d’un haut plateau aride, et pegmatites à lithium",
        "pt": "Salmouras de lítio sob um salar num planalto alto e seco, e pegmatitos de lítio",
        "sv": "Litiumsaltlake under en saltöken på en hög, torr platå, och litiumpegmatiter"
    },
    "Medium": {
        "cs": "Střední",
        "da": "Mellem",
        "de": "Mittel",
        "es": "Mediano",
        "fr": "Moyen",
        "pt": "Médio",
        "sv": "Medel"
    },
    "Native sulphur crusting the vents of active volcanoes": {
        "cs": "Ryzí síra pokrývající průduchy činných sopek",
        "da": "Gedigent svovl som skorpe på aktive vulkaners kratere",
        "de": "Gediegener Schwefel als Kruste an den Schloten aktiver Vulkane",
        "es": "Azufre nativo cubriendo las fumarolas de volcanes activos",
        "fr": "Soufre natif encroûtant les évents des volcans actifs",
        "pt": "Enxofre nativo a cobrir as fumarolas de vulcões ativos",
        "sv": "Gediget svavel som skorpa kring aktiva vulkaners öppningar"
    },
    "Nickel": {
        "cs": "Nikl",
        "da": "Nikkel",
        "de": "Nickel",
        "es": "Níquel",
        "fr": "Nickel",
        "pt": "Níquel",
        "sv": "Nickel"
    },
    "Nickel sulphides in a mafic intrusion, and nickel laterites weathered out under tropical forest": {
        "cs": "Sulfidy niklu v mafické intruzi a niklové laterity vyvětralé pod tropickým lesem",
        "da": "Nikkelsulfider i en mafisk intrusion og nikkellateritter forvitret ud under tropisk skov",
        "de": "Nickelsulfide in einer mafischen Intrusion und Nickellaterite unter Tropenwald",
        "es": "Sulfuros de níquel en una intrusión máfica y lateritas de níquel bajo selva tropical",
        "fr": "Sulfures de nickel dans une intrusion mafique, et latérites nickélifères sous la forêt tropicale",
        "pt": "Sulfetos de níquel numa intrusão máfica e lateritas niquelíferas sob floresta tropical",
        "sv": "Nickelsulfider i en mafisk intrusion och nickellateriter vittrade fram under tropisk skog"
    },
    "Nickel-iron": {
        "cs": "Ni-Fe",
        "da": "Nikkeljern",
        "de": "Nickeleisen",
        "es": "Ferroníquel",
        "fr": "Ferronickel",
        "pt": "Ferro-níquel",
        "sv": "Nickeljärn"
    },
    "Nickel-iron from the core of a shattered body, in an impact basin": {
        "cs": "Niklové železo z jádra roztříštěného tělesa v impaktní pánvi",
        "da": "Nikkeljern fra kernen af et knust legeme, i et nedslagsbassin",
        "de": "Nickeleisen aus dem Kern eines zerschmetterten Körpers in einem Einschlagbecken",
        "es": "Ferroníquel del núcleo de un cuerpo destrozado, en una cuenca de impacto",
        "fr": "Ferronickel issu du noyau d’un corps fracassé, dans un bassin d’impact",
        "pt": "Ferro-níquel do núcleo de um corpo despedaçado, numa bacia de impacto",
        "sv": "Nickeljärn från kärnan av en krossad kropp, i en nedslagsbassäng"
    },
    "No deposits found on this world.": {
        "cs": "Na tomto světě nebyla nalezena žádná ložiska.",
        "da": "Der er ikke fundet forekomster på denne verden.",
        "de": "Auf dieser Welt wurden keine Lagerstätten gefunden.",
        "es": "No se han encontrado yacimientos en este mundo.",
        "fr": "Aucun gisement trouvé sur ce monde.",
        "pt": "Nenhuma jazida encontrada neste mundo.",
        "sv": "Inga fyndigheter har hittats på den här världen."
    },
    "Oil and gas": {
        "cs": "Ropa a plyn",
        "da": "Olie og gas",
        "de": "Öl und Gas",
        "es": "Petróleo y gas",
        "fr": "Pétrole et gaz",
        "pt": "Petróleo e gás",
        "sv": "Olja och gas"
    },
    "Oil and gas trapped in the rocks of a sedimentary basin, on land and under the shallow sea": {
        "cs": "Ropa a plyn uvězněné v horninách sedimentární pánve, na souši i pod mělkým mořem",
        "da": "Olie og gas fanget i bjergarterne i et sedimentært bassin, på land og under det lave hav",
        "de": "Öl und Gas in den Gesteinen eines Sedimentbeckens, an Land und unter dem flachen Meer",
        "es": "Petróleo y gas atrapados en las rocas de una cuenca sedimentaria, en tierra y bajo el mar poco profundo",
        "fr": "Pétrole et gaz piégés dans les roches d’un bassin sédimentaire, à terre et sous la mer peu profonde",
        "pt": "Petróleo e gás retidos nas rochas de uma bacia sedimentar, em terra e sob o mar pouco profundo",
        "sv": "Olja och gas instängda i berget i en sedimentär bassäng, på land och under det grunda havet"
    },
    "Opal": {
        "cs": "Opál",
        "da": "Opal",
        "de": "Opal",
        "es": "Ópalo",
        "fr": "Opale",
        "pt": "Opala",
        "sv": "Opal"
    },
    "Opal filling cracks in the weathered rock of a dry basin": {
        "cs": "Opál vyplňující pukliny ve zvětralé hornině suché pánve",
        "da": "Opal, der fylder revner i den forvitrede bjergart i et tørt bassin",
        "de": "Opal in den Rissen verwitterten Gesteins eines trockenen Beckens",
        "es": "Ópalo rellenando grietas en la roca meteorizada de una cuenca seca",
        "fr": "Opale comblant les fissures de la roche altérée d’un bassin aride",
        "pt": "Opala a preencher fendas na rocha alterada de uma bacia seca",
        "sv": "Opal som fyller sprickor i det vittrade berget i en torr bassäng"
    },
    "Ores": {
        "cs": "Rudy",
        "da": "Malme",
        "de": "Erze",
        "es": "Minerales",
        "fr": "Minerais",
        "pt": "Minérios",
        "sv": "Malmer"
    },
    "Peridot": {
        "cs": "Peridot",
        "da": "Peridot",
        "de": "Peridot",
        "es": "Peridoto",
        "fr": "Péridot",
        "pt": "Peridoto",
        "sv": "Peridot"
    },
    "Peridot in basalt flows, and in the shattered rock of an impact crater": {
        "cs": "Peridot v čedičových proudech a v roztříštěné hornině impaktního kráteru",
        "da": "Peridot i basaltstrømme og i den knuste bjergart i et nedslagskrater",
        "de": "Peridot in Basaltströmen und im zertrümmerten Gestein eines Einschlagkraters",
        "es": "Peridoto en coladas de basalto y en la roca destrozada de un cráter de impacto",
        "fr": "Péridot dans les coulées de basalte et dans la roche brisée d’un cratère d’impact",
        "pt": "Peridoto em escoadas de basalto e na rocha despedaçada de uma cratera de impacto",
        "sv": "Peridot i basaltflöden och i det krossade berget i en nedslagskrater"
    },
    "Phosphate": {
        "cs": "Fosfát",
        "da": "Fosfat",
        "de": "Phosphat",
        "es": "Fosfato",
        "fr": "Phosphate",
        "pt": "Fosfato",
        "sv": "Fosfat"
    },
    "Phosphate rock laid down on an old continental shelf": {
        "cs": "Fosfátová hornina usazená na starém kontinentálním šelfu",
        "da": "Fosfatsten aflejret på en gammel kontinentalsokkel",
        "de": "Phosphatgestein, abgelagert auf einem alten Kontinentalschelf",
        "es": "Roca fosfática depositada en una antigua plataforma continental",
        "fr": "Roche phosphatée déposée sur un ancien plateau continental",
        "pt": "Rocha fosfática depositada numa antiga plataforma continental",
        "sv": "Fosfatberg avsatt på en gammal kontinentalsockel"
    },
    "Platinum group": {
        "cs": "Platinové kovy",
        "da": "Platingruppen",
        "de": "Platingruppe",
        "es": "Grupo del platino",
        "fr": "Groupe du platine",
        "pt": "Grupo da platina",
        "sv": "Platinagruppen"
    },
    "Platinum, palladium and chromite in a layered intrusion deep in a continent": {
        "cs": "Platina, palladium a chromit ve vrstevnaté intruzi hluboko v kontinentu",
        "da": "Platin, palladium og kromit i en lagdelt intrusion dybt inde i et kontinent",
        "de": "Platin, Palladium und Chromit in einer geschichteten Intrusion tief in einem Kontinent",
        "es": "Platino, paladio y cromita en una intrusión estratificada en el interior de un continente",
        "fr": "Platine, palladium et chromite dans une intrusion litée au cœur d’un continent",
        "pt": "Platina, paládio e cromite numa intrusão estratificada no interior de um continente",
        "sv": "Platina, palladium och kromit i en skiktad intrusion djupt inne i en kontinent"
    },
    "Porphyry copper, molybdenum and gold in a volcanic mountain belt": {
        "cs": "Porfyrová měď, molybden a zlato ve vulkanickém horském pásmu",
        "da": "Porfyrkobber, molybdæn og guld i et vulkansk bjergbælte",
        "de": "Porphyrisches Kupfer, Molybdän und Gold in einem vulkanischen Gebirgsgürtel",
        "es": "Cobre porfídico, molibdeno y oro en un cinturón montañoso volcánico",
        "fr": "Cuivre porphyrique, molybdène et or dans une chaîne de montagnes volcanique",
        "pt": "Cobre pórfiro, molibdénio e ouro numa cordilheira vulcânica",
        "sv": "Porfyrkoppar, molybden och guld i ett vulkaniskt bergsbälte"
    },
    "Rare earth elements in a carbonatite intrusion along an old rift": {
        "cs": "Prvky vzácných zemin v karbonatitové intruzi podél starého riftu",
        "da": "Sjældne jordarter i en karbonatitintrusion langs en gammel riftdal",
        "de": "Seltene Erden in einer Karbonatit-Intrusion entlang eines alten Grabenbruchs",
        "es": "Tierras raras en una intrusión de carbonatita a lo largo de un antiguo rift",
        "fr": "Terres rares dans une intrusion de carbonatite le long d’un ancien rift",
        "pt": "Terras raras numa intrusão de carbonatito ao longo de um antigo rifte",
        "sv": "Sällsynta jordartsmetaller i en karbonatitintrusion längs en gammal riftdal"
    },
    "Rare earths": {
        "cs": "Vzácné zeminy",
        "da": "Sjældne jordarter",
        "de": "Seltene Erden",
        "es": "Tierras raras",
        "fr": "Terres rares",
        "pt": "Terras raras",
        "sv": "Sällsynta jordartsmetaller"
    },
    "Resources": {
        "cs": "Suroviny",
        "da": "Ressourcer",
        "de": "Rohstoffe",
        "es": "Recursos",
        "fr": "Ressources",
        "pt": "Recursos",
        "sv": "Resurser"
    },
    "Rubies and sapphires in marble, and washed down into the gravels below the mountains": {
        "cs": "Rubíny a safíry v mramoru a splavené do štěrků pod horami",
        "da": "Rubiner og safirer i marmor og skyllet ned i gruset under bjergene",
        "de": "Rubine und Saphire in Marmor und in den Schottern unterhalb der Berge",
        "es": "Rubíes y zafiros en mármol, y arrastrados a las gravas al pie de las montañas",
        "fr": "Rubis et saphirs dans le marbre, et charriés dans les graviers au pied des montagnes",
        "pt": "Rubis e safiras em mármore, e arrastados para os cascalhos ao pé das montanhas",
        "sv": "Rubiner och safirer i marmor och nedspolade i gruset nedanför bergen"
    },
    "Ruby and sapphire": {
        "cs": "Rubín a safír",
        "da": "Rubin og safir",
        "de": "Rubin und Saphir",
        "es": "Rubí y zafiro",
        "fr": "Rubis et saphir",
        "pt": "Rubi e safira",
        "sv": "Rubin och safir"
    },
    "Salt and potash": {
        "cs": "Sůl a potaš",
        "da": "Salt og kalisalt",
        "de": "Salz und Kali",
        "es": "Sal y potasa",
        "fr": "Sel et potasse",
        "pt": "Sal e potassa",
        "sv": "Salt och kalisalt"
    },
    "Salt and potash left by seas that dried away in a desert basin": {
        "cs": "Sůl a draselné soli zanechané moři, která vyschla v pouštní pánvi",
        "da": "Salt og kalisalt efterladt af have, der tørrede ud i et ørkenbassin",
        "de": "Salz und Kali, zurückgelassen von ausgetrockneten Meeren in einem Wüstenbecken",
        "es": "Sal y potasa dejadas por mares que se secaron en una cuenca desértica",
        "fr": "Sel et potasse laissés par des mers asséchées dans un bassin désertique",
        "pt": "Sal e potassa deixados por mares que secaram numa bacia desértica",
        "sv": "Salt och kalisalt kvar efter hav som torkade ut i en ökenbassäng"
    },
    "Show ores, gemstones and crystals": {
        "cs": "Zobrazit rudy, drahokamy a krystaly",
        "da": "Vis malme, ædelsten og krystaller",
        "de": "Erze, Edelsteine und Kristalle zeigen",
        "es": "Mostrar minerales, piedras preciosas y cristales",
        "fr": "Afficher minerais, pierres précieuses et cristaux",
        "pt": "Mostrar minérios, pedras preciosas e cristais",
        "sv": "Visa malmer, ädelstenar och kristaller"
    },
    "Silver": {
        "cs": "Stříbro",
        "da": "Sølv",
        "de": "Silber",
        "es": "Plata",
        "fr": "Argent",
        "pt": "Prata",
        "sv": "Silver"
    },
    "Silver, with lead and zinc, in epithermal veins near volcanic centres": {
        "cs": "Stříbro s olovem a zinkem v epitermálních žilách poblíž vulkanických center",
        "da": "Sølv med bly og zink i epitermale årer nær vulkanske centre",
        "de": "Silber mit Blei und Zink in epithermalen Gängen nahe vulkanischen Zentren",
        "es": "Plata, con plomo y zinc, en vetas epitermales cerca de centros volcánicos",
        "fr": "Argent, avec plomb et zinc, dans des filons épithermaux près de centres volcaniques",
        "pt": "Prata, com chumbo e zinco, em veios epitermais perto de centros vulcânicos",
        "sv": "Silver med bly och zink i epitermala gångar nära vulkaniska centrum"
    },
    "Sulphur": {
        "cs": "Síra",
        "da": "Svovl",
        "de": "Schwefel",
        "es": "Azufre",
        "fr": "Soufre",
        "pt": "Enxofre",
        "sv": "Svavel"
    },
    "Tin and tungsten": {
        "cs": "Cín a wolfram",
        "da": "Tin og wolfram",
        "de": "Zinn und Wolfram",
        "es": "Estaño y wolframio",
        "fr": "Étain et tungstène",
        "pt": "Estanho e tungsténio",
        "sv": "Tenn och volfram"
    },
    "Tin and tungsten in the granites at the heart of a mountain range": {
        "cs": "Cín a wolfram v žulách v srdci pohoří",
        "da": "Tin og wolfram i granitterne i hjertet af en bjergkæde",
        "de": "Zinn und Wolfram in den Graniten im Herzen eines Gebirges",
        "es": "Estaño y wolframio en los granitos del corazón de una cordillera",
        "fr": "Étain et tungstène dans les granites au cœur d’une chaîne de montagnes",
        "pt": "Estanho e tungsténio nos granitos do coração de uma cordilheira",
        "sv": "Tenn och volfram i graniterna i hjärtat av en bergskedja"
    },
    "Topaz and tourmaline": {
        "cs": "Topaz a turmalín",
        "da": "Topas og turmalin",
        "de": "Topas und Turmalin",
        "es": "Topacio y turmalina",
        "fr": "Topaze et tourmaline",
        "pt": "Topázio e turmalina",
        "sv": "Topas och turmalin"
    },
    "Topaz and tourmaline in granite pegmatites": {
        "cs": "Topaz a turmalín v žulových pegmatitech",
        "da": "Topas og turmalin i granitpegmatitter",
        "de": "Topas und Turmalin in Granitpegmatiten",
        "es": "Topacio y turmalina en pegmatitas graníticas",
        "fr": "Topaze et tourmaline dans des pegmatites granitiques",
        "pt": "Topázio e turmalina em pegmatitos graníticos",
        "sv": "Topas och turmalin i granitpegmatiter"
    },
    "Turquoise": {
        "cs": "Tyrkys",
        "da": "Turkis",
        "de": "Türkis",
        "es": "Turquesa",
        "fr": "Turquoise",
        "pt": "Turquesa",
        "sv": "Turkos"
    },
    "Turquoise where copper-bearing rock has weathered in a dry land": {
        "cs": "Tyrkys tam, kde v suché zemi zvětrala hornina obsahující měď",
        "da": "Turkis, hvor kobberholdig bjergart er forvitret i et tørt land",
        "de": "Türkis, wo kupferhaltiges Gestein in trockenem Land verwittert ist",
        "es": "Turquesa donde la roca cuprífera se ha meteorizado en tierras secas",
        "fr": "Turquoise là où la roche cuprifère s’est altérée en terre aride",
        "pt": "Turquesa onde a rocha cuprífera se alterou em terra seca",
        "sv": "Turkos där kopparhaltigt berg har vittrat i ett torrt land"
    },
    "Uranium": {
        "cs": "Uran",
        "da": "Uran",
        "de": "Uran",
        "es": "Uranio",
        "fr": "Uranium",
        "pt": "Urânio",
        "sv": "Uran"
    },
    "Uranium in the sandstones of an arid basin": {
        "cs": "Uran v pískovcích suché pánve",
        "da": "Uran i sandstenene i et tørt bassin",
        "de": "Uran in den Sandsteinen eines trockenen Beckens",
        "es": "Uranio en las areniscas de una cuenca árida",
        "fr": "Uranium dans les grès d’un bassin aride",
        "pt": "Urânio nos arenitos de uma bacia árida",
        "sv": "Uran i sandstenarna i en torr bassäng"
    },
    "Water ice": {
        "cs": "Vodní led",
        "da": "Vandis",
        "de": "Wassereis",
        "es": "Hielo de agua",
        "fr": "Glace d’eau",
        "pt": "Gelo de água",
        "sv": "Vattenis"
    },
    "Water ice in a crater floor at the pole that the star never reaches": {
        "cs": "Vodní led na dně kráteru u pólu, kam hvězda nikdy nedosvítí",
        "da": "Vandis i bunden af et krater ved polen, som stjernen aldrig når",
        "de": "Wassereis im Boden eines Polkraters, den die Sonne nie erreicht",
        "es": "Hielo de agua en el fondo de un cráter polar al que nunca llega la luz de la estrella",
        "fr": "Glace d’eau au fond d’un cratère polaire que l’étoile n’atteint jamais",
        "pt": "Gelo de água no fundo de uma cratera polar que a estrela nunca alcança",
        "sv": "Vattenis på botten av en krater vid polen som stjärnan aldrig når"
    },
    "Where the ores, gemstones and crystals are on this world, as its geology places them": {
        "cs": "Kde jsou na tomto světě rudy, drahokamy a krystaly, jak je rozmístila jeho geologie",
        "da": "Hvor malmene, ædelstenene og krystallerne findes på denne verden, som dens geologi placerer dem",
        "de": "Wo die Erze, Edelsteine und Kristalle dieser Welt liegen, wie ihre Geologie sie verteilt",
        "es": "Dónde están los minerales, piedras preciosas y cristales de este mundo, según su geología",
        "fr": "Où se trouvent les minerais, pierres précieuses et cristaux de ce monde, selon sa géologie",
        "pt": "Onde estão os minérios, pedras preciosas e cristais deste mundo, segundo a sua geologia",
        "sv": "Var malmerna, ädelstenarna och kristallerna finns på den här världen, så som dess geologi placerar dem"
    },
    "World-class": {
        "cs": "Světové úrovně",
        "da": "I verdensklasse",
        "de": "Weltklasse",
        "es": "De clase mundial",
        "fr": "De classe mondiale",
        "pt": "De classe mundial",
        "sv": "I världsklass"
    },
    "changes colour with the temperature": {
        "cs": "mění barvu s teplotou",
        "da": "skifter farve med temperaturen",
        "de": "ändert seine Farbe mit der Temperatur",
        "es": "cambia de color con la temperatura",
        "fr": "change de couleur avec la température",
        "pt": "muda de cor com a temperatura",
        "sv": "byter färg med temperaturen"
    },
    "crystallises in desert salt pans": {
        "cs": "krystalizuje v pouštních solných pánvích",
        "da": "krystalliserer i ørkenens saltpander",
        "de": "kristallisiert in Salzpfannen der Wüste",
        "es": "Cristaliza en las salinas del desierto",
        "fr": "cristallise dans les cuvettes salées du désert",
        "pt": "Cristaliza nas salinas do deserto",
        "sv": "kristalliseras i öknens saltpannor"
    },
    "forms in the melt of impact craters": {
        "cs": "vzniká v tavenině impaktních kráterů",
        "da": "dannes i smelten i nedslagskratere",
        "de": "bildet sich in der Schmelze von Einschlagkratern",
        "es": "Se forma en la roca fundida de los cráteres de impacto",
        "fr": "se forme dans la roche fondue des cratères d’impact",
        "pt": "Forma-se na rocha fundida das crateras de impacto",
        "sv": "bildas i smältan i nedslagskratrar"
    },
    "gives off a small electric charge when squeezed": {
        "cs": "při stlačení vydává slabý elektrický náboj",
        "da": "afgiver en lille elektrisk ladning, når den klemmes",
        "de": "gibt unter Druck eine kleine elektrische Ladung ab",
        "es": "desprende una pequeña carga eléctrica al apretarlo",
        "fr": "libère une petite charge électrique quand on le presse",
        "pt": "liberta uma pequena carga elétrica quando apertado",
        "sv": "avger en liten elektrisk laddning när den kläms"
    },
    "glows faintly in the dark": {
        "cs": "slabě světélkuje ve tmě",
        "da": "lyser svagt i mørke",
        "de": "leuchtet schwach im Dunkeln",
        "es": "brilla débilmente en la oscuridad",
        "fr": "luit faiblement dans le noir",
        "pt": "brilha levemente no escuro",
        "sv": "lyser svagt i mörker"
    },
    "grows around vents on the sea floor": {
        "cs": "roste kolem průduchů na mořském dně",
        "da": "vokser omkring væld på havbunden",
        "de": "wächst um Quellen am Meeresboden",
        "es": "Crece alrededor de fuentes hidrotermales del fondo marino",
        "fr": "pousse autour des sources du plancher océanique",
        "pt": "Cresce em torno de fontes no fundo do mar",
        "sv": "växer kring källor på havsbotten"
    },
    "grows in slow spirals": {
        "cs": "roste v pomalých spirálách",
        "da": "vokser i langsomme spiraler",
        "de": "wächst in langsamen Spiralen",
        "es": "crece en lentas espirales",
        "fr": "pousse en lentes spirales",
        "pt": "cresce em espirais lentas",
        "sv": "växer i långsamma spiraler"
    },
    "grows in the ice of the polar wastes": {
        "cs": "roste v ledu polárních pustin",
        "da": "vokser i isen i polarørkenerne",
        "de": "wächst im Eis der Polarwüsten",
        "es": "Crece en el hielo de los desiertos polares",
        "fr": "pousse dans la glace des déserts polaires",
        "pt": "Cresce no gelo dos desertos polares",
        "sv": "växer i isen i polaröknarna"
    },
    "grows in the vents of volcanoes": {
        "cs": "roste v průduších sopek",
        "da": "vokser i vulkanernes kratere",
        "de": "wächst in den Schloten von Vulkanen",
        "es": "Crece en las chimeneas de los volcanes",
        "fr": "pousse dans les évents des volcans",
        "pt": "Cresce nas chaminés dos vulcões",
        "sv": "växer i vulkanernas öppningar"
    },
    "hums faintly near magnetic fields": {
        "cs": "slabě bzučí poblíž magnetických polí",
        "da": "summer svagt nær magnetfelter",
        "de": "summt leise in der Nähe von Magnetfeldern",
        "es": "zumba levemente cerca de campos magnéticos",
        "fr": "bourdonne faiblement près des champs magnétiques",
        "pt": "zumbe levemente perto de campos magnéticos",
        "sv": "surrar svagt nära magnetfält"
    },
    "is found only on the highest peaks": {
        "cs": "vyskytuje se jen na nejvyšších vrcholech",
        "da": "findes kun på de højeste tinder",
        "de": "findet sich nur auf den höchsten Gipfeln",
        "es": "Solo se encuentra en las cumbres más altas",
        "fr": "ne se trouve que sur les plus hauts sommets",
        "pt": "Só se encontra nos picos mais altos",
        "sv": "finns bara på de högsta topparna"
    },
    "is harder than diamond": {
        "cs": "je tvrdší než diamant",
        "da": "er hårdere end diamant",
        "de": "ist härter als Diamant",
        "es": "es más duro que el diamante",
        "fr": "est plus dur que le diamant",
        "pt": "é mais duro do que o diamante",
        "sv": "är hårdare än diamant"
    },
    "is lighter than water": {
        "cs": "je lehčí než voda",
        "da": "er lettere end vand",
        "de": "ist leichter als Wasser",
        "es": "es más ligero que el agua",
        "fr": "est plus léger que l’eau",
        "pt": "é mais leve do que a água",
        "sv": "är lättare än vatten"
    },
    "is warm to the touch": {
        "cs": "je na dotek teplý",
        "da": "er varm at røre ved",
        "de": "fühlt sich warm an",
        "es": "es cálido al tacto",
        "fr": "est chaud au toucher",
        "pt": "é quente ao toque",
        "sv": "är varm vid beröring"
    },
    "lines caverns deep beneath lowland plains": {
        "cs": "vystýlá jeskyně hluboko pod nížinnými pláněmi",
        "da": "beklæder huler dybt under lavlandets sletter",
        "de": "kleidet Höhlen tief unter den Ebenen aus",
        "es": "Recubre cavernas en lo profundo bajo las llanuras",
        "fr": "tapisse des cavernes profondes sous les plaines",
        "pt": "Reveste cavernas profundas sob as planícies",
        "sv": "kläder grottor djupt under låglandets slätter"
    },
    "rings like a bell when struck": {
        "cs": "zvoní jako zvon, když se do něj udeří",
        "da": "ringer som en klokke, når man slår på den",
        "de": "klingt angeschlagen wie eine Glocke",
        "es": "suena como una campana al golpearlo",
        "fr": "sonne comme une cloche quand on le frappe",
        "pt": "soa como um sino quando batido",
        "sv": "klingar som en klocka när man slår på den"
    },
    "slowly regrows when broken": {
        "cs": "když se zlomí, pomalu doroste",
        "da": "vokser langsomt ud igen, når den brækkes",
        "de": "wächst langsam nach, wenn er bricht",
        "es": "vuelve a crecer lentamente si se rompe",
        "fr": "repousse lentement quand on le brise",
        "pt": "volta a crescer lentamente quando partido",
        "sv": "växer långsamt ut igen när den bryts"
    },
    "splits light into vivid bands": {
        "cs": "rozkládá světlo do sytých pásů",
        "da": "spalter lys i klare bånd",
        "de": "zerlegt Licht in leuchtende Bänder",
        "es": "descompone la luz en bandas vivas",
        "fr": "décompose la lumière en bandes vives",
        "pt": "decompõe a luz em faixas vivas",
        "sv": "delar upp ljus i klara band"
    },
    "stores light and gives it back at night": {
        "cs": "uchovává světlo a v noci je vrací",
        "da": "gemmer lys og giver det tilbage om natten",
        "de": "speichert Licht und gibt es nachts wieder ab",
        "es": "almacena la luz y la devuelve de noche",
        "fr": "emmagasine la lumière et la rend la nuit",
        "pt": "armazena a luz e devolve-a à noite",
        "sv": "lagrar ljus och ger tillbaka det på natten"
    }
};

export const languages = [
    { code: '', name: null },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'da', name: 'Dansk' },
    { code: 'sv', name: 'Svenska' },
    { code: 'cs', name: 'Čeština' },
];

/** The language in use: the setting, or the browser's language when the setting follows the system */
export function currentLanguage() {
    const chosen = Settings.get('appLanguage');
    if (chosen) return chosen;
    for (const preferred of navigator.languages ?? [navigator.language]) {
        const code = preferred.slice(0, 2).toLowerCase();
        if (['en', 'pt', 'es', 'de', 'fr', 'da', 'sv', 'cs'].includes(code)) return code;
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
