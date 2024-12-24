# API de Transações

API para gerenciamento de transações financeiras.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- Docker e Docker Compose
  
## Tecnologias utilizadas
- Redis
- Docker
- NestJs
- PostgreSQL

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/HenriqueMVSS/transaction-api
cd transaction-api
```

2. Instale as dependências:
   ```bash
   npm install
   ```

### Configuração

1. Crie um arquivo .env na raiz do projeto com as seguintes variáveis de ambiente (Opcional):
   ```bash
    DATABASE_HOST=database
    DATABASE_PORT=5432
    DATABASE_USER=postgres
    DATABASE_PASSWORD=postgres
    DATABASE_NAME=nestjs
    REDIS_HOST=redis
    REDIS_PORT=6379
    JWT_SECRET=secretKey
    ```
    
### Iniciando a aplicação

1. Construa e inicie os contêineres Docker:
   ```bash
   docker-compose up --build
   ````

### Populando o Banco de Dados

1. Execute o script de seed para popular o banco de dados com dados de exemplo:
   ```bash 
   npm run seed
   ```

### Documentação da API
A documentação da API está disponível em ```http://localhost:3000/api```.

### Monitoramento de Filas
O monitoramento das filas das transações está disponível em ```http://localhost:3000/admin/queues```.

### Endpoints

#### Autenticação
- Registro de usuarios:
 ```POST /auth/signup: Registrar um novo usuário```
- Parâmetros:
  ```
  username: string
  password: string
  ```

- Login:
```POST /auth/signin: Fazer login```

- Parâmetros:
```
username: string
password: string
```
#### Transações

- Saldo:
```GET /transactions/balance/:userId: Obter saldo do usuário```

- Parâmetros:
``` userId: number```

- Deposito:
```POST /transactions/deposit/:userId: Depositar dinheiro```

- Parâmetros:
```
userId: number
amount: number
  ```

- Saque:
```POST /transactions/withdraw/:userId: Sacar dinheiro```

Parâmetros:
```
userId: number
amount: number
```
- Transferências:
```POST /transactions/transfer/:fromUserId/:toUserId: Transferir dinheiro```

- Parâmetros:
``` 
fromUserId: number
toUserId: number
amount: number
```

### Licença
Este projeto está licenciado sob a licença MIT.
   


   