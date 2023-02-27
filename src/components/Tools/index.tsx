import _ from 'lodash';
import htmr from 'htmr';

export function ParseKeywordColor(message: string, keyword: string) {
  let msg = message;
  if (!message) {
    return <span> </span>;
  }
  const mword = keyword.replace(/"/g, '').replace(/AND /g, '');
  const reg = new RegExp(mword, 'gi');
  const words = _.uniq(message.match(reg));
  words.forEach((word: string) => {
    const regi = new RegExp(word, 'g');
    msg = msg.replace(regi, `<b style="color:red">${word}</b>`);
  });
  return htmr(`<span>${msg}</span>`);
}
