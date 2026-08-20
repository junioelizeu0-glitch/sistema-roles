# 🍷 Nossos Rolês — Sistema de Gestão de Lugares & Orçamento a Dois 👩‍❤️‍👨

Aplicação web moderna desenvolvida para casais organizarem lugares que desejam conhecer (restaurantes, pizzarias, hamburguerias, passeios), controlarem o orçamento mensal e registrarem fotos, notas e avaliações após cada visita.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## ✨ Funcionalidades

- **👩‍❤️‍👨 Gestão de Lugares a Dois**: Cadastre restaurantes, cafés e passeios com categoria, região e qualificação (faixa de preço sugerido).
- **💰 Orçamento Mensal**: Defina o limite de gastos para rolês no mês e acompanhe o saldo restante em tempo real.
- **📸 Anexo de Foto da Visita**: Tire foto da refeição/experiência diretamente pelo celular ou galeria ao marcar a ida.
- **🚗 Navegação Direta via Waze**: Botão *"Abrir no Waze 🚗"* em 1 clique em todos os cartões e detalhes do lugar.
- **🔍 Busca por CEP (ViaCEP)**: Preenchimento automático do endereço ao informar o CEP no cadastro do lugar.
- **🏷️ Gerenciador Dinâmico**: Adicione e exclua categorias, regiões e edite as qualificações de preços diretamente na tela de Ajustes.
- **📱 100% Responsivo**: Interface limpa baseada no design *Financy Light Mode*, perfeita em telas grandes ou celulares.
- **☁️ Supabase & LocalStorage**: Persistência híbrida em banco de dados Supabase com fallback offline no LocalStorage.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend / Database**: PostgreSQL (Supabase) com Row Level Security (RLS) e Triggers automáticos.
- **APIs**: ViaCEP (Busca de Endereços) & Waze Deep Linking.

---

## 🚀 Como Rodar Localmente

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/SEU_USUARIO/sistema-roles.git
   cd sistema-roles
   ```

2. **Instalar dependências**:
   ```bash
   bun install
   # ou npm install
   ```

3. **Rodar em ambiente de desenvolvimento**:
   ```bash
   bun run dev
   # ou npm run dev
   ```
   Acesse no navegador: `http://localhost:5173/`

4. **Configuração opcional do Supabase**:
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```
   Execute o script `schema.sql` no SQL Editor do seu projeto Supabase.

---

## 📄 Licença

Desenvolvido com carinho a dois ✨
