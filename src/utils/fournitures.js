export const CATEGORIES = {
  'Stylos & Bics':            { emoji:'🖊️', color:'bg-blue-900/40 border-blue-700/50',    items:['Stylo bille','Stylo bille gel','Stylo plume','Marqueur permanent','Surligneur','Stylo effaçable'] },
  'Crayons':                  { emoji:'✏️',  color:'bg-amber-900/40 border-amber-700/50',  items:['Crayon HB','Crayon 2B','Crayon de couleur','Crayon gras','Crayon aquarelle','Fusain','Pastel'] },
  'Cahiers':                  { emoji:'📓',  color:'bg-green-900/40 border-green-700/50',  items:['Cahier TP','Cahier Privilège','Cahier 100 pages','Cahier 200 pages','Cahier étudiant','Cahier grands carreaux','Cahier petits carreaux','Cahier spirale','Carnet'] },
  'Géométrie':                { emoji:'📐',  color:'bg-indigo-900/40 border-indigo-700/50',items:['Ensemble géométrie','Règle 30cm','Règle 20cm','Équerre','Compas','Rapporteur'] },
  'Colles & Adhésifs':        { emoji:'🧴',  color:'bg-pink-900/40 border-pink-700/50',   items:['Pot de colle','Bâton de colle','Colle liquide','Ruban adhésif','Scotch'] },
  'Papiers Spéciaux':         { emoji:'📄',  color:'bg-slate-700/40 border-slate-600/50', items:['Papier millimétré','Papier ministre','Papier chanson','Papier calque','Papier Bristol','Papier kraft'] },
  'Taille-crayons & Gommes':  { emoji:'✂️',  color:'bg-red-900/40 border-red-700/50',    items:['Taille-crayon simple','Taille-crayon double','Gomme blanche','Gomme plastique','Correcteur liquide','Correcteur ruban'] },
  'Classeurs & Rangement':    { emoji:'📂',  color:'bg-orange-900/40 border-orange-700/50',items:['Classeur 2 anneaux','Classeur 4 anneaux','Chemise cartonnée','Pochette plastique','Porte-documents','Intercalaires'] },
  'Ciseaux & Découpe':        { emoji:'✂️',  color:'bg-rose-900/40 border-rose-700/50',  items:['Ciseaux scolaires','Ciseaux crantés','Cutter','Massicot'] },
  'Peinture & Art':           { emoji:'🎨',  color:'bg-purple-900/40 border-purple-700/50',items:['Peinture gouache','Peinture acrylique','Pinceau','Palette','Crayon de cire','Feutre de coloriage'] },
  'Autres Fournitures':       { emoji:'🔧',  color:'bg-gray-700/40 border-gray-600/50',  items:['Trombone','Agrafe','Agrafeuse','Post-it','Punaise','Craie','Ardoise'] },
};

export const EMOJI_MAP = {
  'Cahier TP':'📒','Cahier Privilège':'📘','Cahier 100 pages':'📔','Cahier 200 pages':'📕',
  'Cahier étudiant':'📙','Cahier grands carreaux':'📓','Cahier petits carreaux':'📓','Cahier spirale':'🗒️','Carnet':'📔',
  'Stylo bille':'🖊️','Stylo bille gel':'✒️','Stylo plume':'🪶','Marqueur permanent':'🖊️','Surligneur':'🖌️',
  'Crayon HB':'✏️','Crayon 2B':'✏️','Crayon de couleur':'🖍️','Crayon gras':'✏️','Fusain':'🖤',
  'Ensemble géométrie':'📐','Règle 30cm':'📏','Règle 20cm':'📏','Équerre':'📐','Compas':'🔭','Rapporteur':'📐',
  'Pot de colle':'🧴','Bâton de colle':'🧴','Colle liquide':'🫙','Ruban adhésif':'🎗️','Scotch':'🎗️',
  'Papier millimétré':'📊','Papier ministre':'📄','Papier chanson':'🎵','Papier calque':'📋','Papier Bristol':'📄','Papier kraft':'📦',
  'Taille-crayon simple':'🔪','Taille-crayon double':'✂️','Gomme blanche':'⬜','Gomme plastique':'⬜','Correcteur liquide':'🤍','Correcteur ruban':'🎀',
  'Classeur 2 anneaux':'📁','Classeur 4 anneaux':'📁','Chemise cartonnée':'📂','Pochette plastique':'🗂️','Intercalaires':'📑',
  'Ciseaux scolaires':'✂️','Cutter':'🔪',
  'Peinture gouache':'🎨','Peinture acrylique':'🎨','Pinceau':'🖌️','Palette':'🎨','Crayon de cire':'🖍️','Feutre de coloriage':'🖍️',
  'Trombone':'📎','Agrafe':'📌','Agrafeuse':'🖇️','Post-it':'🗒️','Punaise':'📌','Craie':'🖊️','Ardoise':'🪨',
};

export function getEmoji(fourniture) {
  if (fourniture.image && fourniture.image.length < 5) return fourniture.image;
  return EMOJI_MAP[fourniture.sous_categorie] || EMOJI_MAP[fourniture.nom] || CATEGORIES[fourniture.categorie]?.emoji || '📦';
}
