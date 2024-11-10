resource "google_cloud_run_v2_service" "backend" {
  name     = var.backend_service_name
  location = var.region

  template {
    containers {
      image = var.backend_image_url
      resources {
        limits = {
          memory = "512Mi"
          cpu    = "1"
        }
      }
      env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.db_user.name}:${google_sql_user.db_user.password}@${google_sql_database_instance.db_instance.private_ip_address}/${google_sql_database.db.name}"
        }
      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.redis_instance.host}:6379/0"
      }
      env {
        name  = "FRONTEND_URL"
        value = var.frontend_url
      }
    }

    vpc_access{
      connector = google_vpc_access_connector.vpc_connector.id
      egress = "ALL_TRAFFIC"
    }

    # Specify service account for this service
    service_account = "deployment-automation-sa@rail-times-uk.iam.gserviceaccount.com"

    # Set the timeout for the service, if needed
    timeout = "300s"

  }
}
