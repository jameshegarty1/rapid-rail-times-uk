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
  credentials = file(".pk/rail-times-uk-4fc7356a921b.json")
  project     = var.project_id
  region      = var.region
}

provider "time" {} 
