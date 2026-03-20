import { DatabaseModel } from "./model/DatabaseModel.js";
import { server } from "./server.js";
import dotenv from "dotenv";

dotenv.config();

async function main(): Promise<void> {
    const port: number = parseInt(process.env.PORT as string);
    const host: string = process.env.HOST ?? "";

    if (isNaN(port)) {
        console.error("Variável de ambiente PORT não definida ou inválida no arquivo .env");
        process.exit(1);
    }

    const conectado = await new DatabaseModel().testeConexao();

    if (!conectado) {
        console.error("Não foi possível conectar com o banco de dados. Servidor não iniciado.");
        process.exit(1);
    }

    server.listen(port, () => {
        console.info(`Servidor executando no endereço ${host}:${port}`);
    });
}

main().catch((error) => {
    console.error(`Erro inesperado ao iniciar a aplicação: ${error}`);
    process.exit(1);
});