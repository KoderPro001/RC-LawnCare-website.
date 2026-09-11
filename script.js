const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('nav');toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.setAttribute('aria-label',open?'Open menu':'Close menu');nav.classList.toggle('mobile-open',!open)});nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open menu');nav.classList.remove('mobile-open')}));

// Desktop browsers may have no handler for tel:, sms:, or mailto:. Keep those
// links native on phones, but keep desktop visitors on the page instead of
// allowing an empty handoff tab.
const isDesktop=()=>window.matchMedia('(min-width: 851px)').matches;
document.querySelectorAll('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]').forEach(link=>link.addEventListener('click',event=>{if(!isDesktop())return;event.preventDefault();document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'});document.querySelector('.quote-form input')?.focus({preventScroll:true})}));
const form=document.querySelector('.quote-form');form?.addEventListener('submit',event=>{if(!isDesktop())return;event.preventDefault();let status=document.querySelector('.form-status');if(!status){status=document.createElement('p');status.className='form-status';form.append(status)}status.textContent='Your request is ready. Please text 970 846 0980 or email Crcaretaker@gmail.com from your device.';status.setAttribute('role','status')});
