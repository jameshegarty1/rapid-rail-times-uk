resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region
  deletion_protection = false
  template {
    containers {
      image = var.frontend_image_url
      env {
        name  = "VITE_API_URL"
        value = var.backend_url
      }
      env {
        name  = "STRICT_TRANSPORT_SECURITY"
        value = "max-age=31536000; includeSubDomains"
      }
      resources {
        limits = {
          memory = "128Mi"
          cpu    = "0.5"
        }
        cpu_idle = true
      }
      
    }
    vpc_access{
      connector = google_vpc_access_connector.vpc_connector.id
      egress = "ALL_TRAFFIC"
    }

    scaling {
        min_instance_count = 0
        max_instance_count = 1
    }

    max_instance_request_concurrency = 1


    service_account = var.google_service_account
    timeout = "60s" 
  }

  depends_on = [
    google_project_service.cloud_run,
    google_vpc_access_connector.vpc_connector,
    google_service_networking_connection.private_vpc_connection
  ]
}


resource "google_cloud_run_v2_service" "backend" {
  name     = var.backend_service_name
  location = var.region

  template {
    containers {
      image = var.backend_image_url
      resources {
        limits = {
          memory = "128Mi"
          cpu    = "0.5"
        }

      cpu_idle = true
      }
      
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_secrets.id
            version = "latest"
          }
        }
      }
      env {
        name = "API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_secrets.id
            version = "latest"
          }
        }
      }  
      env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.db_user.name}:${google_sql_user.db_user.password}@${google_sql_database_instance.db_instance.private_ip_address}/${google_sql_database.db.name}"
        } 
      env {
        name  = "FRONTEND_URL"
        value = "https://${var.domain}"
      }
    }

    vpc_access{
      connector = google_vpc_access_connector.vpc_connector.id
      egress = "ALL_TRAFFIC"
    }

    scaling {
        min_instance_count = 0
        max_instance_count = 1
    }

    max_instance_request_concurrency = 1
   
    service_account = var.google_service_account

    timeout = "60s"

    

  }
  depends_on = [
    google_project_service.cloud_run,
    google_secret_manager_secret_version.app_secrets_version,
    google_vpc_access_connector.vpc_connector
    ]
}
