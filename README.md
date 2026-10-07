# Santa Bárbara Resort — Landing Page de Alta Conversão

Website institucional e de vendas do loteamento **Santa Bárbara Resort**.
Página única, estática (HTML + CSS + JS puro), construída para carregar em menos de 2,5 s
e converter tráfego pago (Meta/Google Ads) em leads qualificados.

---

## 1. Como rodar localmente

Basta abrir o arquivo `index.html` no navegador, ou subir um servidor estático na pasta:

```bash
# Python
python -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Depois acesse `http://localhost:8080`.

---

## 2. Configuração obrigatória antes de publicar

Tudo o que precisa ser preenchido está em **um único lugar**:
`assets/js/main.js` → objeto `CONFIG` (linhas iniciais).

```js
var CONFIG = {
  gtmId: '',            // 'GTM-ABC1234'  → Google Tag Manager
  whatsappNumber: '5511918708781', // DDI + DDD + número
  whatsappMessage: '',  // mensagem padrão pré-preenchida
  crmEndpoint: '',      // URL da API do CRM (POST JSON)
  crmSource: 'site_santabarbara',
  tourUrl: 'https://tour.meupasseiovirtual.com/view/pXBTiiy7fYU', // Tour 360º (modal com iframe)
  phone: '+5511918708781'
};
```

### 2.1 WhatsApp
1. `whatsappNumber` está no formato `55` + DDD + número (ex.: `5511918708781`).
2. Os CTAs passam a apontar para `wa.me/<numero>?text=<mensagem>`:
   botão flutuante, botão principal, barra mobile e pós-formulário.
3. **Exceção:** o link "WhatsApp" do rodapé (`#footerWhats`) usa endereço próprio
   `https://wa.me/message/...` gravado direto no `index.html` — por isso ele não é
   sobrescrito pelo CONFIG (sem mensagem pré-preenchida).

### 2.2 Google Tag Manager / Pixels
1. Preencha `gtmId` com o ID do container (ex.: `GTM-ABC1234`).
2. O snippet do GTM é injetado automaticamente pelo JS — **não** é preciso colar nada no HTML.
3. Dentro do GTM, crie os triggers para os seguintes eventos do `dataLayer`:

| Evento | Disparado quando | Parâmetros |
|---|---|---|
| `page_view` | carregamento da página | `page_title`, `referrer` |
| `form_start` | 1º toque em qualquer campo do formulário | `form_id` |
| `form_error` | envio com campos inválidos | `form_id` |
| `lead_generated` | **conversão** — envio válido do formulário | `form_id`, `nome`, `whatsapp` |
| `lead_error` | falha de integração com o CRM | `form_id` |
| `whatsapp_click` | qualquer clique em CTA de WhatsApp | `cta_id`, `cta_text`, `cta_location` |
| `cta_click` | demais CTAs (formulário, planos, tour, mapa) | `cta_id`, `cta_text`, `cta_location` |
| `phone_click` | clique no telefone do rodapé | `cta_id` |
| `section_view` | 25% da seção visível | `section` |
| `scroll_depth` | 25/50/75/100% da página | `depth` |
| `gallery_open` | abertura do lightbox | `item` |
| `cookie_consent` | clique em “Aceitar”/“Recusar” cookies | `choice` (`granted` \| `denied`) |
| `tour_open` | abertura do modal Tour 360º | `source` (`localizacao` \| `rodape`) |
| `time_on_page` | 30 s na página (lead qualificado) | `seconds` |

> Para depurar no console: `window.__debugTrack = true`.

Conecte `lead_generated` ao **Meta Pixel** (evento `Lead`) e ao **Google Ads** (evento de conversão)
direto no GTM — assim o algoritmo recebe dados de qualidade e o CPA cai ao longo das campanhas.

### 2.3 Integração com o CRM
1. Preencha `crmEndpoint` com a URL da API que recebe o lead.
2. O JS envia `POST` com `Content-Type: application/json`:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "whatsapp": "5511988887777",
  "page": "https://site/",
  "utm_source": "instagram",
  "utm_medium": "paid",
  "utm_campaign": "lancamento_lotes",
  "gclid": "...",
  "fbclid": "...",
  "source": "site_santabarbara",
  "timestamp": "2026-10-06T14:00:00.000Z"
}
```

3. Enquanto `crmEndpoint` estiver vazio, o formulário roda em **modo demonstração**
   (só exibe a tela de sucesso e registra `lead_generated`).
4. Se a API falhar, o lead é **automaticamente reenviado ao WhatsApp do consultor**
   com nome, e-mail e telefone — nenhuma oportunidade se perde.

### 2.4 Tour 360º, mapa e telefone
- `tourUrl` → endereço do tour. Os botões "Tour Virtual 360º" (seção Localização e rodapé)
  abrem um **modal com iframe** por cima da página; se você esvaziar a variável, o botão volta
  a ser link externo. Tour hospedado em terceiros (`tour.meupasseiovirtual.com`) — se um dia você
  tiver o tour próprio, basta trocar a URL.
- O botão "Abrir no Google Maps" aponta para o link curto do pin exato
  (`https://maps.app.goo.gl/...`, em `index.html`, `#mapLink`).
- `phone` → telefone do rodapé.

### 2.5 Cookies e consentimento (LGPD)
- O aviso de cookies aparece **na primeira visita**. Sem escolha registrada, o GTM **não é
  injetado** e nenhum pixel roda — só o estritamente necessário ao site.
- Ao aceitar: `gtag('consent','update', granted)` é enviado (Consent Mode v2) e o GTM carrega.
  Ao recusar: nada de terceiros é carregado.
- A escolha fica em `localStorage` na chave `sb_cookie_consent` (`granted` / `denied`) e pode
  ser reaberta pelo link **“Preferências de cookies”** do rodapé (`#cookiePrefs`).
- No GTM, configure os triggers assumindo **Consent Mode**: `ad_storage`,
  `ad_user_data`, `ad_personalization` e `analytics_storage`.

---

## 3. Estrutura do projeto

```
/
├── index.html              # página única (H1/H2, meta, JSON-LD, seções)
├── politica-de-privacidade.html  # Política de Privacidade (LGPD)
├── termos-de-uso.html      # Termos de uso do site
├── lgpd.html               # Direitos do titular e encarregado (DPO)
├── assets/
│   ├── css/styles.css      # design system + responsivo (mobile-first)
│   ├── js/main.js          # CONFIG, GTM, CRM, formulário, galeria, tracking
│   ├── video/
│   │   ├── hero-720.mp4        # vídeo do hero — versão mobile (2,7 MB)
│   │   └── hero-1080.mp4       # vídeo do hero — versão desktop (5,2 MB)
│   └── img/
│       ├── favicon.png          # símbolo da marca (512×512)
│       ├── logo-lockup.png      # logo sem slogan (header)
│       ├── logo-footer.png      # logo com slogan (rodapé)
│       ├── logo-symbol.png      # só o símbolo (redes, selos)
│       ├── logo-santa-barbara.png # original 3508×2480 (fonte para novos cortes)
│       ├── palm-frond.svg       # overlay gráfico de folha de palmeira
│       └── fotos/               # TODAS as fotos do site (troque mantendo o nome)
│           ├── hero-poster.webp # capa do hero (1400×788)
│           ├── og-capa.jpg      # imagem de compartilhamento (1200×630)
│           ├── floresta.webp    # O Empreendimento (1000×667)
│           ├── acqua-spa.webp   # Galeria — Acqua SPA (1100×1650)
│           ├── clube.webp       # Galeria — Clubes (700×394)
│           ├── ecopista.webp    # Galeria — Ecopista (700×933)
│           ├── minigolfe.webp   # Galeria — Minigolfe (900×675)
│           ├── lagos.webp       # Galeria — Lagos (900×1300)
│           └── plaza.webp       # Comodidade / Plaza (1100×825)
├── robots.txt
├── sitemap.xml
└── README.md
```

### Seções (arquitetura da informação)
1. **Hero** — vídeo cinematográfico de fundo (palmeiras aéreas, sem som) + formulário flutuante
2. **Indicadores** — +7,4 mi de m² · 100% Qualidade de Vida · 450m² · 180x
3. **O Empreendimento** — natureza, aquífero e urbanismo
4. **Mundo de Lazer** — galeria assimétrica (Acqua SPA, Clubes, Ecopista, Minigolfe, Lagos)
5. **Segurança & Comodidade** — Plaza Santa Bárbara em ícones finos
6. **Investimento** — três condições de lote + CTA principal
7. **Localização** — distâncias, mapa, Tour 360º e FAQ (SEO)
8. **Rodapé** — contatos, links institucionais e trust signals

---

## 4. Trocar as fotos e o vídeo (assets provisórios)

Todas as fotos e o vídeo do site estão **dentro do projeto**, prontos para serem
substituídos pelos materiais reais do empreendimento:

- **Fotos:** `assets/img/fotos/` (9 arquivos)
- **Vídeo:** `assets/video/` (2 versões do mesmo clipe)

**Como trocar:** substitua o arquivo mantendo o **mesmo nome, extensão e proporção**.
Se a proporção (largura ÷ altura) mudar, atualize também os atributos `width`/`height`
do `<img>` correspondente para evitar salto de layout (CLS).

| Arquivo local | Onde aparece | Proporção atual |
|---|---|---|
| `assets/img/fotos/hero-poster.webp` | Fundo do hero (também no `<link rel="preload">`) | 1400×788 (16:9) |
| `assets/img/fotos/og-capa.jpg` | `og:image`, `twitter:image` e JSON-LD | 1200×630 |
| `assets/img/fotos/floresta.webp` | Dobra “O Empreendimento” | 1000×667 (3:2) |
| `assets/img/fotos/acqua-spa.webp` | Galeria — Acqua SPA | 1100×1650 (2:3) |
| `assets/img/fotos/clube.webp` | Galeria — Clubes | 700×394 (16:9) |
| `assets/img/fotos/ecopista.webp` | Galeria — Ecopista | 700×933 (3:4) |
| `assets/img/fotos/minigolfe.webp` | Galeria — Minigolfe | 900×675 (4:3) |
| `assets/img/fotos/lagos.webp` | Galeria — Lagos | 900×1300 (9:13) |
| `assets/img/fotos/plaza.webp` | Dobra “Comodidade” (Plaza) | 1100×825 (4:3) |
| `assets/video/hero-720.mp4` | Vídeo do hero — celular (≤ 768 px / conexão lenta) | 1280×720 |
| `assets/video/hero-1080.mp4` | Vídeo do hero — desktop | 1920×1080 |

> As imagens estão em **WebP** (padrão exigido no PRD) e o `og-capa.jpg` em JPEG,
> formatos aceitos por redes sociais e crawlers. Exporte os arquivos novos nesses
> mesmos formatos — ou ajuste a extensão no `index.html` se preferir JPG/PNG.

| Outros assets | Arquivo | Como trocar |
|---|---|---|
| Overlay de palmeira | `assets/img/palm-frond.svg` | Vetor próprio, reaproveitado em 3 pontos da página |
| Logo (header) | `assets/img/logo-lockup.png` | Troque pelo arquivo oficial mantendo o corte **sem slogan** (proporção ≈ 4,2:1). Altura controlada em `styles.css` → `.brand-logo` |
| Logo (rodapé) | `assets/img/logo-footer.png` | Versão branca aplicada por CSS (`filter:brightness(0) invert(1)`), então qualquer cor da original serve |
| Ícone do site | `assets/img/favicon.png` | 512×512 com transparência; referenciado no `<head>` como `icon` e `apple-touch-icon` |

**Boas práticas já aplicadas:**
- imagens **locais** (sem chamadas a CDN de terceiros — só as fontes Google saem da página);
- `loading="lazy"` e `decoding="async"` em todas as imagens fora da dobra;
- vídeo carregado **depois** do `load` da página (nunca atrasa o LCP), com respeito a
  `prefers-reduced-motion` e modo economia de dados;
- fontes com `preconnect` + `display=swap`.

---

## 5. Performance e SEO

- **Page Speed:** poster do hero com `preload` + `fetchpriority="high"` e corte server-side
  (WebP). Imagens da dobra carregam sob demanda.
- **SEO técnico:** um único `H1`, `H2` por seção, `meta description` focada em
  *"loteamento fechado de luxo no interior"*, Open Graph, Twitter Card, `canonical`,
  `robots.txt`, `sitemap.xml` e **JSON-LD** (`LocalBusiness` + `FAQPage`).
- **Auditoria Lighthouse (local):** Acessibilidade 100 · Boas Práticas 100 · SEO 100.

Checklist antes do ar:
- [ ] `whatsappNumber`, `crmEndpoint` e `gtmId` preenchidos
- [ ] domínio real no `canonical`, Open Graph, `robots.txt` e `sitemap.xml`
- [ ] CRECI, telefone e endereço atualizados no rodapé
- [ ] imagens e vídeo definitivos do empreendimento
- [ ] testar o formulário no celular (máscara de WhatsApp e botão de polegar)
- [ ] conferir as distâncias da seção Localização com a equipe de vendas
- [ ] páginas legais revisadas pelo jurídico — identificação da empresa (razão social/CNPJ) e
      do encarregado foram **omitidas de propósito**: inclua só com autorização de uso dos dados
- [ ] revisar prazos de retenção e foro com o jurídico
- [ ] testar o banner de cookies (aceitar, recarregar, recusar, reabrir pelo rodapé)
- [ ] links do Instagram e Facebook do rodapé conferidos (4 páginas)

# loteamentoqualidadeelazer
