resource "google_certificate_manager_certificate" "domain_cert" {
  name        = "domain-cert"
  description = "Certificate for domain"
  scope       = "DEFAULT"
  managed {
    domains = [
      "rail-times-uk.com",
      "www.rail-times-uk.com",
      "api.rail-times-uk.com"
    ]
  }
}
