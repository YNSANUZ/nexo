# Deploy automatico para Hostinger

O deploy envia somente a pasta `card` para a Hostinger.

No computador, a pasta correta do site e:

```text
G:\O meu disco\Meus Sites\NEXO primus - limpo\publicar\card
```

No servidor, o conteudo de `card` entra como raiz do site em `public_html/`.

## Fluxo

1. Editar localmente no Codex/VS Code.
2. Fazer commit.
3. Fazer push para o GitHub na branch `main`.
4. O GitHub Actions envia a pasta `card` para a Hostinger por FTP.

## Segredos no GitHub

No repositorio do GitHub, va em:

`Settings > Secrets and variables > Actions > New repository secret`

Crie estes secrets:

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
```

O destino da Hostinger ja esta fixado no workflow como `/domains/primusdf.com.br/public_html/`, para publicar o NEXO Card direto na raiz do dominio.

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
