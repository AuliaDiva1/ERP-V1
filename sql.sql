-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.11.11-MariaDB-0ubuntu0.24.04.2 - Ubuntu 24.04
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.10.1.133
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for be_monitor_suhu
CREATE DATABASE IF NOT EXISTS `be_monitor_suhu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `be_monitor_suhu`;

-- Dumping structure for table be_monitor_suhu.knex_migrations
CREATE TABLE IF NOT EXISTS `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table be_monitor_suhu.knex_migrations: ~3 rows (approximately)
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
	(18, '20250521091124_create_users_table.js', 1, '2025-05-23 03:10:19'),
	(19, '20250522020610_create_master_suhu_table.js', 1, '2025-05-23 03:10:19'),
	(20, '20250522062749_create_monitor_suhu.js', 1, '2025-05-23 03:10:19');

-- Dumping structure for table be_monitor_suhu.knex_migrations_lock
CREATE TABLE IF NOT EXISTS `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table be_monitor_suhu.knex_migrations_lock: ~0 rows (approximately)
INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
	(1, 0);

-- Dumping structure for table be_monitor_suhu.master_mesin
CREATE TABLE IF NOT EXISTS `master_mesin` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode_mesin` varchar(100) NOT NULL,
  `nama_mesin` varchar(100) NOT NULL,
  `suhu_maksimal` float(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_mesin_kode_mesin_unique` (`kode_mesin`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table be_monitor_suhu.master_mesin: ~100 rows (approximately)
INSERT INTO `master_mesin` (`id`, `kode_mesin`, `nama_mesin`, `suhu_maksimal`, `created_at`, `updated_at`) VALUES
	(1, 'MC-001', 'Mesin A', 83.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(2, 'MC-002', 'Mesin B', 67.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(3, 'MC-003', 'Mesin C', 89.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(4, 'MC-004', 'Mesin D', 99.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(5, 'MC-005', 'Mesin E', 119.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(6, 'MC-006', 'Mesin F', 67.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(7, 'MC-007', 'Mesin G', 106.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(8, 'MC-008', 'Mesin H', 116.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(9, 'MC-009', 'Mesin I', 79.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(10, 'MC-010', 'Mesin J', 101.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(11, 'MC-011', 'Mesin K', 68.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(12, 'MC-012', 'Mesin L', 100.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(13, 'MC-013', 'Mesin M', 119.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(14, 'MC-014', 'Mesin N', 112.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(15, 'MC-015', 'Mesin O', 65.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(16, 'MC-016', 'Mesin P', 114.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(17, 'MC-017', 'Mesin Q', 68.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(18, 'MC-018', 'Mesin R', 91.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(19, 'MC-019', 'Mesin S', 108.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(20, 'MC-020', 'Mesin T', 88.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(21, 'MC-021', 'Mesin U', 104.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(22, 'MC-022', 'Mesin V', 76.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(23, 'MC-023', 'Mesin W', 88.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(24, 'MC-024', 'Mesin X', 68.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(25, 'MC-025', 'Mesin Y', 80.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(26, 'MC-026', 'Mesin Z', 94.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(27, 'MC-027', 'Mesin A', 78.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(28, 'MC-028', 'Mesin B', 117.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(29, 'MC-029', 'Mesin C', 62.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(30, 'MC-030', 'Mesin D', 62.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(31, 'MC-031', 'Mesin E', 92.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(32, 'MC-032', 'Mesin F', 81.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(33, 'MC-033', 'Mesin G', 118.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(34, 'MC-034', 'Mesin H', 90.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(35, 'MC-035', 'Mesin I', 78.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(36, 'MC-036', 'Mesin J', 83.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(37, 'MC-037', 'Mesin K', 120.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(38, 'MC-038', 'Mesin L', 89.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(39, 'MC-039', 'Mesin M', 77.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(40, 'MC-040', 'Mesin N', 62.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(41, 'MC-041', 'Mesin O', 102.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(42, 'MC-042', 'Mesin P', 63.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(43, 'MC-043', 'Mesin Q', 91.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(44, 'MC-044', 'Mesin R', 62.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(45, 'MC-045', 'Mesin S', 113.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(46, 'MC-046', 'Mesin T', 86.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(47, 'MC-047', 'Mesin U', 83.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(48, 'MC-048', 'Mesin V', 94.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(49, 'MC-049', 'Mesin W', 100.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(50, 'MC-050', 'Mesin X', 60.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(51, 'MC-051', 'Mesin Y', 113.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(52, 'MC-052', 'Mesin Z', 86.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(53, 'MC-053', 'Mesin A', 78.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(54, 'MC-054', 'Mesin B', 114.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(55, 'MC-055', 'Mesin C', 94.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(56, 'MC-056', 'Mesin D', 75.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(57, 'MC-057', 'Mesin E', 94.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(58, 'MC-058', 'Mesin F', 80.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(59, 'MC-059', 'Mesin G', 110.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(60, 'MC-060', 'Mesin H', 112.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(61, 'MC-061', 'Mesin I', 72.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(62, 'MC-062', 'Mesin J', 74.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(63, 'MC-063', 'Mesin K', 95.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(64, 'MC-064', 'Mesin L', 116.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(65, 'MC-065', 'Mesin M', 120.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(66, 'MC-066', 'Mesin N', 120.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(67, 'MC-067', 'Mesin O', 89.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(68, 'MC-068', 'Mesin P', 112.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(69, 'MC-069', 'Mesin Q', 60.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(70, 'MC-070', 'Mesin R', 77.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(71, 'MC-071', 'Mesin S', 119.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(72, 'MC-072', 'Mesin T', 100.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(73, 'MC-073', 'Mesin U', 87.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(74, 'MC-074', 'Mesin V', 115.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(75, 'MC-075', 'Mesin W', 97.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(76, 'MC-076', 'Mesin X', 115.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(77, 'MC-077', 'Mesin Y', 92.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(78, 'MC-078', 'Mesin Z', 103.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(79, 'MC-079', 'Mesin A', 111.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(80, 'MC-080', 'Mesin B', 70.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(81, 'MC-081', 'Mesin C', 81.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(82, 'MC-082', 'Mesin D', 78.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(83, 'MC-083', 'Mesin E', 89.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(84, 'MC-084', 'Mesin F', 120.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(85, 'MC-085', 'Mesin G', 98.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(86, 'MC-086', 'Mesin H', 60.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(87, 'MC-087', 'Mesin I', 82.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(88, 'MC-088', 'Mesin J', 74.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(89, 'MC-089', 'Mesin K', 70.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(90, 'MC-090', 'Mesin L', 81.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(91, 'MC-091', 'Mesin M', 119.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(92, 'MC-092', 'Mesin N', 112.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(93, 'MC-093', 'Mesin O', 112.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(94, 'MC-094', 'Mesin P', 66.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(95, 'MC-095', 'Mesin Q', 73.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(96, 'MC-096', 'Mesin R', 119.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(97, 'MC-097', 'Mesin S', 63.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(98, 'MC-098', 'Mesin T', 85.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(99, 'MC-099', 'Mesin U', 88.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(100, 'MC-100', 'Mesin V', 62.00, '2025-05-23 03:10:38', '2025-05-23 03:10:38'),
	(101, 'MC-101', 'PLN Sawahan', 50.00, '2025-05-23 07:25:01', '2025-05-23 07:25:01'),
	(102, 'MC-445', 'Test Mesin 121', 100.00, '2025-05-23 09:54:19', '2025-05-23 09:54:19'),
	(103, 'MC-435', 'Test Mesin', 120.00, '2025-05-23 09:56:02', '2025-05-23 09:56:02');

-- Dumping structure for table be_monitor_suhu.monitor_suhu
CREATE TABLE IF NOT EXISTS `monitor_suhu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_mesin` bigint(20) unsigned NOT NULL,
  `tanggal_input` datetime NOT NULL,
  `keterangan_suhu` float(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `monitor_suhu_id_mesin_index` (`id_mesin`),
  CONSTRAINT `monitor_suhu_id_mesin_foreign` FOREIGN KEY (`id_mesin`) REFERENCES `master_mesin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table be_monitor_suhu.monitor_suhu: ~18 rows (approximately)
INSERT INTO `monitor_suhu` (`id`, `id_mesin`, `tanggal_input`, `keterangan_suhu`) VALUES
	(14, 45, '2025-05-23 07:00:00', 120.00),
	(15, 1, '2025-05-23 07:00:00', 90.00),
	(16, 3, '2025-05-23 07:00:00', 23.00),
	(17, 45, '2025-05-23 07:00:00', 120.00),
	(18, 1, '2025-05-23 07:00:00', 90.00),
	(19, 3, '2025-05-23 07:00:00', 23.00),
	(20, 45, '2025-05-23 07:00:00', 120.00),
	(21, 1, '2025-05-23 07:00:00', 90.00),
	(22, 3, '2025-05-23 07:00:00', 23.00),
	(23, 45, '2025-05-23 07:00:00', 120.00),
	(24, 1, '2025-05-23 07:00:00', 90.00),
	(25, 3, '2025-05-23 07:00:00', 23.00),
	(26, 1, '2025-05-23 15:01:24', 12.00),
	(27, 102, '2025-05-23 16:56:15', 120.00),
	(28, 45, '2025-05-23 07:00:00', 120.00),
	(29, 1, '2025-05-23 07:00:00', 90.00),
	(30, 3, '2025-05-23 07:00:00', 23.00),
	(31, 45, '2025-05-23 07:00:00', 120.00),
	(32, 1, '2025-05-23 07:00:00', 90.00),
	(33, 3, '2025-05-23 07:00:00', 23.00);

-- Dumping structure for table be_monitor_suhu.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table be_monitor_suhu.users: ~0 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
	(1, 'Dika', 'dika@gmail.com', '$2b$10$UkURIvGmawGIke9Qrvlw2eLpbbxpVxEqW28mLQcr5eh4q1L7NKbW2', 'admin');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
