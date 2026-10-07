/* =========================================================
   Santa Bárbara Resort — Interações, Conversão e Rastreamento
   ---------------------------------------------------------
   1) CONFIGURAÇÃO  → preencha os campos abaixo antes de publicar
   2) GTM / Pixels  → eventos já disparados no dataLayer + Meta Pixel
   3) CRM           → envio do formulário (Leadfy ou CRM genérico) + fallback WhatsApp
   4) IDIOMAS       → seletor de idioma com Google Translate (após consentimento)
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
    whatsappNumber: '5511918708781',

    // Texto padrão enviado ao clicar em qualquer CTA de WhatsApp
    whatsappMessage: 'Olá! Vim pelo site do Santa Bárbara Resort e gostaria de saber mais sobre os lotes.',

    // URL da API do CRM (ex.: https://api.seucrm.com.br/leads). Deixe '' para modo demonstração.
    crmEndpoint: '',

    // Chave de origem enviada no payload para o CRM identificar a campanha (opcional)
    crmSource: 'site_santabarbara',

    // ID do Meta Pixel (Facebook/Instagram) — ex.: '123456789012345'.
    // Deixe '' para manter desativado. Só carrega após o aceite de cookies.
    metaPixelId: '1128316885943842',

    // Leadfy — IDENTIFICADOR do webhook de criação de lead.
    // Formatos aceitos: hash da empresa (10 caracteres, ex.: '18952qf65x'),
    // 'grp-xxxxxx' (grupo) ou 'usr-xxxxxx' (corretor). Peça à equipe de suporte da Leadfy.
    // Valor recuperado do site antigo (WordPress): o formulário enviava para
    // grupo-f654pt-cap-kabl4y@leadfy-app.com.br — mesmo formato grp-<6>-cap-<6>
    // documentado em https://leadfy-imob.com.br/ajuda/integracao-via-api
    // Deixe '' para manter o modo demonstração.
    leadfyId: 'grp-f654pt-cap-kabl4y',

    // URL do Tour Virtual 360º (abre em modal com iframe; sem URL, o botão vira link externo)
    tourUrl: 'https://tour.meupasseiovirtual.com/view/pXBTiiy7fYU',

    // Telefone para clique (formato tel:)
    phone: '+5511918708781'
  };

  /* =========================================================
     2. GOOGLE TAG MANAGER
     ========================================================= */
  window.dataLayer = window.dataLayer || [];

  function track(event, params) {
    var payload = Object.assign({ event: event, page: location.pathname }, params || {});
    window.dataLayer.push(payload);
    if (window.__debugTrack) console.log('[track]', payload);
    metaTrack(event);
  }

  function initGTM() {
    if (window.__gtmLoaded) return;
    if (!/^GTM-[A-Z0-9]+$/i.test(CONFIG.gtmId)) return;
    window.__gtmLoaded = true;
    var s = document.createElement('script');
    s.textContent = '(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":' +
      'new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],' +
      'j=d.createElement(s),dl=l!="dataLayer"&l!="dataLayer"?"&l=":"";j.async=true;' +
      'j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);' +
      '})(window,document,"script","dataLayer","' + CONFIG.gtmId + '");';
    document.head.appendChild(s);
  }

  /* =========================================================
     2.2 META PIXEL (Facebook / Instagram)
     Carregado somente após o consentimento de cookies.
     Nunca envia dados pessoais (PII) para o pixel.
     ========================================================= */
  var META_MAP = {
    whatsapp_click: 'Contact',
    phone_click: 'Contact',
    lead_generated: 'Lead',
    tour_open: 'ViewContent',
    gallery_open: 'ViewContent'
  };

  function metaTrack(event) {
    if (typeof window.fbq !== 'function') return;
    var ev = META_MAP[event];
    if (!ev) return;
    window.fbq('track', ev, { content_name: 'Santa Bárbara Resort' });
  }

  function initPixel() {
    if (window.__pixelLoaded) return;
    if (!/^\d{6,20}$/.test(CONFIG.metaPixelId)) return;
    window.__pixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
    window.fbq('consent', readConsent() === 'granted' ? 'grant' : 'revoke');
  }

  function pixelConsent(granted) {
    if (typeof window.fbq !== 'function') return;
    window.fbq('consent', granted ? 'grant' : 'revoke');
  }

  /* =========================================================
     2.1 CONSENTIMENTO DE COOKIES (LGPD + Google Consent Mode v2)
     ========================================================= */
  var CONSENT_KEY = 'sb_cookie_consent';

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* modo privado */ }
  }

  // Shim do gtag: só enfileira os comandos de consentimento no dataLayer.
  // O gtag.js (carregado pelo GTM) consome a fila quando inicializa.
  function gtag() { window.dataLayer.push(arguments); }

  function consentDefault() {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });
  }

  function consentUpdate(granted) {
    var value = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value
    });
  }

  function initConsent() {
    consentDefault();

    var bar = $('#cookieBar');
    var choice = readConsent();
    var show = function () { if (bar) bar.hidden = false; };
    var hide = function () { if (bar) bar.hidden = true; };

    var apply = function (value) {
      writeConsent(value);
      consentUpdate(value === 'granted');
      if (value === 'granted') { initGTM(); initPixel(); applyPendingLang(); }   // sem aceite, GTM/pixels não são injetados
      else { pixelConsent(false); }
      hide();
      track('cookie_consent', { choice: value });
    };

    if (bar) {
      $('#cookieAccept').addEventListener('click', function () { apply('granted'); });
      $('#cookieReject').addEventListener('click', function () { apply('denied'); });
    }

    // Link "Cookies" do rodapé reabre as preferências
    var prefs = $('#cookiePrefs');
    if (prefs) prefs.addEventListener('click', function (e) { e.preventDefault(); show(); });

    if (choice === 'granted') { consentUpdate(true); initGTM(); initPixel(); hide(); }
    else if (choice === 'denied') { consentUpdate(false); hide(); }
    else { show(); } // primeira visita: sem escolha, nada de terceiros
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

    // footerWhats não entra nesta lista: ele tem link próprio (wa.me/message) direto no HTML
    ['whatsFloat', 'ctaMain', 'ctaFooter', 'mobileWhats', 'successWhats'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = wa;
    });

    var phone = document.getElementById('footerPhone');
    if (phone) phone.href = 'tel:' + CONFIG.phone;

    ['tourLink', 'footerTour'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (CONFIG.tourUrl) {
        el.href = CONFIG.tourUrl;   // fallback: abre em nova aba caso o JS do modal falhe
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.removeAttribute('target');
      }
    });
  }

  /* =========================================================
     5. HEADER + NAVEGAÇÃO
     ========================================================= */
  function initHeader() {
    var header = $('#header');
    var toggle = $('#navToggle');
    if (!header) return;   // páginas legais não têm o header do site

    var onScroll = function () {
      header.classList.toggle('is-solid', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle) toggle.addEventListener('click', function () {
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
      ? 'assets/video/hero-720.mp4'   // versão mobile (hoje: idêntico ao 1080 — 22,5 MB)
      : 'assets/video/hero-1080.mp4'; // versão desktop (22,5 MB)

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
    if (slot) slot.textContent = msg ? tr(msg) : '';
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
      btn.textContent = tr('Enviando…');

      var utmData = utm();

      // Endpoint: webhook oficial da Leadfy (CONFIG.leadfyId) ou CRM genérico
      var leadfyUrl = CONFIG.leadfyId
        ? 'https://leadfy-imob.com.br/webhooks/criar_lead/' + encodeURIComponent(CONFIG.leadfyId) + '/'
        : '';
      var endpoint = leadfyUrl || CONFIG.crmEndpoint;

      var payload = Object.assign({
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        page: location.href,
        utm: utmData,
        source: CONFIG.crmSource,
        timestamp: new Date().toISOString()
      }, utmData);

      // Payload no padrão documentado pela API da Leadfy
      // (https://leadfy-imob.com.br/ajuda/integracao-via-api)
      var leadfyPayload = {
        nome: data.nome,
        email: data.email,
        telefone: data.whatsapp.replace(/\D/g, ''),
        name: data.nome,                             // alias citado no exemplo da própria documentação
        phone: data.whatsapp.replace(/\D/g, ''),     // alias citado no exemplo da própria documentação
        origem: CONFIG.crmSource,
        tag: 'site',
        descricao: 'Cadastro pelo site — Santa Bárbara Resort',
        mensagem: 'Solicitação de informações: lotes de 450m² a 2.500m²',
        observacao: 'Página: ' + location.href +
          (Object.keys(utmData).length ? ' | UTM: ' + JSON.stringify(utmData) : '')
      };

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

      if (!endpoint) {
        // Modo demonstração: preencha CONFIG.leadfyId (Leadfy) ou CONFIG.crmEndpoint (CRM)
        console.info('[Santa Bárbara] Leadfy/CRM não configurado — lead capturado em modo demo:', payload);
        setTimeout(success, 500);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadfyUrl ? leadfyPayload : payload)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          success();
        })
        .catch(function (err) {
          console.error('[Santa Bárbara] Falha ao enviar para o Leadfy/CRM:', err);
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
     12. TOUR VIRTUAL 360º (modal com iframe)
     ========================================================= */
  function initTour() {
    var box = $('#tourModal');
    if (!box) return;
    var frame = $('#tourFrame');
    var triggers = [$('#tourLink'), $('#footerTour')].filter(Boolean);
    if (!triggers.length) return;

    var show = function (source) {
      if (!CONFIG.tourUrl) return false;
      frame.src = CONFIG.tourUrl;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      $('#tourClose').focus();
      track('tour_open', { source: source || 'localizacao' });
      return true;
    };

    var hide = function () {
      box.hidden = true;
      document.body.style.overflow = '';
      frame.src = 'about:blank'; // para a reprodução/áudio do tour
    };

    triggers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        // sem URL configurada, deixa o link agir normalmente
        if (!show(el.id === 'footerTour' ? 'rodape' : 'localizacao')) return;
        e.preventDefault();
      });
    });

    $('#tourClose').addEventListener('click', hide);
    box.addEventListener('click', function (e) { if (e.target === box) hide(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') hide();
    });
  }

  /* =========================================================
     12.1 IDIOMAS — tradutor embutido (motor do Google Translate)
     Sem widget/banner do Google: usamos a API pública de tradução
     (translate.googleapis.com), carregada só após consentimento.
     ========================================================= */
  var LANG_KEY = 'sb_lang';
  var TR_KEY = 'sb_tr_';
  var LANG_LABEL = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR', it: 'IT', de: 'DE', ja: 'JA', 'zh-CN': 'ZH', ko: 'KO', ru: 'RU', nl: 'NL' };
  var idiomaAtual = 'pt';
  var pendingLang = null;
  var mapaTextos = null;   // itens com o texto original em PT (coletados uma vez)
  var cacheTr = {};        // cacheTr[idioma] = { textoOriginal: traducao }
  var traduzindo = false;

  // Strings geradas pelo JavaScript (não existem no DOM)
  var TR_EXTRAS = [
    'Informe o seu nome completo.',
    'Informe um e-mail válido.',
    'Informe um WhatsApp válido com DDD.',
    'Enviando…'
  ];

  // Traduz uma string já em cache (usada pela validação do formulário)
  function tr(txt) {
    if (idiomaAtual === 'pt' || !txt) return txt;
    var c = cacheTr[idiomaAtual];
    return (c && c[txt]) ? c[txt] : txt;
  }

  /* ---- coleta dos textos traduzíveis (nós + atributos + meta) ---- */
  function montarMapa() {
    if (mapaTextos) return mapaTextos;

    var itens = [];
    var ignorar = '#langSwitch, .notranslate, .counter, .strip-value, .creci';

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || !p.nodeName) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|NOSCRIPT|IFRAME|TEXTAREA|OPTION|CODE|KBD)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.ownerSVGElement) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest(ignorar)) return NodeFilter.FILTER_REJECT;
        var t = n.nodeValue;
        if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
        if (!/[A-Za-zÀ-ÿ]/.test(t)) return NodeFilter.FILTER_REJECT;   // só números/telefones ficam de fora
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      itens.push({ node: node, orig: node.nodeValue, chave: node.nodeValue.trim() });
    }

    ['alt', 'placeholder', 'aria-label', 'title'].forEach(function (attr) {
      Array.prototype.forEach.call(document.querySelectorAll('[' + attr + ']'), function (el) {
        if (el.closest && el.closest(ignorar)) return;
        var v = el.getAttribute(attr);
        if (!v || !v.trim() || !/[A-Za-zÀ-ÿ]/.test(v)) return;
        itens.push({ el: el, attr: attr, orig: v, chave: v.trim() });
      });
    });

    itens.push({ tipo: 'title', orig: document.title, chave: document.title.trim() });

    var md = document.querySelector('meta[name="description"]');
    if (md) itens.push({ el: md, attr: 'content', orig: md.getAttribute('content'), chave: md.getAttribute('content').trim() });

    mapaTextos = itens;
    return itens;
  }

  /* ---- cache por idioma (localStorage) ---- */
  function lerCache(lang) {
    if (cacheTr[lang]) return cacheTr[lang];
    cacheTr[lang] = {};
    try {
      var raw = localStorage.getItem(TR_KEY + lang);
      if (raw) cacheTr[lang] = JSON.parse(raw) || {};
    } catch (e) { /* modo privado */ }
    return cacheTr[lang];
  }

  function gravarCache(lang) {
    try { localStorage.setItem(TR_KEY + lang, JSON.stringify(cacheTr[lang])); } catch (e) { /* modo privado */ }
  }

  /* ---- requisições ao Google Translate ---- */
  function urlTraducao(lang, texto) {
    return 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' +
      encodeURIComponent(lang) + '&dt=t&q=' + encodeURIComponent(texto);
  }

  function parseResposta(json) {
    return (json && json[0] ? json[0] : []).map(function (s) { return s[0]; }).join('');
  }

  function traduzirUmAVUm(textos, lang) {
    var c = lerCache(lang);
    return textos.reduce(function (p, t) {
      return p.then(function () {
        return fetch(urlTraducao(lang, t))
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (j) { c[t] = parseResposta(j).trim(); })
          .catch(function () { /* mantém o texto original */ });
      });
    }, Promise.resolve());
  }

  function traduzirBloco(textos, lang) {
    var pacote = textos.join('\n@@\n');
    return fetch(urlTraducao(lang, pacote))
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var partes = parseResposta(j).split('\n@@\n');
        if (partes.length !== textos.length) return traduzirUmAVUm(textos, lang); // estrutura inesperada
        var c = lerCache(lang);
        textos.forEach(function (t, k) { c[t] = partes[k].trim(); });
      });
  }

  function traduzirPendentes(lang) {
    var c = lerCache(lang);
    var pendentes = [];
    var vistos = {};

    var fontes = montarMapa().map(function (i) { return i.chave; }).concat(TR_EXTRAS);
    fontes.forEach(function (t) {
      if (!t || vistos[t]) return;
      vistos[t] = 1;
      if (c[t] === undefined) pendentes.push(t);
    });
    if (!pendentes.length) return Promise.resolve();

    // Blocos de até 10 textos / ~950 caracteres, 3 blocos em paralelo
    var blocos = [], atual = [], tam = 0;
    pendentes.forEach(function (t) {
      if (atual.length && (tam + t.length + 10 > 950 || atual.length >= 10)) { blocos.push(atual); atual = []; tam = 0; }
      atual.push(t); tam += t.length + 10;
    });
    if (atual.length) blocos.push(atual);

    var proximo = 0;
    function rodar() {
      if (proximo >= blocos.length) return Promise.resolve();
      var bloco = blocos[proximo++];
      return traduzirBloco(bloco, lang).then(rodar, rodar);
    }

    var pistas = [];
    for (var k = 0; k < 3; k++) pistas.push(rodar());

    return Promise.all(pistas).then(function () { gravarCache(lang); });
  }

  /* ---- aplicação no DOM ---- */
  function aplicarIdioma(lang) {
    var c = lerCache(lang);
    var itens = montarMapa();

    itens.forEach(function (item) {
      var alvo = item.orig;
      if (lang !== 'pt' && c[item.chave] !== undefined) alvo = c[item.chave];

      if (item.node) {
        var lead = (item.orig.match(/^\s*/) || [''])[0];
        var fim = (item.orig.match(/\s*$/) || [''])[0];
        item.node.nodeValue = lead + alvo + fim;
      } else if (item.el) {
        item.el.setAttribute(item.attr, alvo);
      } else if (item.tipo === 'title') {
        document.title = alvo;
      }
    });
  }

  function setLangUI(code) {
    var cur = $('#langCurrent');
    if (cur) cur.textContent = LANG_LABEL[code] || 'PT';
    var b = $('#langBtn');
    if (b) b.setAttribute('aria-label', (LANG_LABEL[code] || 'PT') + ' — Idioma do site');
    $$('#langMenu button[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-current', btn.dataset.lang === code ? 'true' : 'false');
    });
    document.documentElement.lang = (code === 'pt') ? 'pt-BR' : code;
  }

  function trocarIdioma(lang) {
    if (traduzindo || lang === idiomaAtual) return;

    if (lang !== 'pt' && readConsent() !== 'granted') {
      // Sem consentimento não consultamos serviços de terceiros
      pendingLang = lang;
      var hint = $('#cookieHint');
      if (hint) hint.hidden = false;
      var bar = $('#cookieBar');
      if (bar) bar.hidden = false;
      var acc = $('#cookieAccept');
      if (acc) acc.focus();
      return;
    }

    var btn = $('#langBtn');
    var concluir = function () {
      aplicarIdioma(lang);
      setLangUI(lang);
      traduzindo = false;
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
      try {
        if (lang === 'pt') localStorage.removeItem(LANG_KEY);
        else localStorage.setItem(LANG_KEY, lang);
      } catch (e) { /* modo privado */ }
      track('lang_change', { lang: lang });
    };

    idiomaAtual = lang;

    if (lang === 'pt') { concluir(); return; }

    traduzindo = true;
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }

    traduzirPendentes(lang)
      .then(concluir)
      .catch(function (err) {
        console.warn('[Santa Bárbara] Falha ao traduzir:', err);
        concluir();   // aplica o que já estava em cache; o resto permanece em PT
      });
  }

  function applyPendingLang() {
    if (!pendingLang) return;
    var code = pendingLang;
    pendingLang = null;
    var hint = $('#cookieHint');
    if (hint) hint.hidden = true;
    trocarIdioma(code);
  }

  function initLang() {
    var btn = $('#langBtn');
    var menu = $('#langMenu');
    if (!btn || !menu) return;

    var open = function (state) {
      menu.hidden = !state;
      btn.setAttribute('aria-expanded', String(state));
    };

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      open(menu.hidden);
    });

    menu.addEventListener('click', function (e) {
      var item = e.target.closest('button[data-lang]');
      if (!item) return;
      trocarIdioma(item.dataset.lang);
      open(false);
    });

    document.addEventListener('click', function (e) {
      if (menu.hidden) return;
      if (e.target.closest('#langSwitch')) return;
      open(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || menu.hidden) return;
      open(false);
      btn.focus();
    });

    // Em telas pequenas o seletor mora na barra do header (sempre visível);
    // no desktop ele fica dentro do menu principal.
    var sw = $('#langSwitch');
    var inner = $('.header-inner');
    var nav = $('#nav');
    var toggle = $('#navToggle');
    var ajustarLocal = function () {
      if (!sw || !inner || !nav || !toggle) return;   // páginas legais
      var noHeader = sw.parentNode === inner;
      if (window.matchMedia('(max-width: 940px)').matches) {
        if (!noHeader) inner.insertBefore(sw, toggle);
      } else if (noHeader) {
        nav.insertBefore(sw, nav.querySelector('.nav-cta'));
      }
    };
    ajustarLocal();
    window.addEventListener('resize', ajustarLocal);

    // Restaura o idioma salvo (só quando os cookies já foram aceitos)
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* modo privado */ }
    if (saved && saved !== 'pt') {
      if (readConsent() === 'granted') trocarIdioma(saved);
      else pendingLang = saved;   // aplica assim que o visitante aceitar
    }
  }

  /* =========================================================
     13. INICIALIZAÇÃO
     ========================================================= */
  function init() {
    initConsent();
    bindLinks();
    initHeader();
    initHeroVideo();
    initReveal();
    initCounters();
    initForm();
    initTracking();
    initLightbox();
    initTour();
    initLang();

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
