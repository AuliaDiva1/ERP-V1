import { db } from "../core/config/knex.js";
import { formatMariaDBDatetime } from "../utils/formatDate.js";

/**
 * Get all master mesin
 **/
export const getAllMonitorSuhu = async () =>
  db("monitor_suhu")
    .join("master_mesin", "monitor_suhu.id_mesin", "=", "master_mesin.id")
    .select(
      "monitor_suhu.id",
      "monitor_suhu.id_mesin",
      "monitor_suhu.tanggal_input",
      "master_mesin.kode_mesin",
      "monitor_suhu.keterangan_suhu",
    );

/**
 * Get mesin by ID
 **/
export const getMonitorSuhuById = async (id) =>
  db("monitor_suhu").where({ id }).first();

/**
 * Create new mesin
 **/
export const addMonitorSuhu = async ({
  id_mesin,
  tanggal_input,
  // waktu_input,
  keterangan_suhu,
}) => {
  const [id] = await db("monitor_suhu").insert({
    id_mesin,
    tanggal_input: formatMariaDBDatetime(tanggal_input),
    // waktu_input,
    keterangan_suhu,
  });
  return db("monitor_suhu")
    .join("master_mesin", "monitor_suhu.id_mesin", "=", "master_mesin.id")
    .select(
      "monitor_suhu.id",
      "monitor_suhu.id_mesin",
      "monitor_suhu.tanggal_input",
      "master_mesin.kode_mesin",
      "monitor_suhu.keterangan_suhu",
    )
    .where({ "monitor_suhu.id": id })
    .first();
};

/**
 * Update existing mesin
 **/
export const editMonitorSuhu = async ({
  id,
  id_mesin,
  tanggal_input,
  keterangan_suhu,
}) => {
  await db("monitor_suhu")
    .where({ id })
    .update({
      id_mesin,
      tanggal_input: formatMariaDBDatetime(tanggal_input),
      keterangan_suhu,
    });
  return db("monitor_suhu")
    .join("master_mesin", "monitor_suhu.id_mesin", "=", "master_mesin.id")
    .select(
      "monitor_suhu.id",
      "monitor_suhu.id_mesin",
      "monitor_suhu.tanggal_input",
      "master_mesin.kode_mesin",
      "monitor_suhu.keterangan_suhu",
    )
    .where({ "monitor_suhu.id": id })
    .first();
};

/**
 * Delete existing mesin
 **/
export const removeMonitorSuhu = async ({ id }) => {
  await db("monitor_suhu").where({ id }).delete();
  return db("monitor_suhu").where({ id }).first();
};
