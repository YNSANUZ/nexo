# Deploy automatico para Hostinger

O deploy envia a pasta `publicar` inteira para a Hostinger.

No computador, a pasta raiz dos sites e:

```text
G:\O meu disco\Meus Sites\NEXO primus - limpo\publicar
```

Dentro dela, o NEXO Card fica em:

```text
G:\O meu disco\Meus Sites\NEXO primus - limpo\publicar\card
```

No servidor, isso vira:

```text
https://primusdf.com.br/card/
```

## Fluxo

1. Editar localmente no Codex/VS Code.
2. Fazer commit.
3. Fazer push para o GitHub na branch `main`.
4. O GitHub Actions envia a pasta `publicar` inteira para a Hostinger por FTP.

## Segredos no GitHub

No repositorio do GitHub, va em:

`Settings > Secrets and variables > Actions > New repository secret`

Crie estes secrets:

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
```

O destino da Hostinger vem do secret `FTP_SERVER_DIR`.

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
