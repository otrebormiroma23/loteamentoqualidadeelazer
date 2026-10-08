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
  gtmId: 'GTM-KPPPTLXH', // Google Tag Manager (só carrega após aceite de cookies)
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
1. `gtmId` = **`GTM-KPPPTLXH`** (container verificado em 07/10/2026 — `gtm.js` responde 200).
   O snippet é injetado pelo JS **somente após o aceite de cookies** — nada é colado no HTML.
2. ⚠️ **O container contém um tag do Meta Pixel duplicado** (o mesmo `1128316885943842` do
   `CONFIG.metaPixelId`), o que gera o aviso *"Duplicate Pixel ID"* no console e PageView
   em dobro. **Desative-o no GTM:** Tags → tag do Meta/Facebook → ⋮ → Desativar (ou Excluir)
   → **Enviar → Publicar**. O pixel oficial é o do `main.js` (consent-gated, com eventos
   `Lead`/`Contact`/`ViewContent`).
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

   > **Valor em uso:** `grp-f654pt-cap-kabl4y` — recuperado do código-fonte do site antigo
   > (formulário do WordPress enviava para `grupo-f654pt-cap-kabl4y@leadfy-app.com.br`;
   > verificado em `wp_..._2026-10-07_02-14-51.tar.gz` → `softsql.sql`). O formato do e-mail é
   > idêntico ao da API (`grp-<6>-cap-<6>`, onde `cap` = impulsionador). Atenção: o webhook
   > responde **HTTP 200 para qualquer identificador** (testado), então a prova real é ver o
   > lead de teste chegando no painel da Leadfy.
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
  "origem": "Site",
  "tag": "site",
  "descricao": "Loteamento Qualidade de Vida e Lazer - Página Roberto",
  "mensagem": "",
  "observacao": ""
}
```

> `mensagem` e `observacao` ficam **vazias a pedido do cliente** — nada de
> "Solicitação de informações: ..." nem de "Página: <url>" no painel. A API aceita
> `''` (testado: HTTP 200). ⚠️ Se um dia aparecer erro 500 na API, quase sempre é
> encoding de acento no teste manual (o PowerShell manda Latin1): envie os bytes em
> UTF-8 com `Content-Type: application/json; charset=utf-8`. O navegador envia
> UTF-8 naturalmente.

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
- O **tradutor do site funciona sem precisar de aceite de cookies**: os pacotes de idioma
  (`assets/js/tr/`) são recurso do próprio domínio, não de terceiro. Só o **fallback** usa o
  Google Translate (terceiro) — e ele, sem aceite, reabre o aviso com a linha “Para usar o
  tradutor automático do site, é preciso aceitar os cookies.”, aplicando o idioma escolhido
  assim que o visitante aceitar.

### 2.6 Idiomas (seletor em todas as páginas)
- Botão com gloco + sigla (`PT`) ao lado do CTA do header do `index.html` e no topo das
  páginas legais (`.legal-top`). Idiomas disponíveis:
  **Português (origem), English, Español, Français, Italiano, Deutsch, 日本語, 中文, 한국어,
  Русский, Nederlands, العربية (árabe — site em RTL)**.
- **Tradução embutida no site**: cada idioma tem um pacote JSON em `assets/js/tr/<idioma>.json`
  (11 pacotes × 177 textos, ~166 kB no total), gerado com o motor do Google Translate mas
  servido **do próprio domínio** — a troca fica instantânea (~0,2–0,9 s), não depende do Google
  na hora do uso (evita throttling em IP de celular), não desloca a página e funciona **antes**
  de aceitar os cookies. Sem widget/banner do Google — o layout continua 100% nosso.
  *(O widget oficial `TranslateElement` foi testado e ficou travado em “Tradução em andamento
  (0%)” também em página isolada.)*
- Funcionamento:
  - coleta automática de nós de texto + atributos (`alt`, `placeholder`, `aria-label`, `title`)
    + `<title>` + `meta description` — números, telefone e código ficam de fora;
  - ao **abrir o menu de idiomas** pela 1ª vez os 11 pacotes são pré-aquecidos no cache do
    navegador (fetch silencioso, ~148 kB);
  - a troca carrega o pacote local e aplica; textos que não existam no pacote (ex.: texto novo
    no HTML) são completados pelo **Google Translate em tempo real** (`translate.googleapis.com`,
    `client=gtx`, blocos de até 10 textos em paralelo) — **só com consentimento** de cookies;
  - cache por idioma em `localStorage` (`sb_tr_<idioma>`, ~14 KB por idioma) e idioma salvo em
    `sb_lang`; volta ao português restaura o texto original **byte a byte**;
  - validação do formulário (`setError`) e o “Enviando…” também são traduzidos via `tr()`;
  - no **árabe** (`ar`) o documento vira `dir="rtl"`: alinhamentos espelhados, entrelinha maior
    e a fonte **Tajawal** na pilha tipográfica (Inter/Montserrat/Playfair não têm glifos árabes);
  - **regenerar pacotes**: depois de alterar textos em português, me avise — o JSON é regenerado
    a partir da página (enquanto isso, o fallback do Google cobre o texto novo no visitante).
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
│   │   ├── hero-720.mp4        # vídeo do hero — versão mobile (720p, 1,4 MB)
│   │   └── hero-1080.mp4       # vídeo do hero — versão desktop (1080p, 3,3 MB)
│   └── img/
│       ├── favicon.png          # símbolo da marca (512×512, palmeira verde sobre branco)
│       ├── logo-lockup.png      # logo sem slogan (header)
│       ├── logo-footer.png      # logo com slogan (rodapé)
│       ├── logo-symbol.png      # só o símbolo (redes, selos)
│       ├── logo-santa-barbara.png # original 3508×2480 (fonte para novos cortes)
│       ├── palm-frond.svg       # overlay gráfico de folha de palmeira
│       └── fotos/               # TODAS as fotos do site (troque mantendo o nome)
│           ├── hero-poster.jpg  # capa do hero (1440×1440)
│           ├── og-capa.jpg      # imagem de compartilhamento (1200×630)
│           ├── floresta.jpg     # O Empreendimento (1080×540)
│           ├── acqua-spa.jpg    # Galeria — Acqua SPA (1440×1440)
│           ├── clube.jpg        # Galeria — Clubes (1440×1440)
│           ├── ecopista.jpg     # Galeria — Ecopista (1440×1440)
│           ├── minigolfe.jpg    # Galeria — Minigolfe (1440×1440)
│           ├── lagos.jpg        # Galeria — Lagos (1000×749)
│           └── plaza.jpg        # Comodidade / Plaza (1440×1440)
├── favicon.ico            # ícone para quem pede /favicon.ico direto
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

**Âncoras amigáveis da URL:** `#home` (topo), `#empreendimento`, `#lazer`, `#comodidade`,
`#lotes`, `#localizacao`, `#numeros` (indicadores) e `#formulario` (formulário do herói).
Os nomes antigos (`#topo`, `#form-hero`, `#indicadores`) continuam funcionando: o `main.js`
redireciona (`migrarAncorasAntigas`). O `#` é o marcador de âncora e permanece na URL.

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
| `assets/img/fotos/og-capa.jpg` | `og:image`, `twitter:image` e JSON-LD | 1200×630 (5:2,33 — padrão Open Graph) |
| `assets/img/fotos/floresta.jpg` | Dobra “O Empreendimento” | 1080×540 (2:1) |
| `assets/img/fotos/acqua-spa.jpg` | Galeria — Acqua SPA | 1440×1440 (1:1) |
| `assets/img/fotos/clube.jpg` | Galeria — Clubes | 1440×1440 (1:1) |
| `assets/img/fotos/ecopista.jpg` | Galeria — Ecopista | 1440×1440 (1:1) |
| `assets/img/fotos/minigolfe.jpg` | Galeria — Minigolfe | 1440×1440 (1:1) |
| `assets/img/fotos/lagos.jpg` | Galeria — Lagos | 1000×749 (~4:3) |
| `assets/img/fotos/plaza.jpg` | Dobra “Comodidade” (Plaza) | 1440×1440 (1:1) |
| `assets/video/hero-720.mp4` | Vídeo do hero — celular (≤ 768 px / conexão lenta) | 1280×720 (1,4 MB) |
| `assets/video/hero-1080.mp4` | Vídeo do hero — desktop | 1920×1080 (3,3 MB) |

> As fotos estão em **JPEG** e o layout recorta sozinho via `object-fit: cover`,
> então qualquer proporção funciona — mas quanto mais próxima da caixa, melhor.
> Para `og:image` o recomendado é **1200×630** (é o tamanho aplicado).
> **Vídeo:** as duas versões foram transcodificadas (ffmpeg, H.264 CRF 23, ~8 s,
> **sem áudio** — o hero toca mudo): `hero-720.mp4` 1280×720 (1,4 MB) e
> `hero-1080.mp4` 1920×1080 (3,3 MB). Para um clipe novo, gere as duas versões
> assim (mantendo ~8 s e `faststart`), ex.:
> `ffmpeg -i entrada.mp4 -vf scale=-2:720 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -an -movflags +faststart hero-720.mp4`

| Outros assets | Arquivo | Como trocar |
|---|---|---|
| Overlay de palmeira | `assets/img/palm-frond.svg` | Vetor próprio, reaproveitado em 3 pontos da página |
| Logo (header) | `assets/img/logo-lockup.png` | Troque pelo arquivo oficial mantendo o corte **sem slogan** (proporção ≈ 4,2:1). Altura controlada em `styles.css` → `.brand-logo` |
| Logo (rodapé) | `assets/img/logo-footer.png` | Versão branca aplicada por CSS (`filter:brightness(0) invert(1)`), então qualquer cor da original serve |
| Ícone do site | `assets/img/favicon.png` + `favicon.ico` (raiz) | 512×512, palmeira verde sobre branco (visível em fundo claro e escuro); `<head>` com `?v=` para o CF não servir versão velha |

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
- [x] **`gtmId`** preenchido (`GTM-KPPPTLXH`, container verificado em 07/10/2026)
- [x] **`leadfyId`** preenchido — `grp-f654pt-cap-kabl4y`, **extraído do código-fonte do site
      antigo** (o formulário do WordPress enviava para `grupo-f654pt-cap-kabl4y@leadfy-app.com.br`,
      em `wp_..._2026-10-07_02-14-51.tar.gz` → `softsql.sql`; formato idêntico ao documentado em
      `https://leadfy-imob.com.br/ajuda/integracao-via-api`, seção "Defina o IDENTIFICADOR")
- [x] testar o formulário de ponta a ponta (local): CORS preflight 200 +
      `POST /webhooks/criar_lead/grp-f654pt-cap-kabl4y/` → **HTTP 200**, mensagem de sucesso na tela
- [x] confirmar os leads no **painel da Leadfy** (07/10/2026): `TESTE debug producao 0710`
      (enviado pelo formulário do site na produção) e `TESTE webhook site 0710` (mesmo endpoint,
      direto) **chegaram**; os controles com id inválido/antigo **não** apareceram → integração OK
- [x] domínio real (`https://loteamentoqualidadeelazer.com.br/`) no `canonical`, Open Graph,
      JSON-LD, `robots.txt` e `sitemap.xml`
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
ZIP com `.htaccess` + `favicon.ico` + `index.html` + as 3 páginas legais + `robots.txt` +
`sitemap.xml` + pasta `assets/` com os pacotes de idioma (**38 arquivos, ~8,5 MB**).
Sem `.git` e sem `README`.

```powershell
# gerar/atualizar o ZIP (PowerShell, na raiz do projeto)
$zip = "$env:LOCALAPPDATA\Temp\opencode\site-hostgator.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
$files = @('.htaccess','favicon.ico','index.html','lgpd.html','politica-de-privacidade.html',
           'termos-de-uso.html','robots.txt','sitemap.xml')
$files += (Get-ChildItem -Recurse -File assets).FullName
Compress-Archive -Path $files -DestinationPath $zip -CompressionLevel Optimal
```

### 6.2 Upload (cPanel → File Manager)
> **Atenção — descubra a pasta certa antes de subir:** o arquivo do site não fica
> sempre em `public_html`. Nesta conta, o domínio `loteamentoqualidadeelazer.com.br`
> usa a pasta **`public_html/loteamentoqualidadeelazer/`** (pasta criada pela HostGator
> ao cadastrar o domínio). Confira em cPanel → **Domains** → coluna *Document Root*.

1. **cPanel → Gerenciador de Arquivos** → entre na pasta documentada acima
   (domínio principal → `public_html`; domínio adicional → `public_html/<dominio>`)
2. **Configurações → Mostrar arquivos ocultos** (para ver o `.htaccess`) → Save
3. Apague o que a HostGator deixou: `default.html`, `cgi-bin/`, `index2.html`
4. **Enviar → Enviar arquivo** → escolha o ZIP → Upload → feche a aba
5. Selecione o ZIP → **Extrair** → OK → delete o ZIP

### 6.2.1 Substituindo o site WordPress que já está no domínio
O domínio `loteamentoqualidadeelazer.com.br` já publica um **WordPress antigo**.
Procedimento seguro (não afeta caixas de e-mail do domínio):

1. **Backup completo**
   - File Manager → `public_html` → selecione tudo → **Comprimir (ZIP)** →
     renomeie para `backup-site-antigo.zip` → **Baixar** para o seu computador
   - (Opcional, para não perder o conteúdo) cPanel → **phpMyAdmin** → banco do
     WordPress → **Exportar** → SQL → Baixar
2. **Tirar o WordPress do caminho:** cPanel → File Manager → entre na **pasta inicial
   (Home)**, crie `backup-site-antigo/` (fora do `public_html`) e **Mover** para lá
   todo o conteúdo de `public_html` (`wp-admin`, `wp-content`, `wp-config.php`,
   `.htaccess` do WP, `index.php` etc.)
3. **Publicar o novo site:** siga o passo 6.2 (upload + extrair o ZIP na `public_html`)
4. SSL → AutoSSL → conferir se o cadeado continua verde

> Os endereços antigos (`/wp-admin`, páginas do WordPress) deixam de existir —
> se houver SEO a preservar, dá para criar redireções 301 depois.

### 6.3 HTTPS
- O DNS do domínio está no **Cloudflare** (`shane/hadlee.ns.cloudflare.com`) — por isso
  o HTTPS já funciona e renova sozinho (certificado Google Trust Services, via Cloudflare)
- ⚠️ A tela **cPanel → SSL/TLS → “Issue a certificate”** mostra *“DNS-based DCV failed”*:
  é normal, o cPanel não consegue gravar TXT no DNS do Cloudflare. **Não emitir nada lá**
- ⚠️ Se aparecer erro roxo do Cloudflare (522/526), confira em **Cloudflare → DNS →
  Records** que o registro A de origem aponta para o IP do servidor HostGator
  (cPanel → *Server IP*)

### 6.4 `.htaccess` (criado na raiz)
- força HTTPS, `DirectoryIndex index.html`, `Options -Indexes`
- gzip (mod_deflate), cache de 6 meses para imagens/vídeo, 0 para HTML
- cabeçalhos `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- **regras de domínio ativas:** força `https://` e **`www.` → sem `www`**
  (oficial: `loteamentoqualidadeelazer.com.br`); a variante “com `www`” fica
  comentada no próprio arquivo, caso queira inverter

### 6.4.1 Cache do Cloudflare e versionamento de CSS/JS
- O CSS/JS é cacheado **1 mês no navegador** + **no bordo do Cloudflare**
  (`cf-cache-status: HIT`) — ou seja, subir um arquivo novo **não** basta: os
  visitantes continuam vendo a versão antiga até o cache expirar (ou até alguém
  fazer *Purge Everything* no CF, o que exige login)
- **Duas proteções contra cache velho:**
  1. **cache-busting por query string** — as 4 páginas HTML referenciam
     `assets/css/styles.css?v=20261007e` e `assets/js/main.js?v=20261007e`;
     como o HTML **não** é cacheado (`cf-cache-status: DYNAMIC`, `max-age=0`),
     cada upload de HTML entrega as URLs novas → CF busca os arquivos no origin;
  2. **`.htaccess` manda `Cloudflare-CDN-Cache-Control: no-cache`** para
     `.css/.js/.json` — o bordo do CF deixa de guardar esses arquivos (no
     navegador continua valendo o cache de 1 mês). *Esta regra nasceu de um
     incidente real: em 07/10 o HTML subiu antes do JS, o CF congelou o JS
     antigo na URL nova e serviu código desatualizado por 30 dias.*
- ⚠️ **Ordem de upload:** suba **assets (CSS/JS/pastas) primeiro e HTML por último**
  — se o HTML chegar primeiro, o CF pode buscar o asset ainda antigo e guardá-lo
  sob a URL nova.
- ⚠️ **Ao alterar `styles.css` ou `main.js`: aumente a `?v=` nas 4 páginas**
  (`index.html`, `lgpd.html`, `politica-de-privacidade.html`, `termos-de-uso.html`)
  e suba os 4 HTMLs junto com o arquivo alterado — formato `?v=AAAAMMDD` (+ letra
  se houver mais de uma mudança no mesmo dia; versão atual: `20261007e`)
- Conferência rápida: abrir
  `https://loteamentoqualidadeelazer.com.br/assets/js/main.js?v=20261007e`
  e procurar o marcador da última alteração

### 6.5 Status pós-publicação
- [x] **PUBLICADO em 07/10/2026** — https://loteamentoqualidadeelazer.com.br/
      (arquivos em `public_html/loteamentoqualidadeelazer/`; WordPress antigo removido)
- [x] conferido no ar: home + 3 páginas legais + `robots.txt` + `sitemap.xml`,
      10/10 fotos, vídeo do hero, gzip/cache/headers do `.htaccess`
- [x] redirecionamentos `http → https` e `www → sem www` (301) funcionando
- [x] domínio aplicado em todas as URLs (`canonical`, `og:url`, `og:image`, JSON-LD,
      `robots.txt`, `sitemap.xml`) — `https://loteamentoqualidadeelazer.com.br/`
- [x] Meta Pixel no ar (`signals/config/1128316885943842`), só após consentimento
- [x] idiomas no ar (12 opções, incl. árabe; pacotes locais `assets/js/tr/*.json` — troca instantânea,
      sem depender do Google e sem exigir consentimento; EN → PT restaura o texto original)
- [x] Lighthouse no ar: Acessibilidade 100 · Boas Práticas 100 · SEO 100 (0 falhas)
- [x] **backup do site antigo localizado** no Downloads antes da substituição:
      `well-known.zip` (arquivos do WordPress, 16.606 entradas) e
      `wp_loteamentoqualidadeelazer.com.br_2026-10-07_02-14-51.tar.gz` (arquivos + banco `softsql.sql`)
- [x] Google Search Console → **100% (07/10/2026)**: propriedade verificada por Tag HTML
      (`google-site-verification` nas 4 páginas), `sitemap.xml` enviado e **Processado —
      4 páginas**, recrawl da home solicitado (renova favicon/título/OG no Google)
- [x] **`gtmId`** preenchido (`GTM-KPPPTLXH`) — tags redundantes de Meta removidas no GTM
      (o pixel oficial é o do `main.js`, consent-gated)
- [x] **`leadfyId`** preenchido (`grp-f654pt-cap-kabl4y`) + ponta a ponta confirmada no
      **painel da Leadfy** (07/10/2026): lead do formulário e do webhook chegaram
- [ ] teste em celular real (menu de idioma, formulário, vídeo)

**Atualizações futuras:** repita o passo 6.2 enviando os arquivos alterados
(normalmente só `index.html`, `assets/` ou `.htaccess`) para a pasta document root
do domínio — `public_html/loteamentoqualidadeelazer/` nesta conta.

# loteamentoqualidadeelazer
