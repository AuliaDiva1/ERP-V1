import {
  addMasterMesin,
  editMasterMesin,
  getAllMasterMesin,
  getMasterMesinById,
  removeMasterMesin,
} from "../models/masterMesinModel.js";
import {
  addMasterMesinSchema,
  updateMasterMesinSchema,
} from "../schemas/masterMesinSchema.js";
import { datetime, status } from "../utils/general.js";

export const fetchAllMasterMesin = async (req, res) => {
  try {
    const masterMesin = await getAllMasterMesin();

    if (masterMesin.length === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data User kosong",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data User berhasil di dapatkan",
      datetime: datetime(),
      master_mesin: masterMesin,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const fetchMasterMesinById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.params.id);
    const masterMesin = await getMasterMesinById(id);
    // console.log(masterMesin);
    if (!masterMesin) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data Mesin tidak ditemukan",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data User berhasil di dapatkan",
      datetime: datetime(),
      master_mesin: masterMesin,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const createMasterMesin = async (req, res) => {
  try {
    const validation = addMasterMesinSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { kode_mesin, nama_mesin, suhu_maksimal } = validation.data;

    const masterMesin = await addMasterMesin({
      kode_mesin,
      nama_mesin,
      suhu_maksimal,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data master mesin berhasil dibuat",
      datetime: datetime(),
      master_mesin: masterMesin,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const updateMasterMesin = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateMasterMesinSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { kode_mesin, nama_mesin, suhu_maksimal } = validation.data;

    // console.log(kode_mesin, nama_mesin, suhu_maksimal);

    const masterMesin = await editMasterMesin({
      id,
      kode_mesin,
      nama_mesin,
      suhu_maksimal,
    });

    console.log(masterMesin);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data master mesin berhasil diperbarui",
      datetime: datetime(),
      master_mesin: masterMesin,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const destroyMasterMesin = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getMasterMesinById(id);
    if (!existing) {
      return res.status(404).json({
        status: status.SUKSES,
        message: "Data Mesin tidak ditemukan",
        datetime: datetime(),
      });
    }

    const masterMesin = await removeMasterMesin(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data master mesin berhasil diperbarui",
      datetime: datetime(),
      master_mesin: masterMesin,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
