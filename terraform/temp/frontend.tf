resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region
  deletion_protection = false
  template {
    containers {
      image = var.frontend_image_url
      env {
        name  = "REACT_APP_API_URL"
        value = var.backend_url
      }
      resources {
        limits = {
          memory = "512Mi"
          cpu    = "1"
        }
      }
    }
    vpc_access{
      connector = google_vpc_access_connector.vpc_connector.id
      egress = "ALL_TRAFFIC"
    }

    # Specify service account for this service
    service_account = "deployment-automation-sa@rail-times-uk.iam.gserviceaccount.com"

    # Set timeout for the service, if needed
    timeout = "300s"
    
  }



}
