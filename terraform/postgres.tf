resource "google_sql_database_instance" "db_instance" {
  name             = "rtuk-postgres"
  database_version = "POSTGRES_13"
  region           = "europe-west1"
  
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
      private_network = google_compute_network.vpc_network.id  # Link to the VPC
      authorized_networks {
        name = "home"
        value = "82.28.120.38"
      }

    }
    backup_configuration {
      enabled = true
    }
  }
  depends_on = [
    google_project_service.sql_admin,
    google_service_networking_connection.private_vpc_connection,
    time_sleep.wait_for_apis
  ]
}

resource "google_sql_database" "db" {
  name     = "rtuk-main"
  instance = google_sql_database_instance.db_instance.name
}

resource "google_sql_user" "db_user" {
  name     = "postgres"
  instance = google_sql_database_instance.db_instance.name
  password = var.db_password
}

