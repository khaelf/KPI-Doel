const KATA_SAMBUNG = new Set([
  'di',
  'ke',
  'dari',
  'dan',
  'atau',
  'yang',
  'untuk',
  'pada',
  'dengan',
  'dalam',
  'oleh',
  'sebagai',
  'tentang',
  'atas',
  'serta',
  'hingga',
  'sampai',
  'karena',
  'sebab',
  'agar',
  'supaya',
  'namun',
  'tetapi',
  'tapi',
  'melainkan',
  'sedangkan',
  'padahal',
  'jika',
  'bila',
  'apabila',
  'kalau',
  'jikalau',
  'meski',
  'meskipun',
  'walau',
  'walaupun',
  'seperti',
  'antara',
  'bagi',
  'guna',
  'demi',
  'tanpa',
  'kecuali',
  'selain',
  'menuju',
  'terhadap',
  'melalui',
  'lewat',
  'sejak',
  'selama',
  'sebelum',
  'sesudah',
  'setelah',
  'ketika',
  'sambil',
  'seraya',
  'lalu',
  'kemudian',
  'yakni',
  'yaitu',
  'bahwa',
  'maupun',
  'sehingga',
  'akibat',
  'sementara',
  'pun',
  'per',
  'via',
]);

/**
 * Converts text to Title Case (capitalizes the first letter of each word),
 * keeping Indonesian conjunctions & prepositions lowercase unless they start a sentence.
 */
export function autoCapitalizeText(val: string): string {
  if (!val) return val;

  let isFirstWord = true;
  return val.replace(/([a-zA-Zà-öø-ÿ]+)|([.!?\n]+)/g, (match, word, punctuation) => {
    if (punctuation) {
      isFirstWord = true;
      return punctuation;
    }

    if (!word) return match;

    const lower = word.toLowerCase();
    const isAllCaps = word.length > 1 && word === word.toUpperCase();

    if (!isFirstWord && KATA_SAMBUNG.has(lower) && !isAllCaps) {
      return lower;
    }

    isFirstWord = false;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}
