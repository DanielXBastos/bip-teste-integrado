# bip-teste-integrado

Projeto multi-módulo composto por:

- `ejb-module`: regra de negócio da transferência entre benefícios
- `backend-module`: API REST, CRUD e integração com o serviço de transferência
- `frontend`: aplicação Angular consumindo a API
- `db`: scripts de banco, também copiados para o backend em `src/main/resources/db`

## Tecnologias

- Java 17
- Spring Boot
- JPA / H2
- Angular
- Swagger / OpenAPI

## Estrutura

- `ejb-module`
- `backend-module`
- `frontend`

## Regras implementadas

- nome do benefício deve ser único
- não é permitido transferir para o mesmo benefício
- valor da transferência deve ser positivo
- não é permitido saldo negativo
- não é permitido transferir entre benefícios inativos
- exclusão lógica no CRUD (`DELETE` realiza inativação)
- controle de concorrência e lock na transferência

## Como rodar

### Backend

Na raiz do projeto:

```bash
mvn clean install
cd backend-module
mvn spring-boot:run
```

Swagger:
- `http://localhost:8080/swagger-ui/index.html`

H2 Console:
- `http://localhost:8080/h2-console`

Dados do H2:
- JDBC URL: `jdbc:h2:mem:testdb`
- User: `sa`
- Password: 

### Frontend
Entre em `frontend`:
```bash
npm install
npm start
```

App:
- `http://localhost:4200`

Endpoints:
- GET /api/v1/beneficios
- GET /api/v1/beneficios/{id}
- POST /api/v1/beneficios
- PUT /api/v1/beneficios/{id}
- DELETE /api/v1/beneficios/{id} → inativação do benefício
- POST /api/v1/beneficios/transfer

Testes

Na raiz do projeto:
```bash
cd backend-module
mvn clean test
```

Na raiz do projeto:
```bash
cd ejb-module
mvn clean test
```

Na raiz do projeto:
```bash
cd frontend
npm test
```