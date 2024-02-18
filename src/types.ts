import type { ColumnType, Generated, Insertable } from "kysely";

export interface Database {
  clientes: ClientesTable;
  transacoes: TransacoesTable;
}

export interface ClientesTable {
  id: Generated<number>;
  nome: string;
  limite: number;
  saldo: number;
}

export interface TransacoesTable {
  id: Generated<number>;
  cliente_id: number;
  valor: number;
  tipo: "c" | "d";
  descricao: string;
  realizada_em: ColumnType<Date, string | undefined, never>;
}

export type NovaTransacao = Insertable<TransacoesTable>;
