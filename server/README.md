# Backend opcional — proxy seguro para remoção de fundo via API externa

Por padrão o FotoPasse MZ **não precisa deste backend**: a remoção de fundo
corre localmente no navegador via `@imgly/background-removal`.

Se decidir usar um serviço externo (ex. remove.bg) por qualidade superior,
NUNCA coloque a chave de API no frontend. Use este exemplo de servidor
mínimo (Node/Express) como ponto de partida — ele guarda a chave como
variável de ambiente do servidor e nunca a expõe ao browser.

## Como correr

```bash
cd server
npm install
export REMOVE_BG_API_KEY="a_sua_chave_privada"
node index.js
```

Depois, no `.env` do frontend:

```
VITE_BG_REMOVAL_PROVIDER=api
VITE_BG_REMOVAL_ENDPOINT=http://localhost:3001/remove-bg
```

## Segurança

- A chave `REMOVE_BG_API_KEY` vive apenas no servidor.
- O frontend envia a imagem para `/remove-bg` no SEU backend.
- O SEU backend é que fala com o serviço externo, usando a chave.
- Nunca faça commit da chave — use variáveis de ambiente/secrets do seu
  provedor de alojamento (Render, Railway, Fly.io, etc.).
