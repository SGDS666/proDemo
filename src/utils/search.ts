export const exGoogleSearchWord = (words: string[] | undefined) => {
  let grammar = '';
  if (words && words.length === 1) {
    grammar = `${words[0]}`;
  } else if (words && words.length > 1) {
    grammar = `(${words.join(' | ')})`;
  }
  return grammar;
};

export const exIncludeWords = (words: string[] | undefined) => {
  let grammar = '';
  let description = '';
  if (words && words.length === 1) {
    grammar = `"${words[0]}"`;
    description = `关键词包含：${words[0]}`;
  } else if (words && words.length > 1) {
    grammar = `("${words.join('" | "')}")`;
    description = `关键词包含：${words.join(',')}`;
  }
  return { grammar, description };
};

export const exOtherIncludeWords = (words: string[] | undefined) => {
  let grammar = '';
  let description = '';
  if (words && words.length === 1) {
    grammar = `"${words[0]}"`;
    description = `同时包含：${words[0]}`;
  } else if (words && words.length > 1) {
    grammar = `("${words.join('" | "')}")`;
    description = `同时包含：${words.join(',')}`;
  }
  return { grammar, description };
};

export const exExcludeWord = (word: string) => {
  if (!word) return '';
  if (
    word.includes('site:') ||
    word.includes('intitle:') ||
    word.includes('intext:') ||
    word.indexOf('"') === 0
  ) {
    return `-${word}`;
  }
  return `-"${word}"`;
};

export const exExcludeWords = (words: string[] | undefined) => {
  let grammar = '';
  let description = '';
  if (words && words.length === 1) {
    const w = exExcludeWord(words[0]);
    grammar = ` ${w}`;
    description = ` 同时排除：${words[0]}`;
  } else if (words && words.length > 1) {
    words.forEach((word: string) => {
      const w = exExcludeWord(word);
      grammar += ` ${w}`;
    });
    description = ` 同时排除：${words.join(',')}`;
  }
  return { grammar, description };
};

export const exTitleWords = (words: string[] | undefined) => {
  let grammar = '';
  let description = '';
  if (words && words.length === 1) {
    grammar = `intitle:"${words[0]}"`;
    description = ` 标题包含：${words[0]}`;
  } else if (words && words.length > 1) {
    words.forEach((word: string, index: number) => {
      if (index === 0) {
        grammar += `intitle:"${word}"`;
      } else {
        grammar += ` | intitle:"${word}"`;
      }
    });
    grammar = `(${grammar})`;
    description = ` 标题包含：${words.join(',')}`;
  }
  return { grammar, description };
};

export const exSearchWords = (values: any, checkObj: any) => {
  const { includeKeywords, otherKeywords, excludeKeywords, titleKeywords } = values;
  const { otherChecked, titleChecked, excludeChecked } = checkObj;
  let grammar = '';
  let description = '';
  const { grammar: includeGrammar, description: includeDescription } =
    exIncludeWords(includeKeywords);
  if (includeGrammar) grammar += includeGrammar;
  if (includeDescription) description += includeDescription;

  if (otherChecked) {
    const { grammar: otherGrammar, description: otherDescription } =
      exOtherIncludeWords(otherKeywords);
    if (otherGrammar) grammar += ` AND ${otherGrammar}`;
    if (otherDescription) description += ` ${otherDescription}`;
  }

  if (titleChecked) {
    const { grammar: titleGramar, description: titleDescription } = exTitleWords(titleKeywords);
    if (titleGramar) grammar += ` AND ${titleGramar}`;
    if (titleDescription) description += titleDescription;
  }

  if (excludeChecked) {
    const { grammar: excludeGrammar, description: excludeDescription } =
      exExcludeWords(excludeKeywords);
    if (excludeGrammar) grammar += excludeGrammar;
    if (excludeDescription) description += excludeDescription;
  }

  return { grammar, description };
};

export const getSearchGrammar = (values: any) => {
  const checkObj = { otherChecked: true, titleChecked: true, excludeChecked: true };
  const { grammar, description } = exSearchWords(values, checkObj);
  return { grammar, description };
};

export const optimizeTitle = (grammar: string, optimize: boolean) => {
  if (!optimize || !grammar) return grammar;
  const lowerGrammar = grammar.toLocaleLowerCase();
  if (lowerGrammar.includes('intitle:') || lowerGrammar.includes('inurl:')) {
    return grammar;
  }
  const titleReg = new RegExp('\\(?intitle:.*\\)?', 'i');
  const titleWords = grammar.match(titleReg);
  if (!titleWords?.length) {
    const idx = grammar.indexOf('-');
    if (idx === 0) {
      return `(intitle:"about us" | intitle:"contact us") ${grammar}`;
    } else if (idx === -1) {
      return `${grammar} (intitle:"about us" | intitle:"contact us")`;
    } else {
      const index = idx - 1;
      return (
        grammar.slice(0, index) +
        ' (intitle:"about us" | intitle:"contact us")' +
        grammar.slice(index)
      );
    }
  }
  const titleWord = titleWords[0];
  const titles = titleWord
    .toLocaleLowerCase()
    .replace(/(intitle:|"|\(|\))/g, '')
    .split(' | ');
  const defaultTitles = ['about us', 'contact us'];
  defaultTitles.forEach((value: string) => {
    if (!titles.includes(value)) {
      titles.push(value);
    }
  });
  const { grammar: titleGramar } = exTitleWords(titles);
  return grammar.replace(titleWord, titleGramar);
};

export const optimizeExclude = (grammar: string, optimize: boolean) => {
  if (!optimize) return grammar;
  const defaultExcludes = [
    'alibaba.*',
    'amazon.*',
    '*.gov',
    '*.edu',
    '*.org',
    'news',
    'blogs',
    'magazine',
  ];
  let addGrammar = '';
  defaultExcludes.forEach((value: string) => {
    if (!grammar.includes(`-${value}`) && !grammar.includes(`-"${value}"`)) {
      addGrammar += ` -"${value}"`;
    }
  });
  return `${grammar}${addGrammar}`;
};

export const optimizeGrammar = (platform: string, grammar: string, optimize: boolean) => {
  if (!grammar || !optimize) return grammar;
  if (platform !== 'google') return grammar;
  let result = optimizeTitle(grammar, optimize);
  result = optimizeExclude(result, optimize);
  return result;
};

export const exKeywordOptions = (items: string[]) => {
  if (!items || !items.length) return [];
  return items.map((word: string) => {
    return { value: word, label: word };
  });
};

export const exPreciseBuyerGrammar = (values: any) => {
  const { categoryKeywords, importTypes, industryKeywords } = values;
  const { grammar: categoryGrammar } = exIncludeWords(categoryKeywords);
  const { grammar: industryGrammar } = exIncludeWords(industryKeywords);
  const importGrammar = exGoogleSearchWord(importTypes);
  let grammar = categoryGrammar;
  if (industryGrammar) {
    if (grammar) {
      grammar += ` AND ${industryGrammar}`;
    } else {
      grammar = industryGrammar;
    }
  }
  // if (grammar) {
  //   grammar += ' AND "importer"';
  // } else {
  //   grammar = '"importer"';
  // }
  if (importGrammar) {
    if (grammar) {
      grammar += ` AND ${importGrammar}`;
    } else {
      grammar += `${importGrammar}`;
    }
  } else {
    if (grammar) {
      grammar += ' AND importer';
    } else {
      grammar += 'importer';
    }
  }
  return grammar;
};
