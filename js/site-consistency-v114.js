/* DSUTILITY v114 progressive layout normalizer. Does not run on PDF Editor or the two reference pages. */
(function(){'use strict';
var body=document.body;if(!body)return;var tool=(body.getAttribute('data-tool')||location.pathname.split('/').filter(Boolean).slice(-2,-1)[0]||'').toLowerCase();
if(/pdf-editor|pdf-compare|pdf-form-filler/.test(tool))return;
var main=document.querySelector('main');if(!main)return;
var title=main.querySelector('h1');if(!title)return;
var lead=main.querySelector('.lead')||title.parentElement.querySelector('p');
var special=main.querySelector('.da-page-head,.gpf-page-head');var hero=main.querySelector('.ds-tool-hero');
var slug=tool.replace(/[^a-z0-9-]/g,'');
var symbol='✦',category='UTILITY';
if(/qr/.test(slug)){symbol='▦';category=/upi/.test(slug)?'UPI PAYMENT':'QR MATRIX'}
else if(/age|date|calendar/.test(slug)){symbol='▦';category='CALENDAR'}
else if(/image|photo|passport|signature|background|collage/.test(slug)){symbol='▧';category='IMAGE STUDIO'}
else if(/calculator|ppf|gpf|nps|sip|da-|gratuity|tax|salary|swp/.test(slug)){symbol='∑';category='CALCULATOR'}
else if(/pdf|ocr|page|merge|split|rotate|compress/.test(slug)){symbol='▤';category='PDF WORKSPACE'}
else if(/resume|biodata|form/.test(slug)){symbol='▣';category='DOCUMENT MAKER'}
else if(/text|unicode|word|grammar|json|csv/.test(slug)){symbol='T';category='TEXT TOOL'}
if(!hero&&!special){
 var h=title;var desc=lead;
 if(h&&desc){hero=document.createElement('section');hero.className='ds-tool-hero ds-tool-hero-runtime';hero.setAttribute('aria-label',h.textContent.trim());var copy=document.createElement('div');copy.className='ds-tool-hero-copy';var art=document.createElement('div');art.className='ds-tool-hero-art ds-art-'+slug;art.setAttribute('aria-hidden','true');var visual=document.createElement('div');visual.className='ds-hero-document';var cat=document.createElement('span');cat.className='ds-hero-category';cat.textContent=category;var symbolEl=document.createElement('span');symbolEl.className='ds-hero-art-title';symbolEl.textContent=symbol+'  '+h.textContent.trim();var line=document.createElement('span');line.className='ds-hero-art-line';var line2=document.createElement('span');line2.className='ds-hero-art-line short';visual.append(cat,symbolEl,line,line2);art.appendChild(visual);var badge=document.createElement('span');badge.className='ds-hero-art-symbol';badge.textContent=symbol;art.appendChild(badge);hero.append(copy,art);h.parentNode.insertBefore(hero,h);copy.appendChild(h);if(desc&&desc!==h)copy.appendChild(desc);}
}
var existing=main.querySelector('.ds-tool-feature-grid');if(!existing){var cards=document.createElement('section');cards.className='ds-tool-feature-grid ds-tool-feature-grid-runtime';cards.setAttribute('aria-label','Tool guide and limitations');var descText=(lead&&lead.textContent||'Use this tool for the task described above.').trim();var useText='Enter the required information or choose your file, review the available options, then run the tool. Check the result before downloading, printing or using it elsewhere.';var limitText='Results depend on the input and the options you choose. Check file requirements, date/counting rules or output quality before relying on the result. Keep a backup of important originals.';var data=[['What this tool does',descText,'✦'],['How to use it',useText,'①'],['Limitations & checks',limitText,'✓']];data.forEach(function(d){var c=document.createElement('article');c.className='ds-tool-feature-card';var icon=document.createElement('span');icon.className='ds-feature-icon';icon.textContent=d[2];var h=document.createElement('h2');h.textContent=d[0];var p=document.createElement('p');p.textContent=d[1];c.append(icon,h,p);cards.appendChild(c)});var anchor=main.querySelector('.ds-tool-hero')||special||title.parentElement;if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(cards,anchor.nextSibling);}
})();
