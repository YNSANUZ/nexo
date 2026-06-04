# Deploy automatico para Hostinger

Esta pasta `publicar` e a raiz do site que sera enviada para a Hostinger.

## Fluxo

1. Editar localmente no Codex/VS Code.
2. Fazer commit.
3. Fazer push para o GitHub na branch `main`.
4. O GitHub Actions envia tudo desta pasta para a Hostinger por FTP.

## Segredos no GitHub

No repositorio do GitHub, va em:

`Settings > Secrets and variables > Actions > New repository secret`

Crie estes secrets:

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_SERVER_DIR
```

Exemplo comum do destino na Hostinger:

```text
public_html/
```

Se este projeto ficar em uma subpasta do dominio:

```text
public_html/nexo/
```

Importante: `FTP_SERVER_DIR` deve terminar com `/`.

## Primeiro envio

Depois de criar o repositorio no GitHub e cadastrar os secrets:

```powershell
cd "G:\O meu disco\Meus Sites\NEXO primus - limpo\publicar"
git add .
git commit -m "Configura deploy automatico Hostinger"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Nos proximos envios:

```powershell
git add .
git commit -m "Atualiza site"
git push
```
