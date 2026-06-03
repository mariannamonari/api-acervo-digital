import { Router, type Request, type Response } from "express";
import AlunoController from "./controller/AlunoController.js";
import LivroController from "./controller/LivroController.js";
import EmprestimoController from "./controller/EmprestimoController.js";
import { Auth } from "./middlewares/Auth.js";


const router = Router();

router.get('/', (req: Request, res: Response) => {
    return res.status(200).json(`Aplicação online. Timestamp: ${new Date()}`);
});

router.post('/api/login', Auth.validacaoUsuario);

router.get('/api/alunos', AlunoController.todos);
router.get('/api/alunos/:id', AlunoController.aluno);
router.post('/api/alunos', AlunoController.cadastrar);
router.delete('/api/alunos/:id', AlunoController.remover);
router.put('/api/alunos/:id', AlunoController.atualizar);

router.get('/api/livros', LivroController.todos);
router.get('/api/livros/:id', LivroController.livro);
router.post('/api/livros', LivroController.cadastrar);
router.delete('/api/livros/:id', LivroController.remover);
router.put('/api/livros/:id', LivroController.atualizar);

router.get('/api/emprestimos', EmprestimoController.todos);
router.get('/api/emprestimos/:id', EmprestimoController.emprestimo);
router.post('/api/emprestimos', EmprestimoController.cadastrar);
router.delete('/api/emprestimos/:id', EmprestimoController.remover);
router.put('/api/emprestimos/:id', EmprestimoController.atualizar);

export { router };