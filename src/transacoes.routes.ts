import { routes } from "@stricjs/app";
import { json as jsonParser } from "@stricjs/app/parser";
import { json, status } from "@stricjs/app/send";
import { sql } from "kysely";
import { define, enums, is, number, object } from "superstruct";
import { db } from "./db";
import type { NovaTransacao } from "./types";

const Dados = object({
  cliente_id: number(),
  tipo: enums(["c", "d"]),
  valor: define<number>("Valor", (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
  }),
  descricao: define<string>("Descricao", (value) => {
    return typeof value === "string" && value.length >= 1 && value.length <= 10;
  }),
});

export default routes()
  .prefix("/clientes/:id")
  .state({
    cliente_id: (ctx) => +ctx.params.id,
    body: jsonParser((body) => body),
  })
  .post("/transacoes", (ctx) => {
    const dados = {
      cliente_id: ctx.state.cliente_id,
      ...ctx.state.body,
    };

    if (!is(dados, Dados)) {
      return status(undefined, 422);
    }

    return transacao(dados);
  });

function transacao(dados: NovaTransacao) {
  return db
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT pg_advisory_xact_lock(${dados.cliente_id})`.execute(trx);

      const { cliente_id, valor } = dados;
      const cliente = await trx
        .selectFrom("clientes")
        .select(["clientes.saldo", "clientes.limite"])
        .where("clientes.id", "=", cliente_id)
        .executeTakeFirst();

      if (!cliente) {
        return status(undefined, 404);
      }

      const saldo = cliente.saldo + (dados.tipo === "c" ? +valor : -valor);

      await trx
        .updateTable("clientes")
        .set({ saldo: saldo })
        .where("clientes.id", "=", cliente_id)
        .execute();

      await trx.insertInto("transacoes").values(dados).execute();

      return json({ saldo, limite: cliente.limite });
    })
    .catch(() => status(undefined, 422));
}
