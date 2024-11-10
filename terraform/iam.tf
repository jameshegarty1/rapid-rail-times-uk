# Backend IAM roles
resource "google_cloud_run_service_iam_member" "backend_noauth" {
  location    = google_cloud_run_v2_service.backend.location
  project     = var.project_id
  service     = google_cloud_run_v2_service.backend.name
  role        = "roles/run.invoker"
  member      = "allUsers"
}

# Frontend IAM roles
resource "google_cloud_run_service_iam_member" "frontend_noauth" {
  location    = google_cloud_run_v2_service.frontend.location
  project     = var.project_id
  service     = google_cloud_run_v2_service.frontend.name
  role        = "roles/run.invoker"
  member      = "allUsers"
}

# Grant service account access to read secrets
resource "google_secret_manager_secret_iam_member" "secret_access" {
  secret_id = google_secret_manager_secret.app_secrets.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.google_service_account}"
}

resource "google_project_iam_member" "vpc_access" {
  project = var.project_id
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${var.google_service_account}"
}

resource "google_project_iam_member" "cloud_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${var.google_service_account}"
}

resource "google_project_iam_member" "dns_admin" {
  project = var.project_id
  role    = "roles/dns.admin"
  member  = "serviceAccount:${var.google_service_account}"
}

resource "google_project_iam_member" "cloud_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${var.google_service_account}"
}
