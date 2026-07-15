# SentinelAI Gateway

Gateway open source de segurança para prompts, respostas de modelos e chamadas de ferramentas de agentes de IA.

O SentinelAI combina regras determinísticas, remoção de segredos e um classificador local transparente. O resultado é uma decisão explicável: `ALLOW`, `REVIEW`, `REDACT` ou `BLOCK`.

## Executar no Windows

```powershell
npm ci
npm run dev
```

Abra a URL local informada pelo servidor.

## Testar

```powershell
npm run lint
npm test
npm run test:site
```

## Limites de segurança

- O conteúdo enviado nunca é executado.
- O texto original não é salvo no histórico.
- Segredos e dados pessoais são removidos antes da persistência.
- O classificador apenas contribui evidências; a política determinística toma a decisão final.
- Esta é uma implementação defensiva de referência, não uma certificação de segurança.

## Autoria e validação

O SentinelAI Gateway é projetado, dirigido e mantido por **Willian Thiago**, sob o nome **WILLTEC**. Crédito no GitHub: [@wllianthiago21-boop](https://github.com/wllianthiago21-boop).

A V1 pública foi revisada em execução local e aprovada pelo responsável pelo projeto para publicação. Ferramentas de desenvolvimento assistido por IA foram usadas como apoio em pesquisa, implementação e revisão; as decisões de produto, validação e responsabilidade pela publicação permanecem com o mantenedor.

Documentação detalhada em inglês: [README.md](README.md), [arquitetura](docs/architecture.md), [modelo de ameaças](docs/threat-model.md), [model card](docs/model-card.md) e [validação da versão](docs/validation.md).
