import { routes } from "@stricjs/app";
import { json, status } from "@stricjs/app/send";
import { db } from "./db";

export default routes()
  .prefix("/clientes/:id")
  .state({ cliente_id: (ctx) => +ctx.params.id })
  .get("/extrato", async (ctx) => {
    const cliente_id = +ctx.params.id;

    return db.transaction().execute(async (trx) => {
      const saldo = await trx
        .selectFrom("clientes")
        .select(["clientes.saldo", "clientes.limite"])
        .where("clientes.id", "=", cliente_id)
        .executeTakeFirst();

      if (!saldo) {
        return status(undefined, 404);
      }

      const ultimas_transacoes = await trx
        .selectFrom("transacoes")
        .select([
          "transacoes.valor",
          "transacoes.tipo",
          "transacoes.descricao",
          "transacoes.realizada_em",
        ])
        .where("transacoes.cliente_id", "=", cliente_id)
        .orderBy("transacoes.id", "desc")
        .limit(10)
        .execute();

      return json({
        saldo: {
          total: saldo.saldo,
          limite: saldo.limite,
          data_extrato: new Date(),
        },
        ultimas_transacoes,
      });
    });
  });
