# Santa Bárbara Resort Residence — Landing Page de Alta Conversão

Website institucional e de vendas do loteamento **Santa Bárbara Resort Residence**.
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
  whatsappNumber: '',   // '5511999999999' → DDI + DDD + número
  whatsappMessage: '',  // mensagem padrão pré-preenchida
  crmEndpoint: '',      // URL da API do CRM (POST JSON)
  crmSource: 'site_santabarbara',
  tourUrl: '',          // URL do Tour Virtual 360º
  phone: '+5511999999999'
};
```

### 2.1 WhatsApp
1. Preencha `whatsappNumber` no formato `55` + DDD + número (ex.: `5511999999999`).
2. Todos os CTAs passam a apontar para `wa.me/<numero>?text=<mensagem>`:
   botão flutuante, botão principal, rodapé, barra mobile e pós-formulário.

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
- `tourUrl` → libera os botões "Tour Virtual 360º" (seção Localização e rodapé).
- O mapa já aponta para a busca `Rod. Castello Branco, km 292` no Google Maps — troque pelo
  link exato do pin (`index.html`, `#mapLink`).
- `phone` → telefone do rodapé.

---

## 3. Estrutura do projeto

```
/
├── index.html              # página única (H1/H2, meta, JSON-LD, seções)
├── assets/
│   ├── css/styles.css      # design system + responsivo (mobile-first)
│   ├── js/main.js          # CONFIG, GTM, CRM, formulário, galeria, tracking
│   └── img/
│       ├── favicon.png          # símbolo da marca (512×512)
│       ├── logo-lockup.png      # logo sem slogan (header)
│       ├── logo-footer.png      # logo com slogan (rodapé)
│       ├── logo-symbol.png      # só o símbolo (redes, selos)
│       ├── logo-santa-barbara.png # original 3508×2480 (fonte para novos cortes)
│       └── palm-frond.svg  # overlay gráfico de folha de palmeira
├── robots.txt
├── sitemap.xml
└── README.md
```

### Seções (arquitetura da informação)
1. **Hero** — vídeo cinematográfico de fundo (palmeiras aéreas, sem som) + formulário flutuante
2. **Indicadores** — 7,4 mi de m² · 100% Aquífero Guarani · 450–2.500 m² · 180x
3. **O Empreendimento** — natureza, aquífero e urbanismo
4. **Mundo de Lazer** — galeria assimétrica (Acqua SPA, Clubes, Ecopista, Minigolfe, Lagos)
5. **Segurança & Comodidade** — Plaza Santa Bárbara em ícones finos
6. **Investimento** — três condições de lote + CTA principal
7. **Localização** — distâncias, mapa, Tour 360º e FAQ (SEO)
8. **Rodapé** — contatos, links institucionais e trust signals

---

## 4. Trocar as imagens e o vídeo (assets provisórios)

Todas as fotos e o vídeo são **provisórios** (banco de imagens gratuito — Pexels/Unsplash),
marcados para substituição pelos materiais reais do empreendimento.

| Uso | Arquivo / seção | Como trocar |
|---|---|---|
| Vídeo do hero | `assets/js/main.js` → `initHeroVideo()` | Substitua as URLs do Pexels pelo seu `.mp4` (recomendado: H.264, 1280×720 para mobile e 1920×1080 para desktop, ≤ 5 MB) ou coloque o arquivo em `assets/video/hero.mp4` e aponte `src` para ele |
| Imagem de capa (poster) | `index.html` → `.hero-poster` | Troque `src`/`srcset` e o `<link rel="preload">` correspondente |
| Fotos das seções | `index.html` → `<img>` de cada bloco | Mantenha `loading="lazy"`, `width`/`height` e `alt` descritivo |
| Overlay de palmeira | `assets/img/palm-frond.svg` | Vetor próprio, reaproveitado em 3 pontos da página |
| Logo (header) | `assets/img/logo-lockup.png` | Troque pelo arquivo oficial mantendo o corte **sem slogan** (proporção ≈ 4,2:1). Altura controlada em `styles.css` → `.brand-logo` |
| Logo (rodapé) | `assets/img/logo-footer.png` | Versão branca aplicada por CSS (`filter:brightness(0) invert(1)`), então qualquer cor da original serve |
| Ícone do site | `assets/img/favicon.png` | 512×512 com transparência; referenciado no `<head>` como `icon` e `apple-touch-icon` |

**Boas práticas já aplicadas:**
- `srcset` + `sizes` (o navegador baixa só o tamanho necessário);
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

# loteamentoqualidadeelazer
