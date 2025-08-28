-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: vahatra_center
-- ------------------------------------------------------
-- Server version	11.6.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `manager_id` (`manager_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Vahatra',NULL,'2025-08-27 18:14:30','contact@vahatra.mg','+261 20 123 4567','Antananarivo, Madagascar',1),(2,'Fake',NULL,'2025-08-27 18:49:49','info@fake.mg','+261 20 987 6543','Antsirabe, Madagascar',1);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ressource_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reservations_ressource` (`ressource_id`),
  KEY `idx_reservations_user` (`user_id`),
  KEY `idx_reservations_dates` (`start_date`,`end_date`),
  KEY `idx_reservations_status` (`status`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`ressource_id`) REFERENCES `ressources` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ressource_photos`
--

DROP TABLE IF EXISTS `ressource_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ressource_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ressource_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ressource_id` (`ressource_id`),
  CONSTRAINT `ressource_photos_ibfk_1` FOREIGN KEY (`ressource_id`) REFERENCES `ressources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressource_photos`
--

LOCK TABLES `ressource_photos` WRITE;
/*!40000 ALTER TABLE `ressource_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ressource_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ressource_types`
--

DROP TABLE IF EXISTS `ressource_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ressource_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressource_types`
--

LOCK TABLES `ressource_types` WRITE;
/*!40000 ALTER TABLE `ressource_types` DISABLE KEYS */;
INSERT INTO `ressource_types` VALUES (1,'test',NULL,NULL),(2,'teqqst',NULL,NULL),(3,'teqqzzzt',NULL,1),(6,'teqqaazzzt',NULL,1);
/*!40000 ALTER TABLE `ressource_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ressources`
--

DROP TABLE IF EXISTS `ressources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ressources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` varchar(255) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `status` enum('libre','reserve','indisponible') DEFAULT 'libre',
  `company_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `ressources_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ressources_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `ressource_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressources`
--

LOCK TABLES `ressources` WRITE;
/*!40000 ALTER TABLE `ressources` DISABLE KEYS */;
INSERT INTO `ressources` VALUES (1,'Salle de réunion A','Salle équipée pour réunions jusqu\'à 8 personnes, vidéoprojecteur et tableau blanc.','8','toujours','2ème étage - Bâtiment B','libre',1,2,'2025-08-28 00:26:45'),(2,'Salle de réunion A','Salle équipée pour réunions jusqu\'à 8 personnes, vidéoprojecteur et tableau blanc.','8','toujours','2ème étage - Bâtiment B','libre',1,2,'2025-08-28 00:26:56');
/*!40000 ALTER TABLE `ressources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(4,'client'),(3,'employe'),(2,'manager');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifs`
--

DROP TABLE IF EXISTS `tarifs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarifs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ressource_id` int(11) NOT NULL,
  `tarif_h` decimal(10,2) DEFAULT NULL,
  `tarif_j` decimal(10,2) DEFAULT NULL,
  `tarif_sem` decimal(10,2) DEFAULT NULL,
  `tarif_mois` decimal(10,2) DEFAULT NULL,
  `tarif_an` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ressource_id` (`ressource_id`),
  CONSTRAINT `tarifs_ibfk_1` FOREIGN KEY (`ressource_id`) REFERENCES `ressources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifs`
--

LOCK TABLES `tarifs` WRITE;
/*!40000 ALTER TABLE `tarifs` DISABLE KEYS */;
INSERT INTO `tarifs` VALUES (1,1,10000.00,20000.00,30000.00,50000.00,100000.00),(2,2,1000000.00,3000000.00,400000.00,6000000.00,8000000.00);
/*!40000 ALTER TABLE `tarifs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('client','employee','manager','admin') NOT NULL,
  `company_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yonni Tinogny','exemple@test.com','$2b$10$a3odMdXllXxNIfF46EJADO59s0CRLcdhWYGVbsj5VbJckc1wq2bFm','client',NULL,1,'2025-08-27 15:32:22','+261330000000'),(4,'Yonni Tinogny','exempl2e@test.com','$2b$10$9w2B6IKWYXV3R4rKQin5R.qhuu0qh9Ichbu//HIK5UgqkR3tOlZF.','client',NULL,1,'2025-08-27 15:48:20','+261330000000'),(5,'Yonni Tinogny','exempl3e@test.com','$2b$10$QySu3XzRd6ABTvtg6tbRqutk4kyhos0jVKimC6cXDF5738XLh8Wc.','client',1,1,'2025-08-27 18:14:36','+261330000000'),(6,'Yonni Tinogny','exempl4e@test.com','$2b$10$/5XwoQIUI2SAqiZwzgZZv.qcSZaZX7HcEiIH2kS5wGa6QtNbaame.','manager',1,1,'2025-08-27 18:15:04','+261330000000'),(7,'Jean Client','client1@example.com','$2b$10$xg.qd1.6miXvzMuqIHLADOq.HBrsQPv.yMRfF7k7YVM2dbJTPpPmW','client',NULL,1,'2025-08-27 18:50:51','+261 34 123 4567'),(8,'Paul Manager','manager@vahatra.mg','$2b$10$E4S1Dro2OjnODDVz2lgUKOkdz5hIu/k9HqD/X5wSSxFslyp1wj.EO','manager',NULL,0,'2025-08-27 19:00:13','+261 33 111 2233'),(9,'Marie Employée','employe@vahatra.mg','$2b$10$wxcqqxNY3o2X9Taiw5/tWeUmmSvlClV1KQPpXyRxklod4YW4Btccu','employee',NULL,0,'2025-08-27 19:01:45','+261 32 444 5566'),(10,'Alice Client','client2@example.com','$2b$10$dHBYhfrw0rRNG5hDNshCS.sn4F/cNyDQxo2pCCvv67rK/5olQZ5Uu','client',NULL,1,'2025-08-27 19:04:30','+261 34 123 4568'),(11,'Admin','admin@gmail.com','$2b$12$KWzrjdL3pEv3sZ1iSfhYjuC.PF8TERLcvzB5LvVdqN9j2NJ6J7EPK','admin',NULL,1,'2025-08-27 19:32:36',NULL),(12,'undefined undefined','client22@example.com','$2b$10$DDmUjbIt2GGHjQ2rcNNcaOnEet2w85v./PD04J5f0meYtk8qhQrt.','client',NULL,1,'2025-08-27 20:41:29','+261 34 123 4568'),(13,'Paul Manager','manager2@vahatra.mg','$2b$10$MvIaUXEMv9EvKaYIADwEauSSiIl6NxtusFHSuuS7Nx9YoF/ygv6Wu','manager',1,1,'2025-08-27 20:45:05','+261 33 111 2233'),(14,'Paul Manager','manager3@vahatra.mg','$2b$10$CVfn9nm5wLO7jorL8T4HeeZiHKLhbUYSd9Z7NI3dyUqvizSx8X5Wq','manager',1,1,'2025-08-27 21:01:23','+261 33 111 2233'),(15,'Paul Manager','client@vahatra.mg','$2b$10$gwb7t59rUG4jgqGWaXjZt.9TS5vQZkbbrFydu3I2479KbRQ8DxWpu','client',NULL,1,'2025-08-27 21:02:38','+261 33 111 2233'),(16,'Admin','admin@test.mg','$2b$10$YQg6XbF1Xf1NHCjebknnWO455oVyGsn62oAMqbYAsj3Wznq592oeK','admin',1,1,'2025-08-27 21:52:27','+261 33 111 2233'),(17,'TEssss','test@gmail.com','$2b$10$FJUOg8VrTLBFANCu.ksY6OJ6p/BRA.EaYFDfLBuZVq4ooC0LvXwU2','manager',1,1,'2025-08-27 23:48:30','+261 33 111 2233');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-28  8:49:49
