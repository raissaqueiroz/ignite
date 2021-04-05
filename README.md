# FinAPI - API Financeira

Estudando conceitos básicos de NodeJS construindo nossa primeira API sem persistência de dados :)

---

### Requisitos

- [x] Deve ser possivel criar uma conta
- [x] Deve ser possivel buscar o extrato bancário do cliente
- [x] Deve ser possivel realizar um depósito
- [x] Deve ser possivel realizar um saque
- [x] Deve ser possivel buscar o extrato bancário do cliente por data
- [x] Deve ser possivel atualizar dados da conta do cliente
- [x] Deve ser possivel obter dados da conta do cliente
- [x] Deve ser possivel deletar uma conta
- [ ] Deve ser possivel retornar o saldo

### Regras de Negócio

- [x] Não deve ser possivel cadastrar uma conta com CPF já existente
- [x] Não deve ser possivel fazer depósito em uma conta que não existe
- [x] Não deve ser possivel buscar extrato em uma conta que não existe
- [x] Não deve ser possivel fazer saque em uma conta que não existe
- [x] Não deve ser possivel visualizar dados de um cliente q não existe
- [x] Não deve ser possivel excluir uma conta que não existe
- [x] Não deve ser possivel fazer saque quando o saldo for insuficiente
- [x] Só deve ser possivel atualizar name
