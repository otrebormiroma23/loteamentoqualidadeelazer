/* =========================================================
   Santa Bárbara Resort — Interações, Conversão e Rastreamento
   ---------------------------------------------------------
   1) CONFIGURAÇÃO  → preencha os campos abaixo antes de publicar
   2) GTM / Pixels  → eventos já disparados no dataLayer
   3) CRM           → envio do formulário via API (fallback WhatsApp)
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     1. CONFIGURAÇÃO — EDITE AQUI
     ========================================================= */
  var CONFIG = {
    // ID do Google Tag Manager (ex.: 'GTM-ABC1234'). Deixe '' para desativar.
    gtmId: '',

    // Número do WhatsApp no formato: 55 + DDD + número (sem espaços, sem '+')
    whatsappNumber: '5511999999999',

    // Texto padrão enviado ao clicar em qualquer CTA de WhatsApp
    whatsappMessage: 'Olá! Vim pelo site do Santa Bárbara Resort e gostaria de saber mais sobre os lotes.',

    // URL da API do CRM (ex.: https://api.seucrm.com.br/leads). Deixe '' para modo demonstração.
    crmEndpoint: '',

    // Chave de origem enviada no payload para o CRM identificar a campanha (opcional)
    crmSource: 'site_santabarbara',

    // URL do Tour Virtual 360º
    tourUrl: '',

    // Telefone para clique (formato tel:)
    phone: '+5511999999999'
  };

  /* =========================================================
     2. GOOGLE TAG MANAGER
     ========================================================= */
  window.dataLayer = window.dataLayer || [];

  function track(event, params) {
    var payload = Object.assign({ event: event, page: location.pathname }, params || {});
    window.dataLayer.push(payload);
    if (window.__debugTrack) console.log('[track]', payload);
  }

  function initGTM() {
    if (!/^GTM-[A-Z0-9]+$/i.test(CONFIG.gtmId)) return;
    var s = document.createElement('script');
    s.textContent = '(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":' +
      'new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],' +
      'j=d.createElement(s),dl=l!="dataLayer"&l!="dataLayer"?"&l=":"";j.async=true;' +
      'j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);' +
      '})(window,document,"script","dataLayer","' + CONFIG.gtmId + '");';
    document.head.appendChild(s);
  }

  /* =========================================================
     3. HELPERS
     ========================================================= */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function buildWhatsAppUrl(message) {
    var msg = message || CONFIG.whatsappMessage;
    return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(msg);
  }

  function utm() {
    var p = new URLSearchParams(location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    var out = {};
    keys.forEach(function (k) { if (p.get(k)) out[k] = p.get(k); });
    return out;
  }

  /* =========================================================
     4. LINKS DE CONVERSÃO (WhatsApp, telefone, tour, mapa)
     ========================================================= */
  function bindLinks() {
    var wa = buildWhatsAppUrl();

    ['whatsFloat', 'ctaMain', 'ctaFooter', 'mobileWhats', 'footerWhats', 'successWhats'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = wa;
    });

    var phone = document.getElementById('footerPhone');
    if (phone) phone.href = 'tel:' + CONFIG.phone;

    ['tourLink', 'footerTour'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && CONFIG.tourUrl) el.href = CONFIG.tourUrl;
      else if (el) el.removeAttribute('target');
    });
  }

  /* =========================================================
     5. HEADER + NAVEGAÇÃO
     ========================================================= */
  function initHeader() {
    var header = $('#header');
    var toggle = $('#navToggle');
    var nav = $('#nav');

    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =========================================================
     6. VÍDEO DE FUNDO (carregado só depois da primeira pintura)
     ========================================================= */
  function initHeroVideo() {
    var video = $('#heroVideo');
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (navigator.connection && navigator.connection.saveData) return;

    var small = window.matchMedia('(max-width: 760px)').matches;
    var src = small
      ? 'assets/video/hero-720.mp4'   // 2,7 MB
      : 'assets/video/hero-1080.mp4'; // 5,2 MB

    var start = function () {
      var s = document.createElement('source');
      s.src = src;
      s.type = 'video/mp4';
      video.appendChild(s);
      video.load();
      var play = video.play();
      if (play && play.then) play.catch(function () { /* autoplay bloqueado → poster permanece */ });
      video.addEventListener('playing', function () { video.classList.add('is-ready'); }, { once: true });
    };

    // Só carrega o vídeo depois que a página e a imagem de capa terminarem de carregar
    if (document.readyState === 'complete') setTimeout(start, 400);
    else window.addEventListener('load', function () { setTimeout(start, 400); }, { once: true });
  }

  /* =========================================================
     7. REVELAÇÃO AO ROLAR + CONTADORES
     ========================================================= */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-visible'); }, Math.min(i * 80, 320));
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function initCounters() {
    var els = $$('.counter');
    if (!els.length || !('IntersectionObserver' in window)) return;

    var animate = function (el) {
      var target = parseFloat(el.dataset.count);
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var dur = 1500;
      var t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animate(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     8. MÁSCARAS E VALIDAÇÃO DO FORMULÁRIO
     ========================================================= */
  function maskPhone(v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function setError(name, msg) {
    var input = document.getElementById(name);
    var slot = document.querySelector('[data-error-for="' + name + '"]');
    if (input) input.classList.toggle('is-invalid', !!msg);
    if (slot) slot.textContent = msg || '';
  }

  function validate(data) {
    var ok = true;
    ['nome', 'email', 'whatsapp'].forEach(function (k) { setError(k, ''); });

    if (data.nome.trim().length < 3) { setError('nome', 'Informe o seu nome completo.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(data.email.trim())) { setError('email', 'Informe um e-mail válido.'); ok = false; }

    var digits = data.whatsapp.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) { setError('whatsapp', 'Informe um WhatsApp válido com DDD.'); ok = false; }

    return ok;
  }

  /* =========================================================
     9. ENVIO DO FORMULÁRIO → CRM (+ evento de conversão)
     ========================================================= */
  function initForm() {
    var form = $('#leadForm');
    if (!form) return;

    var phone = $('#whatsapp');
    var started = false;

    phone.addEventListener('input', function () { phone.value = maskPhone(phone.value); });

    // Dispara form_start no primeiro toque nos campos (alimenta o pixel/CM)
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      track('form_start', { form_id: 'hero_lead' });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {
        nome: $('#nome').value,
        email: $('#email').value,
        whatsapp: phone.value
      };

      if (!validate(data)) {
        track('form_error', { form_id: 'hero_lead' });
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      var payload = Object.assign({
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        page: location.href,
        utm: utm(),
        source: CONFIG.crmSource,
        timestamp: new Date().toISOString()
      }, utm());

      var success = function () {
        btn.disabled = false;
        btn.textContent = original;
        form.classList.add('is-sent');
        $('#formSuccess').hidden = false;

        var wa = $('#successWhats');
        if (wa) {
          wa.href = buildWhatsAppUrl(
            'Olá! Acabei de me cadastrar no site do Santa Bárbara Resort.\n' +
            'Nome: ' + data.nome + '\n' +
            'Quero falar sobre os lotes disponíveis.'
          );
        }

        track('lead_generated', {
          form_id: 'hero_lead',
          lead_type: 'formulario',
          nome: data.nome,
          whatsapp: payload.whatsapp
        });
      };

      if (!CONFIG.crmEndpoint) {
        // Modo demonstração: substitua CONFIG.crmEndpoint pela API do CRM
        console.info('[Santa Bárbara] CRM não configurado — lead capturado em modo demo:', payload);
        setTimeout(success, 500);
        return;
      }

      fetch(CONFIG.crmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          success();
        })
        .catch(function (err) {
          console.error('[Santa Bárbara] Falha ao enviar para o CRM:', err);
          track('lead_error', { form_id: 'hero_lead' });
          // Fallback: envia o lead direto para o WhatsApp do consultor
          window.open(buildWhatsAppUrl(
            'Olá! Meus dados não enviaram automaticamente.\n' +
            'Nome: ' + data.nome + '\nE-mail: ' + data.email + '\nWhatsApp: ' + data.whatsapp
          ), '_blank', 'noopener');
          btn.disabled = false;
          btn.textContent = original;
        });
    });
  }

  /* =========================================================
     10. EVENTOS DE CLIQUE (CTAs) + PROFUNDIDADE DE ROLAGEM
     ========================================================= */
  function initTracking() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-cta]');
      if (!el) return;
      var cta = el.dataset.cta;
      var isWhats = /whatsapp|whats/i.test(cta);
      track(isWhats ? 'whatsapp_click' : 'cta_click', {
        cta_id: cta,
        cta_text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        cta_location: el.closest('section') ? el.closest('section').id || 'global' : 'global'
      });
    });

    // Telefone
    var phone = $('#footerPhone');
    if (phone) phone.addEventListener('click', function () { track('phone_click', { cta_id: 'rodape_telefone' }); });

    // Profundidade de rolagem (25/50/75/100%)
    var steps = [25, 50, 75, 100];
    var reached = {};
    var onScrollDepth = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? Math.round((window.scrollY / h) * 100) : 100;
      steps.forEach(function (s) {
        if (pct >= s && !reached[s]) { reached[s] = true; track('scroll_depth', { depth: s }); }
      });
    };
    window.addEventListener('scroll', onScrollDepth, { passive: true });

    // Visualização de seções
    if ('IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || seen[en.target.id]) return;
          seen[en.target.id] = true;
          track('section_view', { section: en.target.id });
        });
      }, { threshold: 0.25 });
      $$('main section[id]').forEach(function (s) { io.observe(s); });
    }

    // Tempo na página (lead qualificado)
    setTimeout(function () { track('time_on_page', { seconds: 30, qualified: true }); }, 30000);
  }

  /* =========================================================
     11. LIGHTBOX DA GALERIA
     ========================================================= */
  function initLightbox() {
    var box = $('#lightbox');
    if (!box) return;
    var imgEl = $('#lightboxImg');
    var capEl = $('#lightboxCaption');
    var items = $$('[data-lightbox]');
    var index = 0;

    var show = function (i) {
      index = (i + items.length) % items.length;
      var fig = items[index];
      var img = fig.querySelector('img');
      imgEl.src = img.currentSrc || img.src;
      imgEl.alt = img.alt || '';
      var title = fig.querySelector('.gallery-title');
      capEl.textContent = (title ? title.textContent + ' — ' : '') + (img.alt || '');
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      $('#lightboxClose').focus();
    };

    var hide = function () {
      box.hidden = true;
      document.body.style.overflow = '';
    };

    items.forEach(function (fig, i) {
      fig.addEventListener('click', function () {
        show(i);
        track('gallery_open', { item: (fig.querySelector('.gallery-title') || {}).textContent || '' });
      });
    });

    $('#lightboxClose').addEventListener('click', hide);
    $('#lightboxPrev').addEventListener('click', function () { show(index - 1); });
    $('#lightboxNext').addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) hide(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
  }

  /* =========================================================
     12. INICIALIZAÇÃO
     ========================================================= */
  function init() {
    initGTM();
    bindLinks();
    initHeader();
    initHeroVideo();
    initReveal();
    initCounters();
    initForm();
    initTracking();
    initLightbox();

    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    track('page_view', {
      page_title: document.title,
      referrer: document.referrer || '(direct)'
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
