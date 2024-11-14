terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
    }
    time = {
      source  = "hashicorp/time"
    }
  }
}

provider "google" {
  credentials = file("${path.module}/.key.json")
  project     = var.project_id
  region      = var.region
}

provider "time" {} 
