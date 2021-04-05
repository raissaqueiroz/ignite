const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

class App {

	constructor() {
		this.server = express();

		this.middlewares();
		this.routes();
	}

	middlewares() {
		this.server.use(express.json());
		this.server.use(express.urlencoded({ extended: true }));

		// URL's que irão consumir essa API
		const allowedOrigins = ['http://localhost:3000'];

		this.server.use(
			cors({
				origin: function (origin, callback) {
					// allow requests with no origin
					// (like mobile apps or curl requests)
					if (!origin) return callback(null, true);

					if (allowedOrigins.indexOf(origin) === -1) {
						const msg =
							'The CORS policy for this site does not ' +
							'allow access from the specified Origin.';

						return callback(new Error(msg), false);
					}
					return callback(null, true);
				},
			})
		);
	}

	routes() {
		const customers = [];

		function verifyIfExistsAccountCPF(request, reponse, next){
			const { cpf } = request.headers;

			const response = customers.find(customer => customer.cpf === cpf);

			if(!response) return reponse.status(400).json({ error: 'Customer not found.'});

			request.customer = response;

			return next();
		}

		function getBalance(statement){
			const balance = statement.reduce((acc, operation) => {
				if(operation.type.toLowerCase() === 'credit'){
					return acc + operation.amount
				} else {
					return acc - operation.amount
				}
			}, 0);

			return balance.toFixed(2);
		}

		/**
		 * Criação de Conta
		 * 
		 * Não pode cadastrar um CPF que já exista
		 * cpf (string), name (string), id (uuid), statement (array)
		 */
		this.server.post('/accounts', (req, res) => {
			const { cpf, name } = req.body;

			const customerAlreadyExists = customers.some(customer => customer.cpf === cpf);

			if(customerAlreadyExists) return res.status(400).json({ error: 'Customer already exists!' });

			customers.push({ id: uuidv4(), name, cpf, statement: [] });

			return res.status(201).send();
		});

		/**
		 * Buscar Extrato
		 * 
		 * Não deve ser possivel buscar extrato em uma conta que não existe
		 */
		this.server.get('/statements', verifyIfExistsAccountCPF, (req, res) => {
			const { customer } = req;

			return res.json(customer.statement);
		});

		/**
		 * Buscar Extrato por Data
		 * 
		 * Não deve ser possivel buscar extrato em uma conta que não existe
		 */
		 this.server.get('/statements/date', verifyIfExistsAccountCPF, (req, res) => {
			const { customer } = req;
			const { date } = req.query;

			const dateFormat = new Date(date.split("/").reverse().join("-") + " 00:00");

			const statement = customer.statement.filter((statement) => statement.createdAt.toDateString() === new Date(dateFormat).toDateString());

			return res.json(statement);
		});

		/**
		 * Fazer Depósito
		 * 
		 * Não deve ser possivel fazer depósito em uma conta que não existe
		 */
		 this.server.post('/deposits', verifyIfExistsAccountCPF, (req, res) => {
			const { description, amount } = req.body;

			const { customer } = req;

			const statementOperation = {
				description, 
				amount,
				createdAt: new Date(),
				type: 'Credit'
			}

			customer.statement.push(statementOperation);

			return res.status(201).send();
		});

		/**
		 * Fazer Saque
		 * 
		 * Não deve ser possivel fazer saque em uma conta que não existe
		 * Não deve ser possivel fazer saque de valor não disponível
		 */
		 this.server.post('/withdraws', verifyIfExistsAccountCPF, (req, res) => {
			const { amount } = req.body;
			const { customer } = req;

			const balance = getBalance(customer.statement);

			if(balance < amount) return res.status(400).json({ error: `Insufficient funds! Fund: ${balance}` });
			
			
			const statementOperation = {
				description: 'Saque', 
				amount,
				createdAt: new Date(),
				type: 'Debit'
			}

			customer.statement.push(statementOperation);

			return res.status(201).send();
		});

		/**
		 * atualizar dados da conta do cliente
		 * 
		 * Não deve ser possivel atualizar dados de um cliente q não existe
		 * Só pode ser possivel atualizar name
		 */
		 this.server.put('/accounts', verifyIfExistsAccountCPF, (req, res) => {
			const { name } = req.body;
			const { customer } = req;

			customer.name = name;

			return res.status(201).send();
		 });

		 /**
		 * visualizar dados da conta do cliente
		 * 
		 * Não deve ser possivel visualizar dados de um cliente q não existe
		 */
		this.server.get('/accounts', verifyIfExistsAccountCPF, (req, res) => {
			const { customer } = req;

			return res.json(customer);
		});

		 /**
		 * Excluir Conta
		 * 
		 * Não deve ser possivel excluir uma conta que não existe
		 */
		this.server.delete('/accounts', verifyIfExistsAccountCPF, (req, res) => {
			const { customer } = req;

			customers.splice(customer, 1);

			return res.status(200).json(customers);
		});
		
		/**
		 * Retornar Saldo
		 * 
		 */
		 this.server.get('/balances', verifyIfExistsAccountCPF, (req, res) => {
			const { customer } = req;

			const balance = getBalance(customer.statement);

			return res.json(balance);
		});
	}
}

module.exports = new App().server;
