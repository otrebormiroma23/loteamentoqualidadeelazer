# Identidade visual — Santa Bárbara Resort

> Guia de rebranding: **cores e fontes exatas** usadas no site
> (`assets/css/styles.css`, seção `:root` — qualquer alteração ali muda o site inteiro).
>
> **Atualizado em 09/11/2026** com o **kit oficial da marca**
> (`Kit-Loteamento-Qualidade-de-Vida-e-Lazer` — guia `LEIA-ME.txt` + `guia-de-uso-da-marca.pdf`).

---

## 1. Paleta — Verde da marca + Creme + Dourado

| Cor | HEX / valor | Onde é usada |
|---|---|---|
| **Verde da marca 900** *(principal)* | `#0A3622` | Fundos escuros: herói, faixa de números, botões primários, rodapé; também o `theme-color` do navegador |
| Verde 800 | `#14452F` | Títulos/texto sobre claro nos blocos de destaque e caixa de sucesso |
| Verde 700 | `#1C5A3B` | Eyebrows sobre claro, ícones, links de apoio, hover |
| Verde 600 | `#27704B` | Anel de foco (`:focus-visible`), estados de interação |
| **Creme** *(kit)* | `#F3EEDF` | Fundo alternado de seções (descanso visual), campos de formulário |
| **Dourado champagne** *(kit)* | `#CDAE72` | **Acentos de marca**: eyebrow sobre escuro, `em` do H1, label da faixa de números, tags da galeria, bullet dos planos, badge “destaque”, card de endereço |
| **Verde reflexo** *(kit)* | `#5E8C74` | Reservado para o reflexo do símbolo (não usado no CSS) |
| Areia (sand) | `#EFEBE3` | Hover de seletor de idioma, superfícies suaves |
| Branco | `#FFFFFF` | Fundo padrão |
| Tinta (ink) | `#101C17` | Texto corrido |
| Cinza esverdeado (muted) | `#5B6A63` | Texto secundário, legendas, apoio |
| Linha sobre claro | `rgba(10,54,34,.14)` | Divisores e bordas |
| Linha sobre escuro | `rgba(255,255,255,.24)` | Divisores em fundos verdes |
| Erro | `#B3402F` | Mensagens de validação do formulário |
| Sucesso (fundo) | `#EEF5F0` | Caixa “Recebemos os seus dados” |

**Regras de uso**
- Verde escuro ⇒ **fundos** com texto branco (contraste AA/AAA).
- Dourado **só sobre fundos escuros** (sobre branco não passa em contraste AA) — no site, `--gold` aparece em eyebrow/light, H1 em herói, faixa de números, galeria, planos e card de endereço.
- Creme e Areia ⇒ áreas de descanso; nunca texto claro sobre eles.
- Máximo de 2 tons de verde por tela; a profundidade vem de sombra, não de mais cores.

---

## 2. Tipografia

| Papel | Fonte | Pesos usados | Onde |
|---|---|---|---|
| **Display** (títulos) | **Marcellus** *(kit)* | 400 | H1–H2, títulos de card, números da faixa, títulos do FAQ/legais |
| **Marca / caixa alta** | **Cinzel** *(kit)* | 400, 500, 600 | Tudo que é `text-transform:uppercase`: botões, nav, eyebrows, labels de form, tags de galeria, títulos de coluna do rodapé, legendas de lightbox, “Atualizado em”, cabeçalhos de tabela legal |
| **Interface** | **Montserrat** | 300, 400, 500, 600 | Textos mistos de UI: H3, respostas do FAQ, listas de comodidade, seletor de idioma |
| **Corpo** | **Inter** | 300, 400, 500 | Parágrafos, formulários, tabelas |
| **Árabe (RTL)** | **Tajawal** | 400, 500, 700 | Fallback automático para glifos árabes (as fontes acima não têm) |

**Detalhes**
- H1: `clamp(2.4rem, 6vw, 4.3rem)`, entrelinha 1,12.
- Corpo: 17 px / entrelinha 1,7 (no árabe, 1,9).
- Eyebrow: **Cinzel** 12 px, caixa alta, `letter-spacing: .28em` (dourado sobre escuro, verde 700 sobre claro).
- Botões: **Cinzel** caixa alta, `letter-spacing: .09–.14em`.
- `em` no H1: itálico sintético do Marcellus (Marcellus não tem itálico oficial) + cor dourada no herói.
- **Cinzel tem só caixa alta** (minúsculas viram versaletes) — por isso ele só é aplicado em elementos que já usam `text-transform:uppercase`; o kit o define para “Qualidade de Vida”.

**URL oficial das fontes do site** (mesma do `<head>`):

```
https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&family=Marcellus&family=Montserrat:wght@300;400;500;600&family=Tajawal:wght@400;500;700&display=swap
```

> Arquivos TTF originais do kit: `04-fontes/Cinzel/` e `04-fontes/Marcellus/` (licença OFL).

---

## 3. Símbolo e logotipos (arquivos em `assets/img/`)

Kit oficial — versões **cor** (claro) e **negativa** (creme, para fundo verde/foto escura):

| Arquivo | Tamanho | Uso |
|---|---|---|
| `logo-horizontal-cor.svg` | 816×256 | Header (estado sólido) e topo das páginas legais (barra branca) |
| `logo-horizontal-negativa.svg` | 816×256 | Header sobre o herói, menu aberto e **rodapé** (sem filtro CSS — a arte já é creme) |
| `logo-empilhada-negativa.svg` | 609×466 | Versão empilhada para posts/quadrados (reserva) |
| `favicon.svg` | 256×256 | Ícone moderno (`<link rel="icon" type="image/svg+xml">`) |
| `favicon.ico` | raiz | Ícone clássico (`/favicon.ico` direto) |
| `favicon.png` | 512×512 | `apple-touch` legado + `logo` do JSON-LD LocalBusiness (Google) |
| `apple-touch-icon-180.png` | 180×180 | iOS |
| `icone-192.png` | 192×192 | Android/atalhos |

**Comportamento do header** (regras em `styles.css` → `.brand-logo--*`):
- header transparente (herói) e menu aberto ⇒ **negativa** (creme);
- header sólido (rolagem) ⇒ **cor** (verde);
- as duas imagens existem no HTML e se alternam por `display` (sem filtro, sem JS novo).

Arquivos antigos mantidos como reserva: `logo-lockup.png`, `logo-footer.png`, `logo-symbol.png`, `logo-santa-barbara.png`.

---

## 4. Formas e medidas

- **Raio:** 4 px (botões, campos) · 14 px (cartões grandes) · 20 px (pílulas).
- **Container:** 1200 px · gutter `clamp(20px, 5vw, 48px)`.
- **Cabeçalho:** 76 px de altura.
- **Transições:** `cubic-bezier(.22,.61,.36,1)`.

---

*Documento gerado em 07/10/2026 · atualizado em 09/11/2026 com o kit oficial da marca.*
