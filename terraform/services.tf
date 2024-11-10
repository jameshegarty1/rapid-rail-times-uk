# Enable necessary APIs
resource "google_project_service" "cloud_run" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "sql_admin" {
  project = var.project_id
  service = "sqladmin.googleapis.com"
}

resource "google_project_service" "secretmanager" {
  project = var.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "cloud_run_v2" {
  project = var.project_id
  service = "cloudscheduler.googleapis.com"  # Needed if you want to schedule these jobs
}

resource "google_project_service" "compute" {
  project = var.project_id
  service = "compute.googleapis.com"
}

resource "google_project_service" "service_networking" {
  project = var.project_id
  service = "servicenetworking.googleapis.com"
}

resource "google_project_service" "vpcaccess" {
  project = var.project_id
  service = "vpcaccess.googleapis.com"
}
resource "google_project_service" "dns" {
  project = var.project_id
  service = "dns.googleapis.com"
}

resource "google_project_service" "certificate_manager" {
  project = var.project_id
  service = "certificatemanager.googleapis.com"
}

resource "time_sleep" "wait_for_apis" {
  depends_on = [
    google_project_service.sql_admin,
    google_project_service.service_networking,
    google_project_service.compute,
    google_project_service.cloud_run,
    google_project_service.cloud_build,
    google_project_service.vpcaccess
  ]

  create_duration = "30s"
}
