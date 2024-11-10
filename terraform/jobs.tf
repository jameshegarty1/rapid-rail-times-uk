# Migration job setup
resource "google_cloud_run_v2_job" "migration_job" {
  name     = "run-alembic-migrations"
  location = var.region

  template {
    template {
      containers {
        image = var.backend_image_url
        command = ["alembic", "upgrade", "head"]

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.db_user.name}:${google_sql_user.db_user.password}@${google_sql_database_instance.db_instance.private_ip_address}/${google_sql_database.db.name}"
        }
      }
      service_account = var.google_service_account

      vpc_access {
        connector = google_vpc_access_connector.vpc_connector.id
      }
    }
  }

  depends_on = [
    google_cloud_run_v2_service.backend,
    google_sql_database_instance.db_instance,
    google_sql_database.db,
    google_vpc_access_connector.vpc_connector
  ]
}

resource "google_cloud_run_v2_job" "init_job" {
  name     = "init-db"
  location = var.region

  template {
    template {
      containers {
        image = var.backend_image_url
        command = ["python", "app/initial_data.py"]

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.db_user.name}:${google_sql_user.db_user.password}@${google_sql_database_instance.db_instance.private_ip_address}/${google_sql_database.db.name}"
        }
      }
      service_account = var.google_service_account

      vpc_access {
        connector = google_vpc_access_connector.vpc_connector.id
      }
    }
  }

  depends_on = [
    google_cloud_run_v2_service.backend,
    google_cloud_run_v2_job.migration_job,  # Make sure migrations run first
    google_sql_database_instance.db_instance,
    google_sql_database.db,
    google_vpc_access_connector.vpc_connector
  ]
}

# Optional: Add IAM permissions to execute jobs
resource "google_cloud_run_v2_job_iam_member" "migration_job_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_job.migration_job.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.google_service_account}"
}

resource "google_cloud_run_v2_job_iam_member" "init_job_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_job.init_job.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.google_service_account}"
}
