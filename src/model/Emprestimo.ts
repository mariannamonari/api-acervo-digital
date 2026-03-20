// Importa o tipo EmprestimoDTO, que define a estrutura de dados de um empréstimo (objeto simples, sem métodos)
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" gerencia múltiplas conexões simultâneas de forma eficiente
const database = new DatabaseModel().pool;

// ==================== QUERY REUTILIZÁVEL ====================
// Centraliza a query de SELECT com JOIN em uma constante fora da classe.
// Isso evita repetição de código nos métodos listarEmprestimos e listarEmprestimo,
// seguindo o princípio DRY (Don't Repeat Yourself — Não Se Repita).
// O "$1" é um placeholder para o filtro por ID (usado apenas no listarEmprestimo).
const BASE_QUERY_EMPRESTIMO = `
    SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
           e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
           a.ra, a.nome, a.sobrenome, a.celular, a.email,
           l.titulo, l.autor, l.editora, l.isbn
    FROM Emprestimo e
    JOIN Aluno a ON e.id_aluno = a.id_aluno
    JOIN Livro l ON e.id_livro = l.id_livro
`;

// Define a classe Emprestimo, que representa um empréstimo de livro no sistema
class Emprestimo {

    // Atributo privado: ID único do empréstimo no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_emprestimo: number = 0;
    // Atributo privado: ID do aluno que realizou o empréstimo (chave estrangeira referenciando a tabela Aluno)
    private id_aluno: number;
    // Atributo privado: ID do livro emprestado (chave estrangeira referenciando a tabela Livro)
    private id_livro: number;
    // Atributo privado: Data em que o empréstimo foi realizado
    private data_emprestimo: Date;
    // Atributo privado: Data prevista para devolução do livro
    private data_devolucao: Date;
    // Atributo privado: Situação atual do empréstimo (ex: "Em Andamento", "Devolvido", "Atrasado")
    private status_emprestimo: string;
    // Atributo privado: Indica se o registro está ativo no banco (true = ativo, false = removido logicamente)
    private status_emprestimo_registro: boolean = true;

    // Construtor: chamado automaticamente ao criar um novo objeto Emprestimo
    constructor(
        _id_aluno: number,           // ID do aluno — obrigatório
        _id_livro: number,           // ID do livro — obrigatório
        _data_emprestimo: Date,      // Data do empréstimo — obrigatório
        _status_emprestimo?: string, // Status do empréstimo — opcional (o "?" indica que pode ser omitido)
        _data_devolucao?: Date       // Data de devolução — opcional
    ) {
        // Cria uma cópia da data de empréstimo para calcular a data de devolução padrão.
        // Isso é necessário para não modificar o objeto original (_data_emprestimo).
        const dataDevolucaoPadrao = new Date(_data_emprestimo);
        // Adiciona 7 dias à data de empréstimo para definir o prazo padrão de devolução.
        // getDate() retorna o dia atual, e setDate() define um novo dia somando +7.
        dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);

        // Atribui os valores recebidos aos atributos internos da classe
        this.id_aluno = _id_aluno;
        this.id_livro = _id_livro;
        this.data_emprestimo = _data_emprestimo;
        // Se _status_emprestimo não foi informado, usa "Em Andamento" como valor padrão.
        // O operador "??" retorna o lado direito se o esquerdo for null ou undefined.
        this.status_emprestimo = _status_emprestimo ?? "Em Andamento";
        // Se _data_devolucao não foi informada, usa a data calculada automaticamente (empréstimo + 7 dias)
        this.data_devolucao = _data_devolucao ?? dataDevolucaoPadrao;
    }

    // ==================== GETTERS E SETTERS ====================
    // Métodos públicos para acessar e modificar os atributos privados da classe com segurança

    public getIdEmprestimo(): number { return this.id_emprestimo; }
    public setIdEmprestimo(value: number) { this.id_emprestimo = value; }

    public getIdAluno(): number { return this.id_aluno; }
    public setIdAluno(value: number) { this.id_aluno = value; }

    public getIdLivro(): number { return this.id_livro; }
    public setIdLivro(value: number) { this.id_livro = value; }

    public getDataEmprestimo(): Date { return this.data_emprestimo; }
    public setDataEmprestimo(value: Date) { this.data_emprestimo = value; }

    public getDataDevolucao(): Date { return this.data_devolucao; }
    public setDataDevolucao(value: Date) { this.data_devolucao = value; }

    public getStatusEmprestimo(): string { return this.status_emprestimo; }
    public setStatusEmprestimo(value: string) { this.status_emprestimo = value; }

    public getStatusEmprestimoRegistro(): boolean { return this.status_emprestimo_registro; }
    public setStatusEmprestimoRegistro(value: boolean) { this.status_emprestimo_registro = value; }

    // ==================== MÉTODO AUXILIAR PRIVADO ====================

    /**
     * Converte uma linha bruta retornada pelo banco de dados em um objeto EmprestimoDTO.
     *
     * Este método é "private static" porque:
     * - "private": só deve ser usado internamente nesta classe, não fora dela
     * - "static": não depende de nenhuma instância (não usa "this"), pertence à classe em si
     *
     * Centralizar essa lógica aqui elimina a duplicação que existia entre
     * listarEmprestimos e listarEmprestimo, ambos montavam o objeto da mesma forma.
     *
     * @param linha - Objeto com os dados brutos de uma linha do banco de dados
     * @returns Um objeto EmprestimoDTO devidamente preenchido
     */
    private static mapRowToDTO(linha: any): EmprestimoDTO {
        return {
            id_emprestimo:              linha.id_emprestimo,
            data_emprestimo:            linha.data_emprestimo,
            data_devolucao:             linha.data_devolucao,
            status_emprestimo:          linha.status_emprestimo,
            status_emprestimo_registro: linha.status_emprestimo_registro,
            // Objeto aninhado com os dados do aluno relacionado ao empréstimo
            aluno: {
                id_aluno:  linha.id_aluno,
                ra:        linha.ra,
                nome:      linha.nome,
                sobrenome: linha.sobrenome,
                celular:   linha.celular,
                email:     linha.email
            },
            // Objeto aninhado com os dados do livro relacionado ao empréstimo
            livro: {
                id_livro: linha.id_livro,
                titulo:   linha.titulo,
                autor:    linha.autor,
                editora:  linha.editora,
                isbn:     linha.isbn
            }
        };
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Emprestimo.listarEmprestimos()

    /**
     * Retorna uma lista com todos os empréstimos ativos cadastrados no banco de dados.
     *
     * Utiliza JOIN para trazer os dados de Aluno e Livro em uma única consulta,
     * evitando múltiplas idas ao banco (o que seria menos eficiente).
     *
     * @returns Lista de EmprestimoDTO ou null se não houver registros ou ocorrer erro
     */
    static async listarEmprestimos(): Promise<Array<EmprestimoDTO> | null> {
        try {
            // Monta a query usando a base reutilizável + filtro de registros ativos
            const query = BASE_QUERY_EMPRESTIMO + `WHERE e.status_emprestimo_registro = TRUE;`;

            // Executa a query no banco de dados e aguarda o resultado
            const respostaBD = await database.query(query);

            // Se o banco não retornou nenhuma linha, não há empréstimos ativos — retorna null
            if (respostaBD.rows.length === 0) return null;

            // Usa .map() para transformar cada linha do banco em um EmprestimoDTO.
            // .map() é preferível ao forEach() aqui porque ele já retorna um novo array,
            // tornando o código mais conciso e funcional — sem precisar de uma variável auxiliar.
            return respostaBD.rows.map(Emprestimo.mapRowToDTO);

        } catch (error) {
            // Se ocorrer qualquer erro durante a consulta, exibe no console para facilitar o debug
            console.error(`Erro ao listar empréstimos: ${error}`);
            // Retorna null para indicar que houve falha
            return null;
        }


    }


    /**
     * Retorna as informações de um único empréstimo identificado pelo ID.
     *
     * @param id_emprestimo - Identificador único do empréstimo a ser buscado
     * @returns Objeto EmprestimoDTO com os dados do empréstimo, ou null se não encontrado
     */
    static async listarEmprestimo(id_emprestimo: number): Promise<EmprestimoDTO | null> {
        try {
            // Monta a query usando a base reutilizável + filtro por ID específico.
            // O "$1" é um placeholder protegido contra SQL Injection — o valor real
            // é passado separadamente no array de parâmetros abaixo.
            const query = BASE_QUERY_EMPRESTIMO + `WHERE e.id_emprestimo = $1;`;

            // Executa a query passando o id_emprestimo como parâmetro (substitui o $1)
            const respostaBD = await database.query(query, [id_emprestimo]);

            // Verifica se o empréstimo com o ID informado foi encontrado.
            // Sem essa verificação, acessar rows[0] em um array vazio causaria erro em tempo de execução.
            if (respostaBD.rows.length === 0) return null;

            // Reutiliza o método auxiliar para converter a linha do banco em EmprestimoDTO
            return Emprestimo.mapRowToDTO(respostaBD.rows[0]);

        } catch (error) {
            console.error(`Erro ao buscar empréstimo (ID: ${id_emprestimo}): ${error}`);
            return null;
        }

    }

    /**
     * Cadastra um novo empréstimo no banco de dados.
     *
     * @param emprestimo - Objeto Emprestimo com os dados a serem inseridos
     * @returns true se o cadastro foi bem-sucedido, false caso contrário
     */
    static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<boolean> {
        try {
            // Query SQL de inserção — os "$1" a "$5" serão substituídos pelos valores reais.
            // "RETURNING id_emprestimo" faz o banco retornar o ID gerado automaticamente após o INSERT.
            const queryInsertEmprestimo = `
                INSERT INTO Emprestimo (id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id_emprestimo;
            `;

            // Organiza os valores em um array usando os getters públicos.
            // Usar getters (em vez de acessar os atributos privados diretamente) é a prática correta
            // de encapsulamento — mesmo que funcionasse antes por ser a mesma classe.
            const valores = [
                emprestimo.getIdAluno(),
                emprestimo.getIdLivro(),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataDevolucao(),
                emprestimo.getStatusEmprestimo()
            ];

            // Executa a query de inserção e armazena o resultado
            const resultado = await database.query(queryInsertEmprestimo, valores);

            // Se rowCount for maior que 0, pelo menos uma linha foi inserida — cadastro bem-sucedido
            if ((resultado.rowCount ?? 0) > 0) {
                console.log(`Empréstimo cadastrado com sucesso! ID: ${resultado.rows[0].id_emprestimo}`);
                return true;
            }

            // Se nenhuma linha foi afetada, o cadastro não funcionou
            return false;

        } catch (error) {
            console.error(`Erro ao cadastrar empréstimo: ${error}`);
            return false;
        }
        
    }

    /**
     * Atualiza os dados de um empréstimo existente no banco de dados.
     *
     * @param id_emprestimo    - ID do empréstimo a ser atualizado
     * @param id_aluno         - Novo ID do aluno vinculado
     * @param id_livro         - Novo ID do livro vinculado
     * @param data_emprestimo  - Nova data de empréstimo
     * @param data_devolucao   - Nova data de devolução
     * @param status_emprestimo - Novo status do empréstimo
     * @returns true se a atualização foi bem-sucedida, false caso contrário
     */
    static async atualizarEmprestimo(
        id_emprestimo: number,
        id_aluno: number,
        id_livro: number,
        data_emprestimo: Date,
        data_devolucao: Date,
        status_emprestimo: string
    ): Promise<boolean> {
        try {
            // Query SQL de atualização — o WHERE garante que apenas o registro correto seja alterado.
            // "RETURNING id_emprestimo" confirma que o registro existia e foi de fato atualizado.
            const queryUpdateEmprestimo = `
                UPDATE Emprestimo
                SET id_aluno = $1,
                    id_livro = $2,
                    data_emprestimo = $3,
                    data_devolucao = $4,
                    status_emprestimo = $5
                WHERE id_emprestimo = $6
                RETURNING id_emprestimo;
            `;

            // Organiza os valores em um array na mesma ordem dos placeholders da query.
            // id_emprestimo vai por último ($6) pois é usado no WHERE, não no SET.
            const valores = [id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo, id_emprestimo];
            const resultado = await database.query(queryUpdateEmprestimo, valores);

            // Se rowCount for 0, nenhuma linha foi alterada — o ID informado não existe no banco
            if ((resultado.rowCount ?? 0) === 0) {
                // Lança um erro descritivo para ser capturado pelo bloco catch abaixo
                throw new Error(`Empréstimo com ID ${id_emprestimo} não encontrado.`);
            }

            return true;

        } catch (error) {
            console.error(`Erro ao atualizar empréstimo: ${error}`);
            return false;
        }
    }

    /**
     * Remove logicamente um empréstimo do banco de dados.
     *
     * Remoção lógica significa que o registro NÃO é apagado fisicamente — apenas
     * o campo "status_emprestimo_registro" é marcado como FALSE. Isso preserva o
     * histórico de empréstimos e permite auditoria futura.
     *
     * @param id_emprestimo - ID do empréstimo a ser desativado
     * @returns true se a remoção foi bem-sucedida, false caso o ID não exista ou ocorra erro
     */
    static async removerEmprestimo(id_emprestimo: number): Promise<boolean> {
        try {
            // Usa UPDATE em vez de DELETE para preservar o histórico no banco
            const queryDeleteEmprestimo = `
                UPDATE Emprestimo
                SET status_emprestimo_registro = FALSE
                WHERE id_emprestimo = $1;
            `;

            // Executa a query passando o ID do empréstimo como parâmetro (substitui o $1)
            const respostaBD = await database.query(queryDeleteEmprestimo, [id_emprestimo]);

            // rowCount > 0 confirma que algum registro foi afetado pelo UPDATE
            if ((respostaBD.rowCount ?? 0) > 0) {
                console.log(`Empréstimo ID ${id_emprestimo} removido com sucesso!`);
                return true;
            }

            // Se rowCount for 0, nenhum registro com esse ID foi encontrado
            return false;

        } catch (error) {
            console.error(`Erro ao remover empréstimo: ${error}`);
            return false;
        }
    }
}

// Exporta a classe Emprestimo para que possa ser importada e usada em outros arquivos do projeto
export default Emprestimo;