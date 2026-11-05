const contactForm = document.querySelector('#contact-form');
const contactFeedback = document.querySelector('#contact-feedback');

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  contactFeedback.textContent = 'Esta é uma demonstração: a mensagem não foi enviada. Ainda não existe um email de contacto configurado.';
});
