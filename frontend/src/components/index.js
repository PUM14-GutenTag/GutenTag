const englishCode = 'en-US';
const spanishCode = 'es-ES';
function getAboutUsLink(language) {
  switch (language.toLowerCase()) {
    case englishCode.toLowerCase():
      return '/about-us';
    case spanishCode.toLowerCase():
      return '/acerca-de';
    default:
      return '';
  }
}
module.exports = getAboutUsLink;
