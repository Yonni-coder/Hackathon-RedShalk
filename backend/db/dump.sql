-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: vahatra_center
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
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
-- Table structure for table `ressource_photos`
--

DROP TABLE IF EXISTS `ressource_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ressource_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ressource_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ressource_id` (`ressource_id`),
  CONSTRAINT `ressource_photos_ibfk_1` FOREIGN KEY (`ressource_id`) REFERENCES `ressources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ressource_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressource_types`
--

LOCK TABLES `ressource_types` WRITE;
/*!40000 ALTER TABLE `ressource_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `ressource_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ressources`
--

DROP TABLE IF EXISTS `ressources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ressources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `status` enum('libre','reserve','indisponible') DEFAULT 'libre',
  `company_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `ressources_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ressources_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `ressource_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressources`
--

LOCK TABLES `ressources` WRITE;
/*!40000 ALTER TABLE `ressources` DISABLE KEYS */;
/*!40000 ALTER TABLE `ressources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifs`
--

LOCK TABLES `tarifs` WRITE;
/*!40000 ALTER TABLE `tarifs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarifs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yonni Tinogny','exemple@test.com','$2b$10$a3odMdXllXxNIfF46EJADO59s0CRLcdhWYGVbsj5VbJckc1wq2bFm','client',NULL,1,'2025-08-27 15:32:22','+261330000000'),(4,'Yonni Tinogny','exempl2e@test.com','$2b$10$9w2B6IKWYXV3R4rKQin5R.qhuu0qh9Ichbu//HIK5UgqkR3tOlZF.','client',NULL,1,'2025-08-27 15:48:20','+261330000000'),(5,'Yonni Tinogny','exempl3e@test.com','$2b$10$QySu3XzRd6ABTvtg6tbRqutk4kyhos0jVKimC6cXDF5738XLh8Wc.','client',1,1,'2025-08-27 18:14:36','+261330000000'),(6,'Yonni Tinogny','exempl4e@test.com','$2b$10$/5XwoQIUI2SAqiZwzgZZv.qcSZaZX7HcEiIH2kS5wGa6QtNbaame.','manager',1,1,'2025-08-27 18:15:04','+261330000000'),(7,'Jean Client','client1@example.com','$2b$10$xg.qd1.6miXvzMuqIHLADOq.HBrsQPv.yMRfF7k7YVM2dbJTPpPmW','client',NULL,1,'2025-08-27 18:50:51','+261 34 123 4567'),(8,'Paul Manager','manager@vahatra.mg','$2b$10$E4S1Dro2OjnODDVz2lgUKOkdz5hIu/k9HqD/X5wSSxFslyp1wj.EO','manager',NULL,0,'2025-08-27 19:00:13','+261 33 111 2233'),(9,'Marie Employée','employe@vahatra.mg','$2b$10$wxcqqxNY3o2X9Taiw5/tWeUmmSvlClV1KQPpXyRxklod4YW4Btccu','employee',NULL,0,'2025-08-27 19:01:45','+261 32 444 5566'),(10,'Alice Client','client2@example.com','$2b$10$dHBYhfrw0rRNG5hDNshCS.sn4F/cNyDQxo2pCCvv67rK/5olQZ5Uu','client',NULL,1,'2025-08-27 19:04:30','+261 34 123 4568');
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

-- Dump completed on 2025-08-28  1:13:38
