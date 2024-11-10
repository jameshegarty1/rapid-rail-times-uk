# Create a secret in Secret Manager
resource "google_secret_manager_secret" "app_secrets" {
  secret_id = "app-secrets"
  project   = var.project_id

  replication {
    auto {
      // Automatically manages replication
    }
  }
}

# Store the actual secret version
resource "google_secret_manager_secret_version" "app_secrets_version" {
  secret      = google_secret_manager_secret.app_secrets.id
  secret_data = jsonencode({
    DB_PASSWORD = var.db_password
    API_KEY     = var.api_key
  })
}
