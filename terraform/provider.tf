terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
    }
    time = {
      source  = "hashicorp/time"
    }
  }
  backend "gcs" {
    bucket = "rail-times-uk-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  credentials = try(file("${path.module}/.key.json"), var.google_credentials)
  project     = var.project_id
  region      = var.region
}

provider "time" {} 
