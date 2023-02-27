const html = (emailContent) => `${emailContent}
<script>

function googleTranslateElementInit() {
  document.body.setAttribute('id','google_translate_element');
  new google.translate.TranslateElement(
    {
      //这个参数不起作用，看文章底部更新，翻译面板的语言
      //pageLanguage: 'zh-CN',
      //这个是你需要翻译的语言，比如你只需要翻译成越南和英语，这里就只写en,vi
      includedLanguages:
        'en,zh-CN,hr,cs,da,nl,fr,de,el,iw,hu,ga,it,ja,ko,pt,ro,ru,sr,es,th,vi',
      //选择语言的样式，这个是面板，还有下拉框的样式，具体的记不到了，找不到api~~
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      //自动显示翻译横幅，就是翻译后顶部出现的那个，有点丑，这个属性没有用的话，请看文章底部的其他方法
      autoDisplay: true,
      //还有些其他参数，由于原插件不再维护，找不到详细api了，将就了，实在不行直接上dom操作
    },
    'google_translate_element', //触发按钮的id
  );
}
</script>
<script src="https://translate.google.cn/translate_a/element.js?cb=googleTranslateElementInit"></script>
`;
// function addScript(src){//手动添加script标签
//   let script=document.createElement("script");
//   script.type="text/JavaScript";
//   script.src= src;
//   document.getElementsByTagName('head')[0].appendChild(script);
// }
export default html;
