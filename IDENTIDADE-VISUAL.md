# Identidade visual — Santa Bárbara Resort

> Guia de rebranding: **cores e fontes exatas** usadas no site
> (`assets/css/styles.css`, seção `:root` — qualquer alteração ali muda o site inteiro).

---

## 1. Paleta — Verde Imperial + Off-White

| Cor | HEX / valor | Onde é usada |
|---|---|---|
| **Verde Imperial 900** *(principal)* | `#0A3622` | Fundos escuros: herói, faixa de números, botões primários, rodapé; também o `theme-color` do navegador |
| Verde Imperial 800 | `#14452F` | Títulos/texto sobre claro nos blocos de destaque e caixa de sucesso |
| Verde 700 | `#1C5A3B` | Eyebrows, ícones, links de apoio, hover |
| Verde 600 | `#27704B` | Anel de foco (`:focus-visible`), estados de interação |
| Off-White Cream | `#F7F5F1` | Fundo alternado de seções (descanso visual) |
| Areia (sand) | `#EFEBE3` | Campos de formulário, cartões suaves |
| Branco | `#FFFFFF` | Fundo padrão |
| Tinta (ink) | `#101C17` | Texto corrido |
| Cinza esverdeado (muted) | `#5B6A63` | Texto secundário, legendas, apoio |
| Linha sobre claro | `rgba(10,54,34,.14)` | Divisores e bordas |
| Linha sobre escuro | `rgba(255,255,255,.24)` | Divisores em fundos verdes |
| Erro | `#B3402F` | Mensagens de validação do formulário |
| Sucesso (fundo) | `#EEF5F0` | Caixa “Recebemos os seus dados” |
| Sombra suave | `0 2px 14px rgba(10,54,34,.07)` | Cartões |
| Sombra forte | `0 18px 50px -20px rgba(10,54,34,.35)` | Menus e elementos flutuantes |

**Regras de uso**
- Verde escuro ⇒ **fundos** com texto branco (contraste AA/AAA).
- Off-White e Areia ⇒ áreas de descanso; nunca texto claro sobre eles.
- Máximo de 2 tons de verde por tela; a profundidade vem de sombra, não de mais cores.

---

## 2. Tipografia

| Papel | Fonte | Pesos usados | Onde |
|---|---|---|---|
| **Display** (títulos) | **Playfair Display** | 400, 500, 600 + itálico 400 | H1–H2, números grandes, títulos editoriais |
| **Interface** | **Montserrat** | 300, 400, 500, 600 | Botões, eyebrows, labels, menu (caixa alta + tracking) |
| **Corpo** | **Inter** | 300, 400, 500 | Parágrafos, formulários, tabelas |
| **Árabe (RTL)** | **Tajawal** | 400, 500, 700 | Fallback automático para glifos árabes (as 3 fontes acima não têm) |

**Detalhes**
- H1: `clamp(2.4rem, 6vw, 4.3rem)`, entrelinha 1,12.
- Corpo: 17 px / entrelinha 1,7 (no árabe, 1,9).
- Eyebrow: Montserrat 12 px, caixa alta, `letter-spacing: .28em`.
- Botões: Montserrat caixa alta, `letter-spacing: .09–.14em`.

**URL oficial das fontes do site** (mesma do `<head>`):

```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Tajawal:wght@400;500;700&display=swap
```

---

## 3. Símbolo e logotipos (arquivos em `assets/img/`)

| Arquivo | Tamanho | Uso |
|---|---|---|
| `logo-symbol.png` | 280×320, transparente | **Símbolo**: palmeira em moldura quadrada (fonte para novos cortes e favicon) |
| `logo-lockup.png` | 720×170 | Header: símbolo + “Loteamento Qualidade de Vida e Lazer” |
| `logo-footer.png` | 840×234 | Rodapé (com slogan) |
| `favicon.png` | 512×512 | Ícone do site/navegador/Google: palmeira **verde sobre branco** (visível em qualquer fundo) |
| `favicon.ico` | raiz | Ícone para quem pede `/favicon.ico` direto |
| `logo-santa-barbara.png` | 3508×2480 | Original em alta (fonte para novos formatos) |

---

## 4. Formas e medidas

- **Raio:** 4 px (botões, campos) · 14 px (cartões grandes) · 20 px (pílulas).
- **Container:** 1200 px · gutter `clamp(20px, 5vw, 48px)`.
- **Cabeçalho:** 76 px de altura.
- **Transições:** `cubic-bezier(.22,.61,.36,1)`.

---

*Documento gerado em 07/10/2026 · valores extraídos diretamente do CSS do site.*
