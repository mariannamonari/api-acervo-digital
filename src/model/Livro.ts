// Importa o tipo LivroDTO, que define a estrutura de dados de um livro (objeto simples, sem métodos)
import type LivroDTO from "../dto/LivroDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" gerencia múltiplas conexões simultâneas de forma eficiente
const database = new DatabaseModel().pool;

// Define a classe Livro, que representa um livro no sistema de biblioteca
class Livro {
    // Atributo privado: ID único do livro no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_livro: number = 0;
    // Atributo privado: Título do livro
    private titulo: string;
    // Atributo privado: Nome do autor do livro
    private autor: string;
    // Atributo privado: Nome da editora responsável pela publicação
    private editora: string;
    // Atributo privado: Ano em que o livro foi publicado (string para suportar formatos como "2024")
    private ano_publicacao: string;
    // Atributo privado: Código ISBN — identificador único internacional de livros
    private isbn: string;
    // Atributo privado: Quantidade total de exemplares do livro no acervo
    private quant_total: number;
    // Atributo privado: Quantidade de exemplares disponíveis para empréstimo no momento
    private quant_disponivel: number;
    // Atributo privado: Valor pago para adquirir o livro
    private valor_aquisicao: number;
    // Atributo privado: Quantidade adquirida na última compra
    private quant_aquisicao: number;
    // Atributo privado: Indica se o livro está disponível ou emprestado (começa como "Disponível")
    private status_livro_emprestado: string = "Disponível";
    // Atributo privado: Indica se o livro está ativo no sistema (false = ainda não persistido no banco)
    private status_livro: boolean = false;

    // Construtor: chamado automaticamente ao criar um novo objeto Livro
    constructor(
        _titulo: string,           // Título do livro — obrigatório
        _autor: string,            // Autor do livro — obrigatório
        _editora: string,          // Editora do livro — obrigatório
        _ano_publicacao: string,   // Ano de publicação — obrigatório
        _isbn: string,             // ISBN do livro — obrigatório
        _quant_total: number,      // Quantidade total de exemplares — obrigatório
        _quant_disponivel: number, // Quantidade disponível para empréstimo — obrigatório
        _quant_aquisicao: number,  // Quantidade adquirida (recebido, mas não usado no construtor — ver abaixo)
        _valor_aquisicao: number   // Valor de aquisição — obrigatório
    ) {
        // Atribui os valores recebidos aos atributos internos da classe
        this.titulo = _titulo;
        this.autor = _autor;
        this.editora = _editora;
        this.ano_publicacao = _ano_publicacao;
        this.isbn = _isbn;
        this.quant_total = _quant_total;
        this.quant_disponivel = _quant_disponivel;
        this.quant_aquisicao = _quant_aquisicao;
        this.valor_aquisicao = _valor_aquisicao;
        // ⚠️ Atenção: o parâmetro "_quant_aquisicao" é recebido mas nunca atribuído a nenhum atributo
        // Isso provavelmente é um esquecimento no código original
    }

    // ==================== GETTERS E SETTERS ====================
    // Métodos públicos para acessar e modificar os atributos privados com segurança

    // Getter: retorna o ID do livro
    public getIdLivro(): number {
        return this.id_livro;
    }
    // Setter: define um novo valor para o ID do livro
    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    // Getter: retorna o título do livro
    public getTitulo(): string {
        return this.titulo;
    }
    // Setter: define um novo título para o livro
    public setTitulo(value: string) {
        this.titulo = value;
    }

    // Getter: retorna o nome do autor do livro
    public getAutor(): string {
        return this.autor;
    }
    // Setter: define um novo autor para o livro
    public setAutor(value: string) {
        this.autor = value;
    }

    // Getter: retorna o nome da editora do livro
    public getEditora(): string {
        return this.editora;
    }
    // Setter: define uma nova editora para o livro
    public setEditora(value: string) {
        this.editora = value;
    }

    // Getter: retorna o ano de publicação do livro
    public getAnoPublicacao(): string {
        return this.ano_publicacao;
    }
    // Setter: define um novo ano de publicação para o livro
    public setAnoPublicacao(value: string) {
        this.ano_publicacao = value;
    }

    // Getter: retorna o ISBN do livro
    public getIsbn(): string {
        return this.isbn;
    }
    // Setter: define um novo ISBN para o livro
    public setIsbn(value: string) {
        this.isbn = value;
    }

    // Getter: retorna a quantidade total de exemplares do livro
    public getQuantTotal(): number {
        return this.quant_total;
    }
    // Setter: define uma nova quantidade total de exemplares
    public setQuantTotal(value: number) {
        this.quant_total = value;
    }

    // Getter: retorna a quantidade de exemplares disponíveis para empréstimo
    public getQuantDisponivel(): number {
        return this.quant_disponivel;
    }
    // Setter: define uma nova quantidade de exemplares disponíveis
    public setQuantDisponivel(value: number) {
        this.quant_disponivel = value;
    }

    // Getter: retorna o valor de aquisição do livro
    public getValorAquisicao(): number {
        return this.valor_aquisicao;
    }
    // Setter: define um novo valor de aquisição para o livro
    public setValorAquisicao(value: number) {
        this.valor_aquisicao = value;
    }

    // Getter: retorna a quantidade adquirida na última compra
    public getQuantAquisicao(): number {
        return this.quant_aquisicao;
    }
    // Setter: define uma nova quantidade adquirida
    public setQuantAquisicao(value: number) {
        this.quant_aquisicao = value;
    }

    // Getter: retorna o status de empréstimo do livro (ex: "Disponível", "Emprestado")
    public getStatusLivroEmprestado(): string {
        return this.status_livro_emprestado;
    }
    // Setter: define um novo status de empréstimo para o livro
    public setStatusLivroEmprestado(value: string) {
        this.status_livro_emprestado = value;
    }

    // Getter: retorna se o livro está ativo no sistema (true) ou removido logicamente (false)
    public getStatusLivro(): boolean {
        return this.status_livro;
    }
    // Setter: define o status de atividade do livro no sistema
    public setStatusLivro(value: boolean) {
        this.status_livro = value;
    }

    // ==================== MÉTODO AUXILIAR ====================
    // Método estático para mapear uma linha do banco de dados para um LivroDTO
    static mapRowToDTO(row: any): LivroDTO {
        return {
            id_livro: row.id_livro,
            titulo: row.titulo,
            autor: row.autor,
            editora: row.editora,
            ano_publicacao: row.ano_publicacao,
            isbn: row.isbn,
            quant_total: row.quant_total,
            quant_disponivel: row.quant_disponivel,
            quant_aquisicao: row.quant_aquisicao,
            valor_aquisicao: row.valor_aquisicao,
            status_livro_emprestado: row.status_livro_emprestado,
            status_livro: row.status_livro
        };
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Livro.listarLivros()

    /**
     * Retorna uma lista com todos os livros cadastrados no banco de dados
     * 
     * @returns Lista com todos os livros cadastrados no banco de dados
     */
    // Método assíncrono que busca todos os livros ativos e retorna uma lista de LivroDTO ou null
     static async listarLivros(): Promise<Array<LivroDTO> | null> {
        try {
            // Query SQL que busca todos os livros com status ativo (status_livro = TRUE).
            // Livros com status FALSE foram removidos logicamente e não devem aparecer na listagem.
            const querySelectLivros = `SELECT * FROM Livro WHERE status_livro = TRUE;`;
 
            // Executa a query no banco de dados e aguarda o resultado
            const respostaBD = await database.query(querySelectLivros);
 
            // Se não houver nenhum livro ativo, retorna null em vez de uma lista vazia
            if (respostaBD.rows.length === 0) return null;
 
            // Usa .map() para transformar cada linha do banco em um LivroDTO.
            // .map() é preferível ao forEach() aqui porque retorna um novo array diretamente,
            // eliminando a necessidade de uma variável auxiliar e de chamadas .push().
            return respostaBD.rows.map(Livro.mapRowToDTO);
 
        } catch (error) {
            console.error(`Erro ao listar livros: ${error}`);
            return null;
        }
    }
    /**
     * Retorna as informações de um livro informado pelo ID
     * 
     * @param id_livro Identificador único do livro
     * @returns Objeto com informações do livro
     */
    // Recebe o ID do livro e retorna um único LivroDTO ou null
        static async listarLivro(id_livro: number): Promise<LivroDTO | null> {
        try {
            // O "$1" é um placeholder protegido contra SQL Injection — o valor real
            // é passado separadamente no array de parâmetros abaixo.
            const querySelectLivro = `SELECT * FROM Livro WHERE id_livro = $1;`;
 
            // Executa a query passando o id_livro como parâmetro (substitui o $1)
            const respostaBD = await database.query(querySelectLivro, [id_livro]);
 
            // Verifica se o livro com o ID informado foi encontrado.
            // Sem essa verificação, acessar rows[0] em um array vazio causaria erro em tempo de execução.
            if (respostaBD.rows.length === 0) return null;
 
            // Reutiliza o método auxiliar para converter a linha do banco em LivroDTO
            return Livro.mapRowToDTO(respostaBD.rows[0]);
 
        } catch (error) {
            console.error(`Erro ao buscar livro (ID: ${id_livro}): ${error}`);
            return null;
        }
    }
    /**
     * Cadastra um novo livro no banco de dados
     * @param livro Objeto Livro contendo as informações a serem cadastradas
     * @returns Boolean indicando se o cadastro foi bem-sucedido
     */
    // Recebe um objeto Livro completo e tenta inseri-lo no banco de dados
    static async cadastrarLivro(livro: Livro): Promise<boolean> {
        try {
            // Query SQL de inserção com 9 placeholders ($1 a $9), um para cada campo.
            // "RETURNING id_livro" faz o banco retornar o ID gerado automaticamente após o INSERT.
            const queryInsertLivro = `
                INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, quant_total, quant_disponivel, valor_aquisicao, status_livro_emprestado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id_livro;
            `;
 
            // Organiza os valores em um array na mesma ordem dos placeholders da query.
            // Textos são normalizados para maiúsculas via a função auxiliar "upper()",
            // garantindo que o banco armazene tudo de forma padronizada.
            const valores = [
                livro.getTitulo(),               // $1 — Título em maiúsculas
                livro.getAutor(),                // $2 — Autor em maiúsculas
                livro.getEditora(),              // $3 — Editora em maiúsculas
                livro.getAnoPublicacao(),        // $4 — Ano de publicação em maiúsculas
                livro.getIsbn(),                 // $5 — ISBN em maiúsculas
                livro.getQuantTotal(),                  // $6 — Quantidade total (número, sem transformação)
                livro.getQuantDisponivel(),             // $7 — Quantidade disponível (número)
                livro.getValorAquisicao(),              // $8 — Valor de aquisição (número)
                livro.getStatusLivroEmprestado() // $9 — Status em maiúsculas
            ];
 
            // Executa a query de inserção e armazena o resultado
            const resultado = await database.query(queryInsertLivro, valores);
 
            // Se rowCount for maior que 0, a inserção foi bem-sucedida
            if ((resultado.rowCount ?? 0) > 0) {
                console.log(`Livro cadastrado com sucesso! ID: ${resultado.rows[0].id_livro}`);
                return true;
            }
 
            return false;
 
        } catch (error) {
            console.error(`Erro ao cadastrar livro: ${error}`);
            return false;
        }
    }
 
    /**
     * Remove um livro do banco de dados
     * @param id_livro ID do livro a ser removido
     * @returns Boolean indicando se a remoção foi bem-sucedida
    */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerLivro(id_livro: number): Promise<boolean> {
        try {
            // Busca o livro antes de tentar remover, para verificar se ele existe e está ativo
            const livro = await Livro.listarLivro(id_livro);
 
            // Só prossegue se o livro existir E estiver com status ativo (true)
            if (!livro || !livro.status_livro) return false;
 
            // Passo 1: Desativa todos os empréstimos vinculados a este livro.
            // Isso garante consistência — um livro removido não pode ter empréstimos ativos.
            await database.query(
                `UPDATE Emprestimo SET status_emprestimo_registro = FALSE WHERE id_livro = $1`,
                [id_livro]
            );
 
            // Passo 2: Desativa o próprio livro (remoção lógica — não apaga, apenas muda o status)
            const resultado = await database.query(
                `UPDATE Livro SET status_livro = FALSE WHERE id_livro = $1`,
                [id_livro]
            );
 
            // "rowCount" indica quantas linhas foram afetadas pelo UPDATE.
            // Retorna true se pelo menos uma linha foi alterada, false caso contrário.
            return (resultado.rowCount ?? 0) > 0;
 
        } catch (error) {
            console.error(`Erro ao remover livro (ID: ${id_livro}): ${error}`);
            return false;
        }
    }
 
    /**
     * Atualiza os dados de um livro no banco de dados.
     * @param livro Objeto do tipo Livro com os novos dados
     * @returns true caso sucesso, false caso erro
     */
    // Recebe um objeto Livro com os dados atualizados e os salva no banco
    static async atualizarLivro(livro: Livro): Promise<boolean> {
        try {
            // Antes de atualizar, verifica se o livro existe e está ativo no banco
            const livroConsulta: LivroDTO | null = await this.listarLivro(livro.id_livro);

            // Só prossegue com a atualização se o livro existir e estiver ativo
            if (livroConsulta && livroConsulta.status_livro) {
                // Query SQL de atualização com 10 placeholders ($1 a $10)
                // O $10 no WHERE garante que apenas o livro com o ID correto seja atualizado
                const queryAtualizarLivro = `UPDATE Livro SET 
                                titulo = $1, 
                                autor = $2,
                                editora = $3, 
                                ano_publicacao = $4,
                                isbn = $5, 
                                quant_total = $6,
                                quant_disponivel = $7,
                                quant_aquisicao = $8,
                                valor_aquisicao = $9,
                                status_livro_emprestado = $10
                             WHERE id_livro = $11`;

                // Organiza os novos valores em um array na mesma ordem dos placeholders
                const valores = [
                    livro.getTitulo().toUpperCase(),               // $1 — Título em maiúsculas
                    livro.getAutor().toUpperCase(),                // $2 — Autor em maiúsculas
                    livro.getEditora().toUpperCase(),              // $3 — Editora em maiúsculas
                    livro.getAnoPublicacao().toUpperCase(),        // $4 — Ano de publicação em maiúsculas
                    livro.getIsbn().toUpperCase(),                 // $5 — ISBN em maiúsculas
                    livro.getQuantTotal(),                         // $6 — Quantidade total (número)
                    livro.getQuantDisponivel(),                    // $7 — Quantidade disponível (número)
                    livro.getQuantAquisicao(),                     // $8 — Quantidade adquirida (número)
                    livro.getValorAquisicao(),                     // $9 — Valor de aquisição (número)
                    livro.getStatusLivroEmprestado().toUpperCase(), // $10 — Status em maiúsculas
                    livro.getIdLivro()                             // $11 — ID do livro (usado no WHERE)
                ];

                // Executa a query de atualização e armazena o resultado
                const respostaBD = await database.query(queryAtualizarLivro, valores);

                // Se rowCount for diferente de 0, a atualização funcionou — retorna true
                if (respostaBD.rowCount != 0) {
                    return true;
                }
            }

            // Se o livro não existe, está inativo, ou o UPDATE não afetou nenhuma linha, retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de exceção
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

}

// Exporta a classe Livro para que possa ser importada e usada em outros arquivos do projeto
export default Livro;