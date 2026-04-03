import * as ShiftModel from "../models/masterShiftModel.js";

/* ============================================================
 * 1. GET ALL
 * ============================================================ */
export const getAll = async (req, res) => {
  try {
    const data = await ShiftModel.getAllShift();
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("getAll shift error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memuat data shift" });
  }
};

/* ============================================================
 * 2. GET AKTIF (dropdown form karyawan)
 * ============================================================ */
export const getAktif = async (req, res) => {
  try {
    const data = await ShiftModel.getShiftAktif();
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("getAktif shift error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memuat data shift aktif" });
  }
};

/* ============================================================
 * 3. CREATE
 * ============================================================ */
export const create = async (req, res) => {
  const { NAMA_SHIFT, JAM_MASUK, JAM_KELUAR, HARI_KERJA, STATUS } = req.body;

  if (!NAMA_SHIFT?.trim())
    return res.status(400).json({ status: "error", message: "Nama shift wajib diisi" });
  if (!JAM_MASUK || !JAM_KELUAR)
    return res.status(400).json({ status: "error", message: "Jam masuk dan jam keluar wajib diisi" });

  try {
    const data = await ShiftModel.createShift({ NAMA_SHIFT, JAM_MASUK, JAM_KELUAR, HARI_KERJA, STATUS });
    return res.status(201).json({ status: "success", message: "Shift berhasil ditambahkan", data });
  } catch (error) {
    console.error("create shift error:", error);
    if (error.message?.includes("UNIQUE"))
      return res.status(400).json({ status: "error", message: `Nama shift "${NAMA_SHIFT}" sudah ada` });
    return res.status(500).json({ status: "error", message: "Gagal menambahkan shift" });
  }
};

/* ============================================================
 * 4. UPDATE
 * ============================================================ */
export const update = async (req, res) => {
  const { id } = req.params;
  const { NAMA_SHIFT, JAM_MASUK, JAM_KELUAR, HARI_KERJA, STATUS } = req.body;

  if (!NAMA_SHIFT?.trim())
    return res.status(400).json({ status: "error", message: "Nama shift wajib diisi" });
  if (!JAM_MASUK || !JAM_KELUAR)
    return res.status(400).json({ status: "error", message: "Jam masuk dan jam keluar wajib diisi" });

  try {
    const existing = await ShiftModel.getShiftById(id);
    if (!existing)
      return res.status(404).json({ status: "error", message: "Shift tidak ditemukan" });

    const data = await ShiftModel.updateShift(id, { NAMA_SHIFT, JAM_MASUK, JAM_KELUAR, HARI_KERJA, STATUS });
    return res.json({ status: "success", message: "Shift berhasil diperbarui", data });
  } catch (error) {
    console.error("update shift error:", error);
    if (error.message?.includes("UNIQUE"))
      return res.status(400).json({ status: "error", message: `Nama shift "${NAMA_SHIFT}" sudah ada` });
    return res.status(500).json({ status: "error", message: "Gagal memperbarui shift" });
  }
};

/* ============================================================
 * 5. DELETE
 * ============================================================ */
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await ShiftModel.deleteShift(id);
    return res.json({ status: "success", message: "Shift berhasil dihapus" });
  } catch (error) {
    console.error("delete shift error:", error);
    if (error.message?.startsWith("SHIFT_IN_USE:")) {
      return res.status(400).json({
        status:  "error",
        code:    "SHIFT_IN_USE",
        message: error.message.replace("SHIFT_IN_USE: ", ""),
      });
    }
    return res.status(500).json({ status: "error", message: "Gagal menghapus shift" });
  }
};
