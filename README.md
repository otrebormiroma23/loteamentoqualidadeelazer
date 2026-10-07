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
| `lang_change` | troca de idioma pelo seletor do header | `lang` (`en` \| `fr` \| …) |
| `time_on_page` | 30 s na página (lead qualificado) | `seconds` |

> Para depurar no console: `window.__debugTrack = true`.

#### Meta Pixel (Facebook / Instagram)
1. Pegue o **ID do pixel**: business.facebook.com → *Gerenciador de Eventos* → *Configurações do
   pixel* → copie o *ID do pixel* (formato `123456789012345`).
2. Cole em `metaPixelId` (em `assets/js/main.js`). Vazio = pixel desligado.
3. O pixel é injetado **somente após o aceite de cookies** e dispara:

| Evento Meta | Quando |
|---|---|
| `PageView` | carregamento da página |
| `Contact` | clique em WhatsApp ou telefone (`whatsapp_click`, `phone_click`) |
| `Lead` | envio válido do formulário (`lead_generated`) — **conversão** |
| `ViewContent` | abertura do Tour 360º e da galeria |

4. Nenhum dado pessoal (PII) é enviado ao pixel — só o `content_name: 'Santa Bárbara Resort'`.
5. Se o visitante recusar os cookies depois, `fbq('consent','revoke')` é chamado.
6. Para Google Ads, use o GTM (`gtmId`) e crie lá o evento de conversão.

### 2.3 Integração com a Leadfy (ou CRM genérico)
1. Peça à equipe de suporte da Leadfy o **IDENTIFICADOR** do webhook (hash de 10 caracteres
   da empresa, ou `grp-xxxxxx` para grupo, ou `usr-xxxxxx` para corretor) e cole em `leadfyId`.
   Documentação: `https://leadfy-imob.com.br/ajuda/integracao-via-api`.
2. Com `leadfyId` preenchido, o JS envia `POST` para
   `https://leadfy-imob.com.br/webhooks/criar_lead/<IDENTIFICADOR>/` no formato que a API
   documenta (inclui os aliases `name`/`phone` citados no exemplo dela):

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11988887777",
  "name": "Maria Silva",
  "phone": "11988887777",
  "origem": "site_santabarbara",
  "tag": "site",
  "descricao": "Cadastro pelo site — Santa Bárbara Resort",
  "mensagem": "Solicitação de informações: lotes de 450m² a 2.500m²",
  "observacao": "Página: https://site/ | UTM: {...}"
}
```

3. Alternativa (CRM próprio): preencha `crmEndpoint` — nesse caso o payload é o JSON genérico
   (`nome`, `email`, `whatsapp`, `page`, `utm_*`, `gclid`, `fbclid`, `source`, `timestamp`).
4. Enquanto `leadfyId` e `crmEndpoint` estiverem vazios, o formulário roda em **modo
   demonstração** (só exibe a tela de sucesso e registra `lead_generated`).
5. Se a API falhar (inclusive bloqueio de CORS do navegador), o lead é **automaticamente
   reenviado ao WhatsApp do consultor** com nome, e-mail e telefone — nenhuma oportunidade
   se perde. Se acontecer em produção, avise: dá para contornar via servidor/worker.

### 2.4 Tour 360º, mapa e telefone
- `tourUrl` → endereço do tour. Os botões "Tour Virtual 360º" (seção Localização e rodapé)
  abrem um **modal com iframe** por cima da página; se você esvaziar a variável, o botão volta
  a ser link externo. Tour hospedado em terceiros (`tour.meupasseiovirtual.com`) — se um dia você
  tiver o tour próprio, basta trocar a URL.
- O botão "Abrir no Google Maps" aponta para o link curto do pin exato
  (`https://maps.app.goo.gl/...`, em `index.html`, `#mapLink`).
- `phone` → telefone do rodapé.

### 2.5 Cookies e consentimento (LGPD)
- O aviso de cookies aparece **na primeira visita** (nas 4 páginas). Sem escolha registrada, o GTM
  **não é injetado** e nenhum pixel roda — só o estritamente necessário ao site.
- Ao aceitar: `gtag('consent','update', granted)` é enviado (Consent Mode v2) e o GTM carrega.
  Ao recusar: nada de terceiros é carregado.
- A escolha fica em `localStorage` na chave `sb_cookie_consent` (`granted` / `denied`) e pode
  ser reaberta pelo link **“Preferências de cookies”** do rodapé (`#cookiePrefs`).
- No GTM, configure os triggers assumindo **Consent Mode**: `ad_storage`,
  `ad_user_data`, `ad_personalization` e `analytics_storage`.
- O **tradutor do site** também é terceiro: sem aceite, escolher um idioma reabre o aviso com a
  linha “Para usar o tradutor automático do site, é preciso aceitar os cookies.” — e o idioma
  escolhido é aplicado assim que o visitante aceitar.

### 2.6 Idiomas (seletor em todas as páginas)
- Botão com gloco + sigla (`PT`) ao lado do CTA do header do `index.html` e no topo das
  páginas legais (`.legal-top`). Idiomas disponíveis:
  **Português (origem), English, Español, Français, Italiano, Deutsch, 日本語, 中文, 한국어,
  Русский, Nederlands**.
- O tradutor usa o **motor do Google Translate** (`translate.googleapis.com`, `client=gtx`),
  porém sem o widget/banner do Google — o layout continua 100% nosso, sem barra do Google e
  sem deslocamento de página. *(O widget oficial `TranslateElement` foi testado e ficou travado
  em “Tradução em andamento (0%)” também em página isolada.)*
- Funcionamento:
  - coleta automática de nós de texto + atributos (`alt`, `placeholder`, `aria-label`, `title`)
    + `<title>` + `meta description` — números, telefone e código ficam de fora;
  - busca em blocos de até 10 textos, 3 blocos em paralelo (primeira troca ~5–15 s, com
    spinner no botão; as trocas seguintes são instantâneas a partir do cache);
  - cache por idioma em `localStorage` (`sb_tr_<idioma>`, ~14 KB por idioma) e idioma salvo em
    `sb_lang`; volta ao português restaura o texto original **byte a byte**;
  - validação do formulário (`setError`) e o “Enviando…” também são traduzidos via `tr()`.
- Idioma gerado por JS (mensagens, rótulos ARIA) segue a mesma cache — WhatsApp do consultor
  permanece em português (é a equipe que atende).
- **Inglês australiano não existe no Google Translate** (há um único “English”); se quiser uma
  variante en-AU com grafia australiana, dá para criar um dicionário próprio depois.
- Evento no `dataLayer`: `lang_change` com `{ lang }`.

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
│   │   ├── hero-720.mp4        # vídeo do hero — versão mobile (22,5 MB)
│   │   └── hero-1080.mp4       # vídeo do hero — versão desktop (22,5 MB)
│   └── img/
│       ├── favicon.png          # símbolo da marca (512×512)
│       ├── logo-lockup.png      # logo sem slogan (header)
│       ├── logo-footer.png      # logo com slogan (rodapé)
│       ├── logo-symbol.png      # só o símbolo (redes, selos)
│       ├── logo-santa-barbara.png # original 3508×2480 (fonte para novos cortes)
│       ├── palm-frond.svg       # overlay gráfico de folha de palmeira
│       └── fotos/               # TODAS as fotos do site (troque mantendo o nome)
│           ├── hero-poster.jpg  # capa do hero (1440×1440)
│           ├── og-capa.jpg      # imagem de compartilhamento (1440×1440)
│           ├── floresta.jpg     # O Empreendimento (1080×540)
│           ├── acqua-spa.jpg    # Galeria — Acqua SPA (1440×1440)
│           ├── clube.jpg        # Galeria — Clubes (1440×1440)
│           ├── ecopista.jpg     # Galeria — Ecopista (1440×1440)
│           ├── minigolfe.jpg    # Galeria — Minigolfe (1440×1440)
│           ├── lagos.jpg        # Galeria — Lagos (1000×749)
│           └── plaza.jpg        # Comodidade / Plaza (1440×1440)
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
| `assets/img/fotos/hero-poster.jpg` | Fundo do hero (também no `<link rel="preload">`) | 1440×1440 (1:1) |
| `assets/img/fotos/og-capa.jpg` | `og:image`, `twitter:image` e JSON-LD | 1440×1440 (ideal: 1200×630) |
| `assets/img/fotos/floresta.jpg` | Dobra “O Empreendimento” | 1080×540 (2:1) |
| `assets/img/fotos/acqua-spa.jpg` | Galeria — Acqua SPA | 1440×1440 (1:1) |
| `assets/img/fotos/clube.jpg` | Galeria — Clubes | 1440×1440 (1:1) |
| `assets/img/fotos/ecopista.jpg` | Galeria — Ecopista | 1440×1440 (1:1) |
| `assets/img/fotos/minigolfe.jpg` | Galeria — Minigolfe | 1440×1440 (1:1) |
| `assets/img/fotos/lagos.jpg` | Galeria — Lagos | 1000×749 (~4:3) |
| `assets/img/fotos/plaza.jpg` | Dobra “Comodidade” (Plaza) | 1440×1440 (1:1) |
| `assets/video/hero-720.mp4` | Vídeo do hero — celular (≤ 768 px / conexão lenta) | 1920×1080 (22,5 MB) |
| `assets/video/hero-1080.mp4` | Vídeo do hero — desktop | 1920×1080 (22,5 MB) |

> As fotos estão em **JPEG** e o layout recorta sozinho via `object-fit: cover`,
> então qualquer proporção funciona — mas quanto mais próxima da caixa, melhor.
> Para `og:image` o recomendado é **1200×630** (hoje é 1440×1440).
> **Atenção:** `hero-720.mp4` e `hero-1080.mp4` estão **idênticos** (1920×1080,
> 22,5 MB cada) — o ideal é gerar uma versão leve de ~720p (~3 MB) para o celular,
> que é quem mais sofre com arquivo pesado.

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
  (JPEG 1440 px, recortado por CSS com `object-fit: cover`). Imagens da dobra carregam
  sob demanda (`loading="lazy"`).
- **SEO técnico:** um único `H1`, `H2` por seção, `meta description` focada em
  *"loteamento fechado de luxo no interior"*, Open Graph, Twitter Card, `canonical`,
  `robots.txt`, `sitemap.xml` e **JSON-LD** (`LocalBusiness` + `FAQPage`).
- **Auditoria Lighthouse (local):** Acessibilidade 100 · Boas Práticas 100 · SEO 100.

Checklist antes do ar:
- [x] `whatsappNumber` preenchido (5511918708781)
- [x] **`metaPixelId`** preenchido (1128316885943842)
- [ ] `gtmId` preenchido
- [ ] **`leadfyId`** (IDENTIFICADOR enviado pela suporte da Leadfy) ou `crmEndpoint` preenchido
- [ ] testar o formulário de ponta a ponta e confirmar o lead chegando no painel da Leadfy
- [ ] domínio real no `canonical`, Open Graph, `robots.txt` e `sitemap.xml`
- [ ] CRECI, telefone e endereço atualizados no rodapé
- [ ] imagens e vídeo definitivos do empreendimento
- [ ] testar o formulário no celular (máscara de WhatsApp e botão de polegar)
- [ ] conferir as distâncias da seção Localização com a equipe de vendas
- [ ] páginas legais revisadas pelo jurídico — identificação da empresa (razão social/CNPJ) e
      do encarregado foram **omitidas de propósito**: inclua só com autorização de uso dos dados
- [ ] revisar prazos de retenção e foro com o jurídico
- [ ] testar o banner de cookies (aceitar, recarregar, recusar, reabrir pelo rodapé)
- [ ] trocar de idioma com e sem cookies aceitos (deve pedir consentimento primeiro)
- [ ] links do Instagram e Facebook do rodapé conferidos (4 páginas)

---

## 6. Publicar na HostGator

O site é **100% estático** (HTML/CSS/JS, sem build) — roda no plano compartilhado
mais simples da HostGator.

### 6.1 Pacote de upload
ZIP com `.htaccess` + `index.html` + as 3 páginas legais + `robots.txt` +
`sitemap.xml` + pasta `assets/` (**26 arquivos, ~46,6 MB**). Sem `.git` e sem `README`.

```powershell
# gerar/atualizar o ZIP (PowerShell, na raiz do projeto)
$zip = "$env:LOCALAPPDATA\Temp\opencode\site-hostgator.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
$files = @('.htaccess','index.html','lgpd.html','politica-de-privacidade.html',
           'termos-de-uso.html','robots.txt','sitemap.xml')
$files += (Get-ChildItem -Recurse -File assets).FullName
Compress-Archive -Path $files -DestinationPath $zip -CompressionLevel Optimal
```

### 6.2 Upload (cPanel → File Manager)
1. **cPanel → Gerenciador de Arquivos** → entre em `public_html` (domínio principal)
   ou `public_html/seudominio.com.br` (domínio adicional/adon)
2. **Configurações → Mostrar arquivos ocultos** (para ver o `.htaccess`) → Save
3. Apague o que a HostGator deixou: `default.html`, `cgi-bin/`, `index2.html`
4. **Enviar → Enviar arquivo** → escolha o ZIP → Upload → feche a aba
5. Selecione o ZIP → **Extrair** → OK → delete o ZIP

### 6.3 HTTPS
- cPanel → **SSL/TLS → Emitir certificado** (ou “AutoSSL”) → Let's Encrypt → Emitir
- Ative o redirecionamento automático para HTTPS (o `.htaccess` também força)

### 6.4 `.htaccess` (criado na raiz)
- força HTTPS, `DirectoryIndex index.html`, `Options -Indexes`
- gzip (mod_deflate), cache de 6 meses para imagens/vídeo, 0 para HTML
- cabeçalhos `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- **regras de www/sem www comentadas** — descomente UMA depois do domínio estar no ar

### 6.5 Depois do primeiro upload
- [ ] abrir `https://SEUDOMINIO/` e conferir fotos, vídeo, formulário e WhatsApp
- [ ] descomentar no `.htaccess` a regra de **www** ou **sem www** (escolher só uma)
- [ ] trocar o domínio placeholder (`santabarbararesort.com.br`) em `canonical`,
      `og:url`, `og:image`, JSON-LD, `robots.txt` e `sitemap.xml`
- [ ] Google Search Console → adicionar site → enviar `sitemap.xml`
- [ ] conferir Meta Pixel e GTM no navegador (depois de aceitar cookies)
- [ ] testar o formulário no celular (lead chegando na Leadfy)

**Atualizações futuras:** repita só o passo 6.2 com os arquivos alterados
(normalmente só `index.html` ou `assets/`).

# loteamentoqualidadeelazer
