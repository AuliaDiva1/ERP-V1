import { db } from "../core/config/knex.js";

/**
 * Get all vendor
 **/
export const getAllVendor = async () => {
  return db("master_vendor").select("*").orderBy("VENDOR_ID", "asc");
};

/**
 * Get vendor by ID (Primary Key)
 **/
export const getVendorById = async (ID) => {
  return db("master_vendor").where({ ID }).first();
};

/**
 * Get vendor by VENDOR_ID (kode unik)
 **/
export const getVendorByKode = async (kode) => {
  return db("master_vendor").where({ VENDOR_ID: kode }).first();
};

/**
 * Ambil vendor terakhir (untuk auto-generate kode VENDOR_ID jika dibutuhkan)
 **/
export const getLastVendor = async () => {
  return db("master_vendor").orderBy("VENDOR_ID", "desc").first();
};

/**
 * Create new vendor
 **/
export const createVendor = async ({
  VENDOR_ID,
  NAMA_VENDOR,
  ALAMAT_VENDOR,
  PIC,
  NO_TELP_PIC,
  EMAIL_PIC,
  KETERSEDIAAN_BARANG,
}) => {
  if (!VENDOR_ID || !NAMA_VENDOR || !ALAMAT_VENDOR || !PIC) {
    throw new Error("VENDOR_ID, NAMA_VENDOR, ALAMAT_VENDOR, dan PIC wajib diisi");
  }

  const [ID] = await db("master_vendor").insert({
    VENDOR_ID,
    NAMA_VENDOR,
    ALAMAT_VENDOR,
    PIC,
    NO_TELP_PIC: NO_TELP_PIC ?? null,
    EMAIL_PIC: EMAIL_PIC ?? null,
    KETERSEDIAAN_BARANG: KETERSEDIAAN_BARANG ?? "Tersedia",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("master_vendor").where({ ID }).first();
};

/**
 * Update vendor
 **/
export const updateVendor = async (
  ID,
  { VENDOR_ID, NAMA_VENDOR, ALAMAT_VENDOR, PIC, NO_TELP_PIC, EMAIL_PIC, KETERSEDIAAN_BARANG }
) => {
  if (!NAMA_VENDOR || !ALAMAT_VENDOR || !PIC) {
    throw new Error("NAMA_VENDOR, ALAMAT_VENDOR, dan PIC wajib diisi");
  }

  const dataToUpdate = {
    NAMA_VENDOR,
    ALAMAT_VENDOR,
    PIC,
    updated_at: db.fn.now(),
  };

  if (VENDOR_ID) dataToUpdate.VENDOR_ID = VENDOR_ID;
  if (NO_TELP_PIC !== undefined) dataToUpdate.NO_TELP_PIC = NO_TELP_PIC;
  if (EMAIL_PIC !== undefined) dataToUpdate.EMAIL_PIC = EMAIL_PIC;
  if (KETERSEDIAAN_BARANG !== undefined)
    dataToUpdate.KETERSEDIAAN_BARANG = KETERSEDIAAN_BARANG;

  await db("master_vendor").where({ ID }).update(dataToUpdate);

  return db("master_vendor").where({ ID }).first();
};

/**
 * Delete vendor
 **/
export const deleteVendor = async (ID) => {
  return db("master_vendor").where({ ID }).del();
};