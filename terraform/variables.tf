variable "project_id" {
  description = "The Google Cloud project ID"
}

variable "region" {
  description = "The region to deploy the Cloud Run services"
}

variable "backend_service_name" {
  description = "The name of the backend Cloud Run service"
}

variable "frontend_service_name" {
  description = "The name of the frontend Cloud Run service"
}

variable "backend_image_url" {
  description = "The Docker image URL of the backend API"
}

variable "frontend_image_url" {
  description = "The Docker image URL of the frontend React app"
}

variable "frontend_url" {
  description = "Gcloud URL of frontend service"
}

variable "backend_url" {
  description = "Gcloud URL of backend service"
}

variable "db_password" {
  sensitive = true
}
variable "api_key" {
  sensitive = true
}

variable "domain" {
  description = "Main domain name"
  type        = string
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = null  # Will use main domain if not specified
}

variable "google_service_account" {
  type        = string
}

variable "google_credentials" {
  description = "Google Cloud credentials JSON"
  type        = string
  default     = null  # Will be null when using .key.json file
}
